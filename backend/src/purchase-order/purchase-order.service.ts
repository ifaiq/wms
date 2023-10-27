import { Injectable } from '@nestjs/common';
import {
  PurchaseOrder,
  PrismaPromise,
  PurchaseOrderProduct,
  POStatus,
  Prisma,
  ReceiptStatus,
  VendorStatus,
  ReceiptProduct,
  ReturnReceiptProduct
} from '@prisma/client';
import sumBy from 'lodash.sumby';
import isEmpty from 'lodash.isempty';
import { StreamableFile } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { MonolithService } from 'src/monolith/monolith.service';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { AppsearchService } from 'src/appsearch/appsearch.service';
import {
  BatchPayload,
  generateFormattedId,
  getProductBySkuCode,
  renderHtmlForPdf
} from './utils/helper';
import {
  addQtyInProductList,
  attachReferenceNumber,
  classifyProducts,
  convertIntoKeyValuePair,
  fetchProductSkus,
  filterProductsData,
  subtractQtyFromProductList
} from 'src/common';
import {
  PurchaseOrderRequest,
  PurchaseOrderProductRequest,
  SearchPurchaseOrderDto,
  CreatePurchaseOrderRequest
} from './dto';

import {
  TRANSFERS,
  TransferTypes,
  userSelect,
  PDF_OPTIONS,
  PURCHASEORDERS,
  RFQFileCorrectFormat,
  transfer,
  openSearchIndexKey,
  COUNTRY,
  PDF_TITLE
} from 'src/common/constants';
import { generateFileBuffer } from './utils/PDFHelper';
import { ReceiptService } from 'src/receipt/receipt.service';
import { VendorService } from 'src/vendor/vendor.service';
import {
  BadRequestException,
  NotFoundException,
  ValidationFailedException
} from 'src/errors/exceptions';
import { RFQFileDto } from 'src/fileupload/utils/types';
import { EventService } from 'src/event/event.service';
import { CreateEvent } from 'src/event/dto/create-event.dto';
import { POValidationData } from './interface';

const { PurchaseOrder: purchaseOrderModel, Receipt: receiptModel } =
  Prisma.ModelName;

@Injectable()
export class PurchaseOrderService {
  constructor(
    private prisma: PrismaService,
    private openSearchService: OpensearchService,
    private receiptService: ReceiptService,
    private monolithService: MonolithService,
    private fileUploadService: FileuploadService,
    private appSearchService: AppsearchService,
    private vendorService: VendorService,
    private eventService: EventService
  ) {}

  async createPurchaseOrder(
    purchaseOrder: CreatePurchaseOrderRequest
  ): Promise<PurchaseOrder> {
    if (!purchaseOrder.status) {
      purchaseOrder.status = POStatus.IN_REVIEW;
    }

    //Cannot process a PO if a vendor is not in Locked State
    await this.vendorService.checkVendorStatus(
      purchaseOrder.vendorId,
      VendorStatus.LOCKED
    );
    const newPurchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        ...purchaseOrder,
        products: {
          createMany: { data: purchaseOrder.products, skipDuplicates: true }
        }
      },
      include: { products: true }
    });
    await this.upsertPurchaseOrderInOpenSearch(newPurchaseOrder.id);
    return newPurchaseOrder;
  }

  async getPurchaseOrder(id: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        products: true,
        vendor: true,
        purchaser: true,
        Receipt: {
          where: {
            status: ReceiptStatus.DONE
          },
          select: {
            products: true
          }
        },
        ReturnReceipt: {
          where: {
            status: ReceiptStatus.DONE
          },
          select: {
            products: true
          }
        }
      }
    });
    if (purchaseOrder) {
      const businessUnit = await this.monolithService.GetBusinessUnitById(
        purchaseOrder.businessUnitId
      );
      const location = await this.monolithService.GetLocationById(
        purchaseOrder.warehouseId
      );
      const {
        Receipt: receipts,
        ReturnReceipt: returnReceipts,
        ...purchaseOrderData
      } = purchaseOrder;
      this.getAvailableProductsQty(
        receipts,
        returnReceipts,
        purchaseOrder.products
      );
      const purchaseOrderWithReferenceNumber = attachReferenceNumber(
        PURCHASEORDERS,
        purchaseOrderData
      );
      return {
        purchaseOrder: {
          ...purchaseOrderWithReferenceNumber,
          businessUnit,
          warehouse: location
        }
      };
    }
    throw new NotFoundException(purchaseOrderModel);
  }

  async downloadPurchaseOrder(id: number) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { products: true, vendor: true }
    });

    if (purchaseOrder) {
      const htmlInvoice = await renderHtmlForPdf(
        {
          ...purchaseOrder,
          id: `P${generateFormattedId(purchaseOrder.id)}`,
          title: PDF_TITLE.PURCHASE_ORDER,
          createdDate: purchaseOrder.createdAt.toLocaleString(),
          confirmedDate: purchaseOrder.confirmedAt
            ? purchaseOrder.confirmedAt.toLocaleString()
            : '---',
          country: COUNTRY[purchaseOrder.country],
          currency: purchaseOrder.currency,
          totalQty: sumBy(purchaseOrder?.products, 'quantity')
        },
        PDF_OPTIONS.templatePath
      );

      const pdfBuffer = await generateFileBuffer(
        htmlInvoice,
        PDF_OPTIONS.options
      );
      return new StreamableFile(pdfBuffer);
    }

    throw new NotFoundException();
  }

  async updatePurchaseOrder(
    id: number,
    purchaseOrder: PurchaseOrderRequest,
    userId: number
  ): Promise<PurchaseOrder> {
    const { products, ...purchaseOrderData } = purchaseOrder;
    const existingPurchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { products: true }
    });

    if (
      existingPurchaseOrder?.confirmedAt !== null ||
      existingPurchaseOrder.status === POStatus.LOCKED
    ) {
      throw new BadRequestException('Cannot update PO in locked state');
    }

    const { createProducts, deleteProducts, updateProducts } = classifyProducts(
      purchaseOrder.products,
      existingPurchaseOrder?.products
    );

    const updates: PrismaPromise<
      PurchaseOrder | PurchaseOrderProduct | BatchPayload | CreateEvent
    >[] = [
      this.prisma.purchaseOrderProduct.deleteMany({
        where: {
          poId: id,
          productId: {
            in: deleteProducts
          }
        }
      }),
      this.prisma.purchaseOrder.update({
        where: { id },
        data: {
          ...purchaseOrderData,
          products: {
            createMany: {
              data: createProducts as PurchaseOrderProductRequest[],
              skipDuplicates: true
            }
          }
        }
      })
    ];

    const uniqueProducts: Record<string, any> = {};

    // Extract unique products based on SKUs into {key, value} pair
    for (const product of updateProducts) {
      if (!uniqueProducts[product.sku]) uniqueProducts[product.sku] = product;
    }

    for (const product in uniqueProducts) {
      const { productId, ...data } = uniqueProducts[product];
      updates.push(
        this.prisma.purchaseOrderProduct.update({
          where: {
            poId_productId: {
              poId: id,
              productId
            }
          },
          data
        })
      );
    }

    const purchaseOrderEventLog = await this.eventService.generateEvents(
      id,
      purchaseOrderData,
      purchaseOrderModel,
      userId
    );

    updates.push(...purchaseOrderEventLog);

    const results = await this.prisma.$transaction(updates);
    await this.upsertPurchaseOrderInOpenSearch(id, true);
    return results[1] as PurchaseOrder;
  }

  async addPurchaseOrdersInOpenSearch(): Promise<any> {
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        products: true,
        purchaser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
    await this.openSearchService.addInBulk(PURCHASEORDERS, purchaseOrders);
  }

  async searchPurchaseOrder(
    reqParams: SearchPurchaseOrderDto
  ): Promise<any | null> {
    const {
      status,
      country,
      businessUnitId,
      warehouseId,
      from,
      till,
      vendor,
      id,
      products,
      purchaser,
      skip,
      take
    } = reqParams;
    return await this.openSearchService.searchPurchaseOrders(
      { status, country, businessUnitId, warehouseId },
      { id, skip, take },
      { vendor, products, purchaser },
      { from, till },
      PURCHASEORDERS
    );
  }

  async upsertPurchaseOrderInOpenSearch(id: number, isUpdateOperation = false) {
    const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        products: true,
        purchaser: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
    if (isUpdateOperation) {
      await this.openSearchService.updateDocumentById(
        PURCHASEORDERS,
        purchaseOrder
      );
      return;
    }
    await this.openSearchService.addDocumentById(PURCHASEORDERS, purchaseOrder);
  }

  async updatePurchaseOrderAttachment(
    id: number,
    attachment: any,
    userId: number
  ): Promise<PurchaseOrder> {
    const purchaseOrderUpdatePromise = this.prisma.purchaseOrder.update({
      where: { id },
      data: attachment
    });
    const purchaseOrderEventLog = await this.eventService.generateEvents(
      id,
      attachment,
      purchaseOrderModel,
      userId
    );
    const [result] = await this.prisma.$transaction([
      purchaseOrderUpdatePromise,
      ...purchaseOrderEventLog
    ]);
    this.upsertPurchaseOrderInOpenSearch(id, true);
    return result;
  }

  async updatePurchaseOrderStatus(
    userId: number,
    id: number,
    data: { status: POStatus; confirmedAt?: Date }
  ): Promise<PurchaseOrder> {
    const today = new Date();
    if (data.status === POStatus.CANCELLED) {
      data.confirmedAt = today;
    }

    const updatePromises: PrismaPromise<any>[] = [
      this.prisma.purchaseOrder.update({
        where: { id },
        data
      })
    ];

    const { purchaseOrder }: any = await this.getPurchaseOrder(id);
    if (purchaseOrder === null) {
      throw new NotFoundException(purchaseOrderModel);
    }
    if (purchaseOrder?.confirmedAt === null) {
      const whereInput: Prisma.ReceiptWhereInput = {
        poId: id
      };
      const filter: Prisma.ReceiptSelect = {
        id: true,
        status: true
      };
      const existingReceipt: any =
        await this.receiptService.fetchDataFromReceipt(whereInput, filter);
      if (data.status === POStatus.LOCKED) {
        const receipt = this.receiptService.generateReceiptFromPO(
          userId,
          purchaseOrder
        );
        const createReceiptPromise: any = this.receiptService.upsertReceipt(
          receipt,
          existingReceipt?.id
        );
        updatePromises.push(...createReceiptPromise);
      }

      //Cancelling Receipt if PO is cancelled
      if (data.status === POStatus.CANCELLED && existingReceipt) {
        const receiptData = {
          status: ReceiptStatus.CANCELLED,
          confirmedAt: today
        };
        updatePromises.push(
          this.prisma.receipt.update({
            where: {
              id: existingReceipt.id
            },
            data: receiptData
          })
        );
        const receiptEventLog = await this.eventService.generateEvents(
          existingReceipt.id,
          receiptData,
          receiptModel,
          userId
        );

        updatePromises.push(...receiptEventLog);
      }

      const purchaseOrderEventLog = await this.eventService.generateEvents(
        id,
        data,
        purchaseOrderModel,
        userId
      );

      updatePromises.push(...purchaseOrderEventLog);

      const [updatedPurchaseOrder, createdReceipt] =
        await this.prisma.$transaction(updatePromises);

      if (!existingReceipt && data.status === POStatus.LOCKED) {
        await this.upsertReceiptInOpenSearch(createdReceipt.id);
      } else if (existingReceipt && data.status !== POStatus.PO) {
        await this.upsertReceiptInOpenSearch(existingReceipt.id);
      }
      await this.upsertPurchaseOrderInOpenSearch(id, true);
      return updatedPurchaseOrder;
    }
    throw new ValidationFailedException([
      { property: 'Cannot change the status of a confirmed PO' }
    ]);
  }

  async getReceipts(id: number) {
    const filter: Prisma.PurchaseOrderArgs = {
      select: {
        vendor: {
          select: {
            name: true
          }
        }
      }
    };

    const receipts = await this.prisma.purchaseOrder.findFirst({
      where: {
        id
      },
      select: {
        Receipt: {
          include: {
            purchaseOrder: filter,
            returnReceipts: {
              include: { purchaseOrder: filter }
            }
          }
        }
      }
    });
    return receipts?.Receipt;
  }

  private validateSkuCode(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    skuCode: string,
    data: POValidationData
  ) {
    if (isEmpty(skuCode)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is required`;
    }

    const product = getProductBySkuCode(skuCode, data.validProducts);

    if (
      product &&
      product.isDeactivated &&
      product.isDeactivated.toString().toLowerCase() === 'true'
    ) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: ${skuCode} is Deactivated`;
    }

    if (!product)
      return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not valid`;

    return true;
  }

  private validateQuantity(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    demandedQuantity: string
  ) {
    const quantity = Number(demandedQuantity);

    if (!Number.isInteger(quantity))
      return `Row(${rowNumber}) x Col(${columnNumber}): Quantity should be an integer`;

    if (!isFinite(quantity) || isEmpty(demandedQuantity)) {
      return `Row(${rowNumber}) x Col(${columnNumber}): Quantity is not a whole number`;
    }
    if (quantity < 0) {
      return `Row(${rowNumber}) x Col(${columnNumber}): Quantity is negative`;
    }
    return true;
  }

  private getFileValidatorConfig() {
    return {
      [RFQFileCorrectFormat.sku]: {
        validate: this.validateSkuCode
      },
      [RFQFileCorrectFormat.quantity]: {
        validate: this.validateQuantity
      }
    };
  }

  async insertProductsFromCSV(file: Express.Multer.File, locationId: number) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      RFQFileCorrectFormat
    );
    // Check if the sku count of valid products is less than 1000
    if (csvData.length >= 1000) {
      throw new ValidationFailedException([
        { property: 'SKU limit reached, SKUs should be less than 1000' }
      ]);
    }

    const parsedData: RFQFileDto[] = [];
    for (const data of csvData) {
      const sku = data.sku;
      const name = data.name;
      const price = Number(Number(data.price).toFixed(4));
      const quantity = Number(data.quantity);
      const mrp = Number(Number(data.mrp).toFixed(4)) || 0;
      parsedData.push({
        sku,
        name,
        price,
        quantity,
        mrp
      });
    }
    const productSkus = fetchProductSkus(parsedData);
    const validProductList = await this.appSearchService.searchProductBySkus(
      productSkus,
      String(locationId)
    );

    const validationData = {
      validProducts: validProductList
    };
    const configs = this.getFileValidatorConfig();
    const errors = await this.fileUploadService.csvFileValidator(
      csvData,
      configs,
      validationData
    );
    if (errors.length) {
      throw new ValidationFailedException([
        ...errors.map((error: string) => ({ property: error }))
      ]);
    }

    const validProductObj = convertIntoKeyValuePair(validProductList, 'sku');
    const { validProducts, invalidProducts } = filterProductsData(
      validProductObj,
      parsedData,
      ['quantity', 'price', 'mrp']
    );
    return { validProducts, invalidProducts };
  }

  private async upsertReceiptInOpenSearch(
    id: number,
    isUpdateOperation = false
  ) {
    const receipt: any = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: userSelect
        },
        purchaseOrder: true,
        products: true
      }
    });
    const { purchaseOrder, createdBy, ...transferData } = receipt;
    const receiptData = {
      ...transferData,
      createdBy: createdBy.name,
      products: transferData.products,
      type: TransferTypes.GRN,
      country: purchaseOrder.country,
      index: `${transfer.grn}${receipt?.id}`
    };
    if (isUpdateOperation) {
      await this.openSearchService.updateDocumentById(
        TRANSFERS,
        receiptData,
        openSearchIndexKey.index
      );
      return;
    }
    await this.openSearchService.addDocumentById(
      TRANSFERS,
      receiptData,
      openSearchIndexKey.index
    );
  }

  private getAvailableProductsQty(
    receipts: { products: ReceiptProduct[] }[],
    returnReceipts: { products: ReturnReceiptProduct[] }[],
    products: PurchaseOrderProduct[]
  ) {
    const availableQty: Record<string, number> = {};

    addQtyInProductList(availableQty, receipts);
    subtractQtyFromProductList(availableQty, returnReceipts);

    for (const product of products as PurchaseOrderProduct[]) {
      (product as any).availableQuantities =
        availableQty[product.productId] || 0;
    }
  }
}

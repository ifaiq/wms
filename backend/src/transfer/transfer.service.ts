import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  PrismaPromise,
  RequestType,
  Transfer,
  TransferProduct,
  TransferStatus,
  Location,
  InventoryMovementType,
  Reason
} from '@prisma/client';
import isEmpty from 'lodash.isempty';
import { PrismaService } from 'prisma/prisma.service';
import { AppsearchService } from 'src/appsearch/appsearch.service';
import {
  attachReferenceNumber,
  classifyProducts,
  convertIntoKeyValuePair,
  fetchProductSkus,
  filterProductsData
} from 'src/common';
import {
  openSearchIndexKey,
  transfer as TransferIndex,
  TransferFileCorrectFormat,
  TRANSFERS,
  TransferTypes,
  userSelect
} from 'src/common/constants';
import {
  BadRequestExceptionBulkUpload,
  ValidationFailedException
} from 'src/errors/exceptions';
import { EventService } from 'src/event/event.service';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { InsertInventoryMovementDto } from 'src/inventory-movement/dto';
import { InventoryMovementService } from 'src/inventory-movement/inventory-movement.service';
import {
  UpsertInventoryDto,
  UpsertInventoryProductDto
} from 'src/inventory/dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { LocationService } from 'src/location/location.service';
import {
  UpdateInventoryBody,
  UpdateProduct,
  ValidateProductQuantity
} from 'src/monolith/entities';
import { MonolithService } from 'src/monolith/monolith.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { BatchPayload } from 'src/purchase-order/utils/helper';
import { SearchTransferDto } from './dto';
import {
  CreateTransferRequest,
  TransferFileDto,
  TransferFileValidationData,
  TransferProductRequest,
  TransferRequest,
  TransferStatusRequest
} from './dto/request.dto';
import { getProductBySkuCode } from './helper/utils';
const { Transfer: TransferModel } = Prisma.ModelName;

@Injectable()
export class TransferService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monolithService: MonolithService,
    private readonly openSearchService: OpensearchService,
    private readonly locationService: LocationService,
    private readonly eventService: EventService,
    private readonly inventoryService: InventoryService,
    private readonly fileUploadService: FileuploadService,
    private readonly appSearchService: AppsearchService,
    private readonly inventoryMovementService: InventoryMovementService
  ) {}
  async searchTransfers(reqParams: SearchTransferDto): Promise<any | null> {
    const { country, type, from, till, id, name, sku, skip, take } = reqParams;
    return await this.openSearchService.searchTransfers(
      { country, type },
      { id, skip, take },
      { name, sku },
      { from, till },
      TRANSFERS
    );
  }

  async getTransferById(id: number) {
    let transfer = await this.prisma.transfer.findUnique({
      where: { id },
      include: {
        products: true,
        reason: true,
        createdBy: { select: userSelect }
      }
    });
    if (transfer) {
      const { fromLocationId, toLocationId } = transfer;
      const { businessUnit, warehouse } =
        await this.monolithService.GetBusinessUnitAndLocationById(
          transfer.businessUnitId,
          transfer.warehouseId
        );
      const locations = await this.locationService.getLocationsByIds(
        [fromLocationId, toLocationId],
        true,
        true
      );
      const fromLocationData = locations.find(
        (location) => location.id === fromLocationId
      );
      const toLocationData = locations.find(
        (location) => location.id === toLocationId
      );
      if (transfer.status === TransferStatus.DONE) {
        transfer.products = transfer.products.map((product) => ({
          ...product,
          currentQuantity: product.physicalQuantity
        }));
      } else {
        transfer.products = await this.syncProductDataWithInventory(
          transfer.products,
          transfer.fromLocationId
        );
      }

      transfer = attachReferenceNumber(TRANSFERS, {
        ...transfer,
        type: TransferTypes.Transfer
      });
      return {
        transfer: {
          ...transfer,
          businessUnit,
          warehouse,
          fromLocationData,
          toLocationData
        }
      };
    }
    throw new NotFoundException(TransferModel);
  }

  async createTransfer(transfer: CreateTransferRequest) {
    !transfer.status && (transfer.status = TransferStatus.READY);
    await this.locationService.AreDiabledLocations([
      transfer.fromLocationId,
      transfer.toLocationId
    ]);
    const transferObj = await this.prisma.transfer.create({
      data: {
        ...transfer,
        products: {
          createMany: { data: transfer.products, skipDuplicates: true }
        }
      },
      include: {
        products: true,
        reason: true,
        createdBy: { select: userSelect }
      }
    });
    if (transferObj) {
      const { businessUnit, warehouse } =
        await this.monolithService.GetBusinessUnitAndLocationById(
          transferObj.businessUnitId,
          transferObj.warehouseId
        );
      await this.upsertTransferInOpenSearch(transferObj.id);
      return {
        transfer: {
          ...transferObj,
          businessUnit,
          warehouse
        }
      };
    }
  }

  async updateTransfer(
    id: number,
    transfer: TransferRequest,
    userId: number
  ): Promise<Transfer> {
    await this.locationService.AreDiabledLocations([
      transfer.fromLocationId,
      transfer.toLocationId
    ]);
    const { products, ...transferData } = transfer;
    const currentTransfer = await this.prisma.transfer.findUnique({
      where: { id },
      include: { products: true, reason: true }
    });

    const { createProducts, deleteProducts, updateProducts } = classifyProducts(
      products,
      currentTransfer?.products
    );

    const updates: PrismaPromise<
      Transfer | TransferRequest | BatchPayload | TransferProductRequest
    >[] = [
      this.prisma.transferProduct.deleteMany({
        where: {
          transferId: id,
          productId: { in: deleteProducts }
        }
      })
    ];
    for (const product of updateProducts) {
      const { productId, ...data } = product;
      updates.push(
        this.prisma.transferProduct.update({
          where: {
            transferId_productId: {
              transferId: id,
              productId
            }
          },
          data
        })
      );
    }
    updates.push(
      this.prisma.transfer.update({
        where: { id },
        data: {
          ...transferData,
          products: {
            createMany: {
              data: createProducts as TransferProductRequest[],
              skipDuplicates: true
            }
          }
        },
        include: {
          products: true,
          reason: true,
          createdBy: { select: userSelect }
        }
      })
    );

    const transferEventLog = await this.eventService.generateEvents(
      id,
      transferData,
      TransferModel,
      userId
    );
    const results = await this.prisma.$transaction([
      ...updates,
      ...transferEventLog
    ]);
    const transferObj: any = results[updateProducts.length + 1];
    const { businessUnit, warehouse } =
      await this.monolithService.GetBusinessUnitAndLocationById(
        transfer.businessUnitId,
        transfer.warehouseId
      );
    transferObj.businessUnit = businessUnit;
    transferObj.warehouse = warehouse;
    await this.upsertTransferInOpenSearch(transferObj.id, true);
    return transferObj;
  }

  async cancelTransfer(id: number, userId: number) {
    const transferPromise = this.prisma.transfer.update({
      where: {
        id
      },
      data: {
        status: TransferStatus.CANCELLED,
        products: {
          updateMany: {
            where: {
              transferId: id
            },
            data: {
              transferQuantity: 0
            }
          }
        }
      },
      include: {
        products: true,
        reason: true,
        createdBy: { select: userSelect }
      }
    });
    const transferEventLog = await this.eventService.generateEvents(
      id,
      { status: TransferStatus.CANCELLED },
      TransferModel,
      userId
    );
    const [transfer] = await this.prisma.$transaction([
      transferPromise,
      ...transferEventLog
    ]);
    const { businessUnit, warehouse } =
      await this.monolithService.GetBusinessUnitAndLocationById(
        transfer.businessUnitId,
        transfer.warehouseId
      );
    await this.upsertTransferInOpenSearch(transfer.id, true);
    return {
      transfer: {
        ...transfer,
        businessUnit,
        warehouse
      }
    };
  }

  async updateInventoryOnMonolith(
    id: number,
    transfer: Transfer & {
      products: TransferProduct[];
      reason: Reason;
    },
    fromLocationData: Location | undefined,
    toLocationData: Location | undefined
  ) {
    const updateInventoryBody: UpdateInventoryBody = {
      physicalQuantity: false,
      stockQuantity: true,
      referenceId: id,
      type: RequestType.TRANSFER,
      reason: transfer.reason.reason,
      products: transfer.products.map((product) => ({
        id: product.productId,
        quantity: product.transferQuantity
      }))
    };

    if (
      fromLocationData?.availableForSale &&
      !toLocationData?.availableForSale
    ) {
      updateInventoryBody.products = transfer.products.map(
        (product): UpdateProduct => {
          return {
            id: product.productId,
            quantity: -product.transferQuantity
          };
        }
      );
      await this.monolithService.updateInventory(updateInventoryBody, id);
    } else if (
      !fromLocationData?.availableForSale &&
      toLocationData?.availableForSale
    ) {
      updateInventoryBody.products = transfer.products.map(
        (product): UpdateProduct => {
          return {
            id: product.productId,
            quantity: product.transferQuantity
          };
        }
      );
      await this.monolithService.updateInventory(updateInventoryBody, id);
    }
  }

  async updateInventoryOnStockflo(
    id: number,
    transfer: Transfer & {
      products: TransferProduct[];
      reason: Reason;
    },
    fromLocationData: Location | undefined,
    toLocationData: Location | undefined
  ) {
    if (fromLocationData && toLocationData) {
      const productsData = transfer.products.map(
        (product): UpsertInventoryProductDto => {
          return {
            productId: product.productId,
            physicalQuantity: -product.transferQuantity
          };
        }
      );

      // remove physicalQty from old loation e.g (location-A)
      const updateInventoryBody: UpsertInventoryDto = {
        country: transfer.country,
        businessUnitId: transfer.businessUnitId,
        warehouseId: transfer.warehouseId,
        createdById: transfer.createdById,
        locationId: fromLocationData?.id,
        products: productsData
      };

      // Create inventory movement for transfer
      const inventoryMovement: InsertInventoryMovementDto = {
        locationId: fromLocationData.id,
        createdById: transfer.createdById,
        movementType: InventoryMovementType.TRANSFER,
        reason: transfer.reason.reason,
        referenceId: id,
        products: productsData
      };
      await this.prisma.$transaction([
        ...(await this.inventoryService.upsertProductInventory(
          updateInventoryBody
        )),
        ...(await this.inventoryMovementService.createInventoryMovement(
          inventoryMovement
        ))
      ]);

      // add physicalQty into new location e.g (location-B)
      updateInventoryBody.locationId = inventoryMovement.locationId =
        toLocationData?.id;
      updateInventoryBody.products = inventoryMovement.products =
        transfer.products.map((product) => {
          return {
            productId: product.productId,
            physicalQuantity: product.transferQuantity
          };
        });
      await this.prisma.$transaction([
        ...(await this.inventoryService.upsertProductInventory(
          updateInventoryBody
        )),
        ...(await this.inventoryMovementService.createInventoryMovement(
          inventoryMovement
        ))
      ]);
    }
  }

  async updateTransferStatus(
    id: number,
    transfer: TransferStatusRequest,
    userId: number
  ) {
    if (transfer.status === TransferStatus.CANCELLED) {
      return await this.cancelTransfer(id, userId);
    } else {
      const currentTransferData = await this.prisma.transfer.findUnique({
        where: {
          id
        },
        include: {
          products: true,
          reason: true
        }
      });
      if (currentTransferData) {
        const updatedData = {
          status: TransferStatus.DONE,
          confirmedAt: new Date()
        };
        const transferPromise = this.prisma.transfer.update({
          where: {
            id
          },
          data: updatedData,
          include: {
            products: true,
            reason: true,
            createdBy: { select: userSelect }
          }
        });
        const transferEventLog = await this.eventService.generateEvents(
          id,
          updatedData,
          TransferModel,
          userId
        );

        const productIds: number[] = currentTransferData.products.map(
          (product: TransferProduct) => product.productId
        );
        const whereClause: Prisma.InventoryWhereInput = {
          locationId: Number(currentTransferData.fromLocationId),
          productId: { in: productIds }
        };

        const selectClause: Prisma.InventorySelect = {
          productId: true,
          physicalQuantity: true
        };

        const productsData =
          await this.inventoryService.fetchInventoryProductsByWhere(
            whereClause,
            selectClause
          );

        // Convert into keyvalue pair based on id
        const productsById = convertIntoKeyValuePair(productsData, 'productId');

        if (process.env.ALLOW_INVENTORY_UPDATE === 'true') {
          const locations = await this.locationService.getLocationsByIds(
            [
              currentTransferData.fromLocationId,
              currentTransferData.toLocationId
            ],
            true
          );
          const fromLocationData = locations.find(
            (location) => location.id === currentTransferData.fromLocationId
          );
          const toLocationData = locations.find(
            (location) => location.id === currentTransferData.toLocationId
          );

          if (
            fromLocationData?.availableForSale &&
            !toLocationData?.availableForSale
          ) {
            // When transferring location from available for sale location to not available for sale location make sure
            // that the quantites in pending batches is less than the quantity of the sku in available for sale locations - tranfer quantity
            await this.validateTransferProductQuantity(
              currentTransferData.warehouseId,
              currentTransferData.fromLocationId,
              currentTransferData.products
            );
          }

          await this.updateInventoryOnMonolith(
            id,
            currentTransferData,
            fromLocationData,
            toLocationData
          );
          await this.updateInventoryOnStockflo(
            id,
            currentTransferData,
            fromLocationData,
            toLocationData
          );
        }

        const updates = [];
        for (const product of currentTransferData.products) {
          const { productId, ...data } = product;
          updates.push(
            this.prisma.transferProduct.update({
              where: {
                transferId_productId: {
                  transferId: currentTransferData.id,
                  productId
                }
              },
              data: {
                ...data,
                physicalQuantity:
                  +productsById[productId]?.physicalQuantity || 0
              }
            })
          );
        }
        const transfer = await this.prisma.$transaction([
          transferPromise,
          ...transferEventLog,
          ...updates
        ]);
        await this.upsertTransferInOpenSearch(currentTransferData.id, true);
        return transfer;
      }
    }
  }

  private validateSkuCode(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    skuCode: string,
    data: TransferFileValidationData
  ) {
    if (isEmpty(skuCode)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is required`;
    }

    const product = getProductBySkuCode(skuCode, data.validProducts);

    if (product && product.isDeactivated) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: is Deactivated`;
    }

    if (!product)
      return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not valid`;

    return true;
  }

  private getFileValidatorConfig() {
    return {
      [TransferFileCorrectFormat.sku]: {
        validate: this.validateSkuCode
      }
    };
  }

  async insertProductsFromCSV(
    file: Express.Multer.File,
    locationId: number,
    subLocationId: string
  ) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      TransferFileCorrectFormat
    );

    // Check if the sku count of valid products is less than 1000
    if (csvData.length >= 1000) {
      throw new ValidationFailedException([
        { property: 'SKU limit reached, SKUs should be less than 1000' }
      ]);
    }

    const parsedData: TransferFileDto[] = [];
    for (const data of csvData) {
      const sku = data.sku;
      const transferQuantity = Number(data.transferquantity);
      parsedData.push({
        sku,
        transferQuantity
      });
    }
    const productSkus = fetchProductSkus(parsedData);

    const validProductList = await this.appSearchService.searchProductBySkus(
      productSkus,
      String(locationId),
      {
        id: { raw: {} },
        name: { raw: {} },
        sku: { raw: {} },
        physical_stock: { raw: {} }
      }
    );

    const validProductsArray =
      await this.fileUploadService.validateProductsFromInventoryTable(
        validProductList,
        subLocationId
      );

    const validationData = {
      validProducts: validProductsArray
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

    const validProductObj = convertIntoKeyValuePair(validProductsArray, 'sku');

    const { validProducts, invalidProducts } = filterProductsData(
      validProductObj,
      parsedData,
      ['transferQuantity'],
      ['currentQuantity']
    );
    return { validProducts, invalidProducts };
  }

  async addTransfersInOpenSearch(): Promise<Transfer[]> {
    let transfers = await this.prisma.transfer.findMany({
      include: {
        createdBy: {
          select: {
            name: true
          }
        },
        products: true
      }
    });
    transfers = transfers.map((transferObj: any) => {
      const { createdBy, ...transferData } = transferObj;
      return {
        ...transferData,
        createdBy: createdBy.name,
        type: TransferTypes.Transfer,
        index: `${TransferIndex.transfer}${transferObj.id}`
      };
    });
    return transfers;
  }

  async upsertTransferInOpenSearch(id: number, isUpdateOperation = false) {
    const transfer: any = await this.prisma.transfer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true
          }
        },
        products: true
      }
    });
    const { createdBy, ...transferData } = transfer;
    if (isUpdateOperation) {
      await this.openSearchService.updateDocumentById(
        TRANSFERS,
        {
          ...transferData,
          createdBy: createdBy.name,
          type: TransferTypes.Transfer,
          index: `${TransferIndex.transfer}${transfer?.id}`
        },
        openSearchIndexKey.index
      );
      return;
    }
    await this.openSearchService.addDocumentById(
      TRANSFERS,
      {
        ...transfer,
        createdBy: createdBy.name,
        type: TransferTypes.Transfer,
        index: `${TransferIndex.transfer}${transfer?.id}`
      },
      openSearchIndexKey.index
    );
  }

  async syncProductDataWithInventory(
    products: TransferProduct[],
    fromLocationId: number
  ) {
    const productIds: number[] = products.map(
      (product: TransferProduct) => product.productId
    );
    const whereClause: Prisma.InventoryWhereInput = {
      locationId: Number(fromLocationId),
      productId: { in: productIds }
    };

    const selectClause: Prisma.InventorySelect = {
      productId: true,
      physicalQuantity: true
    };

    const productList =
      await this.inventoryService.fetchInventoryProductsByWhere(
        whereClause,
        selectClause
      );

    const validProductsObj = convertIntoKeyValuePair(productList, 'productId');
    return products.map((product) => {
      return {
        ...product,
        currentQuantity: validProductsObj[product.productId]?.physicalQuantity
      };
    });
  }

  private async validateTransferProductQuantity(
    warehouseId: number,
    fromLocationId: number,
    products: TransferProductRequest[]
  ) {
    const productsInventory: ValidateProductQuantity[] = [];
    const whereClause: Prisma.InventoryWhereInput = {
      AND: {
        warehouseId: warehouseId,
        productId: { in: products.map((product) => product.productId) },
        location: {
          availableForSale: {
            equals: true
          }
        }
      }
    };

    const availableForSaleProductInventory =
      await this.inventoryService.groupByInventoryProductsByWhere(
        whereClause,
        [Prisma.InventoryScalarFieldEnum.productId],
        { [Prisma.InventoryScalarFieldEnum.physicalQuantity]: true }
      );

    const productsByProductsId = convertIntoKeyValuePair(products, 'productId');
    availableForSaleProductInventory.forEach((product) => {
      const productData = productsByProductsId[product.productId];
      productsInventory.push({
        id: product.productId,
        availableQuantity:
          (product._sum.physicalQuantity || 0) - productData.transferQuantity
      });
    });

    const productBatchesData =
      await this.monolithService.ValidateAvailableForSaleQuantity(
        productsInventory,
        warehouseId
      );
    if (productBatchesData.length > 0) {
      throw new BadRequestExceptionBulkUpload(
        productBatchesData.map(
          (batch) =>
            `Inventory In Progress for product id:${batch.productId} in batches: ${batch.batches}`
        )
      );
    }
  }
}

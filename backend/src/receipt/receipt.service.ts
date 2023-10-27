import { Injectable } from '@nestjs/common';
import {
  Inventory,
  InventoryMovement,
  InventoryMovementType,
  POStatus,
  Prisma,
  PrismaPromise,
  PurchaseOrder,
  PurchaseOrderProduct,
  ReasonType,
  Receipt,
  ReceiptProduct,
  ReceiptStatus,
  RequestType,
  ReturnReceipt,
  ReturnReceiptProduct,
  User,
  Vendor
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import sumBy from 'lodash.sumby';
import { StreamableFile } from '@nestjs/common';
import * as path from 'path';
import {
  COUNTRY,
  CURRENCY,
  openSearchIndexKey,
  PDF_OPTIONS,
  PDF_TITLE,
  PURCHASEORDERS,
  transfer,
  TRANSFERS,
  TransferTypes,
  userSelect
} from 'src/common/constants';
import {
  ValidationFailedException,
  NotFoundException,
  BadRequestException
} from 'src/errors/exceptions';
import {
  generateFormattedId,
  renderHtmlForPdf
} from 'src/purchase-order/utils/helper';
import { generateFileBuffer } from 'src/purchase-order/utils/PDFHelper';
import {
  ReceiptRequest,
  ReceiptProductRequest,
  UpdateReceiptProduct,
  UpdateReceiptStatusRequest,
  ReturnReceiptRequest,
  UpdateReturnReceiptRequest,
  UpdateReceipt,
  UpdateReturnReceiptStatusRequest
} from './dto';
import { MonolithService } from 'src/monolith/monolith.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import {
  convertIntoKeyValuePair,
  attachReferenceNumber,
  subtractQtyFromProductList
} from 'src/common';
import { UpdateInventoryBody, UpdateProduct } from 'src/monolith/entities';
import { EventService } from 'src/event/event.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { UpsertInventoryProductDto } from 'src/inventory/dto';
import { InventoryMovementService } from 'src/inventory-movement/inventory-movement.service';
import { InsertInventoryMovementDto } from 'src/inventory-movement/dto';
import { LocationService } from 'src/location/location.service';
const {
  Receipt: receiptModel,
  ReceiptProduct: receiptProductModel,
  ReturnReceipt: returnReceiptModel,
  ReturnReceiptProduct: returnReceiptProductModel,
  PurchaseOrder: purchaseOrderModel
} = Prisma.ModelName;

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private readonly monolithService: MonolithService,
    private openSearchService: OpensearchService,
    private readonly eventService: EventService,
    private readonly inventoryService: InventoryService,
    private readonly inventoryMovementService: InventoryMovementService,
    private readonly locationService: LocationService
  ) {}

  async getReceiptById(id: number) {
    const receipt = await this.prisma.receipt.findFirst({
      where: {
        id
      },
      include: {
        purchaseOrder: {
          select: {
            vendor: {
              select: {
                name: true
              }
            },
            country: true,
            warehouseId: true,
            businessUnitId: true,
            status: true
          }
        },
        products: true,
        returnReceipts: {
          select: {
            products: true,
            status: true
          },
          where: {
            status: {
              not: ReceiptStatus.CANCELLED
            }
          }
        },
        returnInRef: {
          select: {
            location: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      }
    });
    if (receipt !== null) {
      const { purchaseOrder, returnReceipts, ...receiptData } = receipt;
      const canReturn = this.checkReturnStatus(
        receipt,
        returnReceipts,
        ReceiptStatus.READY
      );
      const { name: warehouseName } =
        await this.monolithService.GetLocationById(purchaseOrder.warehouseId);
      const receiptWithReferenceNumber = attachReferenceNumber(TRANSFERS, {
        ...receiptData,
        type: TransferTypes.GRN
      });
      return {
        ...receiptWithReferenceNumber,
        vendorName: purchaseOrder.vendor.name,
        warehouseName,
        purchaseOrderStatus: purchaseOrder.status,
        canReturn,
        location: {
          country: purchaseOrder.country,
          businessUnitId: purchaseOrder.businessUnitId,
          warehouseId: purchaseOrder.warehouseId
        }
      };
    }
    throw new NotFoundException(receiptModel);
  }

  async getReturnReceiptById(id: number) {
    const receipt = await this.prisma.returnReceipt.findFirst({
      where: {
        id
      },
      include: {
        purchaseOrder: {
          select: {
            vendor: {
              select: {
                name: true
              }
            },
            country: true,
            warehouseId: true,
            businessUnitId: true,
            status: true
          }
        },
        receipt: {
          select: {
            location: {
              select: {
                name: true
              }
            }
          }
        },
        products: true
      }
    });
    if (receipt !== null) {
      const { purchaseOrder, ...receiptData } = receipt;
      const { name: warehouseName } =
        await this.monolithService.GetLocationById(purchaseOrder.warehouseId);
      const receiptWithReferenceNumber = attachReferenceNumber(TRANSFERS, {
        ...receiptData,
        type: TransferTypes.Return
      });
      return {
        ...receiptWithReferenceNumber,
        vendorName: purchaseOrder.vendor.name,
        warehouseName,
        purchaseOrderStatus: purchaseOrder.status,
        location: {
          country: purchaseOrder.country,
          businessUnitId: purchaseOrder.businessUnitId,
          warehouseId: purchaseOrder.warehouseId
        }
      };
    }
    throw new NotFoundException(receiptModel);
  }

  getReceiptProductsUpsertPromise(
    id: number,
    products: ReceiptProductRequest[]
  ) {
    const updates = [];
    const productIds = [];
    for (const receiptProduct of products) {
      const { productId, ...data } = receiptProduct;
      productIds.push(productId);
      updates.push(
        this.prisma.receiptProduct.upsert({
          where: {
            receiptId_productId: {
              receiptId: id,
              productId
            }
          },
          create: { receiptId: id, productId, ...data },
          update: data
        })
      );
    }
    return { updates, productIds };
  }

  getReceiptProductsUpdatePromise(
    id: number,
    products: UpdateReceiptProduct[]
  ) {
    const updates = [];
    for (const receiptProduct of products) {
      const { productId, ...data } = receiptProduct;
      updates.push(
        this.prisma.receiptProduct.update({
          where: {
            receiptId_productId: {
              receiptId: id,
              productId
            }
          },
          data
        })
      );
    }
    return updates;
  }

  async getReturnReceiptUpdatePromise(
    id: number,
    receiptData: UpdateReturnReceiptRequest,
    receipt: ReturnReceiptRequest,
    userId: number
  ) {
    if (!receiptData.products.length) {
      throw new ValidationFailedException([
        {
          property: `Cannot update return receipt with no products`
        }
      ]);
    }
    const updates = [];
    const eventLogs = [];

    const { products: returnReceiptProducts, status } = receipt;

    if (status === ReceiptStatus.READY) {
      for (const receiptProduct of receiptData.products) {
        const { productId, ...data } = receiptProduct;
        const product = returnReceiptProducts.find(
          (returnedProduct: { productId: number; quantityReceived: number }) =>
            returnedProduct.productId === productId
        );
        if (product === undefined) {
          throw new BadRequestException(
            `No product with product id: ${productId} exists in Receipt`
          );
        }
        //Check to ensure no returned qty is greater than received qty
        if (product?.quantityReceived < data.quantityReturned) {
          throw new BadRequestException(
            `Quantity Returned is greater than Quantity Received for product id: ${productId}`
          );
        }
        updates.push(
          this.prisma.returnReceiptProduct.update({
            where: {
              receiptId_productId: {
                receiptId: id,
                productId
              }
            },
            data
          })
        );
        //Events for return receipt products
        const returnReceiptProductEvents =
          await this.eventService.generateEvents(
            product.productId,
            data,
            returnReceiptProductModel,
            userId
          );
        eventLogs.push(...returnReceiptProductEvents);
      }
    }

    // will be used for both Ready and Done state
    updates.push(
      this.prisma.returnReceipt.update({
        where: {
          id
        },
        data: {
          invoices: receiptData.invoices,
          reasonId: receiptData.reasonId,
          locationId: receiptData.locationId
        }
      })
    );

    //Events for return receipt
    const returnReceiptEvents = await this.eventService.generateEvents(
      id,
      {
        reasonId: receiptData.reasonId,
        locationId: receiptData.locationId,
        invoices: receiptData.invoices
      },
      returnReceiptModel,
      userId
    );
    eventLogs.push(...returnReceiptEvents);
    return { updates, eventLogs };
  }

  async updateReceipt(id: number, data: UpdateReceipt, userId: number) {
    const { products, invoices, ...receiptData } = data;
    const filter: Prisma.ReceiptSelect = {
      status: true,
      products: true,
      returnInRefId: true
    };
    const whereInput = {
      id
    };

    const receipt: any = await this.fetchDataFromReceipt(whereInput, filter);

    if (receipt === null) {
      throw new BadRequestException(`No return receipt with id:${id} found.`);
    }

    if (!receiptData.locationId) {
      throw new BadRequestException('Location id cannot be empty');
    }

    const isReturnInReceipt = receipt.returnInRefId ? true : false;
    const updates = [];
    const eventLog = [];

    // Only to update invoice data in DONE state
    if (receipt?.status === ReceiptStatus.DONE) {
      updates.push(
        this.prisma.receipt.update({
          where: {
            id
          },
          data: {
            invoices
          }
        })
      );

      const receiptInvoicesEvents = await this.eventService.generateEvents(
        id,
        invoices,
        receiptModel,
        userId
      );

      eventLog.push(...receiptInvoicesEvents);
    }

    if (receipt?.status === ReceiptStatus.READY) {
      await this.locationService.AreDiabledLocations([data.locationId]);
      updates.push(
        this.prisma.receipt.update({
          where: {
            id
          },
          data: { ...receiptData, invoices }
        })
      );
      const receiptEvent = await this.eventService.generateEvents(
        id,
        { ...receiptData, invoices },
        receiptModel,
        userId
      );
      eventLog.push(...receiptEvent);
      const receiptProductsObject = convertIntoKeyValuePair(
        receipt.products,
        'productId'
      );
      for (const receiptProduct of products) {
        const { id: receiptProductId } =
          receiptProductsObject[receiptProduct.productId];
        const receiptProductEvents = await this.eventService.generateEvents(
          receiptProductId,
          receiptProduct,
          receiptProductModel,
          userId
        );
        eventLog.push(...receiptProductEvents);
      }
      updates.push(...this.getReceiptProductsUpdatePromise(id, products));
    }

    const results = await this.prisma.$transaction([...updates, ...eventLog]);
    await this.upsertReceiptInOpenSearch(id, true, isReturnInReceipt);
    return results.slice(0, products.length + 1); //Only removing events from response
  }

  async updateReturnReceipt(
    id: number,
    data: UpdateReturnReceiptRequest,
    userId: number
  ) {
    const filter: Prisma.ReturnReceiptSelect = {
      status: true,
      products: {
        where: {
          receiptId: id
        },
        select: {
          id: true,
          productId: true,
          quantityReceived: true
        }
      }
    };
    const whereInput: Prisma.ReturnReceiptWhereInput = {
      id
    };
    const receipt: any = await this.fetchDataFromReturnReceipt(
      whereInput,
      filter
    );
    if (receipt === null) {
      throw new BadRequestException(`No return receipt with id:${id} found.`);
    }

    if (receipt.status === ReceiptStatus.CANCELLED)
      throw new ValidationFailedException([
        { property: 'Cannot update receipt which is not in Ready State' }
      ]);

    await this.locationService.AreDiabledLocations([data.locationId]);
    const { updates, eventLogs } = await this.getReturnReceiptUpdatePromise(
      id,
      data,
      receipt,
      userId
    );
    const results = await this.prisma.$transaction([...updates, ...eventLogs]);
    await this.upsertReturnReceiptsInOpenSearch(id, true);

    return results;
  }

  async updateReceiptStatus(
    id: number,
    data: UpdateReceiptStatusRequest,
    userId: number
  ) {
    const today = new Date();
    const { status } = data;
    const filter: Prisma.ReceiptSelect = {
      purchaseOrder: {
        select: {
          confirmedAt: true,
          status: true,
          id: true
        }
      },
      status: true,
      products: true,
      locationId: true,
      location: {
        select: {
          country: true,
          warehouseId: true,
          businessUnitId: true,
          availableForSale: true
        }
      },
      returnInRefId: true,
      returnInRef: {
        select: {
          locationId: true
        }
      }
    };
    const whereInput = {
      id
    };
    const receipt: any = await this.fetchDataFromReceipt(whereInput, filter);
    if (receipt === null) {
      throw new BadRequestException(`No return receipt with id:${id} found.`);
    }
    const { purchaseOrder, status: receiptStatus } = receipt;
    const isReturnInReceipt = receipt.returnInRefId ? true : false;

    if (purchaseOrder?.status !== POStatus.LOCKED) {
      throw new BadRequestException(`Please lock PO before confirming the GRN`);
    }

    if (receiptStatus !== ReceiptStatus.READY) {
      throw new BadRequestException(
        `Receipt is not in Ready State. Cannot change the status of Receipt to ${status}`
      );
    }

    if (!receipt?.locationId) {
      throw new BadRequestException('Location id cannot be empty');
    }

    if (
      process.env.ALLOW_INVENTORY_UPDATE === 'true' &&
      status === ReceiptStatus.DONE
    ) {
      const QuantitiesToUpdate = {
        physical: true,
        stock: true
      };
      if (receipt?.location?.availableForSale === false) {
        QuantitiesToUpdate.stock = false;
      }

      const updates: PrismaPromise<InventoryMovement | Inventory>[] = [];
      //In case of Return In
      if (isReturnInReceipt) {
        const productsAvailabilityAtLocation =
          await this.inventoryService.productsAvailabilityAtLocation(
            receipt.returnInRef.locationId,
            receipt.products
          );
        if (!productsAvailabilityAtLocation) {
          throw new BadRequestException(
            'Some quantities are not available at this location'
          );
        }

        QuantitiesToUpdate.physical = false;

        const productQtyToRemove = receipt.products.map(
          (product: ReceiptProduct): UpsertInventoryProductDto => {
            return {
              productId: product.productId,
              physicalQuantity: -product.quantityReceived
            };
          }
        );

        const inventoryData = {
          country: receipt.location.country,
          businessUnitId: receipt.location.businessUnitId,
          warehouseId: receipt.location.warehouseId,
          locationId: receipt.returnInRef.locationId,
          createdById: userId,
          products: productQtyToRemove
        };

        // Create an inventory movement for return in
        const inventoryMovement: InsertInventoryMovementDto = {
          locationId: receipt.returnInRef.locationId,
          createdById: userId,
          movementType: InventoryMovementType.RETURN_IN,
          referenceId: id,
          products: productQtyToRemove
        };
        updates.push(
          ...(await this.inventoryService.upsertProductInventory(inventoryData))
        );
        updates.push(
          ...(await this.inventoryMovementService.createInventoryMovement(
            inventoryMovement
          ))
        );
      }

      const productData = receipt.products.map(
        (product: ReceiptProduct): UpsertInventoryProductDto => {
          return {
            productId: product.productId,
            physicalQuantity: product.quantityReceived
          };
        }
      );
      // Updating Inventory in stockflo
      const inventoryData = {
        country: receipt.location.country,
        businessUnitId: receipt.location.businessUnitId,
        warehouseId: receipt.location.warehouseId,
        locationId: receipt.locationId,
        createdById: userId,
        products: productData
      };

      // Create an inventory movement for Receipt/Return-In
      const inventoryMovement: InsertInventoryMovementDto = {
        locationId: receipt.locationId,
        createdById: userId,
        movementType: isReturnInReceipt
          ? InventoryMovementType.RETURN_IN
          : InventoryMovementType.RECEIPT,
        referenceId: id,
        products: productData
      };
      await this.prisma.$transaction([
        ...updates,
        ...(await this.inventoryService.upsertProductInventory(inventoryData)),
        ...(await this.inventoryMovementService.createInventoryMovement(
          inventoryMovement
        ))
      ]);

      // Updating Inventory in monolith
      const updateInventoryBody: UpdateInventoryBody = {
        physicalQuantity: QuantitiesToUpdate.physical,
        stockQuantity: QuantitiesToUpdate.stock,
        referenceId: id,
        type: receipt?.returnInRefId
          ? RequestType.RETURN_IN
          : RequestType.RECEIPT,
        products: receipt.products.map(
          (product: ReceiptProduct): UpdateProduct => {
            return {
              id: product.productId,
              quantity: product.quantityReceived
            };
          }
        )
      };
      await this.monolithService.updateInventory(updateInventoryBody, id);
    }

    const updatedReceiptData = {
      status,
      confirmedAt: today
    };

    const receiptUpdatePromise = this.prisma.receipt.update({
      where: {
        id
      },
      data: updatedReceiptData
    });

    //Events for receipt
    const receiptEvents = await this.eventService.generateEvents(
      id,
      updatedReceiptData,
      receiptModel,
      userId
    );

    //Case of Receipt 2nd and onwards
    if (purchaseOrder.confirmedAt !== null) {
      const [receipt] = await this.prisma.$transaction([
        receiptUpdatePromise,
        ...receiptEvents
      ]);
      await this.upsertReceiptInOpenSearch(id, true, isReturnInReceipt);
      return receipt;
    }

    const updatedPurchaseOrderData = {
      confirmedAt: today
    };
    //Case of 1st Receipt
    const purchaseOrderUpdatePromise = this.prisma.purchaseOrder.update({
      where: {
        id: purchaseOrder.id
      },
      data: updatedPurchaseOrderData
    });

    //Events for Purchase Order
    const purchaseOrderEvents = await this.eventService.generateEvents(
      purchaseOrder.id,
      updatedPurchaseOrderData,
      purchaseOrderModel,
      userId
    );

    const [updatedReceipt] = await this.prisma.$transaction([
      receiptUpdatePromise,
      purchaseOrderUpdatePromise,
      ...receiptEvents,
      ...purchaseOrderEvents
    ]);
    await Promise.all([
      this.upsertReceiptInOpenSearch(id, true),
      this.upsertPurchaseOrderInOpenSearch(purchaseOrder.id, true)
    ]);
    return updatedReceipt;
  }

  async updateReturnReceiptStatus(
    id: number,
    data: UpdateReturnReceiptStatusRequest,
    userId: number
  ) {
    const { status } = data;
    const filter: Prisma.ReturnReceiptSelect = {
      status: true,
      products: true,
      locationId: true,
      location: {
        select: {
          country: true,
          warehouseId: true,
          businessUnitId: true,
          availableForSale: true
        }
      },
      receipt: {
        select: {
          location: {
            select: {
              availableForSale: true,
              grnApplicable: true,
              id: true
            }
          }
        }
      },
      reason: {
        select: {
          reason: true
        }
      }
    };
    const whereInput: Prisma.ReturnReceiptWhereInput = {
      id
    };
    const receipt: any = await this.fetchDataFromReturnReceipt(
      whereInput,
      filter
    );
    if (receipt === null) {
      throw new ValidationFailedException([
        {
          property: `No return receipt with id:${id} found.`
        }
      ]);
    }
    if (receipt.status === ReceiptStatus.READY) {
      if (
        process.env.ALLOW_INVENTORY_UPDATE === 'true' &&
        status === ReceiptStatus.DONE
      ) {
        if (!receipt?.locationId) {
          throw new BadRequestException(
            'Cannot confirm a Return Receipt without location'
          );
        }

        if (
          receipt?.location?.availableForSale === true ||
          receipt?.location?.grnApplicable === true
        ) {
          throw new BadRequestException(
            'Return Receipt location cannot be sellable'
          );
        }

        const productsAvailabilityAtLocation =
          await this.inventoryService.productsAvailabilityAtLocation(
            receipt.receipt.location.id,
            receipt.products
          );
        if (!productsAvailabilityAtLocation) {
          throw new BadRequestException(
            'Some quantities are not available at this location'
          );
        }

        const QuantitiesToUpdate = {
          physical: true,
          stock: true
        };

        if (receipt?.receipt?.location?.availableForSale === true) {
          QuantitiesToUpdate.physical = false;
        }

        // Updating physical Inventory in monolith
        const updateInventoryBody: UpdateInventoryBody = {
          stockQuantity: QuantitiesToUpdate.stock,
          physicalQuantity: QuantitiesToUpdate.physical,
          referenceId: id,
          type: RequestType.RETURN,
          products: receipt.products.map(
            (product: ReturnReceiptProduct): UpdateProduct => {
              return {
                id: product.productId,
                quantity: -product.quantityReturned // Deduct quantity if type is RETURN
              };
            }
          )
        };
        await this.monolithService.updateInventory(updateInventoryBody, id);

        const productData = receipt.products.map(
          (product: ReturnReceiptProduct): UpsertInventoryProductDto => {
            return {
              productId: product.productId,
              physicalQuantity: -product.quantityReturned // Deduct quantity from GRN's location
            };
          }
        );

        // Updating Inventory in stockflo
        const inventoryData = {
          country: receipt.location.country,
          businessUnitId: receipt.location.businessUnitId,
          warehouseId: receipt.location.warehouseId,
          locationId: receipt.receipt.location.id,
          createdById: userId,
          products: productData
        };

        // Create inventory movement for return (adding to return out location)
        const inventoryMovement: InsertInventoryMovementDto = {
          locationId: receipt.receipt.location.id,
          createdById: userId,
          movementType: InventoryMovementType.RETURN_OUT,
          reason: receipt.reason.reason,
          referenceId: id,
          products: productData
        };

        //Subtract from GRN's location
        await this.prisma.$transaction([
          ...(await this.inventoryService.upsertProductInventory(
            inventoryData
          )),
          ...(await this.inventoryMovementService.createInventoryMovement(
            inventoryMovement
          ))
        ]);

        inventoryData.products = inventoryMovement.products =
          receipt.products.map(
            (product: ReturnReceiptProduct): UpsertInventoryProductDto => {
              return {
                productId: product.productId,
                physicalQuantity: product.quantityReturned // Add quantity to RETURN's location
              };
            }
          );
        inventoryData.locationId = inventoryMovement.locationId =
          receipt.locationId;

        //Add to new Return's location
        await this.prisma.$transaction([
          ...(await this.inventoryService.upsertProductInventory(
            inventoryData
          )),
          ...(await this.inventoryMovementService.createInventoryMovement(
            inventoryMovement
          ))
        ]);
      }

      const today = new Date();

      const returnReceiptUpdatedData = {
        status,
        confirmedAt: today
      };

      const updatedReturnReceiptPromise = this.prisma.returnReceipt.update({
        where: {
          id
        },
        data: returnReceiptUpdatedData
      });

      //Events for return receipt
      const returnReceiptEvents = await this.eventService.generateEvents(
        id,
        returnReceiptUpdatedData,
        returnReceiptModel,
        userId
      );

      const [updatedReturnReceipt] = await this.prisma.$transaction([
        updatedReturnReceiptPromise,
        ...returnReceiptEvents
      ]);

      await this.upsertReturnReceiptsInOpenSearch(id, true);
      return updatedReturnReceipt;
    }
    throw new ValidationFailedException([
      {
        property: 'Cannot update status of receipt which is not in Ready State'
      }
    ]);
  }

  async fetchDataFromReceipt(
    whereInput: Prisma.ReceiptWhereInput,
    select: Prisma.ReceiptSelect | null = null,
    include: Prisma.ReceiptInclude | null = null
  ) {
    const data: any = {
      where: whereInput
    };

    if (select) {
      data.select = select;
    }

    if (include) {
      delete data.where;
      data.include = include;
    }

    return await this.prisma.receipt.findFirst(data);
  }

  async fetchDataFromReturnReceipt(
    whereInput: Prisma.ReturnReceiptWhereInput,
    filter: Prisma.ReturnReceiptSelect
  ) {
    return await this.prisma.returnReceipt.findFirst({
      where: whereInput,
      select: filter
    });
  }

  upsertReceipt(receipt: ReceiptRequest, receiptId: number | null) {
    let upsertPromise: any = [];
    if (receiptId === undefined || receiptId === null) {
      upsertPromise.push(
        this.prisma.receipt.create({
          data: {
            ...receipt,
            products: {
              createMany: {
                data: receipt.products
              }
            }
          }
        })
      );
      return upsertPromise;
    }
    const upsertData = this.getReceiptProductsUpsertPromise(
      receiptId,
      receipt.products
    );

    upsertPromise = upsertData.updates;
    upsertPromise.push(
      this.prisma.receiptProduct.deleteMany({
        where: {
          productId: {
            notIn: upsertData.productIds
          },
          receiptId: receiptId
        }
      })
    );
    return upsertPromise;
  }

  async createReturnReceipt(receipt: ReturnReceiptRequest, receiptId: number) {
    return await this.prisma.returnReceipt.create({
      data: {
        ...receipt,
        products: {
          createMany: {
            data: receipt.products
          }
        },
        receiptId
      },
      include: {
        products: true
      }
    });
  }

  async createBackOrder(id: number, userId: number) {
    const receipt = await this.getReceiptById(id);
    if (receipt.status !== ReceiptStatus.DONE) {
      throw new ValidationFailedException([
        {
          property: `Unable to create a back-order with receipt status: ${receipt.status}`
        }
      ]);
    }
    const backOrderData = this.generateBackOrderFromReceipt(receipt, userId);
    const [backOrderReceiptPromise] = this.upsertReceipt(backOrderData, null);
    const backOrderReceipt = await backOrderReceiptPromise;
    await this.upsertReceiptInOpenSearch(backOrderReceipt.id);
    return backOrderReceipt;
  }

  async createReturn(id: number, userId: number) {
    const receipt = await this.getReceiptById(id);
    const whereInput: Prisma.ReturnReceiptWhereInput = {
      receiptId: id,
      status: ReceiptStatus.READY
    };
    const filter: Prisma.ReturnReceiptSelect = {
      id: true
    };
    const activeReturn = await this.fetchDataFromReturnReceipt(
      whereInput,
      filter
    );
    if (receipt.status !== ReceiptStatus.DONE || activeReturn) {
      throw new ValidationFailedException([
        {
          property: 'Unable to create Return receipt'
        }
      ]);
    }

    const reason = await this.prisma.reason.findFirst({
      where: { type: ReasonType.RETURN },
      select: { id: true }
    });

    if (reason === null) {
      throw new BadRequestException(
        'Unable to create Return receipt. No reason found in database.'
      );
    }

    const returnedQuantitySum = await this.getSumOfReturnedQuantities(id);
    const returnReceiptData = await this.generateReturnFromReceipt(
      receipt,
      returnedQuantitySum,
      userId,
      reason.id
    );
    const returnReceipt = await this.createReturnReceipt(returnReceiptData, id);
    await this.upsertReturnReceiptsInOpenSearch(returnReceipt.id);
    return returnReceipt;
  }

  async createReturnIn(id: number, userId: number) {
    const returnOut = await this.getReturnReceiptById(id);
    const whereInput: Prisma.ReceiptWhereInput = {
      returnInRefId: id,
      status: ReceiptStatus.READY
    };
    const filter: Prisma.ReceiptSelect = {
      id: true
    };
    const activeReturn = await this.fetchDataFromReceipt(whereInput, filter);
    if (returnOut.status !== ReceiptStatus.DONE || activeReturn) {
      throw new BadRequestException('Unable to create Return receipt');
    }

    const reason = await this.prisma.reason.findFirst({
      where: { type: ReasonType.RETURN_IN },
      select: { id: true }
    });

    if (reason === null) {
      throw new BadRequestException(
        'Unable to create Return receipt. No reason for Return In found in database.'
      );
    }

    const latestReturnInReceipt = await this.getLatestReturnIn(id);
    const returnInReceiptData = await this.generateReturnInFromReturnReceipt(
      returnOut,
      latestReturnInReceipt,
      userId,
      reason.id
    );
    const returnInReceiptPromise = await this.upsertReceipt(
      returnInReceiptData,
      null
    );
    const returnInReceipt = await returnInReceiptPromise[0];
    await this.upsertReceiptInOpenSearch(returnInReceipt.id, false, true);
    return returnInReceipt;
  }

  async getSumOfReturnedQuantities(receiptId: number) {
    const returnReceipt = await this.prisma.returnReceipt.findFirst({
      where: {
        receiptId,
        status: ReceiptStatus.DONE
      },
      select: {
        products: {
          select: {
            productId: true,
            quantityReceived: true,
            quantityReturned: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return returnReceipt?.products ? returnReceipt?.products : [];
  }

  async getLatestReturnIn(returnOutId: number) {
    const returnReceipt = await this.prisma.receipt.findFirst({
      where: {
        returnInRefId: returnOutId,
        status: ReceiptStatus.DONE
      },
      select: {
        products: {
          select: {
            productId: true,
            quantityOrdered: true,
            quantityReceived: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return returnReceipt?.products ? returnReceipt?.products : [];
  }

  async generateReturnFromReceipt(
    receipt: any,
    latestReturnedReceipt: any,
    userId: number,
    reasonId: number
  ) {
    const returnReceipt: ReturnReceiptRequest = {
      poId: receipt.poId,
      status: ReceiptStatus.READY,
      createdById: userId,
      reasonId,
      products: []
    };

    receipt.products.forEach((product: ReceiptProduct) => {
      const _product = latestReturnedReceipt.find(
        (returnedProduct: any) =>
          returnedProduct.productId === product.productId
      );
      const { quantityReturned, quantityReceived } = _product
        ? _product
        : latestReturnedReceipt.length > 0
        ? { quantityReturned: 0, quantityReceived: 0 } // True implies that the product has already been returned completely
        : { quantityReturned: 0, quantityReceived: product.quantityReceived }; //False implies the creation of first return receipt
      if (quantityReceived - quantityReturned > 0) {
        returnReceipt.products.push({
          productId: product.productId,
          sku: product.sku,
          name: product.name,
          quantityReceived: quantityReceived - quantityReturned,
          quantityReturned: quantityReceived - quantityReturned
        });
      }
    });
    if (!returnReceipt.products?.length) {
      throw new ValidationFailedException([
        { property: 'Cannot create a receipt with no products' }
      ]);
    }
    return returnReceipt;
  }

  async generateReturnInFromReturnReceipt(
    returnReceipt: any,
    latestReturnInReceipt: any,
    userId: number,
    reasonId: number
  ) {
    const returnInReceipt: ReceiptRequest = {
      poId: returnReceipt.poId,
      status: ReceiptStatus.READY,
      createdById: userId,
      reasonId,
      products: [],
      returnInRefId: returnReceipt.id
    };

    const latestReturnInReceiptObject = convertIntoKeyValuePair(
      latestReturnInReceipt,
      'productId'
    );

    returnReceipt.products.forEach((product: ReturnReceiptProduct) => {
      const _product = latestReturnInReceiptObject[product.productId];
      const { quantityOrdered, quantityReceived } = _product
        ? _product
        : latestReturnInReceipt.length > 0
        ? { quantityOrdered: 0, quantityReceived: 0 } // True implies that the product has already been returned completely
        : { quantityOrdered: product.quantityReturned, quantityReceived: 0 }; //False implies the creation of first return in receipt
      if (quantityOrdered - quantityReceived > 0) {
        returnInReceipt.products.push({
          productId: product.productId,
          sku: product.sku,
          name: product.name,
          quantityOrdered: quantityOrdered - quantityReceived,
          quantityReceived: quantityOrdered - quantityReceived
        });
      }
    });
    if (!returnInReceipt.products?.length) {
      throw new BadRequestException(
        'Cannot create a return in receipt with no products'
      );
    }
    return returnInReceipt;
  }

  generateBackOrderFromReceipt(receipt: any, userId: number) {
    const backOrder: ReceiptRequest = {
      poId: receipt.poId,
      status: ReceiptStatus.READY,
      createdById: userId,
      products: []
    };

    receipt.products.forEach((product: ReceiptProduct) => {
      if (product.quantityOrdered - product.quantityReceived > 0) {
        backOrder.products.push({
          productId: product.productId,
          sku: product.sku,
          name: product.name,
          quantityOrdered: product.quantityOrdered - product.quantityReceived,
          quantityReceived: product.quantityOrdered - product.quantityReceived
        });
      }
    });
    if (!backOrder.products?.length) {
      throw new ValidationFailedException([
        { property: 'Cannot create a receipt with no products' }
      ]);
    }
    return backOrder;
  }

  convertPurchaseOrderProductsToReceiptProducts(
    purchaseOrderProducts: PurchaseOrderProduct[] | undefined
  ) {
    const receiptProducts = purchaseOrderProducts?.map(
      (purchaseOrderProduct) => {
        return {
          productId: purchaseOrderProduct.productId,
          sku: purchaseOrderProduct.sku,
          name: purchaseOrderProduct.name,
          quantityOrdered: purchaseOrderProduct.quantity,
          quantityReceived: purchaseOrderProduct.quantity
        };
      }
    );
    return receiptProducts as ReceiptProductRequest[];
  }

  generateReceiptFromPO(
    userId: number,
    purchaseOrder: PurchaseOrder & {
      products: PurchaseOrderProduct[];
      vendor: Vendor;
      purchaser: User;
    }
  ) {
    const receiptProducts = this.convertPurchaseOrderProductsToReceiptProducts(
      purchaseOrder?.products
    );
    return {
      poId: purchaseOrder.id,
      status: ReceiptStatus.READY,
      createdById: userId,
      products: receiptProducts
    };
  }

  async addReceiptsInOpenSearch(): Promise<any> {
    const filter: any = {
      include: {
        purchaseOrder: {
          include: {
            products: {
              select: {
                sku: true,
                name: true,
                id: true
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true
          }
        }
      }
    };
    let returnReceipts = await this.prisma.returnReceipt.findMany(filter);
    filter.where = {
      returnInRefId: null
    };
    let receipts: any = await this.prisma.receipt.findMany(filter);
    filter.where = {
      returnInRefId: {
        not: null
      }
    };
    let returnInReceipts = await this.prisma.receipt.findMany(filter);
    receipts = receipts.map((receipt: any) => {
      const { purchaseOrder, createdBy, ...transferData } = receipt;
      return {
        ...transferData,
        type: TransferTypes.GRN,
        country: purchaseOrder.country,
        createdBy: createdBy.name,
        products: purchaseOrder.products,
        index: `${transfer.grn}${transferData.id}`
      };
    });
    returnReceipts = returnReceipts.map((returnReceipt: any) => {
      const { purchaseOrder, createdBy, ...transferData } = returnReceipt;
      return {
        ...transferData,
        type: TransferTypes.Return,
        country: purchaseOrder.country,
        createdBy: createdBy.name,
        products: purchaseOrder.products,
        index: `${transfer.return}${transferData.id}`
      };
    });

    returnInReceipts = returnInReceipts.map((returnInReceipt: any) => {
      const { purchaseOrder, createdBy, ...transferData } = returnInReceipt;
      return {
        ...transferData,
        type: TransferTypes.Return_In,
        country: purchaseOrder.country,
        createdBy: createdBy.name,
        products: purchaseOrder.products,
        index: `${transfer.return_in}${transferData.id}`
      };
    });
    const transfers = [...receipts, ...returnReceipts, ...returnInReceipts];
    return transfers;
  }

  private async upsertReceiptInOpenSearch(
    id: number,
    isUpdateOperation = false,
    isReturnIn = false
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
      type: isReturnIn ? TransferTypes.Return_In : TransferTypes.GRN,
      country: purchaseOrder.country,
      index: isReturnIn
        ? `${transfer.return_in}${receipt?.id}`
        : `${transfer.grn}${receipt?.id}`
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

  private async upsertReturnReceiptsInOpenSearch(
    id: number,
    isUpdateOperation = false
  ) {
    const receipt: any = await this.prisma.returnReceipt.findUnique({
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
      type: TransferTypes.Return,
      country: purchaseOrder.country,
      index: `${transfer.return}${receipt?.id}`
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

  // TODO: Create a parent module for Purchase Order and Receipts
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

  async downloadReceipt(id: number) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          select: {
            vendor: {
              select: {
                name: true,
                phone: true,
                taxID: true
              }
            },
            warehouseId: true,
            status: true,
            country: true,
            id: true
          }
        },
        products: true
      }
    });

    if (receipt) {
      const htmlInvoice = await renderHtmlForPdf(
        {
          ...receipt,
          id: `IN/${generateFormattedId(receipt.id)}`,
          poId: `P${generateFormattedId(receipt.purchaseOrder.id)}`,
          title: PDF_TITLE.RECEIPT,
          date: receipt.createdAt.toLocaleDateString('en-US'),
          country: COUNTRY[receipt.purchaseOrder.country],
          currency: CURRENCY[receipt.purchaseOrder.country],
          totalOrderedQty: sumBy(receipt?.products, 'quantityOrdered'),
          totalReceivedQty: sumBy(receipt?.products, 'quantityReceived')
        },
        path.join(__dirname, `../ejs/receiptPDFTemplate.ejs`)
      );

      const pdfBuffer = await generateFileBuffer(
        htmlInvoice,
        PDF_OPTIONS.options
      );
      return new StreamableFile(pdfBuffer);
    }

    throw new NotFoundException();
  }

  async downloadReturn(id: number) {
    const returnReceipt = await this.prisma.returnReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          select: {
            vendor: {
              select: {
                name: true,
                phone: true,
                taxID: true
              }
            },
            warehouseId: true,
            status: true,
            country: true,
            id: true
          }
        },
        products: true,
        receipt: true
      }
    });

    if (returnReceipt) {
      const htmlInvoice = await renderHtmlForPdf(
        {
          ...returnReceipt,
          id: `Out/${generateFormattedId(returnReceipt.id)}`,
          receiptId: `IN/${generateFormattedId(returnReceipt.receipt.id)}`,
          poId: `P${generateFormattedId(returnReceipt.purchaseOrder.id)}`,
          title: PDF_TITLE.RETURN,
          isReturn: true,
          date: returnReceipt.createdAt.toLocaleDateString('en-US'),
          country: COUNTRY[returnReceipt.purchaseOrder.country],
          currency: CURRENCY[returnReceipt.purchaseOrder.country],
          totalReceivedQty: sumBy(returnReceipt?.products, 'quantityReceived'),
          totalReturnedQty: sumBy(returnReceipt?.products, 'quantityReturned')
        },
        path.join(__dirname, `../ejs/returnPDFTemplate.ejs`)
      );

      const pdfBuffer = await generateFileBuffer(
        htmlInvoice,
        PDF_OPTIONS.options
      );
      return new StreamableFile(pdfBuffer);
    }

    throw new NotFoundException();
  }

  private checkReturnStatus(
    receipts: { products: ReceiptProduct[] },
    returnReceipts: {
      products: ReturnReceiptProduct[];
      status: ReceiptStatus;
    }[],
    status: ReceiptStatus
  ) {
    //Not more than 1 Return receipt can be in Ready State
    for (const returnReceipt of returnReceipts) {
      if (returnReceipt.status === status) {
        return false;
      }
    }
    const productsAvailableQty = this.getAvailableProductsQty(
      receipts.products,
      returnReceipts
    );
    //Can create Return receipt if available qty of any product > 0
    for (const product in productsAvailableQty) {
      if (productsAvailableQty[product] > 0) {
        return true;
      }
    }
    return false;
  }

  private getAvailableProductsQty = (
    receiptProducts: ReceiptProduct[],
    returnReceipts: { products: ReturnReceiptProduct[] }[]
  ) => {
    const availableQtyList: Record<string, number> = {};

    for (const product of receiptProducts) {
      availableQtyList[product.productId] = product.quantityReceived;
    }
    subtractQtyFromProductList(availableQtyList, returnReceipts);
    return availableQtyList;
  };

  async updateReceiptAttachments(
    id: number,
    attachment: any,
    userId: number
  ): Promise<Receipt> {
    const receiptUpdatePromise = this.prisma.receipt.update({
      where: { id },
      data: attachment
    });

    const receiptEventLog = await this.eventService.generateEvents(
      id,
      attachment,
      receiptModel,
      userId
    );

    const [result] = await this.prisma.$transaction([
      receiptUpdatePromise,
      ...receiptEventLog
    ]);

    this.upsertReceiptInOpenSearch(id, true);

    return result;
  }

  async updateReturnReceiptAttachments(
    id: number,
    attachment: any,
    userId: number
  ): Promise<ReturnReceipt> {
    const receiptUpdatePromise = this.prisma.returnReceipt.update({
      where: { id },
      data: attachment
    });

    const returnReceiptEventLog = await this.eventService.generateEvents(
      id,
      attachment,
      returnReceiptModel,
      userId
    );

    const [result] = await this.prisma.$transaction([
      receiptUpdatePromise,
      ...returnReceiptEventLog
    ]);

    this.upsertReceiptInOpenSearch(id, true);

    return result;
  }
}

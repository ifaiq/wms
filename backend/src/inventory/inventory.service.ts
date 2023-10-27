import { Inventory, Prisma, ReturnReceiptProduct } from '.prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import {
  InventoryMovement,
  InventoryMovementType,
  PrismaPromise
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { convertIntoKeyValuePair } from 'src/common';
import { INVENTORY_SYNC_TYPES } from 'src/common/constants';
import { InsertInventoryMovementProductDto } from 'src/inventory-movement/dto';
import { InventoryMovementService } from 'src/inventory-movement/inventory-movement.service';
import { BatchPayload } from 'src/purchase-order/utils/helper';
import { UpsertInventoryDto, UpsertInventoryProductDto } from './dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryMovementService: InventoryMovementService
  ) {}

  async upsertProductInventory(
    inventoryData: UpsertInventoryDto
  ): Promise<PrismaPromise<Inventory>[]> {
    const inventoryUpdates: PrismaPromise<Inventory>[] = [];
    const commonInventoryData: Omit<UpsertInventoryDto, 'products'> = {
      country: inventoryData.country,
      businessUnitId: inventoryData.businessUnitId,
      warehouseId: inventoryData.warehouseId,
      locationId: inventoryData.locationId,
      createdById: inventoryData.createdById
    };

    // Fetch product ids in an array
    const productIds: number[] = [];
    inventoryData.products.forEach((product: UpsertInventoryProductDto) => {
      productIds.push(product.productId);
    });

    // Fetch products that are already available in inventory table
    const productsToBeUpdated = await this.prisma.inventory.findMany({
      where: {
        productId: { in: productIds },
        businessUnitId: inventoryData.businessUnitId,
        warehouseId: inventoryData.warehouseId,
        locationId: inventoryData.locationId
      },
      select: {
        productId: true,
        physicalQuantity: true
      }
    });

    // Convert into keyvalue pair based on id
    const productsToBeUpdatedObj = convertIntoKeyValuePair(
      productsToBeUpdated,
      'productId'
    );

    // Upsert products data in the inventory table
    inventoryData.products.forEach((product: UpsertInventoryProductDto) => {
      inventoryUpdates.push(
        this.prisma.inventory.upsert({
          where: {
            businessUnitId_warehouseId_locationId_productId: {
              businessUnitId: inventoryData.businessUnitId,
              warehouseId: inventoryData.warehouseId,
              locationId: inventoryData.locationId,
              productId: product.productId
            }
          },
          update: {
            physicalQuantity: productsToBeUpdatedObj[product.productId]
              ? Number(
                  productsToBeUpdatedObj[product.productId].physicalQuantity
                ) + product.physicalQuantity
              : product.physicalQuantity, // Sum current physical qunatity with new quantity provided
            productId: product.productId
          },
          create: {
            ...commonInventoryData,
            physicalQuantity: product.physicalQuantity,
            productId: product.productId
          }
        })
      );
    });
    return inventoryUpdates;
  }

  async fetchInventoryProductsByWhere(
    whereClause: Prisma.InventoryWhereInput,
    selectClause: Prisma.InventorySelect
  ): Promise<Prisma.InventorySelect[]> {
    // filter products on the basis of product ids and sublocation id provided
    return await this.prisma.inventory.findMany({
      where: whereClause,
      select: selectClause
    });
  }

  async groupByInventoryProductsByWhere(
    whereClause: Prisma.InventoryWhereInput,
    by: Prisma.InventoryScalarFieldEnum[],
    sum: Prisma.InventorySumAggregateInputType
  ) {
    // filter products on the basis of product ids and sublocation id provided
    return await this.prisma.inventory.groupBy({
      where: whereClause,
      by,
      _sum: sum
    });
  }

  deleteProductRecordsFromInventoryTable(
    warehouseId: number,
    productIds: number[]
  ): PrismaPromise<BatchPayload> {
    return this.prisma.inventory.deleteMany({
      where: {
        warehouseId: warehouseId,
        productId: { in: productIds }
      }
    });
  }

  async fetchProductRecordsFromInventoryTable(
    warehouseId: number,
    productIds: number[]
  ) {
    return await this.prisma.inventory.findMany({
      where: {
        warehouseId: warehouseId,
        productId: { in: productIds }
      },
      select: {
        productId: true,
        physicalQuantity: true,
        locationId: true
      }
    });
  }

  async inventorySyncSqsHandler(data: {
    type: string;
    batchId: number;
    warehouseId?: number;
    products: { id: number; quantity: number }[];
  }) {
    this.logger.log(
      `Received a message to sync product quantity from Monolith - ${data}`
    );
    switch (data.type) {
      case INVENTORY_SYNC_TYPES.BATCH_CLOSE:
        await this.addProductQuantitesInInventory(
          data.batchId,
          data.warehouseId as number,
          data.products
        );
        break;

      case INVENTORY_SYNC_TYPES.BATCH_ACCEPT:
        await this.subtractProductQuantityFromInventory(
          data.batchId,
          data.products
        );
        break;

      default:
        break;
    }
  }

  private async addProductQuantitesInInventory(
    batchId: number,
    warehouseId: number,
    products: { id: number; quantity: number }[]
  ) {
    const inventoryUpdates: (
      | PrismaPromise<BatchPayload>
      | PrismaPromise<InventoryMovement>
      | PrismaPromise<Inventory>
    )[] = [];
    // Fetch the first inventory for on location that is sellable and priorty is highest
    const location = await this.prisma.location.findFirst({
      where: {
        warehouseId,
        availableForSale: true,
        disabled: false
      },
      orderBy: {
        priority: 'asc'
      }
    });

    if (location) {
      const inventoryData = {
        businessUnitId: location.businessUnitId,
        warehouseId: location.warehouseId,
        locationId: location.id,
        country: location.country
      };
      await Promise.all(
        products.map(async (product) => {
          // add all the product quantity received on inventory
          const inventoryPromise = this.prisma.inventory.upsert({
            where: {
              businessUnitId_warehouseId_locationId_productId: {
                businessUnitId: location.businessUnitId,
                warehouseId: location.warehouseId,
                locationId: location.id,
                productId: product.id
              }
            },
            update: {
              physicalQuantity: {
                increment: product.quantity
              }
            },
            create: {
              ...inventoryData,
              physicalQuantity: product.quantity,
              productId: product.id,
              createdById: location.createdById
            }
          });

          // create an inventory movement for the current product
          const inventoryMovementPromise =
            await this.inventoryMovementService.createInventoryMovement({
              locationId: location.id,
              movementType: InventoryMovementType.BATCH_CLOSING,
              referenceId: batchId,
              products: [
                {
                  productId: product.id,
                  physicalQuantity: product.quantity
                }
              ]
            });
          inventoryUpdates.push(inventoryPromise, ...inventoryMovementPromise);
        })
      );
      await this.prisma.$transaction(inventoryUpdates);
    }
  }

  private async subtractProductQuantityFromInventory(
    batchId: number,
    products: { id: number; quantity: number }[]
  ) {
    const inventoryUpdates: (
      | PrismaPromise<BatchPayload>
      | PrismaPromise<InventoryMovement>
    )[] = [];
    await Promise.all(
      products.map(async (product) => {
        // Fetch all the inventory of that product on locations that are sellable and sort it by 'priority' ascending
        let inventory: any;
        try {
          inventory = await this.prisma.$queryRaw`SELECT
        \`wms\`.\`Inventory\`.\`id\`,
        \`wms\`.\`Inventory\`.\`country\`,
        \`wms\`.\`Inventory\`.\`businessUnitId\`,
        \`wms\`.\`Inventory\`.\`warehouseId\`,
        \`wms\`.\`Inventory\`.\`locationId\`,
        \`wms\`.\`Inventory\`.\`productId\`,
        \`wms\`.\`Inventory\`.\`physicalQuantity\`,
        \`wms\`.\`Inventory\`.\`createdById\`
        FROM \`wms\`.\`Inventory\` 
        INNER JOIN \`wms\`.\`Location\` 
        ON \`wms\`.\`Location\`.\`id\` = \`wms\`.\`Inventory\`.\`locationId\`
        WHERE \`wms\`.\`Inventory\`.\`productId\`= ${product.id}
        AND \`wms\`.\`Inventory\`.\`physicalQuantity\` > 0
        AND \`wms\`.\`Location\`.\`availableForSale\` = 1
        ORDER BY \`wms\`.\`Location\`.\`priority\` ASC`;
        } catch (err) {
          if (err) {
            {
              throw err;
            }
          }
        }

        let quantity = product.quantity;
        // Keep removing the product.quantity one by one from each inventory row till all of product.quantity has been removed
        if (inventory.length <= 0) {
          return { success: true };
        }
        for (const productInventory of inventory) {
          const quantityToBeRemovedFromALocation =
            productInventory.physicalQuantity >= quantity
              ? quantity
              : productInventory.physicalQuantity;
          const inventoryPromise = this.prisma.inventory.updateMany({
            data: {
              physicalQuantity:
                productInventory.physicalQuantity -
                quantityToBeRemovedFromALocation
            },
            where: {
              productId: productInventory.productId,
              locationId: productInventory.locationId
            }
          });

          // create an inventory movement for the current product and location
          const inventoryMovementPromise =
            await this.inventoryMovementService.createInventoryMovement({
              locationId: productInventory.locationId,
              movementType: InventoryMovementType.BATCH_ACCEPTANCE,
              referenceId: batchId,
              products: [
                {
                  productId: productInventory.productId,
                  physicalQuantity: -quantityToBeRemovedFromALocation
                }
              ]
            });
          inventoryUpdates.push(inventoryPromise, ...inventoryMovementPromise);
          quantity = quantity - quantityToBeRemovedFromALocation;
          if (quantity === 0) break;
        }
      })
    );
    await this.prisma.$transaction(inventoryUpdates);
  }

  async productsAvailabilityAtLocation(
    locationId: number,
    products: ReturnReceiptProduct[]
  ): Promise<boolean> {
    const logIdentifier = 'productsAvailabilityAtLocation()';
    const currentProductsData = products.map(
      (product: ReturnReceiptProduct): InsertInventoryMovementProductDto => {
        return {
          productId: product.productId,
          physicalQuantity: product.quantityReturned
        };
      }
    );
    const productsDataFromDb =
      await this.inventoryMovementService.fetchProductsInventory(
        locationId,
        currentProductsData
      );

    //Have to check if quantities to be returned are present in that location
    for (const currentProduct of currentProductsData) {
      const productFromDb = productsDataFromDb[currentProduct.productId];
      if (productFromDb === undefined) {
        this.logger.log(
          `context: ${logIdentifier}, message: No entry exists for productId: ${currentProduct.productId} in Inventory table`
        );
        return false;
      }
      if (currentProduct.physicalQuantity > productFromDb.physicalQuantity) {
        return false;
      }
    }
    return true;
  }

  async isInventoryEmpty(locationIds: Array<number>): Promise<boolean> {
    const inventory = await this.prisma.inventory.aggregate({
      where: {
        locationId: {
          in: locationIds
        }
      },
      _sum: {
        physicalQuantity: true
      }
    });

    if (inventory._sum.physicalQuantity === null) {
      return true;
    }

    return inventory._sum.physicalQuantity > 0 ? false : true;
  }
}

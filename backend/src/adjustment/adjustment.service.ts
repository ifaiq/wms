import {
  Adjustment,
  AdjustmentProduct,
  AdjustmentStatus,
  Location,
  Prisma,
  PrismaPromise,
  RequestType,
  InventoryMovement,
  InventoryMovementType
} from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  BadRequestExceptionBulkUpload,
  NotFoundException,
  ValidationFailedException
} from 'src/errors/exceptions';
import { MonolithService } from 'src/monolith/monolith.service';
import {
  AdjustmentProductRequest,
  AdjustmentRequest,
  AdjustmentStatusRequest,
  CreateAdjustmentRequest
} from './dto';
const { Adjustment: AdjustmentModel } = Prisma.ModelName;
import {
  attachReferenceNumber,
  classifyProducts,
  convertIntoKeyValuePair,
  fetchProductSkus,
  filterProductsData
} from '../common';
import {
  BatchPayload,
  getProductBySkuCode
} from 'src/purchase-order/utils/helper';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import {
  AdjustFileFormatForInitialCount,
  AdjustmentFileCorrectFormat,
  REASON,
  openSearchIndexKey,
  DUMP_LOCATION,
  transfer,
  TRANSFERS,
  TransferTypes,
  userSelect
} from 'src/common/constants';
import {
  AdjustmentFileInitialDto,
  AdjustmentFileDto
} from 'src/fileupload/dto/adjustment.fileupload.dto';
import { AppsearchService } from 'src/appsearch/appsearch.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import {
  CreateProductDumpLocation,
  UpdateInventoryBody,
  UpdateProduct,
  ValidateProductQuantity
} from 'src/monolith/entities';
import { EventService } from 'src/event/event.service';
import { LocationService } from 'src/location/location.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { InsertInventoryMovementDto } from 'src/inventory-movement/dto';
import { Inventory } from '@prisma/client';
import { InventoryMovementService } from 'src/inventory-movement/inventory-movement.service';
import isEmpty from 'lodash.isempty';
import { UpsertInventoryDto } from 'src/inventory/dto';
const { Adjustment: adjustmentModel } = Prisma.ModelName;

@Injectable()
export class AdjustmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monolithService: MonolithService,
    private readonly fileUploadService: FileuploadService,
    private readonly appSearchService: AppsearchService,
    private readonly openSearchService: OpensearchService,
    private readonly eventService: EventService,
    private readonly locationService: LocationService,
    private readonly inventoryService: InventoryService,
    private readonly inventoryMovementService: InventoryMovementService
  ) {}

  async createAdjustment(adjustment: CreateAdjustmentRequest) {
    !adjustment.status && (adjustment.status = AdjustmentStatus.READY);

    if (adjustment.locationId) {
      await this.locationService.AreDiabledLocations([adjustment.locationId]);
    }
    const adjustmentObj = await this.prisma.adjustment.create({
      data: {
        ...adjustment,
        products: {
          createMany: { data: adjustment.products, skipDuplicates: true }
        }
      },
      include: {
        products: true,
        reason: true,
        createdBy: { select: userSelect }
      }
    });
    if (adjustmentObj) {
      const { businessUnit, warehouse } =
        await this.monolithService.GetBusinessUnitAndLocationById(
          adjustmentObj.businessUnitId,
          adjustmentObj.warehouseId
        );
      adjustmentObj.products = await this.syncProductDataWithAppSearch(
        adjustmentObj.products,
        adjustmentObj.warehouseId,
        adjustmentObj.locationId as number,
        adjustmentObj.reason.reason
      );
      await this.upsertAdjustmentInOpenSearch(adjustmentObj.id);
      return {
        adjustment: {
          ...adjustmentObj,
          businessUnit,
          warehouse
        }
      };
    }
  }

  async getAdjustmentById(id: number) {
    let adjustment = await this.prisma.adjustment.findUnique({
      where: { id },
      include: {
        products: true,
        reason: true,
        createdBy: { select: userSelect },
        location: { select: { name: true } }
      }
    });
    if (adjustment) {
      const { businessUnit, warehouse } =
        await this.monolithService.GetBusinessUnitAndLocationById(
          adjustment.businessUnitId,
          adjustment.warehouseId
        );
      if (adjustment.status === AdjustmentStatus.DONE) {
        adjustment.products = adjustment.products.map((product) => ({
          ...product,
          currentQuantity: product.physicalQuantity
        }));
      } else {
        adjustment.products = await this.syncProductDataWithAppSearch(
          adjustment.products,
          adjustment.warehouseId,
          adjustment.locationId as number,
          adjustment.reason.reason
        );
      }
      adjustment = attachReferenceNumber(TRANSFERS, {
        ...adjustment,
        type: TransferTypes.Adjustment
      });
      return {
        adjustment: {
          ...adjustment,
          businessUnit,
          warehouse
        }
      };
    }
    throw new NotFoundException(AdjustmentModel);
  }

  async updateAdjustment(
    id: number,
    adjustment: AdjustmentRequest,
    userId: number
  ): Promise<Adjustment> {
    if (adjustment.locationId) {
      await this.locationService.AreDiabledLocations([adjustment.locationId]);
    }
    const { products, ...adjustmentData } = adjustment;
    const currentAdjustment = await this.prisma.adjustment.findUnique({
      where: { id },
      include: { products: true, reason: true }
    });

    const { createProducts, deleteProducts, updateProducts } = classifyProducts(
      products,
      currentAdjustment?.products
    );

    const updates: PrismaPromise<
      Adjustment | AdjustmentRequest | BatchPayload | AdjustmentProductRequest
    >[] = [
      this.prisma.adjustmentProduct.deleteMany({
        where: {
          adjustmentId: id,
          productId: { in: deleteProducts }
        }
      })
    ];
    for (const product of updateProducts) {
      const { productId, ...data } = product;
      updates.push(
        this.prisma.adjustmentProduct.update({
          where: {
            adjustmentId_productId: {
              adjustmentId: id,
              productId
            }
          },
          data
        })
      );
    }
    updates.push(
      this.prisma.adjustment.update({
        where: { id },
        data: {
          ...adjustmentData,
          products: {
            createMany: {
              data: createProducts as AdjustmentProductRequest[],
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

    const adjustmentEventLog = await this.eventService.generateEvents(
      id,
      adjustmentData,
      adjustmentModel,
      userId
    );
    const results = await this.prisma.$transaction([
      ...updates,
      ...adjustmentEventLog
    ]);
    const adjustmentObj: any = results[updateProducts.length + 1];
    const { businessUnit, warehouse } =
      await this.monolithService.GetBusinessUnitAndLocationById(
        adjustment.businessUnitId,
        adjustment.warehouseId
      );
    adjustmentObj.businessUnit = businessUnit;
    adjustmentObj.warehouse = warehouse;
    adjustmentObj.products = await this.syncProductDataWithAppSearch(
      adjustmentObj.products,
      adjustmentObj.warehouseId,
      adjustmentObj.locationId,
      adjustmentObj.reason.reason
    );
    await this.upsertAdjustmentInOpenSearch(adjustmentObj.id, true);
    return adjustmentObj;
  }

  private validateSkuCode(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    skuCode: string,
    data: Record<string, []>
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

  private validateActualQuantity(
    validationkey: string | number,
    rowNumber: number,
    columnNumber: number,
    actualQuantity: string
  ) {
    const quantity = Number(actualQuantity);

    if (!Number.isInteger(quantity))
      return `Row(${rowNumber}) x Col(${columnNumber}): actualQuantity should be an integer`;

    if (!isFinite(quantity) || isEmpty(actualQuantity)) {
      return `Row(${rowNumber}) x Col(${columnNumber}): actualQuantity is not a whole number`;
    }
    if (quantity < 0) {
      return `Row(${rowNumber}) x Col(${columnNumber}): actualQuantity is negative`;
    }
    return true;
  }

  private getFileValidatorConfig() {
    return {
      [AdjustFileFormatForInitialCount.sku]: {
        validate: this.validateSkuCode
      },
      [AdjustFileFormatForInitialCount.actualquantity]: {
        validate: this.validateActualQuantity
      }
    };
  }

  async insertProductsFromCSV(
    file: Express.Multer.File,
    locationId: number,
    reason: string,
    subLocationId: string | null
  ) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      reason === REASON.INITIAL_COUNT
        ? AdjustFileFormatForInitialCount
        : AdjustmentFileCorrectFormat
    );

    // Check if the sku count of valid products is less than 1000
    if (csvData.length >= 1000)
      throw new ValidationFailedException([
        { property: 'SKU limit reached, SKUs should be less than 1000' }
      ]);

    const parsedDataforIntialCount: AdjustmentFileInitialDto[] = [];
    const parsedDataforOtherCases: AdjustmentFileDto[] = [];
    let objectPropertiesForCsv: string;

    if (reason === REASON.INITIAL_COUNT) {
      objectPropertiesForCsv = 'actualQuantity';
      for (const data of csvData) {
        const { sku, actualquantity } = data;
        parsedDataforIntialCount.push({
          sku,
          actualQuantity: Number(actualquantity)
        });
      }
    } else {
      objectPropertiesForCsv = 'differenceQuantity';
      for (const data of csvData) {
        const { sku, differencequantity } = data;
        parsedDataforOtherCases.push({
          sku,
          differenceQuantity: Number(differencequantity)
        });
      }
    }
    const parsedData = parsedDataforIntialCount.length
      ? parsedDataforIntialCount
      : parsedDataforOtherCases;

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

    let validProductsArray: object[] = [];

    if (reason !== REASON.INITIAL_COUNT) {
      validProductsArray =
        await this.fileUploadService.validateProductsFromInventoryTable(
          validProductList,
          subLocationId as string
        );
    }

    const productsData =
      reason === REASON.INITIAL_COUNT ? validProductList : validProductsArray;

    const configs = this.getFileValidatorConfig();

    const validationData = {
      validProducts: productsData
    };

    const errors = await this.fileUploadService.csvFileValidator(
      csvData,
      configs,
      validationData
    );

    if (errors.length)
      throw new ValidationFailedException([
        ...errors.map((error: string) => ({ property: error }))
      ]);

    const validProductObj = convertIntoKeyValuePair(productsData, 'sku');

    const { validProducts, invalidProducts } = filterProductsData(
      validProductObj,
      parsedData,
      [objectPropertiesForCsv],
      ['currentQuantity']
    );

    // If invalid products exists
    if (invalidProducts.length > 0)
      throw new ValidationFailedException([
        ...invalidProducts.map((product) => ({
          property: `Invalid Product found with SKU: ${product?.sku}`
        }))
      ]);

    let updatedValidProducts = [];
    if (reason === REASON.INITIAL_COUNT) {
      updatedValidProducts = validProducts.map((product) => {
        return {
          ...product,
          differenceQuantity: product.actualQuantity - product.currentQuantity
        };
      });
    } else {
      updatedValidProducts = validProducts.map((product) => {
        return {
          ...product,
          actualQuantity:
            Number(product.differenceQuantity) + Number(product.currentQuantity)
        };
      });
    }

    return updatedValidProducts;
  }

  async updateAdjustmentStatus(
    id: number,
    adjustment: AdjustmentStatusRequest,
    userId: number
  ) {
    if (adjustment.status === (AdjustmentStatus.CANCELLED as string)) {
      const adjustmentPromise = this.prisma.adjustment.update({
        where: {
          id
        },
        data: {
          status: AdjustmentStatus.CANCELLED,
          products: {
            updateMany: {
              where: {
                adjustmentId: id
              },
              data: {
                actualQuantity: 0
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
      const adjustmentEventLog = await this.eventService.generateEvents(
        id,
        { status: AdjustmentStatus.CANCELLED },
        adjustmentModel,
        userId
      );
      const [adjustment] = await this.prisma.$transaction([
        adjustmentPromise,
        ...adjustmentEventLog
      ]);
      const { businessUnit, warehouse } =
        await this.monolithService.GetBusinessUnitAndLocationById(
          adjustment.businessUnitId,
          adjustment.warehouseId
        );
      await this.upsertAdjustmentInOpenSearch(adjustment.id, true);
      return {
        adjustment: {
          ...adjustment,
          businessUnit,
          warehouse
        }
      };
    } else {
      const currentAdjustmentData = await this.prisma.adjustment.findUnique({
        where: {
          id
        },
        include: {
          products: true,
          reason: true
        }
      });
      if (currentAdjustmentData) {
        const updatedData = {
          status: AdjustmentStatus.DONE,
          confirmedAt: new Date()
        };
        const adjustmentPromise = this.prisma.adjustment.update({
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
        const adjustmentEventLog = await this.eventService.generateEvents(
          id,
          updatedData,
          adjustmentModel,
          userId
        );
        const productSkus = fetchProductSkus(currentAdjustmentData?.products);
        const validProductList =
          await this.appSearchService.searchProductBySkus(
            productSkus,
            String(currentAdjustmentData.warehouseId),
            {
              id: { raw: {} },
              name: { raw: {} },
              sku: { raw: {} },
              physical_stock: { raw: {} }
            }
          );
        const validProductObj = convertIntoKeyValuePair(
          validProductList,
          'sku'
        );

        const updateInventoryBody: UpdateInventoryBody = {
          type: RequestType.ADJUSTMENT,
          reason: currentAdjustmentData.reason.reason,
          referenceId: currentAdjustmentData.id,
          physicalQuantity: true,
          stockQuantity: true,
          products: []
        };

        const updates: (
          | PrismaPromise<Inventory>
          | PrismaPromise<InventoryMovement>
          | PrismaPromise<AdjustmentProduct>
          | PrismaPromise<BatchPayload>
        )[] = [];
        if (process.env.ALLOW_INVENTORY_UPDATE === 'true') {
          // Updating physical Inventory in monolith
          const productLocationData = {
            country: currentAdjustmentData.country,
            businessUnitId: currentAdjustmentData.businessUnitId,
            warehouseId: currentAdjustmentData.warehouseId,
            createdById: currentAdjustmentData.createdById
          };

          // Fetch product ids in an array
          const productIds: number[] = currentAdjustmentData.products.map(
            (product: AdjustmentProduct) => product.productId
          );
          // When its initial count case we will remove that product count from the warehouse
          // and add a new entry with the adjusted count on the product dump location for that warehouse
          if (currentAdjustmentData.reason.reason === REASON.INITIAL_COUNT) {
            await this.validateAdjustmentProductQuantity(
              currentAdjustmentData.warehouseId,
              currentAdjustmentData.products,
              true
            );

            // Fetch product inventory from all locations in the warehouse
            const productInventory =
              await this.inventoryService.fetchProductRecordsFromInventoryTable(
                currentAdjustmentData.warehouseId,
                productIds
              );

            // Create inventory movement promises for the product on all locations
            const inventoryMovementPromises =
              await this.createNegativeInventoryMovementForInitialCount(
                productInventory,
                {
                  createdById: currentAdjustmentData.createdById,
                  id: currentAdjustmentData.id,
                  reason: currentAdjustmentData.reason.reason
                }
              );

            // Delete product inventory from all locations in the warehouse
            const removeProductsFromInventory =
              this.inventoryService.deleteProductRecordsFromInventoryTable(
                currentAdjustmentData.warehouseId,
                productIds
              );

            updates.push(
              ...inventoryMovementPromises,
              removeProductsFromInventory
            );

            // fetch product dump location for that warehouse
            const location = await this.fetchProductDumpLocation(
              productLocationData
            );

            const productData = currentAdjustmentData.products.map(
              (product) => {
                return {
                  productId: product.productId,
                  physicalQuantity: product.actualQuantity
                };
              }
            );

            updateInventoryBody.products = currentAdjustmentData.products.map(
              (product): UpdateProduct => {
                return {
                  id: product.productId,
                  quantity:
                    product.actualQuantity -
                    (+validProductObj[product.sku]?.currentQuantity || 0)
                };
              }
            );

            const upsertInventoryProduct: UpsertInventoryDto = {
              ...productLocationData,
              locationId: location.id,
              products: productData
            };

            // Create an inventory movement for grn
            const inventoryMovement: InsertInventoryMovementDto = {
              locationId: location.id,
              createdById: currentAdjustmentData.createdById,
              movementType: InventoryMovementType.ADJUSTMENT,
              reason: currentAdjustmentData.reason.reason,
              referenceId: currentAdjustmentData.id,
              products: productData
            };

            // add products in the inventory table on the product dump location for that warehouse
            updates.push(
              ...(await this.inventoryService.upsertProductInventory(
                upsertInventoryProduct
              )),
              ...(await this.inventoryMovementService.createInventoryMovementForInitialCountAdjustment(
                inventoryMovement
              ))
            );
          } else {
            updateInventoryBody.products = currentAdjustmentData.products.map(
              (product): UpdateProduct => {
                return {
                  id: product.productId,
                  quantity: product.differenceQuantity
                };
              }
            );

            if (currentAdjustmentData.locationId) {
              // fetch available for sale for the warehouse sublocation
              const { availableForSale } =
                await this.locationService.getLocation(
                  currentAdjustmentData.locationId
                );

              if (availableForSale) {
                // When transferring location from available for sale location to not available for sale location make sure
                // that the quantites in pending batches is less than the quantity of the sku in available for sale locations - tranfer quantity
                await this.validateAdjustmentProductQuantity(
                  currentAdjustmentData.warehouseId,
                  currentAdjustmentData.products
                );
              }

              const productsData = currentAdjustmentData.products.map(
                (product) => {
                  return {
                    productId: product.productId,
                    physicalQuantity: product.differenceQuantity
                  };
                }
              );

              const upsertInventoryProduct: UpsertInventoryDto = {
                ...productLocationData,
                locationId: currentAdjustmentData.locationId,
                products: productsData
              };

              const createInventoryMovement: InsertInventoryMovementDto = {
                locationId: currentAdjustmentData.locationId,
                createdById: currentAdjustmentData.createdById,
                movementType: InventoryMovementType.ADJUSTMENT,
                referenceId: currentAdjustmentData.id,
                reason: currentAdjustmentData.reason.reason,
                products: productsData
              };

              // Update inventory table and inventory movement table
              updates.push(
                ...(await this.inventoryService.upsertProductInventory(
                  upsertInventoryProduct
                )),
                ...(await this.inventoryMovementService.createInventoryMovement(
                  createInventoryMovement
                ))
              );

              // if warehouse sublocation is not available for sale so we will only update physical quantity on monolith.
              if (!availableForSale) {
                // Setting stock quantity to false
                updateInventoryBody.stockQuantity = false;
              }
            }
          }
          await this.monolithService.updateInventory(
            updateInventoryBody,
            currentAdjustmentData.id
          );
        }
        const productIds: number[] = currentAdjustmentData.products.map(
          (product) => product.productId
        );

        const whereClause: Prisma.InventoryWhereInput = {
          warehouseId: Number(currentAdjustmentData.warehouseId),
          locationId: Number(currentAdjustmentData.locationId),
          productId: { in: productIds }
        };

        const selectClause: Prisma.InventorySelect = {
          productId: true,
          physicalQuantity: true
        };

        const productInventoryByLocation =
          await this.inventoryService.fetchInventoryProductsByWhere(
            whereClause,
            selectClause
          );

        // Convert into keyvalue pair based on id
        const productsById = convertIntoKeyValuePair(
          productInventoryByLocation,
          'productId'
        );
        for (const product of currentAdjustmentData.products) {
          let physicalQty: number;
          let diffQty: number;
          let actualQty: number;
          const { productId, actualQuantity, differenceQuantity, ...data } =
            product;

          if (currentAdjustmentData.reason.reason === REASON.INITIAL_COUNT) {
            physicalQty = +validProductObj[product.sku]?.currentQuantity;
            diffQty =
              actualQuantity -
              (+validProductObj[product.sku]?.currentQuantity || 0);
            actualQty = actualQuantity;
          } else {
            physicalQty = productsById[product.productId]?.physicalQuantity;
            diffQty = differenceQuantity;
            actualQty =
              differenceQuantity +
              (productsById[product.productId]?.physicalQuantity || 0);
          }

          updates.push(
            this.prisma.adjustmentProduct.update({
              where: {
                adjustmentId_productId: {
                  adjustmentId: currentAdjustmentData.id,
                  productId
                }
              },
              data: {
                ...data,
                physicalQuantity: physicalQty,
                actualQuantity: actualQty,
                differenceQuantity: diffQty
              }
            })
          );
        }
        const adjustment = await this.prisma.$transaction([
          adjustmentPromise,
          ...adjustmentEventLog,
          ...updates
        ]);

        const { businessUnit, warehouse } =
          await this.monolithService.GetBusinessUnitAndLocationById(
            adjustment[0].businessUnitId,
            adjustment[0].warehouseId
          );
        await this.upsertAdjustmentInOpenSearch(adjustment[0].id, true);
        return {
          adjustment: {
            ...adjustment,
            businessUnit,
            warehouse
          }
        };
      }
    }
  }

  private async syncProductDataWithAppSearch(
    products: AdjustmentProduct[],
    warehouseId: number,
    locationId: number,
    reason: string
  ) {
    let updatedProducts = [];

    if (reason === REASON.INITIAL_COUNT) {
      const productSkus = fetchProductSkus(products);
      const validProductList = await this.appSearchService.searchProductBySkus(
        productSkus,
        String(warehouseId),
        {
          id: { raw: {} },
          name: { raw: {} },
          sku: { raw: {} },
          physical_stock: { raw: {} }
        }
      );
      const validProductObj = convertIntoKeyValuePair(validProductList, 'sku');
      updatedProducts = products.map((product) => {
        return {
          ...product,
          currentQuantity: validProductObj[product.sku].currentQuantity,
          differenceQuantity:
            product.actualQuantity -
            (validProductObj[product.sku].currentQuantity as number)
        };
      });
    } else {
      const productIds: number[] = products.map((product) => product.productId);

      const whereClause: Prisma.InventoryWhereInput = {
        warehouseId: Number(warehouseId),
        locationId: Number(locationId),
        productId: { in: productIds }
      };

      const selectClause: Prisma.InventorySelect = {
        productId: true,
        physicalQuantity: true
      };

      const productInventoryByLocation =
        await this.inventoryService.fetchInventoryProductsByWhere(
          whereClause,
          selectClause
        );

      // Convert into keyvalue pair based on id
      const productsById = convertIntoKeyValuePair(
        productInventoryByLocation,
        'productId'
      );

      updatedProducts = products.map((product) => {
        return {
          ...product,
          currentQuantity:
            productsById[product.productId]?.physicalQuantity || 0,
          actualQuantity:
            Number(product.differenceQuantity) +
            ((+productsById[product.productId]?.physicalQuantity as number) ||
              0)
        };
      });
    }
    return updatedProducts;
  }

  async addAdjustmentsInOpenSearch(): Promise<Adjustment[]> {
    let adjustments = await this.prisma.adjustment.findMany({
      include: {
        createdBy: {
          select: {
            name: true
          }
        },
        products: true
      }
    });
    adjustments = adjustments.map((adjustment: any) => {
      const { createdBy, ...adjustmentData } = adjustment;
      return {
        ...adjustmentData,
        createdBy: createdBy.name,
        type: TransferTypes.Adjustment,
        index: `${transfer.adjustment}${adjustment.id}`
      };
    });
    return adjustments;
  }

  async upsertAdjustmentInOpenSearch(id: number, isUpdateOperation = false) {
    const adjustment: any = await this.prisma.adjustment.findUnique({
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
    const { createdBy, ...adjustmentData } = adjustment;
    if (isUpdateOperation) {
      await this.openSearchService.updateDocumentById(
        TRANSFERS,
        {
          ...adjustmentData,
          createdBy: createdBy.name,
          type: TransferTypes.Adjustment,
          index: `${transfer.adjustment}${adjustment?.id}`
        },
        openSearchIndexKey.index
      );
      return;
    }
    await this.openSearchService.addDocumentById(
      TRANSFERS,
      {
        ...adjustment,
        createdBy: createdBy.name,
        type: TransferTypes.Adjustment,
        index: `${transfer.adjustment}${adjustment?.id}`
      },
      openSearchIndexKey.index
    );
  }

  private async fetchProductDumpLocation(
    productDumpLocation: CreateProductDumpLocation
  ): Promise<Location> {
    // Product dump location will hold all the intial count inventory in the warehouse. If the location
    // is not already there it will be created.

    const whereInput: Prisma.LocationWhereUniqueInput = {
      warehouseId_name: {
        warehouseId: productDumpLocation.warehouseId,
        name: DUMP_LOCATION
      }
    };

    // Fetch location by warehouseId and name
    let location = await this.locationService.getLocationByWhere(whereInput);

    // If location for product dump does not exist create one
    if (!location) {
      location =
        await this.locationService.createProductDumpLocationForWarehouse({
          country: productDumpLocation.country,
          businessUnitId: productDumpLocation.businessUnitId,
          warehouseId: productDumpLocation.warehouseId,
          createdById: productDumpLocation.createdById
        });
    }

    return location;
  }

  private async createNegativeInventoryMovementForInitialCount(
    productInventory: {
      locationId: number;
      productId: number;
      physicalQuantity: number;
    }[],
    adjustment: { id: number; createdById: number; reason: string }
  ) {
    const inventoryMovementPromise: PrismaPromise<InventoryMovement>[] = [];
    for (const product of productInventory) {
      const createInventoryMovement: InsertInventoryMovementDto = {
        locationId: product.locationId,
        createdById: adjustment.createdById,
        movementType: InventoryMovementType.ADJUSTMENT,
        referenceId: adjustment.id,
        reason: adjustment.reason,
        products: [
          {
            productId: product.productId,
            physicalQuantity: -product.physicalQuantity
          }
        ]
      };
      inventoryMovementPromise.push(
        ...(await this.inventoryMovementService.createInventoryMovementForAdjustment(
          createInventoryMovement
        ))
      );
    }
    return inventoryMovementPromise;
  }

  private async validateAdjustmentProductQuantity(
    warehouseId: number,
    products: AdjustmentProductRequest[],
    isInitialCount = false
  ) {
    const productsInventory: ValidateProductQuantity[] = [];
    if (isInitialCount) {
      products.forEach((product) => {
        productsInventory.push({
          id: product.productId,
          availableQuantity: product.actualQuantity
        });
      });
    } else {
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

      // Fetch product inventory from all available for sale location except fromLocation
      const availableForSaleProductInventory =
        await this.inventoryService.groupByInventoryProductsByWhere(
          whereClause,
          [Prisma.InventoryScalarFieldEnum.productId],
          { [Prisma.InventoryScalarFieldEnum.physicalQuantity]: true }
        );

      const productsByProductsId = convertIntoKeyValuePair(
        products,
        'productId'
      );
      availableForSaleProductInventory.forEach((product) => {
        const productData = productsByProductsId[product.productId];
        if (productData.differenceQuantity < 0) {
          productsInventory.push({
            id: product.productId,
            availableQuantity:
              (product._sum.physicalQuantity || 0) +
              productData.differenceQuantity
          });
        }
      });
    }
    if (productsInventory.length > 0) {
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
}

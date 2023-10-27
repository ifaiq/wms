import { Injectable } from '@nestjs/common';
import { Adjustment, AdjustmentProduct, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  convertIntoCustomKeyValuePair,
  convertIntoKeyValuePair
} from 'src/common';
import {
  REASON,
  BulkUploadAdjustmentFormat,
  DUMP_LOCATION
} from 'src/common/constants';
import { validateWarehouseId } from 'src/common/validators/bulk-upload-common-validators';
import { BadRequestExceptionBulkUpload } from 'src/errors/exceptions';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { AdjustmentService } from './adjustment.service';
import { BulkUploadAdjustmentRequest } from './dto';
import {
  validatePostingDate,
  validateSerialNumber,
  validateSkuCode,
  validateAdjustmentQuantity,
  validateLocationId,
  validateAdjustmentReason
} from './helper/bulk-upload-validation';
import { prepareBulkAdjustment } from './helper/helper';

@Injectable()
export class AdjustmentBulkUploadService {
  constructor(
    private prismaService: PrismaService,
    private fileUploadService: FileuploadService,
    private adjustmentService: AdjustmentService
  ) {}

  async insertAdjustmentInBulk(file: Express.Multer.File, userId: number) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      BulkUploadAdjustmentFormat
    );

    // Validate and fetch warehouseId
    const warehouseId = await this.fileUploadService.fetchWarehouseId(csvData);

    // Fetch country and businessUnitId
    const { countryCode, businessUnitId } =
      await this.fileUploadService.fetchBusinessUnitAndCountryCode(warehouseId);

    // Fetch locations by warehouseId
    const validLocationIds = await this.fileUploadService.fetchValidLocationIds(
      csvData,
      warehouseId
    );

    // Convert into keyvalue pair on id
    const validLocations = convertIntoKeyValuePair(validLocationIds, 'id');

    // Fetch adjustment reasons
    const adjustmentReasons = await this.prismaService.reason.findMany({
      where: { type: 'ADJUSTMENT' }
    });

    // Convert into keyvalue pair on id
    const reasonsObject = convertIntoKeyValuePair(adjustmentReasons, 'id');

    // Fetch INTIAL_COUNT reason data
    const initailCount = adjustmentReasons.find(
      (reason) => reason.reason === REASON.INITIAL_COUNT
    );

    // Fetch INTIAL_COUNT reason data
    const stagingLocation = validLocationIds.find(
      (location) => location.name === DUMP_LOCATION
    );

    // Fetch all products from inventory table by warehouse
    const validProductsInventoryTable =
      await this.fileUploadService.fetchProductsFromInventoryByWarehouse(
        warehouseId
      );

    // Convert into keyvalue pair on  product id and location id
    const validProductsInventoryTableObj = convertIntoCustomKeyValuePair(
      validProductsInventoryTable,
      ['productId', 'locationId']
    );

    // Fetch all products from appsearch by warehouse
    const validProductsAppSearch =
      await this.fileUploadService.fetchValidProducts(csvData, warehouseId);

    // Convert into keyvalue pair on sku
    const validProductsAppSearchObj = convertIntoKeyValuePair(
      validProductsAppSearch,
      'sku'
    );

    const validationData = {
      adjustments: {},
      countryCode,
      warehouseId,
      initailCountId: initailCount?.id,
      validLocations,
      reasonsObject,
      validProductsInventoryTableObj,
      validProductsAppSearchObj,
      stagingLocationId: stagingLocation?.id
    };
    const configs = this.getFileValidatorConfig();
    const errors = await this.fileUploadService.csvFileValidatorAdjustment(
      csvData,
      configs,
      validationData,
      'srnumber'
    );
    if (errors.length) {
      throw new BadRequestExceptionBulkUpload(errors);
    }

    const adjustments: BulkUploadAdjustmentRequest[] = prepareBulkAdjustment(
      csvData,
      countryCode,
      businessUnitId,
      warehouseId,
      validProductsAppSearchObj,
      validProductsInventoryTableObj,
      initailCount
    );

    const response = await this.createBulkAdjustments(adjustments, userId);
    return response;
  }

  private async createBulkAdjustments(
    adjustments: BulkUploadAdjustmentRequest[],
    userId: number
  ) {
    const updates: PrismaPromise<Adjustment | AdjustmentProduct>[] = [];
    adjustments.forEach((adjustment: BulkUploadAdjustmentRequest) => {
      delete adjustment?.serialNumber;
      updates.push(
        this.prismaService.adjustment.create({
          data: {
            ...adjustment,
            createdById: userId,
            products: {
              createMany: {
                data: adjustment.products,
                skipDuplicates: true
              }
            }
          }
        })
      );
    });
    const savedAdjustments = await this.prismaService.$transaction(updates);
    await Promise.all(
      savedAdjustments.map(
        async (adjustment: Adjustment | AdjustmentProduct) => {
          await this.adjustmentService.upsertAdjustmentInOpenSearch(
            adjustment.id
          );
        }
      )
    );
    return 'Adjustments uploaded successfully';
  }

  private getFileValidatorConfig() {
    return {
      [BulkUploadAdjustmentFormat.srnumber]: {
        validate: validateSerialNumber
      },
      [BulkUploadAdjustmentFormat.warehouseid]: {
        validate: validateWarehouseId
      },
      [BulkUploadAdjustmentFormat.locationid]: {
        validate: validateLocationId
      },
      [BulkUploadAdjustmentFormat.reasonid]: {
        validate: validateAdjustmentReason
      },
      [BulkUploadAdjustmentFormat.skucode]: {
        validate: validateSkuCode
      },
      [BulkUploadAdjustmentFormat.quantity]: {
        validate: validateAdjustmentQuantity
      },
      [BulkUploadAdjustmentFormat.postingdate]: {
        validate: validatePostingDate
      }
    };
  }
}

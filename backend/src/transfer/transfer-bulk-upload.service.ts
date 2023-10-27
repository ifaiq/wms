import { Injectable } from '@nestjs/common';
import { PrismaPromise, Transfer, TransferProduct } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  convertIntoCustomKeyValuePair,
  convertIntoKeyValuePair
} from 'src/common';
import { BulkUploadTransferFormat, REASON } from 'src/common/constants';
import { validateWarehouseId } from 'src/common/validators/bulk-upload-common-validators';

import { BadRequestExceptionBulkUpload } from 'src/errors/exceptions';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { BulkUploadTransferRequest } from './dto/request.dto';
import {
  validateFromLocationId,
  validateSerialNumber,
  validateSkuCode,
  validateToLocationId,
  validateTransferQuantity,
  validateTransferReason
} from './helper/transfer-bulk-upload-validation';
import { prepareBulkTransfer } from './helper/utils';
import { TransferService } from './transfer.service';

@Injectable()
export class TransferBulkUploadService {
  constructor(
    private prismaService: PrismaService,
    private fileUploadService: FileuploadService,
    private transferService: TransferService
  ) {}

  async insertTransfereInBulk(file: Express.Multer.File, userId: number) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      BulkUploadTransferFormat
    );

    // Validate and fetch warehouseId
    const warehouseId = await this.fileUploadService.fetchWarehouseId(csvData);

    // Fetch country and businessUnitId
    const { countryCode, businessUnitId } =
      await this.fileUploadService.fetchBusinessUnitAndCountryCode(warehouseId);

    // Fetch locations by location id
    const validFromLocationIds =
      await this.fileUploadService.fetchValidLocationIds(
        csvData,
        warehouseId,
        'fromlocationid'
      );

    // Convert into keyvalue pair on id
    const validFromLocations = convertIntoKeyValuePair(
      validFromLocationIds,
      'id'
    );

    // Fetch locations by location id
    const validToLocationIds =
      await this.fileUploadService.fetchValidLocationIds(
        csvData,
        warehouseId,
        'tolocationid'
      );

    // Convert into keyvalue pair on id
    const validToLocations = convertIntoKeyValuePair(validToLocationIds, 'id');

    // Fetch transfer reasons
    const transferReasons = await this.prismaService.reason.findMany({
      where: { type: 'TRANSFER' }
    });

    // Convert into keyvalue pair on id
    const reasonsObject = convertIntoKeyValuePair(transferReasons, 'id');

    // Fetch INTIAL_COUNT reason data
    const initailCount = transferReasons.find(
      (reason) => reason.reason === REASON.INITIAL_COUNT
    );

    // Fetch all products from inventory table by location ids
    const validProductsInventoryTable =
      await this.fileUploadService.fetchProductsFromInventoryByLocationIds(
        validFromLocationIds.map((location) => location.id)
      );

    // Convert into keyvalue pair on  product id and location id
    const validProducts = convertIntoCustomKeyValuePair(
      validProductsInventoryTable,
      ['productId', 'locationId']
    );

    // Fetch all products from appsearch by warehouse
    const validProductsAppSearchList =
      await this.fileUploadService.fetchValidProducts(csvData, warehouseId);

    // Convert into keyvalue pair on sku
    const validProductsAppSearch = convertIntoKeyValuePair(
      validProductsAppSearchList,
      'sku'
    );

    const validationData = {
      transfers: [],
      countryCode,
      warehouseId,
      validFromLocations,
      validToLocations,
      reasonsObject,
      validProducts,
      validProductsAppSearch,
      initailCountId: initailCount?.id
    };
    const configs = this.getFileValidatorConfig();
    const errors = await this.fileUploadService.csvFileValidatorTransfer(
      csvData,
      configs,
      validationData,
      'srnumber'
    );
    if (errors.length) {
      throw new BadRequestExceptionBulkUpload(errors);
    }

    const transfers: BulkUploadTransferRequest[] = prepareBulkTransfer(
      csvData,
      countryCode,
      businessUnitId,
      warehouseId,
      validProducts,
      validProductsAppSearch
    );

    const response = await this.createBulkTransfer(transfers, userId);
    return response;
  }

  private async createBulkTransfer(
    transfers: BulkUploadTransferRequest[],
    userId: number
  ) {
    const updates: PrismaPromise<Transfer | TransferProduct>[] = [];
    transfers.forEach((transfer: BulkUploadTransferRequest) => {
      delete transfer?.serialNumber;
      updates.push(
        this.prismaService.transfer.create({
          data: {
            ...transfer,
            createdById: userId,
            products: {
              createMany: {
                data: transfer.products,
                skipDuplicates: true
              }
            }
          }
        })
      );
    });
    const savedTransfers = await this.prismaService.$transaction(updates);
    await Promise.all(
      savedTransfers.map(async (transfer: Transfer | TransferProduct) => {
        await this.transferService.upsertTransferInOpenSearch(transfer.id);
      })
    );
    return 'Transfers uploaded successfully';
  }

  private getFileValidatorConfig() {
    return {
      [BulkUploadTransferFormat.srnumber]: {
        validate: validateSerialNumber
      },
      [BulkUploadTransferFormat.warehouseid]: {
        validate: validateWarehouseId
      },
      [BulkUploadTransferFormat.fromlocationid]: {
        validate: validateFromLocationId
      },
      [BulkUploadTransferFormat.tolocationid]: {
        validate: validateToLocationId
      },
      [BulkUploadTransferFormat.reasonid]: {
        validate: validateTransferReason
      },
      [BulkUploadTransferFormat.skucode]: {
        validate: validateSkuCode
      },
      [BulkUploadTransferFormat.transferstock]: {
        validate: validateTransferQuantity
      }
    };
  }
}

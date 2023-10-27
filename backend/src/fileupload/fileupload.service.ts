import { Prisma } from '@prisma/client';
import { S3Service } from './S3.service';
import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import isString from 'lodash.isstring';
import {
  BadRequestException,
  BadRequestExceptionBulkUpload,
  ValidationFailedException
} from '../errors/exceptions';
import { removeSpaces, toLowerCase } from './utils/helper';
import { fileAttachment, RFQFileDto } from './utils/types';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdjustmentFileDto,
  AdjustmentFileInitialDto
} from './dto/adjustment.fileupload.dto';
import { InventoryService } from 'src/inventory/inventory.service';
import { convertIntoKeyValuePair } from 'src/common';
import { MonolithService } from 'src/monolith/monolith.service';
import uniq from 'lodash.uniq';
import { AppsearchService } from 'src/appsearch/appsearch.service';
@Injectable()
export class FileuploadService {
  constructor(
    private s3Service: S3Service,
    private readonly prismaService: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly monolithService: MonolithService,
    private readonly appSearchService: AppsearchService
  ) {}

  async uploadAttachment(
    file: Express.Multer.File,
    id: number,
    tableName: string
  ) {
    if (!file) {
      // No attachment to insert in vendor for a new record
      throw new BadRequestException(`No attachment found`);
    }

    const oldAttachment: Array<fileAttachment | any> =
      ((await this.getAttachmentFromDb(id, tableName)) as fileAttachment[]) ||
      [];
    const deleteFilePromise: Promise<unknown> =
      this.deleteAttachmentByFieldName(oldAttachment, file.fieldname);
    const insertFilePromise: Promise<unknown> = this.insertFileToS3(
      file,
      tableName,
      id
    );

    const [uploadedFile, deletedFile] = await Promise.all([
      insertFilePromise,
      deleteFilePromise
    ]);

    let attachment: fileAttachment | null = null;
    if (uploadedFile) attachment = this.generateAttachment(file, uploadedFile);

    if (attachment) oldAttachment.push(attachment); // Adding new attachment to previous attachments

    const updatedPayload: { attachment: fileAttachment[] } = {
      attachment: oldAttachment
    };

    console.log(JSON.stringify({ uploadedFile, deletedFile, updatedPayload }));
    return { updatedPayload, path: attachment?.path };
  }

  async deleteAttachment(
    fieldName: string,
    id: number,
    userId: number,
    tableName: string
  ) {
    const oldAttachment: Array<fileAttachment | any> =
      ((await this.getAttachmentFromDb(id, tableName)) as fileAttachment[]) ||
      [];
    const deletedVendorAttachment: any = await this.deleteAttachmentByFieldName(
      oldAttachment,
      fieldName
    );
    if (deletedVendorAttachment) {
      const updatedPayload: any = { attachment: oldAttachment };
      console.log(JSON.stringify(deletedVendorAttachment)); //TODO: Replace this with a logging mechanism
      return updatedPayload;
    } else
      throw new ValidationFailedException([
        { property: 'No old attachment found in this field' }
      ]);
  }

  private async deleteAttachmentByFieldName(
    oldAttachment: Array<fileAttachment | any>,
    fieldName: string
  ) {
    const attachmentByFieldName = this.getAttachmentByFieldName(
      oldAttachment,
      fieldName
    );
    return attachmentByFieldName
      ? this.deleteFilesFromS3(attachmentByFieldName)
      : null;
  }

  private generateAttachment = (
    file: Express.Multer.File,
    uploadedFile: any
  ): fileAttachment => ({
    fieldName: file.fieldname,
    key: uploadedFile.Key,
    fileName: file.originalname,
    path: uploadedFile.Location
  });

  private async insertFileToS3(
    file: Express.Multer.File,
    tableName: string,
    id: number
  ) {
    const uuid = randomUUID();
    const keyValue = `${tableName}/${id}/${uuid}/${file.originalname}`;
    return this.s3Service.uploadFile(file, keyValue);
  }

  private async deleteFilesFromS3(attachment: fileAttachment) {
    const keyToDelete = [{ Key: attachment.key }];
    return this.s3Service.deleteFiles(keyToDelete);
  }

  private getAttachmentByFieldName(
    attachments: fileAttachment[],
    fieldName: string
  ) {
    if (!attachments) return null;
    const index = attachments.findIndex(
      (attachment: any) => attachment.fieldName === fieldName
    );
    return index < 0 ? null : attachments.splice(index, 1)[0]; // splice changes attachments array since it's by reference.
  }

  private async getAttachmentFromDb(id: number, tableName: string) {
    const query = Prisma.raw(
      `SELECT attachment FROM ${tableName} where id = ${id}`
    );
    const result: any = await this.prismaService.$queryRaw(query);
    return result[0].attachment as fileAttachment[];
  }

  parseCSVData<T extends { [key: string]: string }>(
    file: Express.Multer.File,
    fileFormat: T
  ) {
    const BufferData = file?.buffer;
    if (!BufferData)
      throw new ValidationFailedException([{ property: 'File not found' }]);
    const csvData = this.extractData(BufferData);
    this.checkFileFormat(csvData, fileFormat);
    return csvData;
  }

  private extractData(BufferData: Buffer) {
    return parse(BufferData, {
      columns: (header) =>
        header.map((column: string) => toLowerCase(removeSpaces(column))),
      skip_empty_lines: true
    });
  }

  private checkFileFormat<T extends { [key: string]: string }>(
    fileData: RFQFileDto[] | AdjustmentFileInitialDto[] | AdjustmentFileDto[],
    fileFormat: T
  ) {
    if (!fileData.length) {
      throw new ValidationFailedException([
        { property: 'Cannot process empty file' }
      ]);
    }

    const headers = fileData[0];
    const headersInFile: any = {}; //This will contain the headers that are present in the file

    for (const key in headers) {
      headersInFile[key] = key;
    }

    if (!(JSON.stringify(headersInFile) === JSON.stringify(fileFormat)))
      throw new ValidationFailedException([
        { property: 'File does not contain correct headers/columns' },
        {
          property: `Headers required: [${Object.keys(fileFormat)}],
          Headers found: [${Object.keys(headersInFile)}]`
        }
      ]);
  }

  async csvFileValidator(
    csvData: Record<string, any>[],
    configs: any,
    additionalData?: Record<string, unknown>,
    validationKey = ''
  ) {
    const defaultConfig = {
      validate: null
    };
    const errors: string[] = [];
    csvData.forEach((data, index) => {
      const rowNumber = index + 2;
      Object.entries(data).map(([headerName, value], index) => {
        const columnNumber = index + 1;
        let errorResponse = '';
        if (configs[headerName]) {
          const config = { ...defaultConfig, ...configs[headerName] };
          if (config.validate !== null) {
            errorResponse = config.validate(
              data[validationKey],
              rowNumber,
              columnNumber,
              value,
              additionalData
            );
          }
        }
        if (errorResponse && isString(errorResponse)) {
          errors.push(errorResponse);
        }
      });
    });
    return errors;
  }

  async validateProductsFromInventoryTable(
    appSearchProductList: object[],
    subLocationId: string | null
  ) {
    const whereClause: Prisma.InventoryWhereInput = {
      locationId: Number(subLocationId)
    };

    const selectClause: Prisma.InventorySelect = {
      productId: true,
      physicalQuantity: true
    };

    const inventoryProducts =
      await this.inventoryService.fetchInventoryProductsByWhere(
        whereClause,
        selectClause
      );

    // Convert into keyvalue pair based on id
    const inventoryProductObj = convertIntoKeyValuePair(
      inventoryProducts,
      'productId'
    );

    const validProductsArray: Array<object> = [];

    appSearchProductList.forEach((product: Record<string, any>) => {
      if (inventoryProductObj[product?.id.toString()])
        validProductsArray.push({
          ...product,
          currentQuantity: inventoryProductObj[product?.id]?.physicalQuantity
        });
    });

    if (!validProductsArray?.length)
      throw new BadRequestException(
        `No products found against Sub Location id: ${subLocationId}`
      );

    return validProductsArray;
  }

  async csvFileValidatorAdjustment(
    csvData: Record<string, any>[],
    configs: any,
    additionalData?: Record<string, unknown>,
    validationKey = ''
  ) {
    const defaultConfig = {
      validate: null
    };
    const errors: string[] = [];
    csvData.forEach((data, index) => {
      const rowNumber = index + 2;
      const reasonId = data.reasonid || null;
      const locationId = data.locationid || null;
      const skuCode = data.skucode || null;
      Object.entries(data).map(([headerName, value], index) => {
        const columnNumber = index + 1;
        let errorResponse = '';
        if (configs[headerName]) {
          const config = { ...defaultConfig, ...configs[headerName] };
          if (config.validate !== null) {
            errorResponse = config.validate(
              data[validationKey],
              rowNumber,
              columnNumber,
              value,
              additionalData,
              reasonId,
              locationId,
              skuCode
            );
          }
        }
        if (errorResponse && isString(errorResponse)) {
          errors.push(errorResponse);
        }
      });
    });
    return errors;
  }

  async fetchWarehouseId(csvData: any) {
    let warehouseId: number | undefined;
    for (const rowData of csvData) {
      if (rowData.warehouseid !== '' && isFinite(Number(rowData.warehouseid))) {
        const warehouse = await this.monolithService.GetLocationById(
          Number(rowData.warehouseid)
        );
        if (warehouse) {
          warehouseId = warehouse.id;
          break;
        }
      }
    }
    if (warehouseId) {
      return warehouseId;
    }
    throw new BadRequestExceptionBulkUpload([
      `WarehouseId is missing or invalid for every row`
    ]);
  }

  async fetchBusinessUnitAndCountryCode(warehouseId: number | undefined) {
    if (warehouseId) {
      const warehouse = await this.monolithService.GetLocationById(
        warehouseId,
        'businessUnitId'
      );
      const businessUnit = await this.monolithService.GetBusinessUnitById(
        Number(warehouse.businessUnitId),
        'countryCode'
      );
      if (warehouse && businessUnit) {
        return {
          businessUnitId: warehouse.businessUnitId,
          countryCode: businessUnit.countryCode
        };
      }
    }
    return { countryCode: '', businessUnitId: '' };
  }

  async fetchValidLocationIds(
    csvData: any,
    warehouseId: number,
    locationColumnName = 'locationid'
  ) {
    let validLocations: { id: number; disabled: boolean; name: string }[] = [];
    const ids: number[] = uniq(
      csvData.map((data: any) => {
        if (isFinite(Number(data[locationColumnName]))) {
          return Number(data[locationColumnName]);
        }
      })
    );

    if (ids.length) {
      validLocations = await this.prismaService.location.findMany({
        where: {
          id: { in: ids },
          warehouseId
        },
        select: { id: true, disabled: true, name: true }
      });
    }
    return validLocations;
  }

  async fetchProductsFromInventoryByWarehouse(warehouseId: number) {
    const whereClause: Prisma.InventoryWhereInput = {
      warehouseId: warehouseId
    };

    const selectClause: Prisma.InventorySelect = {
      productId: true,
      physicalQuantity: true,
      locationId: true
    };

    const inventoryProducts =
      await this.inventoryService.fetchInventoryProductsByWhere(
        whereClause,
        selectClause
      );

    return inventoryProducts;
  }

  async fetchProductsFromInventoryByLocationIds(locationIds: number[]) {
    const whereClause: Prisma.InventoryWhereInput = {
      locationId: { in: locationIds }
    };

    const selectClause: Prisma.InventorySelect = {
      productId: true,
      physicalQuantity: true,
      locationId: true
    };

    const inventoryProducts =
      await this.inventoryService.fetchInventoryProductsByWhere(
        whereClause,
        selectClause
      );

    return inventoryProducts;
  }

  async fetchValidProducts(csvData: any, warehouseId: number) {
    const validProducts = [];
    const skuCodes: string[] = uniq(
      csvData.map((data: any) => {
        if (data.skucode) {
          return data.skucode;
        }
      })
    );

    validProducts.push(
      ...(await this.appSearchService.searchProductBySkus(
        skuCodes,
        String(warehouseId)
      ))
    );
    return validProducts;
  }

  async csvFileValidatorTransfer(
    csvData: Record<string, any>[],
    configs: any,
    additionalData?: Record<string, unknown>,
    validationKey = ''
  ) {
    const defaultConfig = {
      validate: null
    };
    const errors: string[] = [];
    csvData.forEach((data, index) => {
      const rowNumber = index + 2;
      const fromLocationId = data.fromlocationid || null;
      const skuCode = data.skucode || null;
      const reasonId = data.reasonid || null;
      Object.entries(data).map(([headerName, value], index) => {
        const columnNumber = index + 1;
        let errorResponse = '';
        if (configs[headerName]) {
          const config = { ...defaultConfig, ...configs[headerName] };
          if (config.validate !== null) {
            errorResponse = config.validate(
              data[validationKey],
              rowNumber,
              columnNumber,
              value,
              additionalData,
              fromLocationId,
              skuCode,
              reasonId
            );
          }
        }
        if (errorResponse && isString(errorResponse)) {
          errors.push(errorResponse);
        }
      });
    });
    return errors;
  }
}

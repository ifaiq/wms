/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  Country,
  POStatus,
  PrismaPromise,
  PurchaseOrder,
  PurchaseOrderProduct,
  VendorStatus
} from '@prisma/client';
import isFinite from 'lodash.isfinite';
import isEmpty from 'lodash.isempty';
import isUndefined from 'lodash.isundefined';
import uniq from 'lodash.uniq';
import { AppsearchService } from 'src/appsearch/appsearch.service';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { MonolithService } from 'src/monolith/monolith.service';
import { PrismaService } from 'prisma/prisma.service';
import { PurchaseOrderService } from './purchase-order.service';
import {
  getPurchaseOrderBySerialNumber,
  getProductBySkuCode,
  getValidCurrencies
} from './utils/helper';
import {
  BulkUploadPurchaseOrderFormat,
  CURRENCY,
  PAYMENT
} from 'src/common/constants';
import {
  BulkUploadPurchaseOrderRequest,
  PurchaseOrderProductRequest
} from './dto';
import { POValidProducts, POValidationData } from './interface';
import {
  BadRequestException,
  BadRequestExceptionBulkUpload
} from 'src/errors/exceptions';

@Injectable()
export class BulkUploadService {
  constructor(
    private prisma: PrismaService,
    private monolithService: MonolithService,
    private fileUploadService: FileuploadService,
    private appSearchService: AppsearchService,
    private purchaseOrderService: PurchaseOrderService
  ) {}

  private validateSerialNumber(
    _srNumber: string,
    rowNumber: number,
    columnNumber: number,
    serialNumber: string,
    data: POValidationData
  ) {
    const purchaseOrder = getPurchaseOrderBySerialNumber(
      serialNumber,
      data.purchaseOrders
    );
    if (!purchaseOrder) {
      data.purchaseOrders.push({ serialNumber });
    }
    if (isEmpty(serialNumber)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SrNo is required`;
    }
    if (!isFinite(Number(serialNumber))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SrNo is not a natural number`;
    }
    if (Number(serialNumber) === 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SrNo should be greater than 0`;
    }
    if (Number(serialNumber) < 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SrNo is negative`;
    }
    return true;
  }

  private validateCurrency(
    serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    currency: string,
    data: POValidationData
  ) {
    const purchaseOrder = getPurchaseOrderBySerialNumber(
      serialNumber,
      data.purchaseOrders
    );
    const validateCurrencies = getValidCurrencies(data.countryCode);
    if (!purchaseOrder) return true;
    if (isEmpty(currency)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Currency is required`;
    }
    if (
      ![CURRENCY.PAK, CURRENCY.ARE, CURRENCY.SAUDI, CURRENCY.USD].includes(
        currency
      )
    ) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Currency does not match 'AED','PKR','SAR','USD'`;
    }
    if (!validateCurrencies.includes(currency)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Currency is not valid for this Country`;
    }
    if (isUndefined(purchaseOrder.currency)) {
      purchaseOrder.currency = currency;
    } else if (purchaseOrder?.currency !== currency) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Currency differ for the same PO`;
    }
    return true;
  }

  private validatePaymentType(
    serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    paymentType: string,
    data: POValidationData
  ) {
    const purchaseOrder = getPurchaseOrderBySerialNumber(
      serialNumber,
      data.purchaseOrders
    );
    if (!purchaseOrder) return true;
    if (isEmpty(paymentType)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentType is required`;
    }
    if (![PAYMENT.ADVANCE, PAYMENT.CREDIT].includes(paymentType)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentType does not match 'ADVANCE', 'CREDIT'`;
    }
    if (isUndefined(purchaseOrder.payment)) {
      purchaseOrder.payment = paymentType;
    } else if (purchaseOrder?.payment !== paymentType) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentType differ for the same PO`;
    }
    return true;
  }

  private validatePaymentDays(
    serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    paymentDays: string,
    data: POValidationData
  ) {
    const purchaseOrder = getPurchaseOrderBySerialNumber(
      serialNumber,
      data.purchaseOrders
    );
    if (!purchaseOrder) return true;
    if (isEmpty(paymentDays) && purchaseOrder.payment === PAYMENT.CREDIT) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentDays is required for PaymentType 'CREDIT'`;
    }
    if (!isFinite(Number(paymentDays))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentDays is not a natural number`;
    }
    if (Number(paymentDays) < 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentDays is negative`;
    }
    if (purchaseOrder.payment === PAYMENT.ADVANCE && !isEmpty(paymentDays)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentDays can not be added for PaymentType 'ADVANCE'`;
    }
    if (
      isUndefined(purchaseOrder.paymentDays) &&
      purchaseOrder.payment === PAYMENT.CREDIT
    ) {
      purchaseOrder.paymentDays = paymentDays;
    } else if (
      !isUndefined(purchaseOrder.paymentDays) &&
      purchaseOrder?.paymentDays !== paymentDays
    ) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PaymentDays differ for the same PO`;
    }
    return true;
  }

  private validateVendorId(
    serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    vendorId: string,
    data: POValidationData
  ) {
    const purchaseOrder = getPurchaseOrderBySerialNumber(
      serialNumber,
      data.purchaseOrders
    );
    if (!purchaseOrder) return true;
    if (isEmpty(vendorId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: VendorId is required`;
    }
    if (!isFinite(Number(vendorId))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: VendorId is not a natural number`;
    }
    if (!data.vendorIds.includes(Number(vendorId))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: VendorId is not valid`;
    }
    if (isUndefined(purchaseOrder.vendorId)) {
      purchaseOrder.vendorId = Number(vendorId);
    } else if (purchaseOrder?.vendorId !== Number(vendorId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: VendorId differ for the same PO`;
    }
    return true;
  }

  private validateWarehouseId(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    warehouseId: string,
    data: POValidationData
  ) {
    if (isEmpty(warehouseId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: WarehouseId is required`;
    }
    if (!data.warehouseId) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: WarehouseId is not valid`;
    }
    if (data.warehouseId !== Number(warehouseId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: WarehouseId differ for the same PO`;
    }
    return true;
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
      return `Row[${rowNumber}] x Col[${columnNumber}]: PO ${_serialNumber}, ${skuCode} is Deactivated`;
    }
    if (!product)
      return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not valid`;

    return true;
  }

  private validateQtyOrdered(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    quantityOrdered: string,
    data: POValidationData
  ) {
    if (isEmpty(quantityOrdered)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: QuantityOrdered is required`;
    }
    if (!isFinite(Number(quantityOrdered))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: QuantityOrdered is not a whole number`;
    }
    if (Number(quantityOrdered) < 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: QuantityOrdered is negative`;
    }
    return true;
  }

  private validatePricePerUnit(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    pricePerUnit: string,
    data: POValidationData
  ) {
    if (isEmpty(pricePerUnit)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PricePerUnit is required`;
    }
    if (!isFinite(Number(pricePerUnit))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PricePerUnit is not a valid number`;
    }
    if (Number(pricePerUnit) < 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: PricePerUnit is negative`;
    }
    return true;
  }

  private validateMrp(
    _serialNumber: string,
    rowNumber: number,
    columnNumber: number,
    mrp: string,
    data: POValidationData
  ) {
    if (isEmpty(mrp)) {
      return;
    }
    if (!isFinite(Number(mrp))) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: MRP is not a valid number`;
    }
    if (Number(mrp) < 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: MRP is negative`;
    }
    return true;
  }

  private async fetchBusinessUnitIdAndCountryCodeByLocationId(
    locationId: number
  ) {
    const location = await this.monolithService.GetLocationById(
      locationId,
      'businessUnitId'
    );
    const businessUnit = await this.monolithService.GetBusinessUnitById(
      Number(location.businessUnitId),
      'countryCode'
    );
    return {
      businessUnitId: location.businessUnitId,
      countryCode: businessUnit.countryCode
    };
  }

  private async getWarehouseId(csvData: any) {
    let locationId: number | undefined;
    let warehouseIds: any[] = [];
    csvData.forEach((data: any) => {
      if (data.warehouseid !== '' && isFinite(Number(data.warehouseid))) {
        warehouseIds.push(data.warehouseid);
      }
    });
    warehouseIds = uniq(warehouseIds);
    if (warehouseIds.length) {
      for (const warehouseId of warehouseIds) {
        const location = await this.monolithService.GetLocationById(
          Number(warehouseId)
        );
        if (location) {
          locationId = location.id;
          break;
        }
      }
    } else {
      throw new BadRequestException(`LocationId is missing or invalid`);
    }
    return locationId;
  }

  private async getValidVendorIds(csvData: any, country: Country) {
    let validVendorIds: number[] = [];
    const ids: number[] = uniq(
      csvData.map((data: any) => {
        if (isFinite(Number(data.vendorid))) {
          return Number(data.vendorid);
        }
      })
    );

    if (ids.length) {
      const vendorIds = await this.prisma.vendor.findMany({
        where: {
          id: { in: ids },
          status: VendorStatus.LOCKED,
          country
        },
        select: { id: true }
      });
      validVendorIds = vendorIds.map((vendorId) => vendorId.id);
    }
    return validVendorIds;
  }

  private async getBussinessUnitAndCountryCode(locationId: number | undefined) {
    if (locationId) {
      const { countryCode, businessUnitId } =
        await this.fetchBusinessUnitIdAndCountryCodeByLocationId(locationId);
      if (countryCode && businessUnitId) {
        return { countryCode, businessUnitId };
      }
    }
    return { countryCode: '', businessUnitId: '' };
  }

  private async getValidProducts(csvData: any, locationId: number | undefined) {
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
        String(locationId)
      ))
    );
    return validProducts;
  }

  private getFileValidatorConfig() {
    return {
      [BulkUploadPurchaseOrderFormat.srnumber]: {
        validate: this.validateSerialNumber
      },
      [BulkUploadPurchaseOrderFormat.warehouseid]: {
        validate: this.validateWarehouseId
      },
      [BulkUploadPurchaseOrderFormat.vendorid]: {
        validate: this.validateVendorId
      },
      [BulkUploadPurchaseOrderFormat.currency]: {
        validate: this.validateCurrency
      },
      [BulkUploadPurchaseOrderFormat.paymenttype]: {
        validate: this.validatePaymentType
      },
      [BulkUploadPurchaseOrderFormat.paymentdays]: {
        validate: this.validatePaymentDays
      },
      [BulkUploadPurchaseOrderFormat.skucode]: {
        validate: this.validateSkuCode
      },
      [BulkUploadPurchaseOrderFormat.quantityordered]: {
        validate: this.validateQtyOrdered
      },
      [BulkUploadPurchaseOrderFormat.priceperunit]: {
        validate: this.validatePricePerUnit
      },
      [BulkUploadPurchaseOrderFormat.mrp]: {
        validate: this.validateMrp
      }
    };
  }

  private async createPurchaseOrders(
    purchaseOrders: BulkUploadPurchaseOrderRequest[],
    userId: number
  ) {
    const updates: PrismaPromise<PurchaseOrder | PurchaseOrderProduct>[] = [];
    purchaseOrders.forEach((purchaseOrder: BulkUploadPurchaseOrderRequest) => {
      delete purchaseOrder?.serialNumber;
      updates.push(
        this.prisma.purchaseOrder.create({
          data: {
            ...purchaseOrder,
            purchaserId: userId,
            products: {
              createMany: {
                data: purchaseOrder.products,
                skipDuplicates: true
              }
            }
          }
        })
      );
    });
    await this.prisma.$transaction(updates);
    await this.purchaseOrderService.addPurchaseOrdersInOpenSearch();
    return 'Purchase Order uploaded successfully';
  }

  async insertPurchaseOrdersInBulk(file: Express.Multer.File, userId: number) {
    const csvData = this.fileUploadService.parseCSVData(
      file,
      BulkUploadPurchaseOrderFormat
    );

    const warehouseId = await this.getWarehouseId(csvData);
    const { countryCode, businessUnitId } =
      await this.getBussinessUnitAndCountryCode(warehouseId);
    const country = countryCode as Country;
    const vendorIds = await this.getValidVendorIds(csvData, country);
    const validProducts = await this.getValidProducts(csvData, warehouseId);

    const validationData = {
      purchaseOrders: [],
      countryCode,
      warehouseId,
      vendorIds,
      validProducts
    };
    const configs = this.getFileValidatorConfig();
    const errors = await this.fileUploadService.csvFileValidator(
      csvData,
      configs,
      validationData,
      'srnumber'
    );
    if (errors.length) {
      throw new BadRequestExceptionBulkUpload(errors);
    }

    const purchaseOrders: BulkUploadPurchaseOrderRequest[] =
      await this.preparePurchaseOrdersData(
        csvData,
        countryCode,
        businessUnitId,
        warehouseId,
        validProducts
      );

    const response = await this.createPurchaseOrders(purchaseOrders, userId);
    return response;
  }

  private async preparePurchaseOrdersData(
    csvData: any,
    countryCode: string | undefined,
    businessUnitId: string | undefined,
    warehouseId: number | undefined,
    validProducts: POValidProducts[]
  ) {
    const purchaseOrders: any[] = [];
    let purchaseOrder: Partial<BulkUploadPurchaseOrderRequest> = {};
    let purchaseOrderProduct: Partial<PurchaseOrderProductRequest>[] = [];
    for (const data of csvData) {
      const product: Partial<PurchaseOrderProductRequest> = {};
      const purchaseOrderIndex = purchaseOrders.findIndex(
        (purchaseOrder) => purchaseOrder.serialNumber === data.srnumber
      );
      if (
        (purchaseOrderIndex !== -1 &&
          purchaseOrders[purchaseOrderIndex].products.find(
            (product: Partial<PurchaseOrderProductRequest>) =>
              product.sku === data.skucode
          )) ||
        purchaseOrderProduct.find((product) => product.sku === data.sku)
      )
        continue;
      product.sku = data.skucode;
      product.quantity = Number(data.quantityordered);
      product.price = Number(data.priceperunit);
      product.mrp = Number(data.mrp);
      product.taxAmount = 0;
      product.subTotalWithTax = product.subTotalWithoutTax =
        product.price * product.quantity;
      purchaseOrderProduct.push(product);

      if (data.srnumber !== purchaseOrder.serialNumber) {
        if (purchaseOrderIndex !== -1) {
          const { totalWithTax, subTotalWithoutTax, totalTaxAmount } =
            this.calculatePurchaseOrderTotal(purchaseOrderProduct);
          purchaseOrders[purchaseOrderIndex].totalWithTax =
            purchaseOrders[purchaseOrderIndex].totalWithTax + totalWithTax;
          purchaseOrders[purchaseOrderIndex].subTotalWithoutTax =
            purchaseOrders[purchaseOrderIndex].subTotalWithoutTax +
            subTotalWithoutTax;
          purchaseOrders[purchaseOrderIndex].totalTaxAmount =
            purchaseOrders[purchaseOrderIndex].totalTaxAmount + totalTaxAmount;
          purchaseOrders[purchaseOrderIndex].products = [
            ...purchaseOrders[purchaseOrderIndex].products,
            ...purchaseOrderProduct
          ];
          purchaseOrderProduct = [];
          continue;
        }
        const { totalWithTax, subTotalWithoutTax, totalTaxAmount } =
          this.calculatePurchaseOrderTotal(purchaseOrderProduct);

        purchaseOrder.serialNumber = data.srnumber;
        purchaseOrder.country = countryCode as Country;
        purchaseOrder.businessUnitId = Number(businessUnitId);
        purchaseOrder.warehouseId = warehouseId;
        purchaseOrder.currency = data.currency;
        purchaseOrder.payment = data.paymenttype;
        purchaseOrder.paymentDays = data.paymentdays;
        purchaseOrder.vendorId = Number(data.vendorid);
        purchaseOrder.subTotalWithoutTax =
          (Number(purchaseOrder.subTotalWithoutTax) || 0) + subTotalWithoutTax;
        purchaseOrder.totalTaxAmount =
          (Number(purchaseOrder.totalTaxAmount) || 0) + totalTaxAmount;
        purchaseOrder.totalWithTax =
          (Number(purchaseOrder.totalWithTax) || 0) + totalWithTax;
        purchaseOrder.status = POStatus.IN_REVIEW;

        purchaseOrders.push({
          ...purchaseOrder,
          products: [...purchaseOrderProduct]
        });
        purchaseOrderProduct = [];
        purchaseOrder = {};
      }
    }
    this.updatePurchaseOrderProductData(purchaseOrders, validProducts);
    return purchaseOrders;
  }

  private calculatePurchaseOrderTotal(
    PurchaseOrderProducts: Partial<PurchaseOrderProductRequest>[]
  ) {
    let totalWithTax = 0;

    PurchaseOrderProducts.forEach((product) => {
      totalWithTax =
        totalWithTax + Number(product.price) * Number(product.quantity);
    });

    return {
      totalWithTax,
      subTotalWithoutTax: totalWithTax,
      totalTaxAmount: 0
    };
  }

  private async updatePurchaseOrderProductData(
    purchaseOrders: any,
    validProductList: Record<string, any>[]
  ) {
    const validProductKeyValuePair: any = {};
    validProductList.forEach((product) => {
      validProductKeyValuePair[product.sku] = product;
    });

    purchaseOrders.forEach((purchaseOrder: BulkUploadPurchaseOrderRequest) => {
      purchaseOrder.products.forEach(
        (product: { name: any; sku: string | number; productId: any }) => {
          product.name = validProductKeyValuePair[product.sku]?.name;
          product.productId = validProductKeyValuePair[product.sku]?.id;
        }
      );
    });
  }
}

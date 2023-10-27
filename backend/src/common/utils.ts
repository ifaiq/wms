import {
  AdjustmentProduct,
  PurchaseOrderProduct,
  TransferProduct
} from '.prisma/client';
import { ReceiptProduct, ReturnReceiptProduct } from '@prisma/client';
import { AdjustmentProductRequest } from 'src/adjustment/dto';
import {
  AdjustmentFileInitialDto,
  AdjustmentFileDto
} from 'src/fileupload/dto/adjustment.fileupload.dto';
import { RFQFileDto } from 'src/fileupload/utils/types';
import { PurchaseOrderProductRequest } from 'src/purchase-order/dto';
import {
  TransferFileDto,
  TransferProductRequest
} from 'src/transfer/dto/request.dto';
import { PURCHASEORDERS, TRANSFERS, TransferTypes } from './constants';

const classifyProducts = (
  products: (
    | PurchaseOrderProductRequest
    | AdjustmentProductRequest
    | TransferProductRequest
  )[],
  existingProducts?: (
    | PurchaseOrderProduct
    | AdjustmentProduct
    | TransferProduct
  )[]
) => {
  const updateProducts: (
    | PurchaseOrderProductRequest
    | AdjustmentProductRequest
    | TransferProductRequest
  )[] = [];
  const createProducts: (
    | PurchaseOrderProductRequest
    | AdjustmentProductRequest
    | TransferProductRequest
  )[] = [];
  const deleteProducts: number[] = [];

  products.forEach(
    (
      product:
        | PurchaseOrderProductRequest
        | AdjustmentProductRequest
        | TransferProductRequest
    ) => {
      if (
        existingProducts?.find(
          (
            existingProduct:
              | PurchaseOrderProduct
              | AdjustmentProduct
              | TransferProduct
          ) => existingProduct.productId === product.productId
        )
      ) {
        updateProducts.push(product);
      } else {
        createProducts.push(product);
      }
    }
  );

  existingProducts?.forEach(
    (
      existingProduct:
        | PurchaseOrderProduct
        | AdjustmentProduct
        | TransferProduct
    ) => {
      if (
        !products.find(
          (product) => product.productId === existingProduct.productId
        )
      ) {
        deleteProducts.push(existingProduct.productId);
      }
    }
  );

  return {
    createProducts,
    updateProducts,
    deleteProducts
  };
};

const fetchProductSkus = (products: any[]): string[] => {
  const productSkus: string[] = [];
  products.forEach((product) => {
    if (product?.sku) productSkus.push(product.sku);
  });
  return productSkus;
};

const convertIntoKeyValuePair = (
  items: any[],
  key: string
): Record<string, any> => {
  const keyValuePair: Record<string, any> = {};
  items.forEach((item) => {
    keyValuePair[item[key]] = item;
  });
  return keyValuePair;
};

const convertIntoCustomKeyValuePair = (
  items: any[],
  keys: string[]
): Record<string, any> => {
  const keyValuePair: Record<string, any> = {};
  items.forEach((item) => {
    let value = '';
    keys.forEach((key) => {
      value = value + item[key];
    });
    keyValuePair[value] = item;
  });
  return keyValuePair;
};

const filterProductsData = (
  filteredProducts: any,
  nonfilteredProducts:
    | RFQFileDto[]
    | AdjustmentFileInitialDto[]
    | AdjustmentFileDto[]
    | TransferFileDto[],
  objectPropertiesForCsv: string[] = [],
  objectPropertiesForAppsearch: string[] = []
) => {
  const validProducts: any[] = [];
  const invalidProducts: any[] = [];
  nonfilteredProducts.forEach((product: any) => {
    const productSku = product.sku;
    if (filteredProducts[productSku]) {
      const productObject: any = {
        id: filteredProducts[productSku].id,
        name: filteredProducts[productSku].name,
        sku: filteredProducts[productSku].sku,
        isDeactivated: filteredProducts[productSku].isDeactivated
      };

      // Properties value to be fetched from the csv file
      objectPropertiesForCsv.forEach((key) => {
        productObject[key] = product[key];
      });

      // Properties value to be fetched from the data returned from appsearchs
      objectPropertiesForAppsearch.forEach((key) => {
        productObject[key] = filteredProducts[productSku][key];
      });
      validProducts.push(productObject);
    } else {
      invalidProducts.push(product);
    }
  });

  return { validProducts, invalidProducts };
};

const subtractQtyFromProductList = (
  productList: Record<string, number>,
  receipts: { products: ReturnReceiptProduct[] }[]
) => {
  for (const receipt of receipts) {
    const { products } = receipt;
    for (const product of products) {
      productList[product.productId] =
        productList[product.productId] - product.quantityReturned;
    }
  }
};

const addQtyInProductList = (
  productList: Record<string, number>,
  receipts: { products: ReceiptProduct[] }[]
) => {
  for (const receipt of receipts) {
    const { products } = receipt;
    for (const product of products) {
      productList[product.productId] =
        (productList[product.productId] || 0) + product.quantityReceived;
    }
  }
};

const extractVendorFromFileName = (fileName: string) => {
  const splittedFileName = fileName.split('_');
  return {
    vendorName: splittedFileName[0],
    entity: splittedFileName[1].split('.')[0]
  };
};

const getSanitizedRequestBody = (
  requestBody: Record<string, string>,
  keys = ['password']
) => {
  keys.forEach((key) => {
    if (requestBody[key]) {
      const length = requestBody[key].length;
      requestBody[key] = '*'.repeat(length);
    }
  });
  return requestBody;
};

const createReferenceNumber = (id: number, type: string) => {
  const prefixReferenceNumber: Record<string, string> = {
    [PURCHASEORDERS]: 'P',
    [TransferTypes.GRN]: 'IN/',
    [TransferTypes.Return]: 'OUT/',
    [TransferTypes.Adjustment]: 'A',
    [TransferTypes.Transfer]: 'T',
    [TransferTypes.Return_In]: 'IN/'
  };

  return `${prefixReferenceNumber[type]}${String(id).padStart(5, '0')}`;
};

const attachReferenceNumber = (index: string, body: any) => {
  const response = { ...body };
  if ([PURCHASEORDERS, TRANSFERS].includes(index)) {
    response.referenceNumber = createReferenceNumber(
      response.id,
      index === PURCHASEORDERS ? PURCHASEORDERS : response.type
    );
  }
  return response;
};

export {
  classifyProducts,
  fetchProductSkus,
  convertIntoKeyValuePair,
  filterProductsData,
  subtractQtyFromProductList,
  addQtyInProductList,
  extractVendorFromFileName,
  getSanitizedRequestBody,
  createReferenceNumber,
  attachReferenceNumber,
  convertIntoCustomKeyValuePair
};

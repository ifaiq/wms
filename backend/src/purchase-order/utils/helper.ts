import * as ejs from 'ejs';
import { VALID_CURRENCY } from 'src/common/constants';
import { POValidProducts } from '../interface';

export type BatchPayload = {
  count: number;
};

/**
 * Function is responsible for redering HTML for PO
 * @param {Object} data
 * @returns {Object} response
 */
export const renderHtmlForPdf = async (data = {}, templatePath: string) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, { purchaseOrder: data }, (err, html) => {
      if (err) {
        reject(err);
      }
      resolve(html);
    });
  });
};

export const generateFormattedId = (
  id: any,
  prefixLength = 5,
  prefixCharacter = '0'
) => {
  const fId = !id ? '' : id.toString();
  const res = fId.padStart(prefixLength, prefixCharacter);
  return res;
};

export const getPurchaseOrderBySerialNumber = (
  serialNumber: string,
  purchaseOrders: Record<string, unknown>[]
) => {
  let purchaseOrderIndex;
  if (purchaseOrders.length) {
    purchaseOrderIndex = purchaseOrders?.findIndex(
      (purchaseOrder) => purchaseOrder.serialNumber === serialNumber
    );
  } else {
    purchaseOrderIndex = -1;
  }

  if (purchaseOrderIndex !== -1) {
    return purchaseOrders[purchaseOrderIndex];
  }
  return false;
};

export const getProductBySkuCode = (
  skuCode: string,
  validProducts: POValidProducts[]
) => {
  const productIndex = validProducts.findIndex(
    (product) => product.sku === skuCode
  );
  if (productIndex !== -1) {
    return validProducts[productIndex];
  }
  return false;
};

export const getValidCurrencies = (countryCode: string) => {
  return VALID_CURRENCY[countryCode];
};

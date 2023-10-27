import { Country, TransferStatus } from '@prisma/client';
import {
  BulkUploadTransferRequest,
  TransferProductRequest
} from '../dto/request.dto';

const getProductBySkuCode = (skuCode: string, validProducts: any[]) => {
  const productIndex = validProducts.findIndex(
    (product) => product.sku === skuCode
  );
  if (productIndex !== -1) {
    return validProducts[productIndex];
  }
  return false;
};

const fetchTransferBySerialNumber = (
  serialNumber: string,
  transfers: Record<string, any>
) => {
  if (transfers[serialNumber]) {
    return transfers[serialNumber];
  }
  return false;
};

const prepareBulkTransfer = (
  csvData: any,
  countryCode: string | undefined,
  businessUnitId: string | undefined,
  warehouseId: number | undefined,
  validProducts: Record<string, any>,
  validProductsAppSearch: Record<string, any>
) => {
  const transfers: any[] = [];
  let transfer: Partial<BulkUploadTransferRequest> = {};
  let transferProduct: Partial<TransferProductRequest>[] = [];
  for (const data of csvData) {
    const product: Partial<TransferProductRequest> = {};
    const transferIndex = transfers.findIndex(
      (transfer) => transfer.serialNumber === data.srnumber
    );
    if (
      (transferIndex !== -1 &&
        transfers[transferIndex].products.find(
          (product: Partial<TransferProductRequest>) =>
            product.sku === data.skucode
        )) ||
      transferProduct.find((product) => product.sku === data.sku)
    )
      continue;

    const productDataInAppSearch = validProductsAppSearch[data.skucode];
    const currentProduct =
      validProducts[`${productDataInAppSearch.id}${data.fromlocationid}`];
    product.sku = data.skucode;
    product.productId = currentProduct.productId;
    product.name = productDataInAppSearch.name;
    product.physicalQuantity = currentProduct.physicalQuantity;
    product.transferQuantity = Number(data.transferstock);
    transferProduct.push(product);

    if (data.srnumber !== transfer.serialNumber) {
      if (transferIndex !== -1) {
        transfers[transferIndex].products = [
          ...transfers[transferIndex].products,
          ...transferProduct
        ];
        transferProduct = [];
        continue;
      }

      transfer.serialNumber = data.srnumber;
      transfer.country = countryCode as Country;
      transfer.businessUnitId = Number(businessUnitId);
      transfer.warehouseId = warehouseId;
      transfer.reasonId = Number(data.reasonid);
      transfer.reasonValue = data.reasoncomment;
      transfer.status = TransferStatus.READY;
      transfer.toLocationId = Number(data.tolocationid);
      transfer.fromLocationId = Number(data.fromlocationid);
      transfers.push({
        ...transfer,
        products: [...transferProduct]
      });
      transferProduct = [];
      transfer = {};
    }
  }
  return transfers;
};

export {
  getProductBySkuCode,
  fetchTransferBySerialNumber,
  prepareBulkTransfer
};

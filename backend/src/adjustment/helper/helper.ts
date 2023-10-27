import { AdjustmentStatus, Country, Reason } from '@prisma/client';
import { AdjustmentProductRequest, BulkUploadAdjustmentRequest } from '../dto';

const fetchAdjustmentBySerialNumber = (
  serialNumber: string,
  adjustments: Record<string, any>
) => {
  if (adjustments[serialNumber]) {
    return adjustments[serialNumber];
  }
  return false;
};

const prepareBulkAdjustment = (
  csvData: any,
  countryCode: string | undefined,
  businessUnitId: string | undefined,
  warehouseId: number | undefined,
  validProductsAppSearch: Record<string, any>,
  validProductsInventoryTable: Record<string, any>,
  initialCount: Reason | undefined
) => {
  const adjustments: any[] = [];
  let adjustment: Partial<BulkUploadAdjustmentRequest> = {};
  let adjustmentProduct: Partial<AdjustmentProductRequest>[] = [];
  for (const data of csvData) {
    const product: Partial<AdjustmentProductRequest> = {};
    const isInitialCount = initialCount?.id === Number(data.reasonid);
    const adjustmentIndex = adjustments.findIndex(
      (adjustment) => adjustment.serialNumber === data.srnumber
    );
    if (
      (adjustmentIndex !== -1 &&
        adjustments[adjustmentIndex].products.find(
          (product: Partial<AdjustmentProductRequest>) =>
            product.sku === data.skucode
        )) ||
      adjustmentProduct.find((product) => product.sku === data.sku)
    )
      continue;

    const currentProduct = validProductsAppSearch[data.skucode];
    product.sku = data.skucode;
    product.productId = currentProduct.id;
    product.name = currentProduct.name;
    if (isInitialCount) {
      product.actualQuantity = Number(data.quantity);
      product.differenceQuantity =
        Number(data.quantity) - Number(currentProduct.currentQuantity);
    } else {
      product.differenceQuantity = Number(data.quantity);
      product.actualQuantity =
        validProductsInventoryTable[`${product.productId}${data.locationid}`]
          .physicalQuantity + Number(data.quantity);
    }
    adjustmentProduct.push(product);

    if (data.srnumber !== adjustment.serialNumber) {
      if (adjustmentIndex !== -1) {
        adjustments[adjustmentIndex].products = [
          ...adjustments[adjustmentIndex].products,
          ...adjustmentProduct
        ];
        adjustmentProduct = [];
        continue;
      }

      adjustment.serialNumber = data.srnumber;
      adjustment.country = countryCode as Country;
      adjustment.businessUnitId = Number(businessUnitId);
      adjustment.warehouseId = warehouseId;
      if (!isInitialCount) {
        adjustment.locationId = Number(data.locationid);
        adjustment.postingPeriod = new Date(data.postingdate);
      }
      adjustment.reasonId = Number(data.reasonid);
      adjustment.reasonValue = data.reasoncomment;
      adjustment.status = AdjustmentStatus.READY;
      adjustments.push({
        ...adjustment,
        products: [...adjustmentProduct]
      });
      adjustmentProduct = [];
      adjustment = {};
    }
  }
  return adjustments;
};

export { fetchAdjustmentBySerialNumber, prepareBulkAdjustment };

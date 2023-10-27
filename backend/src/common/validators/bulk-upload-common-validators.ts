import isEmpty from 'lodash.isempty';
import { IAdjustmentValidationData } from 'src/adjustment/interface';
import { ITransferValidationData } from 'src/transfer/interface';

const validateWarehouseId = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  warehouseId: string,
  data: IAdjustmentValidationData
) => {
  if (isEmpty(warehouseId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: WarehouseId is required`;
  }
  if (!data.warehouseId) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: WarehouseId is not valid`;
  }
  if (data.warehouseId !== Number(warehouseId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: WarehouseId should be same for each row`;
  }
  return true;
};

const validateLocationId = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  locationId: string,
  data: IAdjustmentValidationData,
  reasonId: string
) => {
  if (Number(reasonId) === data.initailCountId) {
    return true;
  }
  if (isEmpty(locationId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: LocationId is required`;
  }
  if (!data.validLocations[locationId]) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: LocationId is not valid`;
  }
  return true;
};

const validateQuantity = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  quantity: string
) => {
  if (isEmpty(quantity)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity is required`;
  }
  if (!isFinite(Number(quantity))) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity is not a whole number`;
  }
  return true;
};

const validateReason = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  reasonId: number,
  data: IAdjustmentValidationData | ITransferValidationData
) => {
  if (isEmpty(reasonId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: ReasonId is required`;
  }
  if (!data.reasonsObject[reasonId]) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: ReasonId is not valid`;
  }
  return true;
};

export {
  validateWarehouseId,
  validateLocationId,
  validateQuantity,
  validateReason
};

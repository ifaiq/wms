import isEmpty from 'lodash.isempty';
import { DUMP_LOCATION } from 'src/common/constants';
import { ITransferValidationData } from '../interface';
import { fetchTransferBySerialNumber } from './utils';

const validateSerialNumber = (
  _srNumber: string,
  rowNumber: number,
  columnNumber: number,
  serialNumber: string,
  data: ITransferValidationData
) => {
  const transfer = fetchTransferBySerialNumber(serialNumber, data.transfers);
  if (!transfer) {
    data.transfers[_srNumber] = {
      fromLocationId: null,
      reasonId: null,
      toLocationId: null
    };
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
};

const validateSkuCode = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  skuCode: string,
  data: ITransferValidationData,
  fromLocationId: string
) => {
  if (data.transfers[_serialNumber].fromLocationId) {
    if (
      data.transfers[_serialNumber].fromLocationId !== Number(fromLocationId)
    ) {
      return false;
    }
  }
  if (data.validFromLocations[fromLocationId]?.disabled) {
    return true;
  }
  if (isEmpty(skuCode)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is required`;
  }
  const productDataInAppSearch = data.validProductsAppSearch[skuCode];
  if (!productDataInAppSearch) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not valid`;
  } else {
    const productId = productDataInAppSearch.id;
    if (!data.validProducts[`${productId}${fromLocationId}`]) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not available at this location`;
    }
  }
  return true;
};

const validateFromLocationId = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  locationId: string,
  data: ITransferValidationData,
  fromLocationId: string,
  skuCode: string,
  reasonId: string
) => {
  if (data.transfers[_serialNumber]?.fromLocationId) {
    if (data.transfers[_serialNumber]?.fromLocationId !== Number(locationId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: From Location Id should be consistent for Sr Number ${_serialNumber}`;
    }
    return true;
  }
  if (isEmpty(locationId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: From Location Id is required`;
  }
  if (!data.validFromLocations[locationId]) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: From Location Id is not valid`;
  }
  if (data.validFromLocations[locationId]?.disabled) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: From Location Id is a disabled location`;
  }
  if (Number(reasonId) === data.initailCountId) {
    if (data.validFromLocations[locationId]?.name !== DUMP_LOCATION) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: From Location Id should be of Staging Location incase of INITIAL_COUNT Reason`;
    }
  } else {
    if (data.validFromLocations[locationId]?.name === DUMP_LOCATION) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Staging Location can only be used incase of INITIAL_COUNT Reason`;
    }
  }
  data.transfers[_serialNumber].fromLocationId = Number(locationId);
  return true;
};

const validateToLocationId = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  locationId: string,
  data: ITransferValidationData,
  fromLocationId: string
) => {
  if (data.transfers[_serialNumber]?.toLocationId) {
    if (data.transfers[_serialNumber]?.toLocationId !== Number(locationId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: To Location Id should be consistent for Sr Number ${_serialNumber}`;
    }
    return true;
  }
  if (isEmpty(locationId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: To Location Id is required`;
  }
  if (!data.validToLocations[locationId]) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: To Location Id is not valid`;
  }
  if (Number(fromLocationId) === Number(locationId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: From Location Id and To Location Id cannot be same`;
  }
  if (data.validToLocations[locationId]?.disabled) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: To Location Id is a disabled location`;
  }
  data.transfers[_serialNumber].toLocationId = Number(locationId);
  return true;
};

const validateTransferQuantity = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  quantity: string,
  data: ITransferValidationData,
  fromLocationId: string,
  skuCode: string
) => {
  if (data.transfers[_serialNumber].fromLocationId) {
    if (
      data.transfers[_serialNumber].fromLocationId !== Number(fromLocationId)
    ) {
      return false;
    }
  }
  if (isEmpty(quantity)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity is required`;
  }
  if (!isFinite(Number(quantity))) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity is not a whole number`;
  }
  if (Number(quantity) < 1) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Transfer quantity can not be less than 1`;
  }
  if (data.validProductsAppSearch[skuCode]) {
    const { id } = data.validProductsAppSearch[skuCode];
    if (
      Number(quantity) >
      data.validProducts[`${id}${fromLocationId}`]?.physicalQuantity
    ) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Transfer quantity can not be greater than acutal quantity available in that location`;
    }
  }

  return true;
};

const validateTransferReason = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  reasonId: number,
  data: ITransferValidationData
) => {
  if (data.transfers[_serialNumber]?.reasonId) {
    if (data.transfers[_serialNumber]?.reasonId !== Number(reasonId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Reason Id should be consistent for Sr Number ${_serialNumber}`;
    }
    return true;
  }
  if (isEmpty(reasonId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Reason Id is required`;
  }
  if (!data.reasonsObject[reasonId]) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Reason Id is not valid`;
  }
  data.transfers[_serialNumber].reasonId = Number(reasonId);
  return true;
};

export {
  validateSerialNumber,
  validateSkuCode,
  validateFromLocationId,
  validateToLocationId,
  validateTransferQuantity,
  validateTransferReason
};

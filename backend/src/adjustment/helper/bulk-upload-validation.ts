import { fetchAdjustmentBySerialNumber } from './helper';
import { IAdjustmentValidationData } from '../interface/index';
import isEmpty from 'lodash.isempty';
import { isValidDate } from 'src/common/validators';

const validateSerialNumber = (
  _srNumber: string,
  rowNumber: number,
  columnNumber: number,
  serialNumber: string,
  data: IAdjustmentValidationData
) => {
  const adjustment = fetchAdjustmentBySerialNumber(
    serialNumber,
    data.adjustments
  );
  if (!adjustment) {
    data.adjustments[_srNumber] = {
      locationId: null,
      reasonId: null
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
  data: IAdjustmentValidationData,
  reasonId: string,
  locationId: string
) => {
  if (data.adjustments[_serialNumber].locationId) {
    if (data.adjustments[_serialNumber].locationId !== Number(locationId)) {
      return false;
    }
  }
  if (isEmpty(skuCode)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is required`;
  }
  const productDataInAppSearch = data.validProductsAppSearchObj[skuCode];
  if (!productDataInAppSearch) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not valid`;
  } else {
    const productId = productDataInAppSearch.id;
    if (Number(reasonId) !== data.initailCountId) {
      if (
        !data.validProductsInventoryTableObj[`${productId}${locationId}`] ||
        data.validProductsInventoryTableObj[`${productId}${locationId}`]
          .locationId !== Number(locationId)
      ) {
        return `Row[${rowNumber}] x Col[${columnNumber}]: SkuCode is not available at this location`;
      }
    }
  }
  return true;
};

const validatePostingDate = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  postingdate: string,
  data: IAdjustmentValidationData,
  reasonId: string
) => {
  if (Number(reasonId) === data.initailCountId) {
    return true;
  }
  if (isNaN(new Date(postingdate).getTime()) || !isValidDate(postingdate)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Posting date does not conform with date format: YYYY-MM-DD`;
  }
  return true;
};

const validateAdjustmentQuantity = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  quantity: string,
  data: IAdjustmentValidationData,
  reasonId: string,
  locationId: string,
  skuCode: string
) => {
  if (data.adjustments[_serialNumber].locationId) {
    if (data.adjustments[_serialNumber].locationId !== Number(locationId)) {
      return false;
    }
  }
  if (data.adjustments[_serialNumber].reasonId) {
    if (data.adjustments[_serialNumber].reasonId !== Number(reasonId)) {
      return false;
    }
  }
  if (data.validLocations[locationId]?.disabled) {
    return true;
  }
  if (isEmpty(quantity)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity is required`;
  }
  if (!isFinite(Number(quantity))) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity is not a whole number`;
  }
  if (Number(reasonId) === data.initailCountId) {
    if (Number(quantity) < 0) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Quantity can not be negative when passing adjustment with INITIAL_COUNT reason`;
    }
  } else {
    if (data.validProductsAppSearchObj[skuCode]) {
      const { id } = data.validProductsAppSearchObj[skuCode];
      if (
        Number(quantity) <
        -data.validProductsInventoryTableObj[`${id}${locationId}`]
          ?.physicalQuantity
      ) {
        return `Row[${rowNumber}] x Col[${columnNumber}]: Difference quantity cannot have negative value greater than actual quantity available in that location`;
      }
    }
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
  if (data.adjustments[_serialNumber]?.locationId) {
    if (data.adjustments[_serialNumber]?.locationId !== Number(locationId)) {
      return `Row[${rowNumber}] x Col[${columnNumber}]: Location Id should be consistent for Sr Number ${_serialNumber}`;
    }
    return true;
  }
  if (Number(reasonId) === data.initailCountId) {
    return true;
  }
  if (isEmpty(locationId)) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Location Id is required`;
  }
  if (!data.validLocations[locationId]) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Location Id is not valid`;
  }
  if (data.validLocations[locationId]?.disabled) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Location Id is a disabled location`;
  }
  if (Number(locationId) === data.stagingLocationId) {
    return `Row[${rowNumber}] x Col[${columnNumber}]: Staging Location can not be used to create adjustment`;
  }
  data.adjustments[_serialNumber].locationId = Number(locationId);
  return true;
};

const validateAdjustmentReason = (
  _serialNumber: string,
  rowNumber: number,
  columnNumber: number,
  reasonId: number,
  data: IAdjustmentValidationData
) => {
  if (data.adjustments[_serialNumber]?.reasonId) {
    if (data.adjustments[_serialNumber]?.reasonId !== Number(reasonId)) {
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
  data.adjustments[_serialNumber].reasonId = Number(reasonId);
  return true;
};

export {
  validateSerialNumber,
  validateSkuCode,
  validatePostingDate,
  validateAdjustmentQuantity,
  validateLocationId,
  validateAdjustmentReason
};

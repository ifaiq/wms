import { createSelector } from 'reselect';
import get from 'lodash.get';
import omit from 'lodash.omit';
import { getUserId } from './auth';
import { ADJUSTMENT_STATUS, REASON } from 'src/constants/adjustment';
import { getSearchedProducts } from '../entities/product';
import { getIsUserAllowed } from '../features/auth';
import { Permission } from 'src/constants/auth';

const adjustmentFeatureSelector = (state: TReduxState) =>
  state.features.adjustment;

export const getAdjustmentData = createSelector(
  adjustmentFeatureSelector,
  (adjustment) => get(adjustment, 'data', {})
);

export const getAdjustmentId = createSelector(getAdjustmentData, (data) =>
  get(data, 'id')
);

export const getAdjustCountryName = createSelector(getAdjustmentData, (data) =>
  get(data, 'country', null)
);

export const getAdjustUserData = createSelector(getAdjustmentData, (data) =>
  get(data, 'createdBy', {})
);

export const getAdjustUserEmail = createSelector(getAdjustUserData, (user) =>
  get(user, 'email', null)
);

export const getAdjustmentBUId = createSelector(getAdjustmentData, (data) =>
  get(data, 'businessUnitId', null)
);

export const getAdjustBUData = createSelector(getAdjustmentData, (data) =>
  get(data, 'businessUnit', {})
);

export const getAdjustBUName = createSelector(getAdjustBUData, (bu) =>
  get(bu, 'name', null)
);

export const getAdjustWarehouseId = createSelector(getAdjustmentData, (data) =>
  get(data, 'warehouseId', null)
);

export const getIsWarehouseSelected = createSelector(
  getAdjustWarehouseId,
  (warehouseId) => (warehouseId ? true : false)
);

export const getAdjustWarehouseData = createSelector(
  getAdjustmentData,
  (data) => get(data, 'warehouse', {})
);

export const getAdjustWarehouseName = createSelector(
  getAdjustWarehouseData,
  (location) => get(location, 'name', null)
);

export const getAdjustCreationDate = createSelector(getAdjustmentData, (data) =>
  get(data, 'createdAt', null)
);

export const getAdjustConfirmationDate = createSelector(
  getAdjustmentData,
  (data) => get(data, 'confirmedAt', null)
);

export const getAdjustmentProducts = createSelector(
  getAdjustmentData,
  (data) => {
    const products: [] = get(data, 'products', []);
    return (
      products?.map((product: TObject, key: number) => ({ ...product, key })) ||
      []
    );
  }
);

export const getAdjustmentProductIds = createSelector(
  getAdjustmentData,
  (data) => {
    const products: [] = get(data, 'products', []);
    // extract ids and return new array of ids
    return products.map(
      (product: TObject) => product?.productId || product?.id
    );
  }
);

export const getAdjustmentFilteredProducts = createSelector(
  getAdjustmentProductIds,
  getSearchedProducts,
  (productIds, products) => {
    const filteredProducts = products.filter(
      (product: TObject) =>
        !productIds.includes(product?.productId || product?.id)
    );

    return filteredProducts;
  }
);

export const getAdjustProductsLength = createSelector(
  getAdjustmentProducts,
  (products) => products.length
);

export const getAdjustPostingPeriod = createSelector(
  getAdjustmentData,
  (data) => get(data, 'postingPeriod', null)
);

export const getAdjustReqPayload = (state: TReduxState) => {
  const userId = getUserId(state);
  let adjustmentData = getAdjustmentData(state);
  const products = getAdjustmentProducts(state);
  const updatedProducts: TArrayOfObjects = [];

  products?.forEach((item: TObject) => {
    if (!item.name || !item.sku) return;
    updatedProducts.push({
      sku: item.sku,
      name: item.name,
      actualQuantity: parseInt(item.actualQuantity),
      differenceQuantity: parseInt(item.differenceQuantity),
      productId: item?.productId ? item?.productId : item.id
    });
  });

  if (adjustmentData.id) {
    adjustmentData = omit(adjustmentData, [
      'status',
      'businessUnit',
      'reason',
      'user',
      'warehouse',
      'reason',
      'createdAt',
      'updatedAt',
      'confirmedAt',
      'createdBy',
      'createdById'
    ]);
  }

  if (!adjustmentData?.id) {
    adjustmentData = { ...adjustmentData, createdById: userId };
  }

  if (!adjustmentData?.reasonValue) {
    adjustmentData = omit(adjustmentData, ['reasonValue']);
  }

  return { ...adjustmentData, products: updatedProducts };
};

export const getIsAdjustProductsValid = createSelector(
  getAdjustmentProducts,
  (products) => {
    let isValid = true;

    for (const item of products) {
      if (item.differenceQuantity === 0) {
        isValid = false;
        break;
      }
    }

    return isValid;
  }
);

export const getAdjustmentReasons = createSelector(
  adjustmentFeatureSelector,
  (adjustment) => {
    const reasons = get(adjustment, 'reasons', []);
    return reasons.map(({ id, reason }) => ({ id, name: reason })) || [];
  }
);

export const getAdjustReasonId = createSelector(getAdjustmentData, (data) =>
  get(data, 'reasonId', null)
);

export const getAdjustReasonValue = createSelector(getAdjustmentData, (data) =>
  get(data, 'reasonValue', null)
);

export const getAdjustReasonData = createSelector(getAdjustmentData, (data) =>
  get(data, 'reason', {})
);

export const getAdjustReasonText = createSelector(
  getAdjustReasonId,
  getAdjustmentReasons,
  (reasonId, reasons) => reasons.find(({ id }) => id === reasonId)?.name || ''
);

export const getAdjustReason = createSelector(
  getAdjustReasonText,
  getAdjustReasonData,
  (reasonText, reasonData) => {
    if (reasonText) return reasonText;
    return reasonData?.reason;
  }
);

export const getAdjustmentStatus = createSelector(getAdjustmentData, (data) =>
  get(data, 'status', ADJUSTMENT_STATUS.READY)
);

export const getisAdjustFinalised = createSelector(
  getAdjustmentStatus,
  (status) => status !== ADJUSTMENT_STATUS.READY
);

export const getIsEditAdjustmentState = createSelector(
  adjustmentFeatureSelector,
  (adjustment) => get(adjustment, 'isEdit', false)
);

export const getAdjustmentHeaders = createSelector(
  getAdjustmentData,
  (data) => {
    const { status } = data;

    if (status === ADJUSTMENT_STATUS.READY) return 'edit';
    if (status === ADJUSTMENT_STATUS.DONE) return 'confimed';
    if (status === ADJUSTMENT_STATUS.CANCELLED) return 'cancelled';

    return 'title';
  }
);

export const getIsCreateAdjustAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_ADJUSTMENT]);

export const getIsEditAdjustAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_ADJUSTMENT]);

export const getIsCancelAdjustAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CANCEL_ADJUSTMENT]);

export const getIsConfirmAdjustAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CONFIRM_ADJUSTMENT]);

export const getAdjustLocationId = createSelector(getAdjustmentData, (data) =>
  get(data, 'locationId', null)
);

export const getAdjustLocationName = createSelector(
  getAdjustmentData,
  (data) => get(data, 'location', null)?.name
);

export const getIsSubLocationIdSelected = createSelector(
  getAdjustLocationId,
  (subLocationId) => (subLocationId ? true : false)
);

export const getIsReasonInitialCount = createSelector(
  getAdjustmentId,
  getAdjustReasonData,
  getAdjustmentReasons,
  getAdjustReasonId,
  (id, reasonObj, reasons, reasonId) => {
    if (!id) {
      let initCountId;

      for (const reason of reasons) {
        if (reason.name === REASON.INITIAL_COUNT) {
          initCountId = reason.id;
          break;
        }
      }

      return reasonId === initCountId;
    }

    return reasonObj?.reason === REASON.INITIAL_COUNT;
  }
);

export const getIsProductsEditAllowed = createSelector(
  getIsWarehouseSelected,
  getIsSubLocationIdSelected,
  (isWarehouseSelected, isSublocationSelected) =>
    isWarehouseSelected || isSublocationSelected
);

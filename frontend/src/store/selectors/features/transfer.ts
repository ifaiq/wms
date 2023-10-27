import { createSelector } from 'reselect';
import get from 'lodash.get';
import omit from 'lodash.omit';
import { getUserId, getIsUserAllowed } from './auth';
import { TRANSFER_STATUS } from 'src/constants/transfers';
import { getSearchedProducts } from '../entities/product';
import { Permission } from 'src/constants/auth';
import { REASON } from 'src/constants/adjustment';

const transferFeatureSelector = (state: TReduxState) => state.features.transfer;

export const getTransferData = createSelector(
  transferFeatureSelector,
  (transfer) => get(transfer, 'data', {})
);

export const getTransferId = createSelector(getTransferData, (data) =>
  get(data, 'id')
);

export const getTransferCountryName = createSelector(getTransferData, (data) =>
  get(data, 'country', null)
);

export const getTransferUserData = createSelector(getTransferData, (data) =>
  get(data, 'createdBy', {})
);

export const getTransferUserEmail = createSelector(
  getTransferUserData,
  (user) => get(user, 'email', null)
);

export const getTransferBUId = createSelector(getTransferData, (data) =>
  get(data, 'businessUnitId', null)
);

export const getTransferBUData = createSelector(getTransferData, (data) =>
  get(data, 'businessUnit', {})
);

export const getTransferBUName = createSelector(getTransferBUData, (bu) =>
  get(bu, 'name', null)
);

export const getTransferWareHouseId = createSelector(getTransferData, (data) =>
  get(data, 'warehouseId', null)
);

export const getTransferLocationData = createSelector(getTransferData, (data) =>
  get(data, 'warehouse', {})
);

export const getTransferLocationName = createSelector(
  getTransferLocationData,
  (location) => get(location, 'name', null)
);

export const getTransferFromLocationId = createSelector(
  getTransferData,
  (data) => get(data, 'fromLocationId', null)
);

export const getTransferFromLocationData = createSelector(
  getTransferData,
  (data) => get(data, 'fromLocationData', {})
);

export const getTransferFromLocationName = createSelector(
  getTransferFromLocationData,
  (location) => get(location, 'name', null)
);

export const getTransferToLocationId = createSelector(getTransferData, (data) =>
  get(data, 'toLocationId', null)
);

export const getTransferToLocationData = createSelector(
  getTransferData,
  (data) => get(data, 'toLocationData', {})
);

export const getTransferToLocationName = createSelector(
  getTransferToLocationData,
  (location) => get(location, 'name', null)
);

export const getIsSubLocationSelected = createSelector(
  getTransferFromLocationId,
  (locationId) => (locationId ? true : false)
);

export const getTransferCreationDate = createSelector(getTransferData, (data) =>
  get(data, 'createdAt', null)
);

export const getTransferConfirmationDate = createSelector(
  getTransferData,
  (data) => get(data, 'confirmedAt', null)
);

export const getTransferProducts = createSelector(getTransferData, (data) => {
  const products: [] = get(data, 'products', []);
  return (
    products?.map((product: TObject, key: number) => ({ ...product, key })) ||
    []
  );
});

export const getAreTransferProductsValid = createSelector(
  getTransferData,
  (data) => {
    const products: [] = get(data, 'products', []);
    return products.every(
      (product: TObject) => product.transferQuantity <= product.currentQuantity
    );
  }
);

export const getTransferProductIds = createSelector(getTransferData, (data) => {
  const products: [] = get(data, 'products', []);
  return products.map((product: TObject) => product?.productId || product?.id);
});

export const getTransferFilteredProducts = createSelector(
  getTransferProductIds,
  getSearchedProducts,
  (productIds, products) => {
    const filteredProducts: any = products.filter(
      (product: TObject) =>
        !productIds.includes(product?.productId || product?.id)
    );

    return filteredProducts;
  }
);

export const getTransferProductsLength = createSelector(
  getTransferProducts,
  (products) => products.length
);

export const getTransferReqPayload = (state: TReduxState) => {
  const userId = getUserId(state);
  let transferData = getTransferData(state);
  const products = getTransferProducts(state);
  const updatedProducts: TArrayOfObjects = [];

  products?.forEach((item: TObject) => {
    if (!item.name || !item.sku) return;
    updatedProducts.push({
      sku: item.sku,
      name: item.name,
      physicalQuantity: parseInt(item.currentQuantity),
      transferQuantity: parseInt(item.transferQuantity),
      productId: item?.productId ? item?.productId : item.id
    });
  });

  if (transferData.id) {
    transferData = omit(transferData, [
      'businessUnit',
      'reason',
      'user',
      'warehouse',
      'reason',
      'createdAt',
      'updatedAt',
      'confirmedAt',
      'createdBy',
      'createdById',
      'fromLocationData',
      'toLocationData'
    ]);
  }

  if (!transferData?.id) {
    transferData = { ...transferData, createdById: userId };
  }

  if (!transferData?.reasonValue) {
    transferData = omit(transferData, ['reasonValue']);
  }

  return { ...transferData, products: updatedProducts };
};

export const getTransferReasons = createSelector(
  transferFeatureSelector,
  (transfer) => {
    const reasons = get(transfer, 'reasons', []);
    return reasons.map(({ id, reason }) => ({ id, name: reason })) || [];
  }
);

export const getTransferReasonId = createSelector(getTransferData, (data) =>
  get(data, 'reasonId', null)
);

export const getTransferReasonValue = createSelector(getTransferData, (data) =>
  get(data, 'reasonValue', null)
);

export const getTransferReasonData = createSelector(getTransferData, (data) =>
  get(data, 'reason', {})
);

export const getTransferReasonText = createSelector(
  getTransferReasonId,
  getTransferReasons,
  (reasonId, reasons) => reasons.find(({ id }) => id === reasonId)?.name || ''
);

export const getTransferStatus = createSelector(getTransferData, (data) =>
  get(data, 'status', TRANSFER_STATUS.READY)
);

export const getisTransferFinalised = createSelector(
  getTransferStatus,
  (status) => status !== TRANSFER_STATUS.READY
);

export const getIsEditTransferState = createSelector(
  transferFeatureSelector,
  (transfer) => get(transfer, 'isEdit', false)
);

export const getIsCreateTransferAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_TRANSFER]);

export const getIsEditTransferAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_TRANSFER]);

export const getIsCancelTransferAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CANCEL_TRANSFER]);

export const getIsConfirmTransferAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CONFIRM_TRANSFER]);

export const getIsReasonInitialCount = createSelector(
  getTransferId,
  getTransferReasonData,
  getTransferReasons,
  getTransferReasonId,
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

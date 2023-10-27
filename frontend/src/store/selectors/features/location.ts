import get from 'lodash.get';
import { createSelector } from 'reselect';
import { Permission } from 'src/constants/auth';
import { getIsUserAllowed } from './auth';

const locationFeatureSelector = (state: TReduxState) => state.features.location;

export const getLocationData = createSelector(
  locationFeatureSelector,
  (location) => get(location, 'data', {})
);

export const getLocationId = createSelector(getLocationData, (data) =>
  get(data, 'id', null)
);

export const getLocationName = createSelector(getLocationData, (data) =>
  get(data, 'name', '')
);

export const getLocationCountry = createSelector(getLocationData, (data) =>
  get(data, 'country', null)
);

export const getLocationBusinessUnitId = createSelector(
  getLocationData,
  (data) => get(data, 'businessUnitId', null)
);

export const getLocationWarehouseId = createSelector(getLocationData, (data) =>
  get(data, 'warehouseId', null)
);

export const getLocationParentId = createSelector(getLocationData, (data) =>
  get(data, 'parentId', null)
);

export const getLocationSaleStatus = createSelector(getLocationData, (data) =>
  get(data, 'availableForSale', true)
);

export const getLocationGRNStatus = createSelector(getLocationData, (data) =>
  get(data, 'grnApplicable', true)
);

export const getLocationReturnStatus = createSelector(getLocationData, (data) =>
  get(data, 'returnApplicable', false)
);

export const getLocationReqPayload = (state: TReduxState) => {
  const location = getLocationData(state);
  const parentId = getLocationParentId(state);
  const availableForSale = getLocationSaleStatus(state);
  const grnApplicable = getLocationGRNStatus(state);
  const returnApplicable = getLocationReturnStatus(state);

  return {
    ...location,
    parentId,
    availableForSale,
    grnApplicable,
    returnApplicable
  };
};

export const getIsCreateLocationAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_LOCATION]);

export const getIsEditLocationAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_LOCATION]);

export const getIsLocStatusUpdateAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.LOCATION_STATUS]);

export const getLocationStatus = createSelector(getLocationData, (data) =>
  get(data, 'disabled', false)
);

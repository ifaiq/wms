import { createSelector } from 'reselect';
import { COUNTRY_CODES } from 'src/constants/common';
import { resetLocationsFilterParams } from 'src/store/slices/entities/location';
import { resetPOFilterParams } from 'src/store/slices/entities/purchase-order';
import { resetTransfersFilterParams } from 'src/store/slices/entities/transfer';
import { resetVendorFilterParams } from 'src/store/slices/entities/vendor';
import { CURRENCY } from '../../../constants/currency';

/**
 *
 * @param state
 * Implementation of memoized selectors using reselect to get particular data out of store.
 */

const appFeatureSelector = (state: TReduxState) => state.features.app;

export const getAppActiveScreen = createSelector(
  appFeatureSelector,
  (app) => app.activeScreen
);

export const getAppLanguage = createSelector(
  appFeatureSelector,
  (app) => app.language
);

export const getBaseUrl = createSelector(
  appFeatureSelector,
  (app) => app.baseUrl
);

export const getCurrency = (country: string): string | null => {
  if (!country) return null;

  const currencies: Record<string, string> = {
    [COUNTRY_CODES.PAKISTAN]: CURRENCY.PKR,
    [COUNTRY_CODES.SAUDIARABIA]: CURRENCY.SAR,
    [COUNTRY_CODES.UAE]: CURRENCY.AED
  };

  return currencies[country];
};

export const resetModuleFilters = (key: string) => {
  const moduleFilters: TObject = {
    vendors: resetVendorFilterParams,
    'purchase-order': resetPOFilterParams,
    transfers: resetTransfersFilterParams,
    locations: resetLocationsFilterParams
  };

  return moduleFilters[key];
};

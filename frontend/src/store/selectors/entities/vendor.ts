import { createSelector } from 'reselect';
import { VENDOR_STATUSES } from 'src/constants/vendor';

const vendorEntitySelector = (state: TReduxState) => state.entities.vendor;

export const getVendorsData = createSelector(vendorEntitySelector, (vendor) =>
  Object.values(vendor.data)
);

export const getVendorsByCountry = (
  state: TReduxState,
  countryName: string
) => {
  const vendorsData: TArrayOfObjects = getVendorsData(state);

  if (vendorsData && countryName) {
    return vendorsData
      .filter(
        ({ country, status }: Record<string, any>) =>
          country === countryName && status === VENDOR_STATUSES.LOCKED
      )
      .map((item: Record<string, any>) => ({ id: item.id, name: item.name }));
  }

  return [];
};

export const getVendorFilterParams = createSelector(
  vendorEntitySelector,
  (vendor) => vendor.filterParams
);

export const getVendorIsFilterApplied = createSelector(
  vendorEntitySelector,
  (vendor) => vendor.isFilterApplied
);

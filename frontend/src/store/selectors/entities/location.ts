import { createSelector } from 'reselect';

const locationEntitySelector = (state: TReduxState) => state.entities.location;

export const getLocationsData = createSelector(
  locationEntitySelector,
  (locations) => Object.values(locations.data)
);

export const getLocationsFilterParams = createSelector(
  locationEntitySelector,
  (locations) => locations.filterParams
);

export const getLocationsIsFilterApplied = createSelector(
  locationEntitySelector,
  (locations) => locations.isFilterApplied
);

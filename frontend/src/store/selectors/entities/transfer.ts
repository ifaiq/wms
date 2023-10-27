import { createSelector } from 'reselect';

const transferEntitySelector = (state: TReduxState) => state.entities.transfer;

export const getTransfers = createSelector(transferEntitySelector, (transfer) =>
  Object.values(transfer.data)
);

export const getTrasnfersFilterParams = createSelector(
  transferEntitySelector,
  (transfer) => transfer.filterParams
);

export const getTrasnfersIsFilterApplied = createSelector(
  transferEntitySelector,
  (transfer) => transfer.isFilterApplied
);

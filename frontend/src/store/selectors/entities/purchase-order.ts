import { createSelector } from 'reselect';

const purchOrderEntitySelector = (state: TReduxState) => state.entities.po;

export const getPurchaseOrders = createSelector(
  purchOrderEntitySelector,
  (po) => Object.values(po.data)
);

export const getPOFilterParams = createSelector(
  purchOrderEntitySelector,
  (po) => po.filterParams
);

export const getPOIsFilterApplied = createSelector(
  purchOrderEntitySelector,
  (po) => po.isFilterApplied
);

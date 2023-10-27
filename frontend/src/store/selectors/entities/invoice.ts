import { createSelector } from 'reselect';

const invoiceEntitySelector = (state: TReduxState) => state.entities.invoice;

export const getInvoiceData = createSelector(
  invoiceEntitySelector,
  (invoice) => invoice.data || []
);

export const getInvoicesFilterParams = createSelector(
  invoiceEntitySelector,
  (invoices) => invoices.filterParams || {}
);

export const getInvoicesIsFilterApplied = createSelector(
  invoiceEntitySelector,
  (invoices) => invoices.isFilterApplied || false
);

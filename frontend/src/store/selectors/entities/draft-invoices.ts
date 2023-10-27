import { createSelector } from 'reselect';

const invoiceEntitySelector = (state: TReduxState) =>
  state.entities.draftInvoice;

export const getDraftInvoiceData = createSelector(
  invoiceEntitySelector,
  (invoice) => invoice.data || []
);

export const getDraftInvoicesFilterParams = createSelector(
  invoiceEntitySelector,
  (invoices) => invoices.filterParams || {}
);

export const getDraftInvoicesIsFilterApplied = createSelector(
  invoiceEntitySelector,
  (invoices) => invoices.isFilterApplied || false
);

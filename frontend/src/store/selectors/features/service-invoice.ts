import { createSelector } from 'reselect';
import get from 'lodash.get';
import { S_INV_KEYS } from 'src/constants/invoice';
import { getIsUserAllowed } from './auth';
import { Permission } from 'src/constants/auth';

const serviceInvoiceFeatureSelector = (state: TReduxState) =>
  state.features.serviceInvoice;

export const getServiceInvoice = createSelector(
  serviceInvoiceFeatureSelector,
  (serviceInvoice) => get(serviceInvoice, 'data', {})
);

export const getInvoiceType = createSelector(getServiceInvoice, (data) =>
  get(data, S_INV_KEYS.TYPE, null)
);

export const getInvoiceDNType = createSelector(getServiceInvoice, (data) =>
  get(data, S_INV_KEYS.DEBIT_NOTE_TYPE, null)
);

export const getServiceInvoiceCustomer = createSelector(
  getServiceInvoice,
  (data) => get(data, S_INV_KEYS.CUSTOMER, {})
);

export const getInvoiceTotals = createSelector(getServiceInvoice, (data) => {
  return {
    totalTaxDue: get(data, 'totalTaxDue', 0),
    totalDueWOTax: get(data, 'totalDueWOTax', 0),
    totalDueWTax: get(data, 'totalDueWTax', 0)
  };
});

export const getServiceInvoiceGrandTotal = createSelector(
  getServiceInvoice,
  (data) => get(data, 'totalDueWTax', 0)
);

export const getServiceInvoiceProducts = createSelector(
  getServiceInvoice,
  (data) => {
    const products = get(data, 'products', []);
    return (
      products?.map((product: TObject, key: number) => ({
        ...product,
        key
      })) || []
    );
  }
);

export const getLineItemTotals = (state: TReduxState, rowNumber: number) => {
  const rows = getServiceInvoiceProducts(state);
  const totalWithoutTax = rows[rowNumber]?.subTotalWithoutTax | 0;
  const totalWithTax = rows[rowNumber]?.grandTotalWithTax | 0;
  const totalTax = Number(totalWithTax) - Number(totalWithoutTax);
  return { totalWithoutTax, totalTax, totalWithTax };
};

export const getServiceInvoiceCountry = createSelector(
  getServiceInvoice,
  (data) => get(data, 'country', {})
);

export const getIsInvoiceEdited = createSelector(
  serviceInvoiceFeatureSelector,
  (invoice) => invoice.isInvoiceEdited
);

export const getPreviewInvoicePayload = (state: TReduxState) => {
  const data = getServiceInvoice(state);

  const invoiceType = getInvoiceDNType(state)
    ? getInvoiceDNType(state)
    : getInvoiceType(state);

  const country = getServiceInvoiceCountry(state);
  return {
    invoiceType,
    countryCode: country,
    payload: data,
    isCreditNote: false
  };
};

export const getIsCreateInvoiceAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_INVOICE]);

export const getIsApproveInvoiceAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.APPROVE_INVOICE]);

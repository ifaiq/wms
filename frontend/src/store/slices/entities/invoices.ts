import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_INVOICE_FILTER } from 'src/constants/invoice';

//TODO: Will be changed in future PR's
const INITIAL_STATE = {
  data: [],
  filterParams: INITIAL_INVOICE_FILTER,
  isFilterApplied: false
};

export const invoiceEntity = createSlice({
  name: 'invoices',
  initialState: INITIAL_STATE,
  reducers: {
    updateInvoices: (state, action) => {
      state.data = action.payload;
    },
    resetInvoices: (state) => {
      state.data = INITIAL_STATE.data;
      state.filterParams = INITIAL_INVOICE_FILTER;
      state.isFilterApplied = false;
    },
    setInvoiceFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.isFilterApplied = true;
    },
    resetInvoiceFilterParams: (state) => {
      state.filterParams = INITIAL_INVOICE_FILTER;
      state.isFilterApplied = false;
    }
  }
});

export const {
  updateInvoices,
  resetInvoices,
  setInvoiceFilterParams,
  resetInvoiceFilterParams
} = invoiceEntity.actions;
export const invoiceEntityReducer = invoiceEntity.reducer;

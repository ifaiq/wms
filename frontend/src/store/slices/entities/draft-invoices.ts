import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_DRAFT_INVOICE_FILTER } from 'src/constants/invoice';

//TODO: Will be changed in future PR's
const INITIAL_STATE = {
  data: [],
  filterParams: INITIAL_DRAFT_INVOICE_FILTER,
  isFilterApplied: false
};

export const invoiceEntity = createSlice({
  name: 'draftInvoice',
  initialState: INITIAL_STATE,
  reducers: {
    updateDraftInvoices: (state, action) => {
      state.data = action.payload;
    },
    resetDraftInvoices: (state) => {
      state.data = INITIAL_STATE.data;
      state.filterParams = INITIAL_DRAFT_INVOICE_FILTER;
      state.isFilterApplied = false;
    },
    setDraftInvoiceFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.isFilterApplied = true;
    },
    resetDraftInvoiceFilterParams: (state) => {
      state.filterParams = INITIAL_DRAFT_INVOICE_FILTER;
      state.isFilterApplied = false;
    }
  }
});

export const {
  updateDraftInvoices,
  resetDraftInvoices,
  setDraftInvoiceFilterParams,
  resetDraftInvoiceFilterParams
} = invoiceEntity.actions;
export const draftInvoiceEntityReducer = invoiceEntity.reducer;

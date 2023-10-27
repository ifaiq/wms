import { createSlice } from '@reduxjs/toolkit';
import { SELLER_INFO } from 'src/constants/invoice';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {
    invoiceType: null,
    debitNoteType: null,
    customer: {},
    seller: SELLER_INFO,
    country: '',
    currency: '',
    products: [],
    totalTaxDue: 0,
    totalDueWOTax: 0,
    totalDueWTax: 0
  },
  isInvoiceEdited: false
};

export const serviceInvoiceFeature = createSlice({
  name: SLICE_NAME.SERVICE_INVOICE,
  initialState: INITIAL_STATE,
  reducers: {
    addSOData: (state, action) => {
      const data = action.payload;
      state.data = data;
    },
    updateSOData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    bulkUpdateSOData: (state, action) => {
      const actions: { key: string; value: string | number | null }[] =
        action.payload;

      actions.forEach(({ key, value }) => {
        state.data = { ...state.data, [key]: value };
      });
    },
    resetSOKeys: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: null };
      });
    },
    resetSOData: (state) => {
      state.data = INITIAL_STATE.data;
      state.isInvoiceEdited = false;
    },
    setIsInvoiceEdited: (state, action) => {
      const value = action.payload;
      state.isInvoiceEdited = value;
    }
  }
});

export const {
  addSOData,
  updateSOData,
  bulkUpdateSOData,
  resetSOKeys,
  resetSOData,
  setIsInvoiceEdited
} = serviceInvoiceFeature.actions;
export const serviceInvoiceFeatureReducer = serviceInvoiceFeature.reducer;

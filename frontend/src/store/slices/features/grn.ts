import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {},
  isEditGRN: false,
  isReturnGRN: false
};

export const grnFeature = createSlice({
  name: SLICE_NAME.RECEIPT,
  initialState: INITIAL_STATE,
  reducers: {
    addGRNData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    updateGRNData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    updateGRNEditMode: (state, action) => {
      state.isEditGRN = action.payload;
    },
    updateGRNReturnMode: (state, action) => {
      state.isReturnGRN = action.payload;
    },
    resetGRNData: (state) => {
      state.data = {};
      state.isEditGRN = false;
      state.isReturnGRN = false;
    },
    handleAttachments: (state, action) => {
      state.data = { ...state.data, attachment: action.payload };
    },
    handleInvoices: (state, action) => {
      state.data = { ...state.data, invoices: action.payload };
    }
  }
});

export const {
  addGRNData,
  updateGRNData,
  updateGRNEditMode,
  updateGRNReturnMode,
  resetGRNData,
  handleAttachments,
  handleInvoices
} = grnFeature.actions;
export const grnFeatureReducer = grnFeature.reducer;

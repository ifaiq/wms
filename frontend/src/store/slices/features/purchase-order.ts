import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {} as TObject,
  isRFQEdited: false,
  isPOEdited: false,
  bulkUploadError: []
};

export const purchaseOrderFeature = createSlice({
  name: SLICE_NAME.PO,
  initialState: INITIAL_STATE,
  reducers: {
    addPOData: (state, action) => {
      const data = action.payload;
      state.data = data.purchaseOrder;
    },
    updatePOData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    resetPOKeys: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: null };
      });
    },
    resetPOData: (state) => {
      state.data = {};
      state.isRFQEdited = false;
      state.isPOEdited = false;
      state.bulkUploadError = [];
    },
    attachInvoices: (state, action) => {
      let { attachment } = state.data;

      if (!attachment) attachment = [];

      const attachmentIndex = attachment?.findIndex(
        (x: TObject) => x.fieldName === action.payload.fileToSet.fieldName
      );

      if (attachmentIndex > -1) {
        attachment[attachmentIndex] = action.payload.fileToSet;
      } else {
        attachment?.push({ ...action.payload.fileToSet });
      }

      state.data = { ...state.data, attachment };
    },
    removeInvoices: (state, action) => {
      const { attachment } = state.data;

      const updatedAttachment = attachment?.filter(
        (x: TObject) => x.fieldName != action.payload.fileData.fieldName
      );

      state.data = { ...state.data, attachment: updatedAttachment };
    },
    setRFQEditFlag: (state, action) => {
      state.isRFQEdited = action.payload;
    },
    setPOEditFlag: (state, action) => {
      state.isPOEdited = action.payload;
    },
    updateBulkUploadErrorState: (state, action) => {
      state.bulkUploadError = action.payload;
    }
  }
});

export const {
  addPOData,
  updatePOData,
  resetPOKeys,
  resetPOData,
  attachInvoices,
  removeInvoices,
  setRFQEditFlag,
  setPOEditFlag,
  updateBulkUploadErrorState
} = purchaseOrderFeature.actions;
export const purchOrderFeatureReducer = purchaseOrderFeature.reducer;

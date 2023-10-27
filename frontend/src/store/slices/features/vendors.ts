import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {} as any,
  isVendorEdited: false
};

export const vendorFeature = createSlice({
  name: SLICE_NAME.VENDOR,
  initialState: INITIAL_STATE,
  reducers: {
    addVendorData: (state, action) => {
      const data = action.payload;
      state.data = data;
    },
    updateVendorData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    resetVendorKeys: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: '' };
      });
    },
    resetVendorArrays: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: [] };
      });
    },
    resetVendorData: (state) => {
      state.data = {};
      state.isVendorEdited = false;
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
        attachment.push({ ...action.payload.fileToSet });
      }

      state.data = { ...state.data, attachment };
    },
    removeInvoices: (state, action) => {
      const updatedAttachment = [...state.data.attachment]?.filter(
        (x: any) => x.fieldName != action.payload.fileData.fieldName
      );

      state.data = { ...state.data, attachment: updatedAttachment };
    },
    setVendorEditFlag: (state, action) => {
      state.isVendorEdited = action.payload;
    }
  }
});

export const {
  addVendorData,
  updateVendorData,
  resetVendorKeys,
  resetVendorData,
  attachInvoices,
  removeInvoices,
  setVendorEditFlag,
  resetVendorArrays
} = vendorFeature.actions;

export const VendorFeatureReducer = vendorFeature.reducer;

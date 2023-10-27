import { createSlice } from '@reduxjs/toolkit';
import { normalize, schema } from 'normalizr';
import { SLICE_NAME } from 'src/constants/redux-slices';
import { INITAIL_VENDOR_FILTERS } from 'src/constants/vendor';

const INITIAL_STATE = {
  data: {},
  filterParams: INITAIL_VENDOR_FILTERS,
  isFilterApplied: false
};

export const vendorEntity = createSlice({
  name: SLICE_NAME.VENDOR,
  initialState: INITIAL_STATE,
  reducers: {
    updateVendors: (state, action) => {
      const vendor = new schema.Entity(SLICE_NAME.VENDOR);
      const vendorSchema = [vendor];
      const normalizedData = normalize(action.payload, vendorSchema);
      state.data = { ...normalizedData.entities.vendor };
    },
    resetVendors: (state) => {
      state.data = {};
      state.filterParams = INITAIL_VENDOR_FILTERS;
      state.isFilterApplied = false;
    },
    setVendorFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.isFilterApplied = true;
    },
    resetVendorFilterParams: (state) => {
      state.filterParams = INITAIL_VENDOR_FILTERS;
      state.isFilterApplied = false;
    }
  }
});

export const {
  resetVendors,
  updateVendors,
  setVendorFilterParams,
  resetVendorFilterParams
} = vendorEntity.actions;
export const vendorEntityReducer = vendorEntity.reducer;

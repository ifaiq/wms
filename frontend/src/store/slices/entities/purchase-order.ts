import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_PO_FILTER } from 'src/constants/purchase-order';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {},
  filterParams: INITIAL_PO_FILTER,
  isFilterApplied: false
};

export const purchaseOrderEntity = createSlice({
  name: SLICE_NAME.PO,
  initialState: INITIAL_STATE,
  reducers: {
    updatePurchaseOrders: (state, action) => {
      state.data = { ...action.payload };
    },
    resetPurchaseOrders: (state) => {
      state.data = {};
      state.filterParams = INITIAL_PO_FILTER;
      state.isFilterApplied = false;
    },
    setPOFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.isFilterApplied = true;
    },
    resetPOFilterParams: (state) => {
      state.filterParams = INITIAL_PO_FILTER;
      state.isFilterApplied = false;
    }
  }
});

export const {
  resetPurchaseOrders,
  updatePurchaseOrders,
  setPOFilterParams,
  resetPOFilterParams
} = purchaseOrderEntity.actions;
export const purchOrderEntityReducer = purchaseOrderEntity.reducer;

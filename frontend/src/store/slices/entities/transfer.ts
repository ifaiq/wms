import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';
import { INITIAL_TRANSFER_FILTER } from 'src/constants/transfers';

const INITIAL_STATE = {
  data: {},
  filterParams: INITIAL_TRANSFER_FILTER,
  isFilterApplied: false
};

export const transferEntity = createSlice({
  name: SLICE_NAME.TRANSFER,
  initialState: INITIAL_STATE,
  reducers: {
    updateTransfers: (state, action) => {
      state.data = { ...action.payload };
    },
    resetTransfers: (state) => {
      state.data = {};
      state.filterParams = INITIAL_TRANSFER_FILTER;
      state.isFilterApplied = false;
    },
    setTransfersFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.isFilterApplied = true;
    },
    resetTransfersFilterParams: (state) => {
      state.filterParams = INITIAL_TRANSFER_FILTER;
      state.isFilterApplied = false;
    }
  }
});

export const {
  resetTransfers,
  updateTransfers,
  setTransfersFilterParams,
  resetTransfersFilterParams
} = transferEntity.actions;
export const transferEntityReducer = transferEntity.reducer;

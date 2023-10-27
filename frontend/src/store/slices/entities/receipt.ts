import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {}
};

export const receiptEntity = createSlice({
  name: SLICE_NAME.RECEIPT,
  initialState: INITIAL_STATE,
  reducers: {
    updateGRNReceiptData: (state, action) => {
      state.data = { ...action.payload };
    }
  }
});

export const { updateGRNReceiptData } = receiptEntity.actions;
export const receiptEntityReducer = receiptEntity.reducer;

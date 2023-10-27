import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {}
};

export const productEntity = createSlice({
  name: SLICE_NAME.PRODUCT,
  initialState: INITIAL_STATE,
  reducers: {
    updateProducts: (state, action) => {
      state.data = { ...action.payload?.data };
    },
    resetProducts: (state) => {
      state.data = {};
    }
  }
});

export const { resetProducts, updateProducts } = productEntity.actions;
export const productEntityReducer = productEntity.reducer;

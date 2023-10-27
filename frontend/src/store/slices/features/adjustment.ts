import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {} as TObject,
  reasons: [],
  isEdit: false
};

export const adjustmentFeature = createSlice({
  name: SLICE_NAME.ADJUSTMENT,
  initialState: INITIAL_STATE,
  reducers: {
    addAdjustmentData: (state, action) => {
      const data = action.payload;
      state.data = data.adjustment;
    },
    updateAdjustmentData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    resetAdjustmentKeys: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: null };
      });
    },
    resetAdjustmentData: (state) => {
      state.data = {};
      state.isEdit = false;
    },
    addAdjustmentReasons: (state, action) => {
      state.reasons = action.payload;
    },
    toggleIsEdit: (state, action) => {
      state.isEdit = action.payload;
    }
  }
});

export const {
  addAdjustmentData,
  updateAdjustmentData,
  resetAdjustmentKeys,
  resetAdjustmentData,
  addAdjustmentReasons,
  toggleIsEdit
} = adjustmentFeature.actions;
export const adjustmentFeatureReducer = adjustmentFeature.reducer;

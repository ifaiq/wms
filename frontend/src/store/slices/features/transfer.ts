import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {} as TObject,
  reasons: [],
  isEdit: false
};

export const transferFeature = createSlice({
  name: SLICE_NAME.TRANSFER,
  initialState: INITIAL_STATE,
  reducers: {
    addTransferData: (state, action) => {
      const data = action.payload;
      state.data = data.transfer;
    },
    updateTransferData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    resetTransferKeys: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: null };
      });
    },
    resetTransferData: (state) => {
      state.data = {};
      state.isEdit = false;
    },
    addTransferReasons: (state, action) => {
      state.reasons = action.payload;
    },
    toggleIsEdit: (state, action) => {
      state.isEdit = action.payload;
    }
  }
});

export const {
  addTransferData,
  updateTransferData,
  resetTransferKeys,
  resetTransferData,
  addTransferReasons,
  toggleIsEdit
} = transferFeature.actions;
export const transferFeatureReducer = transferFeature.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {}
};

export const locationFeature = createSlice({
  name: SLICE_NAME.LOCATION,
  initialState: INITIAL_STATE,
  reducers: {
    addLocationData: (state, action) => {
      state.data = action.payload;
    },
    updateLocationData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    setConfigurationDetails: (state, action) => {
      const { availableForSale, grnApplicable, returnApplicable } =
        action.payload;

      state.data = {
        ...state.data,
        availableForSale,
        grnApplicable,
        returnApplicable
      };
    },
    resetLocationKeys: (state, action) => {
      const keys = action.payload;

      keys?.forEach((key: string) => {
        state.data = { ...state.data, [key]: null };
      });
    },
    resetLocationData: (state) => {
      state.data = {};
    }
  }
});

export const {
  addLocationData,
  updateLocationData,
  setConfigurationDetails,
  resetLocationKeys,
  resetLocationData
} = locationFeature.actions;
export const locationReducer = locationFeature.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_LOCATION_FILTER } from 'src/constants/locations';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {},
  filterParams: INITIAL_LOCATION_FILTER,
  isFilterApplied: false
};

export const locationEntity = createSlice({
  name: SLICE_NAME.LOCATION,
  initialState: INITIAL_STATE,
  reducers: {
    updateLocationsData: (state, action) => {
      state.data = { ...action.payload };
    },
    resetLocationsData: (state) => {
      state.data = {};
      state.filterParams = INITIAL_LOCATION_FILTER;
      state.isFilterApplied = false;
    },
    setLocationsFilterParams: (state, action) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
      state.isFilterApplied = true;
    },
    resetLocationsFilterParams: (state) => {
      state.filterParams = INITIAL_LOCATION_FILTER;
      state.isFilterApplied = false;
    }
  }
});

export const {
  updateLocationsData,
  resetLocationsData,
  setLocationsFilterParams,
  resetLocationsFilterParams
} = locationEntity.actions;
export const locationReducer = locationEntity.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {}
};

export const userFeature = createSlice({
  name: SLICE_NAME.USER,
  initialState: INITIAL_STATE,
  reducers: {
    addUserData: (state, action) => {
      state.data = action.payload;
    },
    updateUserData: (state, action) => {
      const { key, value } = action.payload;
      state.data = { ...state.data, [key]: value };
    },
    resetUserData: (state) => {
      state.data = {};
    }
  }
});

export const { addUserData, updateUserData, resetUserData } =
  userFeature.actions;
export const userFeatureReducer = userFeature.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';

const INITIAL_STATE = {
  data: {}
};

export const userEntity = createSlice({
  name: SLICE_NAME.USER,
  initialState: INITIAL_STATE,
  reducers: {
    updateUsersData: (state, action) => {
      state.data = { ...action.payload };
    },
    resetUsersData: (state) => {
      state.data = {};
    }
  }
});

export const { updateUsersData, resetUsersData } = userEntity.actions;
export const userEntityReducer = userEntity.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'src/constants/redux-slices';
import { LocalStorageService } from 'src/services';

const localStorageService = new LocalStorageService();

const INITIAL_STATE = {
  data: {} as TObject,
  permissions: [] as string[]
};

export const authFeatureSlice = createSlice({
  name: SLICE_NAME.AUTH,
  initialState: INITIAL_STATE,
  reducers: {
    updateUserData: (state, action) => {
      state.data = action.payload.userData;
      state.permissions = action.payload.permissions;
    },
    resetUserData: (state) => {
      state.data = INITIAL_STATE.data;
      state.permissions = INITIAL_STATE.permissions;
      localStorageService.remove('wmsAuthToken');
    }
  }
});

export const { updateUserData, resetUserData } = authFeatureSlice.actions;
export const authFeatureReducer = authFeatureSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { LANGUAGE } from '../../../constants/language';
import { ROUTES } from '../../../constants/navigation-routes';
import { SLICE_NAME } from 'src/constants/redux-slices';
/**
 * An example of creating feature slices, reducers and INITIAL_STATE.
 */

const INITIAL_STATE = {
  language: LANGUAGE.ENGLISH,
  baseUrl: process.env.REACT_BASE_URL || '',
  activeScreen: ROUTES.LOGIN
};

export const appFeatureSlice = createSlice({
  // A name, used in action types
  name: SLICE_NAME.APP,
  // The initial state for the reducer
  initialState: INITIAL_STATE,
  // An object of "case reducers". Key names will be used to generate actions.
  reducers: {
    changeLanguage: (state, action) => {
      state.activeScreen = action.payload;
    },
    updateActiveScreen: (state, action) => {
      state.language = action.payload;
    }
  }
});

export const { changeLanguage, updateActiveScreen } = appFeatureSlice.actions;
export const appFeatureReducer = appFeatureSlice.reducer;

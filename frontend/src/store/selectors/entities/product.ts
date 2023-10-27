import { createSelector } from 'reselect';

const productsEntitySelector = (state: TReduxState) => state.entities.product;

export const getSearchedProducts = createSelector(
  productsEntitySelector,
  (product) => Object.values(product.data)
);

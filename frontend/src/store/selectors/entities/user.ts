import { createSelector } from 'reselect';

const userEntitySelector = (state: TReduxState) => state.entities.user;

export const getUsersData = createSelector(userEntitySelector, (users) =>
  Object.values(users.data)
);

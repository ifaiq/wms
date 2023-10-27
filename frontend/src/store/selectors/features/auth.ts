import get from 'lodash.get';
import isEmpty from 'lodash.isempty';
import { createSelector } from 'reselect';

const authFeatureSelector = (state: TReduxState) => state.features.auth;

export const getUserData = createSelector(
  authFeatureSelector,
  (auth) => auth.data
);

export const getUserPermissions = createSelector(
  authFeatureSelector,
  (auth) => auth.permissions
);

export const getUserName = createSelector(getUserData, (data) => data?.name);

export const getUserRole = createSelector(getUserData, (data) => {
  const UserRole = get(data, 'UserRole', []);

  return UserRole.map((roles: TObject) => ({
    id: roles.role.id,
    name: roles.role.name
  }));
});

export const getUserId = createSelector(getUserData, (data) => data?.id);

export const getUserEmail = createSelector(getUserData, (data) =>
  get(data, 'email', '')
);

export const getIsUserLoggedIn = createSelector(getUserData, (data) =>
  isEmpty(data) ? false : true
);

export const getIsUserAllowed = (
  state: TReduxState,
  permissions: Array<string> | []
) => {
  if (!permissions || isEmpty(permissions)) return true;
  const userPermissions = getUserPermissions(state);
  let isAllowed = false;

  for (const permission of permissions) {
    if (userPermissions.includes(permission)) {
      isAllowed = true;
      break;
    }
  }

  return isAllowed;
};

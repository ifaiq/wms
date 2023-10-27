import get from 'lodash.get';
import { createSelector } from 'reselect';
import { Permission } from 'src/constants/auth';
import { USER_STATUS } from 'src/constants/user';
import {
  getIsUserAllowed,
  getUserRole as getLoggedInUserRoles,
  getUserId as getLoggedInUserId
} from './auth';

const userFeatureSelector = (state: TReduxState) => state.features.user;

export const getUsersData = createSelector(userFeatureSelector, (users) =>
  get(users, 'data', {})
);

export const getUserId = createSelector(getUsersData, (data) =>
  get(data, 'id', null)
);

export const getUserName = createSelector(getUsersData, (data) =>
  get(data, 'name', '')
);

export const getUserEmail = createSelector(getUsersData, (data) =>
  get(data, 'email', '')
);

export const getUserPassword = createSelector(getUsersData, (data) =>
  get(data, 'password', '')
);

export const getUserRoles = createSelector(getUsersData, (data) => {
  const UserRole = get(data, 'UserRole', []);

  return get(
    data,
    'roles',
    UserRole.map((roles: TObject) => roles.role.id)
  );
});

export const getUserStatus = createSelector(getUsersData, (data) => {
  const status = get(data, 'status');

  return !(status === USER_STATUS.ENABLED ? true : false);
});

export const getUserReqPayload = (state: TReduxState) => {
  const userId = getUserId(state);
  const name = getUserName(state);
  const email = getUserEmail(state);
  const password = getUserPassword(state);
  const roles = getUserRoles(state);

  const userPayload: IUser = {
    id: userId,
    name,
    email,
    roles
  };

  if (!password && userId) return userPayload;

  return { ...userPayload, password };
};

export const getIsUserManagementAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.USER_MANAGEMENT]);

export const getIsRoleChangeAllowed = createSelector(
  getUserId,
  getLoggedInUserId,
  getLoggedInUserRoles,
  (userId, loggedInUserId, loggedInUserRoles) => {
    return (
      userId === loggedInUserId &&
      loggedInUserRoles.find((role: TObject) => role.id === 1)
    );
  }
);

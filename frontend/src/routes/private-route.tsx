import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotFound from 'src/components/not-found';
import {
  getIsUserLoggedIn,
  getIsUserAllowed
} from 'src/store/selectors/features/auth';

interface IPrivateRoute {
  component: ReactNode;
  permissions?: Array<string> | [];
}

export const PrivateRoute: React.FC<IPrivateRoute> = ({
  component,
  permissions = []
}) => {
  const isLoggedIn = useSelector(getIsUserLoggedIn);

  const isAllowed = useSelector((state: TReduxState) =>
    getIsUserAllowed(state, permissions)
  );

  if (!isLoggedIn) return <Redirect to="/" />;
  else if (isLoggedIn && isAllowed) {
    return <>{component}</>;
  }

  return <NotFound />;
};

import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getIsUserLoggedIn } from 'src/store/selectors/features/auth';

interface IAuthRoute {
  component: ReactNode;
}

export const AuthRoute: React.FC<IAuthRoute> = ({ component }) => {
  const isLoggedIn = useSelector(getIsUserLoggedIn);

  if (isLoggedIn) return <Redirect to="/vendors" />;

  return <>{component}</>;
};

import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { resetUserData } from 'src/store/slices/features/auth';
import { showWarnMessage } from 'src/utils/alerts';
import LogoutIcon from '@mui/icons-material/Logout';

export const Logout: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const logoutUser = () => {
    dispatch(resetUserData());
    showWarnMessage('You have been logged out !');
    history.replace('/');
  };

  return (
    <div
      onClick={logoutUser}
      className="flex cursor-pointer text-blue-blue2 hover:text-error"
    >
      <LogoutIcon />
      <span className="ml-1 text-blue-blue2">Logout</span>
    </div>
  );
};

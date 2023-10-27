import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

export const useResetState = (action: TFunction) => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(action());
  }, [location]);
};

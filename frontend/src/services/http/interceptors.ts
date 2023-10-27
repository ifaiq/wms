import axios from 'axios';
import { RESPONSE_TYPES, STATUS_CODES } from '../../constants/response-types';
import { store } from '../../app';
import { resetUserData } from 'src/store/slices/features/auth';

axios.interceptors.request.use(
  async function (req) {
    return req;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      axios.isCancel(error) ||
      error?.message === RESPONSE_TYPES.NETWORK_ERROR ||
      error?.response?.status === 408 ||
      error?.code === 'ECONNABORTED'
    ) {
      return Promise.reject({ noInternet: true });
    }

    if (error?.response?.status === STATUS_CODES.UNAUTHORIZED) {
      store?.dispatch(resetUserData());
    }

    return Promise.reject(error);
  }
);

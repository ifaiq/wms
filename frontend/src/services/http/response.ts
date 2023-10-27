import { AxiosResponse } from 'axios';
import isEmpty from 'lodash.isempty';
import { RESPONSE_TYPES, STATUS_CODES } from '../../constants/response-types';

export const prepareResponseObject = (
  response: AxiosResponse<any> | any,
  status?: string
): any => {
  const finalResponse = {
    data: null,
    error: true,
    statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    statusText: response?.status || response?.statusText
  };

  if (response.noInternet) {
    return {
      ...finalResponse,
      data: { message: 'offline' },
      statusCode: STATUS_CODES.BAD_GATEWAY
    };
  }

  if (!status) {
    return finalResponse;
  } else if (status === RESPONSE_TYPES.SUCCESS) {
    return {
      data: response?.data?.data || response?.data,
      statusCode: response?.status || response?.statusCode,
      error: response?.statusCode !== STATUS_CODES.SUCCESS,
      statusText: response?.statusText || ''
    };
  } else if (status === RESPONSE_TYPES.ERROR_RESPONSE) {
    const {
      data: { errors: errorResponse }
    } = response;

    const errorData = !isEmpty(errorResponse) ? errorResponse : response.data;
    return {
      ...finalResponse,
      data: errorData,
      statusCode: response?.statusCode || response?.data?.status,
      statusText: response?.data?.errors?.reason
    };
  } else if (status === RESPONSE_TYPES.ERROR_REQUEST) {
    return {
      ...finalResponse,
      statusText: response?.data?.errors?.reason
    };
  }

  return finalResponse;
};

export const prepareErrorResponse = (error: AxiosResponse<any> | any): any => {
  if (error?.response) {
    return prepareResponseObject(error.response, RESPONSE_TYPES.ERROR_RESPONSE);
  } else if (error?.request) {
    return prepareResponseObject(error.request, RESPONSE_TYPES.ERROR_REQUEST);
  }

  return prepareResponseObject(error);
};

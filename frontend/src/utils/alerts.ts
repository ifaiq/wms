import { notification } from 'antd';

export const showSuccessMessage = (message?: string) =>
  notification.open({
    type: 'success',
    message: 'Operation Successful!',
    description: message ?? ''
  });

export const showErrorMessage = (message?: string) =>
  notification.open({
    type: 'error',
    message: 'Operation Failed!',
    description: message ?? ''
  });

export const showCustomMessage = (message?: string) => {
  notification.open({
    type: 'success',
    message: message
  });
};

export const showWarnMessage = (message?: string) => {
  notification.open({
    type: 'warning',
    message: message
  });
};

export const setBackendFieldsError = (
  fieldsError: Array<Record<string, string>>,
  setError: any
) => {
  if (fieldsError.length) {
    fieldsError.forEach(({ field }) =>
      setError(field, {
        type: 'custom',
        message: `${field.replace(/^\w/, (c) => c.toUpperCase())} is not valid`
      })
    );
  }

  return fieldsError;
};

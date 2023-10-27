export const ErrorArrayHandler = (errors: TObject) => {
  return errors?.data?.context?.map((error: TObject) => error?.field);
};

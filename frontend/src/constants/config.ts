export const NETWORK = {
  // BASE_URL: "http://localhost:3000",
  BASE_URL: process.env.REACT_APP_BASE_URL,
  TAXATION_BASE_URL: process.env.REACT_APP_TAXATION_SVC_URL,
  TAXATION_UI_FLAG: process.env.REACT_APP_TAXATION_UI_FLAG,
  FMS_BASE_URL: process.env.REACT_APP_FMS_BASE_URL,
  INVOICING_SERVICE_BASE_URL: process.env.REACT_APP_INVOICING_BASE_URL
};

export const FEATURE_FLAGS = {
  INVOICE_FLAG: process.env.REACT_APP_INVOICE_FEATURE_FLAG
};
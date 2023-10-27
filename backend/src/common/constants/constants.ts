import * as path from 'path';

const PDF_OPTIONS = {
  options: {
    format: 'A4'
  },
  templatePath: path.join(__dirname, `../../ejs/poPDFTemplate.ejs`)
};

const PDF_TITLE = {
  PURCHASE_ORDER: 'PURCHASE ORDER',
  RECEIPT: 'RECEIPT',
  RETURN: 'RETURN'
};

const userSelect = {
  id: true,
  email: true,
  name: true
};

const API_RETRY_DEFAULT_VALUE = 3;

enum TransferTypes {
  GRN = 'GRN',
  Return = 'Return',
  Adjustment = 'Adjustment',
  Transfer = 'Transfer',
  Return_In = 'Return_In'
}

const transfer = {
  adjustment: 'Adjustment_',
  grn: 'GRN_',
  return: 'Return_',
  transfer: 'Transfer_',
  return_in: 'ReturnIn_'
};

const openSearchIndexKey = {
  id: 'id',
  index: 'index'
};

const COUNTRY = {
  PAK: 'Pakistan',
  ARE: 'United Arab Emirates',
  SAUDI: 'Saudi Arabia'
};

const CURRENCY = {
  PAK: 'PKR',
  ARE: 'AED',
  SAUDI: 'SAR',
  USD: 'USD'
};

const COUNTRY_CODES = {
  PAK: 'PAK',
  SAUDI: 'SAUDI',
  ARE: 'ARE'
};

const VALID_CURRENCY = {
  [COUNTRY_CODES.PAK]: [CURRENCY.PAK],
  [COUNTRY_CODES.SAUDI]: [CURRENCY.SAUDI, CURRENCY.USD],
  [COUNTRY_CODES.ARE]: [CURRENCY.ARE, CURRENCY.USD]
};

const PAYMENT = {
  ADVANCE: 'ADVANCE',
  CREDIT: 'CREDIT'
};

const MODULES_NAME = {
  AUTH: 'Auth',
  ADMIN: 'Admin',
  ADJUSTMENT: 'Adjustment',
  MONOLITH: 'Monolith',
  PRODUCT: 'Product',
  PURCHASE_ORDER: 'Purchase Order',
  RECEIPT: 'Receipt',
  TRANSFER: 'Transfer',
  USER: 'User',
  VENDOR: 'Vendor',
  INVOICE: 'Invoice'
};

const REASON = {
  INITIAL_COUNT: 'INITIAL_COUNT'
};

const DUMP_LOCATION = 'Staging Location';

const INVENTORY_SYNC_TYPES = {
  BATCH_ACCEPT: 'BATCH_ACCEPT',
  BATCH_CLOSE: 'BATCH_CLOSE'
};

export {
  userSelect,
  TransferTypes,
  PDF_OPTIONS,
  PDF_TITLE,
  transfer,
  openSearchIndexKey,
  API_RETRY_DEFAULT_VALUE,
  COUNTRY,
  CURRENCY,
  DUMP_LOCATION,
  INVENTORY_SYNC_TYPES,
  MODULES_NAME,
  PAYMENT,
  VALID_CURRENCY,
  COUNTRY_CODES,
  REASON
};

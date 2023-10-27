export enum COUNTRY_CODES {
  PAKISTAN = 'PAK',
  SAUDIARABIA = 'SAUDI',
  UAE = 'ARE'
}

export const COUNTRIES = [
  { id: COUNTRY_CODES.PAKISTAN, name: 'Pakistan' },
  { id: COUNTRY_CODES.SAUDIARABIA, name: 'Saudi Arabia' },
  { id: COUNTRY_CODES.UAE, name: 'United Arab Emirates' }
];

export const PAYMENT = {
  CREDIT: 'CREDIT',
  ADVANCE: 'ADVANCE'
};

export const PAYMENT_TYPES = [
  { id: PAYMENT.CREDIT, name: PAYMENT.CREDIT },
  { id: PAYMENT.ADVANCE, name: PAYMENT.ADVANCE }
];

export const INITAIL_PAGINATION_DATA: IPaginationType = {
  page: 1,
  skip: 0,
  take: 10
};

export const SEARCH_CAT_LIST = [
  { category: 'name', title: 'name' },
  { category: 'phone', title: 'phone' }
];

export const INTIAL_SEARCH_STATE = {
  name: [],
  phone: []
};

export enum INVOICES_TYPES {
  SERVICE_INVOICE = 'SERVICE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  FULL_TAX = 'FULL_TAX',
  THERMAL = 'THERMAL',
  CREDIT_NOTE = 'CREDIT_NOTE'
}

export const INVOICES_OPTIONS = [
  { id: INVOICES_TYPES.SERVICE_INVOICE, name: 'Service Invoice' },
  { id: INVOICES_TYPES.DEBIT_NOTE, name: 'Debit Note' }
];

export enum DEBIT_NOTE_TYPES {
  REBATE = 'DEBIT_NOTE_REBATE',
  RETURN = 'DEBIT_NOTE_RETURN'
}

export const DEBIT_NOTE_OPTIONS = [
  { id: DEBIT_NOTE_TYPES.REBATE, name: 'Rebates' },
  { id: DEBIT_NOTE_TYPES.RETURN, name: 'Return to vendor' }
];

export const INVOICE_TYPE_FILTER_OPTIONS = [
  { id: INVOICES_TYPES.SERVICE_INVOICE, name: 'Service Invoice' },
  { id: DEBIT_NOTE_TYPES.REBATE, name: 'Debit Note (Rebates)' },
  { id: DEBIT_NOTE_TYPES.RETURN, name: 'Debit Note (Returns)' },
  { id: INVOICES_TYPES.FULL_TAX, name: 'Goods Invoice (Full Tax)' },
  { id: INVOICES_TYPES.THERMAL, name: 'Goods Invoice (Thermal)' },
  { id: INVOICES_TYPES.CREDIT_NOTE, name: 'Credit Note' }
];

export const INVOICE_COUNTRY_FILTER_OPTIONS = [
  { id: 'PAK', name: 'Pakistan' },
  { id: 'KSA', name: 'Saudi Arabia' },
  { id: 'UAE', name: 'United Arab Emirates' }
];

export const INITIAL_USER_SEARCH_STATE = {
  vendor: [],
  orderId: []
};

export const INITIAL_INVOICE_FILTER = {
  type: null,
  country: null,
  orderId: null,
  invoiceNumber: null,
  from: null,
  till: null
};

export const INITIAL_DRAFT_INVOICE_FILTER = {
  type: null,
  from: null,
  till: null
};

export enum INVOICE_STATUS {
  DRAFT = 'DRAFT',
  LOCKED = 'LOCKED'
}

export enum TAX_TYPES {
  SALES_TAX = 'SALES_TAX',
  VAT = 'VAT',
  ADVANCE_TAX = 'ADVANCE_TAX',
  SERVICE_TAX = 'SERVICE_TAX'
}

export const TAX_RATES = {
  [TAX_TYPES.SALES_TAX]: '12%',
  [TAX_TYPES.VAT]: '15%',
  [TAX_TYPES.ADVANCE_TAX]: '10%',
  [TAX_TYPES.SERVICE_TAX]: '9%'
};

export const TAX_OPTIONS = [
  // { id: TAX_TYPES.SALES_TAX, name: `Sales Tax` },
  { id: TAX_TYPES.VAT, name: `VAT (${TAX_RATES.VAT})` }
  // { id: TAX_TYPES.ADVANCE_TAX, name: 'Advance Tax' },
  // { id: TAX_TYPES.SERVICE_TAX, name: 'Service Tax' }
];

export const DRAFT_INVOICE_SEARCH_CAT_LIST = [
  { category: 'vendor', title: 'Vendor Name' }
];

export const TEST_ID_KEY_S_INVOICE = 'testSInvoice';

export const S_INV_KEYS = {
  PRODUCTS: 'products',
  TYPE: 'invoiceType',
  COUNTRY: 'country',
  CURRENCY: 'currency',
  CITY: 'city',
  CUSTOMER: 'customer',
  CUSTOMER_BUSINESS_NAME: 'businessName',
  CUSTOMER_NAME: 'customerName',
  CUSTOMER_VAT_NO: 'vatNo',
  CUSTOMER_ADDRESS: 'address',
  CUSTOMER_CONTACT_NO: 'contactNo',
  ITEM_DESCRIPTION: 'description',
  QTY: 'quantity',
  QTY_UNIT: 'quantityUnit',
  PRC_PER_UNIT: 'price',
  TOTAL_WO_TAX: 'subTotalWithoutTax',
  TAX: 'tax',
  TOTAL_W_TAX: 'grandTotalWithTax',
  NET_TAX: 'totalTaxDue',
  NET_WO_TAX: 'totalDueWOTax',
  NET_W_TAX: 'totalDueWTax',
  DEBIT_NOTE_TYPE: 'debitNoteType',
  SKU_CODE: 'skuCode',
  SKU_NAME: 'skuName',
  MRP: 'mrp'
};

export const SO_PRODUCT_ROW = {
  [S_INV_KEYS.ITEM_DESCRIPTION]: '',
  [S_INV_KEYS.QTY]: 0,
  [S_INV_KEYS.QTY]: '',
  [S_INV_KEYS.PRC_PER_UNIT]: 0,
  [S_INV_KEYS.TOTAL_WO_TAX]: 0,
  [S_INV_KEYS.TAX]: null,
  [S_INV_KEYS.TOTAL_W_TAX]: 0,
  isTaxSelected: false
};

export const DN_REBATE_LINE_ITEM = {
  description: '',
  subTotalWithoutTax: 0,
  tax: null,
  grandTotalWithTax: 0
};

export const DN_RETURN_LINE_ITEM = {
  skuCode: '',
  skuName: '',
  quantity: 0,
  price: 0,
  mrp: 0,
  subTotalWithoutTax: 0,
  tax: null,
  grandTotalWithTax: 0
};

export const DRAFT_PLACEHOLDER = 'draft';

export const SELLER_INFO = {
  name: 'شركة ريتيلو العربي لتقنية نظم المعلومات شركة شخص واحد',
  businessName: 'شركة ريتيلو العربي لتقنية نظم المعلومات شركة شخص واحد',
  phone: '+966540482814',
  website: 'www.retailo.co',
  address:
    'شارع أنس بن مالك، حي المالقا، الرياض، 13521، الرياض، المملكة العربية السعودية,3141',
  vat: '310798963700003'
};

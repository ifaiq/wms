import { COUNTRY_CODES } from './common';

export const INITIAL_TRANSFER_SEARCH_STATE = {
  sku: [],
  name: [],
  id: []
};

export const INITAIL_TRANSFER_FILTERS: Record<string, string> = {};

export const TRANSFER_SEARCH_CAT_LIST = [
  { category: 'sku', title: 'SKU Code' },
  { category: 'name', title: 'Products' },
  { category: 'id', title: 'Transfer Reference' }
];

export const INITAIL_TRANSFERS_FILTERS: Record<string, string> = {
  country: COUNTRY_CODES.PAKISTAN
};

export const INITIAL_TRANSFER_FILTER = {
  country: null,
  type: null,
  from: null,
  till: null
};

export enum TRANSFER_TYPES {
  GRN = 'GRN',
  Return = 'Return',
  Adjustment = 'Adjustment',
  Transfer = 'Transfer',
  RETURN_IN = 'Return_In'
}

export const TRANSFERS = [
  { id: TRANSFER_TYPES.GRN, name: TRANSFER_TYPES.GRN },
  { id: TRANSFER_TYPES.Return, name: TRANSFER_TYPES.Return },
  { id: TRANSFER_TYPES.Adjustment, name: TRANSFER_TYPES.Adjustment },
  { id: TRANSFER_TYPES.Transfer, name: TRANSFER_TYPES.Transfer }
];

export enum TRANSFER_STATUS {
  READY = 'READY',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export const TEST_ID_KEY_TRANSFER = 'testTransfer';

export const INITIAL_PRODUCT_STATE = {
  sku: '',
  name: '',
  currentQuantity: 0,
  transferQuantity: 0
};

const TRANSFER_PARENT: IRoute = {
  path: 'inventory-movements',
  breadcrumbName: 'Inventory Movements'
};

export const CREATE_TRANSFER_BREADCRUMB: IRoute[] = [
  TRANSFER_PARENT,
  {
    path: 'create',
    breadcrumbName: 'Create Transfer'
  }
];

export const EDIT_TRANSFER_BREADCRUMB: IRoute[] = [
  TRANSFER_PARENT,
  {
    path: ':id',
    breadcrumbName: 'Edit Transfer'
  }
];

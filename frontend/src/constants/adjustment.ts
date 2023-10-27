export enum ADJUSTMENT_REASON {
  OTHER = 'other'
}

export enum ADJUSTMENT_STATUS {
  READY = 'READY',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum REASON_TYPE {
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

const ADJUSTMENT_PARENT: IRoute = {
  path: 'inventory-movements',
  breadcrumbName: 'Inventory Movements'
};

export const CREATE_ADJUSTMENT_BREADCRUMB: IRoute[] = [
  ADJUSTMENT_PARENT,
  {
    path: 'create',
    breadcrumbName: 'Create Adjustment'
  }
];

export const EDIT_ADJUSTMENT_BREADCRUMB = (name: string): IRoute[] => [
  ADJUSTMENT_PARENT,
  {
    path: ':id',
    breadcrumbName: name
  }
];

export const INITIAL_PRODUCT_STATE = {
  sku: '',
  name: '',
  currentQuantity: 0,
  actualQuantity: 0,
  differenceQuantity: 0
};

export const TEST_ID_KEY_ADJUST = 'testAdjustment';

export const REASON = {
  INITIAL_COUNT: 'INITIAL_COUNT'
};

export const DUMP_LOCATION = 'Staging Location';

import { generateFormattedId } from 'src/utils/format-ids';

export const STAGES: IStages[] = [
  {
    status: 'process',
    title: 'Draft',
    icon: 'ModeOutlined'
  },
  {
    status: 'wait',
    title: 'In Review',
    icon: 'VisibilityOutlined'
  },
  {
    status: 'wait',
    title: 'PO',
    icon: 'AssignmentTurnedInOutlined'
  },
  {
    status: 'wait',
    title: 'Locked',
    icon: 'LockOutlined'
  }
];

export const INITIAL_PO_FILTER = {
  country: null,
  businessUnitId: null,
  warehouseId: null,
  status: null,
  from: null,
  till: null
};

export const RFQ = {
  ENDPOINT: 'purchase-orders'
};

export const PO_SEARCH_CAT_LIST = [
  { category: 'vendor', title: 'Vendor' },
  { category: 'id', title: 'Id' },
  { category: 'products', title: 'Products' },
  { category: 'purchaser', title: 'Purchaser' }
];

export const INTIAL_PO_SEARCH_STATE = {
  vendor: [],
  id: [],
  products: [],
  purchaser: []
};

export enum PO_STATUS {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  PO = 'PO',
  LOCKED = 'LOCKED',
  CANCELLED = 'CANCELLED'
}

export const READ_ONLY_STATES = ['PO', 'LOCKED', 'CANCELLED'];

const RFQ_PARENT: IRoute = {
  path: 'purchase-order',
  breadcrumbName: 'Purchase'
};

const RFQ_CREATE_BREADCRUMBS: IRoute[] = [
  RFQ_PARENT,
  {
    path: 'create',
    breadcrumbName: 'Create an RFQ'
  }
];

const RFQ_EDIT_BREADCRUMBS: IRoute[] = [
  RFQ_PARENT,
  {
    path: ':id',
    breadcrumbName: 'Edit RFQ'
  }
];

const RFQ_CANCEL_BREADCRUMBS: IRoute[] = [
  RFQ_PARENT,
  {
    path: ':id',
    breadcrumbName: 'Cancelled RFQ'
  }
];

export const getPOBreadCrumb = (status: string, id: TNumberOrString = '') => {
  const breadcrumb: TObject = {
    DRAFT: RFQ_CREATE_BREADCRUMBS,
    IN_REVIEW: RFQ_EDIT_BREADCRUMBS,
    PO: [
      RFQ_PARENT,
      { path: ':id', breadcrumbName: `P${generateFormattedId(id)}` }
    ],
    LOCKED: [
      RFQ_PARENT,
      { path: ':id', breadcrumbName: `P${generateFormattedId(id)}` }
    ],
    CANCELLED: RFQ_CANCEL_BREADCRUMBS
  };

  return breadcrumb[status];
};

export const PO_TABLE_KEYS = {
  SKU: {
    CODE: 'sku',
    NAME: 'name'
  },
  QTY: 'quantity',
  PRC: 'price',
  MRP: 'mrp'
};

export const NEW_PO_PRODUCT_ROW: IPOProducts = {
  key: 0,
  id: 0,
  sku: '',
  name: '',
  quantity: '0',
  price: '0',
  mrp: '0',
  subTotalWithoutTax: '0',
  subTotalWithTax: '0',
  taxAmount: '0',
  taxType: ''
};

export enum PO_TYPES_CODES {
  STANDARD = 'STANDARD',
  SHUTTLING = 'SHUTTLING',
  PROJECTION = 'PROJECTION',
  JIT = 'JIT',
  DIRECT_DELIVERY = 'DIRECT_DELIVERY',
  EXCLUSIVE_DISTRIBUTION = 'EXCLUSIVE_DISTRIBUTION',
  FREE_OF_COST = 'FREE_OF_COST'
}

export const PO_TYPES = [
  { id: PO_TYPES_CODES.STANDARD, name: 'Standard' },
  { id: PO_TYPES_CODES.SHUTTLING, name: 'Shuttling' },
  { id: PO_TYPES_CODES.PROJECTION, name: 'Projection' },
  { id: PO_TYPES_CODES.JIT, name: 'JIT' },
  { id: PO_TYPES_CODES.DIRECT_DELIVERY, name: 'Direct Delivery' },
  { id: PO_TYPES_CODES.EXCLUSIVE_DISTRIBUTION, name: 'Exclusive Distribution' },
  { id: PO_TYPES_CODES.FREE_OF_COST, name: 'Free of Cost' }
];

export const TEST_ID_KEY_PO = 'testPO';

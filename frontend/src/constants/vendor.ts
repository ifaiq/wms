export enum VENDOR_TYPE {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  AOP = 'AOP'
}

export const VENDOR_TYPES = [
  { id: VENDOR_TYPE.INDIVIDUAL, name: VENDOR_TYPE.INDIVIDUAL },
  { id: VENDOR_TYPE.COMPANY, name: VENDOR_TYPE.COMPANY },
  { id: VENDOR_TYPE.AOP, name: VENDOR_TYPE.AOP }
];

export const INITAIL_VENDOR_FILTERS: Record<string, string | null> = {
  country: null
};

export const VENDOR_SEARCH_CAT_LIST = [
  { category: 'name', title: 'Vendor' },
  { category: 'phone', title: 'Phone' },
  { category: 'email', title: 'Email' },
  { category: 'taxID', title: 'Tax Id' }
];

export const INTIAL_VENDOR_SEARCH_STATE = {
  name: [],
  phone: [],
  email: [],
  taxID: []
};

export const VSTAGES: IStages[] = [
  {
    status: 'wait',
    title: 'DRAFT',
    icon: 'ModeOutlined'
  },
  {
    status: 'wait',
    title: 'IN REVIEW',
    icon: 'VisibilityOutlined'
  },
  {
    status: 'wait',
    title: 'LOCKED',
    icon: 'LockOutlined'
  }
];

export enum VENDOR_STATUSES {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  LOCKED = 'LOCKED',
  DISABLED = 'DISABLED'
}

const VENDOR_PARENT: IRoute = {
  path: 'vendors',
  breadcrumbName: 'Vendors'
};

const CREATE_VENDOR: IRoute[] = [
  VENDOR_PARENT,
  {
    path: 'create',
    breadcrumbName: 'Create a Vendor'
  }
];

const EDIT_VENDOR: IRoute[] = [
  VENDOR_PARENT,
  {
    path: ':id',
    breadcrumbName: 'Edit Vendor'
  }
];

export const getVendorBreadCrumb = (
  status: string,
  id: TNumberOrString = ''
) => {
  const breadcrumb: TObject = {
    DRAFT: CREATE_VENDOR,
    IN_REVIEW: EDIT_VENDOR,
    DISABLED: [VENDOR_PARENT, { path: ':id', breadcrumbName: id }],
    LOCKED: [VENDOR_PARENT, { path: ':id', breadcrumbName: id }]
  };

  return breadcrumb[status];
};

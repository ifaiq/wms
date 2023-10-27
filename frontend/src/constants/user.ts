export const INITIAL_USER_SEARCH_STATE = {
  email: [],
  name: []
};

export const USER_SEARCH_CAT_LIST = [
  { category: 'email', title: 'Email' },
  { category: 'name', title: 'Name' }
];

const USER_PARENT: IRoute = {
  path: 'users',
  breadcrumbName: 'Users'
};

export const USER_CREATE_BREADCRUMBS: IRoute[] = [
  USER_PARENT,
  {
    path: 'create',
    breadcrumbName: 'Create a user'
  }
];

export const USER_EDIT_BREADCRUMBS = (id: TNumberOrString): IRoute[] => {
  return [
    USER_PARENT,
    {
      path: ':id',
      breadcrumbName: `User ${id}`
    }
  ];
};

export enum USER_STATUS {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export const EMAIL_VALIDATION = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');

const LOCATION_PARENT: IRoute = {
  path: 'locations',
  breadcrumbName: 'Location'
};

export const LOCATION_CREATE_BREADCRUMBS: IRoute[] = [
  LOCATION_PARENT,
  {
    path: 'create',
    breadcrumbName: 'Create a Location'
  }
];

export const LOCATION_EDIT_BREADCRUMBS = (
  locationName = 'Edit Location'
): IRoute[] => {
  return [
    LOCATION_PARENT,
    {
      path: ':id',
      breadcrumbName: locationName
    }
  ];
};

export const INITIAL_LOCATION_FILTER = {
  country: null,
  businessUnitId: null,
  warehouseId: null
};

export const TEST_ID_KEY_LOCATION = 'testLocation';

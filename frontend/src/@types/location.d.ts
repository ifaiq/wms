interface ILocationHeading {
  pageBreadCrumb: IRoute[];
  headingText: string;
}

interface ILocation {
  id?: TNumberOrString;
  name: string;
  country: string;
  businessUnitId: number;
  warehouseId: number;
  parentId: number | null;
  availableForSale: boolean;
  grnApplicable: boolean;
  returnApplicable?: boolean;
}

interface ILocationConfigs {
  locationId: boolean;
  selectedParentId: TNumberOrString;
  selectedParentsConfigs: TObject;
}

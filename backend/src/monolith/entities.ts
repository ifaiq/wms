import { Country, RequestType } from '@prisma/client';

export interface Monolith {
  GetBusinessUnits(country: string): Promise<BusinessUnit[]>;
  GetLocations(businessUnitID: number): Promise<Location[]>;
  GetBusinessUnitById(businessUnitID: number): Promise<BusinessUnit>;
  GetLocationById(locationID: number): Promise<Location>;
  ValidateAvailableForSaleQuantity(
    products: ValidateProductQuantity[],
    warehouseId: number
  ): Promise<{ batches: number[]; productId: number }[]>;
}

export interface Location {
  id: number;
  name: string;
  businessUnitId?: string;
}
export interface BusinessUnit {
  id: number;
  name: string;
  countryCode?: string;
}
export interface Product {
  id: number;
  name: string;
  sku: string;
  currentQuantity?: number;
}

// Body of the request the is made to monolith for updating
// inventory
export interface UpdateInventoryBody {
  type: RequestType;
  reason?: string;
  products: UpdateProduct[];
  referenceId: number;
  physicalQuantity: boolean;
  stockQuantity: boolean;
}
export interface UpdateProduct {
  id: number;
  quantity: number;
}

export interface ValidateProductQuantity {
  id: number;
  availableQuantity: number;
}

export interface CreateProductDumpLocation {
  country: Country;
  businessUnitId: number;
  warehouseId: number;
  createdById: number;
}

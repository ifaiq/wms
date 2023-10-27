export interface ITransferValidationData {
  transfers: Record<string, any>;
  countryCode: string;
  warehouseId: number;
  validFromLocations: Record<string, any>;
  validToLocations: Record<string, any>;
  reasonsObject: Record<string, any>;
  validProducts: Record<string, any>;
  validProductsAppSearch: Record<string, any>;
  initailCountId: number;
}

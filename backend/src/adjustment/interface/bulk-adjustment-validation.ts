export interface IAdjustmentValidationData {
  adjustments: Record<string, any>;
  countryCode: string;
  warehouseId: number;
  initailCountId: number;
  validLocations: Record<string, any>;
  reasonsObject: Record<string, any>;
  validProductsInventoryTableObj: Record<string, any>;
  validProductsAppSearchObj: Record<string, any>;
  stagingLocationId: number;
}

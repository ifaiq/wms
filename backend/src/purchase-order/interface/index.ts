export interface POValidProducts {
  id: number;
  name: any;
  sku: any;
  currentQuantity: any;
  isDeactivated: any;
}

export interface POValidationData {
  purchaseOrders: Record<string, unknown>[];
  countryCode: string;
  warehouseId: number | undefined;
  vendorIds: number[];
  validProducts: POValidProducts[];
}

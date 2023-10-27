interface IADJUST_INFO {
  headingText: string;
  createdDate: Date;
  confirmedDate?: Date;
  showConfirm?: boolean;
  onConfirm: TFunction;
  isDisabled?: boolean;
}

interface IAdjustProductTable {
  disabled?: boolean;
  subLocationId: number | string;
}

interface IAdjustmentTable {
  key: React.Key;
  productId?: number;
  name: string;
  sku: string;
  currentQuantity: number;
  actualQuantity: number;
  differenceQuantity: number;
}

interface IAdjustForm {
  props: Record<string, any>;
}

interface IAdjustBulkUploadProducts {
  file: TDocsOrMultimedia;
  warehouseId: TNumberOrString;
  name: string;
  reason: string;
  subLocationId?: TNumberOrString;
}

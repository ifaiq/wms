interface ITransferInfo {
  headingText: string;
  createdDate: Date;
  confirmedDate?: Date;
  showConfirm?: boolean;
  onConfirm: TFunction;
}

interface ITransferProductTable {
  disabled?: boolean;
  subLocationId: number | string;
}

interface ITransferTable {
  key: React.Key;
  productId?: number;
  name: string;
  sku: string;
  currentQuantity: number;
  transferQuantity: number;
}

interface ITransferForm {
  props: Record<string, any>;
}

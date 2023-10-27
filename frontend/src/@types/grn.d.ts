interface IReceipt {
  id: number;
  returnedReceiptId?: TStringOrEmpty;
  vendorName: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'READY' | 'DONE' | 'CANCELLED';
}
interface IGRN {
  id: number | string;
  products: IGRNProductUpdate[];
  reasonId?: number | string;
}
interface IGRNProductUpdate {
  productId?: number | string;
  quantityReceived?: number;
  quantityReturned?: number;
  expiry?: string | Date | null;
}
interface IGRNProduct {
  id: number;
  productId?: number | string;
  key?: string | number;
  returnedReceiptId?: TStringOrEmpty;
  quantityReturned?: number;
  quantityReceived: number;
  quantityOrdered: number;
  expiry?: string | Date | null;
  status: 'READY' | 'DONE' | 'CANCELLED';
  sku: string;
  name: string;
}
interface IGRNTable {
  allowEdit: boolean;
  returnGrnActive: boolean;
  status: 'READY' | 'DONE' | 'CANCELLED';
}

interface IGrnAttachments {
  receiptId: TNumberOrString;
  disabled?: boolean;
  documentType: string;
}

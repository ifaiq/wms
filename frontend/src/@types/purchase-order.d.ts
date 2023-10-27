interface IStages {
  status?: 'wait' | 'process' | 'finish' | 'error';
  title: string;
  icon: string;
}

interface I_PO {
  id: string | null;
  country: string;
  businessUnitId: number;
  businessUnitName: string;
  warehouseId: number;
  warehouseName?: string;
  purchaserId: number;
  vendorId: number;
  subTotalWithoutTax: number;
  totalTaxAmount: number;
  totalWithTax: number;
  sourceDocument?: string;
  payment?: string;
  paymentDays?: string;
  orderAt?: Date;
  confirmedAt?: Date;
  receivedAt?: Date;
  updatedAt?: Date;
  status?: string;
  products: IPOProducts[];
  vendor: IVendor;
}

interface IPOProducts {
  key: number | string;
  id?: number;
  sku: string;
  name: string;
  quantity: string;
  price: string;
  mrp: string;
  taxAmount?: string;
  subTotalWithoutTax: string;
  subTotalWithTax: string;
  taxType?: string;
}

interface IPOForm extends IFormProps {
  disabled?: boolean;
  resetFrom?: boolean;
  edit?: boolean;
  formData?: TObject;
}

interface IPOHeadingButtons {
  onConfirmPO?: TFunction;
  onLockUnlockPO?: TFunction;
  disabled?: boolean;
}

interface IPOHeadings extends IPOHeadingButtons {
  headingText: string;
  buyerName: string;
  id?: number | string;
  date: string | Date;
}

interface IPOStatus {
  title: string;
  icon: ReactNode;
  onClick?: TFunction;
}

interface IProductTable {
  disabled?: boolean;
  locationId: number | string;
  id?: TNumberOrString;
  poStatus?: string;
  isLoading?: boolean;
}

interface IBulkUploadProducts {
  file: TDocsOrMultimedia;
  warehouseId?: TNumberOrString;
  locationId?: TNumberOrString;
  name: string;
}

interface ISearchProducts {
  name: string;
  sku: string;
  currentPage: number;
  pageSize: number;
  locationId?: TNumberOrString;
  subLocationId?: TNumberOrString;
  isInitialCount?: boolean;
}

interface IUploadAttachment {
  id: number | string;
  path?: string;
  fieldName: string;
  alignment?: string;
  dataTestID?: string;
  dataTestIdPath?: string;
  dataTestIdRemove?: string;
}

interface IIDownloadButtonData {
  path: string;
  icon: ReactNode;
  onClick?: TFunction;
}

interface IITableData {
  id: React.Key;
  dateOfCreation: string;
  type: string;
  refId: string;
  refDocType: string;
}

interface ITaxCalculation {
  amount: number;
  taxes: Array<object>;
  grandAmount: number;
}

interface IDraftInvoice {
  createdById: number;
  type: string;
  vendorId: number;
  detail: object;
}

interface IUpdateDraftInvoice extends IDraftInvoice {
  id: string;
}

interface ICreateInvoiceDto {
  invoiceType: string;
  countryCode: string;
  orderId?: string;
  payload?: object;
  isCreditNote?: true;
}

interface IVendor {
  id?: number;
  name: string | null;
  type: string;
  country: string | null;
  taxId?: number;
  address?: string;
  phone?: string;
  email?: string;
  company?: string;
  jobPosition?: string;
  bankAccounts?: Array<object>;
  disabled?: boolean;
  strn?: string | null;
  status?: string;
  taxGroup: string;
  attachment?: TArrayOfObjects;
}
interface IVendorInfo {
  id: number | string;
}

interface IVendorChange {
  changeStatus?: TFunctionOrObject;
  status?: string;
}

interface IVendorDisable {
  disabled: boolean;
  id: number | string;
}

interface IVendorStatus {
  status: string;
  id: number | string;
}

interface IVendorAttachment {
  fileName: string;
  path: string;
  fieldName: string;
}

interface IBAN {
  format: string;
  sample: string;
  country: string;
}

interface IVendorTaxGroup {
  vendorId: number;
  taxGroupId: string;
}

type IVendorTaxGroupType = {
  t: any;
  taxGroups: any;
  disabled?: boolean;
  taxGroup: string;
};

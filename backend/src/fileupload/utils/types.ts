export type fileAttachment = {
  fieldName: string;
  key?: string;
  fileName: string;
  path: string;
};

export type RFQFileDto = {
  id?: number;
  sku: string;
  name?: string;
  quantity: number;
  price: number;
  mrp: number;
};

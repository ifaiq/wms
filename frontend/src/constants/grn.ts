import { generateFormattedId } from 'src/utils/format-ids';
import { getGrnorReturnFormate } from 'src/utils/grn-formate';
import { FILE_TYPE } from './upload-component';

export enum GRNStatus {
  READY = 'READY',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

const RECEIPTS: IRoute = {
  path: 'receipts',
  breadcrumbName: 'Receipts'
};

export const getReceiptsBreadCrumb = (id: TNumberOrString) => {
  return [
    {
      breadcrumbName: `P${generateFormattedId(id)}`,
      path: `purchase-order/${id}`
    },
    RECEIPTS
  ];
};

export const getGRNBreadCrumb = (
  id: TNumberOrString,
  grnID: TNumberOrStringOrEmpty,
  receiptId: number
) => {
  return [
    {
      breadcrumbName: `P${generateFormattedId(id)}`,
      path: `purchase-order/${id}`
    },
    RECEIPTS,
    { breadcrumbName: getGrnorReturnFormate(grnID, receiptId) }
  ];
};

export const FILE_ATTACHMENT_GRN = `${FILE_TYPE.ALL_IMGS}, .pdf, .doc, .docx, .txt, .rtf`;

export const TEST_ID_KEY_GRN = 'testGRN';

export enum RECEIPT_DOCUMENT_TYPE {
  RETURN = 'RETURN',
  RECEIPT = 'RECEIPT',
  RETURN_IN = 'RETURN_IN'
}

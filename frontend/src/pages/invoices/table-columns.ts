import type { ColumnsType } from 'antd/es/table';
import Moment from 'moment';
import { DEBIT_NOTE_TYPES, INVOICES_TYPES } from 'src/constants/common';
import { DATE_FORMAT } from 'src/constants/date-format';

export const getColumns = (t: any) => {
  const columns: ColumnsType<IITableData> = [
    {
      title: t('invoice.companyName'),
      fixed: 'left',
      dataIndex: 'detail',
      key: 'companyName',
      render: (details: any) => (details.customer ? details.customer.name : '-')
    },
    {
      title: t('invoice.dateOfCreation'),
      dataIndex: 'createdAt',
      key: 'dateOfCreation',
      fixed: 'left',
      render: (date: any) => {
        return Moment(date).format(DATE_FORMAT.PURCH_ORDER);
      }
    },
    {
      title: t('invoice.type'),
      dataIndex: 'type',
      key: 'type',
      fixed: 'left',
      render: (item: any) => {
        if (item === INVOICES_TYPES.SERVICE_INVOICE) {
          return t('invoice.serviceInvoice');
        } else if (item === DEBIT_NOTE_TYPES.REBATE) {
          return t('invoice.debitNoteRebate');
        } else if (item === DEBIT_NOTE_TYPES.RETURN) {
          return t('invoice.debitNoteReturn');
        } else return '-';
      }
    },

    {
      title: t('invoice.refDocType'),
      dataIndex: 'type',
      key: 'refDocType',
      fixed: 'left',
      render: (item: any) => {
        if (item === INVOICES_TYPES.SERVICE_INVOICE) {
          return t('invoice.serviceOrder');
        } else return 'N/A';
      }
    },
    {
      title: t('invoice.refId'),
      dataIndex: 'refId',
      key: 'refId',
      fixed: 'left',
      render: (item: any) => (item ? item : 'N/A')
    }
  ];

  return columns;
};

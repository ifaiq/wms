import Moment from 'moment';
import { DEBIT_NOTE_TYPES, INVOICES_TYPES } from 'src/constants/common';
import { DATE_FORMAT } from 'src/constants/date-format';

export const getDraftInvoicesColumns = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: t('invoice.companyName'),
      fixed: 'left',
      dataIndex: 'detail',
      key: 'companyName',
      render: (details: any) =>
        details?.customer ? details?.customer.name : '-'
    },
    {
      title: `${t('invoice.date')}`,
      dataIndex: 'createdAt',
      key: 'dateOfCreation',
      fixed: 'left',
      render: (date: any) => {
        return Moment(date).format(DATE_FORMAT.PURCH_ORDER);
      }
    },
    {
      title: `${t('invoice.type')}`,
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
      title: `${t('invoice.orderId')}`,
      dataIndex: 'refId',
      key: 'refId',
      fixed: 'left',
      render: (item: any) => (item ? item : 'N/A')
    }
  ];

  return columns;
};

export const getApprovedInvoicesColumns = (t: any) => {
  const displayInvoiceType = (type: string) => {
    if (type === INVOICES_TYPES.SERVICE_INVOICE) {
      return 'Service Invoice';
    } else if (type === DEBIT_NOTE_TYPES.REBATE) {
      return 'Debit Note (Rebate)';
    } else if (type === DEBIT_NOTE_TYPES.RETURN) {
      return 'Debit Note (Returns)';
    } else if (type === INVOICES_TYPES.FULL_TAX) {
      return 'Goods Invoice (Full Tax)';
    } else if (type === INVOICES_TYPES.THERMAL) {
      return 'Goods Invoice (Thermal)';
    } else if (type === INVOICES_TYPES.CREDIT_NOTE) {
      return 'Credit Note';
    } else return '-';
  };

  const columns: ITableColumn[] = [
    {
      title: `${t('invoice.companyName')}`,
      fixed: 'left',
      dataIndex: 'customer',
      key: 'companyName',
      render: (customer: any) => {
        if (customer) {
          return customer?.businessName
            ? customer?.businessName
            : customer?.name;
        } else return '-';
      }
    },
    {
      title: `${t('invoice.date')}`,
      dataIndex: 'createdAt',
      key: 'dateOfCreation',
      fixed: 'left',
      render: (date: any) => {
        return Moment(date).format(DATE_FORMAT.PURCH_ORDER);
      }
    },
    {
      title: `${t('invoice.type')}`,
      dataIndex: 'invoiceType',
      key: 'type',
      fixed: 'left',
      /**
       * ToDo: Will be changed in later PR's when invoices microservice is created
       **/
      render: (item: any) => displayInvoiceType(item)
    },
    {
      title: `${t('invoice.invoiceId')}`,
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      fixed: 'left',
      render: (item: any) => (item ? item : '-')
    },
    {
      title: `${t('invoice.orderId')}`,
      dataIndex: 'orderId',
      key: 'orderId',
      fixed: 'left',
      render: (item: any) => (item ? item : 'N/A')
    }
  ];

  return columns;
};

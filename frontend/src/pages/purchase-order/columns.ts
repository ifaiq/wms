import Moment from 'moment';
import { DATE_FORMAT } from '../../constants/date-format';
import { getCurrency } from 'src/store/selectors/features/app';
import { generateFormattedId } from 'src/utils/format-ids';

export const getPOColumns = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('po.refNo')}`,
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      render: (item: any) => `P${generateFormattedId(item)}`
    },
    {
      title: `${t('po.vendorName')}`,
      dataIndex: 'vendor',
      key: 'vendorId',
      render: (item: any) => item?.name
    },
    {
      title: `${t('po.date')}`,
      dataIndex: 'createdAt',
      key: 'date',
      render: (item: any) => Moment(item).format(DATE_FORMAT.PURCH_ORDER)
    },
    {
      title: `${t('po.purchaseRep')}`,
      dataIndex: 'purchaser',
      key: 'purchaserId',
      render: (item: any) => item?.name
    },
    {
      title: `${t('po.totalAmount')}`,
      key: 'totalWithTax',
      render: (item: any) =>
        item?.currency
          ? `${item.totalWithTax} ${item.currency}`
          : `${item.totalWithTax} ${getCurrency(item.country)}`
    }
  ];

  return columns;
};

export const getPOProductCols = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('po.subTotal')}`,
      dataIndex: 'subTotalWithoutTax',
      key: 'subTotalWithoutTax',
      width: '8%',
      editable: false
    },
    {
      title: `${t('po.taxType')}`,
      dataIndex: 'taxType',
      key: 'taxType',
      width: '10%',
      editable: false
    },
    {
      title: `${t('po.total')}`,
      dataIndex: 'subTotalWithTax',
      key: 'subTotalWithTax',
      width: '10%',
      editable: false
    }
  ];

  return columns;
};

export const getReadOnlyPOProductCols = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('po.skuCode')}`,
      dataIndex: 'sku',
      key: 'sku',
      width: '15%',
      fixed: 'left',
      editable: false
    },
    {
      title: `${t('po.skuName')}`,
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      editable: false
    },
    {
      title: `${t('po.qtyPerUnit')}`,
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      editable: false
    },
    {
      title: `${t('po.qtyReceived')}`,
      dataIndex: 'availableQuantities',
      key: 'availableQuantities',
      width: '10%',
      editable: false
    },
    {
      title: `${t('po.pricePerUnit')}`,
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      editable: false
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      width: '10%',
      editable: false
    },
    {
      title: `${t('po.subTotal')}`,
      dataIndex: 'subTotalWithoutTax',
      key: 'subTotalWithoutTax',
      width: '10%',
      editable: false
    },
    {
      title: `${t('po.taxType')}`,
      dataIndex: 'taxType',
      key: 'taxType',
      width: '10%',
      editable: false
    },
    {
      title: `${t('po.total')}`,
      dataIndex: 'subTotalWithTax',
      key: 'subTotalWithTax',
      width: '10%',
      editable: false
    }
  ];

  return columns;
};

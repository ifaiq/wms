import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomDatePicker,
  EditableTable,
  InfoList,
  NumberInput
} from 'src/components';
import { DATE_FORMAT } from 'src/constants/date-format';
import {
  getGrnProducts,
  getGRNReceiptId,
  getProductTableInfoDataSourceGRN,
  getReturnInRefId
} from 'src/store/selectors/features/grn';
import {
  updateGRNData,
  updateGRNEditMode
} from 'src/store/slices/features/grn';
import { getGrnProductTableColumns } from './table-columns';
import { getReturnProdTableColumns } from './table-columns-return';

export const GrnProductsTable: React.FC<IGRNTable> = ({
  allowEdit,
  returnGrnActive
}) => {
  const [t] = useTranslation('grn');
  const dispatch = useDispatch();

  const [fieldsRules] = useState<TArrayOfObjects>([
    {
      field: 'quantityReceived',
      rules: [{ required: true, message: t('grn.quantityReceivedAlertForm') }]
    },
    {
      field: 'expiry',
      rules: [{ required: false }]
    }
  ]);

  const grnProducts: any = useSelector(getGrnProducts);
  const receiptId = useSelector(getGRNReceiptId);
  const returnInId = useSelector(getReturnInRefId);
  const infoDataSource = useSelector(getProductTableInfoDataSourceGRN);

  const updateGRNProductDataInReducer = (updatedProducts: TArrayOfObjects) =>
    dispatch(updateGRNData({ key: 'products', value: updatedProducts }));

  const enableGRNEditMode = (mode: boolean) =>
    dispatch(updateGRNEditMode(mode));

  const handleExpiryChange = (
    value: string | number | null | Date,
    record: TObject
  ) => {
    const products = [...grnProducts];

    const productItem: IGRNProduct = products.filter(
      (item) => item.id === record.id
    )?.[0];

    productItem.expiry = moment(value).toISOString();
    dispatch(updateGRNProductDataInReducer([...products]));
    dispatch(enableGRNEditMode(true));
  };

  const getReceiptProduct = (index: number) => {
    const products = [...grnProducts];
    return products[index];
  };

  const updateReceiptProduct = (index: number, key: string, value: number) => {
    const products = [...grnProducts];

    products.splice(index, 1, { ...products[index], [key]: value });

    dispatch(updateGRNProductDataInReducer([...products]));
    dispatch(enableGRNEditMode(true));
  };

  const handleQuantityReceived = (
    index: number,
    key: string,
    value: number
  ) => {
    const product = getReceiptProduct(index);

    if (product.quantityReceived <= product.quantityOrdered) {
      updateReceiptProduct(index, key, value);
    }
  };

  const handleQuantityReturned = (
    index: number,
    key: string,
    value: number
  ) => {
    const product = getReceiptProduct(index);

    if (product.quantityReturned <= product.quantityReceived) {
      updateReceiptProduct(index, key, value);
    }
  };

  const editableColumns: ITableColumn[] = [
    {
      title: `${t('grn.qtyReceived')}`,
      dataIndex: 'quantityReceived',
      key: 'quantityReceived',
      render: (_, record, index) => (
        <NumberInput
          size="large"
          value={grnProducts[index!]?.quantityReceived}
          precision={0}
          maxValue={record?.quantityOrdered}
          disabled={!allowEdit}
          onChange={(value: string) =>
            handleQuantityReceived(
              +index!,
              'quantityReceived',
              parseInt(value) || 0
            )
          }
        />
      )
    },
    {
      title: `${t('grn.quantityReturned')}`,
      dataIndex: 'quantityReturned',
      key: 'quantityReturned',
      render: (_, record, index) => (
        <NumberInput
          size="large"
          value={grnProducts[index!]?.quantityReturned}
          precision={0}
          maxValue={record.quantityReceived}
          disabled={!allowEdit}
          onChange={(value: string) =>
            handleQuantityReturned(
              +index!,
              'quantityReturned',
              parseInt(value) || 0
            )
          }
        />
      )
    }
  ];

  const expiryPickerColumn: ITableColumn[] = [
    {
      title: `${t('grn.expiry')}`,
      dataIndex: 'expiry',
      key: 'expiry',
      render: (_, record) => (
        <CustomDatePicker
          disabled={allowEdit ? false : true}
          format={DATE_FORMAT.GRN}
          value={record?.expiry ? moment(record?.expiry) : null}
          onChange={(date: Date) => handleExpiryChange(date, record)}
        />
      )
    }
  ];

  let productColumns = returnGrnActive
    ? [...getReturnProdTableColumns(t), editableColumns[1]]
    : getGrnProductTableColumns(t);

  if (!returnGrnActive) {
    productColumns = [
      ...productColumns,
      editableColumns[0],
      ...expiryPickerColumn
    ];
  }

  return (
    <EditableTable
      dataSource={grnProducts}
      tableColumns={productColumns}
      showAddRowButton={false}
      fieldsRules={fieldsRules}
      showInfoWindow={receiptId || returnInId ? false : true}
      infoWindow={<InfoList data={infoDataSource} />}
    />
  );
};

export const getAdjustmentProductCols = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('adjust.physicalStock')}`,
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: '10%',
      editable: false
    }
  ];

  return columns;
};

export const getReadOnlyAdjustProductCols = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('adjust.skuCode')}`,
      dataIndex: 'sku',
      key: 'skuCode',
      width: '15%',
      fixed: 'left',
      editable: false
    },
    {
      title: `${t('adjust.skuName')}`,
      dataIndex: 'name',
      key: 'skuName',
      width: '20%',
      editable: false
    },
    {
      title: `${t('adjust.physicalStock')}`,
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: '10%',
      editable: false
    },
    {
      title: `${t('adjust.totalQty')}`,
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: '10%',
      editable: false
    },
    {
      title: `${t('adjust.quantityDiff')}`,
      dataIndex: 'differenceQuantity',
      key: 'differenceQuantity',
      width: '10%',
      editable: false
    }
  ];

  return columns;
};

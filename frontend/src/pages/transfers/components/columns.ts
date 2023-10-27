export const getTransferProductCols = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('transfer.physicalStock')}`,
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: '10%',
      editable: false
    }
  ];

  return columns;
};

export const getReadOnlyTransferProductCols = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('transfer.skuCode')}`,
      dataIndex: 'sku',
      key: 'skuCode',
      width: '15%',
      fixed: 'left',
      editable: false
    },
    {
      title: `${t('transfer.skuName')}`,
      dataIndex: 'name',
      key: 'skuName',
      width: '20%',
      editable: false
    },
    {
      title: `${t('transfer.physicalStock')}`,
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: '10%',
      editable: false
    },
    {
      title: `${t('transfer.transferStock')}`,
      dataIndex: 'transferQuantity',
      key: 'transferQuantity',
      width: '10%',
      editable: false
    }
  ];

  return columns;
};

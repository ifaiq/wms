export const getReturnProdTableColumns = (t: TObject) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('grn.skuCode')}`,
      dataIndex: 'sku',
      key: 'sku',
      editable: false
    },
    {
      title: `${t('grn.skuName')}`,
      dataIndex: 'name',
      key: 'name',
      editable: false
    },
    {
      title: `${t('grn.qtyReceived')}`,
      dataIndex: 'quantityReceived',
      key: 'quantityReceived',
      editable: false,
      render: (_item: TNumberOrStringOrEmpty, record: TObject) =>
        record?.quantityReceived
    }
  ];

  return columns;
};

export const getGrnProductTableColumns = (t: TObject) => {
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
      title: `${t('grn.qtyOrdered')}`,
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
      render: (_item: TNumberOrStringOrEmpty, record: TObject) =>
        record?.quantityOrdered,
      editable: false
    }
  ];

  return columns;
};

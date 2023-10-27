export const getLocationsColumns = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('location.warehouse')}`,
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      fixed: 'left',
      width: '10%'
    },
    {
      title: `${t('location.parentLocation')}`,
      dataIndex: 'parent',
      key: 'parent',
      fixed: true,
      width: '10%',
      render: (item: TObject) => item?.name
    },
    {
      title: `${t('location.location')}`,
      dataIndex: 'name',
      key: 'name',
      fixed: true,
      width: '10%'
    },
    {
      title: `${t('location.priority')}`,
      dataIndex: 'priority',
      key: 'priority',
      fixed: true,
      width: '5%'
    }
  ];

  return columns;
};

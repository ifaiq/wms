export const getUserColumns = (
  t: any,
  handleClick: (record: TObject) => void
) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('user.srNo')}`,
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: '5%',
      onCell: (record) => ({ onClick: () => handleClick(record) })
    },
    {
      title: `${t('user.userName')}`,
      dataIndex: 'name',
      key: 'name',
      fixed: true,
      width: '15%',
      onCell: (record) => ({ onClick: () => handleClick(record) })
    },
    {
      title: `${t('user.email')}`,
      dataIndex: 'email',
      key: 'email',
      fixed: true,
      width: '20%',
      onCell: (record) => ({ onClick: () => handleClick(record) })
    }
  ];

  return columns;
};

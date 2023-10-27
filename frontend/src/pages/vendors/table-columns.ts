import { getCountryName } from 'src/utils/countries';

export const getColumns = (t: any) => {
  const columns: Array<ITableColumn> = [
    {
      title: `${t('vendor.name')}`,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left'
    },
    {
      title: `${t('vendor.company')}`,
      dataIndex: 'company',
      key: 'company',
      render: (item: any) => (item ? item : '-')
    },
    {
      title: `${t('vendor.phone')}`,
      dataIndex: 'phone',
      key: 'phone',
      render: (item: any) => (item ? item : '-')
    },
    {
      title: `${t('vendor.country')}`,
      dataIndex: 'country',
      key: 'country',
      render: (item: any) => getCountryName(item)
    },
    {
      title: `${t('vendor.taxID')}`,
      dataIndex: 'taxID',
      key: 'taxID'
    }
  ];

  return columns;
};

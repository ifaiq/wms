import {
  LockOutlined,
  ModeOutlined,
  NotInterestedOutlined,
  VisibilityOutlined
} from '@mui/icons-material';
import 'antd/dist/antd.css';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  CustomPagination,
  FilterDrawer,
  FilterVendors,
  IconButtonPrimary,
  SearchCategory,
  Stage,
  TableWrapper,
  TopBar
} from 'src/components';
import {
  INTIAL_VENDOR_SEARCH_STATE,
  VENDOR_SEARCH_CAT_LIST
} from 'src/constants/vendor';
import {
  getVendorFilterParams,
  getVendorIsFilterApplied
} from 'src/store/selectors/entities/vendor';
import { getIsCreateVendorAllowed } from 'src/store/selectors/features/vendor';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { INITAIL_PAGINATION_DATA } from '../../constants/common';
import { useGetVendors } from '../../hooks';
import {
  resetVendorFilterParams,
  setVendorFilterParams,
  updateVendors
} from '../../store/slices/entities/vendor';
import { getColumns } from './table-columns';

export const Vendors: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('vendor');

  const isCreateVendor = useSelector(getIsCreateVendorAllowed);
  const filterParams = useSelector(getVendorFilterParams);
  const isFilterApplied = useSelector(getVendorIsFilterApplied);

  const [pagination, setPagination] = useState<IPaginationType>(
    INITAIL_PAGINATION_DATA
  );

  const [searchParams, setSearchParams] = useState<Record<string, string>>();

  const requestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...filterParams,
    ...searchParams
  });

  const { isLoading, data } = useGetVendors(requestPayload);

  const getIcon = (status: string) => {
    const icons: Record<string, ReactNode> = {
      DISABLED: <NotInterestedOutlined color="primary" />,
      IN_REVIEW: <VisibilityOutlined color="primary" />,
      LOCKED: <LockOutlined color="primary" />
    };

    return icons[status];
  };

  const actions = {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    width: 200,
    render: (item: any) => (
      <Stage
        title={item.status.replace(/[^a-z0-9]/gi, ' ')}
        icon={getIcon(item.status)}
      />
    )
  };

  useEffect(() => {
    if (data) dispatch(updateVendors(data?.data?.vendors));
  }, [data]);

  const navigateToEditVendor = (record: IVendor) => {
    history.push(`/vendors/${record?.id}`);
  };
  /* handle pagination state */

  const onChangePagination = (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;
    setPagination((state: IPaginationType) => ({
      ...state,
      skip,
      page,
      take: pageSize
    }));
  };

  /* handle search state */
  const handleSearchData = (values: TObject) => {
    setSearchParams({ ...values });
    setPagination(INITAIL_PAGINATION_DATA);
  };

  const navigateToCreateVendor = () => {
    history.push('/vendors/create');
  };

  /* Action coulmn */
  const onRowClick = (record: TObject | any) => {
    navigateToEditVendor(record);
  };

  /* Merged columns to display */
  const columns = getColumns(t);
  const columnsData = [...columns, { ...actions }];

  const handleFilterSetParams = (values: TObject) =>
    dispatch(setVendorFilterParams(values));

  const handleFilterReset = () => dispatch(resetVendorFilterParams());

  return (
    <>
      <TopBar
        title={t('vendor.vendors')}
        searchComponent={
          <SearchCategory
            onSearch={handleSearchData}
            intialState={INTIAL_VENDOR_SEARCH_STATE}
            categoryList={VENDOR_SEARCH_CAT_LIST}
          />
        }
      />
      <div className="lg:mx-9">
        {/* Action bar */}
        <div
          className={`flex my-6 ${
            isCreateVendor ? 'justify-between' : 'justify-end'
          } items-center`}
        >
          {isCreateVendor && (
            <IconButtonPrimary
              dataTestID="testCreateVendor"
              icon={<ModeOutlined className="mr-2" />}
              size="large"
              text={`${t('vendor.createVendor')}`}
              onClick={() => navigateToCreateVendor()}
            />
          )}

          <div className="flex justify-between items-center">
            <CustomPagination
              simple
              current={pagination?.page}
              pageSize={pagination?.take}
              onChange={onChangePagination}
              total={data?.data?.total ? data?.data?.total : 0}
              showSizeChanger
            />
            <FilterDrawer
              isFilterApplied={isFilterApplied}
              onReset={handleFilterReset}
            >
              <FilterVendors
                filterParams={filterParams}
                applyFilter={handleFilterSetParams}
              />
            </FilterDrawer>
          </div>
        </div>

        {/* Table rendering */}
        <TableWrapper
          columns={columnsData}
          size="middle"
          loading={isLoading}
          dataSource={data?.data?.vendors}
          rowKey={(record: IVendor) => record.id}
          pagination={false}
          onRow={(record: TObject | undefined) => ({
            onClick: () => onRowClick(record)
          })}
        />
      </div>
    </>
  );
};

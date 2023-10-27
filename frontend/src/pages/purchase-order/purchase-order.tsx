import {
  AssignmentTurnedInOutlined,
  HighlightOffOutlined,
  LockOutlined,
  ModeOutlined,
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
  FiltersPO,
  IconButtonPrimary,
  SearchCategory,
  Stage,
  TableWrapper,
  TopBar
} from 'src/components';
import {
  INTIAL_PO_SEARCH_STATE,
  PO_SEARCH_CAT_LIST
} from 'src/constants/purchase-order';
import {
  getPOFilterParams,
  getPOIsFilterApplied,
  getPurchaseOrders
} from 'src/store/selectors/entities/purchase-order';
import { getIsCreatePOAllowed } from 'src/store/selectors/features/purchase-order';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { INITAIL_PAGINATION_DATA } from '../../constants/common';
import { useGetPOs } from '../../hooks';
import {
  resetPOFilterParams,
  setPOFilterParams,
  updatePurchaseOrders
} from '../../store/slices/entities/purchase-order';
import { getPOColumns } from './columns';
import { BulkCreatePO } from './components/bulk-create-po';

const getIcon = (status: string) => {
  const icons: Record<string, ReactNode> = {
    DRAFT: <ModeOutlined color="primary" />,
    IN_REVIEW: <VisibilityOutlined color="primary" />,
    PO: <AssignmentTurnedInOutlined color="primary" />,
    LOCKED: <LockOutlined color="primary" />,
    CANCELLED: <HighlightOffOutlined color="primary" />
  };

  return icons[status];
};

export const PurchaseOrder: React.FC = () => {
  const [t] = useTranslation('po');
  const dispatch = useDispatch();
  const history = useHistory();

  const [pagination, setPagination] = useState<IPaginationType>(
    INITAIL_PAGINATION_DATA
  );

  const [searchParams, setSearchParams] = useState<Record<string, string>>();

  const isCreatePO = useSelector(getIsCreatePOAllowed);
  const purchaseorders = useSelector(getPurchaseOrders);

  const filterParams = useSelector(getPOFilterParams);
  const isFilterApplied = useSelector(getPOIsFilterApplied);

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

  const requestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...filterParams,
    ...searchParams
  });

  const { isLoading, data, refetch } = useGetPOs(requestPayload);

  useEffect(() => {
    if (data) dispatch(updatePurchaseOrders(data?.data?.purchaseorders));
  }, [data]);

  const onRowClick = (record: TObject | any) => {
    history.push(`/purchase-order/${record?.id}`);
  };

  const navigateToCreatePO = () => {
    history.push('/purchase-order/create');
  };

  const actions = {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    width: 200,
    render: (item: TObject) => (
      <Stage
        title={item.status?.split('_').join(' ')}
        icon={getIcon(item.status)}
      />
    )
  };

  const columns = getPOColumns(t);
  const columnsData: any = [...columns, { ...actions }];

  const handleFilterSetParams = (values: TObject) =>
    dispatch(setPOFilterParams(values));

  const handleFilterReset = () => dispatch(resetPOFilterParams());

  return (
    <>
      <TopBar
        title={t('po.purchase')}
        searchComponent={
          <SearchCategory
            onSearch={handleSearchData}
            intialState={INTIAL_PO_SEARCH_STATE}
            categoryList={PO_SEARCH_CAT_LIST}
          />
        }
      />
      <div className="lg:mx-9">
        <div
          className={`flex my-6 items-center ${
            isCreatePO ? 'justify-between' : 'justify-end'
          }`}
        >
          {isCreatePO && (
            <div className="flex">
              <IconButtonPrimary
                icon={<ModeOutlined className="mr-2" />}
                text={t('po.createRFQ')}
                onClick={navigateToCreatePO}
              />
              {/* here will be an upload button */}
              <BulkCreatePO refetch={refetch} />
            </div>
          )}
          <div className="flex justify-between items-center">
            <CustomPagination
              simple
              current={pagination?.page}
              pageSize={pagination?.take}
              onChange={onChangePagination}
              total={data?.data?.total}
              showSizeChanger
            />
            <FilterDrawer
              isFilterApplied={isFilterApplied}
              onReset={handleFilterReset}
            >
              <FiltersPO
                filterParams={filterParams}
                applyFilter={handleFilterSetParams}
              />
            </FilterDrawer>
          </div>
        </div>

        <TableWrapper
          columns={columnsData}
          size="middle"
          loading={isLoading}
          dataSource={purchaseorders}
          rowKey={(record: I_PO) => record.id}
          pagination={false}
          onRow={(record: TObject | undefined) => ({
            onClick: () => onRowClick(record)
          })}
        />
      </div>
    </>
  );
};

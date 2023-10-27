import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  AlarmOnOutlined,
  CheckCircleOutline,
  HighlightOffOutlined,
  ModeOutlined,
  MapOutlined
} from '@mui/icons-material';
import { getTransfersColumns } from './columns';
import { useGetTransfers, useResetState } from 'src/hooks';
import {
  updateTransfers,
  resetTransfersFilterParams,
  setTransfersFilterParams
} from 'src/store/slices/entities/transfer';
import {
  getTransfers,
  getTrasnfersFilterParams,
  getTrasnfersIsFilterApplied
} from 'src/store/selectors/entities/transfer';
import { resetAdjustmentData } from 'src/store/slices/features/adjustment';
import { getIsCreateAdjustAllowed } from 'src/store/selectors/features/adjustment';
import { getIsCreateTransferAllowed } from 'src/store/selectors/features/transfer';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { INITAIL_PAGINATION_DATA } from '../../constants/common';
import {
  INITIAL_TRANSFER_SEARCH_STATE,
  TEST_ID_KEY_TRANSFER,
  TRANSFER_SEARCH_CAT_LIST,
  TRANSFER_TYPES
} from 'src/constants/transfers';
import {
  Stage,
  TopBar,
  SearchCategory,
  IconButtonPrimary,
  CustomPagination,
  FilterDrawer,
  TableWrapper,
  TransferFilter
} from 'src/components';
import { resetTransferData } from 'src/store/slices/features/transfer';
import { BulkCreateAdjustment } from '../adjustment/components';
import { BulkCreateTransfers } from './components';

const getIcon = (status: string) => {
  const icons: Record<string, ReactNode> = {
    READY: <AlarmOnOutlined color="primary" />,
    CANCELLED: <HighlightOffOutlined color="primary" />,
    DONE: <CheckCircleOutline color="primary" />
  };

  return icons[status];
};

export const Transfers: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('transfer');

  useResetState(resetAdjustmentData);
  useResetState(resetTransferData);

  const [searchParams, setSearchParams] = useState<Record<string, string>>();

  const [pagination, setPagination] = useState<IPaginationType>(
    INITAIL_PAGINATION_DATA
  );

  const transfers = useSelector(getTransfers);
  const isCreateAdjustment = useSelector(getIsCreateAdjustAllowed);
  const isCreateTransfer = useSelector(getIsCreateTransferAllowed);
  const filterParams = useSelector(getTrasnfersFilterParams);
  const isFilterApplied = useSelector(getTrasnfersIsFilterApplied);

  const requestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...filterParams,
    ...searchParams
  });

  const {
    isLoading,
    data,
    refetch: refetchTransfers
  } = useGetTransfers(requestPayload);

  useEffect(() => {
    if (data) dispatch(updateTransfers(data?.data?.transfers));
  }, [data]);

  const onChangePagination = (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;
    setPagination((state: IPaginationType) => ({
      ...state,
      skip,
      page,
      take: pageSize
    }));
  };

  const handleSearchData = (values: TObject) => {
    setSearchParams({ ...values });
    setPagination(INITAIL_PAGINATION_DATA);
  };

  const navigateToCreateAdjustment = () => {
    history.push('inventory-movements/adjustment/create');
  };

  const navigateToCreateTransfer = () => {
    history.push('inventory-movements/transfer/create');
  };

  const onRowClick = (record: TObject) => {
    if (record?.type === TRANSFER_TYPES.Adjustment) {
      history.push(`inventory-movements/adjustment/${record?.id}`);
    } else if (
      record?.type === TRANSFER_TYPES.GRN ||
      record?.type === TRANSFER_TYPES.RETURN_IN
    ) {
      history.push(`purchase-order/${record?.poId}/receipts/${record?.id}`);
    } else if (record?.type === TRANSFER_TYPES.Return) {
      history.push(`purchase-order/${record?.poId}/return/${record?.id}`);
    } else if (record?.type === TRANSFER_TYPES.Transfer) {
      history.push(`inventory-movements/transfer/${record?.id}`);
    }
  };

  const actions = {
    title: 'Status',
    key: 'status',
    fixed: 'right',
    width: 200,
    render: (item: any) => (
      <Stage title={item.status} icon={getIcon(item.status)} />
    )
  };

  const columns = getTransfersColumns(t);
  const columnsData: any = [...columns, { ...actions }];

  const handleFilterSetParams = (values: TObject) =>
    dispatch(setTransfersFilterParams(values));

  const handleFilterReset = () => dispatch(resetTransfersFilterParams());

  return (
    <>
      <TopBar
        title={t('transfer.inventoryMovements')}
        searchComponent={
          <SearchCategory
            onSearch={handleSearchData}
            intialState={INITIAL_TRANSFER_SEARCH_STATE}
            categoryList={TRANSFER_SEARCH_CAT_LIST}
          />
        }
      />

      <div className="lg:mx-9">
        <div
          className={`flex my-6 items-center ${
            isCreateAdjustment || isCreateTransfer
              ? 'justify-between'
              : 'justify-end'
          }`}
        >
          <div className="flex items-center">
            {isCreateAdjustment && (
              <>
                <IconButtonPrimary
                  icon={<ModeOutlined className="mr-2" />}
                  size="large"
                  text={`${t('transfer.createAdjustment')}`}
                  onClick={navigateToCreateAdjustment}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}CreateAdjustment`}
                />
                <BulkCreateAdjustment refetch={refetchTransfers} />
              </>
            )}
            {isCreateTransfer && (
              <>
                <IconButtonPrimary
                  icon={<MapOutlined className="mr-2" />}
                  size="large"
                  text={`${t('transfer.create')}`}
                  onClick={navigateToCreateTransfer}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}CreateTransfer`}
                />
                <BulkCreateTransfers refetch={refetchTransfers} />
              </>
            )}
          </div>
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
              <TransferFilter
                filterParams={filterParams}
                applyFilter={handleFilterSetParams}
              />
            </FilterDrawer>
          </div>
        </div>

        <TableWrapper
          columns={columnsData}
          loading={isLoading}
          size="middle"
          dataSource={transfers}
          rowKey={(record: TObject) => record?.index}
          pagination={false}
          onRow={(record: TObject | undefined) => ({
            onClick: () => onRowClick(record)
          })}
        />
      </div>
    </>
  );
};

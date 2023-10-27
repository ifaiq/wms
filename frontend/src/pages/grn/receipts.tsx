import {
  AlarmOnOutlined,
  CheckCircleOutlineOutlined,
  HighlightOffOutlined
} from '@mui/icons-material';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { BreadCrumbs, Stage, TableWrapper, TopBar } from 'src/components';
import { getReceiptsBreadCrumb } from 'src/constants/grn';
import { useGetReceiptsByPoId, useResetState } from 'src/hooks';
import { getFormatedReceiptsData } from 'src/store/selectors/entities/receipts';
import { updateGRNReceiptData } from 'src/store/slices/entities/receipt';
import { resetGRNData } from 'src/store/slices/features/grn';
import { getReceiptColumns } from './components/receipts-columns';

const getIcon = (status: string) => {
  const icons: Record<string, ReactNode> = {
    READY: <AlarmOnOutlined color="primary" />,
    DONE: <CheckCircleOutlineOutlined color="primary" />,
    CANCELLED: <HighlightOffOutlined color="primary" />
  };

  return icons[status];
};

export const Receipts: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('grn');
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const receiptsData = useSelector(getFormatedReceiptsData);

  const { isLoading, data } = useGetReceiptsByPoId(id);

  useResetState(resetGRNData);

  useEffect(() => {
    if (data?.data) {
      dispatch(updateGRNReceiptData(data.data));
    }
  }, [data?.data]);

  const navigateToReceipts = (row: TObject) => {
    const url = row?.receiptId
      ? `/purchase-order/${id}/return`
      : `/purchase-order/${id}/receipts`;

    history.push(`${url}/${row.id}`);
  };

  const actions = {
    title: t('grn.status'),
    key: 'status',
    dataIndex: 'status',
    fixed: 'right',

    width: 200,
    render: (item: string) => <Stage title={item} icon={getIcon(item)} />
  };

  const columns = getReceiptColumns(t);
  const columnsData: TObject[] = [...columns, { ...actions }];

  return (
    <>
      <TopBar title={t('grn.receipts')} />
      <div className="ml-9 mb-4">
        <BreadCrumbs routesArray={getReceiptsBreadCrumb(id)} />
      </div>
      <div className="lg:mx-9">
        <TableWrapper
          columns={columnsData}
          loading={isLoading}
          dataSource={receiptsData}
          rowKey={(record: IReceipt) => record.id}
          pagination={false}
          onRow={(record: TObject | undefined) => ({
            onClick: () => navigateToReceipts(record)
          })}
        />
      </div>
    </>
  );
};

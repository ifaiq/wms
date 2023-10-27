import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import 'antd/dist/antd.css';
import { useTranslation } from 'react-i18next';
import { TableWrapper } from '../../../components/table';
import {
  addSOData,
  setIsInvoiceEdited
} from 'src/store/slices/features/service-invoice';
import { addVendorData } from 'src/store/slices/features/vendors';
import { getDraftInvoicesColumns } from './columns';
import { getDraftInvoiceData } from 'src/store/selectors/entities/draft-invoices';

export const DraftInvoices: React.FC<TObject> = ({ isLoading }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('invoice');
  const invoices = useSelector(getDraftInvoiceData);

  const navigateToPreviewInvoice = (id: string) => {
    history.push(`/invoices/preview/${id}`);
  };

  const onRowClick = (record: TObject | any) => {
    dispatch(addVendorData(record.detail.customer || {}));
    dispatch(addSOData(record?.detail));
    dispatch(setIsInvoiceEdited(false));
    navigateToPreviewInvoice(record.id || 'draft');
  };

  const columns = getDraftInvoicesColumns(t);

  return (
    <TableWrapper
      columns={columns}
      size="middle"
      loading={isLoading}
      dataSource={invoices}
      rowKey={(record: IITableData) => record.id}
      pagination={false}
      onRow={(record: TObject | undefined) => ({
        onClick: () => onRowClick(record)
      })}
    />
  );
};

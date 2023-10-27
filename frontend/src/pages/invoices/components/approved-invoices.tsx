import React from 'react';
import { useSelector } from 'react-redux';
import 'antd/dist/antd.css';
import { useTranslation } from 'react-i18next';
import { TableWrapper } from '../../../components/table';
import { getApprovedInvoicesColumns } from './columns';
import { getInvoiceData } from 'src/store/selectors/entities/invoice';
import { FileDownloadOutlined } from '@mui/icons-material';

export const ApprovedInvoices: React.FC<TObject> = ({ isLoading }) => {
  const [t] = useTranslation('invoice');
  const invoices = useSelector(getInvoiceData);

  const action = {
    title: '',
    key: 'action',
    fixed: 'center',
    width: 50,
    render: (item: TObject) => {
      if (item.pdfLink) {
        return (
          <a href={item.pdfLink || ''} download="file.ts">
            <div className=" px-3 ">
              <FileDownloadOutlined />
            </div>
          </a>
        );
      } else return '';
    }
  };

  const columns = [...getApprovedInvoicesColumns(t), action];

  return (
    <TableWrapper
      columns={columns}
      size="middle"
      loading={isLoading}
      dataSource={invoices}
      rowKey={(record: IITableData) => record.id}
      rowClassName="cursor-default"
      pagination={false}
    />
  );
};

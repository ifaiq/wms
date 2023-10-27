import React from 'react';
import moment from 'moment';
import { generateFormattedId } from 'src/utils/format-ids';
import { getGrnorReturnFormate } from 'src/utils/grn-formate';
import { DATE_FORMAT } from '../../../constants/date-format';

export const getReceiptColumns = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('grn.receiptNo')}`,
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      render: (id: TNumberOrStringOrEmpty, record: TObject) =>
        getGrnorReturnFormate(id, record?.receiptId)
    },
    {
      title: `${t('grn.vendorName')}`,
      dataIndex: 'vendorName',
      key: 'vendorName',
      render: (_, record: TObject) => record?.purchaseOrder?.vendor?.name
    },
    {
      title: `${t('grn.sourceDoc')}`,
      dataIndex: 'sourceDoc',
      key: 'sourceDoc',
      render: (_, record: TObject) => {
        const returnIds = record?.receiptId || record?.returnInRefId;

        return returnIds
          ? `${getGrnorReturnFormate(returnIds, record?.returnInRefId || 0)}`
          : `P${generateFormattedId(record?.poId)}`;
      }
    },
    {
      title: `${t('grn.date')}`,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: TNumberOrStringOrEmpty, record: TObject) => (
        <div className="flex">
          <div className="text-blue-blue3">{`${moment(createdAt).format(
            DATE_FORMAT.RECEIPTS_FROM
          )} - `}</div>
          <div
            className={`ml-1 ${
              record.confirmedAt ? 'text-green' : 'text-gray-grey3'
            }`}
          >
            {`${
              record.confirmedAt !== null
                ? moment(record?.confirmedAt).format(DATE_FORMAT.RECEIPTS_TO)
                : 'NA'
            }`}
          </div>
        </div>
      )
    }
  ];

  return columns;
};

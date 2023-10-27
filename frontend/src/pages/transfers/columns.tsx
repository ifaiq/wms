import moment from 'moment';
import { DATE_FORMAT } from 'src/constants/date-format';
// import { generateFormattedId } from "src/utils/format-ids";
// import { getGrnorReturnFormate } from "src/utils/grn-formate";

export const getTransfersColumns = (t: any) => {
  const columns: ITableColumn[] = [
    {
      title: `${t('transfer.referenceNumber')}`,
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 300
      // render: (id: TNumberOrStringOrEmpty, record: TObject) =>
      //   record?.type === 'Adjustment' ? `A${generateFormattedId(id!)}`
      //     : getGrnorReturnFormate(id, record?.returnedReceiptId),
    },
    {
      title: `${t('transfer.type')}`,
      dataIndex: 'type',
      key: 'type',
      width: 300,
      render: (item: any) => (
        <span className="text-blue-blue2 font-medium">{item}</span>
      )
    },
    {
      title: `${t('transfer.creator')}`,
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 300
    },
    {
      title: `${t('transfer.creation-confirm-dates')}`,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 300,
      render: (createdAt: TNumberOrStringOrEmpty, record: TObject) => (
        <>
          <span className="text-blue-blue2">
            {moment(createdAt).format(DATE_FORMAT.TRANSFERS_CREATE)} -{' '}
          </span>
          {record.confirmedAt ? (
            <span className="text-green">
              {moment(record.confirmedAt).format(
                DATE_FORMAT.TRANSFERS_CONFIRMED
              )}
            </span>
          ) : (
            <span>NA</span>
          )}
        </>
      )
    }
  ];

  return columns;
};

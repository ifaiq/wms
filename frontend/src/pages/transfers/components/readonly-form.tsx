import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  getTransferCountryName,
  getTransferUserEmail,
  getTransferBUName,
  getTransferLocationName,
  getTransferReasonData,
  getTransferReasonValue,
  getTransferFromLocationName,
  getTransferToLocationName
} from 'src/store/selectors/features/transfer';

export const TransferReadonlyForm: React.FC = () => {
  const [t] = useTranslation('transfer');

  const userEmail = useSelector(getTransferUserEmail);
  const country = useSelector(getTransferCountryName);
  const buName = useSelector(getTransferBUName);
  const warehouseName = useSelector(getTransferLocationName);
  const fromLocationName = useSelector(getTransferFromLocationName);
  const toLocationName = useSelector(getTransferToLocationName);
  const reasonValue = useSelector(getTransferReasonValue);
  const reason = useSelector(getTransferReasonData)?.reason;

  const renderItemDetail = (label: string, value: string) => (
    <div className="flex flex-col justify-start h-20">
      <h2>{label}</h2>
      <span className="mt-2 text-gray-grey2">{value ? value : '-'}</span>
    </div>
  );

  return (
    <div className="flex">
      <div className="w-[25%]">
        {renderItemDetail(t('transfer.country'), country)}
        {renderItemDetail(t('transfer.city'), buName)}
        {renderItemDetail(t('transfer.warehouse'), warehouseName)}
        {renderItemDetail(t('transfer.userId'), userEmail)}
      </div>
      <div className="w-[45%]">
        {renderItemDetail(t('transfer.reason'), reason)}
        {renderItemDetail(t('transfer.reasonComment'), reasonValue)}
        {renderItemDetail(t('transfer.fromLocation'), fromLocationName)}
        {renderItemDetail(t('transfer.toLocation'), toLocationName)}
      </div>
    </div>
  );
};

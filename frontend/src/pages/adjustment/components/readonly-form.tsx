import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DUMP_LOCATION } from 'src/constants/adjustment';
import { DATE_FORMAT } from 'src/constants/date-format';
import {
  getAdjustBUName,
  getAdjustCountryName,
  getAdjustLocationName,
  getAdjustPostingPeriod,
  getAdjustReasonData,
  getAdjustReasonValue,
  getAdjustUserEmail,
  getAdjustWarehouseName,
  getIsReasonInitialCount
} from 'src/store/selectors/features/adjustment';

export const AdjustReadonlyForm: React.FC = () => {
  const [t] = useTranslation('adjust');

  const userEmail = useSelector(getAdjustUserEmail);
  const country = useSelector(getAdjustCountryName);
  const buName = useSelector(getAdjustBUName);
  const warehouseName = useSelector(getAdjustWarehouseName);
  const reasonValue = useSelector(getAdjustReasonValue);
  const reason = useSelector(getAdjustReasonData)?.reason;
  const locationName = useSelector(getAdjustLocationName);
  const postingPeriod = useSelector(getAdjustPostingPeriod);
  const isInitialCount = useSelector(getIsReasonInitialCount);

  const renderItemDetail = (label: string, value: string) => (
    <div className="flex flex-col justify-start h-20">
      <h2>{label}</h2>
      <span className="mt-2 text-gray-grey2">{value ? value : '-'}</span>
    </div>
  );

  return (
    <div className="flex">
      <div className="w-[25%]">
        {renderItemDetail(t('adjust.country'), country)}
        {renderItemDetail(t('adjust.city'), buName)}
        {renderItemDetail(t('adjust.warehouse'), warehouseName)}
        {renderItemDetail(
          t('adjust.location'),
          isInitialCount ? DUMP_LOCATION : locationName
        )}
      </div>
      <div className="w-[45%]">
        {renderItemDetail(t('adjust.userId'), userEmail)}
        {renderItemDetail(t('adjust.reason'), reason)}
        {renderItemDetail(t('adjust.reasonComment'), reasonValue)}
        {renderItemDetail(
          t('adjust.postingPeriod'),
          postingPeriod && moment(postingPeriod).format(DATE_FORMAT.ADJUSTMENTS)
        )}
      </div>
    </div>
  );
};

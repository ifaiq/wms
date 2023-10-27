import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, SelectItem } from 'src/components';
import { useGetReturnReasons } from 'src/hooks';
import {
  getGRNReturnReason,
  getReturnInRefId
} from 'src/store/selectors/features/grn';
import {
  updateGRNData,
  updateGRNEditMode
} from 'src/store/slices/features/grn';

export const ReturnGrnReason: React.FC<TObject> = ({ disabled }) => {
  const [t] = useTranslation('grn');
  const dispatch = useDispatch();

  const returnInId = useSelector(getReturnInRefId);

  const { data } = useGetReturnReasons(returnInId ? 'RETURN_IN' : 'RETURN');

  const updateReturnReason = (reason: TObject) => {
    dispatch(updateGRNData({ key: 'reasonId', value: reason }));
    dispatch(updateGRNEditMode(true));
  };

  const returnReason: string = useSelector(getGRNReturnReason);

  const reasons = data?.data?.map((item: TObject) => ({
    id: item.id,
    name: item.reason
  }));

  return (
    <FormElement label={t('grn.selectReasonLable')}>
      <SelectItem
        value={returnReason}
        disabled={disabled}
        placeholder={t('grn.selectReason')}
        onChange={(reason: string) => updateReturnReason(reason)}
        options={reasons}
      />
    </FormElement>
  );
};

import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, InputItem, SelectItem } from 'src/components';
import { TEST_ID_KEY_ADJUST } from 'src/constants/adjustment';
import { useGetAdjusmentReasons } from 'src/hooks';
import {
  getAdjustmentReasons,
  getAdjustReasonId,
  getAdjustReasonValue,
  getIsProductsEditAllowed
} from 'src/store/selectors/features/adjustment';
import {
  addAdjustmentReasons,
  resetAdjustmentKeys,
  updateAdjustmentData
} from 'src/store/slices/features/adjustment';

export const AdjustmentReason: React.FC<Record<string, any>> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('adjust');

  const adjustmentReasons = useSelector(getAdjustmentReasons);
  const reasonId = useSelector(getAdjustReasonId);
  const reasonValue = useSelector(getAdjustReasonValue);
  const isProductEditAllowed = useSelector(getIsProductsEditAllowed);

  const { control, errors } = props;
  const { data: reasons, isSuccess } = useGetAdjusmentReasons();

  useEffect(() => {
    if (isSuccess && reasons) dispatch(addAdjustmentReasons(reasons?.data));
  }, [isSuccess]);

  const formHandler = (key: string, value: string | number) => {
    dispatch(resetAdjustmentKeys(['reasonValue']));
    dispatch(updateAdjustmentData({ key, value }));
  };

  return (
    <>
      <Controller
        control={control}
        rules={{
          required: { value: true, message: 'Reason is required' }
        }}
        name="reasonId"
        defaultValue={''}
        render={({ field: { onChange } }) => (
          <FormElement
            label={t('adjust.reason')}
            isRequired
            errorMessage={errors?.reasonId?.message}
          >
            <SelectItem
              placeholder={t('adjust.SelectReason')}
              value={reasonId}
              onChange={(e: string) => {
                formHandler('reasonId', Number(e));
                onChange(e);
              }}
              disabled={!isProductEditAllowed}
              options={adjustmentReasons}
              dataTestID={`${TEST_ID_KEY_ADJUST}Reason`}
            />
          </FormElement>
        )}
      />
      <Controller
        control={control}
        rules={{
          required: { value: false, message: '' }
        }}
        name="reasonValue"
        defaultValue={''}
        render={({ field: { onChange } }) => (
          <FormElement
            label={t('adjust.reasonComment')}
            errorMessage={errors?.reasonValue?.message}
          >
            <InputItem
              placeholder={t('adjust.typeReason')}
              onChange={(e: any) => {
                formHandler('reasonValue', e.target.value);
                onChange(e.target.value);
              }}
              value={reasonValue}
              dataTestID={`${TEST_ID_KEY_ADJUST}ReasonComment`}
            />
          </FormElement>
        )}
      />
    </>
  );
};

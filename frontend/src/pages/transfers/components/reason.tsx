import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, InputItem, SelectItem } from 'src/components';
import { REASON } from 'src/constants/adjustment';
import { TEST_ID_KEY_TRANSFER } from 'src/constants/transfers';
import { useGetTransferReasons } from 'src/hooks';
import {
  getTransferReasonId,
  getTransferReasons,
  getTransferReasonValue,
  getTransferWareHouseId
} from 'src/store/selectors/features/transfer';
import {
  addTransferReasons,
  resetTransferKeys,
  updateTransferData
} from 'src/store/slices/features/transfer';

export const TransferReason: React.FC<Record<string, any>> = ({
  props,
  showInitialCount = false
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('transfer');

  const transferReasons = useSelector(getTransferReasons);
  const reasonId = useSelector(getTransferReasonId);
  const reasonValue = useSelector(getTransferReasonValue);
  const warehouseId = useSelector(getTransferWareHouseId);

  const { control, errors } = props;
  const { data: reasons, isSuccess } = useGetTransferReasons();

  useEffect(() => {
    if (isSuccess && reasons) {
      if (!showInitialCount) {
        const filteredReasons = reasons?.data.filter(
          (reason: TObject) => reason.reason !== REASON.INITIAL_COUNT
        );

        dispatch(addTransferReasons(filteredReasons));
        return;
      }

      dispatch(addTransferReasons(reasons?.data));
    }
  }, [isSuccess, showInitialCount]);

  const formHandler = (key: string, value: string | number) => {
    dispatch(resetTransferKeys(['reasonValue']));
    dispatch(updateTransferData({ key, value }));
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
            label={t('transfer.reason')}
            isRequired
            errorMessage={errors?.reasonId?.message}
            dataTestID={`${TEST_ID_KEY_TRANSFER}ReasonError`}
          >
            <SelectItem
              placeholder={t('transfer.SelectReason')}
              value={reasonId}
              onChange={(e: string) => {
                formHandler('reasonId', Number(e));
                onChange(e);
              }}
              options={transferReasons}
              disabled={warehouseId ? false : true}
              dataTestID={`${TEST_ID_KEY_TRANSFER}Reason`}
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
            label={t('transfer.reasonComment')}
            errorMessage={errors?.reasonValue?.message}
          >
            <InputItem
              placeholder={t('transfer.typeReason')}
              onChange={(e: TObject) => {
                formHandler('reasonValue', e.target.value);
                onChange(e.target.value);
              }}
              value={reasonValue}
              dataTestID={`${TEST_ID_KEY_TRANSFER}ReasonComment`}
            />
          </FormElement>
        )}
      />
    </>
  );
};

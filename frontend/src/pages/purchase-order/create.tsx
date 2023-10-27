import { WarningAmberOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  BreadCrumbs,
  ButtonOutline,
  ButtonPrimary,
  ConfirmModal,
  Stages,
  TopBar
} from 'src/components';
import {
  getPOBreadCrumb,
  PO_STATUS,
  STAGES
} from 'src/constants/purchase-order';
import { getUserName } from 'src/store/selectors/features/auth';
import {
  getPOLocationId,
  getPOReqPayload
} from 'src/store/selectors/features/purchase-order';
import { resetPOData } from 'src/store/slices/features/purchase-order';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { useCreatePO, useResetState } from '../../hooks';
import {
  PurchaseOrderForm,
  PurchaseOrderInfo,
  PurchOrderProductTable
} from './components';

export const CreatePurchOrder: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('po');
  const [showCancleModal, setShowCancelModal] = useState(false);
  useResetState(resetPOData);
  const userName = useSelector(getUserName);
  const locationId = useSelector(getPOLocationId);
  const requestPayload = useSelector(getPOReqPayload);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm();

  const {
    data,
    isSuccess,
    isError,
    error,
    mutate: createPO,
    isLoading
  } = useCreatePO();

  const onCancel = () => setShowCancelModal(true);

  const clearRFQ = () => dispatch(resetPOData());

  const onModalConfirm = () => {
    clearRFQ();
    setShowCancelModal(false);
  };

  const onModalCancel = () => setShowCancelModal(false);

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;

      if (errorData?.data?.context?.length) {
        errorData.data.context.forEach(({ field }: any) => {
          showErrorMessage(field);
        });
        errorData?.data?.context?.length &&
          setBackendFieldsError(errorData?.data?.context, setError);
      } else {
        showErrorMessage(errorData?.statusText);
      }
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      const {
        data: { id }
      } = data;

      showSuccessMessage();
      history.replace(`/purchase-order/${id}`);
    }
  }, [isSuccess]);

  const onSubmit = () => createPO(requestPayload);

  return (
    <>
      <TopBar title="Purchase" />
      <div className="mx-4 lg:mx-9 mb-5 flex justify-between">
        <div className="basis-3/5 self-center">
          <BreadCrumbs routesArray={getPOBreadCrumb(PO_STATUS.DRAFT)} />
        </div>
        <div className="basis-2/5 self-end">{Stages(STAGES)}</div>
      </div>

      <div className="mx-4 lg:mx-9 pb-8">
        <PurchaseOrderInfo
          headingText={t('po.createAnRFQ')}
          buyerName={userName}
          date={new Date()}
        />

        <PurchaseOrderForm props={{ control, errors, setValue }} />

        <PurchOrderProductTable locationId={locationId} />

        <div className="flex justify-end items-center mt-10">
          <ButtonOutline
            text={`${t('po.clearInfo')}`}
            onClick={onCancel}
            style={{ margin: '0 10px' }}
          />
          <ButtonPrimary
            type="submit"
            text={`${t('po.saveInfo')}`}
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
          <ConfirmModal
            visible={showCancleModal}
            title={`Are you sure to cancel RFQ?`}
            icon={<WarningAmberOutlined fontSize="large" />}
            onConfirm={onModalConfirm}
            onCancel={onModalCancel}
          />
        </div>
      </div>
    </>
  );
};

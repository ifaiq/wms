import { WarningAmberOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  OverlayLoader,
  TopBar,
  BreadCrumbs,
  Stages,
  ButtonOutline,
  ButtonPrimary,
  ConfirmModal
} from 'src/components';
import {
  getPOBreadCrumb,
  PO_STATUS,
  READ_ONLY_STATES,
  STAGES
} from 'src/constants/purchase-order';
import {
  getIsCancelPOAllowed,
  getIsEditPOAllowed,
  getPOComfirmedAt,
  getPOCreationDate,
  getPOHeader,
  getPOLocationId,
  getPOReqPayload,
  getPOStatus,
  getPurchaseOrderId,
  getPurchaserName
} from 'src/store/selectors/features/purchase-order';
import {
  addPOData,
  resetPOData,
  setPOEditFlag,
  setRFQEditFlag
} from 'src/store/slices/features/purchase-order';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import {
  useChangeStatus,
  useGetPOById,
  useResetState,
  useUpdatePO
} from '../../hooks';
import {
  PurchaseOrderForm,
  PurchaseOrderInfo,
  PurchOrderProductTable,
  ReadOnlyPurchaseOrderForm
} from './components';
import { setActiveStage } from './helper';

export const EditPurchOrder: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('po');
  const { id } = useParams<RouteParams>();
  const [stages, setStages] = useState<IStages[]>([]);
  const [showCancleModal, setShowCancelModal] = useState(false);
  useResetState(resetPOData);
  const userName = useSelector(getPurchaserName);
  const purchaseOrderId = useSelector(getPurchaseOrderId);
  const date = useSelector(getPOCreationDate);
  const locationId = useSelector(getPOLocationId);
  const status = useSelector(getPOStatus);
  const isConfirmed = useSelector(getPOComfirmedAt);
  const requestPayload = useSelector(getPOReqPayload);
  const poHeader = useSelector(getPOHeader);
  const isCancelPO = useSelector(getIsCancelPOAllowed);
  const isEditPO = useSelector(getIsEditPOAllowed);

  const { data, isSuccess, isLoading, refetch: refetchPO } = useGetPOById(id);

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  const {
    isLoading: isUpdateLoading,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    error: updateError,
    mutateAsync: updatePO
  } = useUpdatePO();

  const {
    isLoading: isPOStatusLoading,
    isSuccess: isPOStatusSuccess,
    isError: isPOStatusError,
    error: POStatusError,
    mutateAsync: changePOStatus
  } = useChangeStatus();

  useEffect(() => {
    if (data) {
      dispatch(addPOData(data?.data));
    }
  }, [data]);

  useEffect(() => {
    if (isUpdateSuccess) {
      refetchPO({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage('RFQ Update Successful');
      dispatch(
        READ_ONLY_STATES.includes(status)
          ? setPOEditFlag(false)
          : setRFQEditFlag(false)
      );
    }
  }, [isUpdateSuccess]);

  useEffect(() => {
    if (isPOStatusSuccess) {
      refetchPO({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage('RFQ Status Update Successful');
    }
  }, [isPOStatusSuccess]);

  useEffect(() => {
    if (isUpdateError || isPOStatusError) {
      const errorData = (updateError as TObject) || (POStatusError as TObject);
      showErrorMessage(errorData?.statusText);
      errorData?.data?.context?.length &&
        setBackendFieldsError(errorData?.data?.context, setError);
    }
  }, [isUpdateError, isPOStatusError]);

  useEffect(() => {
    setStages(setActiveStage(STAGES, status));
  }, [status]);

  const handleTableState = () => READ_ONLY_STATES.includes(status, 1);

  const handleConfirmPO = () =>
    changePOStatus({ id, status: PO_STATUS.LOCKED });

  const handleLockUnlockPO = () => {
    if (status === PO_STATUS.PO)
      changePOStatus({ id, status: PO_STATUS.LOCKED });
    if (status === PO_STATUS.LOCKED)
      changePOStatus({ id, status: PO_STATUS.PO });
  };

  const onSubmit = () => {
    updatePO(requestPayload);
  };

  const cancelPO = () => changePOStatus({ id, status: PO_STATUS.CANCELLED });

  const onCancel = () => setShowCancelModal(true);

  const onModalConfirm = () => {
    cancelPO();
    setShowCancelModal(false);
  };

  const onModalCancel = () => setShowCancelModal(false);

  return (
    <>
      {(isLoading || isUpdateLoading) && <OverlayLoader />}

      <TopBar title="Purchase" />
      <div className="mx-4 lg:mx-9 mb-5 flex justify-between">
        <div className="basis-3/5 self-center">
          <BreadCrumbs routesArray={getPOBreadCrumb(status, purchaseOrderId)} />
        </div>
        <div className="basis-2/5 self-end">{Stages(stages)}</div>
      </div>

      <div className="mx-4 lg:mx-9 pb-8">
        <PurchaseOrderInfo
          headingText={t(`po.${poHeader}`)}
          buyerName={userName}
          id={purchaseOrderId}
          date={date}
          onConfirmPO={handleConfirmPO}
          onLockUnlockPO={handleLockUnlockPO}
          disabled={isPOStatusLoading}
        />

        {READ_ONLY_STATES.includes(status) ? (
          <ReadOnlyPurchaseOrderForm props={{ control, errors }} />
        ) : (
          <PurchaseOrderForm props={{ control, errors, setValue }} />
        )}

        <PurchOrderProductTable
          disabled={handleTableState()}
          locationId={locationId}
          poStatus={status}
          isLoading={!isSuccess}
        />

        <div className="flex justify-end items-center mt-10">
          {READ_ONLY_STATES.includes(status, 1) ? null : (
            <>
              {isCancelPO && (
                <ButtonOutline
                  text={`${t('po.cancel')}`}
                  onClick={onCancel}
                  style={{ margin: '0 10px' }}
                  disabled={isConfirmed ? true : false}
                />
              )}
              {isEditPO && (
                <ButtonPrimary
                  type="submit"
                  text={`${t('po.saveInfo')}`}
                  onClick={handleSubmit(onSubmit)}
                  disabled={isConfirmed ? true : false}
                  isLoading={isUpdateLoading}
                />
              )}
              <ConfirmModal
                visible={showCancleModal}
                title={`Are you sure to cancel ${
                  READ_ONLY_STATES.includes(status) ? 'PO' : 'RFQ'
                } ?`}
                icon={<WarningAmberOutlined fontSize="large" />}
                onConfirm={onModalConfirm}
                onCancel={onModalCancel}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

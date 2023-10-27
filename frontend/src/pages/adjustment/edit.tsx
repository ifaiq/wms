import ArticleOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  BreadCrumbs,
  ButtonOutline,
  ButtonPrimary,
  ConfirmModal,
  DividerComponent,
  OverlayLoader,
  TopBar
} from 'src/components';
import {
  ADJUSTMENT_STATUS,
  EDIT_ADJUSTMENT_BREADCRUMB
} from 'src/constants/adjustment';
import {
  getAdjustConfirmationDate,
  getAdjustCreationDate,
  getAdjustLocationId,
  getAdjustmentHeaders,
  getAdjustmentStatus,
  getAdjustReqPayload,
  getisAdjustFinalised,
  getIsCancelAdjustAllowed,
  getIsEditAdjustAllowed
} from 'src/store/selectors/features/adjustment';
import { resetProducts } from 'src/store/slices/entities/product';
import {
  addAdjustmentData,
  resetAdjustmentData,
  toggleIsEdit
} from 'src/store/slices/features/adjustment';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import {
  useGetAdjustmentById,
  useResetState,
  useUpdateAdjustment,
  useUpdateAdjustmentStatus
} from '../../hooks';
import {
  AdjustmentInfo,
  AdjustmentProductTable,
  AdjustReadonlyForm,
  Status
} from './components';

export const EditAdjustment: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<RouteParams>();
  const [t] = useTranslation('adjust');

  useResetState(resetAdjustmentData);
  useResetState(resetProducts);

  const locationId = useSelector(getAdjustLocationId);
  const createdDate = useSelector(getAdjustCreationDate);
  const confirmedDate = useSelector(getAdjustConfirmationDate);
  const status = useSelector(getAdjustmentStatus);
  const isFinalState = useSelector(getisAdjustFinalised);
  const requestPayload = useSelector(getAdjustReqPayload);
  const isEditAdjustment = useSelector(getIsEditAdjustAllowed);
  const isCancelAdjustment = useSelector(getIsCancelAdjustAllowed);
  const adjustmentHeadings = useSelector(getAdjustmentHeaders);

  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  const {
    data,
    isSuccess,
    isLoading,
    isRefetching,
    refetch: refetchAdjustment
  } = useGetAdjustmentById(id);

  const {
    isLoading: isUpdateStatusLoading,
    isSuccess: isUpdateStatusSuccess,
    mutate: updateAdjustStatus
  } = useUpdateAdjustmentStatus();

  const {
    isLoading: isUpdateLoading,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    error: updateError,
    mutateAsync: updateAdjustment
  } = useUpdateAdjustment();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(addAdjustmentData(data?.data));
      dispatch(toggleIsEdit(false));
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isUpdateError) {
      const errorData = updateError as Record<string, any>;
      showErrorMessage(errorData?.statusText);
    }
  }, [isUpdateError]);

  useEffect(() => {
    if (isUpdateSuccess) {
      showSuccessMessage();
      refetchAdjustment({ cancelRefetch: true });
      dispatch(toggleIsEdit(false));
    }
  }, [isUpdateSuccess]);

  useEffect(() => {
    if (isUpdateStatusSuccess) {
      refetchAdjustment({ cancelRefetch: true });
      showSuccessMessage('Adjustment Status Updated');
    }
  }, [isUpdateStatusSuccess]);

  const submitHandler = () => {
    if (!requestPayload.products.length)
      showErrorMessage('Please Add Products');
    else updateAdjustment(requestPayload);
  };

  const confirmHandler = () =>
    updateAdjustStatus({ id, status: ADJUSTMENT_STATUS.DONE });

  const showModal = () => setIsShowModal(true);

  const hideModal = () => setIsShowModal(false);

  const cancelAdjustmentHandler = () => {
    updateAdjustStatus({ id, status: ADJUSTMENT_STATUS.CANCELLED });
    hideModal();
  };

  return (
    <>
      {(isLoading || isUpdateLoading || isUpdateStatusLoading) && (
        <OverlayLoader />
      )}
      <TopBar title={t('adjust.title')} />
      <div className="mx-4 lg:mx-9">
        <div className="ml-6 mt-8 flex justify-between">
          <BreadCrumbs
            routesArray={EDIT_ADJUSTMENT_BREADCRUMB(
              t(`adjust.${adjustmentHeadings}`)
            )}
          />
          <Status activeState={status} />
        </div>

        <div className="px-6 py-12 rounded-lg">
          <AdjustmentInfo
            headingText={t(`adjust.${adjustmentHeadings}`)}
            createdDate={createdDate}
            confirmedDate={confirmedDate}
            showConfirm={!isFinalState}
            onConfirm={confirmHandler}
            isDisabled={isLoading || isRefetching}
          />

          <AdjustReadonlyForm />

          <DividerComponent
            type={'horizontal'}
            dashed
            style={{ borderColor: '#DFE1E3' }}
          />

          <AdjustmentProductTable subLocationId={locationId} />

          {!isFinalState && (
            <div className="flex justify-end items-center mt-10">
              {isCancelAdjustment && (
                <ButtonOutline
                  text={`${t('adjust.cancel')}`}
                  onClick={showModal}
                  size="large"
                  style={{ margin: '0 20px' }}
                />
              )}
              {isEditAdjustment && (
                <ButtonPrimary
                  type="submit"
                  size="large"
                  text={`${t('adjust.save')}`}
                  onClick={submitHandler}
                />
              )}
              <ConfirmModal
                title={t('adjust.cancelText')}
                onConfirm={cancelAdjustmentHandler}
                onCancel={hideModal}
                visible={isShowModal}
                icon={
                  <ArticleOutlinedIcon
                    fontSize="large"
                    color="primary"
                    style={{ width: '50px', height: '50px' }}
                  />
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

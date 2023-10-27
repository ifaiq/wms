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
  EDIT_TRANSFER_BREADCRUMB,
  TEST_ID_KEY_TRANSFER,
  TRANSFER_STATUS
} from 'src/constants/transfers';
import {
  getAreTransferProductsValid,
  getIsCancelTransferAllowed,
  getIsEditTransferAllowed,
  getisTransferFinalised,
  getTransferConfirmationDate,
  getTransferCreationDate,
  getTransferFromLocationId,
  getTransferReqPayload,
  getTransferStatus
} from 'src/store/selectors/features/transfer';
import { resetProducts } from 'src/store/slices/entities/product';
import {
  addTransferData,
  resetTransferData,
  toggleIsEdit
} from 'src/store/slices/features/transfer';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import {
  useGetTransferById,
  useResetState,
  useUpdateTransfer,
  useUpdateTransferStatus
} from '../../hooks';
import {
  TransferInfo,
  TransferProductTable,
  TransferReadonlyForm,
  TransferStatus
} from './components';

export const EditTransfer: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<RouteParams>();
  const [t] = useTranslation('transfer');

  useResetState(resetTransferData);
  useResetState(resetProducts);

  const createdDate = useSelector(getTransferCreationDate);
  const confirmedDate = useSelector(getTransferConfirmationDate);
  const status = useSelector(getTransferStatus);
  const isFinalState = useSelector(getisTransferFinalised);
  const subLocationId = useSelector(getTransferFromLocationId);
  const requestPayload = useSelector(getTransferReqPayload);
  const areProductsValid = useSelector(getAreTransferProductsValid);
  const isEditTransfer = useSelector(getIsEditTransferAllowed);
  const isCancelTransfer = useSelector(getIsCancelTransferAllowed);

  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  const {
    data,
    isSuccess,
    isLoading,
    refetch: refetchTransfer
  } = useGetTransferById(id);

  const {
    isLoading: isUpdateStatusLoading,
    isSuccess: isUpdateStatusSuccess,
    isError: isUpdateStatusError,
    error: updateStatusError,
    mutate: updateTransferStatus
  } = useUpdateTransferStatus();

  const {
    isLoading: isUpdateLoading,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
    error: updateError,
    mutateAsync: updateTransfer
  } = useUpdateTransfer();

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(addTransferData(data?.data));
      dispatch(toggleIsEdit(false));
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isUpdateError || isUpdateStatusError) {
      const errorData =
        (updateError as TObject) || (updateStatusError as TObject);

      showErrorMessage(
        errorData?.statusText ||
          errorData?.mesasge ||
          errorData?.errors?.reason[0]
      );
    }
  }, [isUpdateError, isUpdateStatusError]);

  useEffect(() => {
    if (isUpdateSuccess) {
      showSuccessMessage();
      refetchTransfer({ cancelRefetch: true });
      dispatch(toggleIsEdit(false));
    }
  }, [isUpdateSuccess]);

  useEffect(() => {
    if (isUpdateStatusSuccess) {
      refetchTransfer({ cancelRefetch: true });
      showSuccessMessage('Transfer Status Updated');
    }
  }, [isUpdateStatusSuccess]);

  const submitHandler = () => {
    if (!requestPayload.products.length)
      showErrorMessage('Please Add Products');
    else if (!areProductsValid)
      showErrorMessage(
        'Transfer Stock must be less than or equal to Physical Stock'
      );
    else updateTransfer(requestPayload);
  };

  const confirmHandler = () => {
    if (!areProductsValid)
      showErrorMessage(
        'Transfer Stock must be less than or equal to Physical Stock'
      );
    else {
      updateTransferStatus({ id, status: TRANSFER_STATUS.DONE });
    }
  };

  const showModal = () => setIsShowModal(true);

  const hideModal = () => setIsShowModal(false);

  const cancelTransferHandler = () => {
    updateTransferStatus({ id, status: TRANSFER_STATUS.CANCELLED });
    hideModal();
  };

  return (
    <>
      {(isLoading || isUpdateLoading || isUpdateStatusLoading) && (
        <OverlayLoader />
      )}
      <TopBar title={t('transfer.transfers')} />
      <div className="mx-4 lg:mx-9">
        <div className="ml-6 mt-8 flex justify-between">
          <BreadCrumbs routesArray={EDIT_TRANSFER_BREADCRUMB} />
          <TransferStatus activeState={status} />
        </div>

        <div className="px-6 py-12 rounded-lg">
          <TransferInfo
            headingText={
              isFinalState ? t('transfer.title') : t('transfer.edit')
            }
            createdDate={createdDate}
            confirmedDate={confirmedDate}
            showConfirm={!isFinalState}
            onConfirm={confirmHandler}
          />

          <TransferReadonlyForm />

          <DividerComponent
            type={'horizontal'}
            dashed
            style={{ borderColor: '#DFE1E3' }}
          />

          <TransferProductTable subLocationId={subLocationId} />

          {!isFinalState && (
            <div className="flex justify-end items-center mt-10">
              {isCancelTransfer && (
                <ButtonOutline
                  text={`${t('transfer.cancel')}`}
                  onClick={showModal}
                  size="large"
                  style={{ margin: '0 20px' }}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}Cancel`}
                />
              )}
              {isEditTransfer && (
                <ButtonPrimary
                  type="submit"
                  size="large"
                  text={`${t('transfer.save')}`}
                  onClick={submitHandler}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}Update`}
                />
              )}
              <ConfirmModal
                title={t('transfer.cancelText')}
                onConfirm={cancelTransferHandler}
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

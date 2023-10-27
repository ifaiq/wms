import { RemoveCircleOutline } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonOutline, ConfirmModal } from 'src/components';
import { GRNStatus } from 'src/constants/grn';
import { useUpdateGRNStatus, useUpdateReturnGRNStatus } from 'src/hooks';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';

export const CancelGrn: React.FC<IStatusButton> = ({
  text,
  isReturn,
  disabled,
  id,
  refetch
}) => {
  const [t] = useTranslation('grn');

  const [isShowCancelModal, setIsShowCancelModal] = useState<boolean>(false);

  const {
    isSuccess,
    isError,
    error,
    mutateAsync: updateGRNStatus
  } = useUpdateGRNStatus();

  const {
    isSuccess: isReturnSuccess,
    isError: isReturnError,
    error: returnError,
    mutateAsync: updateReturnGRNStatus
  } = useUpdateReturnGRNStatus();

  const showCancleModal = () => {
    setIsShowCancelModal(true);
  };

  const hideCancelModal = () => {
    setIsShowCancelModal(false);
  };

  useEffect(() => {
    if (isError || isReturnError) {
      const errorData: TObject = isError
        ? error
        : (returnError as Record<string, any>);

      showErrorMessage(errorData?.statusText);
    }
  }, [isError, isReturnError]);

  useEffect(() => {
    if (isSuccess || isReturnSuccess) {
      showSuccessMessage();
      hideCancelModal();
      refetch();
    }
  }, [isSuccess, isReturnSuccess]);

  const cancelGrn = () => {
    const formatedData = {
      id: id,
      status: GRNStatus.CANCELLED,
      createBackOrder: false
    };

    if (isReturn) {
      updateReturnGRNStatus(formatedData);
    } else {
      updateGRNStatus(formatedData);
    }
  };

  return (
    <>
      <ButtonOutline
        text={text}
        size="large"
        disabled={disabled}
        onClick={showCancleModal}
      />
      <ConfirmModal
        title={t('grn.cancelGrnText')}
        onConfirm={cancelGrn}
        onCancel={hideCancelModal}
        visible={isShowCancelModal}
        icon={<RemoveCircleOutline fontSize="large" color="warning" />}
      />
    </>
  );
};

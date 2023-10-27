import { AssignmentReturnOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ConfirmModal, IconButtonPrimary } from 'src/components';
import { useCreateGRNReturn, useCreateReturnIn } from 'src/hooks';
import {
  getGRNPoId,
  getGRNReceiptId,
  getReturnInRefId
} from 'src/store/selectors/features/grn';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';

export const ReturnGrn: React.FC<IStatusButton> = ({ text, disabled, id }) => {
  const [t] = useTranslation('grn');
  const history = useHistory();

  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  const poId = useSelector(getGRNPoId);
  const receiptId = useSelector(getGRNReceiptId);
  const returnInId = useSelector(getReturnInRefId);

  const {
    isSuccess: isReturnSuccess,
    isError: isReturnError,
    error: returnError,
    data: returnData,
    mutateAsync: createGRNReturn
  } = useCreateGRNReturn();

  const {
    isSuccess: isReturnInSuccess,
    isError: isReturnInError,
    error: returnInError,
    data: returnInData,
    mutateAsync: createReturnIn
  } = useCreateReturnIn();

  const showModal = () => {
    setIsShowModal(true);
  };

  const hideModal = () => {
    setIsShowModal(false);
  };

  useEffect(() => {
    if (isReturnSuccess || isReturnInSuccess) {
      showSuccessMessage();
    }
  }, [isReturnSuccess, isReturnInSuccess]);

  useEffect(() => {
    if (isReturnError || isReturnInError) {
      const errorData = (returnError as TObject) || (returnInError as TObject);
      showErrorMessage(errorData?.statusText);
    }
  }, [isReturnError, isReturnInError]);

  useEffect(() => {
    if (returnData) {
      history.push(`/purchase-order/${poId}/return/${returnData?.data?.id}`);
    }

    if (returnInData) {
      history.push(
        `/purchase-order/${poId}/receipts/${returnInData?.data?.id}`
      );
    }
  }, [returnData?.data, returnInData?.data]);

  const returnHandler = () => {
    createGRNReturn({ id });
    hideModal();
  };

  const returnInHandler = () => {
    createReturnIn({ id });
    hideModal();
  };

  return (
    <>
      <IconButtonPrimary
        disabled={disabled}
        icon={<AssignmentReturnOutlined className="mr-2" />}
        text={text}
        onClick={showModal}
        size="auto"
        minWidthClass="min-w-[138px]"
      />
      <ConfirmModal
        title={
          receiptId && !returnInId
            ? t('grn.returnInText')
            : t('grn.returnGrnText')
        }
        onConfirm={receiptId && !returnInId ? returnInHandler : returnHandler}
        onCancel={hideModal}
        visible={isShowModal}
        icon={
          <AssignmentReturnOutlined
            fontSize="large"
            color="primary"
            style={{ width: '50px', height: '50px' }}
          />
        }
      />
    </>
  );
};

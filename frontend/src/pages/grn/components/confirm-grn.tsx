import {
  CheckCircleOutlineOutlined,
  RestorePageOutlined
} from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IconButtonPrimary } from 'src/components/button';
import { ConfirmModal } from 'src/components/modal';
import { GRNStatus } from 'src/constants/grn';
import { useUpdateGRNStatus, useUpdateReturnGRNStatus } from 'src/hooks';
import {
  getIsBackOrder,
  getLocationToId,
  getReturnInRefId
} from 'src/store/selectors/features/grn';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';

export const ConfirmGrn: React.FC<IStatusButton> = ({
  dataCy,
  text,
  isReturn,
  id,
  disabled,
  refetch
}) => {
  const [t] = useTranslation('grn');
  const history = useHistory();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  const locationToId = useSelector(getLocationToId);
  const backOrderFlag = useSelector(getIsBackOrder);
  const returnInRefId = useSelector(getReturnInRefId);

  const {
    isSuccess,
    isLoading,
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

  const showModal = () => {
    setIsShowModal(true);
  };

  const hideModal = () => {
    setIsShowModal(false);
  };

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;
      showErrorMessage(errorData?.statusText);
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      showSuccessMessage(t('grn.grnStatusConfirmMessage'));
      refetch();
      history.goBack();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isReturnError) {
      const errorData = returnError as Record<string, any>;
      showErrorMessage(errorData?.statusText);
    }
  }, [isReturnError]);

  useEffect(() => {
    if (isReturnSuccess) {
      showSuccessMessage(t('grn.grnReturnConfirmMessage'));
      refetch();
    }
  }, [isReturnSuccess]);

  const confirmGrn = (createBackOrder = false) => {
    const formatedData = {
      id: id,
      status: GRNStatus.DONE,
      createBackOrder
    };

    updateGRNStatus(formatedData);
  };

  const returnConfirmGRN = () => {
    const formatedData = {
      id: id,
      status: GRNStatus.DONE
    };

    updateReturnGRNStatus(formatedData);
  };

  const handleModalClickOK = () => {
    confirmGrn(returnInRefId ? false : backOrderFlag);
    hideModal();
  };

  const handleModalClickNO = () => {
    confirmGrn();
    hideModal();
  };

  const confirmClickHandler = () => {
    if (!returnInRefId && backOrderFlag) {
      showModal();
    } else {
      confirmGrn();
    }
  };

  const clickHandler = () => {
    if (!locationToId) {
      showErrorMessage('Please select a location before confirming Receipt');
      return;
    }

    isReturn ? returnConfirmGRN() : confirmClickHandler();
  };

  return (
    <>
      <IconButtonPrimary
        data-cy={dataCy}
        disabled={disabled || isLoading || isSuccess}
        icon={<CheckCircleOutlineOutlined className="mr-2" />}
        text={text}
        onClick={clickHandler}
        size="auto"
        minWidthClass="min-w-[138px]"
      />
      <ConfirmModal
        title={t('grn.backorderGrnText')}
        onConfirm={handleModalClickOK}
        onCancel={handleModalClickNO}
        closeModal={hideModal}
        closable
        visible={isShowModal}
        icon={
          <RestorePageOutlined
            fontSize="large"
            color="primary"
            style={{ width: '50px', height: '50px' }}
          />
        }
      />
    </>
  );
};

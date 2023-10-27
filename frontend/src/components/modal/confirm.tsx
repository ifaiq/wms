import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@mui/icons-material/Info';
import { ButtonOutline, ButtonPrimary } from 'src/components';

export const ConfirmModal: React.FC<IModal> = ({
  title = '',
  visible,
  onConfirm,
  onCancel,
  closable = false,
  destroyOnClose = true,
  cancelText,
  okText,
  icon,
  closeModal,
  width = 390,
  showCancelButton = true,
  children
}) => {
  const [t] = useTranslation('common');
  return (
    <Modal
      title={''}
      visible={visible}
      onCancel={closeModal}
      centered
      closable={closable}
      destroyOnClose={destroyOnClose}
      footer={null}
      width={width}
    >
      <div className="flex flex-col justify-center items-center">
        {icon ? icon : <InfoIcon fontSize="large" />}
        <p className="text-[18px] mt-6 text-center font-semibold">
          {title ? title : t('common.confirmText')}
        </p>
        {children}
        <div className="flex justif-center mt-6">
          <div className="mr-2">
            <ButtonOutline
              text={`${okText ? okText : t('okText')}`}
              size="auto"
              onClick={onConfirm}
              dataTestID={'confirmModalOk'}
            />
          </div>
          {showCancelButton && (
            <div className="ml-2">
              <ButtonPrimary
                text={`${cancelText ? cancelText : t('cancelText')}`}
                size="auto"
                onClick={onCancel}
                dataTestID={'confirmModalCancel'}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

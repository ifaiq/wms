import React from 'react';
import { Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';

export const ConfirmPopUp: React.FC<IConfirmPopUp> = ({
  title = '',
  visible,
  onConfirm,
  onCancel,
  children
}) => {
  const [t] = useTranslation('vendor');
  return (
    <Popconfirm
      title={title ? title : t('vendor.confirmText')}
      visible={visible}
      onConfirm={onConfirm}
      onCancel={onCancel}
      okText={t('vendor.okText')}
      cancelText={t('vendor.cancelText')}
    >
      {children}
    </Popconfirm>
  );
};

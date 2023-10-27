import { WarningAmberOutlined } from '@mui/icons-material';
import { List } from 'antd';
import React from 'react';
import { ConfirmModal } from './confirm';

export const ErrorModal: React.FC<IErrorModal> = ({
  title = 'Errors Found!',
  visible,
  onConfirm,
  width = 1000,
  pageSize = 20,
  errorList
}) => {
  return (
    <ConfirmModal
      visible={visible}
      title={title}
      icon={<WarningAmberOutlined fontSize="large" />}
      width={width}
      okText={'OK'}
      onConfirm={onConfirm}
      showCancelButton={false}
    >
      <List
        size="small"
        style={{ marginTop: '10px', width: '100%' }}
        bordered
        pagination={{
          position: 'top',
          pageSize,
          showSizeChanger: false,
          hideOnSinglePage: true
        }}
        dataSource={errorList}
        renderItem={(item: string) => <List.Item>{item}</List.Item>}
      />
    </ConfirmModal>
  );
};

import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import Moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ConfirmModal, IconButtonPrimary } from 'src/components';
import { DATE_FORMAT, TIME_FORMAT } from 'src/constants/date-format';
import { TEST_ID_KEY_TRANSFER } from 'src/constants/transfers';
import {
  getIsConfirmTransferAllowed,
  getIsEditTransferState,
  getTransferId
} from 'src/store/selectors/features/transfer';
import { generateFormattedId } from 'src/utils/format-ids';

export const TransferInfo: React.FC<ITransferInfo> = ({
  headingText,
  createdDate,
  confirmedDate,
  showConfirm = true,
  onConfirm
}) => {
  const [t] = useTranslation('transfer');

  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const transferId = useSelector(getTransferId);
  const formattedId = `T${generateFormattedId(transferId)}`;
  const isEditTransfer = useSelector(getIsEditTransferState);
  const isConfirmTransfer = useSelector(getIsConfirmTransferAllowed);

  const showModal = () => setIsShowModal(true);

  const hideModal = () => setIsShowModal(false);

  const confirmTransfer = () => {
    onConfirm();
    hideModal();
  };

  return (
    <div className="flex mb-6 justify-between">
      <div data-test-id={`${TEST_ID_KEY_TRANSFER}Heading`}>
        <span className="text-2xl font-bold">
          {headingText} {transferId ? ` - ${formattedId}` : ''}
        </span>
        <div className="mt-4">
          <span className="text-sm text-gray-grey2">
            {`${t('transfer.createdOn')} ${Moment(createdDate).format(
              DATE_FORMAT.TRANSFER
            )}
             at  
             ${Moment(createdDate).format(TIME_FORMAT.TRANSFER)}`}
          </span>
          {confirmedDate && (
            <>
              <span className="text-sm text-gray-grey2">
                {` - ${t('transfer.confirmedOn')} ${Moment(
                  confirmedDate
                ).format(DATE_FORMAT.TRANSFER)}
                at  
                ${Moment(confirmedDate).format(TIME_FORMAT.TRANSFER)}`}
              </span>
            </>
          )}
        </div>
      </div>
      {showConfirm && isConfirmTransfer && (
        <div>
          <IconButtonPrimary
            icon={<CheckCircleOutlineOutlined className="mr-2" />}
            text={t('transfer.confirm')}
            onClick={showModal}
            size="auto"
            minWidthClass="min-w-[138px]"
            disabled={isEditTransfer}
            dataTestID={`${TEST_ID_KEY_TRANSFER}Confirm`}
          />
          {isShowModal && (
            <ConfirmModal
              title={t('transfer.confirmText')}
              onConfirm={confirmTransfer}
              onCancel={hideModal}
              visible={isShowModal}
              icon={
                <CheckCircleOutlineOutlined
                  fontSize="large"
                  color="primary"
                  style={{ width: '50px', height: '50px' }}
                />
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

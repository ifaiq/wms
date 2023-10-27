import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import Moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { IconButtonPrimary, ConfirmModal } from 'src/components';
import { TEST_ID_KEY_ADJUST } from 'src/constants/adjustment';
import { DATE_FORMAT, TIME_FORMAT } from 'src/constants/date-format';
import {
  getAdjustmentId,
  getIsConfirmAdjustAllowed,
  getIsEditAdjustmentState
} from 'src/store/selectors/features/adjustment';
import { generateFormattedId } from 'src/utils/format-ids';

export const AdjustmentInfo: React.FC<IADJUST_INFO> = ({
  headingText,
  createdDate,
  confirmedDate,
  showConfirm = true,
  onConfirm,
  isDisabled
}) => {
  const [t] = useTranslation('adjust');

  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const adjustmentId = useSelector(getAdjustmentId);
  const formattedId = `A${generateFormattedId(adjustmentId)}`;
  const isEditAdjustment = useSelector(getIsEditAdjustmentState);
  const isConfirmAdjustment = useSelector(getIsConfirmAdjustAllowed);

  const showModal = () => setIsShowModal(true);

  const hideModal = () => setIsShowModal(false);

  const confirmAdjustment = () => {
    onConfirm();
    hideModal();
  };

  return (
    <div className="flex mb-6 justify-between">
      <div data-test-id={`${TEST_ID_KEY_ADJUST}Heading`}>
        <span className="text-2xl font-bold">
          {headingText} {adjustmentId ? ` - ${formattedId}` : ''}
        </span>
        <div className="mt-4">
          <span className="text-sm text-gray-grey2">
            {`${t('adjust.createdOn')} ${Moment(createdDate).format(
              DATE_FORMAT.ADJUSTMENTS
            )}
             at  
             ${Moment(createdDate).format(TIME_FORMAT.ADJUSTMENTS)}`}
          </span>
          {confirmedDate && (
            <>
              <span className="text-sm text-gray-grey2">
                {` - ${t('adjust.confirmedOn')} ${Moment(confirmedDate).format(
                  DATE_FORMAT.ADJUSTMENTS
                )}
                at  
                ${Moment(confirmedDate).format(TIME_FORMAT.ADJUSTMENTS)}`}
              </span>
            </>
          )}
        </div>
      </div>
      {showConfirm && isConfirmAdjustment && (
        <div>
          <IconButtonPrimary
            icon={<CheckCircleOutlineOutlined className="mr-2" />}
            text={t('adjust.confirm')}
            onClick={showModal}
            size="auto"
            minWidthClass="min-w-[138px]"
            disabled={isEditAdjustment || isDisabled}
            dataTestID={`${TEST_ID_KEY_ADJUST}Confirm`}
          />
          {isShowModal && (
            <ConfirmModal
              title={t('adjust.confirmText')}
              onConfirm={confirmAdjustment}
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

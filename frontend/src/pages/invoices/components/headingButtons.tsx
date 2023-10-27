import {
  ArticleOutlined,
  CheckCircleOutlineOutlined,
  LocalPrintshopOutlined,
  Lock,
  LockOpen
} from '@mui/icons-material';
import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ButtonIconOutlined, IconButtonPrimary } from 'src/components';
import { TEST_ID_KEY_PO } from 'src/constants/purchase-order';
import { usePrintPO } from 'src/hooks/usePurchOrder';
import {
  getIsConfirmPOAllowed,
  getIsLockUnLockPOAllowed,
  getLockingButtonTextAndIcon,
  getPOComfirmedAt,
  getPOEditFlag,
  getPurchaseOrderId,
  getRFQEditFlag,
  getShowConfirmButton,
  getShowPrintButton,
  getShowReciptAndLockButton
} from 'src/store/selectors/features/purchase-order';

const getIcon = (name: string) => {
  const icons: Record<string, ReactNode> = {
    Lock: <Lock className="mr-2" />,
    LockOpen: <LockOpen className="mr-2" />
  };

  return icons[name];
};

export const ServiceOrderHeadingButtons: React.FC<IPOHeadingButtons> = ({
  onConfirmPO,
  onLockUnlockPO,
  disabled = false
}) => {
  const history = useHistory();

  const id = useSelector(getPurchaseOrderId);
  const isConfirmed = useSelector(getPOComfirmedAt);
  const showReciptAndLockButton = useSelector(getShowReciptAndLockButton);
  const showPrintButton = useSelector(getShowPrintButton);
  const lockingTextAndButton = useSelector(getLockingButtonTextAndIcon);
  const isRFQEdited = useSelector(getRFQEditFlag);
  const isPOEdited = useSelector(getPOEditFlag);
  const showConfirmButton = useSelector(getShowConfirmButton);
  const isConfirmedPO = useSelector(getIsConfirmPOAllowed);
  const isLockUnLockPO = useSelector(getIsLockUnLockPOAllowed);

  const { mutateAsync: printPOMutation } = usePrintPO();

  const handlePrintPO = () => printPOMutation(id);

  const handleViewRecipt = () => history.push(`/purchase-order/${id}/receipts`);

  return (
    <div className="flex flex-row space-x-2  justify-end">
      {showPrintButton && (
        <ButtonIconOutlined
          dataTestID={`${TEST_ID_KEY_PO}Print`}
          theme="text-[#6ACC74] border-[#6ACC74]"
          size="small"
          text="Print"
          icon={<LocalPrintshopOutlined className="mr-2" />}
          onClick={handlePrintPO}
          disabled={disabled}
        />
      )}
      {showConfirmButton && isConfirmedPO && (
        <IconButtonPrimary
          dataTestID={`${TEST_ID_KEY_PO}Confirm`}
          text="Confirm"
          icon={<CheckCircleOutlineOutlined className="mr-2" />}
          onClick={onConfirmPO}
          disabled={disabled || isRFQEdited}
        />
      )}
      {showReciptAndLockButton ? (
        <>
          <ButtonIconOutlined
            dataTestID={`${TEST_ID_KEY_PO}Receipt`}
            theme="text-blue-blue2 border-blue-blue2"
            text="View Receipts"
            icon={<ArticleOutlined className="mr-2" />}
            onClick={handleViewRecipt}
            disabled={disabled}
          />
          {isLockUnLockPO && (
            <IconButtonPrimary
              dataTestID={`${TEST_ID_KEY_PO}LockUnlock`}
              text={lockingTextAndButton?.text}
              icon={getIcon(lockingTextAndButton?.icon)}
              onClick={onLockUnlockPO}
              disabled={isConfirmed ? true : false || disabled || isPOEdited}
            />
          )}
        </>
      ) : null}
    </div>
  );
};

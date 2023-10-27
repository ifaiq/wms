import React from 'react';
import Moment from 'moment';
import { useTranslation } from 'react-i18next';
import { DividerComponent } from 'src/components/divider';
import { DATE_FORMAT } from '../../../constants/date-format';
import { generateFormattedId } from '../../../utils/format-ids';
import { PurchaseOrderHeadingButtons } from './headingButtons';
import { TEST_ID_KEY_PO } from 'src/constants/purchase-order';

// TODO: date needs to be formated
export const PurchaseOrderInfo: React.FC<IPOHeadings> = ({
  buyerName,
  date,
  disabled = false,
  headingText,
  id,
  onConfirmPO,
  onLockUnlockPO
}) => {
  const [t] = useTranslation('po');

  const subHeading = 'text-sm text-gray-grey2';

  return (
    <div className="flex mb-6 justify-between">
      <div data-test-id={`${TEST_ID_KEY_PO}Heading`}>
        <span className="text-2xl font-bold">{`${headingText}`}</span>
        <div className="mt-4">
          <span className={subHeading}>{`${t(
            'po.buyer'
          )} : ${buyerName}`}</span>
          <DividerComponent type="vertical" />
          {id && (
            <>
              <span className={subHeading}>{`${t(
                'po.poNumber'
              )}. P${generateFormattedId(id)}`}</span>
              <DividerComponent type="vertical" />
            </>
          )}
          <span className={subHeading}>{`${t('po.date')} : ${Moment(
            date
          ).format(DATE_FORMAT.PURCH_ORDER)}`}</span>
        </div>
      </div>
      {id && (
        <PurchaseOrderHeadingButtons
          onConfirmPO={onConfirmPO}
          onLockUnlockPO={onLockUnlockPO}
          disabled={disabled}
        />
      )}
    </div>
  );
};

import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  getPOCountryName,
  getPOBusinessUnitName,
  getPOWareHouseName,
  getPOVendorName,
  getPOPaymentType,
  getPOPaymentDays,
  getPOGSTInvoicePath,
  getPOComInvoicePath,
  getPurchaseOrderId,
  getPOType,
  getPOCurrency
} from 'src/store/selectors/features/purchase-order';
import { UploadPOAttachment } from './upload-attachment';
import { FormElement } from 'src/components/form';
import { TEST_ID_KEY_PO } from 'src/constants/purchase-order';

const contentStyle = 'text-sm text-gray-grey2';

export const ReadOnlyPurchaseOrderForm: React.FC<IPOForm> = () => {
  const [t] = useTranslation('po');

  const purchaseOrderId = useSelector(getPurchaseOrderId);
  const country = useSelector(getPOCountryName);
  const buName = useSelector(getPOBusinessUnitName);
  const warehouseName = useSelector(getPOWareHouseName);
  const vendorName = useSelector(getPOVendorName);
  const poCurrency = useSelector(getPOCurrency);
  const type = useSelector(getPOType);
  const paymentType = useSelector(getPOPaymentType);
  const paymentDays = useSelector(getPOPaymentDays);
  const gstInvoice = useSelector(getPOGSTInvoicePath);
  const comInvoice = useSelector(getPOComInvoicePath);

  return (
    <>
      <div>
        <div className="flex justify-between">
          {/* Col 1 */}
          <div className="w-[45%]">
            <FormElement label={t('po.type')}>
              <span className={contentStyle}> {type}</span>
            </FormElement>
            <FormElement label={t('po.country')}>
              <span className={contentStyle}> {country}</span>
            </FormElement>
            <FormElement label={t('po.city')}>
              <span className={contentStyle}> {buName}</span>
            </FormElement>
            <FormElement label={t('po.warehouse')}>
              <span className={contentStyle}> {warehouseName}</span>
            </FormElement>
          </div>
          {/* Col 2 */}
          <div className="w-[45%]">
            <FormElement label={t('po.vendor')}>
              <span className={contentStyle}> {vendorName}</span>
            </FormElement>
            <FormElement label={t('po.comInvoice')}>
              <UploadPOAttachment
                dataTestID={`${TEST_ID_KEY_PO}ComInvoiceID`}
                dataTestIdPath={`${TEST_ID_KEY_PO}ComInvoiceIDPath`}
                dataTestIdRemove={`${TEST_ID_KEY_PO}ComInvoiceIDRemove`}
                id={purchaseOrderId}
                fieldName={'comInvoice'}
                path={comInvoice}
              />
            </FormElement>
            <FormElement label={t('po.gstInvoice')}>
              <UploadPOAttachment
                dataTestID={`${TEST_ID_KEY_PO}GSTInvoiceID`}
                dataTestIdPath={`${TEST_ID_KEY_PO}GSTInvoiceIDPath`}
                dataTestIdRemove={`${TEST_ID_KEY_PO}GSTInvoiceIDRemove`}
                id={purchaseOrderId}
                fieldName={'gstInvoice'}
                path={gstInvoice}
              />
            </FormElement>
            <FormElement label={t('po.currency')}>
              <span className={contentStyle}> {poCurrency}</span>
            </FormElement>
          </div>
          {/* Col 3 */}
          <div className="w-[45%]">
            <FormElement label={t('po.payment')}>
              <span className={contentStyle}> {paymentType}</span>
            </FormElement>
            <FormElement label={t('po.paymentDays')}>
              <span className={contentStyle}> {paymentDays}</span>
            </FormElement>
          </div>
        </div>
      </div>
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, SelectItem } from 'src/components';
import { TEST_ID_KEY_S_INVOICE } from 'src/constants/invoice';
import {
  getInvoiceDNType,
  getInvoiceType
} from 'src/store/selectors/features/service-invoice';
import {
  bulkUpdateSOData,
  resetSOKeys,
  updateSOData
} from 'src/store/slices/features/service-invoice';
import {
  DEBIT_NOTE_OPTIONS,
  INVOICES_OPTIONS,
  INVOICES_TYPES
} from '../../../constants/common';
import { S_INV_KEYS } from 'src/constants/invoice';
import { getCurrency } from 'src/store/selectors/features/app';
import {
  getVendor,
  getVendorAddress,
  getVendorCountry,
  getVendorName,
  getVendorPhone,
  getVendorTaxID
} from 'src/store/selectors/features/vendor';

export const ServiceOrderForm: React.FC<IFormProps> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('invoice');
  const invoiceType = useSelector(getInvoiceType);
  const debitNoteType = useSelector(getInvoiceDNType);
  const country = useSelector(getVendorCountry) || {};
  const currency = getCurrency(country);
  const vendor = useSelector(getVendor);
  const vendorName = useSelector(getVendorName);
  const vendorAddress = useSelector(getVendorAddress);
  const vendorTaxId = useSelector(getVendorTaxID);
  const vendorContact = useSelector(getVendorPhone);
  const [disableFields, setDisableFields] = useState(false);

  const {
    TYPE,
    DEBIT_NOTE_TYPE,
    COUNTRY,
    CURRENCY,
    CUSTOMER,
    PRODUCTS,
    NET_TAX,
    NET_WO_TAX,
    NET_W_TAX
  } = S_INV_KEYS;

  const { control, errors, setValue } = props;

  const fieldNames = {
    invoiceType: 'invoiceType',
    debitNoteType: 'debitNoteType'
  };

  const setFormValue = (key: string, value: string | number) => {
    if (key && value) {
      setValue(key, value);
    }
  };

  const formHandler = (key: string, value: string | number) => {
    dispatch(
      resetSOKeys([PRODUCTS, NET_TAX, NET_WO_TAX, NET_W_TAX, DEBIT_NOTE_TYPE])
    );
    dispatch(updateSOData({ key, value }));
  };

  useEffect(() => {
    dispatch(
      bulkUpdateSOData([
        { key: CURRENCY, value: currency },
        { key: COUNTRY, value: country },
        { key: CUSTOMER, value: vendor }
      ])
    );

    if (invoiceType) {
      setFormValue(fieldNames.invoiceType, invoiceType);
      setFormValue(fieldNames.debitNoteType, debitNoteType);
      setDisableFields(true);
    }
  }, [vendor]);

  const customerInfoText = 'text-sm text-gray-grey2 mt-2';
  const customerInfoHeadings = 'font-medium mt-5';

  return (
    <div className="flex justify-start mb-32">
      {/* Col 1 */}
      <div className="w-[15%]">
        <div className="mb-6">
          <span className="text-2xl font-bold">
            {t('invoice.invoiceDetails')}
          </span>
        </div>
        <Controller
          control={control}
          rules={{
            required: {
              value: true,
              message: t('invoice.invoiceTypeRequired')
            }
          }}
          name={fieldNames.invoiceType}
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('invoice.selectDocType')}
              isRequired
              errorMessage={errors?.invoiceType?.message}
              dataTestID={`${TEST_ID_KEY_S_INVOICE}InvoiceType`}
            >
              <SelectItem
                dataTestID={`${TEST_ID_KEY_S_INVOICE}InvoiceType`}
                placeholder={t('invoice.selectDocType')}
                value={invoiceType}
                onChange={(e: string) => {
                  formHandler(TYPE, e);
                  onChange(e);
                }}
                disabled={disableFields}
                options={INVOICES_OPTIONS}
              />
            </FormElement>
          )}
        />
        {invoiceType === INVOICES_TYPES.DEBIT_NOTE ? (
          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: t('invoice.debitNoteTypeRequired')
              }
            }}
            name={fieldNames.debitNoteType}
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('invoice.debitNoteType')}
                isRequired
                errorMessage={errors?.debitNoteType?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_S_INVOICE}InvoiceType`}
                  placeholder={t('invoice.selectDocType')}
                  value={debitNoteType}
                  onChange={(e: string) => {
                    formHandler(DEBIT_NOTE_TYPE, e);
                    onChange(e);
                  }}
                  options={DEBIT_NOTE_OPTIONS}
                  disabled={disableFields}
                />
              </FormElement>
            )}
          />
        ) : (
          <></>
        )}
      </div>

      {/* Col 2 */}

      <div className="w-[35%] ml-96">
        <p className="text-2xl font-bold mb-5">{t('invoice.clientDetails')}</p>
        <div className=" flex flex-wrap">
          <div className=" w-3/6">
            <p className={customerInfoHeadings}>{t('invoice.fullName')}</p>
            <p className={customerInfoText}>{vendorName}</p>
          </div>
          <div className=" w-3/6">
            <p className={customerInfoHeadings}>{t('invoice.fullAddress')}</p>
            <p className={customerInfoText}>{vendorAddress}</p>
          </div>
          <div className=" w-3/6">
            <p className={customerInfoHeadings}>{t('invoice.vatNumber')}</p>
            <p className={customerInfoText}>{vendorTaxId}</p>
          </div>
          <div className=" w-3/6">
            <p className={customerInfoHeadings}>{t('invoice.contactNumber')}</p>
            <p className={customerInfoText}>{vendorContact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

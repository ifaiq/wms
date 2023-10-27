import { LockOutlined } from '@mui/icons-material';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, InputItem, SelectItem } from 'src/components';
import { VENDOR_STATUSES } from 'src/constants/vendor';
import {
  useGetBUsByCountry,
  useGetVendorsByCountry,
  useGetWareHousesByBU
} from 'src/hooks';
import { getVendorsByCountry } from 'src/store/selectors/entities/vendor';
import { getCurrency } from 'src/store/selectors/features/app';
import {
  getPOBUId,
  getPOBusinessUnitName,
  getPOComInvoiceName,
  getPOComInvoicePath,
  getPOCountryName,
  getPOCurrency,
  getPOCurrencyList,
  getPOGSTInvoiceNumber,
  getPOGSTInvoicePath,
  getPOLocationId,
  getPOPaymentDays,
  getPOPaymentType,
  getPOType,
  getPOVendorId,
  getPOVendorName,
  getPOWareHouseName,
  getPurchaseOrderId
} from 'src/store/selectors/features/purchase-order';
import { updateVendors } from 'src/store/slices/entities/vendor';
import {
  resetPOKeys,
  setRFQEditFlag,
  updatePOData
} from 'src/store/slices/features/purchase-order';
import { COUNTRIES, PAYMENT, PAYMENT_TYPES } from '../../../constants/common';
import { PO_TYPES, TEST_ID_KEY_PO } from '../../../constants/purchase-order';
import { UploadPOAttachment } from './upload-attachment';

export const PurchaseOrderForm: React.FC<IPOForm> = ({
  disabled = false,
  props
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('po');
  const purchaseOrderId = useSelector(getPurchaseOrderId);
  const country = useSelector(getPOCountryName);
  const buId = useSelector(getPOBUId);
  const buName = useSelector(getPOBusinessUnitName);
  const warehouseName = useSelector(getPOWareHouseName);
  const warehouseId = useSelector(getPOLocationId);
  const vendorName = useSelector(getPOVendorName);
  const vendorId = useSelector(getPOVendorId);
  const type = useSelector(getPOType);
  const paymentType = useSelector(getPOPaymentType);
  const paymentDays = useSelector(getPOPaymentDays);

  const vendors = useSelector((state: TReduxState) =>
    getVendorsByCountry(state, country)
  );

  const gstInvoice = useSelector(getPOGSTInvoicePath);
  const gstInvoiceNumber = useSelector(getPOGSTInvoiceNumber);
  const comInvoice = useSelector(getPOComInvoicePath);
  const comInvoiceName = useSelector(getPOComInvoiceName);
  const currency = getCurrency(country);
  const currencyList = useSelector(getPOCurrencyList);
  const poCurrency = useSelector(getPOCurrency);

  const { control, errors, setValue } = props;
  const { data: bussinesUnits } = useGetBUsByCountry(country);
  const { data: warehouses } = useGetWareHousesByBU(buId);

  const { data: vendorsData } = useGetVendorsByCountry({
    country: country,
    status: VENDOR_STATUSES.LOCKED,
    skip: 0,
    take: 500
  });

  useEffect(() => {
    if (vendorsData?.data) dispatch(updateVendors(vendorsData.data?.vendors));
  }, [vendorsData?.data]);

  const setFormValue = (key: string, value: string | number) => {
    if (key && value) {
      setValue(key, value);
    }
  };

  useEffect(() => {
    setFormValue('type', type);
    setFormValue('country', country);
    setFormValue('businessUnitId', buId);
    setFormValue('warehouseId', warehouseId);
    setFormValue('vendorId', vendorId);
  }, [purchaseOrderId]);

  const formHandler = (key: string, value: string | number) => {
    dispatch(updatePOData({ key, value }));
    purchaseOrderId && dispatch(setRFQEditFlag(true));
  };

  const countryHandler = (key: string, value: string | number) => {
    formHandler(key, value);
    dispatch(
      resetPOKeys([
        'businessUnitId',
        'businessUnit',
        'warehouseId',
        'warehouse',
        'vendorId',
        'vendor'
      ])
    );
  };

  const cityHandler = (key: string, value: string | number) => {
    formHandler(key, value);
    dispatch(resetPOKeys(['warehouseId', 'warehouse']));
  };

  useEffect(() => {
    if (!purchaseOrderId) formHandler('currency', currency!);
  }, [country]);

  return (
    <div>
      <div className="flex justify-between">
        {/* Col 1 */}
        <div className="w-[45%]">
          <Controller
            control={control}
            rules={{
              required: { value: true, message: 'PO type is required' }
            }}
            name="type"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.type')}
                isRequired
                errorMessage={errors?.type?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}Type`}
                  placeholder={t('po.type')}
                  value={type}
                  onChange={(e: string) => {
                    formHandler('type', e);
                    onChange(e);
                  }}
                  options={PO_TYPES}
                />
              </FormElement>
            )}
          />

          <Controller
            control={control}
            rules={{
              required: { value: true, message: 'Country is required' }
            }}
            name="country"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.country')}
                isRequired
                errorMessage={errors?.country?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}Country`}
                  placeholder={t('po.country')}
                  value={country}
                  onChange={(e: string) => {
                    countryHandler('country', e);
                    onChange(e);
                  }}
                  options={COUNTRIES}
                  disabled={disabled}
                />
              </FormElement>
            )}
          />

          <Controller
            control={control}
            rules={{
              required: { value: true, message: 'City is required' }
            }}
            name="businessUnitId"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.city')}
                isRequired
                errorMessage={errors?.businessUnitId?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}City`}
                  placeholder={t('po.city')}
                  value={buId || buName}
                  onChange={(e: string) => {
                    cityHandler('businessUnitId', Number(e));
                    onChange(e);
                  }}
                  options={bussinesUnits?.data}
                  disabled={disabled}
                />
              </FormElement>
            )}
          />

          <Controller
            control={control}
            rules={{
              required: { value: true, message: 'Warehouse is required' }
            }}
            name="warehouseId"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.warehouse')}
                isRequired
                errorMessage={errors?.warehouseId?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}Warehouse`}
                  placeholder={t('po.warehouse')}
                  value={warehouseId || warehouseName}
                  onChange={(e: string) => {
                    formHandler('warehouseId', Number(e));
                    onChange(e);
                  }}
                  options={warehouses?.data}
                  disabled={disabled}
                />
              </FormElement>
            )}
          />

          <Controller
            control={control}
            rules={{
              required: { value: true, message: 'Vendor is required' }
            }}
            name="vendorId"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.vendor')}
                isRequired
                errorMessage={errors?.vendorId?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}Vendor`}
                  showSearch
                  placeholder={t('po.vendor')}
                  value={vendorId || vendorName}
                  onChange={(e: string) => {
                    formHandler('vendorId', e), onChange(e);
                  }}
                  options={vendors}
                  disabled={disabled}
                />
              </FormElement>
            )}
          />
        </div>
        {/* Col 2 */}
        <div className="w-[45%]">
          <Controller
            control={control}
            rules={{
              required: { value: false, message: 'Invalid input' }
            }}
            name="comInvoiceName"
            render={() => (
              <FormElement
                label={t('po.comInvoice')}
                errorMessage={errors?.comInvoiceName?.message}
              >
                <InputItem
                  dataTestID={`${TEST_ID_KEY_PO}CommercialInvoice`}
                  value={comInvoiceName || ''}
                  suffix={<LockOutlined className="rounded-md" />}
                  placeholder={'Attach Invoice Below'}
                  disabled
                />
              </FormElement>
            )}
          />

          {purchaseOrderId && (
            <UploadPOAttachment
              dataTestID={`${TEST_ID_KEY_PO}ComInvoiceID`}
              dataTestIdPath={`${TEST_ID_KEY_PO}ComInvoiceIDPath`}
              dataTestIdRemove={`${TEST_ID_KEY_PO}ComInvoiceIDRemove`}
              id={purchaseOrderId}
              fieldName={'comInvoice'}
              path={comInvoice}
              alignment={'justify-end'}
            />
          )}

          <Controller
            control={control}
            rules={{
              pattern: {
                value: new RegExp('^\\w*$'),
                message: 'Alpha-numeric input allowed only'
              }
            }}
            name="gstInvoiceNumber"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.gstInvoice')}
                errorMessage={errors?.gstInvoiceNumber?.message}
              >
                <InputItem
                  dataTestID={`${TEST_ID_KEY_PO}GSTInvoice`}
                  value={gstInvoiceNumber || ''}
                  placeholder={'Add GST Invoice No.'}
                  onChange={(e: TObject) => {
                    formHandler('gstInvoiceNumber', e.target.value),
                      onChange(e.target.value);
                  }}
                />
              </FormElement>
            )}
          />

          {purchaseOrderId && (
            <UploadPOAttachment
              dataTestID={`${TEST_ID_KEY_PO}GSTInvoiceID`}
              dataTestIdPath={`${TEST_ID_KEY_PO}GSTInvoiceIDPath`}
              dataTestIdRemove={`${TEST_ID_KEY_PO}GSTInvoiceIDRemove`}
              id={purchaseOrderId}
              fieldName={'gstInvoice'}
              path={gstInvoice}
              alignment={'justify-end'}
            />
          )}
          <Controller
            control={control}
            rules={{
              required: { value: false, message: 'Invalid input' }
            }}
            name="currency"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.currency')}
                errorMessage={errors?.currency?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}Currency`}
                  placeholder={t('po.currency')}
                  value={poCurrency}
                  onChange={(e: string) => {
                    formHandler('currency', e);
                    onChange(e);
                  }}
                  options={currencyList}
                  disabled={disabled}
                />
              </FormElement>
            )}
          />

          <Controller
            control={control}
            rules={{
              required: { value: false, message: 'Invalid input' }
            }}
            name="payment"
            render={({ field: { onChange } }) => (
              <FormElement
                label={t('po.payment')}
                errorMessage={errors?.payment?.message}
              >
                <SelectItem
                  dataTestID={`${TEST_ID_KEY_PO}PaymentType`}
                  placeholder={t('po.paymentType')}
                  value={paymentType}
                  onChange={(e: string) => {
                    formHandler('payment', e);
                    onChange(e);
                  }}
                  options={PAYMENT_TYPES}
                  disabled={disabled}
                />
              </FormElement>
            )}
          />
          {paymentType === PAYMENT.CREDIT && (
            <Controller
              control={control}
              rules={{
                min: {
                  value: 0,
                  message: 'Input Should be greater than or equal to zero'
                }
              }}
              name="paymentDays"
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('po.paymentDays')}
                  errorMessage={errors?.paymentDays?.message}
                >
                  <InputItem
                    dataTestID={`${TEST_ID_KEY_PO}PaymentDays`}
                    placeholder={t('po.selectPaymentDays')}
                    type="number"
                    value={paymentDays}
                    onChange={(e: TObject) => {
                      formHandler('paymentDays', e.target.value),
                        onChange(e.target.value);
                    }}
                  />
                </FormElement>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

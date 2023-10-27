import omit from 'lodash.omit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  INVOICE_COUNTRY_FILTER_OPTIONS,
  INVOICE_TYPE_FILTER_OPTIONS
} from 'src/constants/common';
import { DATE_FORMAT_FILTERS } from 'src/constants/date-format';
import {
  ButtonPrimary,
  CustomDatePicker,
  DividerComponent,
  FormElement,
  InputItem,
  SelectItem
} from 'src/components';
import { INITIAL_INVOICE_FILTER } from 'src/constants/invoice';

export const InvoiceFilters: React.FC<IFilters> = ({
  applyFilter,
  filterParams
}) => {
  const [formState, setFormState] = useState<TObject>(INITIAL_INVOICE_FILTER);

  const [t] = useTranslation('invoice');

  useEffect(() => {
    setFormState(filterParams);
  }, [filterParams]);

  const getFromDisableDates = (current: Date) => {
    return current && current > formState.till && formState.till;
  };

  const getTillDisableDates = (current: Date) => {
    return current && current <= formState.from;
  };

  const handleCustomForm = (
    value: string | number | null | Date,
    name: string
  ) => {
    if (!value)
      setFormState((data: Record<string, string>) => omit(data, [name]));
    if (value)
      setFormState((data: Record<string, string>) => ({
        ...data,
        [name]: value
      }));
  };

  const fromDateHandler = (
    value: string | number | null | Date,
    name: string
  ) => {
    if (!value)
      setFormState((data: Record<string, string>) => omit(data, [name]));
    if (value)
      setFormState((data: Record<string, string>) => ({
        ...data,
        [name]: value
      }));
    setFormState((data: Record<string, string>) => ({ ...data, till: null }));
  };

  const onSubmit = () => {
    applyFilter(formState);
  };

  return (
    <div>
      <div className="items-center">
        <FormElement label={t('invoice.selectInvoiceType')}>
          <SelectItem
            value={formState.invoiceType}
            placeholder={t('invoice.selectInvoiceType')}
            onChange={(e: string) => handleCustomForm(e, 'invoiceType')}
            options={INVOICE_TYPE_FILTER_OPTIONS}
          />
        </FormElement>
        <FormElement label={t('invoice.enterOrderId')}>
          <InputItem
            value={formState.orderId}
            placeholder={t('invoice.orderId')}
            onChange={(e) => handleCustomForm(e.target.value, 'orderId')}
          />
        </FormElement>
        <FormElement label={t('invoice.enterInvoiceNumber')}>
          <InputItem
            value={formState.invoiceNumber}
            placeholder={t('invoice.invoiceNumber')}
            onChange={(e) => handleCustomForm(e.target.value, 'invoiceNumber')}
          />
        </FormElement>
        <FormElement label={t('invoice.country')}>
          <SelectItem
            value={formState.countryCode}
            placeholder={t('invoice.country')}
            onChange={(e: string) => handleCustomForm(e, 'countryCode')}
            options={INVOICE_COUNTRY_FILTER_OPTIONS}
          />
        </FormElement>
        <DividerComponent type="horizontal" dashed={true} />
        <FormElement label={t('invoice.from')}>
          <CustomDatePicker
            value={formState.from}
            disabledDate={getFromDisableDates}
            format={DATE_FORMAT_FILTERS.COMMON}
            onChange={(date: Date) => fromDateHandler(date, 'from')}
          />
        </FormElement>
        <FormElement label={t('invoice.till')}>
          <CustomDatePicker
            value={formState.till}
            disabled={!formState.from}
            disabledDate={getTillDisableDates}
            format={DATE_FORMAT_FILTERS.COMMON}
            onChange={(date: Date) => handleCustomForm(date, 'till')}
          />
        </FormElement>
      </div>
      <div className="flex justify-end mt-6">
        <ButtonPrimary
          type="submit"
          size="auto"
          onClick={onSubmit}
          text={`${t('invoice.applyFilter')}`}
        />
      </div>
    </div>
  );
};

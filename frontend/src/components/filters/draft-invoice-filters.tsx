import omit from 'lodash.omit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { INVOICE_TYPE_FILTER_OPTIONS } from 'src/constants/common';
import { DATE_FORMAT_FILTERS } from 'src/constants/date-format';
import {
  ButtonPrimary,
  CustomDatePicker,
  DividerComponent,
  FormElement,
  SelectItem
} from 'src/components';
import { INITIAL_DRAFT_INVOICE_FILTER } from 'src/constants/invoice';

export const DraftInvoiceFilters: React.FC<IFilters> = ({
  applyFilter,
  filterParams
}) => {
  const [formState, setFormState] = useState<TObject>(
    INITIAL_DRAFT_INVOICE_FILTER
  );

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
            value={formState.type}
            placeholder={t('invoice.selectInvoiceType')}
            onChange={(e: string) => {
              handleCustomForm(e, 'type');
            }}
            options={INVOICE_TYPE_FILTER_OPTIONS}
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

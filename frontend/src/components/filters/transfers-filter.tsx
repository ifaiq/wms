import omit from 'lodash.omit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from 'src/constants/common';
import { DATE_FORMAT_FILTERS } from 'src/constants/date-format';
import { INITIAL_TRANSFER_FILTER, TRANSFERS } from 'src/constants/transfers';
import {
  ButtonPrimary,
  CustomDatePicker,
  CustomForm,
  DividerComponent,
  FormElement,
  SelectItem
} from 'src/components';

export const TransferFilter: React.FC<IFilters> = ({
  applyFilter,
  filterParams
}) => {
  const [t] = useTranslation('transfer');

  const [formState, setFormState] = useState<TObject>(INITIAL_TRANSFER_FILTER);

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
    setFormState((data: Record<string, string>) => ({ ...data, till: '' }));
  };

  const onSubmit = () => applyFilter(formState);

  return (
    <>
      <CustomForm layout="vertical" name="transfers-filters">
        <div className="items-center">
          <FormElement label={t('transfer.selectCountry')}>
            <SelectItem
              placeholder={`${t('transfer.selectCountry')}`}
              value={formState.country}
              allowClear
              onChange={(e: string) => handleCustomForm(e, 'country')}
              options={COUNTRIES}
            />
          </FormElement>

          <FormElement label={t('transfer.transferTypes')}>
            <SelectItem
              value={formState.type}
              placeholder={t('transfer.selectTranferStatus')}
              allowClear
              onChange={(e: string) => handleCustomForm(e, 'type')}
              options={TRANSFERS}
            />
          </FormElement>
          <DividerComponent type="horizontal" dashed={true} />
          <h1 className="font-semibold">{t('transfer.confirmationDates')}</h1>
          <DividerComponent type="horizontal" />

          <FormElement label={t('transfer.from')}>
            <CustomDatePicker
              value={formState.from}
              disabledDate={getFromDisableDates}
              onChange={(date: Date) => fromDateHandler(date, 'from')}
              format={DATE_FORMAT_FILTERS.COMMON}
            />
          </FormElement>
          <FormElement label={t('transfer.till')}>
            <CustomDatePicker
              value={formState.till}
              disabled={!formState.from}
              disabledDate={getTillDisableDates}
              onChange={(date: Date) => handleCustomForm(date, 'till')}
              format={DATE_FORMAT_FILTERS.COMMON}
            />
          </FormElement>
        </div>
        <div className="flex justify-end mt-6">
          <ButtonPrimary
            type="submit"
            size="auto"
            onClick={onSubmit}
            text={`${t('transfer.applyFilter')}`}
          />
        </div>
      </CustomForm>
    </>
  );
};

import omit from 'lodash.omit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from 'src/constants/common';
import { DATE_FORMAT_FILTERS } from 'src/constants/date-format';
import { INITIAL_PO_FILTER } from 'src/constants/purchase-order';
import { useGetBUsByCountry, useGetWareHousesByBU } from 'src/hooks';
import { getPOStatusObject } from 'src/pages/purchase-order/helper';
import {
  ButtonPrimary,
  CustomDatePicker,
  DividerComponent,
  FormElement,
  SelectItem
} from 'src/components';

export const FiltersPO: React.FC<IFilters> = ({
  applyFilter,
  filterParams
}) => {
  const [formState, setFormState] = useState<TObject>(INITIAL_PO_FILTER);

  const [t] = useTranslation('po');

  const bussinesUnits = useGetBUsByCountry(formState.country);
  const warehouses = useGetWareHousesByBU(formState.businessUnitId);

  const POStatusArray = getPOStatusObject();

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

  const countryHandler = (value: string | number, key: string) => {
    handleCustomForm(value, key);
    setFormState((data: Record<string, string>) => ({
      ...data,
      businessUnitId: null,
      warehouseId: null
    }));
  };

  const cityHandler = (value: string | number, key: string) => {
    handleCustomForm(value, key);
    setFormState((data: Record<string, string>) => ({
      ...data,
      warehouseId: null
    }));
  };

  const onSubmit = () => {
    applyFilter(formState);
  };

  return (
    <div>
      <div className="items-center">
        <FormElement label={t('po.country')}>
          <SelectItem
            value={formState.country}
            placeholder={t('po.country')}
            onChange={(e: string) => countryHandler(e, 'country')}
            options={COUNTRIES}
          />
        </FormElement>
        <FormElement label={t('po.city')}>
          <SelectItem
            value={formState.businessUnitId}
            placeholder={t('po.city')}
            onChange={(e: string) => cityHandler(e, 'businessUnitId')}
            options={bussinesUnits?.data?.data}
          />
        </FormElement>
        <FormElement label={t('po.warehouse')}>
          <SelectItem
            value={formState.warehouseId}
            placeholder={t('po.warehouse')}
            onChange={(e: string) => handleCustomForm(e, 'warehouseId')}
            options={warehouses?.data?.data}
          />
        </FormElement>
        <FormElement label={t('po.status')}>
          <SelectItem
            placeholder={t('po.status')}
            value={formState.status}
            onChange={(e: string) => handleCustomForm(e, 'status')}
            options={POStatusArray}
          />
        </FormElement>
        <DividerComponent type="horizontal" dashed={true} />
        <FormElement label={t('po.from')}>
          <CustomDatePicker
            value={formState.from}
            disabledDate={getFromDisableDates}
            format={DATE_FORMAT_FILTERS.COMMON}
            onChange={(date: Date) => fromDateHandler(date, 'from')}
          />
        </FormElement>
        <FormElement label={t('po.till')}>
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
          text={`${t('po.applyFilter')}`}
        />
      </div>
    </div>
  );
};

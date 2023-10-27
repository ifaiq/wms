import omit from 'lodash.omit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from 'src/constants/common';
import {
  INITIAL_LOCATION_FILTER,
  TEST_ID_KEY_LOCATION
} from 'src/constants/locations';
import { useGetBUsByCountry, useGetWareHousesByBU } from 'src/hooks';
import { ButtonPrimary, FormElement, SelectItem } from 'src/components';

export const LocationFilter: React.FC<IFilters> = ({
  filterParams,
  applyFilter
}) => {
  const [formState, setFormState] = useState<TObject>(INITIAL_LOCATION_FILTER);

  const [t] = useTranslation('location');

  const bussinesUnits = useGetBUsByCountry(formState.country);
  const warehouses = useGetWareHousesByBU(formState.businessUnitId);

  useEffect(() => {
    setFormState(filterParams);
  }, [filterParams]);

  const handleCustomForm = (value: TNumberOrString, name: string) => {
    if (!value)
      setFormState((data: Record<string, string>) => omit(data, [name]));
    if (value)
      setFormState((data: Record<string, string>) => ({
        ...data,
        [name]: value
      }));
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
    <>
      <FormElement label={t('location.country')}>
        <SelectItem
          value={formState.country}
          placeholder={t('location.country')}
          dataTestID={`${TEST_ID_KEY_LOCATION}FilterCountry`}
          onChange={(e: string) => countryHandler(e, 'country')}
          options={COUNTRIES}
        />
      </FormElement>
      <FormElement label={t('location.city')}>
        <SelectItem
          value={formState.businessUnitId}
          placeholder={t('location.city')}
          dataTestID={`${TEST_ID_KEY_LOCATION}FilterBusinessUnit`}
          onChange={(e: string) => cityHandler(e, 'businessUnitId')}
          options={bussinesUnits?.data?.data}
        />
      </FormElement>
      <FormElement label={t('location.warehouse')}>
        <SelectItem
          value={formState.warehouseId}
          placeholder={t('location.warehouse')}
          dataTestID={`${TEST_ID_KEY_LOCATION}FilterWarehouse`}
          onChange={(e: string) => handleCustomForm(e, 'warehouseId')}
          options={warehouses?.data?.data}
        />
      </FormElement>
      <div className="flex justify-end mt-6">
        <ButtonPrimary
          type="submit"
          size="auto"
          dataTestID={`${TEST_ID_KEY_LOCATION}FilterApplyButton`}
          onClick={onSubmit}
          text={`${t('location.applyFilter')}`}
        />
      </div>
    </>
  );
};

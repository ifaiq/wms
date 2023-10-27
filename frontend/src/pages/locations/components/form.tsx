import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, InputItem, SelectItem } from 'src/components';
import { COUNTRIES } from 'src/constants/common';
import { TEST_ID_KEY_LOCATION } from 'src/constants/locations';
import {
  useGetAllLocationsByType,
  useGetBUsByCountry,
  useGetWareHousesByBU
} from 'src/hooks';
import {
  getIsLocStatusUpdateAllowed,
  getLocationBusinessUnitId,
  getLocationCountry,
  getLocationId,
  getLocationName,
  getLocationParentId,
  getLocationWarehouseId
} from 'src/store/selectors/features/location';
import {
  resetLocationKeys,
  updateLocationData
} from 'src/store/slices/features/location';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { LocationConfigs } from './configs';

export const LocationForm: React.FC<IFormProps> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('location');

  const locationId = useSelector(getLocationId);
  const country = useSelector(getLocationCountry);
  const businessUnitId = useSelector(getLocationBusinessUnitId);
  const warehouseId = useSelector(getLocationWarehouseId);
  const parentId = useSelector(getLocationParentId);
  const locationName = useSelector(getLocationName);
  const isStatusUpdateAllowed = useSelector(getIsLocStatusUpdateAllowed);

  const { control, errors, setValue } = props;

  const { data: bussinesUnits } = useGetBUsByCountry(country);
  const { data: warehouses } = useGetWareHousesByBU(businessUnitId);

  const requestPayload: TObject = prepareFilterRequestPayload({
    country,
    businessUnitId,
    warehouseId,
    showDisabled: locationId ? true : false
  });

  const { data: parentLocations } = useGetAllLocationsByType(requestPayload);

  const parentLocationsData: Array<TObject> = [];
  const parentLocationsConfigs: TObject = {};

  parentLocations?.data?.forEach((location: TObject) => {
    const id = location?.id;

    parentLocationsData.push({ id, name: location?.name });
    parentLocationsConfigs[id] = {
      availableForSale: location?.availableForSale,
      grnApplicable: location?.grnApplicable,
      returnApplicable: location?.returnApplicable
    };
  });

  const formHandler = (key: string, value: TNumberOrString | null) => {
    dispatch(updateLocationData({ key, value }));
  };

  const countryHandler = (key: string, value: TNumberOrString) => {
    formHandler(key, value);
    dispatch(resetLocationKeys(['businessUnitId', 'warehouseId']));
  };

  const cityHandler = (key: string, value: TNumberOrString) => {
    formHandler(key, value);
    dispatch(resetLocationKeys(['warehouseId']));
  };

  const wareHouseHandler = (key: string, value: TNumberOrString) => {
    formHandler(key, value);
    dispatch(resetLocationKeys(['parentId']));
  };

  const setFormValue = (key: string, value: TNumberOrString | null) => {
    if (key && value) {
      setValue(key, value);
    }
  };

  useEffect(() => {
    setFormValue('country', country);
    setFormValue('businessUnitId', businessUnitId);
    setFormValue('warehouseId', warehouseId);
    setFormValue('parentId', parentId);
    setFormValue('name', locationName);
  }, [locationId]);

  return (
    <div className="flex justify-between">
      {/* Col 1 */}
      <div className="w-[45%]">
        <Controller
          control={control}
          rules={{
            required: { value: true, message: 'Country is required' }
          }}
          name="country"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('location.selectCountry')}
              isRequired
              errorMessage={errors?.country?.message}
              dataTestID={`${TEST_ID_KEY_LOCATION}CountryError`}
            >
              <SelectItem
                placeholder={t('location.selectCountry')}
                value={country}
                onChange={(e: string) => {
                  countryHandler('country', e);
                  onChange(e);
                }}
                disabled={locationId}
                options={COUNTRIES}
                dataTestID={`${TEST_ID_KEY_LOCATION}Country`}
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
              label={t('location.selectCity')}
              isRequired
              errorMessage={errors?.businessUnitId?.message}
              dataTestID={`${TEST_ID_KEY_LOCATION}CityError`}
            >
              <SelectItem
                placeholder={t('location.selectCity')}
                value={businessUnitId}
                onChange={(e: string) => {
                  cityHandler('businessUnitId', Number(e));
                  onChange(e);
                }}
                disabled={locationId}
                options={bussinesUnits?.data}
                dataTestID={`${TEST_ID_KEY_LOCATION}City`}
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
              label={t('location.selectWarehouse')}
              isRequired
              errorMessage={errors?.warehouseId?.message}
              dataTestID={`${TEST_ID_KEY_LOCATION}WarehouseError`}
            >
              <SelectItem
                placeholder={t('location.selectWarehouse')}
                value={warehouseId}
                onChange={(e: string) => {
                  wareHouseHandler('warehouseId', Number(e));
                  onChange(e);
                }}
                disabled={locationId}
                options={warehouses?.data}
                dataTestID={`${TEST_ID_KEY_LOCATION}Warehouse`}
              />
            </FormElement>
          )}
        />
      </div>

      {/* Col 2 */}
      <div className="w-[45%]">
        <Controller
          control={control}
          name="parentId"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('location.parentLocation')}
              errorMessage={errors?.parentLocation?.message}
            >
              <SelectItem
                placeholder={t('location.selectParentLoc')}
                value={parentId || null}
                allowClear={true}
                onClear={() => {
                  formHandler('parentId', null);
                  onChange(null);
                }}
                onChange={(e: string) => {
                  formHandler('parentId', Number(e));
                  onChange(e);
                }}
                options={parentLocationsData}
                disabled={locationId}
                showSearch={true}
                dataTestID={`${TEST_ID_KEY_LOCATION}Parent`}
              />
            </FormElement>
          )}
        />

        <Controller
          control={control}
          rules={{
            required: { value: true, message: 'Location is required' }
          }}
          name="name"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('location.location')}
              isRequired
              errorMessage={errors?.name?.message}
              dataTestID={`${TEST_ID_KEY_LOCATION}NameError`}
            >
              <InputItem
                placeholder={t('location.enterLocation')}
                value={locationName}
                onChange={(e: TObject) => {
                  formHandler('name', e.target.value), onChange(e.target.value);
                }}
                dataTestID={`${TEST_ID_KEY_LOCATION}Name`}
              />
            </FormElement>
          )}
        />
        {isStatusUpdateAllowed && (
          <LocationConfigs
            locationId={locationId}
            selectedParentId={parentId}
            selectedParentsConfigs={parentLocationsConfigs[parentId]}
          />
        )}
      </div>
    </div>
  );
};

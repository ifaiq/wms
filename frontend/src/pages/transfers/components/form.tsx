import { LockOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FormElement, InputItem, SelectItem } from 'src/components';
import { DUMP_LOCATION } from 'src/constants/adjustment';
import { COUNTRIES } from 'src/constants/common';
import { TEST_ID_KEY_TRANSFER } from 'src/constants/transfers';
import {
  useGetAllLocationsByType,
  useGetBUsByCountry,
  useGetWareHousesByBU
} from 'src/hooks';
import {
  getTransferBUId,
  getTransferCountryName,
  getTransferFromLocationId,
  getTransferToLocationId,
  getTransferWareHouseId,
  getIsReasonInitialCount
} from 'src/store/selectors/features/transfer';
import { resetProducts } from 'src/store/slices/entities/product';
import {
  resetTransferKeys,
  updateTransferData
} from 'src/store/slices/features/transfer';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { TransferReason } from './reason';

export const TransferFrom: React.FC<ITransferForm> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('transfer');

  const [showInitialCount, setShowInitialCount] = useState(false);
  const [stagingLocationId, setStagingLocationId] = useState(null);

  const country = useSelector(getTransferCountryName);
  const businessUnitId = useSelector(getTransferBUId);
  const warehouseId = useSelector(getTransferWareHouseId);
  const fromLocationId = useSelector(getTransferFromLocationId);
  const toLocationId = useSelector(getTransferToLocationId);
  const isInitialCount = useSelector(getIsReasonInitialCount);

  const { email, control, errors, setValue } = props;

  const requestPayload: TObject = prepareFilterRequestPayload({
    country,
    businessUnitId,
    warehouseId,
    allowStagingLocation: true
  });

  const { data: bussinesUnits } = useGetBUsByCountry(country);
  const { data: warehouses } = useGetWareHousesByBU(businessUnitId);

  const { data: locationsData, isSuccess } =
    useGetAllLocationsByType(requestPayload);

  /**
   * Logic:
   * If the reason is initial count show staging location,
   * If the reason is other than initial count then show all locations except staging location
   */
  const allLocations = locationsData?.data?.filter((location: TObject) => {
    if (isInitialCount) return true;

    return location?.name !== DUMP_LOCATION;
  });

  const allParentFromLocations = allLocations?.filter(
    (loc: any) => loc?.id !== toLocationId
  );

  const allParentToLocations = allLocations?.filter(
    (loc: any) => loc?.id !== fromLocationId
  );

  const formHandler = (
    key: string,
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    dispatch(updateTransferData({ key, value }));
    onChange(value);
  };

  const countryHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    formHandler('country', value, onChange);
    dispatch(
      resetTransferKeys([
        'businessUnitId',
        'warehouseId',
        'fromLocationId',
        'toLocationId'
      ])
    );
  };

  const cityHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    formHandler('businessUnitId', value, onChange);
    dispatch(
      resetTransferKeys(['warehouseId', 'fromLocationId', 'toLocationId'])
    );
  };

  const warehouseHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    formHandler('warehouseId', value, onChange);
    dispatch(
      resetTransferKeys([
        'fromLocationId',
        'toLocationId',
        'reasonId',
        'reasonValue'
      ])
    );
  };

  const fromLocationHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    if (value !== fromLocationId) {
      dispatch(resetProducts());
    }

    formHandler('fromLocationId', value, onChange);
  };

  // Only responsible for keeping track of staging location id and initial count flag
  useEffect(() => {
    if (isSuccess && locationsData) {
      const index = locationsData?.data?.findIndex(
        (location: TObject) => location.name === DUMP_LOCATION
      );

      // If staging location is not found in the location data then don't show initial count as reason
      if (index === -1) {
        setStagingLocationId(null);
        setShowInitialCount(false);
        return;
      }

      setStagingLocationId(locationsData?.data[index].id);
      setShowInitialCount(true);
    }
  }, [isSuccess, locationsData]);

  // Reset the value of location if the reason is "Initial Count"
  useEffect(() => {
    const locId = isInitialCount ? stagingLocationId : null;

    formHandler('fromLocationId', locId, () => null);
    setValue('fromLocation', locId);
  }, [isInitialCount]);

  return (
    <>
      <div>
        <div className="flex justify-between">
          {/* Col 1 */}
          <div className="w-[45%]">
            <Controller
              control={control}
              rules={{
                required: { value: true, message: 'Country is required' }
              }}
              name="country"
              defaultValue={''}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={`${t('transfer.SelectCountry')}`}
                  isRequired
                  errorMessage={errors?.country?.message}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}CountryError`}
                >
                  <SelectItem
                    placeholder={t('transfer.SelectCountry')}
                    value={country}
                    onChange={(e: string) => {
                      countryHandler(e, onChange);
                    }}
                    options={COUNTRIES}
                    dataTestID={`${TEST_ID_KEY_TRANSFER}Country`}
                  />
                </FormElement>
              )}
            />

            <Controller
              control={control}
              rules={{
                required: { value: true, message: 'City is required' }
              }}
              defaultValue={''}
              name="businessUnitId"
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('transfer.SelectCity')}
                  isRequired
                  errorMessage={errors?.businessUnitId?.message}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}CityError`}
                >
                  <SelectItem
                    placeholder={t('transfer.SelectCity')}
                    value={businessUnitId}
                    onChange={(e: string) => cityHandler(Number(e), onChange)}
                    options={bussinesUnits?.data}
                    dataTestID={`${TEST_ID_KEY_TRANSFER}City`}
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
              defaultValue={''}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('transfer.SelectWarehouse')}
                  isRequired
                  errorMessage={errors?.warehouseId?.message}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}WarehouseError`}
                >
                  <SelectItem
                    placeholder={t('transfer.SelectWarehouse')}
                    value={warehouseId}
                    onChange={(e: string) =>
                      warehouseHandler(Number(e), onChange)
                    }
                    options={warehouses?.data}
                    dataTestID={`${TEST_ID_KEY_TRANSFER}Warehouse`}
                  />
                </FormElement>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={() => (
                <FormElement label={t('transfer.userId')}>
                  <InputItem
                    suffix={<LockOutlined className="rounded-md" />}
                    placeholder={email}
                    disabled
                    dataTestID={`${TEST_ID_KEY_TRANSFER}User`}
                  />
                </FormElement>
              )}
            />
          </div>
          {/* Col 2 */}
          <div className="w-[45%]">
            <TransferReason props={props} showInitialCount={showInitialCount} />
            <Controller
              control={control}
              rules={{
                required: { value: true, message: 'From Location is required' }
              }}
              name="fromLocation"
              defaultValue={''}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('transfer.fromLocation')}
                  isRequired
                  errorMessage={errors?.fromLocation?.message}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}FromLocationError`}
                >
                  <SelectItem
                    placeholder={t('transfer.selectLocation')}
                    value={fromLocationId}
                    onChange={(e: string) =>
                      fromLocationHandler(Number(e), onChange)
                    }
                    options={allParentFromLocations}
                    showSearch={true}
                    disabled={isInitialCount}
                    dataTestID={`${TEST_ID_KEY_TRANSFER}FromLocation`}
                  />
                </FormElement>
              )}
            />

            <Controller
              control={control}
              rules={{
                required: { value: true, message: 'To Location is required' }
              }}
              name="toLocation"
              defaultValue={''}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('transfer.toLocation')}
                  isRequired
                  errorMessage={errors?.toLocation?.message}
                  dataTestID={`${TEST_ID_KEY_TRANSFER}ToLocationError`}
                >
                  <SelectItem
                    placeholder={t('transfer.selectLocation')}
                    value={toLocationId}
                    onChange={(e: string) =>
                      formHandler('toLocationId', Number(e), onChange)
                    }
                    options={allParentToLocations}
                    showSearch={true}
                    dataTestID={`${TEST_ID_KEY_TRANSFER}ToLocation`}
                  />
                </FormElement>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
};

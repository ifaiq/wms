import { LockOutlined } from '@mui/icons-material';
import moment from 'moment';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomDatePicker,
  FormElement,
  InputItem,
  SelectItem
} from 'src/components';
import { DUMP_LOCATION, TEST_ID_KEY_ADJUST } from 'src/constants/adjustment';
import { COUNTRIES } from 'src/constants/common';
import { DATE_FORMAT } from 'src/constants/date-format';
import {
  useGetAllLocationsByType,
  useGetBUsByCountry,
  useGetWareHousesByBU
} from 'src/hooks';
import {
  getAdjustCountryName,
  getAdjustLocationId,
  getAdjustmentBUId,
  getAdjustPostingPeriod,
  getAdjustWarehouseId,
  getIsReasonInitialCount
} from 'src/store/selectors/features/adjustment';
import { resetProducts } from 'src/store/slices/entities/product';
import {
  resetAdjustmentKeys,
  updateAdjustmentData
} from 'src/store/slices/features/adjustment';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { AdjustmentReason } from './reason';

export const AdjustmentForm: React.FC<IFormProps> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('adjust');

  const country = useSelector(getAdjustCountryName);
  const businessUnitId = useSelector(getAdjustmentBUId);
  const warehouseId = useSelector(getAdjustWarehouseId);
  const locationId = useSelector(getAdjustLocationId);
  const isInitialCount = useSelector(getIsReasonInitialCount);
  const postingPeriod = useSelector(getAdjustPostingPeriod);

  const { email, control, errors } = props;

  const { data: bussinesUnits } = useGetBUsByCountry(country);
  const { data: warehouses } = useGetWareHousesByBU(businessUnitId);

  const requestPayload: TObject = prepareFilterRequestPayload({
    country,
    businessUnitId,
    warehouseId
  });

  const { data: parentLocationsData } =
    useGetAllLocationsByType(requestPayload);

  const allParentLocations = parentLocationsData?.data?.map(
    (location: TObject) => ({ id: location?.id, name: location?.name })
  );

  const formHandler = (
    key: string,
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    dispatch(updateAdjustmentData({ key, value }));
    onChange(value);
  };

  const countryHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    formHandler('country', value, onChange);
    dispatch(
      resetAdjustmentKeys(['businessUnitId', 'warehouseId', 'locationId'])
    );
  };

  const cityHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    formHandler('businessUnitId', value, onChange);
    dispatch(resetAdjustmentKeys(['warehouseId', 'locationId']));
  };

  const warehouseHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    formHandler('warehouseId', value, onChange);
    dispatch(resetAdjustmentKeys(['locationId']));
  };

  const locationHandler = (
    value: TNumberOrString | null,
    onChange: (value: TNumberOrString | null) => void
  ) => {
    if (value !== locationId) {
      dispatch(resetProducts());
    }

    formHandler('locationId', value, onChange);
  };

  // Reset the value of location if the reason in "Initial Count"
  useEffect(() => {
    if (isInitialCount) {
      formHandler('locationId', null, () => null);
      formHandler('postingPeriod', null, () => null);
    }
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
              defaultValue={null}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={`${t('adjust.SelectCountry')}`}
                  isRequired
                  errorMessage={errors?.country?.message}
                >
                  <SelectItem
                    placeholder={t('adjust.SelectCountry')}
                    value={country}
                    onChange={(e: string) => {
                      countryHandler(e, onChange);
                    }}
                    options={COUNTRIES}
                    dataTestID={`${TEST_ID_KEY_ADJUST}Country`}
                  />
                </FormElement>
              )}
            />

            <Controller
              control={control}
              rules={{
                required: { value: true, message: 'City is required' }
              }}
              defaultValue={null}
              name="businessUnitId"
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('adjust.SelectCity')}
                  isRequired
                  errorMessage={errors?.businessUnitId?.message}
                >
                  <SelectItem
                    placeholder={t('adjust.SelectCity')}
                    value={businessUnitId}
                    onChange={(e: string) => cityHandler(Number(e), onChange)}
                    options={bussinesUnits?.data}
                    dataTestID={`${TEST_ID_KEY_ADJUST}City`}
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
              defaultValue={null}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('adjust.SelectWarehouse')}
                  isRequired
                  errorMessage={errors?.warehouseId?.message}
                >
                  <SelectItem
                    placeholder={t('adjust.SelectWarehouse')}
                    value={warehouseId}
                    onChange={(e: string) =>
                      warehouseHandler(Number(e), onChange)
                    }
                    options={warehouses?.data}
                    dataTestID={`${TEST_ID_KEY_ADJUST}Warehouse`}
                  />
                </FormElement>
              )}
            />

            <Controller
              control={control}
              name="locationId"
              defaultValue={null}
              render={({ field: { onChange } }) => (
                <FormElement
                  label={t('adjust.selectLocation')}
                  errorMessage={errors?.location?.message}
                >
                  <SelectItem
                    placeholder={t('adjust.selectLocation')}
                    showSearch
                    value={isInitialCount ? DUMP_LOCATION : locationId}
                    onChange={(e: string) =>
                      locationHandler(Number(e), onChange)
                    }
                    options={allParentLocations}
                    disabled={isInitialCount}
                    dataTestID={`${TEST_ID_KEY_ADJUST}Location`}
                  />
                </FormElement>
              )}
            />
          </div>
          {/* Col 2 */}
          <div className="w-[45%]">
            <Controller
              control={control}
              name="email"
              render={() => (
                <FormElement label={t('adjust.userId')}>
                  <InputItem
                    suffix={<LockOutlined className="rounded-md" />}
                    placeholder={email}
                    disabled
                    dataTestID={`${TEST_ID_KEY_ADJUST}User`}
                  />
                </FormElement>
              )}
            />
            <AdjustmentReason props={props} />
            {!isInitialCount && (
              <Controller
                control={control}
                name="postingPeriod"
                rules={{
                  required: {
                    value: !isInitialCount,
                    message: 'Posting Period is required'
                  }
                }}
                render={({ field: { onChange } }) => (
                  <div className="w-[50%]">
                    <FormElement
                      label={t('adjust.postingPeriod')}
                      isRequired={!isInitialCount}
                      errorMessage={errors?.postingPeriod?.message}
                    >
                      <CustomDatePicker
                        format={DATE_FORMAT.ADJUSTMENTS}
                        value={postingPeriod && moment(postingPeriod)}
                        onChange={(date: Date) => {
                          formHandler(
                            'postingPeriod',
                            date.toISOString(),
                            onChange
                          );
                        }}
                        placeholder={t('adjust.selectPositngPeriod')}
                        dataTestID={`${TEST_ID_KEY_ADJUST}PostingPeriod`}
                      />
                    </FormElement>
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

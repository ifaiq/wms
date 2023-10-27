import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  ButtonPrimary,
  CustomSwitch,
  OverlayLoader,
  TopBar
} from 'src/components';
import {
  LOCATION_EDIT_BREADCRUMBS,
  TEST_ID_KEY_LOCATION
} from 'src/constants/locations';
import {
  useGetLocationById,
  useResetState,
  useUpdateLocation,
  useUpdateLocationStatus
} from 'src/hooks';
import {
  getIsEditLocationAllowed,
  getLocationReqPayload,
  getLocationStatus
} from 'src/store/selectors/features/location';
import { resetUsersData } from 'src/store/slices/entities/user';
import { addLocationData } from 'src/store/slices/features/location';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { LocationForm, LocationHeader } from './components';

export const EditLocation: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('location');
  const { id } = useParams<RouteParams>();

  useResetState(resetUsersData);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm();

  const requestPayload = useSelector(getLocationReqPayload);
  const isEditAllowed = useSelector(getIsEditLocationAllowed);
  const locationStatus = useSelector(getLocationStatus);

  const {
    data: locationData,
    isLoading: isLocationLoading,
    isError: isLocationError,
    error: locationError,
    refetch: refetchLocation
  } = useGetLocationById(id);

  const {
    isLoading: isLocationUpdateLoading,
    isSuccess: isLocationUpdateSuccess,
    isError: isLocationUpdateError,
    error: locationUpdateError,
    mutateAsync: updateLocation
  } = useUpdateLocation();

  const {
    isSuccess: isLocationStatusSuccess,
    isError: isLocationStatusError,
    error: LocationStatusError,
    mutateAsync: updateLocationStatus
  } = useUpdateLocationStatus();

  useEffect(() => {
    if (locationData) {
      dispatch(addLocationData(locationData?.data));
    }
  }, [locationData]);

  useEffect(() => {
    if (isLocationError || isLocationUpdateError) {
      const errorData =
        (locationError as TObject) || (locationUpdateError as TObject);

      if (errorData?.data?.context?.length) {
        errorData.data.context.forEach(({ field }: any) => {
          showErrorMessage(field);
        });
        errorData?.data?.context?.length &&
          setBackendFieldsError(errorData?.data?.context, setError);
      } else {
        showErrorMessage(errorData?.statusText);
      }
    }
  }, [isLocationError, isLocationUpdateError]);

  useEffect(() => {
    if (isLocationUpdateSuccess) {
      refetchLocation({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage('Location Updated Successfully!');
    }
  }, [isLocationUpdateSuccess]);

  useEffect(() => {
    if (isLocationStatusSuccess) {
      refetchLocation({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage(
        `Location ${!locationStatus ? 'disabled' : 'enabled'} successfully!`
      );
    }
  }, [isLocationStatusSuccess]);

  useEffect(() => {
    if (isLocationStatusError) {
      const errorData = LocationStatusError as TObject;

      showErrorMessage(
        'Cannot change status. Reason: ' +
          (errorData.data.reason || errorData.data.message)
      );
    }
  }, [isLocationStatusError]);

  const handleSwitchChange = () => {
    updateLocationStatus({ id, disabled: !locationStatus });
  };

  const onSubmit = () => updateLocation(requestPayload);

  return (
    <>
      {(isLocationLoading || isLocationUpdateLoading) && <OverlayLoader />}

      <TopBar title={t('location.title')} />

      <div className="mx-4 lg:mx-9 pb-8">
        <LocationHeader
          pageBreadCrumb={LOCATION_EDIT_BREADCRUMBS(locationData?.data?.name)}
          headingText={locationData?.data?.name}
        >
          {id && (
            <div>
              <CustomSwitch
                onChange={handleSwitchChange}
                checked={locationStatus}
                dataTestID={`${TEST_ID_KEY_LOCATION}DisableLocation`}
              />
              <span className="ml-2">{t('location.disableLocation')}</span>
            </div>
          )}
        </LocationHeader>

        <LocationForm props={{ control, errors, setValue }} />

        <div className="flex justify-end items-center mt-10">
          {isEditAllowed && (
            <ButtonPrimary
              type="submit"
              text={`${t('location.saveInfo')}`}
              onClick={handleSubmit(onSubmit)}
            />
          )}
        </div>
      </div>
    </>
  );
};

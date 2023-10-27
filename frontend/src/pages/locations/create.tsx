import { WarningAmberOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ButtonOutline,
  ButtonPrimary,
  ConfirmModal,
  OverlayLoader,
  TopBar
} from 'src/components';
import {
  LOCATION_CREATE_BREADCRUMBS,
  TEST_ID_KEY_LOCATION
} from 'src/constants/locations';
import { useCreateLocation, useResetState } from 'src/hooks';
import {
  getIsCreateLocationAllowed,
  getLocationReqPayload
} from 'src/store/selectors/features/location';
import { resetLocationData } from 'src/store/slices/features/location';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { LocationForm, LocationHeader } from './components';

export const CreateLocation: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('location');
  useResetState(resetLocationData);

  const [showCancleModal, setShowCancelModal] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm();

  const requestPayload = useSelector(getLocationReqPayload);
  const isCreateAllowed = useSelector(getIsCreateLocationAllowed);

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    mutateAsync: createLocation
  } = useCreateLocation();

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;

      const { columns, model } = errorData?.data.context;

      if (columns && model) {
        const message = `${model} with same ${columns[1]} already exists in this ${columns[0]}`;
        showErrorMessage(errorData?.statusText + ' ' + message);
        return;
      }

      if (errorData?.data?.context?.length) {
        errorData.data.context.forEach(({ field }: any) => {
          showErrorMessage(field);
        });

        setBackendFieldsError(errorData?.data?.context, setError);
      } else {
        showErrorMessage(errorData?.statusText);
      }
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      const {
        data: { id }
      } = data;

      showSuccessMessage('Location Created Successfully!');
      history.replace(`/location/${id}`);
    }
  }, [isSuccess]);

  const onCancel = () => setShowCancelModal(true);

  const clearLocationData = () => dispatch(resetLocationData());

  const onModalConfirm = () => {
    clearLocationData();
    setShowCancelModal(false);
  };

  const onModalCancel = () => setShowCancelModal(false);

  const onSubmit = () => createLocation(requestPayload);

  return (
    <>
      {isLoading && <OverlayLoader />}

      <TopBar title={t('location.title')} />

      <div className="mx-4 lg:mx-9 pb-8">
        <LocationHeader
          pageBreadCrumb={LOCATION_CREATE_BREADCRUMBS}
          headingText={t('location.createTitle')}
        />

        <LocationForm props={{ control, errors, setValue }} />

        <div className="flex justify-end items-center mt-10">
          <ButtonOutline
            text={`${t('location.clearInfo')}`}
            onClick={onCancel}
            style={{ margin: '0 20px' }}
            dataTestID={`${TEST_ID_KEY_LOCATION}ClearInfo`}
          />
          {isCreateAllowed && (
            <ButtonPrimary
              type="submit"
              text={`${t('location.saveInfo')}`}
              onClick={handleSubmit(onSubmit)}
              dataTestID={`${TEST_ID_KEY_LOCATION}SaveInfo`}
            />
          )}
          <ConfirmModal
            visible={showCancleModal}
            title={`Are you sure to clear info?`}
            icon={<WarningAmberOutlined fontSize="large" />}
            onConfirm={onModalConfirm}
            onCancel={onModalCancel}
          />
        </div>
      </div>
    </>
  );
};

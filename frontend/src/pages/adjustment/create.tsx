import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  BreadCrumbs,
  ButtonOutline,
  ButtonPrimary,
  DividerComponent,
  OverlayLoader,
  TopBar
} from 'src/components';
import {
  ADJUSTMENT_STATUS,
  CREATE_ADJUSTMENT_BREADCRUMB
} from 'src/constants/adjustment';
import {
  getAdjustLocationId,
  getAdjustReqPayload
} from 'src/store/selectors/features/adjustment';
import { getUserEmail } from 'src/store/selectors/features/auth';
import { resetProducts } from 'src/store/slices/entities/product';
import { resetAdjustmentData } from 'src/store/slices/features/adjustment';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { useCreateAdjustment, useResetState } from '../../hooks';
import {
  AdjustmentForm,
  AdjustmentInfo,
  AdjustmentProductTable,
  Status
} from './components';

export const CreateAdjustment: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('adjust');

  const email = useSelector(getUserEmail);
  const locationId = useSelector(getAdjustLocationId);
  const requestPayload = useSelector(getAdjustReqPayload);

  useResetState(resetAdjustmentData);
  useResetState(resetProducts);

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    formState: { errors },
    reset
  } = useForm();

  const {
    isLoading,
    data,
    isError,
    error,
    mutate: createAdjustment
  } = useCreateAdjustment();

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;
      showErrorMessage(errorData?.statusText);
      errorData?.data?.context?.length &&
        setBackendFieldsError(errorData?.data?.context, setError);
    }
  }, [isError]);

  useEffect(() => {
    if (data) {
      const {
        data: {
          adjustment: { id }
        }
      } = data;

      showSuccessMessage();
      history.replace(`/inventory-movements/adjustment/${id}`);
    }
  }, [data]);

  const onSubmit = () => {
    if (!requestPayload.products.length)
      showErrorMessage('Please Add Products');
    else createAdjustment(requestPayload);
  };

  const onClear = () => dispatch(resetAdjustmentData());

  return (
    <>
      {isLoading && <OverlayLoader />}
      <TopBar title={t('adjust.title')} />
      <div className="mx-4 lg:mx-9">
        <div className="ml-6 mt-8 flex justify-between">
          <BreadCrumbs routesArray={CREATE_ADJUSTMENT_BREADCRUMB} />
          <Status activeState={ADJUSTMENT_STATUS.READY} />
        </div>

        <div className="px-6 py-12 rounded-lg">
          <AdjustmentInfo
            headingText={t('adjust.title')}
            createdDate={new Date()}
            showConfirm={false}
            onConfirm={() => null}
          />

          <AdjustmentForm
            props={{ email, control, errors, reset, getValues }}
          />

          <DividerComponent
            type={'horizontal'}
            dashed
            style={{ borderColor: '#DFE1E3' }}
          />

          <AdjustmentProductTable subLocationId={locationId} />

          <div className="flex justify-end items-center mt-10">
            <ButtonOutline
              text={`${t('adjust.clear')}`}
              onClick={onClear}
              size="large"
              style={{ margin: '0 20px' }}
            />
            <ButtonPrimary
              type="submit"
              size="large"
              text={`${t('adjust.save')}`}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

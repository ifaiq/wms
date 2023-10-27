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
  CREATE_TRANSFER_BREADCRUMB,
  TEST_ID_KEY_TRANSFER,
  TRANSFER_STATUS
} from 'src/constants/transfers';
import { getUserEmail } from 'src/store/selectors/features/auth';
import {
  getAreTransferProductsValid,
  getTransferFromLocationId,
  getTransferReqPayload
} from 'src/store/selectors/features/transfer';
import { resetProducts } from 'src/store/slices/entities/product';
import { resetTransferData } from 'src/store/slices/features/transfer';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { useCreateTransfer, useResetState } from '../../hooks';
import {
  TransferFrom,
  TransferInfo,
  TransferProductTable,
  TransferStatus
} from './components';

export const CreateTransfer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('transfer');
  const email = useSelector(getUserEmail);
  const subLocationId = useSelector(getTransferFromLocationId);
  const requestPayload = useSelector(getTransferReqPayload);
  const areProductsValid = useSelector(getAreTransferProductsValid);

  useResetState(resetTransferData);
  useResetState(resetProducts);

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
    reset
  } = useForm();

  const {
    isLoading,
    data,
    isError,
    error,
    mutate: createTransfer
  } = useCreateTransfer();

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
          transfer: { id }
        }
      } = data;

      showSuccessMessage();
      history.replace(`/inventory-movements/transfer/${id}`);
    }
  }, [data]);

  const onSubmit = () => {
    if (!requestPayload.products.length)
      showErrorMessage('Please Add Products');
    else if (!areProductsValid)
      showErrorMessage(
        'Transfer Stock must be less than or equal to Physical Stock'
      );
    else createTransfer(requestPayload);
  };

  const onClear = () => dispatch(resetTransferData());

  return (
    <>
      {isLoading && <OverlayLoader />}
      <TopBar title={t('transfer.transfers')} />
      <div className="mx-4 lg:mx-9">
        <div className="ml-6 mt-8 flex justify-between">
          <BreadCrumbs routesArray={CREATE_TRANSFER_BREADCRUMB} />
          <TransferStatus activeState={TRANSFER_STATUS.READY} />
        </div>

        <div className="px-6 py-12 rounded-lg">
          <TransferInfo
            headingText={t('transfer.create')}
            createdDate={new Date()}
            showConfirm={false}
            onConfirm={() => null}
          />

          <TransferFrom
            props={{ email, control, errors, reset, getValues, setValue }}
          />

          <DividerComponent
            type={'horizontal'}
            dashed
            style={{ borderColor: '#DFE1E3' }}
          />

          <TransferProductTable subLocationId={subLocationId} />

          <div className="flex justify-end items-center mt-10">
            <ButtonOutline
              text={t('transfer.clear')}
              onClick={onClear}
              size="large"
              style={{ margin: '0 20px' }}
              dataTestID={`${TEST_ID_KEY_TRANSFER}ClearInfo`}
            />
            <ButtonPrimary
              type="submit"
              size="large"
              text={t('transfer.save')}
              onClick={handleSubmit(onSubmit)}
              dataTestID={`${TEST_ID_KEY_TRANSFER}SaveInfo`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

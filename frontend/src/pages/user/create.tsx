import { WarningAmberOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  OverlayLoader,
  TopBar,
  ButtonOutline,
  ButtonPrimary,
  ConfirmModal
} from 'src/components';
import { USER_CREATE_BREADCRUMBS } from 'src/constants/user';
import { useCreateUser, useResetState } from 'src/hooks';
import { getUserReqPayload } from 'src/store/selectors/features/user';
import { resetUserData } from 'src/store/slices/features/user';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { UserHeader, UserForm } from './components/index';

export const CreateUser: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('user');
  useResetState(resetUserData);

  const [showCancleModal, setShowCancelModal] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm();

  const requestPayload = useSelector(getUserReqPayload);

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    mutateAsync: createUser
  } = useCreateUser();

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;

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
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      const {
        data: { id }
      } = data;

      showSuccessMessage('User Created Successfully!');
      history.replace(`/user/${id}`);
    }
  }, [isSuccess]);

  const onCancel = () => setShowCancelModal(true);

  const clearUserData = () => dispatch(resetUserData());

  const onModalConfirm = () => {
    clearUserData();
    setShowCancelModal(false);
  };

  const onModalCancel = () => setShowCancelModal(false);

  const onSubmit = () => createUser(requestPayload);

  return (
    <>
      {isLoading && <OverlayLoader />}

      <TopBar title="User" />

      <div className="mx-4 lg:mx-9 pb-8">
        <UserHeader
          headingText={t('user.createUser')}
          pageBreadCrumb={USER_CREATE_BREADCRUMBS}
        />

        <UserForm props={{ control, errors, setValue }} />

        <div className="flex justify-end items-center mt-10">
          <ButtonOutline
            text={`${t('user.clearInfo')}`}
            onClick={onCancel}
            style={{ margin: '0 20px' }}
          />
          <ButtonPrimary
            type="submit"
            text={`${t('user.saveInfo')}`}
            onClick={handleSubmit(onSubmit)}
          />
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

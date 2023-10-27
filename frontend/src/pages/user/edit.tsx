import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  TopBar,
  CustomSwitch,
  ButtonPrimary,
  OverlayLoader
} from 'src/components';
import { USER_EDIT_BREADCRUMBS, USER_STATUS } from 'src/constants/user';
import {
  useChangeUserStatus,
  useGetUserById,
  useResetState,
  useUpdateUser
} from 'src/hooks';
import {
  getIsUserManagementAllowed,
  getUserReqPayload,
  getUserStatus
} from 'src/store/selectors/features/user';
import { addUserData, resetUserData } from 'src/store/slices/features/user';
import {
  setBackendFieldsError,
  showErrorMessage,
  showSuccessMessage
} from 'src/utils/alerts';
import { UserForm, UserHeader } from './components/index';

export const EditUser: React.FC = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation('user');
  const { id } = useParams<RouteParams>();
  useResetState(resetUserData);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm();

  const userStatus = useSelector(getUserStatus);
  const requestPayload = useSelector(getUserReqPayload);
  const isUserManagementAllowed = useSelector(getIsUserManagementAllowed);

  const {
    data: userGetData,
    isLoading: isUserGetLoading,
    isError: isUserGetError,
    error: userGetError,
    refetch: refetchUser
  } = useGetUserById(id);

  const {
    isLoading: isUserUpdateLoading,
    isSuccess: isUserUpdateSuccess,
    isError: isUserUpdateError,
    error: userUpdateError,
    mutateAsync: updateUser
  } = useUpdateUser();

  const {
    isSuccess: isStatusSuccess,
    isError: isStatusError,
    error: statusError,
    mutateAsync: changeUserStatus
  } = useChangeUserStatus();

  useEffect(() => {
    if (userGetData) {
      dispatch(addUserData(userGetData?.data));
    }
  }, [userGetData]);

  useEffect(() => {
    if (isUserGetError || isUserUpdateError || isStatusError) {
      const errorData =
        (userGetError as TObject) ||
        (userUpdateError as TObject) ||
        (statusError as TObject);

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
  }, [isUserGetError, isUserUpdateError, isStatusError]);

  useEffect(() => {
    if (isUserUpdateSuccess) {
      refetchUser({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage('User Updated Successfully!');
    }
  }, [isUserUpdateSuccess]);

  useEffect(() => {
    if (isStatusSuccess) {
      refetchUser({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage('User Status Update Successful');
    }
  }, [isStatusSuccess]);

  const handleStatusChange = () =>
    changeUserStatus({
      id,
      status: userStatus ? USER_STATUS.ENABLED : USER_STATUS.DISABLED
    });

  const onSubmit = () => updateUser(requestPayload);

  return (
    <>
      {(isUserGetLoading || isUserUpdateLoading) && <OverlayLoader />}

      <TopBar title="User" />

      <div className="mx-4 lg:mx-9 pb-8">
        <UserHeader
          headingText={t('user.user')}
          pageBreadCrumb={USER_EDIT_BREADCRUMBS(id)}
          id={id}
        >
          <div className="flex w-24">
            <CustomSwitch
              onChange={handleStatusChange}
              checked={userStatus}
              disabled={!isUserManagementAllowed}
            />
            <span className="ml-2">{t('user.disable')}</span>
          </div>
        </UserHeader>

        <UserForm props={{ control, errors, setValue }} />

        <div className="flex justify-end items-center mt-10">
          {isUserManagementAllowed && (
            <ButtonPrimary
              type="submit"
              text={`${t('user.saveInfo')}`}
              onClick={handleSubmit(onSubmit)}
            />
          )}
        </div>
      </div>
    </>
  );
};

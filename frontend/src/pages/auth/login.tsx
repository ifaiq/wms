import { Form } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ButtonLoading,
  ButtonPrimary,
  CustomForm,
  CustomTabs,
  InputItem,
  TabItem,
  FormItem
} from 'src/components';
import { useSignInUser } from '../../hooks';
import { updateUserData } from '../../store/slices/features/auth';
import { showErrorMessage } from '../../utils/alerts';

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!'
  }
};

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const [t] = useTranslation('auth');

  const {
    mutate: signIn,
    isLoading,
    isError,
    isSuccess,
    data: authData,
    error
  } = useSignInUser();

  useEffect(() => {
    if (isError) {
      const errorData = error as Record<string, any>;
      showErrorMessage(errorData?.statusText || errorData?.data?.message);
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess && authData) {
      const {
        data: { userData, permissions }
      } = authData;

      dispatch(updateUserData({ userData, permissions }));
      history.push('/vendors');
    }
  }, [isSuccess, authData]);

  const onSubmit = () => {
    signIn(form.getFieldsValue());
  };

  const handleTabChange = () => true;

  const renderForm = () => (
    <>
      <CustomForm
        form={form}
        name="login"
        onFinish={onSubmit}
        validateMessages={validateMessages}
      >
        <div className="mx-24">
          <FormItem
            label={t('auth.email')}
            name={'email'}
            rules={[{ type: 'email', required: true, max: 100 }]}
          >
            <InputItem placeholder={t('auth.email')} />
          </FormItem>
          <FormItem
            label={t('auth.password')}
            name={'password'}
            rules={[{ required: true, min: 5 }]}
          >
            <InputItem placeholder={t('auth.password')} type="password" />
          </FormItem>
          <FormItem>
            {isLoading ? (
              <ButtonLoading size="full" text={'Signing In...'} />
            ) : (
              <ButtonPrimary
                size="full"
                type="submit"
                text={`${t('auth.signin')}`}
              />
            )}
          </FormItem>
        </div>
      </CustomForm>
    </>
  );

  return (
    <div className="bg-gray-grey12 flex flex-col h-screen w-screen items-center pt-24">
      <div>
        <h1 className="mb-1 text-black text-3xl">{t('auth.header')}</h1>
      </div>
      <div className="bg-white mt-10 rounded-lg w-2/5">
        <CustomTabs activeKey={'1'} onChange={handleTabChange} size="large">
          <TabItem key="1" tab={t('auth.signin')}>
            {renderForm()}
          </TabItem>
        </CustomTabs>
      </div>
    </div>
  );
};

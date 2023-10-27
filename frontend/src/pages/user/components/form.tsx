import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormElement,
  InputItem,
  InputPassword,
  SelectItem
} from 'src/components';
import { EMAIL_VALIDATION } from 'src/constants/user';
import { useGetRoles } from 'src/hooks';
import {
  getIsRoleChangeAllowed,
  getUserEmail,
  getUserId,
  getUserName,
  getUserPassword,
  getUserRoles
} from 'src/store/selectors/features/user';
import { updateUserData } from 'src/store/slices/features/user';

export const UserForm: React.FC<IFormProps> = ({ props }) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('user');

  const { control, errors, setValue } = props;

  const { data: roles } = useGetRoles();

  const userId = useSelector(getUserId);
  const fullName = useSelector(getUserName);
  const email = useSelector(getUserEmail);
  const password = useSelector(getUserPassword);
  const userRoles = useSelector(getUserRoles);
  const isRoleChangeAllowed = useSelector(getIsRoleChangeAllowed);

  const formHandler = (
    key: string,
    value: TNumberOrString | TNumberOrString[]
  ) => {
    dispatch(updateUserData({ key, value }));
  };

  const setFormValue = (
    key: string,
    value: TNumberOrString | TNumberOrString[]
  ) => {
    if (key && value) {
      setValue(key, value);
    }
  };

  useEffect(() => {
    setFormValue('name', fullName);
    setFormValue('email', email);
    setFormValue('roles', userRoles);
  }, [userId]);

  return (
    <div className="flex justify-between">
      {/* Col 1 */}
      <div className="w-[45%]">
        <Controller
          control={control}
          rules={{
            required: { value: true, message: 'Full Name is required' },
            maxLength: {
              value: 30,
              message: 'Name should be less than equal to 30 characters'
            }
          }}
          name="name"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('user.fullName')}
              isRequired
              errorMessage={errors?.name?.message}
            >
              <InputItem
                placeholder={t('user.enterName')}
                value={fullName}
                onChange={(e: TObject) => {
                  formHandler('name', e.target.value), onChange(e.target.value);
                }}
              />
            </FormElement>
          )}
        />

        <Controller
          control={control}
          rules={{
            required: { value: true, message: 'Email is required' },
            pattern: {
              value: EMAIL_VALIDATION,
              message: 'Not a valid email'
            }
          }}
          name="email"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('user.email')}
              isRequired
              errorMessage={errors?.email?.message}
            >
              <InputItem
                placeholder={t('user.enterEmail')}
                type="email"
                value={email}
                onChange={(e: TObject) => {
                  formHandler('email', e.target.value),
                    onChange(e.target.value);
                }}
              />
            </FormElement>
          )}
        />
      </div>

      {/* Col 2 */}
      <div className="w-[45%]">
        <Controller
          control={control}
          rules={{
            required: {
              value: userId ? false : true,
              message: 'Password is required'
            },
            maxLength: {
              value: 15,
              message: 'Password should be less than equal to 15 characters'
            },
            minLength: {
              value: 8,
              message: 'Password should be greater than equal to 8 characters'
            }
          }}
          name="password"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('user.password')}
              isRequired={userId ? false : true}
              errorMessage={errors?.password?.message}
            >
              <InputPassword
                placeholder={t('user.enterPassword')}
                type="password"
                value={password}
                onChange={(e: TObject) => {
                  formHandler('password', e.target.value),
                    onChange(e.target.value);
                }}
              />
            </FormElement>
          )}
        />
        <Controller
          control={control}
          rules={{
            required: { value: true, message: 'Role is required' }
          }}
          name="roles"
          render={({ field: { onChange } }) => (
            <FormElement
              label={t('user.role')}
              isRequired
              errorMessage={errors?.roles?.message}
            >
              <SelectItem
                placeholder={t('user.selectRole')}
                mode="multiple"
                maxTagCount={5}
                allowClear={true}
                value={userRoles}
                onChange={(e: TNumberOrString[]) => {
                  formHandler('roles', e);
                  onChange(e);
                }}
                options={roles?.data}
                disabled={isRoleChangeAllowed}
              />
            </FormElement>
          )}
        />
      </div>
    </div>
  );
};

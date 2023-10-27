import React, { useEffect } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { COUNTRIES } from 'src/constants/common';
import {
  ButtonPrimary,
  CustomForm,
  FormItem,
  SelectItem
} from 'src/components';

export const FilterVendors: React.FC<IFilters> = ({
  applyFilter,
  filterParams
}) => {
  const [form] = Form.useForm();

  const [t] = useTranslation('vendor');

  useEffect(() => {
    form.setFieldsValue(filterParams);
  }, [filterParams]);

  const handleCustomForm = (value: string | null, name: string) => {
    form.setFieldsValue({ [name]: value });
  };

  const onSubmit = () => {
    applyFilter(form.getFieldsValue());
  };

  return (
    <CustomForm
      layout="vertical"
      dataTestID="testVendorFilterForm"
      name="vendor-filters"
      form={form}
      onFinish={() => onSubmit()}
    >
      <div className="items-center">
        <FormItem name={'country'} label={t('vendor.country')}>
          <SelectItem
            dataTestID="testSelectVendorFilterCountry"
            placeholder={`${t('vendor.countryPlaceholder')}`}
            allowClear
            onChange={(e: string) => handleCustomForm(e, 'country')}
            options={COUNTRIES}
          />
        </FormItem>
      </div>
      <div className="flex justify-end mt-6">
        <ButtonPrimary
          dataTestID="testVendorApplyFilter"
          type="submit"
          size="auto"
          onClick={onSubmit}
          text={`${t('vendor.applyFilter')}`}
        />
      </div>
    </CustomForm>
  );
};

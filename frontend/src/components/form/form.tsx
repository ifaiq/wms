import { Form } from 'antd';
import React from 'react';

export const CustomForm: React.FC<IForm> = ({
  layout = 'vertical',
  name,
  form,
  onFinish,
  validateMessages,
  children,
  className,
  dataTestID
}) => (
  <Form
    name={name}
    data-test-id={dataTestID}
    layout={layout}
    form={form}
    onFinish={onFinish}
    validateMessages={validateMessages}
    className={className}
  >
    {children}
  </Form>
);

export const FormItem: React.FC<IFormItem> = ({
  name,
  label,
  rules,
  style,
  children,
  tooltip
}) => (
  <Form.Item
    name={name}
    label={label}
    rules={rules}
    style={style}
    tooltip={tooltip}
  >
    {children}
  </Form.Item>
);
export const FormElement: React.FC<IFormElement> = ({
  label,
  errorMessage,
  isRequired,
  children,
  errorClassname,
  dataTestID
}) => (
  <div className="flex flex-col mb-4">
    {label && (
      <div className="flex flex-row">
        <span className="mb-2 font-medium">{label}:</span>
        {isRequired && <span className="pl-1 mb-2 text-green"> * </span>}
      </div>
    )}
    {children}
    {errorMessage && (
      <span
        data-test-id={`${dataTestID}`}
        className={`mt-4 text-error ${errorClassname}`}
      >
        {errorMessage}
      </span>
    )}
  </div>
);

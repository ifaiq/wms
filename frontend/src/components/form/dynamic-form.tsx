import { Form } from 'antd';
import React from 'react';
import { CustomForm } from './form';

export const DynamicForm: React.FC<IDynamicForm> = ({
  form,
  formName,
  disabled = false,
  className,
  renderFunction,
  handleSubmit
}) => {
  return (
    <CustomForm
      name={`dynamicForm-${formName}`}
      form={form}
      onFinish={handleSubmit}
    >
      <div
        className={`border-2 ${
          disabled ? 'border-[#8b8989]' : 'border-blue-blue1'
        } border-dotted rounded-lg px-4 overflow-auto ${className}`}
      >
        <Form.List name={formName}>
          {(fields, { add, remove }) => (
            <>{renderFunction({ fields, operation: { add, remove } })}</>
          )}
        </Form.List>
      </div>
    </CustomForm>
  );
};

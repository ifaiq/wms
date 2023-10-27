import React from 'react';
import { Checkbox } from 'antd';

export const CustomCheckbox: React.FC<ICheckbox> = ({
  onChange,
  disabled,
  checked,
  children,
  dataTestID
}) => {
  return (
    <Checkbox
      data-test-id={dataTestID}
      onChange={(e) => onChange(e.target.checked)}
      checked={checked}
      disabled={disabled}
    >
      {children}
    </Checkbox>
  );
};

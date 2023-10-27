import React from 'react';
import { Switch } from 'antd';

export const CustomSwitch: React.FC<ICheckbox> = ({
  onChange,
  disabled,
  checked,
  before,
  after,
  dataTestID
}) => {
  return (
    <Switch
      data-test-id={dataTestID}
      onChange={(value) => onChange(value)}
      checked={checked}
      disabled={disabled}
      style={{ backgroundColor: checked ? '#2551B3' : '#6C6E73' }}
      checkedChildren={after && after}
      unCheckedChildren={before && before}
    />
  );
};

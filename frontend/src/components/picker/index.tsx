// @ts-nocheck
import React from 'react';
import { DatePicker } from 'antd';

export const CustomDatePicker: React.FC<IDatePicker> = ({
  onChange,
  onOk,
  value,
  size = 'large',
  disabled = false,
  placeholder = 'dd/mm/yyyy',
  format,
  disabledDate,
  dataTestID
}) => (
  <DatePicker
    data-test-id={dataTestID}
    value={value}
    disabledDate={disabledDate}
    disabled={disabled}
    className="rounded-md w-full"
    size={size}
    onChange={onChange}
    onOk={onOk}
    placeholder={placeholder}
    format={format}
  />
);

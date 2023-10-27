import React from 'react';
import { Input, InputNumber } from 'antd';
import MaskedInput from 'antd-mask-input';
import { SearchOutlined } from '@mui/icons-material';

const defaultInputStyle = {
  backgroundColor: '#F1F4F6',
  fontFamily: 'Inter',
  borderRadius: '0.375rem'
};

export const InputItem: React.FC<IInput> = ({
  addonAfter,
  className,
  placeholder = '',
  size = 'large',
  disabled = false,
  style = defaultInputStyle,
  type = 'text',
  value,
  onChange,
  suffix,
  minValue = 0,
  maxValue,
  maxLength,
  dataTestID
}) => (
  <Input
    data-testid="input-item"
    addonAfter={addonAfter && addonAfter}
    className={`text-black ${className} ${disabled && '!text-black'}`}
    size={size}
    style={style}
    placeholder={placeholder}
    onChange={onChange}
    type={type}
    value={value}
    disabled={disabled}
    suffix={suffix}
    min={minValue}
    max={maxValue}
    maxLength={maxLength}
    spellCheck={false}
    data-test-id={dataTestID}
  />
);

export const InputSearch: React.FC<ISearchInput> = ({
  placeholder = 'Search',
  size = 'large',
  onSearch,
  dataTestID
}) => (
  <Input
    className="rounded-md"
    size={size}
    style={{ backgroundColor: '#F1F4F6' }}
    placeholder={placeholder}
    allowClear
    onChange={(e) => onSearch(e.target.value)}
    suffix={<SearchOutlined />}
    spellCheck={false}
    data-test-id={dataTestID}
  />
);

//Unused Components Below

export const TextArea: React.FC<IInput> = ({
  placeholder = '',
  size = 'large',
  onChange,
  value
}) => (
  <Input.TextArea
    className="!rounded-md"
    size={size}
    style={{ backgroundColor: '#F1F4F6' }}
    placeholder={placeholder}
    onChange={onChange}
    value={value}
    spellCheck={false}
  />
);

export const MaskInput: React.FC<IInputMask> = ({
  placeholder,
  style,
  size = 'large',
  mask,
  value,
  type,
  onChange,
  disabled
}) => (
  <MaskedInput
    mask={mask}
    size={size}
    className="rounded-md bg-[#F1F4F6]"
    style={style && style}
    placeholder={placeholder}
    type={type}
    value={value}
    onChange={(e: any) => onChange(e.target.value)}
    disabled={disabled}
  />
);

export const InputPassword: React.FC<IInput> = ({
  addonAfter,
  className,
  placeholder = '',
  size = 'large',
  disabled = false,
  style = defaultInputStyle,
  type = 'text',
  value,
  onChange,
  suffix,
  minValue = 0,
  maxValue,
  maxLength,
  dataTestID
}) => (
  <Input.Password
    addonAfter={addonAfter && addonAfter}
    data-testid="input-item"
    className={`text-black ${className} ${
      disabled && '!text-black'
    } passwordBg`}
    size={size}
    style={style}
    placeholder={placeholder}
    onChange={onChange}
    type={type}
    value={value}
    disabled={disabled}
    suffix={suffix}
    min={minValue}
    max={maxValue}
    maxLength={maxLength}
    spellCheck={false}
    data-test-id={dataTestID}
  />
);

export const NumberInput: React.FC<INumberInput> = ({
  className,
  style = defaultInputStyle,
  size = 'middle',
  disabled,
  value,
  defaultValue = 0,
  minValue = 0,
  maxValue,
  decimalSeparator = '.',
  formatter,
  parser,
  precision = 0,
  keyboard = false,
  controls = false,
  onChange,
  onBlur,
  dataTestID
}) => (
  <InputNumber
    data-test-id={dataTestID}
    style={style}
    size={size}
    type="number"
    className={`text-black ${className} w-full ${disabled && '!text-black'}`}
    value={value}
    defaultValue={defaultValue}
    min={minValue}
    max={maxValue}
    decimalSeparator={decimalSeparator}
    formatter={formatter}
    parser={parser}
    precision={precision}
    disabled={disabled}
    keyboard={keyboard}
    controls={controls}
    onChange={onChange}
    onBlur={onBlur}
  />
);

import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const renderOptions = (options: ISelectOption[]) => (
  <>
    {options?.map(({ id, name }: TObject) => (
      <Option key={id} value={id} title={name}>
        {' '}
        {name}{' '}
      </Option>
    ))}
  </>
);

export const SelectItem: React.FC<ISelect> = ({
  showSearch = false,
  placeholder = '',
  value,
  options,
  onChange,
  onInput,
  tagRender,
  notFoundContent,
  allowClear = false,
  mode,
  style,
  size = 'large',
  disabled = false,
  maxTagCount = 'responsive',
  dataTestID,
  onClear,
  ...rest
}) => (
  <Select
    data-test-id={dataTestID}
    showSearch={showSearch}
    className="rounded-md"
    style={style}
    mode={mode}
    size={size}
    allowClear={allowClear}
    tagRender={tagRender}
    placeholder={placeholder}
    onChange={onChange}
    notFoundContent={notFoundContent}
    onSearch={onInput}
    value={value}
    disabled={disabled}
    maxTagCount={maxTagCount}
    optionFilterProp="children"
    filterOption
    listItemHeight={5}
    listHeight={200}
    onClear={onClear}
    {...rest}
  >
    {renderOptions(options)}
  </Select>
);

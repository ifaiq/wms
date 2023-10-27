import React, { useEffect, useState } from 'react';
import { Select } from 'antd';

const { Option } = Select;

export const SearchSelect: React.FC<ISearchSelect> = ({
  data,
  dataIndex,
  onChange,
  handleSearch,
  value,
  disabled,
  loading,
  dataTestID
}) => {
  const [options, setOptions] = useState<ReactChild[]>([]);

  useEffect(() => {
    if (!data) setOptions([]);
    else {
      setOptions(
        data?.map((item: TObject, index: number) => {
          let isProductDeactivated = false;
          if (
            item?.isDeactivated &&
            item?.isDeactivated.toString().toLowerCase() === 'true'
          )
            isProductDeactivated = true;

          return (
            <Option
              key={index}
              value={item[dataIndex]}
              disabled={isProductDeactivated}
            >
              {`${item[dataIndex]} `}
              {isProductDeactivated && ' (Deactivated)'}
            </Option>
          );
        })
      );
    }
  }, [data]);

  return (
    <Select
      data-test-id={dataTestID}
      showSearch
      showArrow
      value={value[dataIndex!] || ''}
      style={{
        width: '100%',
        height: 'auto',
        wordWrap: 'break-word'
      }}
      placeholder="Click to Search"
      optionFilterProp="children"
      onChange={onChange}
      onSearch={handleSearch}
      listItemHeight={5}
      listHeight={150}
      disabled={disabled}
      loading={loading}
    >
      {options}
    </Select>
  );
};

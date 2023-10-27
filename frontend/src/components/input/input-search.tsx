import React, { useEffect, useState } from 'react';
import { Select } from 'antd';

const { Option } = Select;

export const SearchInput: React.FC<ISelect> = ({
  value: data,
  dataIndex,
  onChange: handleDropDownChange
}) => {
  const [options, setOptions] = useState([]);

  const handleFilterOptions = (input: any, option: any) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  const handleFilterSort = (optionA: any, optionB: any) =>
    optionA.children
      .toLowerCase()
      .localeCompare(optionB.children.toLowerCase());

  useEffect(() => {
    if (!data[0]) setOptions([]);
    else {
      setOptions(
        data[0].data?.map((product: TObject) => (
          <Option key={product.productId} value={product[dataIndex]}>
            {product[dataIndex]}
          </Option>
        ))
      );
    }
  }, [data]);

  return (
    <Select
      showSearch
      value={data[1][dataIndex!]}
      showArrow={false}
      style={{ width: '100%' }}
      placeholder="Click to Search"
      optionFilterProp="children"
      onChange={handleDropDownChange}
      filterOption={handleFilterOptions}
      filterSort={handleFilterSort}
    >
      {options}
    </Select>
  );
};

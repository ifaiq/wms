import { Pagination } from 'antd';
import React from 'react';

export const CustomPagination: React.FC<IPagination> = ({
  current,
  pageSize,
  onChange,
  total,
  showSizeChanger
}) => (
  <Pagination
    simple
    current={current}
    pageSize={pageSize}
    onChange={onChange}
    total={!total ? 1 : total}
    showSizeChanger={showSizeChanger}
  />
);

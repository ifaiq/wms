import React from 'react';
import { Table } from 'antd';

export const TableWrapper: React.FC<ITable> = ({
  rowSelection,
  columns,
  dataSource,
  rowKey,
  scroll = {},
  onRow,
  rowClassName,
  loading = false
}) => {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={false}
      scroll={scroll}
      onRow={onRow}
      rowClassName={`cursor-pointer ${rowClassName}`}
      rowSelection={rowSelection}
    />
  );
};

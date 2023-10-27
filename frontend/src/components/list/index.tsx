import { List } from 'antd';
import React from 'react';

export const CustomList: React.FC<IList> = ({
  header,
  footer,
  data,
  renderFunction,
  bordered = true,
  pagination = false
}) => (
  <List
    header={header}
    footer={footer}
    bordered={bordered}
    pagination={pagination}
    dataSource={data}
    renderItem={(item) => <List.Item>{renderFunction(item)}</List.Item>}
  />
);

export const InfoList: React.FC<IInfoList> = ({
  header,
  footer,
  data,
  bordered = true
}) => {
  const infoComponent = (item: TObject) => {
    return (
      <div className="flex justify-between w-full">
        <h3 className="font-medium mb-1">{item.title}</h3>
        <span>{item.data}</span>
      </div>
    );
  };

  return (
    <div className="w-[25%]">
      <List
        header={header}
        footer={footer}
        bordered={bordered}
        dataSource={data as TObject[]}
        renderItem={(item) => <List.Item>{infoComponent(item)}</List.Item>}
      />
    </div>
  );
};

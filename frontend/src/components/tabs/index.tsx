import { Tabs } from 'antd';
import React from 'react';

const { TabPane } = Tabs;

export const CustomTabs: React.FC<ITab> = ({
  defaultActiveKey = '1',
  activeKey,
  onChange,
  size,
  children
}) => (
  <Tabs
    defaultActiveKey={defaultActiveKey}
    activeKey={activeKey}
    onChange={onChange}
    size={size}
  >
    {children}
  </Tabs>
);

export const TabItem: React.FC<ITabItem> = ({
  tab,
  key,
  children,
  ...restProps
}) => (
  <TabPane tab={tab} key={key} {...restProps}>
    {children}
  </TabPane>
);

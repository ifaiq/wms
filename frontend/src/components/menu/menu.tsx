import React from 'react';
import { Menu } from 'antd';

export const NavMenu: React.FC<IMenu> = ({
  children,
  defaultSelectedKeys = []
}) => {
  const handleNavigation = (e: any) => {
    console.log('#e', e);
  };

  return (
    <Menu defaultSelectedKeys={defaultSelectedKeys} onClick={handleNavigation}>
      {children}
    </Menu>
  );
};

export const MenuItem: React.FC<IMenuItem> = ({ key, children }) => (
  <Menu.Item key={key}>{children}</Menu.Item>
);

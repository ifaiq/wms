import { Drawer } from 'antd';
import React from 'react';

export const CustomDrawer: React.FC<IDrawer> = ({
  title = 'Retailo',
  placement = 'left',
  DrawerHeader,
  width = 280,
  onClose,
  visible,
  closable = false,
  children
}) => (
  <Drawer
    className="mb-6 text-xl"
    title={DrawerHeader ? DrawerHeader : title}
    placement={placement}
    closable={closable}
    onClose={onClose}
    visible={visible}
    headerStyle={{ minHeight: 80 }}
    width={width}
  >
    {children}
  </Drawer>
);

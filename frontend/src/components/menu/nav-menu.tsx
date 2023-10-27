import React, { useState } from 'react';
import { Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetModuleFilters } from 'src/store/selectors/features/app';
import { FEATURE_FLAGS } from 'src/constants/config';

const { Item, Divider } = Menu;

export const NavigationMenu: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [selectedKey, setSelectedKey] = useState('vendors');

  const handleNavigation = (e: TObject) => {
    const { key } = e;

    // eslint-disable-next-line prefer-destructuring
    const menuKey = key.split('/')[1];

    setSelectedKey(menuKey);

    const resetReducer = resetModuleFilters(menuKey);

    if (resetReducer) dispatch(resetReducer());

    history.push(`${key}`);
  };

  return (
    <Menu
      onClick={handleNavigation}
      style={{ width: '100%' }}
      selectedKeys={[selectedKey]}
      openKeys={[selectedKey]}
      defaultSelectedKeys={['vendors']}
      defaultOpenKeys={['vendors']}
      mode="inline"
    >
      <Divider />
      <Item key="/vendors">Vendor</Item>
      <Divider />
      <Item key="/purchase-order">Purchase</Item>
      <Divider />
      <Item key="/inventory-movements">Inventory Movements</Item>
      <Divider />
      <Item key="/locations">Locations</Item>
      <Divider />
      <Item key="/users">User Management</Item>
      <Divider />
      {FEATURE_FLAGS.INVOICE_FLAG === 'true' && (
        <>
          <Item key="/invoices">Invoices</Item>
          <Divider />
        </>
      )}
    </Menu>
  );
};

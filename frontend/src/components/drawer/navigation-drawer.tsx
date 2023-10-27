import { GridViewOutlined } from '@mui/icons-material';
import React, { useState } from 'react';
import { CustomDrawer, Logout, NavigationMenu } from 'src/components';

export const NavigationDrawer: React.FC<INavDrawer> = ({ title = 'WMS' }) => {
  const [visibleDrawer, setVisibleDrawer] = useState(false);

  const closeDrawer = () => {
    setVisibleDrawer(false);
  };

  const openDrawer = () => {
    setVisibleDrawer(true);
  };

  return (
    <div>
      <GridViewOutlined onClick={openDrawer} className="cursor-pointer" />
      <CustomDrawer
        visible={visibleDrawer}
        onClose={closeDrawer}
        DrawerHeader={
          <div className="flex items-center">
            <GridViewOutlined
              onClick={closeDrawer}
              className="cursor-pointer"
            />
            <h1 className="ml-5 text-3xl font-bold">{`${title}`}</h1>
          </div>
        }
      >
        <NavigationMenu />
        <div className="absolute bottom-6 left-8 ">
          <Logout />
        </div>
      </CustomDrawer>
    </div>
  );
};

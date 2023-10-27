import { FilterListOutlined } from '@mui/icons-material';
import { Button } from 'antd';
import React, { useState } from 'react';
import { CustomDrawer } from '.';

export const FilterDrawer: React.FC<IFilterDrawer> = ({
  title = 'Filter By',
  showReset = true,
  isFilterApplied = false,
  onReset,
  children
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const toggleFilterDrawer = () => setShowFilterDrawer(!showFilterDrawer);

  const drawerHeader = () => {
    return (
      <div className="flex justify-between items-center">
        <div className="flex">
          <FilterListOutlined
            className="cursor-pointer text-blue-blue2"
            onClick={toggleFilterDrawer}
          />
          <span className="mx-2 text-blue-blue2">{title}</span>
        </div>
        {(showReset || isFilterApplied) && (
          <Button
            type="text"
            onClick={onReset}
            data-test-id="clearFilterButton"
          >
            <span className="text-blue-blue2">Clear</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <FilterListOutlined
        className={`cursor-pointer ml-2 ${
          isFilterApplied ? 'text-blue-blue2' : ''
        }`}
        onClick={toggleFilterDrawer}
      />
      {isFilterApplied && (
        <Button type="text" onClick={onReset}>
          <span className="text-blue-blue2">Clear Filters</span>
        </Button>
      )}
      <CustomDrawer
        DrawerHeader={drawerHeader()}
        placement="right"
        visible={showFilterDrawer}
        onClose={toggleFilterDrawer}
        width={300}
      >
        {children}
      </CustomDrawer>
    </>
  );
};

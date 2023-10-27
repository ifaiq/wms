import { PersonOutlineOutlined } from '@mui/icons-material';
import React from 'react';
import { useSelector } from 'react-redux';
import { getUserName, getUserRole } from 'src/store/selectors/features/auth';
import { NavigationDrawer } from '../drawer';

export const TopBar: React.FC<ITopBar> = ({
  title,
  search = true,
  searchComponent
}) => {
  const userName = useSelector(getUserName);
  const userRole = useSelector(getUserRole);

  const userRolesLength = userRole?.length;

  return (
    <div className="border-b-[1px] border-gray-grey11 mb-5 z-[100]">
      <div className="flex m-4 justify-between">
        <div className="flex items-center basis-96">
          <NavigationDrawer title="StockFlo" />
          <h1 className="mx-4 text-3xl font-bold">{`${title}`}</h1>
        </div>
        <div className="basis-[780px]">
          {search && <div className="w-[90%]">{searchComponent}</div>}
        </div>
        <div className="basis-28">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-end mx-2">
              <span className="text-base font-normal truncate">{`${
                userName ?? ''
              }`}</span>
              <span className="text-xs font-normal capitalize">
                {`
                ${userRole[0].name ?? ''}
                ${userRolesLength > 1 ? `, +${userRolesLength - 1}` : ''}`}
              </span>
            </div>
            <PersonOutlineOutlined className="ml-2 w-10 h-10 p-1.5 text-white bg-blue-blue3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

import { FilterListOutlined } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const FilterHeader: React.FC<IFiltersHeder> = ({
  openDrawer,
  closeDrawer,
  resetFilters,
  isShowReset = true
}) => {
  const [t] = useTranslation('vendor');

  return (
    <div className="flex justify-between items-center">
      <div className="flex cursor-pointer items-center" onClick={closeDrawer}>
        <FilterListOutlined
          className="cursor-pointer text-blue-blue2"
          onClick={openDrawer}
        />
        <span className="ml-2">{t('vendor.filterBy')}</span>
      </div>
      {isShowReset && (
        <span className="cursor-pointer text-blue-blue2" onClick={resetFilters}>
          {t('vendor.resetFilters')}
        </span>
      )}
    </div>
  );
};

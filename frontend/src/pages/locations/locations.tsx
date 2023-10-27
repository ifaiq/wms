import {
  CheckBox,
  CheckBoxOutlineBlank,
  ModeOutlined
} from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  CustomPagination,
  FilterDrawer,
  IconButtonPrimary,
  LocationFilter,
  TableWrapper,
  TopBar
} from 'src/components';
import { INITAIL_PAGINATION_DATA } from 'src/constants/common';
import { TEST_ID_KEY_LOCATION } from 'src/constants/locations';
import { useGetLocations } from 'src/hooks';
import {
  getLocationsData,
  getLocationsFilterParams,
  getLocationsIsFilterApplied
} from 'src/store/selectors/entities/location';
import {
  resetLocationsFilterParams,
  setLocationsFilterParams,
  updateLocationsData
} from 'src/store/slices/entities/location';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { getLocationsColumns } from './columns';

export const Locations: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('location');

  const [pagination, setPagination] = useState<IPaginationType>(
    INITAIL_PAGINATION_DATA
  );

  const filterParams = useSelector(getLocationsFilterParams);
  const isFilterApplied = useSelector(getLocationsIsFilterApplied);

  const requestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...filterParams
  });

  const { isLoading, data } = useGetLocations(requestPayload);

  const locationsData = useSelector(getLocationsData);

  useEffect(() => {
    if (data) dispatch(updateLocationsData(data?.data?.locations));
  }, [data]);

  const navigateToCreateLocation = () => history.push('/location/create');

  const onChangePagination = (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;
    setPagination((state: IPaginationType) => ({
      ...state,
      skip,
      page,
      take: pageSize
    }));
  };

  const onRowClick = (record: TObject) => {
    history.push(`/location/${record?.id}`);
  };

  const actions = [
    {
      title: `${t('location.avblForSale')}`,
      dataIndex: 'availableForSale',
      key: 'availableForSale',
      width: '5%',
      fixed: 'right',
      render(saleStatus: boolean) {
        return saleStatus ? (
          <CheckBox color="primary" style={{ fontSize: '25px' }} />
        ) : (
          <CheckBoxOutlineBlank style={{ fontSize: '25px', color: 'gray' }} />
        );
      }
    },
    {
      title: `${t('location.grnApplicable')}`,
      dataIndex: 'grnApplicable',
      key: 'grnApplicable',
      width: '5%',
      fixed: 'right',
      render: (grnStatus: boolean) => {
        return grnStatus ? (
          <CheckBox color="primary" style={{ fontSize: '25px' }} />
        ) : (
          <CheckBoxOutlineBlank style={{ fontSize: '25px', color: 'gray' }} />
        );
      }
    },
    {
      title: `${t('location.returnApplicable')}`,
      dataIndex: 'returnApplicable',
      key: 'returnApplicable',
      width: '5%',
      fixed: 'right',
      render: (returnStatus: boolean) => {
        return returnStatus ? (
          <CheckBox color="primary" style={{ fontSize: '25px' }} />
        ) : (
          <CheckBoxOutlineBlank style={{ fontSize: '25px', color: 'gray' }} />
        );
      }
    }
  ];

  const columnsData = [...getLocationsColumns(t), ...actions];

  const handleFilterSetParams = (values: TObject) =>
    dispatch(setLocationsFilterParams(values));

  const handleFilterReset = () => dispatch(resetLocationsFilterParams());

  return (
    <>
      <TopBar title={t('location.title')} search={false} />

      <div className="lg:mx-9">
        <div
          className={`flex my-6 items-center ${
            true ? 'justify-between' : 'justify-end'
          }`}
        >
          {true && (
            <IconButtonPrimary
              icon={<ModeOutlined className="mr-2" />}
              text={t('location.createLocation')}
              onClick={navigateToCreateLocation}
              dataTestID={`${TEST_ID_KEY_LOCATION}Create`}
            />
          )}
          <div className="flex justify-between items-center">
            <CustomPagination
              simple
              current={pagination?.page}
              pageSize={pagination?.take}
              onChange={onChangePagination}
              total={data?.data?.total}
              showSizeChanger
            />
            <FilterDrawer
              isFilterApplied={isFilterApplied}
              onReset={handleFilterReset}
            >
              <LocationFilter
                filterParams={filterParams}
                applyFilter={handleFilterSetParams}
              />
            </FilterDrawer>
          </div>
        </div>

        <TableWrapper
          columns={columnsData}
          size="middle"
          loading={isLoading}
          dataSource={locationsData}
          rowKey={(record: TObject) => record?.id}
          pagination={false}
          onRow={(record: TObject) => ({
            onClick: () => onRowClick(record)
          })}
        />
      </div>
    </>
  );
};

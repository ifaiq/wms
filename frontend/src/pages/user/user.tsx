import { ModeOutlined } from '@mui/icons-material';
import { Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import {
  CustomSwitch,
  TopBar,
  SearchCategory,
  IconButtonPrimary,
  CustomPagination,
  TableWrapper
} from 'src/components';
import { INITAIL_PAGINATION_DATA } from 'src/constants/common';
import {
  INITIAL_USER_SEARCH_STATE,
  USER_SEARCH_CAT_LIST,
  USER_STATUS
} from 'src/constants/user';
import { useChangeUserStatus, useGetUsers } from 'src/hooks';
import { getUsersData } from 'src/store/selectors/entities/user';
import { getIsUserManagementAllowed } from 'src/store/selectors/features/user';
import { updateUsersData } from 'src/store/slices/entities/user';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { prepareFilterRequestPayload } from 'src/utils/filterPayload';
import { getUserColumns } from './columns';

export const User: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('user');

  const [pagination, setPagination] = useState<IPaginationType>(
    INITAIL_PAGINATION_DATA
  );

  const [searchParams, setSearchParams] = useState({});

  const requestPayload: TObject = prepareFilterRequestPayload({
    ...pagination,
    ...searchParams
  });

  const {
    isLoading,
    data,
    refetch: refetchUsers
  } = useGetUsers(requestPayload);

  const {
    isSuccess: isStatusSuccess,
    isError: isStatusError,
    error: statusError,
    mutateAsync: changeUserStatus
  } = useChangeUserStatus();

  const usersData = useSelector(getUsersData);
  const isUserManagementAllowed = useSelector(getIsUserManagementAllowed);

  useEffect(() => {
    if (data) dispatch(updateUsersData(data?.data?.users));
  }, [data]);

  useEffect(() => {
    if (isStatusError) {
      const errorData = statusError as TObject;
      showErrorMessage(errorData?.statusText || errorData?.data?.message);
    }
  }, [isStatusError]);

  useEffect(() => {
    if (isStatusSuccess) {
      refetchUsers({ throwOnError: true, cancelRefetch: true });
      showSuccessMessage('User Status Update Successful');
    }
  }, [isStatusSuccess]);

  /* handle search state */
  const handleSearchData = (values: TObject) => {
    setSearchParams({ ...values });
    setPagination(INITAIL_PAGINATION_DATA);
  };

  const navigateToCreateUser = () => history.push('/user/create');

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
    if (!isUserManagementAllowed) return;

    history.push(`/user/${record?.id}`);
  };

  const actions = [
    {
      title: `${t('user.role')}`,
      dataIndex: 'UserRole',
      key: 'UserRole',
      width: '25%',
      onCell: (record: TObject) => ({ onClick: () => onRowClick(record) }),
      render: (item: TObject | TObject[], record: TObject) => {
        const userStatus =
          record?.status === USER_STATUS.ENABLED ? true : false;

        const tagStyle = userStatus
          ? {
              borderColor: '#2551B3',
              color: '#2551B3',
              background: '#F1F4F6'
            }
          : {
              borderColor: 'gray',
              color: 'gray',
              background: '#F1F4F6'
            };

        return item?.map((roles: TObject) => {
          const { name } = roles?.role;

          return (
            <Tag
              key={roles.role.name}
              style={{
                borderRadius: '25px',
                ...tagStyle
              }}
            >
              {name.replace('_', ' ').toUpperCase()}
            </Tag>
          );
        });
      }
    },
    {
      title: `${t('user.disable')}`,
      dataIndex: 'disable',
      key: 'disable',
      width: '5%',
      fixed: 'right',
      render: (_: string, item: TObject) => {
        const userStatus = !(item?.status === USER_STATUS.ENABLED
          ? true
          : false);

        return (
          <CustomSwitch
            onChange={() =>
              changeUserStatus({
                id: item?.id,
                status: userStatus ? USER_STATUS.ENABLED : USER_STATUS.DISABLED
              })
            }
            checked={userStatus}
            disabled={!isUserManagementAllowed}
          />
        );
      }
    }
  ];

  const columnsData = [...getUserColumns(t, onRowClick), ...actions];

  return (
    <>
      <TopBar
        title={t('user.title')}
        searchComponent={
          <SearchCategory
            onSearch={handleSearchData}
            intialState={INITIAL_USER_SEARCH_STATE}
            categoryList={USER_SEARCH_CAT_LIST}
          />
        }
      />

      <div className="lg:mx-9">
        <div
          className={`flex my-6 items-center 
          ${isUserManagementAllowed ? 'justify-between' : 'justify-end'}`}
        >
          {isUserManagementAllowed && (
            <IconButtonPrimary
              icon={<ModeOutlined className="mr-2" />}
              text={t('user.createUser')}
              onClick={navigateToCreateUser}
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
          </div>
        </div>

        <TableWrapper
          columns={columnsData}
          size="middle"
          loading={isLoading}
          dataSource={usersData}
          rowKey={(record: TObject) => record?.id}
          pagination={false}
        />
      </div>
    </>
  );
};

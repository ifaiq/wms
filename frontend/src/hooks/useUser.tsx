import { useMutation, useQuery } from 'react-query';
import { UserService } from '../services';

const userService = new UserService();

const useGetUsers = (params: Record<string, string>) =>
  useQuery(['users', params], () => userService.fetchUsers(params), {
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

const useGetRoles = () =>
  useQuery(['roles'], () => userService.fetchRoles(), {
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

const useCreateUser = () =>
  useMutation((data: IUser) => userService.createUser(data));

const useUpdateUser = () =>
  useMutation((data: IUser) => userService.updateUser(data));

const useGetUserById = (id: TNumberOrString) =>
  useQuery(['user', id], () => (id ? userService.getUserById(id) : null), {
    retry: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

const useChangeUserStatus = () =>
  useMutation((data: TObject) => userService.changeUserStatus(data));

export {
  useGetUsers,
  useGetRoles,
  useCreateUser,
  useUpdateUser,
  useChangeUserStatus,
  useGetUserById
};

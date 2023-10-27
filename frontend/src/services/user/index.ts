import { NETWORK } from '../../constants/config';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';

export class UserService extends HttpService {
  fetchUsers = async (params?: Record<string, string>): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/users/search`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchRoles = async (): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/auth/roles`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createUser = async (data: IUser): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/users/create`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateUser = async (data: IUser): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/users/${data.id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  getUserById = async (id: TNumberOrString): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/users/${id}`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  changeUserStatus = async (data: TObject): Promise<any> => {
    try {
      const { id, status } = data;

      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/users/${id}/status`,
        { status }
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

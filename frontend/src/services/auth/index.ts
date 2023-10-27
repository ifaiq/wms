import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { LocalStorageService } from '../local-storage';
import { NETWORK } from '../../constants/config';

const localStorageService = new LocalStorageService();
export class AuthService extends HttpService {
  signOut = async (data: Record<string, string>): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/${id}/sign-out`,
        undefined
      );

      await localStorageService.remove('wmsAuthToken');
      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  signIn = async (data: ILoginDataProps): Promise<any> => {
    try {
      const apiResponse: any = await this.post(
        `${NETWORK.BASE_URL}/auth/login`,
        data
      );

      await localStorageService.persist(
        'wmsAuthToken',
        apiResponse?.data?.access_token
      );
      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  signUp = async (baseUrl: string, data: Record<string, any>): Promise<any> => {
    try {
      const apiResponse = await this.post(`${baseUrl}/sign-up`, data);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

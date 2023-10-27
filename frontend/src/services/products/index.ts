import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { NETWORK } from '../../constants/config';

export class ProductService extends HttpService {
  fetchProducts = async (params: Record<string, any>): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/product/search`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchProducts_ById = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/products/${id}`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

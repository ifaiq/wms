import { NETWORK } from '../../constants/config';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';

export class LocationService extends HttpService {
  fetcLocations = async (params?: Record<string, string>): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/locations/search`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createLocation = async (data: ILocation): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/locations`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  getLocationById = async (id: TNumberOrString): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/locations/${id}`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateLocation = async (data: ILocation): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/locations/${data.id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateLocationStatus = async (params?: TObject): Promise<any> => {
    try {
      const { id, disabled } = params;

      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/locations/${id}/status`,
        { disabled }
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  getAllParentLocationsByType = async (
    params?: Record<string, string>
  ): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/locations`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

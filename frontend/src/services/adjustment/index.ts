import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { NETWORK } from '../../constants/config';
import { REASON_TYPE } from 'src/constants/adjustment';

export class AdjustmentService extends HttpService {
  fetchAdjustmentById = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK?.BASE_URL}/adjustment/${id}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createAdjustment = async (data: TObject): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK?.BASE_URL}/adjustment`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateAdjustment = async (data: TObject): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK?.BASE_URL}/adjustment/${data.id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  bulkUploadProducts = async (
    data: IAdjustBulkUploadProducts
  ): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK?.BASE_URL}/adjustment/bulk-upload/products`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchAdjustmentReasons = async (): Promise<any> => {
    const queryParams = { type: REASON_TYPE.ADJUSTMENT };

    try {
      const apiResponse = await this.get(
        `${NETWORK?.BASE_URL}/admin/reason`,
        queryParams
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateAdjustmentStatus = async (data: TObject): Promise<any> => {
    const { id, status } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK?.BASE_URL}/adjustment/status/${id}`,
        { status }
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  bulkCreateAdjustments = async (data: IBulkUploadProducts): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK?.BASE_URL}/adjustment/bulk-upload`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

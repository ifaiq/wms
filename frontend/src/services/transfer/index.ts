import { HttpService } from '../http';
import { prepareResponseObject, prepareErrorResponse } from '../http/response';
import { REASON_TYPE } from 'src/constants/adjustment';
import { NETWORK } from 'src/constants/config';
import { RESPONSE_TYPES } from 'src/constants/response-types';

export class TransferService extends HttpService {
  fetchTransfers = async (params?: Record<string, any>): Promise<any> => {
    try {
      const url = `${NETWORK.BASE_URL}/transfer/search`;
      const apiResponse = await this.get(url, params);
      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchTransferById = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK?.BASE_URL}/transfer/${id}`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createTransfer = async (data: TObject): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK?.BASE_URL}/transfer`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateTransfer = async (data: TObject): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK?.BASE_URL}/transfer/${data.id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  bulkUploadProducts = async (data: IBulkUploadProducts): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK?.BASE_URL}/transfer/bulk-upload/products`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchTransferReasons = async (): Promise<any> => {
    const queryParams = { type: REASON_TYPE.TRANSFER };

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

  updateTransferStatus = async (data: TObject): Promise<any> => {
    const { id, status } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK?.BASE_URL}/transfer/status/${id}`,
        { status }
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  bulkCreateTransfers = async (data: IBulkUploadProducts): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK?.BASE_URL}/transfer/bulk-upload`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

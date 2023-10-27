import { NETWORK } from '../../constants/config';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';

export class PurchOrderService extends HttpService {
  fetchPOs = async (params?: Record<string, any>): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/purchase-orders/search`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchPOById = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/purchase-orders/${id}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createPO = async (data: I_PO): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/purchase-orders`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updatePO = async (data: I_PO): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/purchase-orders/${data.id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchBusinessUnitsAgainstACountry = async (
    countryCode: string
  ): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/monolith/business-units/${countryCode}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchLocationsAgainstABusinessUnit = async (id: number): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/monolith/locations/${id}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  bulkUploadProducts = async (data: IBulkUploadProducts): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/purchase-orders/bulk-upload/products`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  changePOStatus = async (data: TObject): Promise<any> => {
    try {
      const { id, status } = data;

      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/purchase-orders/${id}/status`,
        { status }
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  attachFile = async (data: IUpload): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/purchase-orders/attach`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  detachFile = async (data: IUpload): Promise<any> => {
    const { id, fieldName } = data;

    try {
      const apiResponse = await this.delete(
        `${NETWORK.BASE_URL}/purchase-orders/${id}/detach/${fieldName}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  printPO = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.downloadFile(
        `${NETWORK?.BASE_URL}/purchase-orders/download/${id}`,
        undefined,
        `purchase-order-id-${id}.pdf`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  bulkUploadPurchaseOrders = async (data: TDocsOrMultimedia): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/purchase-orders/bulk-upload`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

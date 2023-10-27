import { NETWORK } from 'src/constants/config';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';

export class GRNService extends HttpService {
  fetchReceiptsByPoId = async (poId: string | number): Promise<any> => {
    try {
      const apiResposne = await this.get(
        `${NETWORK.BASE_URL}/purchase-orders/${poId}/receipts`
      );

      return prepareResponseObject(apiResposne, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchGrnByReceiptId = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/receipts/${id}`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchReturnGrnByReceiptId = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/receipts/return/${id}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  featchReturnReasons = async (type: string): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/admin/reason`, {
        type
      });

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateGRN = async (data: IGRN): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/receipts/${id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateGRNStatus = async (data: TObject): Promise<any> => {
    const { id, status, createBackOrder } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/receipts/${id}/status`,
        { status, createBackOrder }
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createGRNBackorder = async (data: TObject): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/receipts/${id}/back-order`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createGRNReturn = async (data: TObject): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/receipts/${id}/return`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateReturnGRNStatus = async (data: TObject): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/receipts/return/${id}/status`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  returnGRN = async (data: IGRN): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/receipts/return/${id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  printGRN = async (
    id: number | string | undefined,
    isReturn: boolean | undefined
  ): Promise<any> => {
    try {
      const URL = isReturn ? 'receipts/download/return' : 'receipts/download';

      const apiResponse = await this.downloadFile(
        `${NETWORK?.BASE_URL}/${URL}/${id}`,
        undefined,
        `grn${isReturn ? '-return' : ''}-id-${id}.pdf`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  attachFile = async (data: IUpload): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/receipts/attach`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  detachFile = async (data: TObject): Promise<any> => {
    const { id, fieldName } = data;

    try {
      const apiResponse = await this.delete(
        `${NETWORK.BASE_URL}/receipts/${id}/detach/${fieldName}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createReturnIn = async (data: TObject): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/receipts/${id}/return-in`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  attachReturnAttachment = async (data: IUpload): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/receipts/return/attach`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  detachReturnAttachment = async (data: TObject): Promise<any> => {
    const { id, fieldName } = data;

    try {
      const apiResponse = await this.delete(
        `${NETWORK.BASE_URL}/receipts/${id}/return/${fieldName}/detach`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

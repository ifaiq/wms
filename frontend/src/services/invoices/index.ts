import { NETWORK } from 'src/constants/config';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';

export class InvoiceService extends HttpService {
  fetchDraftInvoices = async (params?: Record<string, any>): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/invoice/draft`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchApprovedInvoices = async (
    params?: Record<string, any>
  ): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.INVOICING_SERVICE_BASE_URL}/api/v1/invoice`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createInvoice = async (data: ICreateInvoiceDto): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.INVOICING_SERVICE_BASE_URL}/api/v1/invoice`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  fetchInvoicePreview = async (body: Record<string, any>): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.FMS_BASE_URL}/api/v1/preview-invoice?returnBuffer=true`,
        body
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  createDraftInvoice = async (data: IDraftInvoice): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/invoice/draft`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  updateDraftInvoice = async (
    data: IDraftInvoice,
    id: string
  ): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/invoice/draft/${id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };

  deleteDraftInvoice = async (id: string): Promise<any> => {
    try {
      const apiResponse = await this.delete(
        `${NETWORK.BASE_URL}/invoice/draft/${id}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error) {
      throw prepareErrorResponse(error);
    }
  };
}

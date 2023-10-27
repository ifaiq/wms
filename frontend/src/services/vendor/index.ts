import { HttpService } from '../http';
import { prepareErrorResponse, prepareResponseObject } from '../http/response';
import { RESPONSE_TYPES } from '../../constants/response-types';
import { NETWORK } from '../../constants/config';

export class VendorService extends HttpService {
  fetchVendors = async (params?: Record<string, any>): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.BASE_URL}/vendors/search`,
        params
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: any) {
      throw prepareErrorResponse(error);
    }
  };

  fetchVendorById = async (id: number | string): Promise<any> => {
    try {
      const apiResponse = await this.get(`${NETWORK.BASE_URL}/vendors/${id}`);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  createVendor = async (data: IVendor): Promise<any> => {
    try {
      const apiResponse = await this.post(`${NETWORK.BASE_URL}/vendors`, data);

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  updateVendor = async (
    data: IVendor,
    id: number | undefined
  ): Promise<any> => {
    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/vendors/${id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  uploadFile = async (data: IUpload): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.BASE_URL}/vendors/attach`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  removeFile = async (data: IUpload): Promise<any> => {
    const { id, fieldName } = data;

    try {
      const apiResponse = await this.delete(
        `${NETWORK.BASE_URL}/vendors/${id}/detach/${fieldName}`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  changeVendorStatus = async (data: Record<string, any>): Promise<any> => {
    const { id } = data;

    try {
      const apiResponse = await this.put(
        `${NETWORK.BASE_URL}/vendors/status/${id}`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  fetchTaxGroups = async (): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.TAXATION_BASE_URL}/tax-groups?type=vendor`
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  createVendorTaxGroup = async (data: IVendorTaxGroup): Promise<any> => {
    try {
      const apiResponse = await this.post(
        `${NETWORK.TAXATION_BASE_URL}/vendor-tax-groups`,
        data
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  fetchTaxGroupByVendorId = async (id: number): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.TAXATION_BASE_URL}/vendor-tax-groups/` + id
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };

  fetchTaxCodeByGroupId = async (id: string): Promise<any> => {
    try {
      const apiResponse = await this.get(
        `${NETWORK.TAXATION_BASE_URL}/tax-groups/` + id
      );

      return prepareResponseObject(apiResponse, RESPONSE_TYPES.SUCCESS);
    } catch (error: TObject) {
      throw prepareErrorResponse(error);
    }
  };
}

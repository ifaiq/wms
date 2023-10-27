import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  createServiceToken,
  verifyServiceToken
} from '@development-team20/auth-library/dist';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import {
  Monolith,
  Location,
  BusinessUnit,
  UpdateInventoryBody,
  ValidateProductQuantity
} from './entities';
import {
  GET_BUSINESS_UNIT,
  GET_LOCATION,
  CONFIG_SERVICE_URL,
  API_RETRY_DEFAULT_VALUE,
  UPDATE_INVENTORY_WMS,
  MONOLITH_URL,
  VALIDATE_PRODUDCT_INVENTORY
} from '../common/constants';
import { InventoryRequestService } from '../inventory-request/inventory-request.service';
import { ApiException } from 'src/errors/exceptions';
import { ErrorCodes } from 'src/errors/errors';
import { ISQSMessage } from 'src/sqs/interface';
import { SqsService } from 'src/sqs/sqs.service';

@Injectable()
export class MonolithService implements Monolith, OnModuleInit {
  private readonly logger = new Logger(MonolithService.name);
  serviceToken: string | undefined;
  defaultFields = 'id,name';
  constructor(
    private readonly httpService: HttpService,
    private readonly inventoryRequestService: InventoryRequestService,
    private readonly sqsService: SqsService
  ) {}

  onModuleInit() {
    this.httpService.axiosRef.interceptors.request.use(async (config) => ({
      ...config,
      headers: {
        ...config.headers,
        Authorization: await this.getServiceToken()
      }
    }));
  }

  getServiceToken = async () => {
    if (!this.serviceToken) {
      this.serviceToken = (await createServiceToken()) as string;
      return this.serviceToken;
    }

    try {
      await verifyServiceToken(this.serviceToken);
    } catch (error) {
      this.serviceToken = (await createServiceToken()) as string;
    }

    return this.serviceToken;
  };

  GetBusinessUnits = async (countryCode: string): Promise<BusinessUnit[]> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${CONFIG_SERVICE_URL}${GET_BUSINESS_UNIT}`, {
          params: {
            countryCode,
            select: this.defaultFields
          }
        })
      );
      return response.data.data;
    } catch (error: any) {
      throw new ApiException(
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        {
          code: ErrorCodes.UpstreamServiceFailed,
          status: error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
          errors: {
            reason: error.response?.message || error.message
          }
        }
      );
    }
  };

  GetLocations = async (businessUnitId: number): Promise<Location[]> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${CONFIG_SERVICE_URL}${GET_LOCATION}`, {
          params: {
            businessUnitId,
            select: this.defaultFields
          }
        })
      );

      // ENABLED_LOCATIONS will filter out enabled locations if the env variable is defined
      // {1: [12, 13, 14]} It will contain a mapping from businessUnitID to enabled location_ids
      const enabledLocations = process.env.ENABLED_LOCATIONS;
      if (enabledLocations) {
        const parsedLocations = JSON.parse(enabledLocations);
        const locations = parsedLocations[businessUnitId] || [];
        return response.data.data.filter((location: Location) =>
          locations.includes(location.id)
        );
      }

      return response.data.data;
    } catch (error: any) {
      throw new ApiException(
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        {
          code: ErrorCodes.UpstreamServiceFailed,
          status: error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
          errors: {
            reason: error.response?.message || error.message
          }
        }
      );
    }
  };

  GetBusinessUnitById = async (
    id: number,
    fieldsToFetch = this.defaultFields
  ): Promise<BusinessUnit> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${CONFIG_SERVICE_URL}${GET_BUSINESS_UNIT}/${id}`,
          {
            params: {
              select: fieldsToFetch
            }
          }
        )
      );
      return response.data.data;
    } catch (error: any) {
      throw new ApiException(
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        {
          code: ErrorCodes.UpstreamServiceFailed,
          status: error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
          errors: {
            reason: error.response?.message || error.message
          }
        }
      );
    }
  };

  GetLocationById = async (
    id: number,
    fieldsToFetch = this.defaultFields
  ): Promise<Location> => {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${CONFIG_SERVICE_URL}${GET_LOCATION}/${id}`, {
          params: {
            select: fieldsToFetch
          }
        })
      );
      return response.data.data;
    } catch (error: any) {
      throw new ApiException(
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        {
          code: ErrorCodes.UpstreamServiceFailed,
          status: error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
          errors: {
            reason: error.response?.message || error.message
          }
        }
      );
    }
  };

  updateInventory = async (
    body: UpdateInventoryBody,
    referenceId: number
  ): Promise<any> => {
    // Once sqs is throughly tested, we can remove the updateInventoryUsingAPI function
    if (process.env.ALLOW_INVENTORY_UPDATE_SQS == 'true') {
      await this.updateInventoryUsingSqs(body, referenceId);
    } else {
      await this.updateInventoryUsingAPI(body, referenceId);
    }
  };

  GetBusinessUnitAndLocationById = async (
    businessUnitId: number,
    locationId: number
  ) => {
    const [businessUnit, warehouse] = await Promise.all([
      this.GetBusinessUnitById(businessUnitId),
      this.GetLocationById(locationId)
    ]);
    return { businessUnit, warehouse };
  };

  private async updateInventoryUsingAPI(
    body: UpdateInventoryBody,
    referenceId: number
  ) {
    const context = `${MonolithService.name}.updateInventory()`;
    this.logger.log(
      `context: ${context}, message: params: { body: ${JSON.stringify(
        body
      )}, referenceId: ${referenceId}}`
    );
    let retries = API_RETRY_DEFAULT_VALUE;
    const requestBody = {
      ...body,
      idempotency_key: uuidv4()
    };

    this.logger.log(
      `context: ${context}, message: requestBody: ${JSON.stringify(
        requestBody
      )}`
    );

    const inventoryRequestBody = async () => {
      const response = await firstValueFrom(
        this.httpService.post(`${MONOLITH_URL}${UPDATE_INVENTORY_WMS}`, {
          ...requestBody
        })
      );

      const responseBody = { ...response.data, status: response.status };

      const requestInventory = {
        type: body.type,
        requestBody,
        responseBody: responseBody,
        responseStatus: responseBody?.status,
        idempotencyKey: requestBody?.idempotency_key,
        isSuccessful: responseBody?.data?.success ? true : false,
        referenceId
      };

      this.logger.log(
        `context: ${context}.inventoryRequestBody(), message: requestInventory: ${JSON.stringify(
          requestInventory
        )}`
      );

      const inventoryRequest =
        await this.inventoryRequestService.createInventoryRequest(
          requestInventory
        );

      this.logger.log(
        `context: ${context}.inventoryRequestBody(), message: inventoryRequest created with id: ${inventoryRequest.id}`
      );
    };

    // Retry mechanism for updating product inventory
    while (retries > 0) {
      try {
        await inventoryRequestBody();
        return;
      } catch (error: any) {
        retries -= 1;
        if (retries === 0) {
          const requestInventory = {
            type: body.type,
            responseStatus:
              error?.status ||
              error?.response?.status ||
              HttpStatus.SERVICE_UNAVAILABLE,
            responseBody: error?.response?.data || error?.response || error,
            requestBody,
            idempotencyKey: requestBody.idempotency_key,
            isSuccessful: false,
            referenceId
          };
          this.logger.log(
            `context: ${context}.inventoryRequestBody(), message: requestInventory: ${JSON.stringify(
              requestInventory
            )}`
          );
          const inventoryRequest =
            await this.inventoryRequestService.createInventoryRequest(
              requestInventory
            );

          this.logger.log(
            `context: ${context}.inventoryRequestBody(), message: inventoryRequest created with id: ${inventoryRequest.id}`
          );

          throw new ApiException(HttpStatus.BAD_REQUEST, {
            code: ErrorCodes.UpstreamServiceFailed,
            status: HttpStatus.BAD_REQUEST,
            errors: {
              reason: 'Error while updating inventory'
            }
          });
        }
      }
    }
  }

  private async updateInventoryUsingSqs(
    body: UpdateInventoryBody,
    referenceId: number
  ) {
    const context = `${MonolithService.name}.updateInventory()`;
    const requestBody = {
      ...body,
      idempotency_key: uuidv4()
    };

    this.logger.log(
      `context: ${context}, message: requestBody: ${JSON.stringify(
        requestBody
      )}`
    );
    console.log(
      `Host Name: ${process.env.AWS_SQS_HOST} Account ID: ${process.env.AWS_ACCOUNT_ID} Queue Name:${process.env.STOCKFLO_TO_MONOLITH_PRODUCT_INVENTORY_SYNC_QUEUE_NAME}`
    );
    const params: ISQSMessage = {
      MessageBody: JSON.stringify(requestBody),
      QueueUrl: `${process.env.AWS_SQS_HOST}${process.env.AWS_ACCOUNT_ID}/${process.env.STOCKFLO_TO_MONOLITH_PRODUCT_INVENTORY_SYNC_QUEUE_NAME}`
    };

    await this.sqsService.createMessage(params, context);

    const requestInventory = {
      type: body.type,
      requestBody,
      idempotencyKey: requestBody?.idempotency_key,
      isSuccessful: true,
      referenceId
    };

    this.logger.log(
      `context: ${context}.inventoryRequestBody(), message: requestInventory: ${JSON.stringify(
        requestInventory
      )}`
    );

    const inventoryRequest =
      await this.inventoryRequestService.createInventoryRequest(
        requestInventory
      );

    this.logger.log(
      `context: ${context}.inventoryRequestBody(), message: inventoryRequest created with id: ${inventoryRequest.id}`
    );
  }

  ValidateAvailableForSaleQuantity = async (
    products: ValidateProductQuantity[],
    warehouseId: number
  ): Promise<{ batches: number[]; productId: number }[]> => {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${MONOLITH_URL}${VALIDATE_PRODUDCT_INVENTORY}`, {
          products,
          warehouseId
        })
      );
      return response.data.data;
    } catch (error: any) {
      throw new ApiException(
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
        {
          code: ErrorCodes.UpstreamServiceFailed,
          status: error.response?.status || HttpStatus.SERVICE_UNAVAILABLE,
          errors: {
            reason: error.response?.message || error.message
          }
        }
      );
    }
  };
}

import { HttpStatus, Injectable } from '@nestjs/common';
import AppSearchClient from '@elastic/app-search-node';
import {
  APP_SEARCH_API,
  APP_SEARCH_VERSION
} from 'src/common/constants/appSearch';
import { ProductSearchDto } from 'src/product/dto';
import { ErrorCodes } from 'src/errors/errors';
import { ApiException } from 'src/errors/exceptions';

@Injectable()
export class AppsearchService {
  private client: AppSearchClient;
  private baseUrlFn = () =>
    `${process.env.APP_SEARCH_URL}${APP_SEARCH_API}${APP_SEARCH_VERSION}`;
  constructor() {
    this.client = new AppSearchClient(
      undefined,
      process.env.APP_SEARCH_KEY as string,
      this.baseUrlFn
    );
  }

  searchProducts = async (
    searchParams: Partial<ProductSearchDto>,
    locationId: string,
    pagination: Partial<ProductSearchDto>
  ) => {
    const searchFields: Record<string, object> = {};
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        searchFields[key] = {};
      }
    }
    const resultFields = {
      id: { raw: {} },
      name: { raw: {} },
      sku: { raw: {} },
      physical_stock: { raw: {} },
      is_deactivated: { raw: {} }
    };
    const options = {
      search_fields: searchFields,
      result_fields: resultFields,
      filters: {
        all: [{ location_id: locationId }]
      },
      page: {
        size: pagination.pageSize || 10,
        current: pagination.currentPage || 1
      }
    };
    const searchValue = searchParams.name
      ? searchParams.name
      : (searchParams.sku as string);
    const results = await this.client.search(
      process.env.APP_SEARCH_ENGINE as string,
      this.escapeRegExp(searchValue),
      options
    );
    const productData = results.results.map(this.toESProductFields);
    return productData;
  };

  searchProductBySkus = async (
    productSkus: string[],
    locationId: string,
    resultFields: any = {
      id: { raw: {} },
      name: { raw: {} },
      sku: { raw: {} },
      physical_stock: { raw: {} },
      is_deactivated: { raw: {} }
    }
  ) => {
    const filters: any = {
      all: [{ sku: productSkus }, { location_id: locationId }]
    };
    const options = {
      result_fields: resultFields,
      filters,
      page: {
        size: productSkus.length
      }
    };
    try {
      const results = await this.client.search(
        process.env.APP_SEARCH_ENGINE as string,
        '',
        options
      );
      const productData = results.results.map(this.toESProductFields);
      return productData;
    } catch (error: any) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: ErrorCodes.UpstreamServiceFailed,
        status: HttpStatus.BAD_REQUEST,
        errors: {
          reason: String(error.errorMessages[0])
        }
      });
    }
  };

  searchProductByIds = async (
    productIds: string[],
    resultFields: any = {
      id: { raw: {} },
      sku: { raw: {} },
      name: { raw: {} }
    }
  ) => {
    const filters: any = {
      all: [{ id: productIds }]
    };
    const options = {
      result_fields: resultFields,
      filters,
      page: {
        size: productIds.length
      }
    };
    try {
      const results = await this.client.search(
        process.env.APP_SEARCH_ENGINE as string,
        '',
        options
      );
      const productData = results.results.map(this.toESProductFields);
      return productData;
    } catch (error: any) {
      throw new ApiException(HttpStatus.BAD_REQUEST, {
        code: ErrorCodes.UpstreamServiceFailed,
        status: HttpStatus.BAD_REQUEST,
        errors: {
          reason: String(error.errorMessages[0])
        }
      });
    }
  };

  private toESProductFields = (product: any) => ({
    id: parseInt(product.id.raw),
    name: product.name.raw,
    sku: product.sku.raw,
    currentQuantity: product.physical_stock?.raw || 0,
    isDeactivated: product.is_deactivated?.raw || false
  });

  private escapeRegExp = (input: string) => {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  };
}

import { Injectable } from '@nestjs/common';
import { ProductSearchDto } from './dto';
import { AppsearchService } from 'src/appsearch/appsearch.service';
import { InventoryService } from 'src/inventory/inventory.service';
import { Product } from 'src/monolith/entities';
import { Prisma } from '@prisma/client';
import { convertIntoKeyValuePair } from 'src/common';

@Injectable()
export class ProductService {
  constructor(
    private readonly appSearch: AppsearchService,
    private readonly inventoryService: InventoryService
  ) {}

  async searchProducts(reqParams: ProductSearchDto): Promise<any | null> {
    const { name, sku, locationId, pageSize, currentPage } = reqParams;
    return await this.appSearch.searchProducts({ name, sku }, locationId, {
      pageSize,
      currentPage
    });
  }

  async filterProductsBySubLocationId(
    reqParams: ProductSearchDto
  ): Promise<Product[] | null> {
    const { subLocationId, pageSize } = reqParams;
    let { currentPage } = reqParams;
    const appSearchPageSize = 50;

    if (subLocationId) {
      const productsArray = [];
      let products = [];

      const whereClause: Prisma.InventoryWhereInput = {
        locationId: Number(subLocationId)
      };

      const selectClause: Prisma.InventorySelect = {
        productId: true,
        physicalQuantity: true
      };

      const productsData =
        await this.inventoryService.fetchInventoryProductsByWhere(
          whereClause,
          selectClause
        );

      // Convert into keyvalue pair based on id
      const productsById = convertIntoKeyValuePair(productsData, 'productId');

      // Fetch next page of products for the same search string till
      // 1) products are less than the pageSize requested
      // 2) products.length is equal to appSearchPageSize it means there might be some matched results that can be fetched from appsearch or
      //    its the first page call to fetch products
      while (
        productsArray.length < pageSize &&
        (products.length === appSearchPageSize || currentPage === 1)
      ) {
        // Fetch products for the next page
        products = await this.searchProducts({
          ...reqParams,
          currentPage,
          pageSize: appSearchPageSize
        });

        // Filter products till on the basis of sublocationId
        const fitleredProducts = this.validateAppSearchProducts(
          productsById,
          products
        );

        // Populate the products array till the productsArray size is equal to
        if (fitleredProducts.length) {
          for (
            let iterator = 0;
            productsArray.length < pageSize &&
            iterator < fitleredProducts.length;
            iterator++
          ) {
            productsArray.push(fitleredProducts[iterator]);
          }
        }
        currentPage = currentPage + 1;
      }
      return productsArray;
    }
    return [];
  }

  validateAppSearchProducts(
    products: Record<
      string,
      {
        [name: string]: string | number;
      }
    >,
    appSearchProducts: any[]
  ): Product[] {
    const availableProducts: Product[] = [];
    appSearchProducts.forEach((product) => {
      if (products[product.id]) {
        availableProducts.push({
          id: product.id,
          currentQuantity: Number(products[product.id].physicalQuantity),
          name: product.name as string,
          sku: product.sku as string
        });
      }
    });
    return availableProducts;
  }
}

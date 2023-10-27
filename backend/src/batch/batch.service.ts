import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppsearchService } from 'src/appsearch/appsearch.service';
import { convertIntoKeyValuePair } from 'src/common';
import { InventoryService } from 'src/inventory/inventory.service';
import { VerifyBatchRequest } from './dto';
import { FetchAvsRequest } from './dto';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly appSearchService: AppsearchService
  ) {}

  async validateAvsStock(batchData: VerifyBatchRequest) {
    const context = `${BatchService.name}.validateAvsStock()`;
    this.logger.log(
      `context: ${context}, message: params: { body: ${JSON.stringify(
        batchData
      )}`
    );

    const { warehouseId, products: batchProducts } = batchData;

    const whereClause: Prisma.InventoryWhereInput = {
      AND: {
        warehouseId: warehouseId,
        productId: { in: batchProducts.map((product) => product.productId) },
        location: {
          availableForSale: {
            equals: true
          }
        }
      }
    };

    // Fetch product inventory from all available for sale locations
    const availableForSaleProductInventory =
      await this.inventoryService.groupByInventoryProductsByWhere(
        whereClause,
        [Prisma.InventoryScalarFieldEnum.productId],
        { [Prisma.InventoryScalarFieldEnum.physicalQuantity]: true }
      );

    this.logger.log(
      `context: ${context}, message: availableForSaleProductInventory: ${JSON.stringify(
        availableForSaleProductInventory
      )}`
    );
    const productsByProductsId = convertIntoKeyValuePair(
      batchProducts,
      'productId'
    );
    let unAvailableProducts = [];
    const productIds = [];
    for (const product of availableForSaleProductInventory) {
      const avsQuantity = product._sum.physicalQuantity || 0;
      const productData = productsByProductsId[product.productId];
      const onBoardedQuantity = productData?.onBoardedQuantity || 0;
      if (onBoardedQuantity > avsQuantity) {
        unAvailableProducts.push({
          productId: product.productId,
          quantity: avsQuantity
        });
        productIds.push(String(product.productId));
      }
    }

    this.logger.log(
      `context: ${context}, message: unAvailableProducts: ${JSON.stringify(
        unAvailableProducts
      )}`
    );

    if (productIds.length > 0) {
      const products = await this.appSearchService.searchProductByIds(
        productIds
      );

      if (products.length > 0) {
        const productsData = convertIntoKeyValuePair(products, 'id');
        unAvailableProducts = unAvailableProducts.map(
          (product: Record<string, any>) => {
            if (productsData[product.productId]) {
              return {
                ...product,
                sku: productsData[product.productId].sku,
                name: productsData[product.productId].name
              };
            }
          }
        );
      }
    }

    this.logger.log(
      `context: ${context}, message: responseBody: ${JSON.stringify(
        unAvailableProducts
      )}`
    );
    return unAvailableProducts;
  }
  async fetchAvsStock(avsData: FetchAvsRequest) {
    const context = `${BatchService.name}.fetchAvsStock()`;
    this.logger.log(
      `context: ${context}, message: params: { body: ${JSON.stringify(avsData)}`
    );

    const { warehouseId, products } = avsData;

    const whereClause: Prisma.InventoryWhereInput = {
      AND: {
        warehouseId: warehouseId,
        productId: { in: products },
        location: {
          availableForSale: {
            equals: true
          }
        }
      }
    };

    // Fetch product inventory from all available for sale locations
    const availableForSaleProductInventory =
      await this.inventoryService.groupByInventoryProductsByWhere(
        whereClause,
        [Prisma.InventoryScalarFieldEnum.productId],
        { [Prisma.InventoryScalarFieldEnum.physicalQuantity]: true }
      );

    this.logger.log(
      `context: ${context}, message: availableForSaleProductInventory: ${JSON.stringify(
        availableForSaleProductInventory
      )}`
    );
    const avsProducts = availableForSaleProductInventory.map((product) => ({
      productId: product.productId,
      availableForSaleQuantity: product._sum.physicalQuantity
    }));
    return avsProducts;
  }
}

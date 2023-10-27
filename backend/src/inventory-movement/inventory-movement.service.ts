import { Injectable } from '@nestjs/common';
import { InventoryMovement, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { convertIntoKeyValuePair } from 'src/common';
import {
  InsertInventoryMovementDto,
  InsertInventoryMovementProductDto
} from './dto';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

@Injectable()
export class InventoryMovementService {
  constructor(private readonly prisma: PrismaService) {}

  async createInventoryMovement(
    inventoryMovementData: PartialBy<InsertInventoryMovementDto, 'createdById'>
  ): Promise<PrismaPromise<InventoryMovement>[]> {
    const inventoryMovement: PrismaPromise<InventoryMovement>[] = [];
    const commonInventoryMovementData: PartialBy<
      Omit<InsertInventoryMovementDto, 'products'>,
      'createdById'
    > = {
      locationId: inventoryMovementData.locationId,
      createdById: inventoryMovementData.createdById,
      movementType: inventoryMovementData.movementType,
      referenceId: Number(inventoryMovementData.referenceId),
      reason: inventoryMovementData.reason
    };

    const productsDataById = await this.fetchProductsInventory(
      inventoryMovementData.locationId,
      inventoryMovementData.products
    );

    inventoryMovementData.products.forEach(
      (product: InsertInventoryMovementProductDto) => {
        inventoryMovement.push(
          this.prisma.inventoryMovement.create({
            data: {
              ...commonInventoryMovementData,
              oldQuantity: Number(
                productsDataById[product.productId]?.physicalQuantity || 0
              ),
              quantity: product.physicalQuantity,
              newQuantity:
                Number(
                  productsDataById[product.productId]?.physicalQuantity || 0
                ) + product.physicalQuantity,
              productId: product.productId
            }
          })
        );
      }
    );
    return inventoryMovement;
  }

  async createInventoryMovementForAdjustment(
    inventoryMovementData: PartialBy<InsertInventoryMovementDto, 'createdById'>
  ): Promise<PrismaPromise<InventoryMovement>[]> {
    const inventoryMovement: PrismaPromise<InventoryMovement>[] = [];
    const commonInventoryMovementData: PartialBy<
      Omit<InsertInventoryMovementDto, 'products'>,
      'createdById'
    > = {
      locationId: inventoryMovementData.locationId,
      createdById: inventoryMovementData.createdById,
      movementType: inventoryMovementData.movementType,
      referenceId: Number(inventoryMovementData.referenceId),
      reason: inventoryMovementData.reason
    };

    const productsDataById = await this.fetchProductsInventory(
      inventoryMovementData.locationId,
      inventoryMovementData.products
    );

    inventoryMovementData.products.forEach(
      (product: InsertInventoryMovementProductDto) => {
        const oldQuantity = Number(
          productsDataById[product.productId]?.physicalQuantity || 0
        );
        const quantity = product.physicalQuantity;
        const newQuantity =
          Number(productsDataById[product.productId]?.physicalQuantity || 0) +
          product.physicalQuantity;

        if (newQuantity === 0 && oldQuantity === 0) {
          return;
        } else {
          inventoryMovement.push(
            this.prisma.inventoryMovement.create({
              data: {
                ...commonInventoryMovementData,
                oldQuantity: oldQuantity,
                quantity: quantity,
                newQuantity: newQuantity,
                productId: product.productId
              }
            })
          );
        }
      }
    );
    return inventoryMovement;
  }

  async createInventoryMovementForInitialCountAdjustment(
    inventoryMovementData: PartialBy<InsertInventoryMovementDto, 'createdById'>
  ): Promise<PrismaPromise<InventoryMovement>[]> {
    const inventoryMovement: PrismaPromise<InventoryMovement>[] = [];
    const commonInventoryMovementData: PartialBy<
      Omit<InsertInventoryMovementDto, 'products'>,
      'createdById'
    > = {
      locationId: inventoryMovementData.locationId,
      createdById: inventoryMovementData.createdById,
      movementType: inventoryMovementData.movementType,
      referenceId: Number(inventoryMovementData.referenceId),
      reason: inventoryMovementData.reason
    };

    const productsDataById = await this.fetchProductsInventory(
      inventoryMovementData.locationId,
      inventoryMovementData.products
    );

    inventoryMovementData.products.forEach(
      (product: InsertInventoryMovementProductDto) => {
        inventoryMovement.push(
          this.prisma.inventoryMovement.create({
            data: {
              ...commonInventoryMovementData,
              oldQuantity:
                product.physicalQuantity > 0
                  ? 0
                  : Number(
                      productsDataById[product.productId]?.physicalQuantity || 0
                    ),
              quantity: product.physicalQuantity,
              newQuantity:
                product.physicalQuantity > 0
                  ? product.physicalQuantity
                  : Number(
                      productsDataById[product.productId]?.physicalQuantity || 0
                    ) + product.physicalQuantity,
              productId: product.productId
            }
          })
        );
      }
    );
    return inventoryMovement;
  }

  async fetchProductsInventory(
    locationId: number,
    products: InsertInventoryMovementProductDto[]
  ) {
    const productIds = products.map((product) => product.productId);

    const productsData = await this.prisma.inventory.findMany({
      where: {
        locationId,
        productId: { in: productIds }
      },
      select: {
        productId: true,
        physicalQuantity: true
      }
    });

    const productDataByIds = convertIntoKeyValuePair(productsData, 'productId');
    return productDataByIds;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { Country, POStatus, POType } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { PurchaseOrderService } from './purchase-order.service';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { UserModule } from '../user/user.module';
import { VendorModule } from '../vendor/vendor.module';
import { FileuploadModule } from '../fileupload/fileupload.module';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { MonolithService } from 'src/monolith/monolith.service';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { PURCHASEORDERS } from 'src/common/constants';
import { EventModule } from 'src/event/event.module';
import { RedisService } from 'src/redis/redis.service';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let redisService: RedisService;

  const mockMonolithService = {
    GetBusinessUnitById: jest.fn((businessUnitId) => businessUnitId),
    GetLocationById: jest.fn((warehouseId) => warehouseId)
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OpensearchModule,
        UserModule,
        VendorModule,
        FileuploadModule,
        ReceiptModule,
        AppsearchModule,
        PrismaModule,
        EventModule
      ],
      providers: [
        PurchaseOrderService,
        {
          provide: MonolithService,
          useValue: mockMonolithService
        }
      ]
    }).compile();

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
    redisService = module.get<RedisService>(RedisService);
    const opensearchService = module.get<OpensearchService>(OpensearchService);
    await opensearchService.createIndex(PURCHASEORDERS);
  });

  afterAll(async () => {
    redisService.redis.disconnect();
    await redisService.redlock.quit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  let createdPurchaseOrder: any;
  const requestPayload = {
    country: Country.PAK,
    businessUnitId: 4,
    warehouseId: 13,
    purchaserId: 1,
    vendorId: 1,
    subTotalWithoutTax: 800.0,
    totalTaxAmount: 200.0,
    totalWithTax: 1000.0,
    payment: '',
    paymentDays: '',
    status: POStatus.IN_REVIEW,
    type: POType.STANDARD,
    products: [
      {
        productId: 1,
        sku: 'OS-0001',
        name: 'Milkpak',
        taxAmount: 7.5,
        subTotalWithoutTax: 345.0,
        subTotalWithTax: 400.0,
        quantity: 5,
        price: 100
      },
      {
        productId: 2,
        sku: 'OS-0002',
        name: 'Milkpak',
        taxAmount: 7.5,
        subTotalWithoutTax: 345.0,
        subTotalWithTax: 400.0,
        quantity: 5,
        price: 100
      }
    ]
  };
  describe('PurchaseOrder Creation', () => {
    it('creates a new purchase order', async () => {
      createdPurchaseOrder = await service.createPurchaseOrder(
        requestPayload as any
      );
      expect(createdPurchaseOrder.id).toBeDefined();
      createdPurchaseOrder.subTotalWithoutTax = Number(
        createdPurchaseOrder.subTotalWithoutTax
      ) as any;
      createdPurchaseOrder.totalTaxAmount = Number(
        createdPurchaseOrder.totalTaxAmount
      ) as any;
      createdPurchaseOrder.totalWithTax = Number(
        createdPurchaseOrder.totalWithTax
      ) as any;
      createdPurchaseOrder.products.forEach((product: any) => {
        product.subTotalWithoutTax = Number(product.subTotalWithoutTax);
        product.subTotalWithTax = Number(product.subTotalWithTax);
        product.taxAmount = Number(product.taxAmount);
        product.price = Number(product.price);
      });
      expect(createdPurchaseOrder).toMatchObject(requestPayload);
    });
  });

  describe('PurchaseOrder Retrieval', () => {
    it('get a purchase order by id', async () => {
      const { purchaseOrder } = await service.getPurchaseOrder(
        createdPurchaseOrder.id
      );
      expect(purchaseOrder?.id).toEqual(createdPurchaseOrder.id);
    });

    it('get all purchase orders by Country', async () => {
      const { purchaseorders: purchaseOrder } =
        await service.searchPurchaseOrder({
          skip: 0,
          take: 10,
          country: Country.PAK
        } as any);
      expect(purchaseOrder[0].country).toEqual(requestPayload.country);
    });
  });

  describe('PurchaseOrder Updation', () => {
    it('update a purchase order by id', async () => {
      const userId = 1;
      const updatedPaylod = {
        ...requestPayload,
        businessUnitId: 2,
        products: []
      };
      const purchaseOrder = await service.updatePurchaseOrder(
        createdPurchaseOrder.id,
        updatedPaylod,
        userId
      );
      expect(purchaseOrder.businessUnitId).toEqual(
        updatedPaylod.businessUnitId
      );
    });
  });
});

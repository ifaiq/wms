import { Test, TestingModule } from '@nestjs/testing';
import {
  Adjustment,
  AdjustmentStatus,
  Country,
  POStatus,
  POType,
  PurchaseOrder,
  Receipt,
  ReceiptStatus,
  ReturnReceipt,
  Vendor,
  VendorStatus,
  VendorType
} from '@prisma/client';
import { AdjustmentModule } from 'src/adjustment/adjustment.module';
import { AdjustmentService } from 'src/adjustment/adjustment.service';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { PURCHASEORDERS, TRANSFERS, VENDORS } from 'src/common/constants';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { OpensearchService } from 'src/opensearch/opensearch.service';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
import { UpdateReceiptProduct } from 'src/receipt/dto';
import { UpdateReceipt } from 'src/receipt/dto/request.dto';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { ReceiptService } from 'src/receipt/receipt.service';
import { RedisService } from 'src/redis/redis.service';
import { UserModule } from 'src/user/user.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { VendorService } from 'src/vendor/vendor.service';

describe('OpenSearch', () => {
  let service: OpensearchService;
  let purchaseOrderService: PurchaseOrderService;
  let vendorService: VendorService;
  let adjustmentService: AdjustmentService;
  let module: TestingModule;
  let purchaseOrder: PurchaseOrder;
  let receiptService: ReceiptService;
  let redisService: RedisService;
  const userId = 1;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        PurchaseOrderModule,
        UserModule,
        VendorModule,
        FileuploadModule,
        ReceiptModule,
        MonolithModule,
        AppsearchModule,
        AdjustmentModule
      ],
      providers: [OpensearchService]
    }).compile();

    service = module.get<OpensearchService>(OpensearchService);
    purchaseOrderService =
      module.get<PurchaseOrderService>(PurchaseOrderService);
    vendorService = module.get<VendorService>(VendorService);
    adjustmentService = module.get<AdjustmentService>(AdjustmentService);
    receiptService = module.get<ReceiptService>(ReceiptService);
    redisService = module.get<RedisService>(RedisService);
    await service.createIndex(PURCHASEORDERS);
    await service.createIndex(VENDORS);
    await service.createIndex(TRANSFERS);
    await module.init();
  });

  afterAll(async () => {
    redisService.redis.disconnect();
    await redisService.redlock.quit();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(purchaseOrderService).toBeDefined();
    expect(vendorService).toBeDefined();
    expect(adjustmentService).toBeDefined();
    expect(receiptService).toBeDefined();
  });

  describe('Purchase Order with Open Search', () => {
    const requestPayload = {
      country: Country.PAK,
      businessUnitId: 4,
      warehouseId: 13,
      purchaserId: userId,
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
          price: 100,
          mrp: 100
        },
        {
          productId: 2,
          sku: 'OS-0002',
          name: 'Milkpak',
          taxAmount: 7.5,
          subTotalWithoutTax: 345.0,
          subTotalWithTax: 400.0,
          quantity: 5,
          price: 100,
          mrp: 100
        }
      ]
    };

    it('index should be defined', () => {
      const index = service.createIndex(PURCHASEORDERS);
      expect(index).toBeTruthy();
    });

    it('a new created purchase order should also be created in Open Search', async () => {
      purchaseOrder = await purchaseOrderService.createPurchaseOrder(
        requestPayload
      );
      const idLength = purchaseOrder.id.toString().length;
      const id = ['P' + '0'.repeat(5 - idLength) + purchaseOrder.id.toString()];
      const { purchaseorders } = await service.searchPurchaseOrders(
        {},
        { id, take: 1, skip: 0 },
        {},
        {},
        PURCHASEORDERS
      );
      expect(purchaseOrder.id).toEqual(purchaseorders[0].id);
    });

    it('updated purchase order should also be updated in Open Search', async () => {
      requestPayload.paymentDays = '30';
      const updatedPurchaseOrder =
        await purchaseOrderService.updatePurchaseOrder(
          purchaseOrder.id,
          requestPayload,
          userId
        );
      const { purchaseorders } = await service.searchPurchaseOrders(
        {},
        { take: 1, skip: 0 },
        {},
        {},
        PURCHASEORDERS
      );
      expect(updatedPurchaseOrder.paymentDays).toEqual(
        purchaseorders[0].paymentDays
      );
    });

    it('search Purchase Order by Id', async () => {
      const idLength = purchaseOrder.id.toString().length;
      const id = ['P' + '0'.repeat(5 - idLength) + purchaseOrder.id.toString()];
      const { purchaseorders } = await service.searchPurchaseOrders(
        {},
        { id, take: 1, skip: 0 },
        {},
        {},
        PURCHASEORDERS
      );
      expect(purchaseOrder.id).toEqual(purchaseorders[0].id);
    });

    it('filter Purchase Orders by Date', async () => {
      const date = `${purchaseOrder.createdAt.getFullYear()}-${
        purchaseOrder.createdAt.getMonth() + 1
      }-${purchaseOrder.createdAt.getDate()}`;
      const { purchaseorders } = await service.searchPurchaseOrders(
        {},
        { take: 1, skip: 0 },
        {},
        { date },
        PURCHASEORDERS
      );
      expect(purchaseorders.length).toBeGreaterThan(0);
    });

    it('filter Purchase Order by Country,City,Warehouse and Status', async () => {
      const status = purchaseOrder.status;
      const country = purchaseOrder.country;
      const businessUnitId = purchaseOrder.businessUnitId;
      const warehouseId = purchaseOrder.warehouseId;
      const { purchaseorders } = await service.searchPurchaseOrders(
        { status, country, businessUnitId, warehouseId },
        { take: 1, skip: 0 },
        {},
        {},
        PURCHASEORDERS
      );
      expect(purchaseorders[0].status).toEqual(status);
      expect(purchaseorders[0].country).toEqual(country);
      expect(purchaseorders[0].businessUnitId).toEqual(businessUnitId);
      expect(purchaseorders[0].warehouseId).toEqual(warehouseId);
    });

    it('search Purchase Order by Vendor,Products and Purchaser - (Nested Search)', async () => {
      const idLength = purchaseOrder.id.toString().length;
      const id = ['P' + '0'.repeat(5 - idLength) + purchaseOrder.id.toString()];
      const purchaseOrderfromDb = await purchaseOrderService.getPurchaseOrder(
        purchaseOrder.id
      );
      const vendorName = [purchaseOrderfromDb.purchaseOrder.vendor.name];
      const products = purchaseOrderfromDb.purchaseOrder.products.map(
        (product: { name: any }) => product.name
      );
      const purchaserName = [purchaseOrderfromDb.purchaseOrder.purchaser.name];
      const { purchaseorders } = await service.searchPurchaseOrders(
        {},
        {
          id,
          take: 1,
          skip: 0
        },
        { vendor: vendorName, products, purchaser: purchaserName },
        {},
        PURCHASEORDERS
      );
      expect(vendorName[0]).toEqual(purchaseorders[0].vendor.name);
      expect(purchaserName[0]).toEqual(purchaseorders[0].purchaser.name);
      expect(products).toContain(purchaseorders[0].products[0].name);
    });

    it('updated purchase order should also be updated in Open Search - (Status Change)', async () => {
      const updatedPurchaseOrder =
        //Creates a new receipt on PO confirmation
        await purchaseOrderService.updatePurchaseOrderStatus(
          purchaseOrder.purchaserId,
          purchaseOrder.id,
          { status: POStatus.LOCKED }
        );
      const { purchaseorders } = await service.searchPurchaseOrders(
        {},
        { take: 1, skip: 0 },
        {},
        {},
        PURCHASEORDERS
      );
      expect(updatedPurchaseOrder.status).toEqual(purchaseorders[0].status);
    });
  });

  describe('Vendor with Open Search', () => {
    let createdVendor: Vendor;
    const userId = 1;
    const requestPayload = {
      name: 'opensearch Vendor',
      type: VendorType.INDIVIDUAL,
      country: Country.PAK,
      taxID: '123',
      company: 'test1',
      address: 'address1',
      phone: '5555555555',
      email: 'test1@test.com',
      jobPosition: 'Manager',
      crNumber: '1',
      bankAccounts: [
        {
          bank: 'ALI HUSSAIN RAJABALI (BROKERS)',
          accountNumber: '111112107'
        }
      ],
      strn: ''
    };

    afterAll(async () => {
      await vendorService.deleteVendor(createdVendor.id);
    });

    it('index should be defined', () => {
      const index = service.createIndex(VENDORS);
      expect(index).toBeTruthy();
    });

    it('a new created vendor should also be created in Open Search', async () => {
      createdVendor = await vendorService.createVendor(requestPayload);
      const { vendors } = await service.searchVendors(
        {},
        { name: [createdVendor.name], take: 1, skip: 0 },
        VENDORS
      );
      expect(createdVendor.id).toEqual(vendors[0].id);
    });

    it('updated vendor should also be updated in Open Search', async () => {
      requestPayload.crNumber = '03121234594';
      const { vendor: updatedVendor } = await vendorService.updateVendor(
        userId,
        createdVendor.id,
        requestPayload,
        false
      );
      const { vendors } = await service.searchVendors(
        {},
        { name: [updatedVendor.name], take: 1, skip: 0 },
        VENDORS
      );
      expect(updatedVendor.crNumber).toEqual(vendors[0].crNumber);
    });

    it('filter vendors by Date', async () => {
      const date = `${createdVendor.createdAt.getFullYear()}-${
        createdVendor.createdAt.getMonth() + 1
      }-${createdVendor.createdAt.getDate()}`;
      const { vendors } = await service.searchPurchaseOrders(
        {},
        { take: 1, skip: 0 },
        {},
        { date },
        VENDORS
      );
      expect(vendors.length).toBeGreaterThan(0);
    });

    it('filter Vendors by TaxId, Phone, Email and Status', async () => {
      const taxID = [createdVendor.taxID];
      const phone = [createdVendor.phone];
      const email = [createdVendor.email];
      const status = [createdVendor.status];
      const { vendors } = await service.searchVendors(
        {},
        { taxID, phone, email, status, take: 1, skip: 0 },
        VENDORS
      );
      expect(vendors[0].taxID).toEqual(taxID[0]);
      expect(vendors[0].phone).toEqual(phone[0]);
      expect(vendors[0].email).toEqual(email[0]);
      expect(vendors[0].status).toEqual(status[0]);
    });

    it('updated vendor should also be updated in Open Search - Status Change', async () => {
      requestPayload.crNumber = '03121234594';
      const { vendor: updatedVendor } = await vendorService.changeVendorStatus(
        userId,
        createdVendor.id,
        VendorStatus.LOCKED
      );
      const { vendors } = await service.searchVendors(
        {},
        { name: [updatedVendor.name], take: 1, skip: 0 },
        VENDORS
      );
      expect(updatedVendor.status).toEqual(vendors[0].status);
    });
  });

  describe('Transfers with Open Search', () => {
    let receipt: any;

    it('index should be defined', () => {
      const index = service.createIndex(TRANSFERS);
      expect(index).toBeTruthy();
    });

    describe('Receipts Test Cases', () => {
      let backOrder: Receipt;
      it('a new receipt should also be created in Open Search', async () => {
        receipt = await receiptService.fetchDataFromReceipt({
          poId: purchaseOrder.id
        });
        const idLength = receipt.id.toString().length;
        const id = ['IN/' + '0'.repeat(5 - idLength) + receipt.id.toString()];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(receipt.id).toEqual(transfers[0].id);
      });

      it('Updated receipt should also be updated in Open Search - Status Change for 1st Receipt', async () => {
        const updatedProduct: UpdateReceiptProduct[] = [
          {
            productId: 1,
            quantityReceived: 3,
            expiry: null
          }
        ];

        const receiptData: UpdateReceipt = {
          locationId: 1,
          products: updatedProduct,
          invoices: []
        };

        //Reducing the product quantity so that a backorder can be created in the next test case
        await receiptService.updateReceipt(receipt.id, receiptData, userId);

        receipt = await receiptService.fetchDataFromReceipt({
          poId: purchaseOrder.id
        });
        const idLength = receipt.id.toString().length;
        const id = ['IN/' + '0'.repeat(5 - idLength) + receipt.id.toString()];

        const updatedReceipt = await receiptService.updateReceiptStatus(
          receipt.id,
          { status: ReceiptStatus.DONE, createBackOrder: false },
          userId
        );

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );

        const { purchaseOrder: updatedPurchaseOrder } =
          await purchaseOrderService.getPurchaseOrder(purchaseOrder.id);
        expect(updatedReceipt.status).toEqual(transfers[0].status);
        expect(updatedReceipt.confirmedAt).not.toBeNull();
        expect(updatedPurchaseOrder.confirmedAt).not.toBeNull();
      });

      it('BackOrder should be added in Opensearch', async () => {
        backOrder = await receiptService.createBackOrder(
          receipt.id,
          purchaseOrder.purchaserId
        );
        const idLength = backOrder.id.toString().length;
        const id = ['IN/' + '0'.repeat(5 - idLength) + backOrder.id.toString()];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(transfers[0].id).toEqual(backOrder.id);
      });

      it('Updated receipt should also be updated in Open Search - Status Change for 2nd Receipt and onwards', async () => {
        const receipt = await receiptService.getReceiptById(backOrder.id);
        const idLength = receipt.id.toString().length;
        const id = ['IN/' + '0'.repeat(5 - idLength) + receipt.id.toString()];

        const receiptData: UpdateReceipt = {
          locationId: 1,
          products: receipt.products,
          invoices: []
        };

        //Reducing the product quantity so that a backorder can be created in the next test case
        await receiptService.updateReceipt(receipt.id, receiptData, userId);

        const updatedReceipt = await receiptService.updateReceiptStatus(
          receipt.id,
          { status: ReceiptStatus.DONE, createBackOrder: false },
          userId
        );

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(updatedReceipt.status).toEqual(transfers[0].status);
      });
    });

    describe('Return Receipts Test Cases', () => {
      let returnReceipt: ReturnReceipt;
      it('a new return receipt should also be created in Open Search', async () => {
        returnReceipt = await receiptService.createReturn(
          receipt.id,
          purchaseOrder.purchaserId
        );
        const idLength = returnReceipt.id.toString().length;
        const id = [
          'OUT/' + '0'.repeat(5 - idLength) + returnReceipt.id.toString()
        ];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(returnReceipt.id).toEqual(transfers[0].id);
      });

      it('Updated return receipt should also be updated in Open Search', async () => {
        const updatedData = {
          products: [
            {
              productId: 1,
              quantityReturned: 1
            },
            {
              productId: 2,
              quantityReturned: 1
            }
          ],
          reasonId: 3,
          locationId: 1,
          invoices: [] as any
        };

        await receiptService.updateReturnReceipt(
          returnReceipt.id,
          updatedData,
          userId
        );
        const idLength = returnReceipt.id.toString().length;
        const id = [
          'OUT/' + '0'.repeat(5 - idLength) + returnReceipt.id.toString()
        ];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(transfers[0].products).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              productId: 1,
              quantityReturned: 1
            }),
            expect.objectContaining({
              productId: 2,
              quantityReturned: 1
            })
          ])
        );
      });

      it('Updated return receipt should also be updated in Open Search - Status Change', async () => {
        await receiptService.updateReturnReceiptStatus(
          returnReceipt.id,
          {
            status: ReceiptStatus.CANCELLED
          },
          userId
        );
        const idLength = returnReceipt.id.toString().length;
        const id = [
          'OUT/' + '0'.repeat(5 - idLength) + returnReceipt.id.toString()
        ];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(ReceiptStatus.CANCELLED).toEqual(transfers[0].status);
      });
    });

    describe('Adjustment Test Cases', () => {
      let adjustment: Adjustment;
      const adjustmentData = {
        country: Country.PAK,
        businessUnitId: 4,
        warehouseId: 13,
        createdById: 1,
        reasonId: 1,
        status: AdjustmentStatus.READY,
        products: [
          {
            productId: 60161,
            actualQuantity: 1,
            differenceQuantity: 5,
            sku: '044-020-00076',
            name: 'Veet Cream Normal 25gm x1'
          }
        ],
        locationId: 1,
        postingPeriod: null
      };
      it('a new adjustment should also be created in Open Search', async () => {
        const createdAdjustment = await adjustmentService.createAdjustment(
          adjustmentData
        );
        adjustment = createdAdjustment?.adjustment as Adjustment;
        const idLength = adjustment.id.toString().length;
        const id = ['A' + '0'.repeat(5 - idLength) + adjustment.id.toString()];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(adjustment?.id).toEqual(transfers[0].id);
      });

      it('Updated adjustment should also be updated in Open Search', async () => {
        adjustmentData.products = [
          {
            productId: 59639,
            actualQuantity: 122,
            differenceQuantity: 5,
            sku: '044-010-00004',
            name: 'Nayab 2.5 Chakki Atta 50Kg X1'
          }
        ];
        await adjustmentService.updateAdjustment(
          adjustment?.id,
          adjustmentData,
          userId
        );
        const idLength = adjustment.id.toString().length;
        const id = ['A' + '0'.repeat(5 - idLength) + adjustment.id.toString()];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(transfers[0].products).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              productId: 59639,
              sku: '044-010-00004'
            })
          ])
        );
      });

      it('Updated adjustment should also be updated in Open Search - Status change', async () => {
        await adjustmentService.updateAdjustmentStatus(
          adjustment?.id,
          {
            status: AdjustmentStatus.DONE
          },
          userId
        );
        const idLength = adjustment.id.toString().length;
        const id = ['A' + '0'.repeat(5 - idLength) + adjustment.id.toString()];

        const { transfers } = await service.searchTransfers(
          {},
          { id, take: 1, skip: 0 },
          {},
          {},
          TRANSFERS
        );
        expect(transfers[0].status).toEqual(AdjustmentStatus.DONE);
      });
    });

    it('filter Transfers by Country', async () => {
      const country = receipt.country;
      const { transfers } = await service.searchTransfers(
        { country },
        { take: 10, skip: 0 },
        {},
        {},
        TRANSFERS
      );
      expect(transfers.length).toBeGreaterThan(0);
    });

    it('filter Transfers by Date', async () => {
      const date = `${receipt.createdAt.getFullYear()}-${
        receipt.createdAt.getMonth() + 1
      }-${receipt.createdAt.getDate()}`;
      const { transfers } = await service.searchTransfers(
        {},
        { take: 10, skip: 0 },
        {},
        { date },
        TRANSFERS
      );
      expect(transfers.length).toBeGreaterThan(0);
    });

    it('filter Transfers by Country and Status', async () => {
      const country = receipt.country;
      const status = 'DONE';
      const { transfers } = await service.searchTransfers(
        { country, status },
        { take: 10, skip: 0 },
        {},
        {},
        TRANSFERS
      );
      expect(transfers.length).toBeGreaterThan(0);
    });

    it('search Transfers by SKU and name - Nested Search', async () => {
      const sku = [''];
      const name = ['Milkpak'];
      const { transfers } = await service.searchTransfers(
        {},
        { take: 10, skip: 0 },
        { name, sku },
        {},
        TRANSFERS
      );
      expect(transfers.length).toBeGreaterThan(0);
    });
  });
});

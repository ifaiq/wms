import { v4 as uuidv4 } from 'uuid';
import { InventoryRequest, RequestType } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryRequestService } from './inventory-request.service';
import { InventoryRequestModule } from './inventory-request.module';

describe('InventoryRequestService', () => {
  let service: InventoryRequestService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [InventoryRequestModule, PrismaModule],
      providers: [InventoryRequestService]
    }).compile();

    service = module.get<InventoryRequestService>(InventoryRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Inventory Request Service', () => {
    let createdInventoryRequest: InventoryRequest;
    const requestPayload = {
      type: RequestType.RECEIPT,
      referenceId: 7,
      requestBody: { params: { description: 'abc' } },
      responseBody: { success: true },
      idempotencyKey: uuidv4(),
      isSuccessful: true
    };
    it('creates a new inventory request', async () => {
      createdInventoryRequest = await service.createInventoryRequest(
        requestPayload
      );
      expect(createdInventoryRequest.id).toBeDefined();
      expect(createdInventoryRequest).toMatchObject(requestPayload);
    });
  });
});

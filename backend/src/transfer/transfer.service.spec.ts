import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from 'prisma/prisma.module';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { EventModule } from 'src/event/event.module';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { InventoryMovementModule } from 'src/inventory-movement/inventory-movement.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { LocationModule } from 'src/location/location.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { RedisService } from 'src/redis/redis.service';
import { UserModule } from 'src/user/user.module';
import { TransferService } from './transfer.service';

describe('TransferService', () => {
  let service: TransferService;
  let redisService: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PrismaModule,
        MonolithModule,
        OpensearchModule,
        EventModule,
        LocationModule,
        InventoryModule,
        AppsearchModule,
        FileuploadModule,
        UserModule,
        InventoryMovementModule
      ],
      providers: [TransferService]
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    service = module.get<TransferService>(TransferService);
  });

  afterAll(async () => {
    redisService.redis.disconnect();
    await redisService.redlock.quit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

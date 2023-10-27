import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/event/event.module';
import { RedisModule } from 'src/redis/redis.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryMovementModule } from 'src/inventory-movement/inventory-movement.module';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { LocationModule } from 'src/location/location.module';

@Module({
  imports: [
    PrismaModule,
    MonolithModule,
    OpensearchModule,
    UserModule,
    EventModule,
    RedisModule,
    InventoryModule,
    InventoryMovementModule,
    FileuploadModule,
    LocationModule
  ],
  providers: [ReceiptService],
  controllers: [ReceiptController],
  exports: [ReceiptService]
})
export class ReceiptModule {}

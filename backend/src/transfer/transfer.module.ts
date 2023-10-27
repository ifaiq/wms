import { Module } from '@nestjs/common';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { EventModule } from 'src/event/event.module';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { InventoryMovementModule } from 'src/inventory-movement/inventory-movement.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { LocationModule } from 'src/location/location.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { TransferBulkUploadService } from './transfer-bulk-upload.service';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';

@Module({
  imports: [
    MonolithModule,
    OpensearchModule,
    EventModule,
    LocationModule,
    InventoryModule,
    AppsearchModule,
    FileuploadModule,
    InventoryMovementModule,
    UserModule,
    RedisModule
  ],
  providers: [TransferService, TransferBulkUploadService],
  controllers: [TransferController],
  exports: [TransferService]
})
export class TransferModule {}

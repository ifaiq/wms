import { Module } from '@nestjs/common';
import { AdjustmentService } from './adjustment.service';
import { AdjustmentController } from './adjustment.controller';
import { MonolithModule } from 'src/monolith/monolith.module';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { UserModule } from 'src/user/user.module';
import { EventModule } from 'src/event/event.module';
import { RedisModule } from 'src/redis/redis.module';
import { LocationModule } from 'src/location/location.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryMovementModule } from 'src/inventory-movement/inventory-movement.module';
import { AdjustmentBulkUploadService } from './adjustment-bulk-upload.service';

@Module({
  imports: [
    MonolithModule,
    AppsearchModule,
    FileuploadModule,
    OpensearchModule,
    UserModule,
    EventModule,
    RedisModule,
    LocationModule,
    InventoryModule,
    InventoryMovementModule
  ],
  providers: [AdjustmentService, AdjustmentBulkUploadService],
  controllers: [AdjustmentController],
  exports: [AdjustmentService]
})
export class AdjustmentModule {}

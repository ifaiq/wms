import { Module } from '@nestjs/common';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  imports: [InventoryModule, AppsearchModule],
  providers: [BatchService],
  controllers: [BatchController],
  exports: [BatchService]
})
export class BatchModule {}

import { Module } from '@nestjs/common';
import { InventoryRequestService } from './inventory-request.service';

@Module({
  providers: [InventoryRequestService],
  exports: [InventoryRequestService]
})
export class InventoryRequestModule {}

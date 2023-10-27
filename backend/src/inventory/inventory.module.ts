import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { InventoryMovementModule } from 'src/inventory-movement/inventory-movement.module';
import { InventoryService } from './inventory.service';

@Module({
  providers: [InventoryService],
  exports: [InventoryService],
  imports: [PrismaModule, InventoryMovementModule]
})
export class InventoryModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { InventoryMovementService } from './inventory-movement.service';

@Module({
  providers: [InventoryMovementService],
  exports: [InventoryMovementService],
  imports: [PrismaModule]
})
export class InventoryMovementModule {}

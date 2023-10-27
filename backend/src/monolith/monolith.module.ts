import { Module } from '@nestjs/common';
import { MonolithService } from './monolith.service';
import { HttpModule } from '@nestjs/axios';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { MonolithController } from './monolith.controller';
import { InventoryRequestModule } from '../inventory-request/inventory-request.module';
import { SqsModule } from 'src/sqs/sqs.module';

@Module({
  imports: [HttpModule, OpensearchModule, InventoryRequestModule, SqsModule],
  providers: [MonolithService],
  exports: [MonolithService],
  controllers: [MonolithController]
})
export class MonolithModule {}

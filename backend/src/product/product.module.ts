import { Module } from '@nestjs/common';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [OpensearchModule, MonolithModule, AppsearchModule, InventoryModule],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule {}

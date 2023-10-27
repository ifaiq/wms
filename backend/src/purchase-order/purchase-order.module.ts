import { Module } from '@nestjs/common';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { BulkUploadService } from './bulk-upload.service';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { UserModule } from 'src/user/user.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [
    OpensearchModule,
    UserModule,
    VendorModule,
    FileuploadModule,
    ReceiptModule,
    MonolithModule,
    AppsearchModule,
    EventModule
  ],
  providers: [PurchaseOrderService, BulkUploadService],
  controllers: [PurchaseOrderController],
  exports: [PurchaseOrderService, BulkUploadService]
})
export class PurchaseOrderModule {}

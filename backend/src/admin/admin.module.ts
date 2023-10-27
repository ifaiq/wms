import { Module } from '@nestjs/common';
import { AdjustmentModule } from 'src/adjustment/adjustment.module';
import { EventModule } from 'src/event/event.module';
import { FileuploadModule } from 'src/fileupload/fileupload.module';
import { LocationModule } from 'src/location/location.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { ReceiptModule } from 'src/receipt/receipt.module';
import { TransferModule } from 'src/transfer/transfer.module';
import { UserModule } from 'src/user/user.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    VendorModule,
    PurchaseOrderModule,
    UserModule,
    ReceiptModule,
    AdjustmentModule,
    OpensearchModule,
    FileuploadModule,
    EventModule,
    LocationModule,
    TransferModule
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { MonolithModule } from '../monolith/monolith.module';
import { EventModule } from '../event/event.module';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { FileuploadModule } from '../fileupload/fileupload.module';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MonolithModule,
    EventModule,
    OpensearchModule,
    FileuploadModule,
    UserModule
  ],
  providers: [VendorService],
  controllers: [VendorController],
  exports: [VendorService]
})
export class VendorModule {}

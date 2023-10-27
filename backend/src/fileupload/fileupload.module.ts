import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { AppsearchModule } from 'src/appsearch/appsearch.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { MonolithModule } from '../monolith/monolith.module';
import { FileuploadService } from './fileupload.service';
import { S3Service } from './S3.service';
@Module({
  imports: [MulterModule, MonolithModule, AppsearchModule, InventoryModule],
  providers: [FileuploadService, S3Service],
  exports: [FileuploadService]
})
export class FileuploadModule {}

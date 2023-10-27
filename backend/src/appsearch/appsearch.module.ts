import { Module } from '@nestjs/common';
import { AppsearchService } from './appsearch.service';

@Module({
  providers: [AppsearchService],
  exports: [AppsearchService]
})
export class AppsearchModule {}

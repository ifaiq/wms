import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { MonolithModule } from 'src/monolith/monolith.module';
@Module({
  imports: [MonolithModule],
  controllers: [CommonController]
})
export class CommonModule {}

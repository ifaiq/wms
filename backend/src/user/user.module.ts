import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { EventModule } from '../event/event.module';
import { UserService } from './user.service';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
@Module({
  imports: [EventModule, OpensearchModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}

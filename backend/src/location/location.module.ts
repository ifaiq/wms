import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { EventModule } from 'src/event/event.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { MonolithModule } from 'src/monolith/monolith.module';
import { OpensearchModule } from 'src/opensearch/opensearch.module';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    EventModule,
    OpensearchModule,
    MonolithModule,
    RedisModule,
    InventoryModule
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService]
})
export class LocationModule {}

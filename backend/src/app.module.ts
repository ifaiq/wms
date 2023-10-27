import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'prisma/prisma.module';
import { VendorModule } from './vendor/vendor.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { MonolithModule } from './monolith/monolith.module';
import { EventModule } from './event/event.module';
import { OpensearchModule } from './opensearch/opensearch.module';
import { ProductModule } from './product/product.module';
import { FileuploadModule } from './fileupload/fileupload.module';
import { S3Service } from './fileupload/S3.service';
import { MulterModule } from '@nestjs/platform-express';
import { ReceiptModule } from './receipt/receipt.module';
import { AppsearchModule } from './appsearch/appsearch.module';
import { AdminModule } from './admin/admin.module';
import { AdjustmentModule } from './adjustment/adjustment.module';
import { TransferModule } from './transfer/transfer.module';
import { LoggerMiddleware } from './logger.middleware';
import { LocationModule } from './location/location.module';
import { InventoryModule } from './inventory/inventory.module';
import { SqsModule } from './sqs/sqs.module';
import { InventoryMovementModule } from './inventory-movement/inventory-movement.module';
import { BatchModule } from './batch/batch.module';
import { SentryModule } from './sentry/sentry.module';
import * as Sentry from '@sentry/node';
import * as SentryTracing from '@sentry/tracing';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    VendorModule,
    HttpModule,
    MonolithModule,
    PurchaseOrderModule,
    EventModule,
    MulterModule,
    OpensearchModule,
    ProductModule,
    FileuploadModule,
    ReceiptModule,
    AppsearchModule,
    AdminModule,
    AdjustmentModule,
    TransferModule,
    AdjustmentModule,
    LocationModule,
    InventoryModule,
    SqsModule,
    InventoryMovementModule,
    BatchModule,
    InvoiceModule,
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.01,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new SentryTracing.Integrations.Mysql()
      ]
    })
  ],
  controllers: [AppController],
  providers: [AppService, S3Service]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { Consumer } from 'sqs-consumer';
import * as AWS from 'aws-sdk';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryService } from 'src/inventory/inventory.service';
import { SqsService } from './sqs.service';

@Module({
  imports: [InventoryModule],
  controllers: [],
  providers: [SqsService],
  exports: [SqsService]
})
export class SqsModule implements OnApplicationBootstrap {
  constructor(private readonly inventoryService: InventoryService) {}

  async onApplicationBootstrap() {
    const app = Consumer.create({
      queueUrl: `${process.env.AWS_SQS_HOST}${process.env.AWS_ACCOUNT_ID}/${process.env.MONOLITH_TO_STOCKFLO_PRODUCT_INVENTORY_SYNC_QUEUE_NAME}`,
      handleMessage: async (message: AWS.SQS.Message) => {
        const payload = JSON.parse(message.Body as string);
        await this.inventoryService.inventorySyncSqsHandler(payload);
      },
      sqs: new AWS.SQS()
    });

    app.on('error', (err: any) => {
      console.log('Error while reading a message', err);
    });

    app.on('processing_error', (err: any) => {
      console.log('Processing error while reading a message', err);
    });

    app.on('timeout_error', (err: any) => {
      console.log('Timeout error while reading a message', err);
    });

    if (process.env.ALLOW_SQS_CONSUMER_CREATION != 'false') {
      app.start();
    }
  }
}

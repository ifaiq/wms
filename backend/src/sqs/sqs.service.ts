import { Injectable, Logger } from '@nestjs/common';
import { SQS } from 'aws-sdk';
import { ISQSMessage } from './interface';

@Injectable()
export class SqsService {
  private _SQS;
  private readonly logger = new Logger(SqsService.name);
  public constructor() {
    this._SQS = new SQS();
  }

  createMessage = async (message: ISQSMessage, logIdentifier: string) => {
    this._SQS.sendMessage(message, (err, data) => {
      if (err) {
        this.logger.log(
          `${logIdentifier} Error while sending message: ${JSON.stringify(err)}`
        );
      } else {
        this.logger.log(
          `${logIdentifier} Successfully added message messageID: ${
            data.MessageId
          } message: ${JSON.stringify(data)}`
        );
      }
    });
  };
}

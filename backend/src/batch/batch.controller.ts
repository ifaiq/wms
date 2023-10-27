import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { externalAuth } from 'src/auth/guards/external-auth.guard';
import { BatchService } from './batch.service';
import { VerifyBatchRequest } from './dto';
import { FetchAvsRequest } from './dto';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @UseGuards(externalAuth)
  @Post('/validate-avs-stock')
  async verifyBatch(@Body() batchData: VerifyBatchRequest) {
    return await this.batchService.validateAvsStock(batchData);
  }
  @UseGuards(externalAuth)
  @Post('/fetch-avs-stock')
  async fetchAvs(@Body() fetchData: FetchAvsRequest) {
    return await this.batchService.fetchAvsStock(fetchData);
  }
}

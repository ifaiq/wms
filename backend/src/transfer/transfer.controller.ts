import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { JwtAuthGuard, PermissionAuthGuard } from 'src/auth/guards';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MODULES_NAME } from 'src/common/constants';
import { SearchTransferDto } from './dto';
import {
  CreateTransferRequest,
  TransferFormDto,
  TransferRequest,
  TransferStatusRequest
} from './dto/request.dto';
import { TransferService } from './transfer.service';
import { TransferBulkUploadService } from './transfer-bulk-upload.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE } from 'src/common/constants';
import { fileExtensionFilter } from 'src/fileupload/utils/helper';
import { Permission as Permissions } from '../common';
import { Permission } from 'src/auth/decorator';
import { redisLockTTL } from 'src/redis/constants';
import { RedisService } from 'src/redis/redis.service';

@ApiTags(MODULES_NAME.TRANSFER)
@ApiBearerAuth()
@Controller('transfer')
@UseGuards(JwtAuthGuard)
export class TransferController {
  constructor(
    private readonly transferService: TransferService,
    private readonly redisService: RedisService,
    private readonly bulkUploadTransferService: TransferBulkUploadService
  ) {}
  @Get('/search')
  async searchTransfers(@Query() reqParams: SearchTransferDto) {
    return await this.transferService.searchTransfers(reqParams);
  }

  @Get(':id')
  async getTransferById(@Param('id', ParseIntPipe) id: number) {
    const transfer = await this.transferService.getTransferById(id);
    if (transfer === null) {
      throw new NotFoundException('Transfer');
    }
    return transfer;
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CREATE_TRANSFER)
  @Post()
  async createTransfer(@Body() transferDto: CreateTransferRequest) {
    return await this.transferService.createTransfer(transferDto);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.EDIT_TRANSFER)
  @Put(':id')
  async updateTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() transfer: TransferRequest,
    @Req() req: Request
  ) {
    const user: any = req.user;
    return await this.transferService.updateTransfer(id, transfer, user.id);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CONFIRM_TRANSFER, Permissions.CANCEL_TRANSFER)
  @Put('/status/:id')
  async updateTransferStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() transfer: TransferStatusRequest,
    @Req() req: Request
  ) {
    const lockId = `updateTransferStatus:${id}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    try {
      const user: any = req.user;
      return await this.transferService.updateTransferStatus(
        id,
        transfer,
        user.id
      );
    } finally {
      await lock.release();
    }
  }

  @Post('bulk-upload/products')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExtensionFilter,
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadRFQFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: TransferFormDto
  ) {
    const { warehouseId, locationId } = body;

    return await this.transferService.insertProductsFromCSV(
      file,
      warehouseId,
      locationId.toString()
    );
  }

  @Post('bulk-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExtensionFilter,
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadBulkRFQ(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    const user: any = req.user;
    return await this.bulkUploadTransferService.insertTransfereInBulk(
      file,
      user.id
    );
  }
}

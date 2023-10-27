import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard, PermissionAuthGuard } from 'src/auth/guards';
import { Permission as Permissions } from '../common';
import {
  UpdateReceipt,
  UpdateReceiptStatusRequest,
  UpdateReturnReceiptRequest,
  UpdateReturnReceiptStatusRequest
} from './dto';
import { ReceiptService } from './receipt.service';
import { Permission } from 'src/auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MAX_FILE_SIZE, MODULES_NAME } from 'src/common/constants';
import { RedisService } from 'src/redis/redis.service';
import { redisLockTTL } from 'src/redis/constants';
import { FileuploadService } from 'src/fileupload/fileupload.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AttachmentRequest } from 'src/common/dto/file-upload.dto';
import { Prisma } from '@prisma/client';

const { Receipt: receiptModel, ReturnReceipt: returnReceiptModel } =
  Prisma.ModelName;

@ApiTags(MODULES_NAME.RECEIPT)
@ApiBearerAuth()
@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(
    private readonly receiptService: ReceiptService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileuploadService
  ) {}
  @Get(':id')
  async getReceipt(@Param('id', ParseIntPipe) id: number) {
    return await this.receiptService.getReceiptById(id);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.EDIT_GRN)
  @Put(':id')
  async updateReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateReceipt,
    @Req() req: Request
  ) {
    const lockId = `updateReceipt:${id}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    try {
      const user: any = req.user;
      return await this.receiptService.updateReceipt(id, data, user.id);
    } finally {
      await lock.release();
    }
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CONFIRM_GRN, Permissions.CANCEL_GRN)
  @Put(':id/status')
  async updateReceiptStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateReceiptStatusRequest,
    @Req() req: Request
  ) {
    const lockId = `updateReceipt:${id}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    try {
      const user: any = req.user;
      const { createBackOrder } = data;
      const updateReceiptStatusResult =
        await this.receiptService.updateReceiptStatus(id, data, user.id);
      if (createBackOrder) {
        await this.receiptService.createBackOrder(id, user.id);
      }
      return updateReceiptStatusResult;
    } finally {
      await lock.release();
    }
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CREATE_RETURN)
  @Post(':id/return')
  async createReturnReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ) {
    const user: any = req.user;
    return await this.receiptService.createReturn(id, user.id);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.EDIT_RETURN)
  @Put('return/:id')
  async updateReturnReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateReturnReceiptRequest,
    @Req() req: Request
  ) {
    const lockId = `updateReturnReceipt:${id}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    try {
      const user: any = req.user;
      return await this.receiptService.updateReturnReceipt(id, data, user.id);
    } finally {
      await lock.release();
    }
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CONFIRM_RETURN, Permissions.CANCEL_RETURN)
  @Put('return/:id/status')
  async updateReturnReceiptStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateReturnReceiptStatusRequest,
    @Req() req: Request
  ) {
    const lockId = `updateReturnReceipt:${id}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    try {
      const user: any = req.user;
      return await this.receiptService.updateReturnReceiptStatus(
        id,
        data,
        user.id
      );
    } finally {
      await lock.release();
    }
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CREATE_RETURN)
  @Post(':id/return-in')
  async createReturnInReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ) {
    const user: any = req.user;
    return await this.receiptService.createReturnIn(id, user.id);
  }

  @Get('return/:id')
  async getReturnReceipt(@Param('id', ParseIntPipe) id: number) {
    return await this.receiptService.getReturnReceiptById(id);
  }

  @Get('download/:id')
  async downloadReceiptById(@Param('id', ParseIntPipe) id: number) {
    return await this.receiptService.downloadReceipt(id);
  }

  @Get('download/return/:id')
  async downloadReturnById(@Param('id', ParseIntPipe) id: number) {
    return await this.receiptService.downloadReturn(id);
  }

  @Post('attach')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: AttachmentRequest,
    @Req() req: Request
  ) {
    const user: any = req.user;
    const id = body.id; // Receipt Order Id
    const file = files[0];

    const { updatedPayload, path } =
      await this.fileUploadService.uploadAttachment(file, id, receiptModel);

    if (updatedPayload) {
      await this.receiptService.updateReceiptAttachments(
        id,
        updatedPayload as any,
        user.id
      );
      return { path };
    }

    return { success: false };
  }

  @Delete(':id/detach/:field')
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('field') fieldName: string,
    @Req() req: Request
  ) {
    const user: any = req.user;

    const updatedPayload = await this.fileUploadService.deleteAttachment(
      fieldName,
      id,
      user.id,
      receiptModel
    );

    if (updatedPayload) {
      await this.receiptService.updateReceiptAttachments(
        id,
        updatedPayload as any,
        user.id
      );
      return { success: true };
    }

    return { success: false };
  }

  @Post('return/attach')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadReturnAttachment(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: AttachmentRequest,
    @Req() req: Request
  ) {
    const user: any = req.user;
    const id = body.id; // Receipt Order Id
    const file = files[0];

    const { updatedPayload, path } =
      await this.fileUploadService.uploadAttachment(
        file,
        id,
        returnReceiptModel
      );

    if (updatedPayload) {
      await this.receiptService.updateReturnReceiptAttachments(
        id,
        updatedPayload as any,
        user.id
      );
      return { path };
    }

    return { success: false };
  }

  @Delete(':id/return/:field/detach')
  async deleteReturnAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Param('field') fieldName: string,
    @Req() req: Request
  ) {
    const user: any = req.user;

    const updatedPayload = await this.fileUploadService.deleteAttachment(
      fieldName,
      id,
      user.id,
      returnReceiptModel
    );

    if (updatedPayload) {
      await this.receiptService.updateReturnReceiptAttachments(
        id,
        updatedPayload as any,
        user.id
      );
      return { success: true };
    }

    return { success: false };
  }
}

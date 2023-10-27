import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Logger,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Permission } from 'src/auth/decorator';
import { JwtAuthGuard, PermissionAuthGuard } from 'src/auth/guards';
import { Permission as Permissions } from '../common';
import { MAX_FILE_SIZE, MODULES_NAME } from 'src/common/constants';
import { AdjustmentFormDto } from 'src/fileupload/dto/adjustment.fileupload.dto';
import { fileExtensionFilter } from 'src/fileupload/utils/helper';
import { AdjustmentService } from './adjustment.service';
import {
  AdjustmentRequest,
  AdjustmentStatusRequest,
  CreateAdjustmentRequest
} from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { redisLockTTL } from 'src/redis/constants';
import { AdjustmentBulkUploadService } from './adjustment-bulk-upload.service';
import { ApiException } from 'src/errors/exceptions';
import { ErrorCodes } from 'src/errors/errors';

@ApiTags(MODULES_NAME.ADJUSTMENT)
@ApiBearerAuth()
@Controller('adjustment')
@UseGuards(JwtAuthGuard)
export class AdjustmentController {
  private readonly logger = new Logger(AdjustmentController.name);
  constructor(
    private readonly adjustmentService: AdjustmentService,
    private readonly redisService: RedisService,
    private readonly bulkUploadAdjustmentService: AdjustmentBulkUploadService
  ) {}

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CREATE_ADJUSTMENT)
  @Post()
  async createAdjustment(@Body() adjustmentDto: CreateAdjustmentRequest) {
    return await this.adjustmentService.createAdjustment(adjustmentDto);
  }

  @Get(':id')
  async getAdjustmentById(@Param('id', ParseIntPipe) id: number) {
    const adjustment = await this.adjustmentService.getAdjustmentById(id);
    if (adjustment === null) {
      throw new NotFoundException('Adjustment');
    }
    return adjustment;
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.EDIT_ADJUSTMENT)
  @Put(':id')
  async updateAdjustment(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustment: AdjustmentRequest,
    @Req() req: Request
  ) {
    const user: any = req.user;
    return await this.adjustmentService.updateAdjustment(
      id,
      adjustment,
      user.id
    );
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
    @Body() body: AdjustmentFormDto
  ) {
    try {
      const { warehouseId, subLocationId, reason } = body;

      return await this.adjustmentService.insertProductsFromCSV(
        file,
        warehouseId,
        reason,
        subLocationId
      );
    } catch (error: any) {
      this.logger.error(error.errorResponse);
      throw new ApiException(
        error.status || 500,
        error.errorResponse || {
          code: ErrorCodes.UNKNOWN,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: { reason: 'Something went wrong' }
        }
      );
    }
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CONFIRM_ADJUSTMENT, Permissions.CANCEL_ADJUSTMENT)
  @Put('/status/:id')
  async updateAdjustmentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustment: AdjustmentStatusRequest,
    @Req() req: Request
  ) {
    const lockId = `updateAdjustmentStatus:${id}`;
    const lock = await this.redisService.redlock.acquire(
      [lockId],
      redisLockTTL
    );
    try {
      const user: any = req.user;
      return await this.adjustmentService.updateAdjustmentStatus(
        id,
        adjustment,
        user.id
      );
    } finally {
      await lock.release();
    }
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
    return await this.bulkUploadAdjustmentService.insertAdjustmentInBulk(
      file,
      user.id
    );
  }
}

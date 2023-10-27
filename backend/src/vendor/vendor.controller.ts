import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Req
} from '@nestjs/common';

import { Prisma, Vendor, VendorStatus } from '@prisma/client';
import {
  VendorRequest,
  VendorResponse,
  FilterVendorsRequest,
  VendorSearchDto
} from './dto';
import { VendorService } from './vendor.service';
import { NotFoundException } from '../errors/exceptions';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE, MODULES_NAME } from '../common/constants';
import { FileuploadService } from '../fileupload/fileupload.service';
import { Request } from 'express';
import { AttachmentRequest } from '../common/dto/file-upload.dto';
import { PermissionAuthGuard } from 'src/auth/guards';
import { Permission as Permissions } from '../common';
import { Permission } from 'src/auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

const { Vendor: tableName } = Prisma.ModelName;
@ApiTags(MODULES_NAME.VENDOR)
@ApiBearerAuth()
@Controller('/vendors')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly fileUploadService: FileuploadService
  ) {}

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CREATE_VENDOR)
  @Post()
  async CreateVendor(@Body() VendorDto: VendorRequest): Promise<Vendor> {
    return await this.vendorService.createVendor(VendorDto);
  }

  @Get('/search')
  async searcVendors(
    @Query() reqParams: VendorSearchDto
  ): Promise<Vendor[] | null> {
    return await this.vendorService.searchVendor(reqParams);
  }

  @Get(':id')
  async getVendorById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<VendorResponse | null> {
    const vendor = await this.vendorService.getVendor(id);
    if (vendor === null) {
      throw new NotFoundException('Vendor');
    }
    return vendor;
  }

  @Get()
  async getVendorsByCriteria(
    @Query() reqParams: FilterVendorsRequest
  ): Promise<{
    vendors: VendorResponse[];
    total: number;
  }> {
    return await this.vendorService.getVendors(reqParams);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.EDIT_VENDOR)
  @Put(':id')
  async updateVendorById(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VendorRequest
  ): Promise<VendorResponse> {
    const user: any = req.user;
    const { vendor } = await this.vendorService.updateVendor(user.id, id, dto);
    return vendor;
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(
    Permissions.LOCK_UNLOCK_VENDOR,
    Permissions.STATUS_VENDOR,
    Permissions.CANCEL_VENDOR,
    Permissions.CONFIRM_VENDOR
  )
  @Put('/status/:id')
  async changeVendorStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VendorStatus
  ): Promise<VendorResponse> {
    const user: any = req.user;
    const { vendor } = await this.vendorService.changeVendorStatus(
      user.id,
      id,
      status
    );
    return vendor;
  }

  @Post('attach')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @Body() body: AttachmentRequest
  ) {
    const vendorId = body.id; //Vendor Id
    const user: any = req.user;
    const file = files[0]; // Always expecting a single file
    const { updatedPayload, path } =
      await this.fileUploadService.uploadAttachment(file, vendorId, tableName);
    if (updatedPayload) {
      await this.vendorService.updateVendor(
        user.id,
        vendorId,
        updatedPayload as any
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
      tableName
    );
    if (updatedPayload) {
      await this.vendorService.updateVendor(user.id, id, updatedPayload as any);
      return { success: true };
    }
    return { success: false };
  }
}

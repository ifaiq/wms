import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Permission } from 'src/auth/decorator';
import { JwtAuthGuard, PermissionAuthGuard, Public } from 'src/auth/guards';
import { MAX_FILE_SIZE, MODULES_NAME } from 'src/common/constants';
import { fileExtensionFilter } from 'src/fileupload/utils/helper';
import { Permission as Permissions } from '../common';
import { AdminService } from './admin.service';
import { FetchReason, ReasonRequest } from './dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags(MODULES_NAME.ADMIN)
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/refresh-index')
  async refreshOpenSearchIndex() {
    await this.adminService.refreshOpenSearchIndex();
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/refresh-index/vendor')
  async refreshVendorOpenSearchIndex() {
    await this.adminService.refreshVendorOpenSearchIndex();
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/refresh-index/purchase-order')
  async refreshPurchaseOrderOpenSearchIndex() {
    await this.adminService.refreshPurchaseOrderOpenSearchIndex();
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/refresh-index/user')
  async refreshUserServiceOpenSearchIndex() {
    await this.adminService.refreshUserServiceOpenSearchIndex();
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/refresh-index/location')
  async refreshLocationOpenSearchIndex() {
    await this.adminService.refreshLocationOpenSearchIndex();
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/refresh-index/inventory-movement')
  async refreshInventoryMovementOpenSearchIndex() {
    await this.adminService.refreshInventoryMovementOpenSearchIndex();
  }

  @Get('/health')
  @Public()
  async healthCheck() {
    await this.adminService.healthCheck();
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Post('/reason')
  async addReason(@Body() reqParams: ReasonRequest) {
    return await this.adminService.addReason(reqParams);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Put('/reason/:id')
  async updateReason(
    @Param('id', ParseIntPipe) id: number,
    @Body() reqParams: ReasonRequest,
    @Req() req: Request
  ) {
    const user: any = req.user;
    return await this.adminService.updateReason(id, reqParams, user.id);
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.USER_MANAGEMENT)
  @Delete('/reason/:id')
  async deleteReason(@Param('id', ParseIntPipe) id: number) {
    return await this.adminService.deleteReason(id);
  }

  @Get('/reason')
  async fetchReasonsByType(@Query() reqParams: FetchReason) {
    return await this.adminService.fetchReasonsByType(reqParams);
  }

  @Post('bulk-upload-vendors')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExtensionFilter,
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadRFQFile(@UploadedFile() file: Express.Multer.File) {
    return await this.adminService.bulkUploadVendors(file);
  }

  @Post('attach')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: MAX_FILE_SIZE }
    })
  )
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request
  ) {
    const file = files[0]; // Always expecting a single file
    const user: any = req.user;
    return await this.adminService.uploadAttachment(user.id, file);
  }
}

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
  UploadedFiles,
  UseGuards,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { Request } from 'express';
import { POStatus, Prisma, PurchaseOrder } from '@prisma/client';
import {
  CreatePurchaseOrderRequest,
  PurchaseOrderRequest,
  SearchPurchaseOrderDto
} from './dto';
import { PurchaseOrderService } from './purchase-order.service';
import { BulkUploadService } from './bulk-upload.service';
import { NotFoundException } from '../errors/exceptions';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MAX_FILE_SIZE, MODULES_NAME } from '../common/constants';
import { AttachmentRequest } from '../common/dto/file-upload.dto';
import { JwtAuthGuard, PermissionAuthGuard } from '../auth/guards';
import { FileuploadService } from '../fileupload/fileupload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileExtensionFilter } from '../fileupload/utils/helper';
import { RFQFormDto } from '../fileupload/dto/fileupload.dto';
import { Permission } from 'src/auth/decorator';
import { Permission as Permissions } from '../common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

const { PurchaseOrder: tableName } = Prisma.ModelName;

@ApiTags(MODULES_NAME.PURCHASE_ORDER)
@ApiBearerAuth()
@Controller('/purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly fileUploadService: FileuploadService,
    private readonly bulkUploadService: BulkUploadService
  ) {}

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.CREATE_PO)
  @Post()
  async CreatePurchaseOrder(
    @Body() PurchaseOrderDto: CreatePurchaseOrderRequest
  ): Promise<PurchaseOrder> {
    return await this.purchaseOrderService.createPurchaseOrder(
      PurchaseOrderDto
    );
  }

  @Get('/search')
  async searchPurchaseOrders(
    @Query() reqParams: SearchPurchaseOrderDto
  ): Promise<PurchaseOrder[] | null> {
    const purchaseOrders = await this.purchaseOrderService.searchPurchaseOrder(
      reqParams
    );
    if (purchaseOrders === null) {
      throw new NotFoundException(tableName);
    }
    if (Array.isArray(purchaseOrders.purchaseorders)) {
      const response = purchaseOrders.purchaseorders.sort(
        (p1: PurchaseOrder, p2: PurchaseOrder) => (p1.id > p2.id ? -1 : 1)
      );
      return { purchaseorders: response, total: purchaseOrders.total } as any;
    }
    return purchaseOrders;
  }

  @Get(':id')
  async getPurchaseOrderById(@Param('id', ParseIntPipe) id: number) {
    const purchaseOrder = await this.purchaseOrderService.getPurchaseOrder(id);
    if (purchaseOrder === null) {
      throw new NotFoundException(tableName);
    }
    return purchaseOrder;
  }

  @Get('download/:id')
  async downloadPurchaseOrderById(@Param('id', ParseIntPipe) id: number) {
    const response = await this.purchaseOrderService.downloadPurchaseOrder(id);
    return response;
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(Permissions.EDIT_PO)
  @Put(':id')
  async updatePurchaseOrderById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PurchaseOrderRequest,
    @Req() req: Request
  ): Promise<PurchaseOrder> {
    const user: any = req.user;
    return await this.purchaseOrderService.updatePurchaseOrder(
      id,
      dto,
      user.id
    );
  }

  @UseGuards(PermissionAuthGuard)
  @Permission(
    Permissions.LOCK_UNLOCK_PO,
    Permissions.CANCEL_PO,
    Permissions.CONFIRM_PO
  )
  @Put(':id/status')
  async changePurchaseOrderStatusById(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: POStatus },
    @Req() req: Request
  ): Promise<PurchaseOrder> {
    const user: any = req.user;
    return await this.purchaseOrderService.updatePurchaseOrderStatus(
      user.id,
      id,
      data
    );
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
    const id = body.id; // Purchase Order Id
    const file = files[0]; // Always expecting a single file
    const { updatedPayload, path } =
      await this.fileUploadService.uploadAttachment(file, id, tableName);
    if (updatedPayload) {
      await this.purchaseOrderService.updatePurchaseOrderAttachment(
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
      tableName
    );
    if (updatedPayload) {
      await this.purchaseOrderService.updatePurchaseOrderAttachment(
        id,
        updatedPayload as any,
        user.id
      );
      return { success: true };
    }
    return { success: false };
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
    return await this.bulkUploadService.insertPurchaseOrdersInBulk(
      file,
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
    @Body() body: RFQFormDto
  ) {
    const locationId = body.locationId;
    return await this.purchaseOrderService.insertProductsFromCSV(
      file,
      locationId
    );
  }

  @Get(':id/receipts')
  async getPurchaseOrderReceipts(@Param('id', ParseIntPipe) id: number) {
    return await this.purchaseOrderService.getReceipts(id);
  }
}

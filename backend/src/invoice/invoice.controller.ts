import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DraftInvoice } from '@prisma/client';
import { Permission } from 'src/auth/decorator';
import { Permission as Permissions } from '../common';
import { JwtAuthGuard } from 'src/auth/guards';
import { MODULES_NAME } from 'src/common/constants';
import { SearchInvoiceDto } from './dto/invoice-search.dto';
import {
  CreateInvoiceDraftDto,
  UpdateDraftInvoiceDto
} from './dto/invoice.dto';
import { InvoiceService } from './invoice.service';

@ApiTags(MODULES_NAME.PURCHASE_ORDER)
@ApiBearerAuth()
@Controller('invoice/draft')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async searchInvoice(@Query() reqParams: SearchInvoiceDto): Promise<string> {
    return await this.invoiceService.searchInvoice(reqParams);
  }

  @Permission(Permissions.CREATE_INVOICE)
  @Post()
  async createDraftInvoice(
    @Body() bodyData: CreateInvoiceDraftDto
  ): Promise<DraftInvoice> {
    return await this.invoiceService.createInvoiceDraft(bodyData);
  }

  @Permission(Permissions.CREATE_INVOICE)
  @Delete('/:id')
  async deleteDraftInvoice(@Param('id') id: string): Promise<DraftInvoice> {
    return await this.invoiceService.deleteDraftInvoice(id);
  }

  @Permission(Permissions.CREATE_INVOICE)
  @Put('/:id')
  async updateDraftInvoice(
    @Param('id') id: string,
    @Body() data: UpdateDraftInvoiceDto
  ): Promise<DraftInvoice> {
    return await this.invoiceService.updateDraftInvoice(id, data);
  }
}

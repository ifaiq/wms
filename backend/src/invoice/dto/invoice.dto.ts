import { InvoiceDocumentTypes } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class CreateInvoiceDraftDto {
  @IsEnum(InvoiceDocumentTypes)
  @IsNotEmpty()
  type!: InvoiceDocumentTypes;

  @IsNumber()
  @IsNotEmpty()
  createdById!: number;

  @IsNumber()
  @IsNotEmpty()
  vendorId!: number;

  @IsObject()
  detail!: any;
}

export class UpdateDraftInvoiceDto {
  @IsEnum(InvoiceDocumentTypes)
  @IsNotEmpty()
  type!: InvoiceDocumentTypes;

  @IsNumber()
  @IsNotEmpty()
  createdById!: number;

  @IsNumber()
  @IsNotEmpty()
  vendorId!: number;

  @IsObject()
  detail!: any;
}

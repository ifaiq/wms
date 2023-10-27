import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Country, POStatus, POType, Currency } from '@prisma/client';

export class PurchaseOrderProductRequest {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsNumber()
  @IsOptional()
  mrp!: number;

  @IsNumber()
  @IsNotEmpty()
  taxAmount!: number;

  @IsNumber()
  @IsNotEmpty()
  subTotalWithoutTax!: number;

  @IsNumber()
  @IsNotEmpty()
  subTotalWithTax!: number;

  @IsNumber()
  @IsOptional()
  id?: number;
}

export class PurchaseOrderRequest {
  @ApiProperty({
    name: 'country',
    type: String,
    required: false
  })
  @IsEnum(Country)
  @IsNotEmpty()
  country!: Country;

  @IsNumber()
  @IsNotEmpty()
  businessUnitId!: number;

  @IsNumber()
  @IsNotEmpty()
  warehouseId!: number;

  @IsNumber()
  @IsNotEmpty()
  vendorId!: number;

  @IsNumber()
  @IsNotEmpty()
  subTotalWithoutTax!: number;

  @IsNumber()
  @IsNotEmpty()
  totalTaxAmount!: number;

  @IsNumber()
  @IsNotEmpty()
  totalWithTax!: number;

  @IsString()
  @IsOptional()
  payment!: string;

  @IsString()
  @IsOptional()
  paymentDays!: string;

  @IsString()
  @IsOptional()
  gstInvoiceNumber?: string;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsEnum(POStatus)
  @IsOptional()
  status!: POStatus;

  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderProductRequest)
  products!: PurchaseOrderProductRequest[];

  @ApiProperty({
    type: String,
    required: false
  })
  @IsEnum(POType)
  @IsOptional()
  type!: POType;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}

export class CreatePurchaseOrderRequest extends PurchaseOrderRequest {
  @IsNumber()
  @IsNotEmpty()
  purchaserId!: number;
}

export class BulkUploadPurchaseOrderRequest extends CreatePurchaseOrderRequest {
  @IsNumber()
  @IsNotEmpty()
  serialNumber?: number;
}

import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  ValidateNested,
  Min,
  IsArray,
  IsOptional,
  IsBoolean
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReceiptStatus } from '@prisma/client';
import { IsDateOrNull } from 'src/common/validators';
import { ApiProperty } from '@nestjs/swagger';

class ReceiptProductRequest {
  @IsNotEmpty()
  @IsNumber()
  productId!: number;

  @IsNotEmpty()
  @IsString()
  sku!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  quantityOrdered!: number;

  @IsNotEmpty()
  @IsNumber()
  quantityReceived!: number;

  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDateOrNull()
  expiry?: Date | null;
}

class ReceiptRequest {
  @IsNotEmpty()
  @IsNumber()
  poId!: number;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsEnum(ReceiptStatus)
  status!: ReceiptStatus;

  @IsNotEmpty()
  @IsNumber()
  createdById!: number;

  @IsOptional()
  @IsNumber()
  reasonId?: number;

  @IsOptional()
  @IsNumber()
  returnInRefId?: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReceiptProductRequest)
  products!: ReceiptProductRequest[];
}

class UpdateReceiptProduct {
  @IsNotEmpty()
  @IsNumber()
  productId!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantityReceived!: number;

  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDateOrNull()
  expiry?: Date | null;
}

class UpdateReceipt {
  @IsNumber()
  @IsNotEmpty()
  locationId!: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  reasonId?: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateReceiptProduct)
  products!: UpdateReceiptProduct[];

  @IsArray()
  @IsOptional()
  invoices?: [];
}

class UpdateReceiptStatusRequest {
  @IsNotEmpty()
  @IsString()
  status!: ReceiptStatus;

  @IsNotEmpty()
  @IsBoolean()
  createBackOrder!: boolean;
}

class UpdateReturnReceiptStatusRequest {
  @IsNotEmpty()
  @IsString()
  status!: ReceiptStatus;
}

class ReturnReceiptProductRequest {
  @IsNotEmpty()
  @IsNumber()
  productId!: number;

  @IsNotEmpty()
  @IsString()
  sku!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  quantityReceived!: number;

  @IsNotEmpty()
  @IsNumber()
  quantityReturned!: number;
}

class ReturnReceiptRequest {
  @IsNotEmpty()
  @IsNumber()
  poId!: number;

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsEnum(ReceiptStatus)
  status!: ReceiptStatus;

  @IsNotEmpty()
  @IsNumber()
  createdById!: number;

  @IsNumber()
  reasonId!: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReturnReceiptProductRequest)
  products!: ReturnReceiptProductRequest[];
}

class UpdateReturnReceiptProduct {
  @IsNotEmpty()
  @IsNumber()
  productId!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantityReturned!: number;
}

class UpdateReturnReceiptRequest {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateReturnReceiptProduct)
  products!: UpdateReturnReceiptProduct[];

  @IsNotEmpty()
  @IsNumber()
  reasonId!: number;

  @IsNumber()
  @IsNotEmpty()
  locationId!: number;

  @IsArray()
  @IsOptional()
  invoices?: [];
}

export {
  UpdateReturnReceiptRequest,
  UpdateReturnReceiptProduct,
  ReturnReceiptRequest,
  ReturnReceiptProductRequest,
  UpdateReceiptStatusRequest,
  UpdateReceipt,
  UpdateReceiptProduct,
  ReceiptRequest,
  ReceiptProductRequest,
  UpdateReturnReceiptStatusRequest
};

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AdjustmentStatus, Country } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateOrNull } from 'src/common/validators';

export class AdjustmentProductRequest {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  actualQuantity!: number;

  @IsNumber()
  @IsNotEmpty()
  differenceQuantity!: number;

  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsOptional()
  id?: number;
}

export class AdjustmentRequest {
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
  @IsOptional()
  locationId!: number;

  @IsString()
  @IsOptional()
  reasonValue?: string;

  @IsNumber()
  reasonId!: number;

  @ApiProperty({
    required: false,
    type: String
  })
  @IsString()
  @IsOptional()
  status!: AdjustmentStatus;

  @ValidateNested({ each: true })
  @Type(() => AdjustmentProductRequest)
  products!: AdjustmentProductRequest[];

  @ApiProperty({
    required: true,
    type: Date
  })
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDateOrNull()
  postingPeriod!: Date | null;
}

export class CreateAdjustmentRequest extends AdjustmentRequest {
  @IsNumber()
  @IsNotEmpty()
  createdById!: number;
}

export class AdjustmentStatusRequest {
  @IsEnum(AdjustmentStatus)
  @IsNotEmpty()
  status!: string;
}

export class BulkUploadAdjustmentRequest extends CreateAdjustmentRequest {
  @IsNumber()
  @IsNotEmpty()
  serialNumber?: number;
}

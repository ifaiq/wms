import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  ValidateNested
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  Country,
  Reason,
  TransferProduct,
  TransferStatus
} from '@prisma/client';

export class TransferProductRequest {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  physicalQuantity!: number;

  @IsNumber()
  @IsNotEmpty()
  transferQuantity!: number;

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

export class TransferRequest {
  @IsEnum(Country)
  @IsNotEmpty()
  country!: Country;

  @IsNumber()
  @IsNotEmpty()
  businessUnitId!: number;

  @IsNumber()
  @IsNotEmpty()
  warehouseId!: number;

  @IsString()
  @IsOptional()
  reasonValue?: string | null;

  @IsNumber()
  reasonId!: number;

  @IsNumber()
  @IsNotEmpty()
  fromLocationId!: number;

  @IsNumber()
  @IsNotEmpty()
  toLocationId!: number;

  @IsString()
  @IsOptional()
  status!: TransferStatus;

  @ValidateNested({ each: true })
  @Type(() => TransferProductRequest)
  products!: TransferProductRequest[];
}

export class CreateTransferRequest extends TransferRequest {
  @IsNumber()
  @IsNotEmpty()
  createdById!: number;
}

export class TransferStatusRequest {
  @IsEnum(TransferStatus)
  @IsNotEmpty()
  status!: TransferStatus;
}

export class TransferInventoryRequest extends CreateTransferRequest {
  products!: TransferProduct[];
  reason!: Reason;
  createdBy!: {
    name: string | null;
    id: number;
    email: string;
  };
}

export class TransferFileDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @IsNotEmpty()
  transferQuantity!: number;
}

export class TransferFormDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  warehouseId!: number;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  locationId!: number;
}

export interface TransferFileValidationData {
  validProducts: object[];
}

export class BulkUploadTransferRequest extends CreateTransferRequest {
  @IsNumber()
  @IsNotEmpty()
  serialNumber?: number;
}

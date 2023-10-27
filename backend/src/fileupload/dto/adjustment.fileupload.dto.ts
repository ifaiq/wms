import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AdjustmentFileInitialDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @IsNotEmpty()
  actualQuantity!: number;
}

export class AdjustmentFileDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @IsNotEmpty()
  differenceQuantity!: number;
}

export class AdjustmentFormDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  warehouseId!: number;

  @Transform(({ value }) => Number.parseInt(value))
  @IsOptional()
  subLocationId!: string | null;

  @IsNotEmpty()
  @IsString()
  reason!: string;
}

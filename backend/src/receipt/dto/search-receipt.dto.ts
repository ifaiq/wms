import { Country, POStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive
} from 'class-validator';

export class SearchReceiptDto {
  @IsNotEmpty()
  @IsOptional()
  country!: Country;

  @IsNotEmpty()
  @IsOptional()
  businessUnitId!: string;

  @IsNotEmpty()
  @IsOptional()
  warehouseId!: string;

  @IsNotEmpty()
  @IsOptional()
  status!: POStatus;

  @IsString()
  @IsOptional()
  from!: string;

  @IsString()
  @IsOptional()
  till!: string;

  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  vendor!: Array<string>;

  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  id!: Array<string>;

  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  products!: Array<string>;

  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  purchaser!: Array<string>;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  skip!: number;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  take!: number;
}

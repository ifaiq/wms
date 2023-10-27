import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';
import { Country, VendorType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class FilterVendorsRequest {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsOptional()
  type?: VendorType;

  @IsNotEmpty()
  country!: Country;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  taxID?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  company?: string;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  skip!: number;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  take!: number;
}

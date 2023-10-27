import { Country } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsPositive,
  IsOptional
} from 'class-validator';
import { IsNumberOrNull } from 'src/common/validators';

export class CreateLocation {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEnum(Country)
  @IsNotEmpty()
  country!: Country;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  businessUnitId!: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  warehouseId!: number;

  @IsNumberOrNull()
  parentId!: number;

  @IsBoolean()
  @IsNotEmpty()
  availableForSale!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  grnApplicable!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  returnApplicable!: boolean;
}
export class LocationDto {
  @IsEnum(Country)
  @IsOptional()
  country?: Country;

  @IsString()
  @IsOptional()
  businessUnitId?: string;

  @IsString()
  @IsOptional()
  warehouseId?: string;
}

export class SearchLocationDto extends LocationDto {
  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  skip?: number;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  take?: number;
}

export class FetchLocationDto extends LocationDto {
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @IsOptional()
  excludeLocationId?: number;

  @Transform(({ value }) => (value.toLowerCase() === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  grnApplicable?: boolean;

  @Transform(({ value }) => (value.toLowerCase() === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  returnApplicable?: boolean;

  @Transform(({ value }) => (value.toLowerCase() === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  availableForSale?: boolean;

  @Transform(({ value }) => (value.toLowerCase() === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  allowStagingLocation!: boolean;

  @Transform(({ value }) => (value.toLowerCase() === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  showDisabled!: boolean;
}

export class EditLocation {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class EditLocationStatus {
  @IsNotEmpty()
  @IsBoolean()
  disabled!: boolean;
}

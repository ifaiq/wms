import { ApiProperty } from '@nestjs/swagger';
import { Country, POStatus, POType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum
} from 'class-validator';

export class SearchPurchaseOrderDto {
  @ApiProperty({
    name: 'country',
    type: String,
    required: false
  })
  @IsNotEmpty()
  @IsOptional()
  country!: Country;

  @ApiProperty({
    required: false
  })
  @IsNotEmpty()
  @IsOptional()
  businessUnitId!: string;

  @ApiProperty({
    required: false
  })
  @IsNotEmpty()
  @IsOptional()
  warehouseId!: string;

  @ApiProperty({
    required: false,
    type: String,
    name: 'status'
  })
  @IsNotEmpty()
  @IsOptional()
  status!: POStatus;

  @ApiProperty({
    required: false
  })
  @IsString()
  @IsOptional()
  from!: string;

  @ApiProperty({
    required: false
  })
  @IsString()
  @IsOptional()
  till!: string;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  vendor!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  id!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  products!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  purchaser!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  skip!: number;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  take!: number;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsEnum(POType)
  @IsOptional()
  type!: POType;
}

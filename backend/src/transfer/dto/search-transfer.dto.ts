import { ApiProperty } from '@nestjs/swagger';
import { Country } from '@prisma/client';
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
import { TransferTypes } from 'src/common/constants';

export class SearchTransferDto {
  @ApiProperty({
    name: 'country',
    type: String,
    required: false
  })
  @IsNotEmpty()
  @IsOptional()
  @IsEnum(Country)
  country!: Country;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(TransferTypes)
  type!: TransferTypes;

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
  @IsNotEmpty()
  @IsOptional()
  id!: Array<string>; //Transfer Reference

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  name!: Array<string>; //Product Name

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  sku!: Array<string>; //SKU Code

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

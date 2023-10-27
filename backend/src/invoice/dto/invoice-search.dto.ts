import { ApiProperty } from '@nestjs/swagger';
import { InvoiceDocumentTypes } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDate,
  IsArray
} from 'class-validator';

export class SearchInvoiceDto {
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
  @IsEnum(InvoiceDocumentTypes)
  @IsOptional()
  type!: InvoiceDocumentTypes;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    const date = new Date(value);
    return new Date(date.setHours(0, 0, 0, 0));
  })
  @IsDate()
  @IsOptional()
  from!: Date;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    const date = new Date(value);
    return new Date(date.setHours(23, 59, 59, 999));
  })
  @IsDate()
  @IsOptional()
  till!: Date;

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
  @IsNumber()
  @IsOptional()
  page!: number;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  take!: number;
}

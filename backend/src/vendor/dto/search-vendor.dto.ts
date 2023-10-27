import { ApiProperty } from '@nestjs/swagger';
import { VendorType, Country, VendorStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsPositive, IsNumber } from 'class-validator';

export class VendorSearchDto {
  @ApiProperty({
    required: false
  })
  @IsNotEmpty()
  @IsOptional()
  type!: VendorType;

  @ApiProperty({
    name: 'country',
    required: false,
    type: String
  })
  @IsNotEmpty()
  @IsOptional()
  country!: Country;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsOptional()
  name!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsOptional()
  taxID!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsOptional()
  phone!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsOptional()
  email!: Array<string>;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsOptional()
  status!: Array<VendorStatus>;

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
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class ProductSearchDto {
  @ApiProperty({
    required: false
  })
  @IsString()
  @IsOptional()
  name!: string;

  @ApiProperty({
    required: false
  })
  @IsString()
  @IsOptional()
  sku!: string;

  @IsString()
  locationId!: string;

  @IsOptional()
  @IsString()
  subLocationId?: string;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  currentPage!: number;

  @ApiProperty({
    required: false
  })
  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  pageSize!: number;
}

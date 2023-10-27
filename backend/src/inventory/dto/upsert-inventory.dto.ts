import { Country } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class UpsertInventoryDto {
  @IsEnum(Country)
  @IsNotEmpty()
  country!: Country;

  @IsNumber()
  @IsNotEmpty()
  businessUnitId!: number;

  @IsNumber()
  @IsNotEmpty()
  warehouseId!: number;

  @IsNumber()
  @IsNotEmpty()
  locationId!: number;

  @IsNumber()
  @IsNotEmpty()
  createdById!: number;

  products!: UpsertInventoryProductDto[];
}

export class UpsertInventoryProductDto {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsInt()
  @IsNotEmpty()
  physicalQuantity!: number;
}

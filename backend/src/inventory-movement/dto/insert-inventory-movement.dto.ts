import { InventoryMovementType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class InsertInventoryMovementDto {
  @IsNumber()
  @IsNotEmpty()
  locationId!: number;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  createdById!: number;

  @IsEnum(InventoryMovementType)
  @IsNotEmpty()
  movementType!: InventoryMovementType;

  @IsNumber()
  @IsNotEmpty()
  referenceId!: number;

  @IsString()
  @IsOptional()
  reason?: string;

  products!: InsertInventoryMovementProductDto[];
}

export class InsertInventoryMovementProductDto {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  physicalQuantity!: number;
}

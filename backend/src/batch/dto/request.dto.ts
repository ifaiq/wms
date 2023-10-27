import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class VerifyBatchRequest {
  @IsNumber()
  @IsNotEmpty()
  warehouseId!: number;

  @ValidateNested({ each: true })
  @Type(() => BatchProducts)
  products!: BatchProducts[];
}

export class FetchAvsRequest {
  @IsNumber()
  @IsNotEmpty()
  warehouseId!: number;

  @IsArray()
  @IsNotEmpty()
  products!: number[];
}

export class BatchProducts {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @IsNotEmpty()
  onBoardedQuantity!: number;
}

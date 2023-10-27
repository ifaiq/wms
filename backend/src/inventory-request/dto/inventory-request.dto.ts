import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsEnum,
  IsObject,
  IsNotEmpty
} from 'class-validator';
import { RequestType } from '@prisma/client';

export class InventoryRequestDto {
  @IsInt()
  @IsOptional()
  referenceId?: number;

  @IsObject()
  requestBody!: object;

  @IsObject()
  @IsOptional()
  responseBody?: object;

  @IsInt()
  @IsOptional()
  responseStatus?: number;

  @IsEnum(RequestType)
  @IsNotEmpty()
  type!: RequestType;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @IsOptional()
  @IsBoolean()
  isSuccessful?: boolean;
}

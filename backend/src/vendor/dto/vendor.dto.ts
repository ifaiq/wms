import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsArray
} from 'class-validator';
import { Country, Prisma, VendorStatus, VendorType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class VendorRequestBase {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    type: String
  })
  @IsEnum(VendorType)
  @IsNotEmpty()
  type!: VendorType;

  @ApiProperty({
    type: String
  })
  @IsEnum(Country)
  @IsNotEmpty()
  country!: Country;

  @IsOptional()
  @IsString()
  taxID!: string | null;

  @IsString()
  @IsOptional()
  company!: string | null;

  @IsString()
  @IsOptional()
  address!: string | null;

  @IsString()
  @IsOptional()
  phone!: string | null;

  @IsString()
  @IsOptional()
  email!: string | null;

  @IsString()
  @IsOptional()
  jobPosition!: string | null;

  @ApiProperty({
    type: String,
    required: false
  })
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @IsString()
  @IsOptional()
  crNumber!: string | null;

  @IsString()
  @IsOptional()
  strn!: string | null;
}

export class VendorRequest extends VendorRequestBase {
  @IsArray()
  @IsOptional()
  bankAccounts!: Array<{ bank: string; accountNumber: string }>;
}

export class VendorResponse extends VendorRequestBase {
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  bankAccounts!: Prisma.JsonValue | null;

  attachment!: Prisma.JsonValue | null;
}

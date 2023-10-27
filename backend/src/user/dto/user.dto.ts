import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsArray,
  IsOptional,
  IsNumber,
  IsPositive
} from 'class-validator';
import { Permission } from '../../common';

export class CreateUser {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @IsArray()
  roles!: number[];
}
export class UserAccessResponse {
  permissions!: Permission[];
  roles!: Role[];
}

export class Role {
  id!: number;
  name!: string;
}

export class EditRolesRequest {
  @IsArray()
  @IsNotEmpty()
  roles!: number[];
}

export class UpdateUser {
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  roles?: number[];
}

export class SearchUserDto {
  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  email?: Array<string>;

  @Transform(({ value }) => {
    return typeof value === 'string' ? [value] : value;
  })
  @IsArray()
  @IsOptional()
  name?: Array<string>;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  skip?: number;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  take?: number;
}

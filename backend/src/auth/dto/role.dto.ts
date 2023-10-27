import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString
} from 'class-validator';
import { Permission } from '../../common';

export class RoleRequest {
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];

  @IsNotEmpty()
  @IsString()
  name!: string;
}
export class RoleResponse extends RoleRequest {
  id!: number;
}

export class AssignRoleRequest {
  @IsNumber()
  @IsPositive()
  roleID!: number;

  @IsNumber()
  @IsPositive()
  userID!: number;
}

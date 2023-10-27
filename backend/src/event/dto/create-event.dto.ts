import { IsNotEmpty, IsString } from 'class-validator';
export class CreateEvent {
  @IsString()
  @IsNotEmpty()
  tableName!: string;

  @IsNotEmpty()
  @IsString()
  tableReferenceId!: number;

  @IsString()
  @IsNotEmpty()
  fieldName!: string;

  @IsString()
  @IsNotEmpty()
  oldValue!: string;

  @IsString()
  @IsNotEmpty()
  newValue!: string;

  @IsString()
  @IsNotEmpty()
  updatedBy!: number;
}

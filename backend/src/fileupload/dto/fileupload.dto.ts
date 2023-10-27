import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RFQFormDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Transform(({ value }) => Number.parseInt(value))
  @IsNotEmpty()
  @IsNumber()
  locationId!: number;
}

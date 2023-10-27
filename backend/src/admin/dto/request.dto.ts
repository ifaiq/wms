import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ReasonType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ReasonRequest {
  @ApiProperty({
    name: 'type',
    type: String
  })
  @IsEnum(ReasonType)
  @IsNotEmpty()
  type!: ReasonType;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class FetchReason {
  @ApiProperty({
    name: 'type',
    type: String
  })
  @IsEnum(ReasonType)
  @IsNotEmpty()
  type!: ReasonType;
}

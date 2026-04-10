import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RejectShopDto {
  @ApiProperty({ example: 'Invalid business documents' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class SuspendShopDto {
  @ApiProperty({ example: 'Policy violation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

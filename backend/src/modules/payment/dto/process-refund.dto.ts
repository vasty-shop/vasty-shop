import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProcessRefundDto {
  @ApiPropertyOptional({
    example: 50.0,
    description: 'Refund amount (leave empty for full refund)',
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty({
    example: 'Customer requested refund',
    description: 'Reason for refund',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'abc123def456' })
  @IsOptional()
  @IsString()
  sessionId?: string; // For guest users
}

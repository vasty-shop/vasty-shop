import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UploadDigitalFileDto {
  @ApiPropertyOptional({ description: 'Maximum number of downloads allowed (null = unlimited)', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  downloadLimit?: number;
}

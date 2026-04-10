import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class AddOrderNoteDto {
  @ApiProperty({ example: 'Customer requested gift wrapping' })
  @IsNotEmpty()
  @IsString()
  note: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean; // Internal notes visible only to shop owners

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean; // Send notification to customer
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateTrackingDto {
  @ApiProperty({
    example: 'in_transit',
    enum: [
      'pending',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed',
    ],
    description: 'New delivery status',
  })
  @IsNotEmpty()
  @IsEnum([
    'pending',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
  ])
  status: string;

  @ApiPropertyOptional({
    example: 'Package picked up from warehouse',
    description: 'Status update note',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 'New York Distribution Center',
    description: 'Current location',
  })
  @IsOptional()
  @IsString()
  location?: string;
}

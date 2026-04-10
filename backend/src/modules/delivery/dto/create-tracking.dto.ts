import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateTrackingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Order ID' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'Shop ID' })
  @IsNotEmpty()
  @IsString()
  shopId: string;

  @ApiPropertyOptional({
    example: 'fedex',
    enum: ['fedex', 'ups', 'usps', 'dhl', 'local'],
    description: 'Shipping carrier',
  })
  @IsOptional()
  @IsEnum(['fedex', 'ups', 'usps', 'dhl', 'local'])
  carrier?: string;

  @ApiProperty({
    example: 'standard',
    enum: ['standard', 'express', 'overnight', 'pickup'],
    description: 'Delivery method',
  })
  @IsNotEmpty()
  @IsEnum(['standard', 'express', 'overnight', 'pickup'])
  deliveryMethod: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Estimated delivery date',
  })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({
    example: 'Package will be delivered by 5 PM',
    description: 'Additional delivery notes',
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Require signature on delivery',
  })
  @IsOptional()
  @IsBoolean()
  signatureRequired?: boolean;
}

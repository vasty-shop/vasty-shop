import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
  IsEnum,
} from 'class-validator';

export enum PaymentMethod {
  CARD = 'card',
}

export class CreatePaymentIntentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Order ID' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ example: 99.99, description: 'Payment amount', minimum: 0.01 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'card',
    description: 'Payment method',
    enum: PaymentMethod,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439012',
    description: 'Shop ID for Stripe Connect destination charges',
  })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency code',
    default: 'USD',
  })
  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
  currency?: string;

  @ApiPropertyOptional({
    example: { customField: 'value' },
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

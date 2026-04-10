import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMethodConfig {
  @ApiProperty({ example: true, description: 'Enable card payments' })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({
    example: { publicKey: 'pk_test_...', webhookSecret: 'whsec_...' },
    description: 'Payment method specific configuration',
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class ConfigurePaymentMethodsDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Shop ID' })
  @IsNotEmpty()
  shopId: string;

  @ApiPropertyOptional({ description: 'Card payment configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodConfig)
  card?: PaymentMethodConfig;
}

export class DirectCardPaymentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Order ID' })
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 99.99, description: 'Payment amount', minimum: 0.01 })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'tok_visa', description: 'Stripe token or payment method ID' })
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({ description: 'Save payment method for future use' })
  @IsOptional()
  @IsBoolean()
  savePaymentMethod?: boolean;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  currency?: string;
}

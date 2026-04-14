import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Monthly Coffee Box', description: 'Plan name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh coffee delivered monthly', description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1999, description: 'Price in minor units (cents)', minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  price: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Billing interval',
    enum: ['weekly', 'monthly', 'quarterly', 'annual'],
  })
  @IsNotEmpty()
  @IsEnum(['weekly', 'monthly', 'quarterly', 'annual'])
  interval: string;

  @ApiPropertyOptional({ example: 7, description: 'Trial period in days (0 = no trial)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  trialDays?: number;

  @ApiPropertyOptional({ example: 10, description: 'Subscribe-and-save discount percentage', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  subscriptionDiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Product ID to link this plan to' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'Whether the plan is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSubscriptionPlanDto {
  @ApiPropertyOptional({ example: 'Monthly Coffee Box', description: 'Plan name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1999, description: 'Price in minor units (cents)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  price?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'monthly',
    description: 'Billing interval',
    enum: ['weekly', 'monthly', 'quarterly', 'annual'],
  })
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'quarterly', 'annual'])
  interval?: string;

  @ApiPropertyOptional({ example: 7, description: 'Trial period in days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  trialDays?: number;

  @ApiPropertyOptional({ example: 10, description: 'Subscribe-and-save discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  subscriptionDiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Whether the plan is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Subscription plan ID' })
  @IsNotEmpty()
  @IsString()
  planId: string;

  @ApiPropertyOptional({ description: 'Stripe payment method ID for recurring billing' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

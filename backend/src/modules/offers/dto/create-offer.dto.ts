import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export enum OfferType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
  BUNDLE = 'bundle',
  FIRST_PURCHASE = 'first_purchase',
}

export enum OfferStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

export class CreateOfferDto {
  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Shop ID (null for platform-wide)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ example: 'SUMMER20', description: 'Unique coupon code' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Summer Sale 20% Off' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Get 20% off on all summer items' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'percentage',
    enum: OfferType,
    description: 'Type of offer'
  })
  @IsNotEmpty()
  @IsEnum(OfferType)
  type: OfferType;

  @ApiProperty({ example: 20, description: 'Discount value (percentage or fixed amount)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 50, description: 'Minimum purchase amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 2, description: 'Minimum items required' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minItems?: number;

  @ApiPropertyOptional({
    example: ['prod_123', 'prod_456'],
    description: 'Specific product IDs this offer applies to'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificProducts?: string[];

  @ApiPropertyOptional({
    example: ['cat_123', 'cat_456'],
    description: 'Specific category IDs this offer applies to'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificCategories?: string[];

  @ApiPropertyOptional({
    example: ['prod_789'],
    description: 'Excluded product IDs'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProducts?: string[];

  @ApiPropertyOptional({ example: false, description: 'Apply only on first order' })
  @IsOptional()
  @IsBoolean()
  firstOrderOnly?: boolean;

  @ApiPropertyOptional({
    example: ['all'],
    description: 'User types: all, new, returning'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userTypes?: string[];

  @ApiPropertyOptional({ example: 100, description: 'Total usage limit (null for unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUsageLimit?: number;

  @ApiProperty({ example: 1, description: 'Per user usage limit', default: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  perUserLimit: number;

  @ApiProperty({ example: '2024-06-01T00:00:00Z', description: 'Valid from date' })
  @IsNotEmpty()
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2024-06-30T23:59:59Z', description: 'Valid to date' })
  @IsNotEmpty()
  @IsDateString()
  validTo: string;
}

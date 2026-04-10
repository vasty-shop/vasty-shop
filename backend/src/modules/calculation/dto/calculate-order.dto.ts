import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingMethod } from '../config/shipping.config';

/**
 * DTO for order items in calculation
 */
export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'prod-123',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Item price per unit',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Quantity of items',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Product category',
    example: 'ELECTRONICS',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Item weight in kg',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Wireless Mouse',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

/**
 * DTO for coupon information
 */
export class CouponDto {
  @ApiProperty({
    description: 'Coupon code',
    example: 'WELCOME10',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: 'Coupon type',
    example: 'PERCENTAGE',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Coupon value',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  value?: number;
}

/**
 * Main DTO for order totals calculation
 */
export class CalculateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'US',
  })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({
    description: 'State/Province code (required for Canada)',
    example: 'ON',
  })
  @IsOptional()
  @IsString()
  stateCode?: string;

  @ApiProperty({
    description: 'Delivery method',
    enum: ShippingMethod,
    example: ShippingMethod.STANDARD,
  })
  @IsEnum(ShippingMethod)
  deliveryMethod: ShippingMethod;

  @ApiPropertyOptional({
    description: 'Array of coupon codes to apply',
    type: [CouponDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponDto)
  coupons?: CouponDto[];

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
  })
  @IsString()
  currency: string;
}

/**
 * DTO for shipping cost calculation
 */
export class CalculateShippingDto {
  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'US',
  })
  @IsString()
  countryCode: string;

  @ApiProperty({
    description: 'Delivery method',
    enum: ShippingMethod,
    example: ShippingMethod.STANDARD,
  })
  @IsEnum(ShippingMethod)
  deliveryMethod: ShippingMethod;

  @ApiProperty({
    description: 'Total weight in kg',
    example: 2.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional({
    description: 'Order subtotal (for free shipping calculation)',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderAmount?: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
  })
  @IsString()
  currency: string;
}

/**
 * DTO for tax calculation
 */
export class CalculateTaxOnlyDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'US',
  })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({
    description: 'State/Province code (required for Canada)',
    example: 'ON',
  })
  @IsOptional()
  @IsString()
  stateCode?: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
  })
  @IsString()
  currency: string;
}

/**
 * Response DTO for formatted amounts
 */
export class FormattedAmountsDto {
  @ApiProperty({
    description: 'Formatted subtotal',
    example: '$200.00',
  })
  subtotal: string;

  @ApiProperty({
    description: 'Formatted tax',
    example: '$20.00',
  })
  tax: string;

  @ApiProperty({
    description: 'Formatted shipping',
    example: '$10.00',
  })
  shipping: string;

  @ApiProperty({
    description: 'Formatted discount',
    example: '$15.00',
  })
  discount: string;

  @ApiProperty({
    description: 'Formatted total',
    example: '$215.00',
  })
  total: string;
}

/**
 * Response DTO for tax breakdown
 */
export class TaxBreakdownDto {
  @ApiPropertyOptional({
    description: 'GST amount (Canada)',
    example: 10.0,
  })
  gst?: number;

  @ApiPropertyOptional({
    description: 'PST amount (Canada)',
    example: 14.0,
  })
  pst?: number;

  @ApiPropertyOptional({
    description: 'HST amount (Canada)',
    example: 26.0,
  })
  hst?: number;

  @ApiProperty({
    description: 'Tax rate applied',
    example: 13.0,
  })
  rate: number;

  @ApiProperty({
    description: 'Taxable amount',
    example: 200.0,
  })
  taxableAmount: number;

  @ApiPropertyOptional({
    description: 'Country name',
    example: 'Canada',
  })
  countryName?: string;

  @ApiPropertyOptional({
    description: 'Province name',
    example: 'Ontario',
  })
  provinceName?: string;
}

/**
 * Response DTO for shipping details
 */
export class ShippingDetailsDto {
  @ApiProperty({
    description: 'Shipping method',
    example: 'STANDARD',
  })
  method: string;

  @ApiProperty({
    description: 'Shipping method name',
    example: 'Standard Delivery',
  })
  methodName: string;

  @ApiProperty({
    description: 'Shipping cost',
    example: 10.0,
  })
  cost: number;

  @ApiProperty({
    description: 'Is free shipping applied',
    example: false,
  })
  isFree: boolean;

  @ApiProperty({
    description: 'Estimated delivery time',
    example: '3-5 business days',
  })
  estimatedDays: string;

  @ApiPropertyOptional({
    description: 'Original cost before discount',
    example: 10.0,
  })
  originalCost?: number;
}

/**
 * Response DTO for discount details
 */
export class DiscountDetailsDto {
  @ApiProperty({
    description: 'Discount amount',
    example: 20.0,
  })
  amount: number;

  @ApiPropertyOptional({
    description: 'Array of applied coupons',
  })
  appliedCoupons?: Array<{
    code: string;
    type: string;
    amount: number;
  }>;

  @ApiPropertyOptional({
    description: 'Array of applied automatic discounts',
  })
  automaticDiscounts?: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
}

/**
 * Main response DTO for order totals calculation
 */
export class OrderTotalsResponseDto {
  @ApiProperty({
    description: 'Subtotal before tax, shipping, and discounts',
    example: 200.0,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Total tax amount',
    example: 20.0,
  })
  tax: number;

  @ApiProperty({
    description: 'Tax breakdown details',
    type: TaxBreakdownDto,
  })
  taxBreakdown: TaxBreakdownDto;

  @ApiProperty({
    description: 'Shipping cost',
    example: 10.0,
  })
  shipping: number;

  @ApiProperty({
    description: 'Shipping details',
    type: ShippingDetailsDto,
  })
  shippingDetails: ShippingDetailsDto;

  @ApiProperty({
    description: 'Total discount amount',
    example: 15.0,
  })
  discount: number;

  @ApiProperty({
    description: 'Discount details',
    type: DiscountDetailsDto,
  })
  discountDetails: DiscountDetailsDto;

  @ApiProperty({
    description: 'Grand total (subtotal + tax + shipping - discount)',
    example: 215.0,
  })
  total: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Formatted amounts with currency symbols',
    type: FormattedAmountsDto,
  })
  formatted: FormattedAmountsDto;

  @ApiProperty({
    description: 'Calculation timestamp',
    example: '2025-10-29T10:30:00Z',
  })
  calculatedAt: string;
}

/**
 * Response DTO for shipping calculation
 */
export class ShippingCostResponseDto {
  @ApiProperty({
    description: 'Shipping cost',
    example: 10.0,
  })
  cost: number;

  @ApiProperty({
    description: 'Is free shipping applied',
    example: false,
  })
  isFree: boolean;

  @ApiProperty({
    description: 'Shipping method',
    example: 'STANDARD',
  })
  method: string;

  @ApiProperty({
    description: 'Estimated delivery time',
    example: '3-5 business days',
  })
  estimatedDays: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Formatted cost',
    example: '$10.00',
  })
  formatted: string;
}

/**
 * Response DTO for tax calculation
 */
export class TaxOnlyResponseDto {
  @ApiProperty({
    description: 'Total tax amount',
    example: 20.0,
  })
  tax: number;

  @ApiProperty({
    description: 'Tax breakdown details',
    type: TaxBreakdownDto,
  })
  taxBreakdown: TaxBreakdownDto;

  @ApiProperty({
    description: 'Subtotal amount',
    example: 200.0,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Formatted tax',
    example: '$20.00',
  })
  formatted: string;
}

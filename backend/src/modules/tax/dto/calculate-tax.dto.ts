import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxCategory } from '../config/tax-rates.config';

/**
 * DTO for individual tax line items
 */
export class TaxLineItemDto {
  @ApiProperty({
    description: 'Unique identifier for the item',
    example: 'item-001',
  })
  @IsString()
  itemId: string;

  @ApiProperty({
    description: 'Item name or description',
    example: 'Organic Rice',
  })
  @IsString()
  itemName: string;

  @ApiProperty({
    description: 'Price per unit before tax',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({
    description: 'Quantity of items',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Tax category for the item',
    enum: TaxCategory,
    example: TaxCategory.ESSENTIAL_FOOD,
  })
  @IsOptional()
  @IsEnum(TaxCategory)
  category?: TaxCategory;
}

/**
 * DTO for calculate tax request
 */
export class CalculateTaxDto {
  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 country code',
    example: 'JP',
    enum: ['JP', 'BD', 'CA'],
  })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({
    description: 'Province/state code (required for Canada)',
    example: 'ON',
  })
  @IsOptional()
  @IsString()
  provinceCode?: string;

  @ApiProperty({
    description: 'Array of items to calculate tax for',
    type: [TaxLineItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxLineItemDto)
  items: TaxLineItemDto[];

  @ApiPropertyOptional({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}

/**
 * Response DTO for individual item tax calculation
 */
export class TaxLineItemResultDto {
  @ApiProperty({
    description: 'Item identifier',
    example: 'item-001',
  })
  itemId: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Organic Rice',
  })
  itemName: string;

  @ApiProperty({
    description: 'Subtotal before tax (unitPrice * quantity)',
    example: 200.0,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Tax rate applied (percentage)',
    example: 8.0,
  })
  taxRate: number;

  @ApiProperty({
    description: 'Tax amount calculated',
    example: 16.0,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Total after tax',
    example: 216.0,
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Tax category applied',
    enum: TaxCategory,
    example: TaxCategory.ESSENTIAL_FOOD,
  })
  category?: TaxCategory;

  @ApiPropertyOptional({
    description: 'Tax breakdown (for Canada with GST/PST)',
  })
  taxBreakdown?: {
    gst?: number;
    pst?: number;
    hst?: number;
  };
}

/**
 * Response DTO for tax calculation
 */
export class TaxCalculationResultDto {
  @ApiProperty({
    description: 'Country code',
    example: 'JP',
  })
  countryCode: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Japan',
  })
  countryName: string;

  @ApiPropertyOptional({
    description: 'Province/state code',
    example: 'ON',
  })
  provinceCode?: string;

  @ApiPropertyOptional({
    description: 'Province/state name',
    example: 'Ontario',
  })
  provinceName?: string;

  @ApiProperty({
    description: 'Total before tax',
    example: 200.0,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Total tax amount',
    example: 16.0,
  })
  totalTax: number;

  @ApiProperty({
    description: 'Grand total after tax',
    example: 216.0,
  })
  grandTotal: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Tax calculation details for each item',
    type: [TaxLineItemResultDto],
  })
  items: TaxLineItemResultDto[];

  @ApiPropertyOptional({
    description: 'Tax summary by rate',
  })
  taxSummary?: {
    rate: number;
    taxableAmount: number;
    taxAmount: number;
    itemCount: number;
  }[];

  @ApiProperty({
    description: 'Calculation timestamp',
    example: '2025-10-29T10:30:00Z',
  })
  calculatedAt: string;
}

/**
 * Response DTO for tax rates query
 */
export class TaxRatesResponseDto {
  @ApiProperty({
    description: 'Country code',
    example: 'JP',
  })
  countryCode: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Japan',
  })
  countryName: string;

  @ApiProperty({
    description: 'Default tax rate',
    example: 10.0,
  })
  defaultRate: number;

  @ApiPropertyOptional({
    description: 'Category-based tax rates',
  })
  categoryRates?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Province-based tax rates (Canada)',
  })
  provinceRates?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional information',
  })
  metadata?: {
    lastUpdated?: string;
    notes?: string;
  };
}

/**
 * Data Transfer Objects for Currency Module
 */

import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for currency conversion requests
 */
export class ConvertCurrencyDto {
  @ApiProperty({
    description: 'Amount to convert',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Source currency code (ISO 4217)',
    example: 'USD',
    enum: ['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'],
  })
  @IsString()
  @IsIn(['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'])
  from: string;

  @ApiProperty({
    description: 'Target currency code (ISO 4217)',
    example: 'EUR',
    enum: ['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'],
  })
  @IsString()
  @IsIn(['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'])
  to: string;
}

/**
 * Response DTO for currency conversion
 */
export class ConvertCurrencyResponseDto {
  @ApiProperty({
    description: 'Original amount',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Source currency code',
    example: 'USD',
  })
  from: string;

  @ApiProperty({
    description: 'Target currency code',
    example: 'EUR',
  })
  to: string;

  @ApiProperty({
    description: 'Converted amount',
    example: 85.5,
  })
  convertedAmount: number;

  @ApiProperty({
    description: 'Exchange rate used',
    example: 0.855,
  })
  rate: number;

  @ApiProperty({
    description: 'Formatted converted amount with currency symbol',
    example: '€85.50',
  })
  formatted: string;

  @ApiProperty({
    description: 'Timestamp when rate was last updated',
    example: '2025-10-29T10:00:00Z',
  })
  rateUpdatedAt: string;
}

/**
 * DTO for formatting currency
 */
export class FormatCurrencyDto {
  @ApiProperty({
    description: 'Amount to format',
    example: 1234.56,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
    enum: ['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'],
  })
  @IsString()
  @IsIn(['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'])
  currency: string;
}

/**
 * Response DTO for currency formatting
 */
export class FormatCurrencyResponseDto {
  @ApiProperty({
    description: 'Original amount',
    example: 1234.56,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Formatted amount with currency symbol',
    example: '$1,234.56',
  })
  formatted: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
  })
  symbol: string;

  @ApiProperty({
    description: 'Currency name',
    example: 'US Dollar',
  })
  name: string;
}

/**
 * DTO for updating user currency preference
 */
export class UpdateCurrencyPreferenceDto {
  @ApiProperty({
    description: 'Preferred currency code (ISO 4217)',
    example: 'EUR',
    enum: ['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'],
  })
  @IsString()
  @IsIn(['USD', 'CAD', 'JPY', 'BDT', 'EUR', 'GBP', 'AUD', 'INR'])
  currency: string;
}

/**
 * Response DTO for supported currencies
 */
export class CurrencyInfoDto {
  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'USD',
  })
  code: string;

  @ApiProperty({
    description: 'Currency full name',
    example: 'US Dollar',
  })
  name: string;

  @ApiProperty({
    description: 'Currency symbol',
    example: '$',
  })
  symbol: string;

  @ApiProperty({
    description: 'Native currency symbol',
    example: '$',
  })
  symbolNative: string;

  @ApiProperty({
    description: 'Number of decimal digits',
    example: 2,
  })
  decimalDigits: number;

  @ApiProperty({
    description: 'Symbol position (before or after amount)',
    example: 'before',
  })
  symbolPosition: string;

  @ApiProperty({
    description: 'Decimal separator character',
    example: '.',
  })
  decimalSeparator: string;

  @ApiProperty({
    description: 'Thousand separator character',
    example: ',',
  })
  thousandSeparator: string;

  @ApiProperty({
    description: 'Countries where this currency is used',
    example: ['US'],
  })
  countries: string[];
}

/**
 * Response DTO for supported currencies list
 */
export class SupportedCurrenciesResponseDto {
  @ApiProperty({
    description: 'List of supported currencies',
    type: [CurrencyInfoDto],
  })
  currencies: CurrencyInfoDto[];

  @ApiProperty({
    description: 'Default currency code',
    example: 'USD',
  })
  defaultCurrency: string;

  @ApiProperty({
    description: 'Total number of supported currencies',
    example: 8,
  })
  total: number;
}

/**
 * Response DTO for user currency
 */
export class UserCurrencyResponseDto {
  @ApiProperty({
    description: 'User preferred currency code',
    example: 'EUR',
  })
  currency: string;

  @ApiProperty({
    description: 'Source of currency detection',
    example: 'user_preference',
    enum: ['user_preference', 'ip_location', 'accept_language', 'default'],
  })
  source: 'user_preference' | 'ip_location' | 'accept_language' | 'default';

  @ApiProperty({
    description: 'Currency information',
    type: CurrencyInfoDto,
  })
  info: CurrencyInfoDto;
}

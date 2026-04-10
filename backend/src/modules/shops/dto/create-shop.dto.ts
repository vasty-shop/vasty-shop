import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
  IsArray,
  IsIn,
  ArrayMinSize,
} from 'class-validator';

// Supported languages matching i18n configuration
export const SUPPORTED_LANGUAGES = ['en', 'ja', 'es', 'zh', 'de', 'ar', 'fr', 'pt', 'it'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
import { Type } from 'class-transformer';

export class BusinessAddressDto {
  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class ShopSettingsDto {
  @ApiPropertyOptional({ example: 10.00 })
  @IsOptional()
  min_order?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 8.5, description: 'Tax rate percentage' })
  @IsOptional()
  tax_rate?: number;

  @ApiPropertyOptional({ example: 5.99, description: 'Standard shipping cost' })
  @IsOptional()
  shipping_cost?: number;

  @ApiPropertyOptional({ example: 50, description: 'Order amount for free shipping' })
  @IsOptional()
  free_shipping_threshold?: number;

  @ApiPropertyOptional({ example: ['standard', 'express', 'overnight'] })
  @IsOptional()
  shipping_methods?: string[];

  @ApiPropertyOptional({ example: ['stripe', 'paypal', 'cod'] })
  @IsOptional()
  payment_methods?: string[];

  @ApiPropertyOptional({ example: '30-day return policy' })
  @IsOptional()
  @IsString()
  return_policy?: string;

  @ApiPropertyOptional({ example: 'Ships within 2-3 business days' })
  @IsOptional()
  @IsString()
  shipping_policy?: string;

  @ApiPropertyOptional({ example: 'We respect your privacy' })
  @IsOptional()
  @IsString()
  privacy_policy?: string;
}

export class CreateShopDto {
  @ApiProperty({ example: 'Premium Electronics Store', description: 'Shop name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Your one-stop shop for premium electronics and gadgets',
    description: 'Shop description'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Shop logo URL'
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.png',
    description: 'Shop banner image URL'
  })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category ID for the shop'
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'fashion',
    description: 'Shop category type (fashion, electronics, home, food, beauty, etc.)'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'ai-builder',
    description: 'Template type for storefront (ai-builder, minimal, modern, classic)'
  })
  @IsOptional()
  @IsString()
  template?: string;

  // Language Settings
  @ApiPropertyOptional({
    example: 'en',
    enum: SUPPORTED_LANGUAGES,
    description: 'Default shop language (en, ja, es, zh, de, ar, fr, pt, it)'
  })
  @IsOptional()
  @IsString()
  @IsIn([...SUPPORTED_LANGUAGES], {
    message: `default_language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`
  })
  default_language?: SupportedLanguage;

  @ApiPropertyOptional({
    example: ['en', 'es', 'fr'],
    description: 'Array of supported language codes for the shop'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn([...SUPPORTED_LANGUAGES], {
    each: true,
    message: `Each language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`
  })
  supported_languages?: SupportedLanguage[];

  // Business Information
  @ApiPropertyOptional({
    example: 'Premium Electronics LLC',
    description: 'Legal business name'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  business_name?: string;

  @ApiPropertyOptional({
    example: 'llc',
    enum: ['individual', 'llc', 'corporation'],
    description: 'Business type'
  })
  @IsOptional()
  @IsEnum(['individual', 'llc', 'corporation'])
  business_type?: 'individual' | 'llc' | 'corporation';

  @ApiPropertyOptional({
    example: '12-3456789',
    description: 'Tax identification number'
  })
  @IsOptional()
  @IsString()
  tax_id?: string;

  @ApiProperty({
    example: 'shop@premiumelectronics.com',
    description: 'Business email address'
  })
  @IsNotEmpty()
  @IsEmail()
  business_email: string;

  @ApiPropertyOptional({
    example: '+1-555-123-4567',
    description: 'Business phone number'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format'
  })
  business_phone?: string;

  @ApiPropertyOptional({
    type: BusinessAddressDto,
    description: 'Business address'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessAddressDto)
  business_address?: BusinessAddressDto;

  @ApiPropertyOptional({
    type: ShopSettingsDto,
    description: 'Shop settings and policies'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShopSettingsDto)
  settings?: ShopSettingsDto;

  @ApiPropertyOptional({
    example: ['card', 'paypal', 'cod', 'bank'],
    description: 'Enabled payment methods for customers'
  })
  @IsOptional()
  @IsArray()
  payment_methods?: string[];

  // Plan selection for trial subscription
  @ApiPropertyOptional({
    example: 'starter',
    enum: ['free', 'starter', 'pro', 'business'],
    description: 'Selected subscription plan (paid plans get 2 months free trial)'
  })
  @IsOptional()
  @IsString()
  @IsIn(['free', 'starter', 'pro', 'business'])
  selected_plan?: 'free' | 'starter' | 'pro' | 'business';

  @ApiPropertyOptional({
    example: 'yearly',
    enum: ['monthly', 'yearly'],
    description: 'Billing period for subscription'
  })
  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'yearly'])
  billing_period?: 'monthly' | 'yearly';
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';

export enum CampaignType {
  FLASH_SALE = 'flash_sale',
  SEASONAL = 'seasonal',
  CLEARANCE = 'clearance',
  NEW_ARRIVAL = 'new_arrival',
  BUNDLE = 'bundle',
  LIMITED_EDITION = 'limited_edition',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  ENDED = 'ended',
  PAUSED = 'paused',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  BOGO = 'bogo',
}

export class CreateCampaignDto {
  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011', description: 'Shop ID (null for platform-wide)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ example: 'Summer Sale 2024' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Get up to 50% off on summer collection' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'flash_sale',
    enum: CampaignType,
    description: 'Type of campaign'
  })
  @IsNotEmpty()
  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-30T23:59:59Z' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    example: 'percentage',
    enum: DiscountType,
    description: 'Type of discount'
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 20, description: 'Discount value (percentage or fixed amount)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 50, description: 'Minimum purchase amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiPropertyOptional({
    example: ['prod_123', 'prod_456'],
    description: 'Array of product IDs'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetProducts?: string[];

  @ApiPropertyOptional({
    example: ['cat_123', 'cat_456'],
    description: 'Array of category IDs'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCategories?: string[];

  @ApiPropertyOptional({
    example: ['shop_123', 'shop_456'],
    description: 'Array of shop IDs'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetShops?: string[];

  @ApiPropertyOptional({
    example: [
      { url: 'https://example.com/banner1.jpg', alt: 'Summer Sale Banner' },
      { url: 'https://example.com/banner2.jpg', alt: 'Summer Sale Banner 2' }
    ],
    description: 'Array of banner images'
  })
  @IsOptional()
  @IsArray()
  bannerImages?: any[];

  @ApiPropertyOptional({ example: 'https://example.com/featured.jpg' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({
    example: {
      autoApply: true,
      showBanner: true,
      priority: 1
    },
    description: 'Campaign settings'
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Valid for in-stock items only. Cannot be combined with other offers.' })
  @IsOptional()
  @IsString()
  termsConditions?: string;
}

import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// ENUMS
// ============================================

export enum BannerType {
  HERO = 'hero',
  PROMOTIONAL = 'promotional',
  CATEGORY = 'category',
  PRODUCT = 'product',
  SHOP = 'shop',
  FLASH_SALE = 'flash_sale',
  POPUP = 'popup',
  SIDEBAR = 'sidebar',
  INLINE = 'inline',
}

export enum BannerPlacement {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  CATEGORY_PAGE = 'category_page',
  PRODUCT_PAGE = 'product_page',
  SEARCH_PAGE = 'search_page',
  CART_PAGE = 'cart_page',
  CHECKOUT_PAGE = 'checkout_page',
}

export enum BannerStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export enum AdType {
  STORE_PROMOTION = 'store_promotion',
  PRODUCT_HIGHLIGHT = 'product_highlight',
  FEATURED_LISTING = 'featured_listing',
  SPONSORED = 'sponsored',
}

export enum AdStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export enum BillingType {
  FLAT = 'flat',
  CPC = 'cpc', // Cost per click
  CPM = 'cpm', // Cost per 1000 impressions
  DAILY = 'daily',
}

// ============================================
// BANNER DTOs
// ============================================

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Subtitle' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Mobile image URL' })
  @IsString()
  @IsOptional()
  mobileImageUrl?: string;

  @ApiProperty({ enum: BannerType })
  @IsEnum(BannerType)
  type: BannerType;

  @ApiProperty({ enum: BannerPlacement })
  @IsEnum(BannerPlacement)
  placement: BannerPlacement;

  @ApiPropertyOptional({ description: 'Click URL' })
  @IsString()
  @IsOptional()
  clickUrl?: string;

  @ApiPropertyOptional({ description: 'Linked category ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Linked product ID' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Linked shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Zone IDs to display in' })
  @IsArray()
  @IsOptional()
  zoneIds?: string[];

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Background color (hex)' })
  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @ApiPropertyOptional({ description: 'Text color (hex)' })
  @IsString()
  @IsOptional()
  textColor?: string;

  @ApiPropertyOptional({ description: 'Button text' })
  @IsString()
  @IsOptional()
  buttonText?: string;

  @ApiPropertyOptional({ description: 'Button color (hex)' })
  @IsString()
  @IsOptional()
  buttonColor?: string;
}

export class UpdateBannerDto {
  @ApiPropertyOptional({ description: 'Banner title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Subtitle' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Mobile image URL' })
  @IsString()
  @IsOptional()
  mobileImageUrl?: string;

  @ApiPropertyOptional({ description: 'Click URL' })
  @IsString()
  @IsOptional()
  clickUrl?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: BannerStatus })
  @IsEnum(BannerStatus)
  @IsOptional()
  status?: BannerStatus;
}

export class QueryBannersDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: BannerType })
  @IsEnum(BannerType)
  @IsOptional()
  type?: BannerType;

  @ApiPropertyOptional({ enum: BannerPlacement })
  @IsEnum(BannerPlacement)
  @IsOptional()
  placement?: BannerPlacement;

  @ApiPropertyOptional({ enum: BannerStatus })
  @IsEnum(BannerStatus)
  @IsOptional()
  status?: BannerStatus;

  @ApiPropertyOptional({ description: 'Zone ID' })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Include expired' })
  @IsBoolean()
  @IsOptional()
  includeExpired?: boolean;
}

// ============================================
// PAID AD DTOs
// ============================================

export class CreateAdDto {
  @ApiProperty({ enum: AdType })
  @IsEnum(AdType)
  type: AdType;

  @ApiProperty({ description: 'Ad title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Click URL' })
  @IsString()
  @IsOptional()
  clickUrl?: string;

  @ApiPropertyOptional({ description: 'Linked shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Linked product IDs' })
  @IsArray()
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({ description: 'Target zone IDs' })
  @IsArray()
  @IsOptional()
  zoneIds?: string[];

  @ApiProperty({ enum: BillingType })
  @IsEnum(BillingType)
  billingType: BillingType;

  @ApiPropertyOptional({ description: 'Budget (for billing)' })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ description: 'Daily budget limit' })
  @IsNumber()
  @IsOptional()
  dailyBudget?: number;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;
}

export class UpdateAdDto {
  @ApiPropertyOptional({ description: 'Ad title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Budget' })
  @IsNumber()
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ description: 'Daily budget limit' })
  @IsNumber()
  @IsOptional()
  dailyBudget?: number;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: AdStatus })
  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus;
}

export class QueryAdsDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: AdType })
  @IsEnum(AdType)
  @IsOptional()
  type?: AdType;

  @ApiPropertyOptional({ enum: AdStatus })
  @IsEnum(AdStatus)
  @IsOptional()
  status?: AdStatus;

  @ApiPropertyOptional({ description: 'Shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;
}

export class AdPricingDto {
  @ApiProperty({ enum: AdType })
  @IsEnum(AdType)
  type: AdType;

  @ApiProperty({ enum: BillingType })
  @IsEnum(BillingType)
  billingType: BillingType;

  @ApiProperty({ description: 'Price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Minimum duration (days)' })
  @IsNumber()
  @IsOptional()
  minDurationDays?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class RecordInteractionDto {
  @ApiProperty({ description: 'Banner or Ad ID' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'Entity type', enum: ['banner', 'ad'] })
  @IsString()
  entityType: 'banner' | 'ad';

  @ApiProperty({ description: 'Interaction type', enum: ['impression', 'click'] })
  @IsString()
  interactionType: 'impression' | 'click';
}

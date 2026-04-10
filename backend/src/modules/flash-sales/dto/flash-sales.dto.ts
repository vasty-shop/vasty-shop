import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum FlashSaleStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum FlashSaleType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  BUNDLE = 'bundle',
}

export enum DiscountDistribution {
  UNIFORM = 'uniform', // Same discount for all products
  TIERED = 'tiered', // Different discounts per product
  PROGRESSIVE = 'progressive', // Increasing discount over time
}

export enum FlashSaleVisibility {
  PUBLIC = 'public',
  MEMBERS_ONLY = 'members_only',
  VIP_ONLY = 'vip_only',
  INVITE_ONLY = 'invite_only',
}

export enum NotificationType {
  STARTING_SOON = 'starting_soon',
  NOW_LIVE = 'now_live',
  ENDING_SOON = 'ending_soon',
  LOW_STOCK = 'low_stock',
  PRICE_DROP = 'price_drop',
}

// ============================================
// HELPER DTOs (must be defined first)
// ============================================

export class FlashSaleProductDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number; // Override price directly

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockLimit?: number; // Limited quantity for flash sale

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPerUser?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class FlashSaleNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  notifyStartingSoon?: boolean;

  @IsOptional()
  @IsNumber()
  startingSoonMinutes?: number;

  @IsOptional()
  @IsBoolean()
  notifyNowLive?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyEndingSoon?: boolean;

  @IsOptional()
  @IsNumber()
  endingSoonMinutes?: number;

  @IsOptional()
  @IsBoolean()
  notifyLowStock?: boolean;

  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @IsOptional()
  @IsArray()
  channels?: string[]; // push, email, sms
}

export class FlashSaleRuleDto {
  @IsString()
  type: string; // min_quantity, customer_segment, time_of_day, etc.

  @IsString()
  operator: string; // equals, greater_than, less_than, in, etc.

  value: any;

  @IsOptional()
  @IsString()
  action?: string; // apply_extra_discount, unlock_product, etc.

  @IsOptional()
  actionValue?: any;
}

// ============================================
// FLASH SALE CRUD DTOs
// ============================================

export class CreateFlashSaleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  shopId: string;

  @IsEnum(FlashSaleType)
  type: FlashSaleType;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(FlashSaleVisibility)
  visibility?: FlashSaleVisibility;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultDiscountAmount?: number;

  @IsOptional()
  @IsEnum(DiscountDistribution)
  discountDistribution?: DiscountDistribution;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPurchasePerUser?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBudget?: number; // Max discount value to give out

  @IsOptional()
  @IsBoolean()
  showCountdown?: boolean;

  @IsOptional()
  @IsBoolean()
  showStockLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  allowEarlyAccess?: boolean;

  @IsOptional()
  @IsNumber()
  earlyAccessMinutes?: number; // Minutes before official start for VIP

  @IsOptional()
  @IsArray()
  categoryIds?: string[]; // Restrict to categories

  @IsOptional()
  @IsArray()
  products?: FlashSaleProductDto[];

  @IsOptional()
  notifications?: FlashSaleNotificationSettingsDto;

  @IsOptional()
  @IsArray()
  rules?: FlashSaleRuleDto[];
}

export class UpdateFlashSaleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsEnum(FlashSaleVisibility)
  visibility?: FlashSaleVisibility;

  @IsOptional()
  @IsString()
  bannerImage?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsNumber()
  defaultDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  defaultDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  maxPurchasePerUser?: number;

  @IsOptional()
  @IsNumber()
  totalBudget?: number;

  @IsOptional()
  @IsBoolean()
  showCountdown?: boolean;

  @IsOptional()
  @IsBoolean()
  showStockLevel?: boolean;

  @IsOptional()
  @IsEnum(FlashSaleStatus)
  status?: FlashSaleStatus;

  @IsOptional()
  notifications?: FlashSaleNotificationSettingsDto;
}

// ============================================
// PRODUCT MANAGEMENT DTOs
// ============================================

export class AddProductsToFlashSaleDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  products: FlashSaleProductDto[];
}

export class UpdateFlashSaleProductDto {
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  stockLimit?: number;

  @IsOptional()
  @IsNumber()
  maxPerUser?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RemoveProductsFromFlashSaleDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  productIds: string[];
}

export class BulkUpdateProductsDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  updates: { productId: string; data: UpdateFlashSaleProductDto }[];
}

// ============================================
// FILTER & SEARCH DTOs
// ============================================

export class FlashSaleFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsEnum(FlashSaleStatus)
  status?: FlashSaleStatus;

  @IsOptional()
  @IsEnum(FlashSaleType)
  type?: FlashSaleType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  upcomingOnly?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class FlashSaleProductFilterDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  minDiscount?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsBoolean()
  featuredOnly?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: 'discount' | 'price' | 'popularity' | 'newest';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============================================
// SUBSCRIPTION & WAITLIST DTOs
// ============================================

export class SubscribeToFlashSaleDto {
  @IsString()
  flashSaleId: string;

  @IsOptional()
  @IsArray()
  notificationChannels?: string[];

  @IsOptional()
  @IsArray()
  productIds?: string[]; // Specific products to watch
}

export class JoinWaitlistDto {
  @IsString()
  flashSaleId: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

// ============================================
// PURCHASE & VALIDATION DTOs
// ============================================

export class ValidateFlashSalePurchaseDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  items: FlashSalePurchaseItemDto[];
}

export class FlashSalePurchaseItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ReserveFlashSaleItemsDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  items: FlashSalePurchaseItemDto[];

  @IsOptional()
  @IsNumber()
  reservationMinutes?: number; // How long to hold
}

export class ReleaseReservationDto {
  @IsString()
  reservationId: string;
}

// ============================================
// ANALYTICS DTOs
// ============================================

export class FlashSaleAnalyticsDto {
  @IsString()
  flashSaleId: string;

  @IsOptional()
  @IsString()
  granularity?: 'minute' | 'hour' | 'day';
}

export class FlashSaleComparisonDto {
  @IsArray()
  flashSaleIds: string[];

  @IsOptional()
  @IsArray()
  metrics?: string[];
}

// ============================================
// SCHEDULING DTOs
// ============================================

export class ScheduleFlashSaleDto {
  @IsString()
  flashSaleId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  activateAutomatically?: boolean;
}

export class ExtendFlashSaleDto {
  @IsString()
  flashSaleId: string;

  @IsDateString()
  newEndTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CloneFlashSaleDto {
  @IsString()
  sourceFlashSaleId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  includeProducts?: boolean;
}

// ============================================
// TIERED & PROGRESSIVE PRICING DTOs
// ============================================

export class SetProgressiveDiscountDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  tiers: ProgressiveDiscountTierDto[];
}

export class ProgressiveDiscountTierDto {
  @IsNumber()
  minutesFromStart: number; // Minutes after start

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;
}

export class SetQuantityTiersDto {
  @IsString()
  flashSaleId: string;

  @IsString()
  productId: string;

  @IsArray()
  tiers: QuantityTierDto[];
}

export class QuantityTierDto {
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;
}

// ============================================
// LIVE UPDATES DTOs
// ============================================

export class FlashSaleLiveUpdateDto {
  @IsString()
  flashSaleId: string;

  @IsString()
  updateType: 'stock_update' | 'price_change' | 'sold_out' | 'back_in_stock' | 'time_extension';

  data: any;
}

// ============================================
// EARLY ACCESS DTOs
// ============================================

export class GrantEarlyAccessDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  userIds: string[];

  @IsOptional()
  @IsNumber()
  earlyAccessMinutes?: number;
}

export class RevokeEarlyAccessDto {
  @IsString()
  flashSaleId: string;

  @IsArray()
  userIds: string[];
}

// ============================================
// BUNDLE DTOs
// ============================================

export class CreateFlashSaleBundleDto {
  @IsString()
  flashSaleId: string;

  @IsString()
  name: string;

  @IsArray()
  products: BundleProductDto[];

  @IsNumber()
  @Min(0)
  @Max(100)
  bundleDiscountPercent: number;

  @IsOptional()
  @IsNumber()
  bundlePrice?: number; // Override calculated price

  @IsOptional()
  @IsNumber()
  stockLimit?: number;

  @IsOptional()
  @IsString()
  image?: string;
}

export class BundleProductDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateFlashSaleBundleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  products?: BundleProductDto[];

  @IsOptional()
  @IsNumber()
  bundleDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  bundlePrice?: number;

  @IsOptional()
  @IsNumber()
  stockLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

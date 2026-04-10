import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// ENUMS
// ============================================

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
  FIRST_ORDER = 'first_order',
}

export enum CouponScope {
  ALL = 'all',
  SHOP = 'shop',
  CATEGORY = 'category',
  PRODUCT = 'product',
  USER = 'user',
  ZONE = 'zone',
}

export enum CouponStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  DEPLETED = 'depleted',
}

export enum ExpenseBearer {
  PLATFORM = 'platform',
  VENDOR = 'vendor',
  SHARED = 'shared',
}

// ============================================
// DTOs
// ============================================

export class CreateCouponDto {
  @ApiProperty({ description: 'Coupon code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Coupon title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount (for percentage)' })
  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount' })
  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @ApiProperty({ enum: CouponScope })
  @IsEnum(CouponScope)
  scope: CouponScope;

  @ApiPropertyOptional({ description: 'Shop ID (if scope is shop)' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Category IDs (if scope is category)' })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Product IDs (if scope is product)' })
  @IsArray()
  @IsOptional()
  productIds?: string[];

  @ApiPropertyOptional({ description: 'User IDs (if scope is user)' })
  @IsArray()
  @IsOptional()
  userIds?: string[];

  @ApiPropertyOptional({ description: 'Zone IDs (if scope is zone)' })
  @IsArray()
  @IsOptional()
  zoneIds?: string[];

  @ApiPropertyOptional({ description: 'Start date' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Expiry date' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ description: 'Total usage limit' })
  @IsNumber()
  @IsOptional()
  totalUsageLimit?: number;

  @ApiPropertyOptional({ description: 'Per user usage limit' })
  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @ApiProperty({ enum: ExpenseBearer, description: 'Who bears the discount expense' })
  @IsEnum(ExpenseBearer)
  expenseBearer: ExpenseBearer;

  @ApiPropertyOptional({ description: 'Platform share percentage (if shared)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  platformSharePercent?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Buy X Get Y specific fields
  @ApiPropertyOptional({ description: 'Buy quantity (for buy_x_get_y)' })
  @IsNumber()
  @IsOptional()
  buyQuantity?: number;

  @ApiPropertyOptional({ description: 'Get quantity (for buy_x_get_y)' })
  @IsNumber()
  @IsOptional()
  getQuantity?: number;

  @ApiPropertyOptional({ description: 'Get product IDs (for buy_x_get_y)' })
  @IsArray()
  @IsOptional()
  getProductIds?: string[];

  @ApiPropertyOptional({ description: 'Get discount percentage (for buy_x_get_y)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  getDiscountPercent?: number;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ description: 'Coupon title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Discount value' })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount' })
  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount' })
  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Total usage limit' })
  @IsNumber()
  @IsOptional()
  totalUsageLimit?: number;

  @ApiPropertyOptional({ description: 'Per user usage limit' })
  @IsNumber()
  @IsOptional()
  perUserLimit?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ApplyCouponDto {
  @ApiProperty({ description: 'Coupon code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Order subtotal' })
  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Cart items' })
  @IsArray()
  @IsOptional()
  items?: {
    productId: string;
    categoryId?: string;
    quantity: number;
    price: number;
  }[];

  @ApiPropertyOptional({ description: 'Zone ID' })
  @IsString()
  @IsOptional()
  zoneId?: string;
}

export class QueryCouponsDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: CouponType })
  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @ApiPropertyOptional({ enum: CouponScope })
  @IsEnum(CouponScope)
  @IsOptional()
  scope?: CouponScope;

  @ApiPropertyOptional({ enum: CouponStatus })
  @IsEnum(CouponStatus)
  @IsOptional()
  status?: CouponStatus;

  @ApiPropertyOptional({ description: 'Shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Include expired' })
  @IsBoolean()
  @IsOptional()
  includeExpired?: boolean;
}

export class CouponUsageDto {
  @ApiProperty({ description: 'Coupon ID' })
  @IsString()
  couponId: string;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Discount amount' })
  @IsNumber()
  discountAmount: number;

  @ApiPropertyOptional({ description: 'Platform expense share' })
  @IsNumber()
  @IsOptional()
  platformExpense?: number;

  @ApiPropertyOptional({ description: 'Vendor expense share' })
  @IsNumber()
  @IsOptional()
  vendorExpense?: number;
}

export class BulkCouponActionDto {
  @ApiProperty({ description: 'Coupon IDs' })
  @IsArray()
  couponIds: string[];

  @ApiProperty({ description: 'Action', enum: ['activate', 'deactivate', 'delete'] })
  @IsString()
  action: 'activate' | 'deactivate' | 'delete';
}

import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CashbackType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CashbackAppliesTo {
  ALL = 'all',
  CATEGORY = 'category',
  PRODUCT = 'product',
  SHOP = 'shop',
  FIRST_ORDER = 'first_order',
}

export enum CashbackUserType {
  ALL = 'all',
  NEW = 'new',
  EXISTING = 'existing',
  TIER_SPECIFIC = 'tier_specific',
}

export enum CashbackStatus {
  PENDING = 'pending',
  CREDITED = 'credited',
  CANCELLED = 'cancelled',
}

export class CreateCashbackRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CashbackType })
  @IsEnum(CashbackType)
  type: CashbackType;

  @ApiProperty({ description: 'Percentage or fixed amount' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Maximum cashback for percentage type' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCashback?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ enum: CashbackAppliesTo, default: CashbackAppliesTo.ALL })
  @IsOptional()
  @IsEnum(CashbackAppliesTo)
  appliesTo?: CashbackAppliesTo;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shopIds?: string[];

  @ApiPropertyOptional({ enum: CashbackUserType, default: CashbackUserType.ALL })
  @IsOptional()
  @IsEnum(CashbackUserType)
  userType?: CashbackUserType;

  @ApiPropertyOptional({ type: [String], description: 'Loyalty tiers for tier_specific' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  loyaltyTiers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Total uses allowed' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Max uses per user' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ default: 0, description: 'Higher priority wins' })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateCashbackRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxCashback?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class GetCashbackHistoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CashbackStatus)
  status?: CashbackStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class CashbackRuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  maxCashback: number | null;

  @ApiProperty()
  minOrderAmount: number;

  @ApiProperty()
  appliesTo: string;

  @ApiProperty()
  userType: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  usageLimit: number | null;
}

export class CashbackTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderAmount: number;

  @ApiProperty()
  cashbackAmount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  creditedAt: string | null;
}

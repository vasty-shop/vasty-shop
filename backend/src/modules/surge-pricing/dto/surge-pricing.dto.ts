import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SurgeType {
  TIME_BASED = 'time_based',
  DEMAND_BASED = 'demand_based',
  ZONE_BASED = 'zone_based',
  EVENT_BASED = 'event_based',
  WEATHER_BASED = 'weather_based',
}

export enum SurgeAppliesTo {
  DELIVERY_FEE = 'delivery_fee',
  PRODUCT_PRICE = 'product_price',
  ALL = 'all',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

// ============================================
// TIME WINDOW DTOs
// ============================================

export class TimeWindowDto {
  @ApiProperty({ enum: DayOfWeek, isArray: true, description: 'Days of week (0=Sunday)' })
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  days: DayOfWeek[];

  @ApiProperty({ description: 'Start time (HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time (HH:mm)' })
  @IsString()
  endTime: string;
}

// ============================================
// SURGE RULE DTOs
// ============================================

export class CreateSurgeRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SurgeType })
  @IsEnum(SurgeType)
  type: SurgeType;

  @ApiProperty({ enum: SurgeAppliesTo })
  @IsEnum(SurgeAppliesTo)
  appliesTo: SurgeAppliesTo;

  @ApiProperty({ description: 'Multiplier (1.5 = 50% increase)' })
  @IsNumber()
  @Min(1)
  @Max(10)
  multiplier: number;

  @ApiPropertyOptional({ description: 'Fixed amount to add instead of multiplier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum surge amount cap' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSurgeAmount?: number;

  @ApiPropertyOptional({ description: 'Time windows for time-based surges' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeWindowDto)
  timeWindows?: TimeWindowDto[];

  @ApiPropertyOptional({ description: 'Zone IDs for zone-based surges' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zoneIds?: string[];

  @ApiPropertyOptional({ description: 'Shop IDs (null = platform-wide)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shopIds?: string[];

  @ApiPropertyOptional({ description: 'Category IDs for category-specific surges' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Product IDs for product-specific surges' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({ description: 'Start date (for event-based)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (for event-based)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Priority (higher = applied first)' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSurgeRuleDto {
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
  @Min(1)
  @Max(10)
  multiplier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fixedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxSurgeAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeWindowDto)
  timeWindows?: TimeWindowDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  zoneIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shopIds?: string[];

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
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// DEMAND TRACKING DTOs
// ============================================

export class ConfigureDemandSurgeDto {
  @ApiPropertyOptional({ description: 'Shop ID (null = platform-wide)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Zone ID' })
  @IsOptional()
  @IsString()
  zoneId?: string;

  @ApiProperty({ description: 'Order count threshold for surge level 1' })
  @IsNumber()
  @Min(1)
  threshold1: number;

  @ApiProperty({ description: 'Multiplier for surge level 1' })
  @IsNumber()
  @Min(1)
  @Max(5)
  multiplier1: number;

  @ApiPropertyOptional({ description: 'Order count threshold for surge level 2' })
  @IsOptional()
  @IsNumber()
  threshold2?: number;

  @ApiPropertyOptional({ description: 'Multiplier for surge level 2' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  multiplier2?: number;

  @ApiPropertyOptional({ description: 'Order count threshold for surge level 3' })
  @IsOptional()
  @IsNumber()
  threshold3?: number;

  @ApiPropertyOptional({ description: 'Multiplier for surge level 3' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  multiplier3?: number;

  @ApiPropertyOptional({ description: 'Time window in minutes for counting orders' })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  timeWindowMinutes?: number;
}

// ============================================
// CALCULATE SURGE DTOs
// ============================================

export class CalculateSurgeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zoneId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Base amount to apply surge to' })
  @IsNumber()
  @Min(0)
  baseAmount: number;

  @ApiProperty({ enum: SurgeAppliesTo })
  @IsEnum(SurgeAppliesTo)
  type: SurgeAppliesTo;

  @ApiPropertyOptional({ description: 'Datetime to check (ISO format, defaults to now)' })
  @IsOptional()
  @IsString()
  datetime?: string;
}

// ============================================
// QUERY DTOs
// ============================================

export class GetSurgeRulesDto {
  @ApiPropertyOptional({ enum: SurgeType })
  @IsOptional()
  @IsEnum(SurgeType)
  type?: SurgeType;

  @ApiPropertyOptional({ enum: SurgeAppliesTo })
  @IsOptional()
  @IsEnum(SurgeAppliesTo)
  appliesTo?: SurgeAppliesTo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zoneId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  offset?: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class SurgeRuleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  appliesTo: string;

  @ApiProperty()
  multiplier: number;

  @ApiProperty()
  fixedAmount: number | null;

  @ApiProperty()
  maxSurgeAmount: number | null;

  @ApiProperty()
  timeWindows: TimeWindowDto[] | null;

  @ApiProperty()
  zoneIds: string[] | null;

  @ApiProperty()
  shopIds: string[] | null;

  @ApiProperty()
  categoryIds: string[] | null;

  @ApiProperty()
  productIds: string[] | null;

  @ApiProperty()
  startDate: string | null;

  @ApiProperty()
  endDate: string | null;

  @ApiProperty()
  priority: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;
}

export class SurgeCalculationResponseDto {
  @ApiProperty()
  baseAmount: number;

  @ApiProperty()
  surgeMultiplier: number;

  @ApiProperty()
  surgeAmount: number;

  @ApiProperty()
  finalAmount: number;

  @ApiProperty()
  appliedRules: { id: string; name: string; type: string; multiplier: number }[];

  @ApiProperty()
  surgeActive: boolean;

  @ApiProperty()
  message: string;
}

export class DemandLevelResponseDto {
  @ApiProperty()
  currentOrderCount: number;

  @ApiProperty()
  timeWindowMinutes: number;

  @ApiProperty()
  surgeLevel: number;

  @ApiProperty()
  currentMultiplier: number;

  @ApiProperty()
  nextThreshold: number | null;

  @ApiProperty()
  nextMultiplier: number | null;
}

export class SurgeStatsResponseDto {
  @ApiProperty()
  totalRules: number;

  @ApiProperty()
  activeRules: number;

  @ApiProperty()
  averageMultiplier: number;

  @ApiProperty()
  totalSurgeRevenue: number;

  @ApiProperty()
  orderCountWithSurge: number;

  @ApiProperty()
  surgeByType: { type: string; count: number; avgMultiplier: number }[];
}

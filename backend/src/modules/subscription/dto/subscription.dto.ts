import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// ============================================
// PLAN DTOs
// ============================================

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceYearly?: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number;

  @ApiPropertyOptional({ description: 'null = unlimited' })
  @IsOptional()
  @IsNumber()
  maxProducts?: number | null;

  @ApiPropertyOptional({ description: 'null = unlimited' })
  @IsOptional()
  @IsNumber()
  maxOrdersPerMonth?: number | null;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTeamMembers?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAnalytics?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPrioritySupport?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasCustomDomain?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasApiAccess?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasBulkUpload?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPromotions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  badgeColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdatePlanDto {
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
  priceMonthly?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceYearly?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxProducts?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxOrdersPerMonth?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxTeamMembers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAnalytics?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPrioritySupport?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// ============================================
// SUBSCRIPTION DTOs
// ============================================

export class SubscribeDto {
  @ApiProperty({ description: 'Shop ID to subscribe' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsString()
  planId: string;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({ description: 'Payment method ID from Stripe' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class ChangePlanDto {
  @ApiProperty({ description: 'New plan ID' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ enum: BillingCycle })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ default: true, description: 'Cancel at end of billing period' })
  @IsOptional()
  @IsBoolean()
  atPeriodEnd?: boolean;

  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  priceMonthly: number;

  @ApiProperty()
  priceYearly: number | null;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  trialDays: number;

  @ApiProperty()
  maxProducts: number | null;

  @ApiProperty()
  maxOrdersPerMonth: number | null;

  @ApiProperty()
  maxTeamMembers: number;

  @ApiProperty()
  commissionRate: number;

  @ApiProperty()
  features: string[];

  @ApiProperty()
  hasAnalytics: boolean;

  @ApiProperty()
  hasPrioritySupport: boolean;

  @ApiProperty()
  hasCustomDomain: boolean;

  @ApiProperty()
  hasApiAccess: boolean;

  @ApiProperty()
  hasBulkUpload: boolean;

  @ApiProperty()
  hasPromotions: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFeatured: boolean;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  planId: string;

  @ApiProperty()
  plan: PlanResponseDto;

  @ApiProperty()
  billingCycle: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  currentPeriodStart: string;

  @ApiProperty()
  currentPeriodEnd: string;

  @ApiProperty()
  trialEndsAt: string | null;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiProperty()
  productsUsed: number;

  @ApiProperty()
  ordersThisMonth: number;
}

import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReferralRewardType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  POINTS = 'points',
}

export enum ReferralStatus {
  PENDING = 'pending',
  QUALIFIED = 'qualified',
  REWARDED = 'rewarded',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ReferralTrigger {
  REGISTRATION = 'registration',
  FIRST_ORDER = 'first_order',
  ORDER_COMPLETED = 'order_completed',
  MINIMUM_SPEND = 'minimum_spend',
}

// ============================================
// CONFIG DTOs
// ============================================

export class UpdateReferralConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ enum: ReferralRewardType })
  @IsOptional()
  @IsEnum(ReferralRewardType)
  referrerRewardType?: ReferralRewardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  referrerRewardValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  referrerMaxReward?: number;

  @ApiPropertyOptional({ enum: ReferralRewardType })
  @IsOptional()
  @IsEnum(ReferralRewardType)
  refereeRewardType?: ReferralRewardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  refereeRewardValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  refereeMaxReward?: number;

  @ApiPropertyOptional({ enum: ReferralTrigger })
  @IsOptional()
  @IsEnum(ReferralTrigger)
  rewardTrigger?: ReferralTrigger;

  @ApiPropertyOptional({ description: 'Minimum order amount for qualification' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Days until referral expires' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expiryDays?: number;

  @ApiPropertyOptional({ description: 'Max referrals per user (0 = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxReferralsPerUser?: number;

  @ApiPropertyOptional({ description: 'Allow self-referral (different accounts)' })
  @IsOptional()
  @IsBoolean()
  allowSelfReferral?: boolean;

  @ApiPropertyOptional({ description: 'Require referee email verification' })
  @IsOptional()
  @IsBoolean()
  requireEmailVerification?: boolean;

  @ApiPropertyOptional({ description: 'Custom referral code prefix' })
  @IsOptional()
  @IsString()
  codePrefix?: string;

  @ApiPropertyOptional({ description: 'Referral code length' })
  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(16)
  codeLength?: number;
}

// ============================================
// REFERRAL DTOs
// ============================================

export class ApplyReferralCodeDto {
  @ApiProperty()
  @IsString()
  code: string;
}

export class CreateCustomCodeDto {
  @ApiProperty({ description: 'Custom code (alphanumeric, min 4 chars)' })
  @IsString()
  code: string;
}

export class GetReferralsDto {
  @ApiPropertyOptional({ enum: ReferralStatus })
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;

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

// ============================================
// RESPONSE DTOs
// ============================================

export class ReferralConfigResponseDto {
  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  referrerRewardType: string;

  @ApiProperty()
  referrerRewardValue: number;

  @ApiProperty()
  referrerMaxReward: number | null;

  @ApiProperty()
  refereeRewardType: string;

  @ApiProperty()
  refereeRewardValue: number;

  @ApiProperty()
  refereeMaxReward: number | null;

  @ApiProperty()
  rewardTrigger: string;

  @ApiProperty()
  minOrderAmount: number;

  @ApiProperty()
  expiryDays: number;

  @ApiProperty()
  maxReferralsPerUser: number;
}

export class ReferralCodeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  isCustom: boolean;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  maxUsages: number | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  expiresAt: string | null;
}

export class ReferralResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  refereeId: string;

  @ApiProperty()
  refereeName: string | null;

  @ApiProperty()
  refereeEmail: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  referrerReward: number | null;

  @ApiProperty()
  refereeReward: number | null;

  @ApiProperty()
  qualifyingOrderId: string | null;

  @ApiProperty()
  qualifyingOrderAmount: number | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  qualifiedAt: string | null;

  @ApiProperty()
  rewardedAt: string | null;
}

export class ReferralStatsResponseDto {
  @ApiProperty()
  totalReferrals: number;

  @ApiProperty()
  pendingReferrals: number;

  @ApiProperty()
  qualifiedReferrals: number;

  @ApiProperty()
  rewardedReferrals: number;

  @ApiProperty()
  totalEarned: number;

  @ApiProperty()
  pendingEarnings: number;

  @ApiProperty()
  referralCode: string;
}

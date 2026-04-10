import { IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LoyaltyTransactionType {
  EARN = 'earn',
  REDEEM = 'redeem',
  EXPIRE = 'expire',
  BONUS = 'bonus',
  ADJUSTMENT = 'adjustment',
}

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export class RedeemPointsDto {
  @ApiProperty({ description: 'Number of points to redeem' })
  @IsNumber()
  @Min(1)
  points: number;

  @ApiPropertyOptional({ description: 'Order ID to apply discount' })
  @IsOptional()
  @IsString()
  orderId?: string;
}

export class GetLoyaltyTransactionsDto {
  @ApiPropertyOptional({ description: 'Transaction type filter' })
  @IsOptional()
  @IsEnum(LoyaltyTransactionType)
  type?: LoyaltyTransactionType;

  @ApiPropertyOptional({ description: 'Start date filter' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}

export class LoyaltyPointsResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  pointsBalance: number;

  @ApiProperty()
  pointsEarned: number;

  @ApiProperty()
  pointsRedeemed: number;

  @ApiProperty()
  tier: string;

  @ApiProperty()
  tierProgress: number;

  @ApiProperty()
  nextTier: string | null;

  @ApiProperty()
  pointsToNextTier: number;

  @ApiProperty()
  lifetimePoints: number;
}

export class LoyaltyTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  pointsBefore: number;

  @ApiProperty()
  pointsAfter: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: string;
}

export class AdminAwardPointsDto {
  @ApiProperty({ description: 'User ID to award points' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Number of points to award' })
  @IsNumber()
  @Min(1)
  points: number;

  @ApiProperty({ description: 'Reason for awarding points' })
  @IsString()
  reason: string;
}

export class AdminDeductPointsDto {
  @ApiProperty({ description: 'User ID to deduct points from' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Number of points to deduct' })
  @IsNumber()
  @Min(1)
  points: number;

  @ApiProperty({ description: 'Reason for deduction' })
  @IsString()
  reason: string;
}

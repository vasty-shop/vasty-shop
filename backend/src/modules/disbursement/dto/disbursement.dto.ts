import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DisbursementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum DisbursementMethod {
  BANK_TRANSFER = 'bank_transfer',
  STRIPE_CONNECT = 'stripe_connect',
  PAYPAL = 'paypal',
  WALLET = 'wallet',
  CHECK = 'check',
}

export enum DisbursementSchedule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  ON_DEMAND = 'on_demand',
}

// ============================================
// PAYMENT METHOD DTOs
// ============================================

export class BankAccountDto {
  @ApiProperty()
  @IsString()
  accountHolderName: string;

  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  routingNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  swiftCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iban?: string;
}

export class SetupPaymentMethodDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ enum: DisbursementMethod })
  @IsEnum(DisbursementMethod)
  method: DisbursementMethod;

  @ApiPropertyOptional({ description: 'Bank account details (for bank_transfer)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount?: BankAccountDto;

  @ApiPropertyOptional({ description: 'PayPal email (for paypal)' })
  @IsOptional()
  @IsString()
  paypalEmail?: string;

  @ApiPropertyOptional({ description: 'Stripe Connect account ID (for stripe_connect)' })
  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankAccountDto)
  bankAccount?: BankAccountDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paypalEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// DISBURSEMENT SETTINGS DTOs
// ============================================

export class SetDisbursementSettingsDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ enum: DisbursementSchedule })
  @IsEnum(DisbursementSchedule)
  schedule: DisbursementSchedule;

  @ApiPropertyOptional({ description: 'Minimum amount for auto disbursement' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumAmount?: number;

  @ApiPropertyOptional({ description: 'Hold period in days before disbursement' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  holdPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Day of week (0-6) for weekly schedule' })
  @IsOptional()
  @IsNumber()
  weeklyDay?: number;

  @ApiPropertyOptional({ description: 'Day of month (1-28) for monthly schedule' })
  @IsOptional()
  @IsNumber()
  monthlyDay?: number;

  @ApiPropertyOptional({ description: 'Auto-disburse when minimum is reached' })
  @IsOptional()
  @IsBoolean()
  autoDisburse?: boolean;
}

// ============================================
// DISBURSEMENT REQUEST DTOs
// ============================================

export class RequestDisbursementDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiPropertyOptional({ description: 'Amount to withdraw (null for full balance)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Payment method ID (uses default if not specified)' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ProcessDisbursementDto {
  @ApiProperty()
  @IsString()
  disbursementId: string;

  @ApiProperty({ enum: ['approve', 'reject', 'hold'] })
  @IsString()
  action: 'approve' | 'reject' | 'hold';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'External reference (transaction ID)' })
  @IsOptional()
  @IsString()
  externalReference?: string;
}

// ============================================
// QUERY DTOs
// ============================================

export class GetDisbursementsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ enum: DisbursementStatus })
  @IsOptional()
  @IsEnum(DisbursementStatus)
  status?: DisbursementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  offset?: number;
}

// ============================================
// STRIPE CONNECT DTOs
// ============================================

export class CreateStripeConnectAccountDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class PaymentMethodResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  details: any;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: string;
}

export class DisbursementSettingsResponseDto {
  @ApiProperty()
  shopId: string;

  @ApiProperty()
  schedule: string;

  @ApiProperty()
  minimumAmount: number;

  @ApiProperty()
  holdPeriodDays: number;

  @ApiProperty()
  weeklyDay: number | null;

  @ApiProperty()
  monthlyDay: number | null;

  @ApiProperty()
  autoDisburse: boolean;

  @ApiProperty()
  nextScheduledDate: string | null;
}

export class DisbursementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  netAmount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  paymentMethodId: string | null;

  @ApiProperty()
  externalReference: string | null;

  @ApiProperty()
  note: string | null;

  @ApiProperty()
  processedAt: string | null;

  @ApiProperty()
  createdAt: string;
}

export class BalanceResponseDto {
  @ApiProperty()
  available: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  onHold: number;

  @ApiProperty()
  totalEarnings: number;

  @ApiProperty()
  totalWithdrawn: number;

  @ApiProperty()
  currency: string;
}

export class StripeConnectResponseDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  onboardingUrl: string;

  @ApiProperty()
  isOnboarded: boolean;
}

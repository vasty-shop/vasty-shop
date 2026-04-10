import { IsNumber, IsString, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  REFUND = 'refund',
  TOPUP = 'topup',
  PAYMENT = 'payment',
  BONUS = 'bonus',
  CASHBACK = 'cashback',
  REFERRAL = 'referral',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

export class TopUpWalletDto {
  @ApiProperty({ description: 'Amount to top up', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Payment method', enum: ['stripe', 'paypal'] })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Payment intent ID for Stripe' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}

export class TransferFundsDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsString()
  recipientId: string;

  @ApiProperty({ description: 'Amount to transfer', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ description: 'Transfer description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class PayWithWalletDto {
  @ApiProperty({ description: 'Order ID to pay for' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Amount to pay' })
  @IsNumber()
  @Min(0.01)
  amount: number;
}

export class GetTransactionsDto {
  @ApiPropertyOptional({ description: 'Transaction type filter' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'Transaction status filter' })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ description: 'Start date filter' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Limit results', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  pendingBalance: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  totalCredited: number;

  @ApiProperty()
  totalDebited: number;

  @ApiProperty()
  createdAt: string;
}

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  balanceBefore: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: string;
}

export class CreateTopupIntentDto {
  @ApiProperty({ description: 'Amount to top up in cents', minimum: 100 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';
}

export class ConfirmTopupDto {
  @ApiProperty({ description: 'Topup record ID' })
  @IsString()
  topupId: string;

  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;
}

export class AdminAdjustBalanceDto {
  @ApiProperty({ description: 'User ID to adjust' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Amount to adjust (positive for credit, negative for debit)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

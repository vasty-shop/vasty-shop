import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum GiftCardStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum GiftCardType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
}

export enum GiftCardTransactionType {
  PURCHASE = 'purchase',
  REDEMPTION = 'redemption',
  REFUND = 'refund',
  TOP_UP = 'top_up',
  TRANSFER = 'transfer',
  EXPIRY = 'expiry',
}

// ============================================
// TEMPLATE DTOs
// ============================================

export class CreateGiftCardTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Preset amounts available' })
  @IsArray()
  @IsNumber({}, { each: true })
  presetAmounts: number[];

  @ApiPropertyOptional({ description: 'Allow custom amount' })
  @IsOptional()
  @IsBoolean()
  allowCustomAmount?: boolean;

  @ApiPropertyOptional({ description: 'Minimum custom amount' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum custom amount' })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Validity in days (null = never expires)' })
  @IsOptional()
  @IsNumber()
  validityDays?: number;

  @ApiPropertyOptional({ description: 'Card design image URL' })
  @IsOptional()
  @IsString()
  designImage?: string;

  @ApiPropertyOptional({ enum: GiftCardType, default: GiftCardType.DIGITAL })
  @IsOptional()
  @IsEnum(GiftCardType)
  type?: GiftCardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGiftCardTemplateDto {
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
  @IsArray()
  @IsNumber({}, { each: true })
  presetAmounts?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowCustomAmount?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  validityDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// PURCHASE DTOs
// ============================================

export class PurchaseGiftCardDto {
  @ApiPropertyOptional({ description: 'Template ID (optional for custom cards)' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: 'Gift card amount' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Quantity to purchase' })
  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;

  @ApiPropertyOptional({ description: 'Recipient email (for digital delivery)' })
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Recipient name' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ description: 'Personal message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Delivery date (for scheduled delivery)' })
  @IsOptional()
  @IsString()
  deliveryDate?: string;
}

// ============================================
// REDEMPTION DTOs
// ============================================

export class RedeemGiftCardDto {
  @ApiProperty({ description: 'Gift card code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Order ID (for order payment)' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Amount to redeem (partial redemption)' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}

export class TransferGiftCardDto {
  @ApiProperty({ description: 'Gift card code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Recipient email' })
  @IsString()
  recipientEmail: string;

  @ApiPropertyOptional({ description: 'Message to recipient' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class TopUpGiftCardDto {
  @ApiProperty({ description: 'Gift card code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Amount to add' })
  @IsNumber()
  @Min(1)
  amount: number;
}

// ============================================
// QUERY DTOs
// ============================================

export class GetGiftCardsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: GiftCardStatus })
  @IsOptional()
  @IsEnum(GiftCardStatus)
  status?: GiftCardStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  offset?: number;
}

export class CheckBalanceDto {
  @ApiProperty({ description: 'Gift card code' })
  @IsString()
  code: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class GiftCardTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  presetAmounts: number[];

  @ApiProperty()
  allowCustomAmount: boolean;

  @ApiProperty()
  minAmount: number | null;

  @ApiProperty()
  maxAmount: number | null;

  @ApiProperty()
  validityDays: number | null;

  @ApiProperty()
  designImage: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;
}

export class GiftCardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  initialAmount: number;

  @ApiProperty()
  currentBalance: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  purchasedBy: string;

  @ApiProperty()
  redeemedBy: string | null;

  @ApiProperty()
  recipientEmail: string | null;

  @ApiProperty()
  recipientName: string | null;

  @ApiProperty()
  message: string | null;

  @ApiProperty()
  expiresAt: string | null;

  @ApiProperty()
  redeemedAt: string | null;

  @ApiProperty()
  createdAt: string;
}

export class GiftCardTransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  giftCardId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  orderId: string | null;

  @ApiProperty()
  userId: string | null;

  @ApiProperty()
  note: string | null;

  @ApiProperty()
  createdAt: string;
}

export class GiftCardBalanceResponseDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  currentBalance: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  expiresAt: string | null;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  message: string;
}

export class PurchaseResultResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  giftCards: GiftCardResponseDto[];

  @ApiProperty()
  totalAmount: number;
}

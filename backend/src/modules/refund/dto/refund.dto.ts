import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RefundReason {
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  NOT_DELIVERED = 'not_delivered',
  QUALITY_ISSUE = 'quality_issue',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other',
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
}

export class RefundItemDto {
  @ApiProperty({ description: 'Order item ID' })
  @IsString()
  orderItemId: string;

  @ApiProperty({ description: 'Quantity to refund' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Reason for this item' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateRefundRequestDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Refund reason', enum: RefundReason })
  @IsEnum(RefundReason)
  reason: RefundReason;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Evidence images URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Items to refund', type: [RefundItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  items?: RefundItemDto[];

  @ApiPropertyOptional({ description: 'Preferred refund method', enum: RefundMethod })
  @IsOptional()
  @IsEnum(RefundMethod)
  preferredMethod?: RefundMethod;
}

export class ProcessRefundDto {
  @ApiProperty({ description: 'Refund request ID' })
  @IsString()
  refundId: string;

  @ApiProperty({ description: 'Action to take', enum: ['approve', 'reject'] })
  @IsString()
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Amount to approve (for partial refunds)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @ApiPropertyOptional({ description: 'Refund method', enum: RefundMethod })
  @IsOptional()
  @IsEnum(RefundMethod)
  refundMethod?: RefundMethod;

  @ApiProperty({ description: 'Refund to wallet instead of original payment' })
  @IsBoolean()
  refundToWallet: boolean;

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class GetRefundsDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

  @ApiPropertyOptional({ description: 'Filter by order ID' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Filter by shop ID' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
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

export class RefundResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amountRequested: number;

  @ApiProperty()
  amountApproved: number | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  refundMethod: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  reviewedAt: string | null;
}

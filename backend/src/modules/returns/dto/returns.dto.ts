import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============================================
// ENUMS
// ============================================

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum ProductCondition {
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
}

// ============================================
// SUB-DTOs
// ============================================

export class ReturnItemDto {
  @ApiProperty({ description: 'Product ID to return' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity to return' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Reason for returning this item' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ============================================
// REQUEST DTOs
// ============================================

export class CreateReturnRequestDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Items to return', type: [ReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @ApiProperty({ description: 'Reason for return' })
  @IsString()
  reason: string;
}

export class RejectReturnDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  reason: string;
}

export class ReceiveReturnDto {
  @ApiProperty({ description: 'Condition of returned product', enum: ProductCondition })
  @IsEnum(ProductCondition)
  condition: ProductCondition;
}

export class GetReturnsDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: ReturnStatus })
  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class ReturnResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rmaNumber: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  vendorId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  items: any[];

  @ApiPropertyOptional()
  productCondition: string | null;

  @ApiPropertyOptional()
  rejectionReason: string | null;

  @ApiPropertyOptional()
  refundId: string | null;

  @ApiProperty()
  returnPolicyDays: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

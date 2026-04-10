import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// ENUMS
// ============================================

export enum POSOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum POSPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  SPLIT = 'split',
  CREDIT = 'credit',
}

export enum POSSessionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

// ============================================
// DTOs
// ============================================

export class POSCartItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit price (override)' })
  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'Fixed discount amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Variant ID' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreatePOSOrderDto {
  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Cart items', type: [POSCartItemDto] })
  @IsArray()
  items: POSCartItemDto[];

  @ApiPropertyOptional({ description: 'Customer ID (if registered)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Customer name (walk-in)' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ enum: POSPaymentMethod })
  @IsEnum(POSPaymentMethod)
  paymentMethod: POSPaymentMethod;

  @ApiPropertyOptional({ description: 'Split payment details' })
  @IsObject()
  @IsOptional()
  splitPayment?: {
    cash: number;
    card: number;
    mobile?: number;
  };

  @ApiPropertyOptional({ description: 'Coupon code' })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Order discount percentage' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderDiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Order discount amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Tax rate (override)' })
  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Note' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Cash received (for change calculation)' })
  @IsNumber()
  @IsOptional()
  cashReceived?: number;
}

export class UpdatePOSOrderDto {
  @ApiPropertyOptional({ enum: POSOrderStatus })
  @IsEnum(POSOrderStatus)
  @IsOptional()
  status?: POSOrderStatus;

  @ApiPropertyOptional({ description: 'Note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class RefundPOSOrderDto {
  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Partial refund amount' })
  @IsNumber()
  @IsOptional()
  refundAmount?: number;

  @ApiPropertyOptional({ description: 'Items to refund' })
  @IsArray()
  @IsOptional()
  items?: {
    productId: string;
    quantity: number;
  }[];

  @ApiPropertyOptional({ description: 'Refund to wallet' })
  @IsBoolean()
  @IsOptional()
  refundToWallet?: boolean;
}

export class OpenSessionDto {
  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Opening cash amount' })
  @IsNumber()
  @Min(0)
  openingCash: number;

  @ApiPropertyOptional({ description: 'Note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CloseSessionDto {
  @ApiProperty({ description: 'Closing cash amount' })
  @IsNumber()
  @Min(0)
  closingCash: number;

  @ApiPropertyOptional({ description: 'Card sales amount' })
  @IsNumber()
  @IsOptional()
  cardSales?: number;

  @ApiPropertyOptional({ description: 'Mobile sales amount' })
  @IsNumber()
  @IsOptional()
  mobileSales?: number;

  @ApiPropertyOptional({ description: 'Note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CashDrawerDto {
  @ApiProperty({ description: 'Type', enum: ['add', 'remove'] })
  @IsString()
  type: 'add' | 'remove';

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Reason' })
  @IsString()
  reason: string;
}

export class QueryPOSOrdersDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Shop ID' })
  @IsString()
  @IsOptional()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ enum: POSOrderStatus })
  @IsEnum(POSOrderStatus)
  @IsOptional()
  status?: POSOrderStatus;

  @ApiPropertyOptional({ enum: POSPaymentMethod })
  @IsEnum(POSPaymentMethod)
  @IsOptional()
  paymentMethod?: POSPaymentMethod;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Search (order number, customer)' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class POSSettingsDto {
  @ApiPropertyOptional({ description: 'Enable POS for shop' })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Default tax rate' })
  @IsNumber()
  @IsOptional()
  defaultTaxRate?: number;

  @ApiPropertyOptional({ description: 'Receipt header text' })
  @IsString()
  @IsOptional()
  receiptHeader?: string;

  @ApiPropertyOptional({ description: 'Receipt footer text' })
  @IsString()
  @IsOptional()
  receiptFooter?: string;

  @ApiPropertyOptional({ description: 'Auto-print receipt' })
  @IsBoolean()
  @IsOptional()
  autoPrintReceipt?: boolean;

  @ApiPropertyOptional({ description: 'Allow discount without approval' })
  @IsBoolean()
  @IsOptional()
  allowDiscountWithoutApproval?: boolean;

  @ApiPropertyOptional({ description: 'Max discount percentage allowed' })
  @IsNumber()
  @IsOptional()
  maxDiscountPercent?: number;

  @ApiPropertyOptional({ description: 'Require session to process orders' })
  @IsBoolean()
  @IsOptional()
  requireSession?: boolean;
}

export class HoldOrderDto {
  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Cart items', type: [POSCartItemDto] })
  @IsArray()
  items: POSCartItemDto[];

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class QuickProductDto {
  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Shop ID' })
  @IsString()
  shopId: string;

  @ApiPropertyOptional({ description: 'Barcode' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}

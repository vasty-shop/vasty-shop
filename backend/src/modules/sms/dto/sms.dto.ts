import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SmsProvider {
  TWILIO = 'twilio',
  NEXMO = 'nexmo',
  AWS_SNS = 'aws_sns',
  MSG91 = 'msg91',
  FIREBASE = 'firebase',
}

export enum SmsTemplateType {
  // Authentication
  OTP = 'otp',
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',
  LOGIN_ALERT = 'login_alert',

  // Orders
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_OUT_FOR_DELIVERY = 'order_out_for_delivery',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',

  // Delivery
  DRIVER_ASSIGNED = 'driver_assigned',
  DELIVERY_ETA = 'delivery_eta',

  // Payments
  PAYMENT_RECEIVED = 'payment_received',
  REFUND_INITIATED = 'refund_initiated',
  REFUND_COMPLETED = 'refund_completed',

  // Wallet
  WALLET_CREDITED = 'wallet_credited',
  WALLET_LOW_BALANCE = 'wallet_low_balance',

  // Marketing
  PROMO = 'promo',
  FLASH_SALE = 'flash_sale',
  ABANDONED_CART = 'abandoned_cart',

  // Vendor
  VENDOR_NEW_ORDER = 'vendor_new_order',
  VENDOR_ORDER_CANCELLED = 'vendor_order_cancelled',
  VENDOR_PAYOUT = 'vendor_payout',

  // Custom
  CUSTOM = 'custom',
}

export enum SmsStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

// ============================================
// CONFIG DTOs
// ============================================

export class ConfigureSmsDto {
  @ApiProperty({ enum: SmsProvider })
  @IsEnum(SmsProvider)
  provider: SmsProvider;

  @ApiProperty({ description: 'API credentials' })
  @IsObject()
  credentials: {
    accountSid?: string;
    authToken?: string;
    apiKey?: string;
    apiSecret?: string;
    senderId?: string;
  };

  @ApiPropertyOptional({ description: 'Default sender ID/number' })
  @IsOptional()
  @IsString()
  defaultSenderId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateSmsSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultSenderId?: string;

  @ApiPropertyOptional({ description: 'OTP length' })
  @IsOptional()
  @IsNumber()
  @Min(4)
  otpLength?: number;

  @ApiPropertyOptional({ description: 'OTP expiry in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  otpExpiryMinutes?: number;

  @ApiPropertyOptional({ description: 'Daily SMS limit per user' })
  @IsOptional()
  @IsNumber()
  dailyLimitPerUser?: number;
}

// ============================================
// TEMPLATE DTOs
// ============================================

export class CreateSmsTemplateDto {
  @ApiProperty({ enum: SmsTemplateType })
  @IsEnum(SmsTemplateType)
  type: SmsTemplateType;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'SMS body with {{variables}}' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Available variables' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSmsTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// SEND DTOs
// ============================================

export class SendSmsDto {
  @ApiProperty({ description: 'Phone number with country code' })
  @IsString()
  to: string;

  @ApiProperty({ enum: SmsTemplateType })
  @IsEnum(SmsTemplateType)
  templateType: SmsTemplateType;

  @ApiPropertyOptional({ description: 'Variables for template' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}

export class SendBulkSmsDto {
  @ApiProperty({ type: [String], description: 'Phone numbers' })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ enum: SmsTemplateType })
  @IsEnum(SmsTemplateType)
  templateType: SmsTemplateType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  commonVariables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Per-recipient variables: { "phone": { "name": "John" } }' })
  @IsOptional()
  @IsObject()
  recipientVariables?: Record<string, Record<string, any>>;
}

export class SendOtpDto {
  @ApiProperty({ description: 'Phone number with country code' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Purpose of OTP' })
  @IsOptional()
  @IsString()
  purpose?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'OTP code' })
  @IsString()
  otp: string;
}

// ============================================
// QUERY DTOs
// ============================================

export class GetSmsLogsDto {
  @ApiPropertyOptional({ enum: SmsTemplateType })
  @IsOptional()
  @IsEnum(SmsTemplateType)
  templateType?: SmsTemplateType;

  @ApiPropertyOptional({ enum: SmsStatus })
  @IsOptional()
  @IsEnum(SmsStatus)
  status?: SmsStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

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
// RESPONSE DTOs
// ============================================

export class SmsConfigResponseDto {
  @ApiProperty()
  provider: string;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  defaultSenderId: string;

  @ApiProperty()
  otpLength: number;

  @ApiProperty()
  otpExpiryMinutes: number;

  @ApiProperty()
  isConfigured: boolean;
}

export class SmsTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  variables: string[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;
}

export class SmsLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  templateType: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  providerMessageId: string | null;

  @ApiProperty()
  errorMessage: string | null;

  @ApiProperty()
  sentAt: string | null;

  @ApiProperty()
  deliveredAt: string | null;

  @ApiProperty()
  createdAt: string;
}

export class SmsStatsResponseDto {
  @ApiProperty()
  totalSent: number;

  @ApiProperty()
  delivered: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  deliveryRate: string;

  @ApiProperty()
  costEstimate: number;
}

import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EmailTemplateType {
  // Authentication
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_CODE = 'two_factor_code',

  // Orders
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_PROCESSING = 'order_processing',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_REFUND_INITIATED = 'order_refund_initiated',
  ORDER_REFUND_COMPLETED = 'order_refund_completed',

  // Payments
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',

  // Wallet
  WALLET_CREDITED = 'wallet_credited',
  WALLET_DEBITED = 'wallet_debited',
  WALLET_TRANSFER_SENT = 'wallet_transfer_sent',
  WALLET_TRANSFER_RECEIVED = 'wallet_transfer_received',

  // Loyalty
  LOYALTY_POINTS_EARNED = 'loyalty_points_earned',
  LOYALTY_POINTS_REDEEMED = 'loyalty_points_redeemed',
  LOYALTY_TIER_UPGRADE = 'loyalty_tier_upgrade',

  // Referral
  REFERRAL_SIGNUP = 'referral_signup',
  REFERRAL_REWARD = 'referral_reward',

  // Vendor
  VENDOR_WELCOME = 'vendor_welcome',
  VENDOR_SHOP_APPROVED = 'vendor_shop_approved',
  VENDOR_SHOP_REJECTED = 'vendor_shop_rejected',
  VENDOR_NEW_ORDER = 'vendor_new_order',
  VENDOR_ORDER_REVIEW = 'vendor_order_review',
  VENDOR_PAYOUT_INITIATED = 'vendor_payout_initiated',
  VENDOR_PAYOUT_COMPLETED = 'vendor_payout_completed',
  VENDOR_SUBSCRIPTION_EXPIRING = 'vendor_subscription_expiring',
  VENDOR_SUBSCRIPTION_EXPIRED = 'vendor_subscription_expired',

  // Subscription
  SUBSCRIPTION_ACTIVATED = 'subscription_activated',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription_payment_failed',

  // Promotions
  PROMO_CAMPAIGN = 'promo_campaign',
  FLASH_SALE_ALERT = 'flash_sale_alert',
  WISHLIST_PRICE_DROP = 'wishlist_price_drop',
  BACK_IN_STOCK = 'back_in_stock',
  ABANDONED_CART = 'abandoned_cart',

  // Reviews
  REVIEW_REQUEST = 'review_request',
  REVIEW_RESPONSE = 'review_response',

  // General
  NEWSLETTER = 'newsletter',
  CUSTOM = 'custom',
}

export enum EmailLogStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  OPENED = 'opened',
  CLICKED = 'clicked',
}

// ============================================
// TEMPLATE DTOs
// ============================================

export class CreateEmailTemplateDto {
  @ApiProperty({ enum: EmailTemplateType })
  @IsEnum(EmailTemplateType)
  type: EmailTemplateType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'HTML body with {{variables}}' })
  @IsString()
  htmlBody: string;

  @ApiPropertyOptional({ description: 'Plain text body' })
  @IsOptional()
  @IsString()
  textBody?: string;

  @ApiPropertyOptional({ description: 'Available variables for this template' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  htmlBody?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textBody?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// SEND EMAIL DTOs
// ============================================

export class SendEmailDto {
  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty({ enum: EmailTemplateType })
  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @ApiPropertyOptional({ description: 'Variables to replace in template' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Custom subject override' })
  @IsOptional()
  @IsString()
  subjectOverride?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  replyTo?: string;
}

export class SendBulkEmailDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ enum: EmailTemplateType })
  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @ApiPropertyOptional({ description: 'Common variables for all recipients' })
  @IsOptional()
  @IsObject()
  commonVariables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Per-recipient variables: { "email@example.com": { "name": "John" } }' })
  @IsOptional()
  @IsObject()
  recipientVariables?: Record<string, Record<string, any>>;
}

export class PreviewEmailDto {
  @ApiProperty({ enum: EmailTemplateType })
  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}

// ============================================
// QUERY DTOs
// ============================================

export class GetEmailLogsDto {
  @ApiPropertyOptional({ enum: EmailTemplateType })
  @IsOptional()
  @IsEnum(EmailTemplateType)
  templateType?: EmailTemplateType;

  @ApiPropertyOptional({ enum: EmailLogStatus })
  @IsOptional()
  @IsEnum(EmailLogStatus)
  status?: EmailLogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientEmail?: string;

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

export class EmailTemplateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  htmlBody: string;

  @ApiProperty()
  textBody: string | null;

  @ApiProperty()
  variables: string[];

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class EmailLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  templateType: string;

  @ApiProperty()
  recipientEmail: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  sentAt: string | null;

  @ApiProperty()
  openedAt: string | null;

  @ApiProperty()
  clickedAt: string | null;

  @ApiProperty()
  errorMessage: string | null;

  @ApiProperty()
  createdAt: string;
}

export class EmailStatsResponseDto {
  @ApiProperty()
  totalSent: number;

  @ApiProperty()
  delivered: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  opened: number;

  @ApiProperty()
  clicked: number;

  @ApiProperty()
  openRate: string;

  @ApiProperty()
  clickRate: string;

  @ApiProperty()
  bounceRate: string;
}

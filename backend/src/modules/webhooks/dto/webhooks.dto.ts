import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsEnum,
  IsUrl,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export enum WebhookEventType {
  ORDER_CREATED = 'order.created',
  ORDER_PAID = 'order.paid',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_CANCELLED = 'order.cancelled',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  REFUND_REQUESTED = 'refund.requested',
  REFUND_PROCESSED = 'refund.processed',
  RETURN_REQUESTED = 'return.requested',
  RETURN_APPROVED = 'return.approved',
  RETURN_RECEIVED = 'return.received',
  REVIEW_CREATED = 'review.created',
}

export const ALL_WEBHOOK_EVENTS = Object.values(WebhookEventType);

export class RegisterWebhookDto {
  @ApiProperty({ example: 'https://example.com/webhook' })
  @IsNotEmpty()
  @IsString()
  @IsUrl({ require_tld: false })
  url: string;

  @ApiProperty({
    example: ['order.created', 'order.paid'],
    enum: WebhookEventType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(WebhookEventType, { each: true })
  events: WebhookEventType[];

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export interface WebhookEntity {
  id: string;
  vendor_id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDeliveryEntity {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  response_status: number | null;
  response_body: string | null;
  attempts: number;
  last_attempt_at: string | null;
  created_at: string;
}

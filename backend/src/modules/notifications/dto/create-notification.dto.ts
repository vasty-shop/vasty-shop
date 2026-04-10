import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'order_placed',
    enum: [
      'order_placed',
      'order_shipped',
      'order_delivered',
      'payment_success',
      'payment_failed',
      'refund_processed',
      'review_added',
      'shop_message',
      'offer_alert',
      'low_stock',
    ],
    description: 'Notification type',
  })
  @IsNotEmpty()
  @IsEnum([
    'order_placed',
    'order_shipped',
    'order_delivered',
    'payment_success',
    'payment_failed',
    'refund_processed',
    'review_added',
    'shop_message',
    'offer_alert',
    'low_stock',
  ])
  type: string;

  @ApiProperty({ example: 'Order Placed Successfully', description: 'Notification title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Your order #FLX-2024-00001 has been placed successfully',
    description: 'Notification message',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: { orderId: '507f1f77bcf86cd799439011', orderNumber: 'FLX-2024-00001' },
    description: 'Additional data',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '/orders/507f1f77bcf86cd799439011',
    description: 'Action URL or deep link',
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({
    example: 'normal',
    enum: ['low', 'normal', 'high', 'urgent'],
    description: 'Notification priority',
  })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;
}

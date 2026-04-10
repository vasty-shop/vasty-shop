import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// ENUMS
// ============================================

export enum ConversationType {
  CUSTOMER_VENDOR = 'customer_vendor',
  CUSTOMER_ADMIN = 'customer_admin',
  CUSTOMER_DELIVERY = 'customer_delivery',
  VENDOR_ADMIN = 'vendor_admin',
  ORDER_SUPPORT = 'order_support',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  SYSTEM = 'system',
  ORDER_INFO = 'order_info',
  PRODUCT_INFO = 'product_info',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

// ============================================
// DTOs
// ============================================

export class StartConversationDto {
  @ApiProperty({ enum: ConversationType })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiProperty({ description: 'Other participant ID (shop/admin/delivery man)' })
  @IsString()
  participantId: string;

  @ApiPropertyOptional({ description: 'Related order ID' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Related product ID' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Subject/Title' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'Initial message' })
  @IsString()
  @IsOptional()
  initialMessage?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsString()
  conversationId: string;

  @ApiProperty({ enum: MessageType })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiPropertyOptional({ description: 'Text content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Media URL (for images, files, etc)' })
  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'File name' })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Location data' })
  @IsObject()
  @IsOptional()
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };

  @ApiPropertyOptional({ description: 'Reply to message ID' })
  @IsString()
  @IsOptional()
  replyToMessageId?: string;

  @ApiPropertyOptional({ description: 'Order info for order_info type' })
  @IsObject()
  @IsOptional()
  orderInfo?: {
    orderId: string;
    orderNumber: string;
    status: string;
  };

  @ApiPropertyOptional({ description: 'Product info for product_info type' })
  @IsObject()
  @IsOptional()
  productInfo?: {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export class QueryConversationsDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: ConversationType })
  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType;

  @ApiPropertyOptional({ enum: ConversationStatus })
  @IsEnum(ConversationStatus)
  @IsOptional()
  status?: ConversationStatus;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Has unread messages' })
  @IsBoolean()
  @IsOptional()
  hasUnread?: boolean;
}

export class QueryMessagesDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Before message ID (for pagination)' })
  @IsString()
  @IsOptional()
  beforeMessageId?: string;
}

export class UpdateConversationDto {
  @ApiPropertyOptional({ enum: ConversationStatus })
  @IsEnum(ConversationStatus)
  @IsOptional()
  status?: ConversationStatus;

  @ApiPropertyOptional({ description: 'Subject/Title' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'Assigned admin ID' })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Priority (1-5)' })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class PredefinedMessageDto {
  @ApiProperty({ description: 'Message title/trigger' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ConversationType })
  @IsEnum(ConversationType)
  @IsOptional()
  conversationType?: ConversationType;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class ChatSettingsDto {
  @ApiPropertyOptional({ description: 'Enable customer-vendor chat' })
  @IsBoolean()
  @IsOptional()
  customerVendorChatEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable customer-admin chat' })
  @IsBoolean()
  @IsOptional()
  customerAdminChatEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable customer-delivery chat' })
  @IsBoolean()
  @IsOptional()
  customerDeliveryChatEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Max file size (MB)' })
  @IsNumber()
  @IsOptional()
  maxFileSizeMb?: number;

  @ApiPropertyOptional({ description: 'Allowed file types' })
  @IsArray()
  @IsOptional()
  allowedFileTypes?: string[];

  @ApiPropertyOptional({ description: 'Auto-close inactive conversations (hours)' })
  @IsNumber()
  @IsOptional()
  autoCloseAfterHours?: number;

  @ApiPropertyOptional({ description: 'Enable read receipts' })
  @IsBoolean()
  @IsOptional()
  enableReadReceipts?: boolean;

  @ApiPropertyOptional({ description: 'Enable typing indicators' })
  @IsBoolean()
  @IsOptional()
  enableTypingIndicators?: boolean;
}

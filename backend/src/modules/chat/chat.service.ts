import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  StartConversationDto,
  SendMessageDto,
  QueryConversationsDto,
  QueryMessagesDto,
  UpdateConversationDto,
  PredefinedMessageDto,
  ChatSettingsDto,
  ConversationType,
  ConversationStatus,
  MessageType,
} from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // CONVERSATIONS
  // ============================================

  /**
   * Start a new conversation
   */
  async startConversation(dto: StartConversationDto, userId: string) {
    // Check if conversation already exists
    const existing = await this.db.query_builder()
      .from('chat_conversations')
      .select('*')
      .where('type', dto.type)
      .where('participant_1_id', userId)
      .where('participant_2_id', dto.participantId)
      .where('status', ConversationStatus.ACTIVE)
      .get();

    if (existing && existing.length > 0) {
      // Return existing active conversation
      return {
        data: this.transformConversation(existing[0]),
        message: 'Existing conversation found',
        isExisting: true,
      };
    }

    // Get participant info
    let participant2Name = 'Unknown';
    let participant2Type = 'user';

    if (dto.type === ConversationType.CUSTOMER_VENDOR || dto.type === ConversationType.VENDOR_ADMIN) {
      const shop = await this.db.getEntity('shops', dto.participantId);
      if (shop) {
        participant2Name = shop.name;
        participant2Type = 'shop';
      }
    } else if (dto.type === ConversationType.CUSTOMER_DELIVERY) {
      const deliveryMan = await this.db.getEntity('delivery_men', dto.participantId);
      if (deliveryMan) {
        participant2Name = deliveryMan.name;
        participant2Type = 'delivery_man';
      }
    } else if (dto.type === ConversationType.CUSTOMER_ADMIN) {
      participant2Name = 'Support Team';
      participant2Type = 'admin';
    }

    // Create conversation
    const conversation = await this.db.createEntity('chat_conversations', {
      type: dto.type,
      participant_1_id: userId,
      participant_1_type: 'user',
      participant_2_id: dto.participantId,
      participant_2_type: participant2Type,
      participant_2_name: participant2Name,
      order_id: dto.orderId,
      product_id: dto.productId,
      subject: dto.subject,
      status: ConversationStatus.ACTIVE,
      unread_count_1: 0,
      unread_count_2: dto.initialMessage ? 1 : 0,
      last_message_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send initial message if provided
    if (dto.initialMessage) {
      await this.sendMessage({
        conversationId: conversation.id,
        type: MessageType.TEXT,
        content: dto.initialMessage,
      }, userId);
    }

    return {
      data: this.transformConversation(conversation),
      message: 'Conversation started',
      isExisting: false,
    };
  }

  /**
   * Get user's conversations
   */
  async getConversations(userId: string, query: QueryConversationsDto) {
    const { page = 1, limit = 20, type, status, search, hasUnread } = query;
    const offset = (page - 1) * limit;

    // Get conversations where user is either participant
    let queryBuilder = this.db.query_builder()
      .from('chat_conversations')
      .select('*');

    // Filter by participant
    // Note: This is a simplified approach - in production you'd want a more efficient query
    const conversations = await queryBuilder.get();

    let filtered = (conversations || []).filter((c: any) =>
      c.participant_1_id === userId || c.participant_2_id === userId
    );

    if (type) {
      filtered = filtered.filter((c: any) => c.type === type);
    }

    if (status) {
      filtered = filtered.filter((c: any) => c.status === status);
    } else {
      // Default to active conversations
      filtered = filtered.filter((c: any) => c.status !== ConversationStatus.ARCHIVED);
    }

    if (hasUnread) {
      filtered = filtered.filter((c: any) => {
        if (c.participant_1_id === userId) return c.unread_count_1 > 0;
        return c.unread_count_2 > 0;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.subject?.toLowerCase().includes(searchLower) ||
        c.participant_2_name?.toLowerCase().includes(searchLower) ||
        c.last_message?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by last message
    filtered.sort((a: any, b: any) =>
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    // Paginate
    const paginated = filtered.slice(offset, offset + limit);

    return {
      data: paginated.map((c: any) => ({
        ...this.transformConversation(c),
        unreadCount: c.participant_1_id === userId ? c.unread_count_1 : c.unread_count_2,
        isParticipant1: c.participant_1_id === userId,
      })),
      total: filtered.length,
      page,
      limit,
    };
  }

  /**
   * Get conversation by ID
   */
  async getConversation(id: string, userId: string) {
    const conversation = await this.db.getEntity('chat_conversations', id);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is participant
    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      throw new ForbiddenException('Not authorized to view this conversation');
    }

    // Get related data
    let orderData = null;
    let productData = null;

    if (conversation.order_id) {
      orderData = await this.db.getEntity('orders', conversation.order_id);
    }

    if (conversation.product_id) {
      productData = await this.db.getEntity('products', conversation.product_id);
    }

    return {
      data: {
        ...this.transformConversation(conversation),
        unreadCount: conversation.participant_1_id === userId
          ? conversation.unread_count_1
          : conversation.unread_count_2,
        isParticipant1: conversation.participant_1_id === userId,
        order: orderData,
        product: productData,
      },
    };
  }

  /**
   * Update conversation
   */
  async updateConversation(id: string, dto: UpdateConversationDto, userId: string) {
    const conversation = await this.db.getEntity('chat_conversations', id);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is participant or admin
    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      throw new ForbiddenException('Not authorized to update this conversation');
    }

    const updates: any = { updated_at: new Date() };

    if (dto.status) updates.status = dto.status;
    if (dto.subject) updates.subject = dto.subject;
    if (dto.assignedTo) updates.assigned_to = dto.assignedTo;
    if (dto.priority !== undefined) updates.priority = dto.priority;
    if (dto.tags) updates.tags = dto.tags;

    if (dto.status === ConversationStatus.CLOSED) {
      updates.closed_at = new Date();
    }

    const updated = await this.db.updateEntity('chat_conversations', id, updates);

    return {
      data: this.transformConversation(updated),
      message: 'Conversation updated',
    };
  }

  /**
   * Close conversation
   */
  async closeConversation(id: string, userId: string) {
    return this.updateConversation(id, { status: ConversationStatus.CLOSED }, userId);
  }

  /**
   * Archive conversation
   */
  async archiveConversation(id: string, userId: string) {
    return this.updateConversation(id, { status: ConversationStatus.ARCHIVED }, userId);
  }

  // ============================================
  // MESSAGES
  // ============================================

  /**
   * Send a message
   */
  async sendMessage(dto: SendMessageDto, senderId: string) {
    const conversation = await this.db.getEntity('chat_conversations', dto.conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify sender is participant
    if (conversation.participant_1_id !== senderId && conversation.participant_2_id !== senderId) {
      throw new ForbiddenException('Not authorized to send message in this conversation');
    }

    // Validate content based on type
    if (dto.type === MessageType.TEXT && !dto.content) {
      throw new BadRequestException('Text content is required');
    }

    if ([MessageType.IMAGE, MessageType.FILE, MessageType.AUDIO, MessageType.VIDEO].includes(dto.type) && !dto.mediaUrl) {
      throw new BadRequestException('Media URL is required');
    }

    // Determine receiver
    const receiverId = conversation.participant_1_id === senderId
      ? conversation.participant_2_id
      : conversation.participant_1_id;

    const isFromParticipant1 = conversation.participant_1_id === senderId;

    // Create message
    const message = await this.db.createEntity('chat_messages', {
      conversation_id: dto.conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      type: dto.type,
      content: dto.content,
      media_url: dto.mediaUrl,
      file_name: dto.fileName,
      file_size: dto.fileSize,
      mime_type: dto.mimeType,
      location: dto.location,
      reply_to_message_id: dto.replyToMessageId,
      order_info: dto.orderInfo,
      product_info: dto.productInfo,
      is_read: false,
      created_at: new Date(),
    });

    // Update conversation
    const unreadField = isFromParticipant1 ? 'unread_count_2' : 'unread_count_1';
    const currentUnread = isFromParticipant1 ? conversation.unread_count_2 : conversation.unread_count_1;

    await this.db.updateEntity('chat_conversations', dto.conversationId, {
      last_message: dto.content?.substring(0, 100) || `[${dto.type}]`,
      last_message_at: new Date(),
      last_message_sender_id: senderId,
      [unreadField]: (currentUnread || 0) + 1,
      updated_at: new Date(),
    });

    // TODO: Send real-time notification via WebSocket
    // TODO: Send push notification

    return {
      data: this.transformMessage(message),
      message: 'Message sent',
    };
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, userId: string, query: QueryMessagesDto) {
    const { page = 1, limit = 50, beforeMessageId } = query;
    const offset = (page - 1) * limit;

    const conversation = await this.db.getEntity('chat_conversations', conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is participant
    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      throw new ForbiddenException('Not authorized to view messages');
    }

    let queryBuilder = this.db.query_builder()
      .from('chat_messages')
      .select('*')
      .where('conversation_id', conversationId);

    if (beforeMessageId) {
      // Get messages before a specific message (for infinite scroll)
      const beforeMessage = await this.db.getEntity('chat_messages', beforeMessageId);
      if (beforeMessage) {
        queryBuilder = queryBuilder.where('created_at', '<', beforeMessage.created_at);
      }
    }

    const messages = await queryBuilder
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    // Get reply-to messages if any
    const replyToIds = (messages || [])
      .filter((m: any) => m.reply_to_message_id)
      .map((m: any) => m.reply_to_message_id);

    let replyToMessages: Record<string, any> = {};
    if (replyToIds.length > 0) {
      for (const id of replyToIds) {
        const replyMsg = await this.db.getEntity('chat_messages', id);
        if (replyMsg) {
          replyToMessages[id] = this.transformMessage(replyMsg);
        }
      }
    }

    return {
      data: (messages || []).map((m: any) => ({
        ...this.transformMessage(m),
        replyToMessage: m.reply_to_message_id ? replyToMessages[m.reply_to_message_id] : null,
        isMine: m.sender_id === userId,
      })).reverse(), // Reverse for chronological order
      page,
      limit,
      hasMore: (messages?.length || 0) === limit,
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.db.getEntity('chat_conversations', conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is participant
    if (conversation.participant_1_id !== userId && conversation.participant_2_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Mark all unread messages as read
    const unreadMessages = await this.db.query_builder()
      .from('chat_messages')
      .select('id')
      .where('conversation_id', conversationId)
      .where('receiver_id', userId)
      .where('is_read', false)
      .get();

    for (const msg of (unreadMessages || [])) {
      await this.db.updateEntity('chat_messages', msg.id, {
        is_read: true,
        read_at: new Date(),
      });
    }

    // Reset unread count
    const unreadField = conversation.participant_1_id === userId ? 'unread_count_1' : 'unread_count_2';
    await this.db.updateEntity('chat_conversations', conversationId, {
      [unreadField]: 0,
      updated_at: new Date(),
    });

    return {
      message: 'Messages marked as read',
      count: unreadMessages?.length || 0,
    };
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.db.getEntity('chat_messages', messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenException('Can only delete your own messages');
    }

    await this.db.updateEntity('chat_messages', messageId, {
      is_deleted: true,
      deleted_at: new Date(),
      content: '[Message deleted]',
      media_url: null,
    });

    return { message: 'Message deleted' };
  }

  // ============================================
  // PREDEFINED MESSAGES
  // ============================================

  /**
   * Create predefined message
   */
  async createPredefinedMessage(dto: PredefinedMessageDto) {
    const message = await this.db.createEntity('chat_predefined_messages', {
      title: dto.title,
      content: dto.content,
      conversation_type: dto.conversationType,
      is_active: dto.isActive !== false,
      sort_order: dto.sortOrder || 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return { data: message, message: 'Predefined message created' };
  }

  /**
   * Get predefined messages
   */
  async getPredefinedMessages(conversationType?: ConversationType) {
    let queryBuilder = this.db.query_builder()
      .from('chat_predefined_messages')
      .select('*')
      .where('is_active', true);

    if (conversationType) {
      queryBuilder = queryBuilder.where('conversation_type', conversationType);
    }

    const messages = await queryBuilder
      .orderBy('sort_order', 'ASC')
      .get();

    return { data: messages || [] };
  }

  /**
   * Update predefined message
   */
  async updatePredefinedMessage(id: string, dto: Partial<PredefinedMessageDto>) {
    const message = await this.db.getEntity('chat_predefined_messages', id);

    if (!message) {
      throw new NotFoundException('Predefined message not found');
    }

    const updates: any = { updated_at: new Date() };
    if (dto.title) updates.title = dto.title;
    if (dto.content) updates.content = dto.content;
    if (dto.conversationType) updates.conversation_type = dto.conversationType;
    if (dto.isActive !== undefined) updates.is_active = dto.isActive;
    if (dto.sortOrder !== undefined) updates.sort_order = dto.sortOrder;

    const updated = await this.db.updateEntity('chat_predefined_messages', id, updates);

    return { data: updated, message: 'Predefined message updated' };
  }

  /**
   * Delete predefined message
   */
  async deletePredefinedMessage(id: string) {
    await this.db.updateEntity('chat_predefined_messages', id, {
      is_active: false,
      deleted_at: new Date(),
    });

    return { message: 'Predefined message deleted' };
  }

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * Get chat settings
   */
  async getSettings() {
    const settings = await this.db.query_builder()
      .from('settings')
      .select('*')
      .where('key', 'chat_settings')
      .get();

    if (settings && settings.length > 0) {
      return { data: settings[0].value };
    }

    return {
      data: {
        customerVendorChatEnabled: true,
        customerAdminChatEnabled: true,
        customerDeliveryChatEnabled: true,
        maxFileSizeMb: 10,
        allowedFileTypes: ['image/*', 'application/pdf', 'audio/*', 'video/*'],
        autoCloseAfterHours: 48,
        enableReadReceipts: true,
        enableTypingIndicators: true,
      },
    };
  }

  /**
   * Update chat settings
   */
  async updateSettings(dto: ChatSettingsDto) {
    const currentSettings = (await this.getSettings()).data;
    const newSettings = { ...currentSettings, ...dto };

    const existing = await this.db.query_builder()
      .from('settings')
      .select('id')
      .where('key', 'chat_settings')
      .get();

    if (existing && existing.length > 0) {
      await this.db.updateEntity('settings', existing[0].id, {
        value: newSettings,
        updated_at: new Date(),
      });
    } else {
      await this.db.createEntity('settings', {
        key: 'chat_settings',
        value: newSettings,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return { data: newSettings, message: 'Settings updated' };
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get chat statistics (admin)
   */
  async getStats(period?: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get conversations in period
    const conversations = await this.db.query_builder()
      .from('chat_conversations')
      .select('*')
      .where('created_at', '>=', startDate.toISOString())
      .get();

    // Get messages in period
    const messages = await this.db.query_builder()
      .from('chat_messages')
      .select('*')
      .where('created_at', '>=', startDate.toISOString())
      .get();

    const stats = {
      totalConversations: conversations?.length || 0,
      activeConversations: (conversations || []).filter((c: any) => c.status === ConversationStatus.ACTIVE).length,
      closedConversations: (conversations || []).filter((c: any) => c.status === ConversationStatus.CLOSED).length,
      totalMessages: messages?.length || 0,
      byType: this.groupByType(conversations || []),
      averageResponseTime: 0, // TODO: Calculate
    };

    return { data: stats };
  }

  private groupByType(conversations: any[]): Record<string, number> {
    return conversations.reduce((acc: Record<string, number>, c: any) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformConversation(c: any) {
    return {
      id: c.id,
      type: c.type,
      participant1Id: c.participant_1_id,
      participant1Type: c.participant_1_type,
      participant2Id: c.participant_2_id,
      participant2Type: c.participant_2_type,
      participant2Name: c.participant_2_name,
      orderId: c.order_id,
      productId: c.product_id,
      subject: c.subject,
      status: c.status,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      lastMessageSenderId: c.last_message_sender_id,
      assignedTo: c.assigned_to,
      priority: c.priority,
      tags: c.tags,
      closedAt: c.closed_at,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    };
  }

  private transformMessage(m: any) {
    return {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      type: m.type,
      content: m.content,
      mediaUrl: m.media_url,
      fileName: m.file_name,
      fileSize: m.file_size,
      mimeType: m.mime_type,
      location: m.location,
      replyToMessageId: m.reply_to_message_id,
      orderInfo: m.order_info,
      productInfo: m.product_info,
      isRead: m.is_read,
      readAt: m.read_at,
      isDeleted: m.is_deleted,
      createdAt: m.created_at,
    };
  }
}

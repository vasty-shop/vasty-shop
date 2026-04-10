import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationPayload } from './types/auth.types';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Send notification to specific user via WebSocket
   */
  sendNotificationToUser(userId: string, notification: NotificationPayload): void {
    try {
      this.notificationGateway.sendToUser(userId, notification);
      this.logger.debug(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: NotificationPayload): void {
    try {
      this.notificationGateway.sendToUsers(userIds, notification);
      this.logger.debug(`Notification sent to ${userIds.length} users: ${notification.title}`);
    } catch (error) {
      this.logger.error('Failed to send notification to multiple users:', error);
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcastNotification(notification: NotificationPayload): void {
    try {
      this.notificationGateway.broadcast(notification);
      this.logger.debug(`Notification broadcasted: ${notification.title}`);
    } catch (error) {
      this.logger.error('Failed to broadcast notification:', error);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.notificationGateway.isUserOnline(userId);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return this.notificationGateway.getConnectionStats();
  }

  /**
   * Send order notification
   */
  sendOrderNotification(
    userId: string,
    type: string,
    orderNumber: string,
    data: any,
  ): void {
    const titles = {
      order_created: 'Order Created',
      order_updated: 'Order Updated',
      order_shipped: 'Order Shipped',
      order_delivered: 'Order Delivered',
      order_cancelled: 'Order Cancelled',
    };

    const messages = {
      order_created: `Your order ${orderNumber} has been placed successfully`,
      order_updated: `Your order ${orderNumber} has been updated`,
      order_shipped: `Your order ${orderNumber} has been shipped`,
      order_delivered: `Your order ${orderNumber} has been delivered`,
      order_cancelled: `Your order ${orderNumber} has been cancelled`,
    };

    const notification: NotificationPayload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: titles[type] || 'Order Notification',
      message: messages[type] || `Order ${orderNumber} notification`,
      data,
      priority: 'normal',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: `/orders/${data.orderId}`,
    };

    this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send payment notification
   */
  sendPaymentNotification(
    userId: string,
    type: string,
    orderNumber: string,
    amount: number,
    data: any,
  ): void {
    const titles = {
      payment_success: 'Payment Successful',
      payment_failed: 'Payment Failed',
      refund_processed: 'Refund Processed',
    };

    const messages = {
      payment_success: `Your payment of $${amount} for order ${orderNumber} was successful`,
      payment_failed: `Payment of $${amount} for order ${orderNumber} failed`,
      refund_processed: `Refund of $${amount} for order ${orderNumber} has been processed`,
    };

    const notification: NotificationPayload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: titles[type] || 'Payment Notification',
      message: messages[type] || `Payment notification for order ${orderNumber}`,
      data,
      priority: type === 'payment_failed' ? 'high' : 'normal',
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: `/orders/${data.orderId}`,
    };

    this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send system announcement
   */
  sendSystemAnnouncement(title: string, message: string, data?: any): void {
    const notification: NotificationPayload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'system_announcement',
      title,
      message,
      data,
      priority: 'normal',
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.broadcastNotification(notification);
  }
}

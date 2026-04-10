import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  EntityType,
  NotificationEntity,
  NotificationType,
  NotificationPriority,
  OrderEntity,
  PaymentTransactionEntity,
} from '../../database/schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RealtimeService } from '../realtime/realtime.service';
import { NotificationPayload } from '../realtime/types/auth.types';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => RealtimeService))
    private readonly realtimeService: RealtimeService,
    private readonly currencyService: CurrencyService,
  ) {}

  // ============================================
  // EMAIL TEMPLATE HELPERS
  // ============================================

  /**
   * Send email with HTML template
   */
  private async sendEmailNotification(
    to: string,
    subject: string,
    content: { heading: string; body: string; actionUrl?: string; actionText?: string },
  ): Promise<void> {
    try {
      const html = this.generateEmailTemplate(content);
      await /* TODO: use EmailService */ this.db.sendEmail(to, subject, html);
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      // Don't throw - email failure shouldn't break notification flow
    }
  }

  /**
   * Generate branded HTML email template
   */
  private generateEmailTemplate(content: {
    heading: string;
    body: string;
    actionUrl?: string;
    actionText?: string;
  }): string {
    const actionButton = content.actionUrl && content.actionText
      ? `<a href="${content.actionUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">${content.actionText}</a>`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Vasty Shop</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">${content.heading}</h2>
              <div style="color: #52525b; font-size: 16px; line-height: 1.6;">${content.body}</div>
              ${actionButton}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f5f5f5; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                This email was sent by Vasty Shop.<br>
                If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Create a new notification
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationEntity> {
    try {
      const notificationData: Partial<NotificationEntity> = {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type as NotificationType,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        data: createNotificationDto.data || {},
        actionUrl: createNotificationDto.actionUrl,
        priority: (createNotificationDto.priority as NotificationPriority) || NotificationPriority.NORMAL,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const notification = await this.db.createEntity(
        EntityType.NOTIFICATION,
        notificationData,
      );

      this.logger.log(
        `Notification created for user ${createNotificationDto.userId}: ${createNotificationDto.type}`,
      );

      // Send real-time notification via WebSocket
      const realtimePayload: NotificationPayload = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority as any,
        timestamp: notification.createdAt,
        read: notification.isRead,
        actionUrl: notification.actionUrl,
      };

      this.realtimeService.sendNotificationToUser(
        createNotificationDto.userId,
        realtimePayload,
      );

      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw new BadRequestException('Failed to create notification');
    }
  }

  /**
   * Get user notifications with pagination
   */
  async findUserNotifications(userId: string, query: any) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = query;

      const filters: any = { userId };
      if (unreadOnly) {
        filters.isRead = false;
      }

      const result = await this.db.queryEntities(EntityType.NOTIFICATION, {
        filters,
        limit,
        offset,
      });

      return {
        data: result.data || [],
        total: result.count || 0,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Failed to get user notifications', error);
      return {
        data: [],
        total: 0,
        limit: query.limit || 20,
        offset: query.offset || 0,
      };
    }
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    try {
      const result = await this.db.queryEntities(EntityType.NOTIFICATION, {
        filters: { userId, isRead: false },
      });

      return { count: result.count || 0 };
    } catch (error) {
      this.logger.error('Failed to get unread count', error);
      return { count: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    try {
      const notification = await this.db.getEntity(EntityType.NOTIFICATION, id);

      if (!notification || notification.userId !== userId) {
        throw new NotFoundException('Notification not found');
      }

      if (notification.isRead) {
        return notification; // Already read
      }

      const updatedNotification = await this.db.updateEntity(
        EntityType.NOTIFICATION,
        id,
        {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      );

      this.logger.log(`Notification marked as read: ${id}`);

      return updatedNotification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to mark notification as read', error);
      throw new BadRequestException('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ message: string; count: number }> {
    try {
      const result = await this.db.queryEntities(EntityType.NOTIFICATION, {
        filters: { userId, isRead: false },
      });

      const notifications = result.data || [];
      let count = 0;

      for (const notification of notifications) {
        await this.db.updateEntity(EntityType.NOTIFICATION, notification.id, {
          isRead: true,
          readAt: new Date().toISOString(),
        });
        count++;
      }

      this.logger.log(`${count} notifications marked as read for user ${userId}`);

      return {
        message: 'All notifications marked as read',
        count,
      };
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', error);
      throw new BadRequestException('Failed to mark all notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string): Promise<{ message: string }> {
    try {
      const notification = await this.db.getEntity(EntityType.NOTIFICATION, id);

      if (!notification || notification.userId !== userId) {
        throw new NotFoundException('Notification not found');
      }

      await this.db.deleteEntity(EntityType.NOTIFICATION, id);

      this.logger.log(`Notification deleted: ${id}`);

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to delete notification', error);
      throw new BadRequestException('Failed to delete notification');
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId: string): Promise<{ message: string; count: number }> {
    try {
      const result = await this.db.queryEntities(EntityType.NOTIFICATION, {
        filters: { userId },
      });

      const notifications = result.data || [];
      let count = 0;

      for (const notification of notifications) {
        await this.db.deleteEntity(EntityType.NOTIFICATION, notification.id);
        count++;
      }

      this.logger.log(`${count} notifications cleared for user ${userId}`);

      return {
        message: 'All notifications cleared',
        count,
      };
    } catch (error) {
      this.logger.error('Failed to clear all notifications', error);
      throw new BadRequestException('Failed to clear all notifications');
    }
  }

  // ============================================
  // HELPER METHODS FOR SPECIFIC NOTIFICATIONS
  // ============================================

  /**
   * Send order notification (database + WebSocket + Email)
   */
  async sendOrderNotification(orderId: string, type: NotificationType) {
    try {
      const order = (await this.db.getEntity(
        EntityType.ORDER,
        orderId,
      )) as OrderEntity;

      if (!order) {
        this.logger.warn(`Order not found for notification: ${orderId}`);
        return;
      }

      // Get user email for notifications
      const user = await this.db.getUserById(order.userId);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      let title = '';
      let message = '';
      let actionUrl = `/orders/${orderId}`;

      switch (type) {
        case NotificationType.ORDER_CREATED:
        case NotificationType.ORDER_PLACED:
          title = 'Order Placed Successfully';
          message = `Your order ${order.orderNumber} has been placed successfully. Total: ${this.currencyService.formatCurrency(order.total)}`;

          // Send order confirmation email
          if (user?.email) {
            await this.sendEmailNotification(
              user.email,
              `Order Confirmation - ${order.orderNumber}`,
              {
                heading: 'Thank you for your order!',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
                  <p><strong>Order Total:</strong> ${this.currencyService.formatCurrency(order.total)}</p>
                  <p>We'll send you another email when your order ships.</p>
                `,
                actionUrl: `${frontendUrl}/orders/${order.id}`,
                actionText: 'View Order Details',
              },
            );
          }
          break;
        case NotificationType.ORDER_UPDATED:
          title = 'Order Updated';
          message = `Your order ${order.orderNumber} has been updated. Status: ${order.status}`;
          // No email for general updates, just in-app notification
          break;
        case NotificationType.ORDER_SHIPPED:
          title = 'Order Shipped';
          message = order.trackingNumber
            ? `Your order ${order.orderNumber} has been shipped. Tracking: ${order.trackingNumber}`
            : `Your order ${order.orderNumber} has been shipped.`;

          // Send shipping email
          if (user?.email) {
            const trackingInfo = order.trackingNumber
              ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
              : '';
            const carrierInfo = order.carrier
              ? `<p><strong>Carrier:</strong> ${order.carrier}</p>`
              : '';

            await this.sendEmailNotification(
              user.email,
              `Your Order Has Shipped - ${order.orderNumber}`,
              {
                heading: 'Your order is on its way!',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Great news! Your order <strong>#${order.orderNumber}</strong> has been shipped.</p>
                  ${trackingInfo}
                  ${carrierInfo}
                  <p>You can track your order using the link below.</p>
                `,
                actionUrl: `${frontendUrl}/orders/${order.id}/track`,
                actionText: 'Track Your Order',
              },
            );
          }
          break;
        case NotificationType.ORDER_DELIVERED:
          title = 'Order Delivered';
          message = `Your order ${order.orderNumber} has been delivered. Enjoy your purchase!`;

          // Send delivery email
          if (user?.email) {
            await this.sendEmailNotification(
              user.email,
              `Order Delivered - ${order.orderNumber}`,
              {
                heading: 'Your order has been delivered!',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Your order <strong>#${order.orderNumber}</strong> has been delivered.</p>
                  <p>We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
                  <p>We'd love to hear your feedback - please consider leaving a review.</p>
                `,
                actionUrl: `${frontendUrl}/orders/${order.id}`,
                actionText: 'Leave a Review',
              },
            );
          }
          break;
        case NotificationType.ORDER_CANCELLED:
          title = 'Order Cancelled';
          message = `Your order ${order.orderNumber} has been cancelled.`;

          // Send cancellation email
          if (user?.email) {
            await this.sendEmailNotification(
              user.email,
              `Order Cancelled - ${order.orderNumber}`,
              {
                heading: 'Your order has been cancelled',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
                  <p>If you paid for this order, a refund will be processed within 5-10 business days.</p>
                  <p>If you didn't request this cancellation or have any questions, please contact our support team.</p>
                `,
                actionUrl: `${frontendUrl}/orders`,
                actionText: 'View Your Orders',
              },
            );
          }
          break;
        default:
          return;
      }

      // Create in-app notification (which also sends WebSocket)
      await this.create({
        userId: order.userId,
        type,
        title,
        message,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          trackingNumber: order.trackingNumber,
          carrier: order.carrier,
          itemCount: order.items?.length || 0,
          deliveryMethod: order.deliveryMethod,
        },
        actionUrl,
        priority: type === NotificationType.ORDER_CANCELLED
          ? NotificationPriority.HIGH
          : NotificationPriority.NORMAL,
      });
    } catch (error) {
      this.logger.error('Failed to send order notification', error);
    }
  }

  /**
   * Send notification to vendor(s) when a new order is placed
   */
  async sendVendorOrderNotification(orderId: string, type: NotificationType) {
    try {
      const order = (await this.db.getEntity(
        EntityType.ORDER,
        orderId,
      )) as OrderEntity;

      if (!order) {
        this.logger.warn(`Order not found for vendor notification: ${orderId}`);
        return;
      }

      // Get unique shopIds from order items
      const shopIds = new Set<string>();
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const shopId = item.shopId || item.shop_id;
          if (shopId) {
            shopIds.add(shopId);
          }
        }
      }

      if (shopIds.size === 0) {
        this.logger.warn(`No shop IDs found in order ${orderId} for vendor notification`);
        return;
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      // Notify each shop owner
      for (const shopId of shopIds) {
        try {
          const shop = await this.db.getEntity(EntityType.SHOP, shopId);
          if (!shop) {
            this.logger.warn(`Shop ${shopId} not found for vendor notification`);
            continue;
          }

          const ownerId = shop.owner_id || shop.ownerId;
          if (!ownerId) {
            this.logger.warn(`Shop ${shopId} has no owner for vendor notification`);
            continue;
          }

          // Get shop owner for email
          const owner = await this.db.getUserById(ownerId);

          let title = '';
          let message = '';
          const actionUrl = `/vendor/orders`;

          switch (type) {
            case NotificationType.ORDER_CREATED:
            case NotificationType.ORDER_PLACED:
              title = 'New Order Received!';
              message = `You have received a new order #${order.orderNumber}. Total: ${this.currencyService.formatCurrency(order.total)}`;

              // Send email to vendor
              if (owner?.email) {
                await this.sendEmailNotification(
                  owner.email,
                  `New Order Received - #${order.orderNumber}`,
                  {
                    heading: 'You have a new order!',
                    body: `
                      <p>Hi ${owner.name || shop.name || 'Vendor'},</p>
                      <p>Great news! You have received a new order.</p>
                      <p><strong>Order Number:</strong> #${order.orderNumber}</p>
                      <p><strong>Order Total:</strong> ${this.currencyService.formatCurrency(order.total)}</p>
                      <p><strong>Items:</strong> ${order.items?.length || 0} item(s)</p>
                      <p>Please review and process this order as soon as possible.</p>
                    `,
                    actionUrl: `${frontendUrl}/vendor/orders`,
                    actionText: 'View Order',
                  },
                );
              }
              break;
            case NotificationType.ORDER_CANCELLED:
              title = 'Order Cancelled';
              message = `Order #${order.orderNumber} has been cancelled.`;
              break;
            default:
              continue;
          }

          // Create in-app notification for vendor (which also sends WebSocket)
          await this.create({
            userId: ownerId,
            type,
            title,
            message,
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              total: order.total,
              status: order.status,
              itemCount: order.items?.length || 0,
              shopId: shopId,
              shopName: shop.name,
              isVendorNotification: true,
            },
            actionUrl,
            priority: NotificationPriority.HIGH,
          });

          this.logger.log(`Vendor notification sent to owner ${ownerId} for shop ${shopId}`);
        } catch (shopError) {
          this.logger.error(`Failed to notify shop ${shopId} owner:`, shopError);
        }
      }
    } catch (error) {
      this.logger.error('Failed to send vendor order notification', error);
    }
  }

  /**
   * Send payment notification (database + WebSocket + Email)
   */
  async sendPaymentNotification(transactionId: string, type: NotificationType) {
    try {
      const transaction = (await this.db.getEntity(
        EntityType.PAYMENT,
        transactionId,
      )) as PaymentTransactionEntity;

      if (!transaction) {
        this.logger.warn(`Transaction not found for notification: ${transactionId}`);
        return;
      }

      // Get user and order for email context
      const user = await this.db.getUserById(transaction.userId);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      const order = transaction.orderId
        ? ((await this.db.getEntity(
            EntityType.ORDER,
            transaction.orderId,
          )) as OrderEntity)
        : null;

      let title = '';
      let message = '';
      let priority = NotificationPriority.NORMAL;
      const actionUrl = `/orders/${transaction.orderId}`;
      const formattedAmount = this.currencyService.formatCurrency(transaction.amount, transaction.currency || 'USD');

      switch (type) {
        case NotificationType.PAYMENT_SUCCESS:
          title = 'Payment Successful';
          message = `Your payment of ${formattedAmount} has been processed successfully.`;

          // Send payment success email
          if (user?.email) {
            await this.sendEmailNotification(
              user.email,
              'Payment Confirmation',
              {
                heading: 'Payment Successful!',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Your payment of <strong>${formattedAmount}</strong> has been processed successfully.</p>
                  ${order ? `<p><strong>Order:</strong> #${order.orderNumber}</p>` : ''}
                  <p>Thank you for your purchase!</p>
                `,
                actionUrl: order ? `${frontendUrl}/orders/${order.id}` : `${frontendUrl}/orders`,
                actionText: 'View Order',
              },
            );
          }
          break;
        case NotificationType.PAYMENT_FAILED:
          title = 'Payment Failed';
          message = `Your payment of ${formattedAmount} has failed. Please try again.`;
          priority = NotificationPriority.HIGH;

          // Send payment failed email
          if (user?.email) {
            await this.sendEmailNotification(
              user.email,
              'Payment Failed - Action Required',
              {
                heading: 'Payment Failed',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Unfortunately, your payment of <strong>${formattedAmount}</strong> could not be processed.</p>
                  <p>Please check your payment details and try again. If the problem persists, please contact your bank or try a different payment method.</p>
                `,
                actionUrl: order ? `${frontendUrl}/checkout` : `${frontendUrl}/cart`,
                actionText: 'Retry Payment',
              },
            );
          }
          break;
        case NotificationType.REFUND_PROCESSED:
          title = 'Refund Processed';
          const refundAmount = this.currencyService.formatCurrency(transaction.refundAmount || transaction.amount, transaction.currency || 'USD');
          message = `Your refund of ${refundAmount} has been processed.`;

          // Send refund email
          if (user?.email) {
            await this.sendEmailNotification(
              user.email,
              'Refund Processed',
              {
                heading: 'Your Refund Has Been Processed',
                body: `
                  <p>Hi ${user.name || 'there'},</p>
                  <p>Your refund of <strong>${refundAmount}</strong> has been processed.</p>
                  ${order ? `<p><strong>Order:</strong> #${order.orderNumber}</p>` : ''}
                  <p>Please allow 5-10 business days for the refund to appear in your account.</p>
                `,
                actionUrl: order ? `${frontendUrl}/orders/${order.id}` : `${frontendUrl}/orders`,
                actionText: 'View Order Details',
              },
            );
          }
          break;
        default:
          return;
      }

      // Create in-app notification (which also sends WebSocket)
      await this.create({
        userId: transaction.userId,
        type,
        title,
        message,
        data: {
          transactionId: transaction.id,
          orderId: transaction.orderId,
          amount: transaction.amount,
          currency: transaction.currency || 'USD',
          paymentMethod: transaction.method,
          provider: transaction.provider,
          refundAmount: transaction.refundAmount,
          refundReason: transaction.refundReason,
          orderNumber: order?.orderNumber,
        },
        actionUrl,
        priority,
      });
    } catch (error) {
      this.logger.error('Failed to send payment notification', error);
    }
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>,
    actionUrl?: string,
  ) {
    try {
      await this.create({
        userId,
        type: NotificationType.SHOP_MESSAGE,
        title,
        message,
        data,
        actionUrl,
        priority: NotificationPriority.NORMAL,
      });
    } catch (error) {
      this.logger.error('Failed to send custom notification', error);
    }
  }
}

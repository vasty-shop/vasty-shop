import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard, SocketRateLimit } from '../guards/socket-auth.guard';
import { AuthContext, NotificationPayload } from '../types/auth.types';

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private readonly connectedClients = new Map<string, Socket>();
  private readonly userSockets = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    try {
      // Authenticate using guard
      const guard = new SocketAuthGuard(
        (client as any).jwtService,
        (client as any).configService,
      );

      this.logger.log(`Client attempting to connect to notifications: ${client.id}`);

      // Store client
      this.connectedClients.set(client.id, client);

      // Emit connection event
      client.emit('connection:status', {
        connected: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const authContext = client.data?.authContext as AuthContext;

      // Remove from tracking
      this.connectedClients.delete(client.id);

      if (authContext?.userId) {
        const userSockets = this.userSockets.get(authContext.userId);
        if (userSockets) {
          userSockets.delete(client.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(authContext.userId);
          }
        }
      }

      this.logger.log(`Client disconnected from notifications: ${client.id}`);
    } catch (error) {
      this.logger.error(`Disconnect error: ${error.message}`);
    }
  }

  /**
   * Subscribe to user notifications
   */
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('subscribe')
  async handleSubscribe(@ConnectedSocket() client: Socket) {
    try {
      const authContext = client.data.authContext as AuthContext;

      if (!authContext?.userId) {
        client.emit('notification:error', { message: 'Authentication required' });
        return;
      }

      // Track user socket
      if (!this.userSockets.has(authContext.userId)) {
        this.userSockets.set(authContext.userId, new Set());
      }
      this.userSockets.get(authContext.userId).add(client.id);

      // Join user-specific room
      await client.join(`user-${authContext.userId}`);

      client.emit('notification:subscribed', {
        userId: authContext.userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`User ${authContext.userId} subscribed to notifications`);
    } catch (error) {
      this.logger.error('Error subscribing to notifications:', error);
      client.emit('notification:error', { message: 'Failed to subscribe' });
    }
  }

  /**
   * Unsubscribe from notifications
   */
  @UseGuards(SocketAuthGuard)
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(@ConnectedSocket() client: Socket) {
    try {
      const authContext = client.data.authContext as AuthContext;

      if (authContext?.userId) {
        await client.leave(`user-${authContext.userId}`);

        const userSockets = this.userSockets.get(authContext.userId);
        if (userSockets) {
          userSockets.delete(client.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(authContext.userId);
          }
        }
      }

      client.emit('notification:unsubscribed', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error unsubscribing from notifications:', error);
      client.emit('notification:error', { message: 'Failed to unsubscribe' });
    }
  }

  /**
   * Mark notification as read
   */
  @UseGuards(SocketAuthGuard)
  @SocketRateLimit(100, 60000)
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const authContext = client.data.authContext as AuthContext;
      const { notificationId } = data;

      if (!notificationId) {
        client.emit('notification:error', { message: 'Notification ID is required' });
        return;
      }

      client.emit('notification:marked_read', {
        notificationId,
        timestamp: new Date().toISOString(),
      });

      this.logger.debug(`Notification ${notificationId} marked as read by user ${authContext.userId}`);
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      client.emit('notification:error', { message: 'Failed to mark notification as read' });
    }
  }

  /**
   * Ping/pong for connection health
   */
  @UseGuards(SocketAuthGuard)
  @SocketRateLimit(10, 60000)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // ===============================
  // PUBLIC METHODS FOR BROADCASTING
  // ===============================

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, notification: NotificationPayload) {
    try {
      this.server.to(`user-${userId}`).emit('notification:new', notification);
      this.logger.debug(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcast(notification: NotificationPayload) {
    try {
      this.server.emit('notification:broadcast', notification);
      this.logger.debug(`Notification broadcasted to all users: ${notification.title}`);
    } catch (error) {
      this.logger.error('Failed to broadcast notification:', error);
    }
  }

  /**
   * Send notification to multiple users
   */
  sendToUsers(userIds: string[], notification: NotificationPayload) {
    try {
      userIds.forEach(userId => {
        this.sendToUser(userId, notification);
      });
    } catch (error) {
      this.logger.error('Failed to send notification to multiple users:', error);
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get total connections count
   */
  getTotalConnectionsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      uniqueUsers: this.userSockets.size,
      timestamp: new Date().toISOString(),
    };
  }
}

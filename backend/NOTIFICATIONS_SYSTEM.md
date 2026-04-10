# Fluxez Shop - Email & WebSocket Notification System

Complete implementation of email and real-time WebSocket notification systems for Fluxez Shop backend.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Email Module](#email-module)
- [Real-Time WebSocket Module](#real-time-websocket-module)
- [Notification Types](#notification-types)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Configuration](#configuration)
- [Integration Examples](#integration-examples)

---

## Overview

The notification system provides three channels for sending notifications to users:
1. **In-App Notifications**: Stored in database, accessible via REST API
2. **Email Notifications**: Sent via SMTP using Nodemailer with Handlebars templates
3. **Real-Time WebSocket Notifications**: Live notifications via Socket.IO

---

## Architecture

### Modules Created

#### 1. Email Module (`/src/modules/email`)
- **email.service.ts**: Core email sending service using Nodemailer
- **email.module.ts**: Email module configuration
- **interfaces/email.interface.ts**: TypeScript interfaces for email contexts
- **templates/**: Handlebars email templates

#### 2. Real-Time Module (`/src/modules/realtime`)
- **realtime.service.ts**: WebSocket notification service
- **realtime.module.ts**: Real-time module configuration
- **gateways/notification.gateway.ts**: Socket.IO gateway for notifications
- **guards/socket-auth.guard.ts**: JWT authentication for WebSocket connections
- **types/auth.types.ts**: TypeScript types for authentication and notifications

#### 3. Updated Notifications Module (`/src/modules/notifications`)
- Integrated with Email and Real-Time modules
- Sends notifications via all three channels simultaneously

---

## Email Module

### Email Service Features

- **SMTP Support**: Works with Gmail, SendGrid, Mailgun, AWS SES, Office365
- **Template Engine**: Handlebars for dynamic HTML emails
- **Dual Format**: Sends both HTML and plain text versions
- **Attachment Support**: Can include file attachments
- **Graceful Degradation**: Logs emails if SMTP not configured

### Email Templates

Located in `/src/modules/email/templates/`:

1. **order-confirmation.hbs**: Sent when order is placed
2. **payment-success.hbs**: Sent when payment succeeds
3. **payment-failed.hbs**: Sent when payment fails
4. **order-shipped.hbs**: Sent when order ships (includes tracking)
5. **order-delivered.hbs**: Sent when order is delivered
6. **refund-processed.hbs**: Sent when refund is processed
7. **order-cancelled.hbs**: Sent when order is cancelled
8. **welcome.hbs**: Sent to new users
9. **account-registration.hbs**: Email verification
10. **password-reset.hbs**: Password reset link

### Email Service Usage

```typescript
import { EmailService } from './modules/email/email.service';

// Order confirmation
await emailService.sendOrderConfirmation(userEmail, {
  customerName: 'John Doe',
  orderNumber: 'ORD-12345',
  orderId: 'order_id',
  orderDate: '2025-10-27',
  items: [
    { name: 'Product 1', quantity: 2, price: 29.99, total: 59.98 }
  ],
  subtotal: 59.98,
  shipping: 5.00,
  tax: 4.87,
  total: 69.85,
  shippingAddress: { /* address object */ }
});

// Payment success
await emailService.sendPaymentSuccess(userEmail, {
  customerName: 'John Doe',
  orderNumber: 'ORD-12345',
  amount: 69.85,
  currency: 'USD',
  paymentMethod: 'Visa ending in 4242',
  transactionId: 'txn_12345',
  date: '2025-10-27'
});
```

---

## Real-Time WebSocket Module

### Features

- **JWT Authentication**: Secure WebSocket connections using JWT tokens
- **Room-Based Broadcasting**: User-specific notification rooms
- **Auto-Reconnection**: Handles disconnections gracefully
- **Rate Limiting**: Prevents abuse with socket rate limiting
- **Connection Tracking**: Monitors online/offline users

### WebSocket Gateway

**Namespace**: `/notifications`

**Connection URL**: `ws://localhost:3001/notifications`

### Authentication

WebSocket connections require JWT authentication via:
1. Authorization header: `Bearer <token>`
2. Query parameter: `?token=<token>`
3. Auth handshake: `{ auth: { token: '<token>' } }`

### Real-Time Service Usage

```typescript
import { RealtimeService } from './modules/realtime/realtime.service';

// Send notification to specific user
realtimeService.sendNotificationToUser(userId, {
  id: 'notif_123',
  type: 'order_shipped',
  title: 'Order Shipped',
  message: 'Your order #ORD-12345 has been shipped',
  data: { orderId: 'order_123', trackingNumber: 'TRACK123' },
  priority: 'normal',
  timestamp: new Date().toISOString(),
  read: false,
  actionUrl: '/orders/order_123'
});

// Check if user is online
const isOnline = realtimeService.isUserOnline(userId);

// Get connection stats
const stats = realtimeService.getConnectionStats();
// Returns: { totalConnections: 5, uniqueUsers: 3, timestamp: '...' }
```

---

## Notification Types

### Supported Notification Types

1. **Order Notifications**:
   - `order_created`: Order placed successfully
   - `order_updated`: Order details updated
   - `order_shipped`: Order shipped with tracking
   - `order_delivered`: Order delivered
   - `order_cancelled`: Order cancelled

2. **Payment Notifications**:
   - `payment_success`: Payment processed successfully
   - `payment_failed`: Payment failed
   - `refund_processed`: Refund issued

3. **System Notifications**:
   - `system_announcement`: Platform-wide announcements
   - `shop_message`: Custom shop messages

---

## API Endpoints

All notification endpoints are protected with JWT authentication.

### GET /api/v1/notifications
Get user notifications with pagination.

**Query Parameters**:
- `limit` (optional): Items per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `unreadOnly` (optional): Show only unread (default: false)

**Response**:
```json
{
  "data": [
    {
      "id": "notif_123",
      "userId": "user_456",
      "type": "order_shipped",
      "title": "Order Shipped",
      "message": "Your order has been shipped",
      "data": { "orderId": "order_789" },
      "actionUrl": "/orders/order_789",
      "priority": "normal",
      "isRead": false,
      "createdAt": "2025-10-27T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### GET /api/v1/notifications/unread-count
Get count of unread notifications.

**Response**:
```json
{
  "count": 5
}
```

### PATCH /api/v1/notifications/:id/read
Mark a notification as read.

**Response**:
```json
{
  "id": "notif_123",
  "isRead": true,
  "readAt": "2025-10-27T10:35:00Z"
}
```

### PATCH /api/v1/notifications/read-all
Mark all notifications as read.

**Response**:
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

### DELETE /api/v1/notifications/:id
Delete a notification.

**Response**:
```json
{
  "message": "Notification deleted successfully"
}
```

### DELETE /api/v1/notifications/clear-all
Clear all user notifications.

**Response**:
```json
{
  "message": "All notifications cleared",
  "count": 10
}
```

---

## WebSocket Events

### Client → Server Events

#### `subscribe`
Subscribe to user notifications.

```typescript
socket.emit('subscribe');
```

**Response**: `notification:subscribed`
```json
{
  "userId": "user_123",
  "timestamp": "2025-10-27T10:30:00Z"
}
```

#### `unsubscribe`
Unsubscribe from notifications.

```typescript
socket.emit('unsubscribe');
```

#### `mark_read`
Mark notification as read via WebSocket.

```typescript
socket.emit('mark_read', { notificationId: 'notif_123' });
```

#### `ping`
Health check ping.

```typescript
socket.emit('ping');
```

**Response**: `pong`
```json
{
  "timestamp": "2025-10-27T10:30:00Z"
}
```

### Server → Client Events

#### `notification:new`
Received when new notification is sent to user.

```typescript
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});
```

**Payload**:
```json
{
  "id": "notif_123",
  "type": "order_shipped",
  "title": "Order Shipped",
  "message": "Your order has been shipped",
  "data": { "orderId": "order_789", "trackingNumber": "TRACK123" },
  "priority": "normal",
  "timestamp": "2025-10-27T10:30:00Z",
  "read": false,
  "actionUrl": "/orders/order_789"
}
```

#### `notification:broadcast`
System-wide announcements.

```typescript
socket.on('notification:broadcast', (notification) => {
  console.log('Broadcast:', notification);
});
```

#### `connection:status`
Connection status updates.

```typescript
socket.on('connection:status', (status) => {
  console.log('Connected:', status.connected);
});
```

#### `auth:error`
Authentication errors.

```typescript
socket.on('auth:error', (error) => {
  console.error('Auth error:', error.message);
});
```

---

## Configuration

### Environment Variables

Required variables in `.env`:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@fluxez-shop.com
EMAIL_FROM_NAME=Fluxez Shop

# WebSocket Configuration
WS_PORT=3002
WS_CORS_ORIGIN=http://localhost:4007,http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
```

### SMTP Providers

#### Gmail
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASSWORD`

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_smtp_user
SMTP_PASSWORD=your_mailgun_smtp_password
```

---

## Integration Examples

### Example 1: Order Service Integration

```typescript
import { NotificationsService } from './modules/notifications/notifications.service';
import { NotificationType } from './database/schema';

class OrdersService {
  constructor(
    private notificationsService: NotificationsService
  ) {}

  async shipOrder(orderId: string) {
    // Update order status
    await this.updateOrderStatus(orderId, 'shipped');

    // Send notifications (database + email + WebSocket)
    await this.notificationsService.sendOrderNotification(
      orderId,
      NotificationType.ORDER_SHIPPED
    );
  }
}
```

### Example 2: Payment Service Integration

```typescript
import { NotificationsService } from './modules/notifications/notifications.service';
import { NotificationType } from './database/schema';

class PaymentService {
  constructor(
    private notificationsService: NotificationsService
  ) {}

  async handlePaymentSuccess(transactionId: string) {
    // Process payment
    await this.processPayment(transactionId);

    // Send notifications (database + email + WebSocket)
    await this.notificationsService.sendPaymentNotification(
      transactionId,
      NotificationType.PAYMENT_SUCCESS
    );
  }
}
```

### Example 3: Frontend WebSocket Connection

```typescript
import io from 'socket.io-client';

const token = localStorage.getItem('jwt_token');

const socket = io('http://localhost:3001/notifications', {
  auth: { token },
  transports: ['websocket', 'polling']
});

// Subscribe to notifications
socket.on('connect', () => {
  console.log('Connected to notifications');
  socket.emit('subscribe');
});

// Listen for new notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
  // Show toast/alert to user
  showNotificationToast(notification);
  // Update notification badge
  updateNotificationBadge();
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from notifications');
});

// Handle errors
socket.on('auth:error', (error) => {
  console.error('Auth error:', error.message);
  // Redirect to login
});
```

---

## Testing

### Test Email Sending

```bash
# Set SMTP credentials in .env
# Then test with:
npm run test:email
```

### Test WebSocket Connection

```bash
# Terminal 1: Start server
npm run start:dev

# Terminal 2: Test WebSocket
npm run test:websocket
```

### Manual Testing with Postman

1. Import WebSocket collection
2. Connect to `ws://localhost:3001/notifications`
3. Add JWT token to auth
4. Send `subscribe` event
5. Trigger notifications via API

---

## Files Created/Modified

### New Files Created:

#### Email Module
- `/src/modules/email/email.service.ts`
- `/src/modules/email/email.module.ts`
- `/src/modules/email/interfaces/email.interface.ts`
- `/src/modules/email/templates/order-confirmation.hbs`
- `/src/modules/email/templates/payment-success.hbs`
- `/src/modules/email/templates/payment-failed.hbs`
- `/src/modules/email/templates/order-shipped.hbs`
- `/src/modules/email/templates/order-delivered.hbs`
- `/src/modules/email/templates/refund-processed.hbs`
- `/src/modules/email/templates/order-cancelled.hbs`
- `/src/modules/email/templates/welcome.hbs`
- `/src/modules/email/templates/account-registration.hbs`
- `/src/modules/email/templates/password-reset.hbs`

#### Real-Time Module
- `/src/modules/realtime/realtime.service.ts`
- `/src/modules/realtime/realtime.module.ts`
- `/src/modules/realtime/gateways/notification.gateway.ts`
- `/src/modules/realtime/guards/socket-auth.guard.ts`
- `/src/modules/realtime/types/auth.types.ts`

#### Configuration
- `/.env.example`
- `/NOTIFICATIONS_SYSTEM.md` (this file)

### Modified Files:

- `/src/modules/notifications/notifications.service.ts` - Integrated email and WebSocket
- `/src/modules/notifications/notifications.module.ts` - Added dependencies
- `/src/app.module.ts` - Added EmailModule and RealtimeModule
- `/.env` - Added email and WebSocket configuration

---

## Next Steps

1. **Configure SMTP**: Add real SMTP credentials to `.env`
2. **Test Email Templates**: Send test emails for all notification types
3. **Frontend Integration**: Implement WebSocket client in frontend
4. **Notification Preferences**: Allow users to enable/disable notification channels
5. **Push Notifications**: Add FCM/APNS for mobile push notifications
6. **Email Analytics**: Track email open rates and click rates
7. **Notification Queue**: Add Bull queue for handling high volume
8. **Template Customization**: Allow shops to customize email templates

---

## Troubleshooting

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Enable "Less secure app access" for Gmail
3. Use App Password for Gmail 2FA
4. Check firewall/network for SMTP port (587/465)
5. Review logs for SMTP errors

### WebSocket Not Connecting

1. Verify JWT token is valid
2. Check CORS configuration in `.env`
3. Ensure WebSocket port is not blocked
4. Check browser console for errors
5. Verify Socket.IO client version compatibility

### Notifications Not Appearing

1. Check notification service logs
2. Verify user ID matches JWT token
3. Test REST API endpoints first
4. Check database for stored notifications
5. Verify WebSocket subscription

---

## Support

For issues or questions:
- Review logs in `/logs` directory
- Check NestJS documentation
- Review Socket.IO documentation
- Review Nodemailer documentation

---

**Implementation Date**: October 27, 2025
**Version**: 1.0.0
**Author**: Claude (Anthropic)

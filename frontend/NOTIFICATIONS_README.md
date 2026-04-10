# Notification System Documentation

## Overview
Complete real-time notification system for Fluxez Shop frontend with WebSocket integration, state management, and responsive UI components.

## Architecture

### 1. Files Created

#### Types (`/src/types/notification.ts`)
- `NotificationType` enum - All notification types
- `Notification` interface - Notification data structure
- `NotificationFilter` interface - Filter options
- `NotificationResponse` interface - API response structure
- `WebSocketEvents` interface - WebSocket event types

#### API Client (`/src/lib/api/notifications.ts`)
Functions for notification operations:
- `fetchNotifications(filter)` - Get paginated notifications
- `getUnreadCount()` - Get unread count
- `markAsRead(notificationId)` - Mark single notification as read
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete single notification
- `deleteAllRead()` - Delete all read notifications

#### WebSocket Hook (`/src/hooks/useWebSocket.ts`)
Custom hook for WebSocket connection:
- Connects to `/notifications` namespace
- JWT authentication
- Auto-reconnection with exponential backoff
- Event handlers for connect/disconnect/notification/error
- Connection status tracking
- Manual disconnect/reconnect methods

#### Notification Store (`/src/stores/useNotificationStore.ts`)
Zustand store with persist middleware:
- State: notifications array, unreadCount, loading, error, pagination
- Actions: add, read, remove, fetch notifications
- WebSocket integration
- LocalStorage persistence for unread count

#### Components

**NotificationItem** (`/src/components/notifications/NotificationItem.tsx`)
- Single notification card
- Type-based icons and colors
- Unread indicator (blue dot + lime border)
- Relative timestamps (date-fns)
- Click to mark as read
- Optional remove button
- Link to related pages (orders)
- Compact mode support

**NotificationDropdown** (`/src/components/notifications/NotificationDropdown.tsx`)
- Dropdown panel for header bell
- Shows last 10 notifications
- Mark all as read button
- Empty state
- View all link
- Framer Motion animations

**NotificationBell** (`/src/components/notifications/NotificationBell.tsx`)
- Bell icon in header
- Animated unread badge
- WebSocket connection indicator
- Bell shake animation for new notifications
- Toast notifications for new items
- Dropdown toggle

**NotificationsList** (`/src/components/notifications/NotificationsList.tsx`)
- Full-page notification list
- Filters: type (orders, payments, shipping, system, all)
- Filters: status (all, unread, read)
- Pagination with "Load More" button
- Bulk actions (mark all as read)
- Empty states

**NotificationsPage** (`/src/features/notifications/NotificationsPage.tsx`)
- Full-page view with header
- Back button
- Responsive layout
- Uses NotificationsList component

## WebSocket Connection Flow

1. **Initialization**
   - `NotificationBell` component mounts
   - `useWebSocket` hook initializes
   - Socket.IO client connects to `VITE_WS_URL/notifications`
   - JWT token sent in auth payload

2. **Authentication**
   ```javascript
   socket.io(`${WS_URL}/notifications`, {
     auth: { token: localStorage.getItem('authToken') }
   })
   ```

3. **Event Handlers**
   - `connect` - Connection established, fetch initial notifications
   - `disconnect` - Connection lost
   - `connect_error` - Authentication/network error
   - `notification` - New notification received
   - `error` - General error

4. **Auto-Reconnection**
   - 5 attempts max
   - 1s to 5s exponential backoff
   - Transports: WebSocket (primary), polling (fallback)

5. **Real-time Updates**
   - New notification received via WebSocket
   - Added to store via `addNotification()`
   - Toast notification shown
   - Bell shake animation
   - Unread count updated
   - Badge pulsates

## State Management

### Notification Store (Zustand)
```javascript
{
  notifications: Notification[],      // All loaded notifications
  unreadCount: number,                 // Total unread count
  isLoading: boolean,                  // Loading state
  error: string | null,                // Error message
  currentPage: number,                 // Current pagination page
  totalPages: number,                  // Total pages

  // Actions
  addNotification,                     // Add new notification (WebSocket)
  markAsRead,                          // Mark single as read
  markAllAsRead,                       // Mark all as read
  removeNotification,                  // Delete notification
  fetchNotifications,                  // Fetch paginated notifications
  fetchUnreadCount,                    // Fetch unread count
  setNotifications,                    // Replace notifications array
  setUnreadCount,                      // Update unread count
  clearError,                          // Clear error state
}
```

### Persistence
- Unread count persisted to localStorage
- Restored on page reload
- Key: `notification-storage`

## UI/UX Features

### Design
- Clean, modern e-commerce design (not glassmorphism)
- White backgrounds
- Primary-lime accents for unread
- Gray for read notifications
- Border indicators for unread items
- Type-based color coding

### Animations (Framer Motion)
- Bell shake on new notification
- Badge scale animation
- Dropdown slide-in/fade
- Pulse effect on notification arrival
- Filter panel expand/collapse
- Smooth transitions

### Icons (Lucide React)
- Bell - Default/System
- Package - Order Created
- AlertCircle - Order Updated
- Truck - Order Shipped
- PackageCheck - Order Delivered
- XCircle - Order Cancelled/Payment Failed
- CheckCircle2 - Payment Success
- DollarSign - Refund Processed

### Colors by Type
- Order Created: Blue
- Order Updated: Yellow
- Order Shipped: Purple
- Order Delivered: Green
- Order Cancelled: Red
- Payment Success: Green
- Payment Failed: Red
- Refund Processed: Emerald
- System: Gray

### Responsive Design
- Mobile: Full-width dropdowns, stacked layout
- Tablet: Optimized spacing
- Desktop: Side-by-side layout, hover effects

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Semantic HTML

## Notification Types

### ORDER_CREATED
Order confirmation after checkout
- Icon: Package
- Color: Blue
- Links to: `/orders`

### ORDER_UPDATED
Order status changed
- Icon: AlertCircle
- Color: Yellow
- Links to: `/orders`

### ORDER_SHIPPED
Order shipped with tracking
- Icon: Truck
- Color: Purple
- Shows: Tracking number
- Links to: `/orders`

### ORDER_DELIVERED
Order delivered confirmation
- Icon: PackageCheck
- Color: Green
- Links to: `/orders`

### ORDER_CANCELLED
Order cancellation
- Icon: XCircle
- Color: Red
- Links to: `/orders`

### PAYMENT_SUCCESS
Payment processed successfully
- Icon: CheckCircle2
- Color: Green
- Shows: Amount
- Links to: `/orders`

### PAYMENT_FAILED
Payment failed
- Icon: XCircle
- Color: Red
- Shows: Amount
- Links to: `/orders`

### REFUND_PROCESSED
Refund completed
- Icon: DollarSign
- Color: Emerald
- Shows: Refund amount
- Links to: `/orders`

### SYSTEM_ANNOUNCEMENT
System messages/announcements
- Icon: Bell
- Color: Gray
- No link

## Environment Variables

```env
# Backend API base URL for REST calls
VITE_API_BASE_URL=http://localhost:5000/api

# WebSocket server URL for real-time notifications
VITE_WS_URL=http://localhost:5000
```

## Integration Points

### Header Component
```jsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

// In Header component
<NotificationBell />
```

### App Routes
```jsx
import { NotificationsPage } from './features/notifications';

<Route path="/notifications" element={<NotificationsPage />} />
```

## Usage Examples

### Fetch Notifications
```javascript
const { fetchNotifications } = useNotificationStore();

// Fetch all notifications
fetchNotifications();

// Fetch with filters
fetchNotifications({
  type: NotificationType.ORDER_CREATED,
  read: false,
  page: 1,
  limit: 20
});
```

### Mark as Read
```javascript
const { markAsRead, markAllAsRead } = useNotificationStore();

// Mark single notification as read
await markAsRead(notificationId);

// Mark all as read
await markAllAsRead();
```

### Delete Notification
```javascript
const { removeNotification } = useNotificationStore();

await removeNotification(notificationId);
```

### WebSocket Events
```javascript
const { isConnected } = useWebSocket({
  onNotification: (notification) => {
    console.log('New notification:', notification);
  },
  onConnect: () => {
    console.log('WebSocket connected');
  },
  onDisconnect: () => {
    console.log('WebSocket disconnected');
  },
  onError: (error) => {
    console.error('WebSocket error:', error);
  }
});
```

## Backend Requirements

The frontend expects the backend to implement:

### REST Endpoints
- `GET /api/notifications` - Fetch paginated notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/read` - Delete all read

### WebSocket Events (Socket.IO)
- Namespace: `/notifications`
- Authentication: JWT token in auth payload
- Events:
  - Server → Client: `notification` - New notification
  - Server → Client: `error` - Error message

### Notification Data Structure
```typescript
{
  id: string,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: {
    orderId?: string,
    orderNumber?: string,
    trackingNumber?: string,
    amount?: number,
    refundAmount?: number
  },
  read: boolean,
  createdAt: string,
  updatedAt: string
}
```

## Error Handling

- Network errors: Retry with exponential backoff
- Authentication errors: Disconnect and show error
- API errors: Display error toast
- WebSocket disconnection: Auto-reconnect
- Failed operations: Rollback optimistic updates

## Performance Optimizations

- Lazy load notification list
- Pagination (20 per page)
- Dropdown shows only 10 most recent
- LocalStorage caching for unread count
- Debounced filter updates
- Memoized components
- Optimistic UI updates

## Testing Checklist

- [ ] WebSocket connection establishes
- [ ] Authentication works with JWT
- [ ] New notifications appear in real-time
- [ ] Toast shows for new notifications
- [ ] Bell shakes on new notification
- [ ] Unread badge updates correctly
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Filters work (type, status)
- [ ] Pagination works
- [ ] Empty states display
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Auto-reconnection works
- [ ] Connection indicator accurate

## Future Enhancements

- Push notifications (Service Worker)
- Notification sound effects
- Notification preferences (per type)
- Email notification digest
- Notification grouping
- Mark as unread
- Notification search
- Archive notifications
- Notification categories
- Custom notification channels
- Notification templates
- Scheduled notifications
- Notification analytics

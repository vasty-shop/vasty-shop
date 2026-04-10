export enum NotificationType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderId?: string;
    orderNumber?: string;
    trackingNumber?: string;
    amount?: number;
    refundAmount?: number;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilter {
  type?: NotificationType | 'all';
  read?: boolean | 'all';
  page?: number;
  limit?: number;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}

// WebSocket event types
export interface WebSocketEvents {
  connect: () => void;
  disconnect: () => void;
  notification: (notification: Notification) => void;
  error: (error: { message: string }) => void;
}

export interface NotificationIconConfig {
  icon: any; // Lucide icon component
  color: string;
  bgColor: string;
}

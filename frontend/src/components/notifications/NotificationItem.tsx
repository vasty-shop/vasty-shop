import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  Package,
  DollarSign,
  Truck,
  PackageCheck,
  AlertCircle,
  Bell,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '@/types/notification';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  showRemove?: boolean;
  compact?: boolean;
}

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = 'w-5 h-5';

  switch (type) {
    case NotificationType.ORDER_CREATED:
      return <Package className={iconClass} />;
    case NotificationType.ORDER_UPDATED:
      return <AlertCircle className={iconClass} />;
    case NotificationType.ORDER_SHIPPED:
      return <Truck className={iconClass} />;
    case NotificationType.ORDER_DELIVERED:
      return <PackageCheck className={iconClass} />;
    case NotificationType.ORDER_CANCELLED:
      return <XCircle className={iconClass} />;
    case NotificationType.PAYMENT_SUCCESS:
      return <CheckCircle2 className={iconClass} />;
    case NotificationType.PAYMENT_FAILED:
      return <XCircle className={iconClass} />;
    case NotificationType.REFUND_PROCESSED:
      return <DollarSign className={iconClass} />;
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return <Bell className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

const getNotificationColors = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ORDER_CREATED:
      return {
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
      };
    case NotificationType.ORDER_UPDATED:
      return {
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        borderColor: 'border-yellow-200',
      };
    case NotificationType.ORDER_SHIPPED:
      return {
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
      };
    case NotificationType.ORDER_DELIVERED:
      return {
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200',
      };
    case NotificationType.ORDER_CANCELLED:
      return {
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200',
      };
    case NotificationType.PAYMENT_SUCCESS:
      return {
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200',
      };
    case NotificationType.PAYMENT_FAILED:
      return {
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200',
      };
    case NotificationType.REFUND_PROCESSED:
      return {
        bgColor: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
      };
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return {
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        borderColor: 'border-gray-200',
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-600',
        borderColor: 'border-gray-200',
      };
  }
};

const getNotificationLink = (notification: Notification): string | null => {
  if (notification.data?.orderId) {
    return `/orders`;
  }
  return null;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  showRemove = false,
  compact = false,
}) => {
  const { markAsRead, removeNotification } = useNotificationStore();
  const colors = getNotificationColors(notification.type);
  const icon = getNotificationIcon(notification.type);
  const link = getNotificationLink(notification);

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    onClick?.();
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const content = (
    <div
      className={cn(
        'relative flex gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group',
        !notification.read
          ? 'bg-primary-lime/5 hover:bg-primary-lime/10 border border-primary-lime/20'
          : 'bg-white hover:bg-gray-50 border border-gray-200',
        compact && 'p-2.5'
      )}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-lime rounded-r-full" />
      )}

      {/* Icon */}
      <div className={cn('flex-shrink-0 p-2 rounded-lg', colors.bgColor)}>
        <div className={colors.iconColor}>{icon}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              'text-sm font-semibold text-gray-900 leading-tight',
              compact && 'text-xs'
            )}
          >
            {notification.title}
          </h4>

          {showRemove && (
            <button
              onClick={handleRemove}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p
          className={cn(
            'text-sm text-gray-600 mt-1 line-clamp-2',
            compact && 'text-xs mt-0.5'
          )}
        >
          {notification.message}
        </p>

        {/* Additional Data */}
        {notification.data && (
          <div className="flex flex-wrap gap-2 mt-2">
            {notification.data.orderNumber && (
              <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Order #{notification.data.orderNumber}
              </span>
            )}
            {notification.data.trackingNumber && (
              <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Tracking: {notification.data.trackingNumber}
              </span>
            )}
            {notification.data.amount && (
              <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                ${notification.data.amount.toFixed(2)}
              </span>
            )}
          </div>
        )}

        <p
          className={cn(
            'text-xs text-gray-500 mt-2',
            compact && 'mt-1'
          )}
        >
          {timeAgo}
        </p>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
};

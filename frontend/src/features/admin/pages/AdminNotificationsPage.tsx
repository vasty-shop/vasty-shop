import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bell,
  RefreshCw,
  Users,
  ShoppingCart,
  Store,
  Settings,
  MailOpen,
  Star,
  Check,
} from 'lucide-react';
import { GlassCard } from '../../vendor/components/GlassCard';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

// Activity Notification Interface
interface ActivityNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'shop' | 'user' | 'review' | 'system';
  createdAt?: string;
}

type ActivityFilter = 'all' | 'unread' | 'read';

// Helper to extract date from various possible field names
const extractDateField = (item: any): string | null => {
  const possibleFields = [
    'createdAt', 'created_at', 'CreatedAt',
    'updatedAt', 'updated_at', 'UpdatedAt',
    'lastLoginAt', 'last_sign_in_at', 'lastSignInAt',
    'date', 'timestamp', 'time',
    'orderDate', 'order_date',
    'registeredAt', 'registered_at',
    'joinedAt', 'joined_at',
    'confirmedAt', 'confirmed_at', 'email_confirmed_at'
  ];

  for (const field of possibleFields) {
    const value = item[field];
    if (value) {
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'number') {
        const timestamp = value > 1e12 ? value : value * 1000;
        return new Date(timestamp).toISOString();
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (typeof value === 'object' && value.toISOString) {
        return value.toISOString();
      }
    }
  }

  return null;
};

// Helper to format relative time
const formatRelativeTime = (dateString: string | null, t: (key: string) => string): string => {
  if (!dateString) {
    return t('admin.notifications.justNow');
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return t('admin.notifications.justNow');
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('admin.notifications.justNow');
  if (minutes < 60) return `${minutes} ${t('admin.notifications.minutesAgo')}`;
  if (hours < 24) return `${hours} ${t('admin.notifications.hoursAgo')}`;
  return `${days} ${t('admin.notifications.daysAgo')}`;
};

export const AdminNotificationsPage: React.FC = () => {
  const { t } = useTranslation();

  const [activityNotifications, setActivityNotifications] = useState<ActivityNotification[]>([]);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load activity notifications
  const loadActivityNotifications = useCallback(async () => {
    try {
      setIsLoadingActivity(true);

      const [ordersResponse, shopsResponse, usersResponse, reviewsResponse] = await Promise.all([
        api.getAdminOrders({ limit: 30 }).catch(() => null),
        api.getAdminShops({ limit: 30 }).catch(() => null),
        api.getAdminUsers({ limit: 30 }).catch(() => null),
        api.getAdminReviews({ limit: 20 }).catch(() => null),
      ]);

      const orders = ordersResponse?.data || ordersResponse?.orders || [];
      const shops = shopsResponse?.data || shopsResponse?.shops || [];
      const users = usersResponse?.data || usersResponse?.users || [];
      const reviews = reviewsResponse?.data || reviewsResponse?.reviews || [];

      const newNotifications: ActivityNotification[] = [];
      const now = new Date();

      // Generate order notifications
      orders.slice(0, 15).forEach((order: any) => {
        const dateStr = extractDateField(order);
        const orderDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));

        const timeString = formatRelativeTime(dateStr, t);
        const status = (order.status || '').toLowerCase();
        const orderNumber = order.orderNumber || order.order_number || order.id?.slice(0, 8);
        const total = order.total || order.totalAmount || 0;

        let title = t('admin.notifications.newOrder');
        if (status === 'delivered' || status === 'completed') {
          title = t('admin.notifications.orderDelivered', { defaultValue: 'Order Delivered' });
        } else if (status === 'cancelled') {
          title = t('admin.notifications.orderCancelled', { defaultValue: 'Order Cancelled' });
        }

        newNotifications.push({
          id: `order-${order.id}`,
          title,
          message: t('admin.notifications.newOrderMsg', { orderNumber, total: Number(total).toFixed(2) }),
          time: timeString,
          read: timeDiff > 60,
          type: 'order',
          createdAt: dateStr || undefined,
        });
      });

      // Generate shop notifications
      shops.slice(0, 10).forEach((shop: any) => {
        const dateStr = extractDateField(shop);
        const shopDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - shopDate.getTime()) / (1000 * 60));

        const timeString = formatRelativeTime(dateStr, t);
        const status = (shop.status || '').toLowerCase();
        const shopName = shop.name || shop.shopName || 'Unknown Shop';

        const isPending = status === 'pending' || status === 'pending_approval';

        newNotifications.push({
          id: `shop-${shop.id}`,
          title: isPending
            ? t('admin.notifications.newShopRegistration')
            : t('admin.notifications.shopActivity', { defaultValue: 'Shop Activity' }),
          message: isPending
            ? t('admin.notifications.newShopMsg', { shopName })
            : t('admin.notifications.shopActiveMsg', { shopName, defaultValue: '{{shopName}} is active' }),
          time: timeString,
          read: !isPending || timeDiff > 120,
          type: 'shop',
          createdAt: dateStr || undefined,
        });
      });

      // Generate user notifications
      users.slice(0, 10).forEach((user: any) => {
        const dateStr = extractDateField(user);
        const timeString = dateStr
          ? formatRelativeTime(dateStr, t)
          : t('admin.notifications.recently', { defaultValue: 'Recently' });
        const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User';

        newNotifications.push({
          id: `user-${user.id}`,
          title: t('admin.notifications.newUserRegistration'),
          message: t('admin.notifications.newUserMsg', { userName }),
          time: timeString,
          read: true,
          type: 'user',
          createdAt: dateStr || undefined,
        });
      });

      // Generate review notifications
      reviews.slice(0, 10).forEach((review: any) => {
        const dateStr = extractDateField(review);
        const reviewDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60));

        const timeString = formatRelativeTime(dateStr, t);
        const rating = review.rating || 5;
        const shopName = review.shop?.name || review.shopName || 'a shop';

        newNotifications.push({
          id: `review-${review.id}`,
          title: t('admin.notifications.newReview'),
          message: t('admin.notifications.newReviewMsg', { rating, shopName }),
          time: timeString,
          read: timeDiff > 2880,
          type: 'review',
          createdAt: dateStr || undefined,
        });
      });

      // Sort by unread first, then by creation date
      newNotifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setActivityNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to load activity notifications:', error);
      toast.error(t('admin.notifications.loadError', { defaultValue: 'Failed to load notifications' }));
    } finally {
      setIsLoadingActivity(false);
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    loadActivityNotifications();
  }, [loadActivityNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActivityNotifications();
    toast.success(t('admin.notifications.refreshed', { defaultValue: 'Notifications refreshed' }));
  };

  const handleMarkAsRead = (id: string) => {
    setActivityNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setActivityNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(t('admin.notifications.allMarkedRead'));
  };

  // Filter activity notifications
  const filteredActivityNotifications = activityNotifications.filter(n => {
    if (activityFilter === 'unread') return !n.read;
    if (activityFilter === 'read') return n.read;
    return true;
  });

  const unreadCount = activityNotifications.filter(n => !n.read).length;

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5" />;
      case 'shop':
        return <Store className="w-5 h-5" />;
      case 'user':
        return <Users className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'system':
        return <Settings className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get notification icon background color
  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-100 text-green-600';
      case 'shop':
        return 'bg-blue-100 text-blue-600';
      case 'user':
        return 'bg-purple-100 text-purple-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      case 'system':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 bg-gray-50 min-h-screen p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.notifications.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('admin.notifications.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('admin.common.refresh')}</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all flex items-center space-x-2 border border-indigo-200"
            >
              <Check className="w-4 h-4" />
              <span>{t('admin.notifications.markAllRead')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('admin.notifications.totalActivity', { defaultValue: 'Total Activity' }), value: activityNotifications.length, icon: Bell, color: 'from-indigo-500 to-indigo-600' },
          { label: t('admin.notifications.unread'), value: unreadCount, icon: MailOpen, color: 'from-red-500 to-red-600' },
          { label: t('admin.notifications.orders', { defaultValue: 'Orders' }), value: activityNotifications.filter(n => n.type === 'order').length, icon: ShoppingCart, color: 'from-green-500 to-green-600' },
          { label: t('admin.notifications.newShops', { defaultValue: 'Shops' }), value: activityNotifications.filter(n => n.type === 'shop').length, icon: Store, color: 'from-blue-500 to-blue-600' }
        ].map((stat) => (
          <GlassCard key={stat.label} hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Activity Filters */}
      <div className="flex items-center space-x-2">
        {(['all', 'unread', 'read'] as ActivityFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setActivityFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activityFilter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t(`admin.notifications.filter.${f}`, { defaultValue: f.charAt(0).toUpperCase() + f.slice(1) })}
          </button>
        ))}
      </div>

      {/* Activity Notifications List */}
      <GlassCard hover={false}>
        {isLoadingActivity ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">{t('admin.notifications.loading')}</p>
          </div>
        ) : filteredActivityNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('admin.notifications.empty')}
            </h3>
            <p className="text-gray-500">
              {t('admin.notifications.noActivityYet', { defaultValue: 'Activity notifications will appear here' })}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredActivityNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleMarkAsRead(notification.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationIconBg(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{notification.title}</p>
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

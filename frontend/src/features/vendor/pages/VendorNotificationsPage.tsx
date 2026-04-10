import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  RefreshCw,
  Check,
  Star,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  MailOpen,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveShop } from '@/hooks/useActiveShop';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'review' | 'payment' | 'system';
  orderId?: string;
  orderNumber?: string;
  createdAt?: string;
}

type ActivityFilter = 'all' | 'unread' | 'read';

// Helper to format relative time
const formatRelativeTime = (dateString: string, t: (key: string) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('vendor.notifications.justNow');
  if (minutes < 60) return `${minutes} ${t('vendor.notifications.minutesAgo')}`;
  if (hours < 24) return `${hours} ${t('vendor.notifications.hoursAgo')}`;
  return `${days} ${t('vendor.notifications.daysAgo')}`;
};

export const VendorNotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { shop } = useActiveShop();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const fetchNotifications = useCallback(async () => {
    if (!shop?.id) return;

    try {
      // Set shop context
      api.setShopId(shop.id);

      // Fetch orders and reviews to generate notifications
      const [ordersResponse, reviewsResponse] = await Promise.all([
        api.getVendorOrders({ limit: 50 }).catch(() => null),
        api.getShopReviews(shop.id, { limit: 20 }).catch(() => null),
      ]);

      const orders = ordersResponse?.data || [];
      const reviews = reviewsResponse?.data || reviewsResponse?.reviews || [];

      const newNotifications: Notification[] = [];
      const now = new Date();

      // Generate order notifications
      orders.forEach((order: any) => {
        const dateStr = order.createdAt || order.created_at || order.updatedAt || order.updated_at;
        const orderDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));

        const timeString = formatRelativeTime(dateStr || new Date().toISOString(), t);
        const status = (order.status || '').toLowerCase();
        const orderNumber = order.orderNumber || order.order_number || order.id?.slice(0, 8);
        const customerName = order.customer?.name ||
          `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() ||
          order.shippingAddress?.fullName ||
          t('vendor.notifications.customer');

        if (status === 'pending' || status === 'confirmed') {
          newNotifications.push({
            id: `new-order-${order.id}`,
            title: t('vendor.notifications.newOrder'),
            message: t('vendor.notifications.newOrderMsg', { orderNumber, customerName }),
            time: timeString,
            read: timeDiff > 30,
            type: 'order',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else if (status === 'processing') {
          newNotifications.push({
            id: `processing-${order.id}`,
            title: t('vendor.notifications.orderProcessing'),
            message: t('vendor.notifications.orderProcessingMsg', { orderNumber }),
            time: timeString,
            read: timeDiff > 60,
            type: 'order',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else if (status === 'shipped') {
          newNotifications.push({
            id: `shipped-${order.id}`,
            title: t('vendor.notifications.orderShipped'),
            message: t('vendor.notifications.orderShippedMsg', { orderNumber }),
            time: timeString,
            read: timeDiff > 120,
            type: 'order',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else if (status === 'delivered' || status === 'completed') {
          newNotifications.push({
            id: `delivered-${order.id}`,
            title: t('vendor.notifications.orderDelivered'),
            message: t('vendor.notifications.orderDeliveredMsg', { orderNumber }),
            time: timeString,
            read: timeDiff > 60,
            type: 'payment',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else if (status === 'cancelled') {
          newNotifications.push({
            id: `cancelled-${order.id}`,
            title: t('vendor.notifications.orderCancelled'),
            message: t('vendor.notifications.orderCancelledMsg', { orderNumber }),
            time: timeString,
            read: timeDiff > 30,
            type: 'system',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        }
      });

      // Generate review notifications
      reviews.forEach((review: any) => {
        const dateStr = review.createdAt || review.created_at;
        const reviewDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60));

        const timeString = formatRelativeTime(dateStr || new Date().toISOString(), t);
        const customerName = review.user?.name ||
          `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() ||
          t('vendor.notifications.customer');
        const rating = review.rating || 5;

        newNotifications.push({
          id: `review-${review.id}`,
          title: t('vendor.notifications.newReview'),
          message: t('vendor.notifications.newReviewMsg', { customerName, rating }),
          time: timeString,
          read: timeDiff > 60,
          type: 'review',
          createdAt: dateStr,
        });
      });

      // Sort by unread first, then by creation date
      newNotifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('[VendorNotificationsPage] Error:', error);
      toast.error(t('vendor.notifications.loadError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [shop?.id, t]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    toast.success(t('vendor.notifications.refreshed'));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t('vendor.notifications.markedAllRead'));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'payment':
        return <DollarSign className="w-5 h-5" />;
      case 'system':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'system':
        return 'bg-red-100 text-red-600';
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
          <h1 className="text-3xl font-bold text-gray-900">{t('vendor.notifications.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.notifications.subtitle', { defaultValue: 'Stay updated with your store activity' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('vendor.notifications.refresh')}</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-primary-lime/10 hover:bg-primary-lime/20 text-primary-lime rounded-xl transition-all flex items-center space-x-2 border border-primary-lime/20"
            >
              <Check className="w-4 h-4" />
              <span>{t('vendor.notifications.markAllRead')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('vendor.notifications.totalActivity', { defaultValue: 'Total Activity' }), value: notifications.length, icon: Bell, color: 'from-primary-lime to-green-600' },
          { label: t('vendor.notifications.unread', { defaultValue: 'Unread' }), value: unreadCount, icon: MailOpen, color: 'from-red-500 to-red-600' },
          { label: t('vendor.notifications.orders', { defaultValue: 'Orders' }), value: notifications.filter(n => n.type === 'order').length, icon: ShoppingCart, color: 'from-blue-500 to-blue-600' },
          { label: t('vendor.notifications.reviews', { defaultValue: 'Reviews' }), value: notifications.filter(n => n.type === 'review').length, icon: Star, color: 'from-yellow-500 to-yellow-600' }
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
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-lime text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t(`vendor.notifications.filter.${f}`, { defaultValue: f.charAt(0).toUpperCase() + f.slice(1) })}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <GlassCard hover={false}>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-primary-lime border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">{t('vendor.notifications.loading')}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('vendor.notifications.empty')}
            </h3>
            <p className="text-gray-500">
              {t('vendor.notifications.noActivityYet', { defaultValue: 'Activity notifications will appear here' })}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleMarkRead(notification.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-primary-lime/5' : ''
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
                        <div className="w-3 h-3 rounded-full bg-primary-lime flex-shrink-0" />
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

export default VendorNotificationsPage;

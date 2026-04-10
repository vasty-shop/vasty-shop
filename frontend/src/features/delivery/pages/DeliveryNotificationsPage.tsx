import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Package,
  CheckCircle,
  RefreshCw,
  Check,
  DollarSign,
  MailOpen,
  Truck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'earning' | 'system';
  orderId?: string;
  orderNumber?: string;
  createdAt?: string;
}

type ActivityFilter = 'all' | 'unread' | 'read';

// GlassCard component inline since delivery feature may not have access to vendor's GlassCard
const GlassCard: React.FC<{ children: React.ReactNode; hover?: boolean; className?: string }> = ({
  children,
  hover = true,
  className = '',
}) => (
  <div
    className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm ${
      hover ? 'hover:shadow-md transition-shadow' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const DeliveryNotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan } = useDeliveryAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const fetchNotifications = useCallback(async () => {
    if (!deliveryMan?.id) return;

    try {
      // Fetch orders and history to generate notifications
      const [ordersResponse, historyResponse] = await Promise.all([
        deliveryApi.getOrders(deliveryMan.id).catch(() => null),
        deliveryApi.getDeliveryHistory(deliveryMan.id, { limit: 20 }).catch(() => null),
      ]);

      const ordersData = ordersResponse?.data;
      const orders = ordersData?.data || ordersData || ordersResponse || [];

      const historyData = historyResponse?.data;
      const history = historyData?.data || historyData || historyResponse || [];

      // Combine orders and history
      const allOrders = [...(Array.isArray(orders) ? orders : [])];
      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          if (!allOrders.find((o: any) => o.id === h.id)) {
            allOrders.push(h);
          }
        });
      }

      const newNotifications: Notification[] = [];
      const now = new Date();

      allOrders.forEach((order: any) => {
        const dateStr = order.createdAt || order.created_at || order.updatedAt || order.updated_at;
        const orderDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));

        let timeString = '';
        if (isNaN(timeDiff) || timeDiff < 1) {
          timeString = t('delivery.topbar.justNow');
        } else if (timeDiff < 60) {
          timeString = `${timeDiff} ${t('delivery.topbar.minutesAgo')}`;
        } else if (timeDiff < 1440) {
          const hours = Math.floor(timeDiff / 60);
          timeString = `${hours} ${t('delivery.topbar.hoursAgo')}`;
        } else {
          const days = Math.floor(timeDiff / 1440);
          timeString = `${days} ${t('delivery.topbar.daysAgo')}`;
        }

        const status = (order.status || '').toLowerCase();
        const orderNumber = order.orderNumber || order.order_number || order.id?.slice(0, 8);

        if (status === 'delivered' || status === 'completed') {
          newNotifications.push({
            id: `delivery-${order.id}`,
            title: t('delivery.topbar.deliveryCompleted'),
            message: `${t('delivery.topbar.orderDeliveredMsg')} #${orderNumber}`,
            time: timeString,
            read: timeDiff > 60,
            type: 'earning',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else if (status === 'shipped' || status === 'in_transit' || status === 'out_for_delivery') {
          newNotifications.push({
            id: `active-${order.id}`,
            title: t('delivery.topbar.activeDelivery'),
            message: `${t('delivery.topbar.deliverToMsg')} ${order.shippingAddress?.city || order.shipping_address?.city || ''}`,
            time: timeString,
            read: timeDiff > 30,
            type: 'order',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else if (status === 'pending' || status === 'confirmed' || status === 'processing') {
          newNotifications.push({
            id: `new-${order.id}`,
            title: t('delivery.topbar.newOrderAssigned'),
            message: `${t('delivery.topbar.orderAssignedMsg')} #${orderNumber}`,
            time: timeString,
            read: timeDiff > 15,
            type: 'order',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        } else {
          newNotifications.push({
            id: `order-${order.id}`,
            title: t('delivery.topbar.newOrderAssigned'),
            message: `${t('delivery.topbar.orderAssignedMsg')} #${orderNumber}`,
            time: timeString,
            read: timeDiff > 30,
            type: 'order',
            orderId: order.id,
            orderNumber,
            createdAt: dateStr,
          });
        }
      });

      // Sort by unread first, then by time
      newNotifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return 0;
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('[DeliveryNotificationsPage] Error:', error);
      toast.error(t('delivery.notifications.loadError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [deliveryMan?.id, t]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    toast.success(t('delivery.notifications.refreshed'));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t('delivery.notifications.markedAllRead'));
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
      case 'earning':
        return <CheckCircle className="w-5 h-5" />;
      case 'order':
        return <Package className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'earning':
        return 'bg-green-100 text-green-600';
      case 'order':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-orange-100 text-orange-600';
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
          <h1 className="text-3xl font-bold text-gray-900">{t('delivery.notifications.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('delivery.notifications.subtitle', { defaultValue: 'Stay updated with your deliveries' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('delivery.notifications.refresh')}</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-all flex items-center space-x-2 border border-orange-200"
            >
              <Check className="w-4 h-4" />
              <span>{t('delivery.notifications.markAllRead')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('delivery.notifications.totalActivity', { defaultValue: 'Total Activity' }), value: notifications.length, icon: Bell, color: 'from-orange-500 to-orange-600' },
          { label: t('delivery.notifications.unreadLabel', { defaultValue: 'Unread' }), value: unreadCount, icon: MailOpen, color: 'from-red-500 to-red-600' },
          { label: t('delivery.notifications.deliveries', { defaultValue: 'Deliveries' }), value: notifications.filter(n => n.type === 'order').length, icon: Truck, color: 'from-blue-500 to-blue-600' },
          { label: t('delivery.notifications.completed', { defaultValue: 'Completed' }), value: notifications.filter(n => n.type === 'earning').length, icon: DollarSign, color: 'from-green-500 to-green-600' }
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
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t(`delivery.notifications.filter.${f}`, { defaultValue: f.charAt(0).toUpperCase() + f.slice(1) })}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <GlassCard hover={false}>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">{t('delivery.notifications.loading')}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('delivery.topbar.noNotifications')}
            </h3>
            <p className="text-gray-500">
              {t('delivery.notifications.noActivityYet', { defaultValue: 'Delivery notifications will appear here' })}
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
                  !notification.read ? 'bg-orange-50/50' : ''
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
                        <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
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

export default DeliveryNotificationsPage;

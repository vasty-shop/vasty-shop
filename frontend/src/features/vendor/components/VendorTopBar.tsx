import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  User,
  ChevronDown,
  LogOut,
  Store,
  Menu,
  Home,
  ShoppingCart,
  Star,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ShopSwitcher } from './ShopSwitcher';
import { useShopNavigation } from '../../../lib/navigation-utils';
import { useVendorAuthStore } from '../../../stores/useVendorAuthStore';
import { useActiveShop } from '../../../hooks/useActiveShop';
import { api } from '../../../lib/api';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

// Hook to wait for store hydration
const useHydration = () => {
  const [hydrated, setHydrated] = useState(useVendorAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useVendorAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Check again in case it hydrated between render and effect
    if (useVendorAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsubscribe;
  }, []);

  return hydrated;
};

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'review' | 'payment' | 'system';
  createdAt?: string;
}

interface VendorTopBarProps {
  onMenuClick?: () => void;
  shopName?: string;
}

// Helper to format relative time with translations
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

export const VendorTopBar: React.FC<VendorTopBarProps> = ({
  onMenuClick,
  shopName = 'My Store'
}) => {
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const { getUrl, shopId } = useShopNavigation();
  const navigate = useNavigate();
  const { logout, vendor } = useVendorAuthStore();
  const isHydrated = useHydration();
  const { shop } = useActiveShop();

  // Generate notifications from orders and reviews
  const loadNotifications = useCallback(async () => {
    if (!shop?.id) return;

    try {
      setIsLoadingNotifications(true);
      api.setShopId(shop.id);

      // Fetch orders and reviews to generate notifications
      const [ordersResponse, reviewsResponse] = await Promise.all([
        api.getVendorOrders({ limit: 20 }).catch(() => null),
        api.getShopReviews(shop.id, { limit: 10 }).catch(() => null),
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

      // Take only top 10 for dropdown
      const topNotifications = newNotifications.slice(0, 10);
      setNotifications(topNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [shop?.id, t]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Handle marking notification as read
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success(t('vendor.notifications.allMarkedRead', { defaultValue: 'All notifications marked as read' }));
  };

  const handleLogout = () => {
    logout();
    // Clear additional storage
    localStorage.removeItem('vendor-auth-storage');
    localStorage.removeItem('shop-context-storage');
    localStorage.removeItem('cart-storage');
    localStorage.removeItem('accessToken');  // Main token key used by TokenManager
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    toast.success(t('vendor.common.logoutSuccess', { defaultValue: 'Logged out successfully' }));
    // Force page reload to ensure all state is cleared
    window.location.href = '/';
  };

  // Get notification icon based on type
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

  // Get notification icon background color
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

  // Profile menu items with shop-aware URLs
  const profileMenuItems = shopId ? [
    { icon: Home, label: t('vendor.profile.backToHome', { defaultValue: 'Back to Home' }), path: '/' },
    { icon: User, label: t('vendor.profile.myProfile', { defaultValue: 'My Profile' }), path: getUrl('profile') }
  ] : [
    { icon: Home, label: t('vendor.profile.backToHome', { defaultValue: 'Back to Home' }), path: '/' }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-30"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Mobile Menu + Shop Switcher */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Shop Switcher - New Component */}
          <ShopSwitcher />
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <LanguageSelector variant="topbar" showLabel={false} />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{t('vendor.notifications.title', { defaultValue: 'Notifications' })}</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">
                            {t('vendor.notifications.unreadCount', { count: unreadCount, defaultValue: '{{count}} unread' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingNotifications && notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {t('vendor.notifications.loading', { defaultValue: 'Loading notifications...' })}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {t('vendor.notifications.empty', { defaultValue: 'No notifications yet' })}
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            whileHover={{ backgroundColor: '#f9fafb' }}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-primary-lime/5' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationIconBg(notification.type)}`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary-lime flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-gray-400 text-xs mt-2">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 flex justify-between items-center">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {t('vendor.notifications.markAllRead', { defaultValue: 'Mark all read' })}
                        </button>
                      )}
                      <Link
                        to={shopId ? getUrl('notifications') : '/vendor'}
                        className="text-sm text-primary-lime hover:text-primary-lime/80 transition-colors ml-auto"
                        onClick={() => setShowNotifications(false)}
                      >
                        {t('vendor.notifications.viewAll', { defaultValue: 'View all notifications' })}
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              {vendor?.avatar ? (
                <img
                  src={vendor.avatar}
                  alt={`${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || 'Vendor'}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-lime flex items-center justify-center text-white font-semibold text-sm">
                  {(vendor?.firstName || vendor?.lastName || vendor?.email || 'V').charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {vendor?.avatar ? (
                          <img
                            src={vendor.avatar}
                            alt={`${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || 'Vendor'}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary-lime flex items-center justify-center text-white font-semibold text-lg">
                            {(vendor?.firstName || vendor?.lastName || vendor?.email || 'V').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          {!isHydrated ? (
                            <>
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-gray-900">
                                {vendor?.firstName || vendor?.lastName
                                  ? `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim()
                                  : vendor?.email?.split('@')[0] || 'Vendor'}
                              </p>
                              <p className="text-xs text-gray-500">{vendor?.email}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all text-left"
                        >
                          <item.icon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('vendor.common.logOut', { defaultValue: 'Log Out' })}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

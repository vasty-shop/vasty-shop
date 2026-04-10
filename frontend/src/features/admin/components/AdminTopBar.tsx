import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Menu,
  Globe,
  ShoppingCart,
  Store,
  Users,
  Star,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'shop' | 'user' | 'order' | 'review' | 'system';
  createdAt?: string;
}

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

// Helper to extract date from various possible field names
const extractDateField = (item: any): string | null => {
  // Check all possible date field names (including auth/user specific ones)
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
      // Handle different date formats
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'number') {
        // Unix timestamp (seconds or milliseconds)
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

// Helper to format relative time with translations
const formatRelativeTime = (dateString: string | null, t: (key: string) => string): string => {
  if (!dateString) {
    return t('admin.notifications.justNow');
  }

  const date = new Date(dateString);

  // Check if date is valid
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

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useTranslation();

  // Generate notifications from orders, shops, users, and reviews
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);

      // Fetch data from admin APIs
      const [ordersResponse, shopsResponse, usersResponse, reviewsResponse] = await Promise.all([
        api.getAdminOrders({ limit: 30 }).catch((e) => { console.log('Orders API error:', e); return null; }),
        api.getAdminShops({ limit: 30 }).catch((e) => { console.log('Shops API error:', e); return null; }),
        api.getAdminUsers({ limit: 30 }).catch((e) => { console.log('Users API error:', e); return null; }),
        api.getAdminReviews({ limit: 20 }).catch((e) => { console.log('Reviews API error:', e); return null; }),
      ]);

      const orders = ordersResponse?.data || ordersResponse?.orders || [];
      const shops = shopsResponse?.data || shopsResponse?.shops || [];
      const users = usersResponse?.data || usersResponse?.users || [];
      const reviews = reviewsResponse?.data || reviewsResponse?.reviews || [];

      const newNotifications: Notification[] = [];
      const now = new Date();

      // Generate order notifications (show all recent orders)
      orders.slice(0, 10).forEach((order: any) => {
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

      // Generate shop notifications (show all shops)
      shops.slice(0, 5).forEach((shop: any) => {
        const dateStr = extractDateField(shop);
        const shopDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = Math.floor((now.getTime() - shopDate.getTime()) / (1000 * 60));

        const timeString = formatRelativeTime(dateStr, t);
        const status = (shop.status || '').toLowerCase();
        const shopName = shop.name || shop.shopName || 'Unknown Shop';

        const isPending = status === 'pending' || status === 'pending_approval';
        const title = isPending
          ? t('admin.notifications.newShopRegistration')
          : t('admin.notifications.shopActivity', { defaultValue: 'Shop Activity' });

        newNotifications.push({
          id: `shop-${shop.id}`,
          title,
          message: isPending
            ? t('admin.notifications.newShopMsg', { shopName })
            : t('admin.notifications.shopActiveMsg', { shopName, defaultValue: '{{shopName}} is active' }),
          time: timeString,
          read: !isPending || timeDiff > 120,
          type: 'shop',
          createdAt: dateStr || undefined,
        });
      });

      // Generate user notifications (show recent users)
      // Note: database auth doesn't return created_at from listUsers, so we show "Recently" for users
      users.slice(0, 5).forEach((user: any) => {
        const dateStr = extractDateField(user);
        const userDate = dateStr ? new Date(dateStr) : new Date();
        const timeDiff = dateStr ? Math.floor((now.getTime() - userDate.getTime()) / (1000 * 60)) : 1440; // Default to 1 day if no date

        // Use "Recently" for users without dates
        const timeString = dateStr
          ? formatRelativeTime(dateStr, t)
          : t('admin.notifications.recently', { defaultValue: 'Recently' });
        const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User';

        newNotifications.push({
          id: `user-${user.id}`,
          title: t('admin.notifications.newUserRegistration'),
          message: t('admin.notifications.newUserMsg', { userName }),
          time: timeString,
          read: true, // Mark as read since we don't have actual dates
          type: 'user',
          createdAt: dateStr || undefined,
        });
      });

      // Generate review notifications
      reviews.slice(0, 5).forEach((review: any) => {
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

      // Take only top 10 for dropdown
      const topNotifications = newNotifications.slice(0, 10);
      setNotifications(topNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load admin notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [t]);

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
    toast.success(t('admin.notifications.allMarkedRead', { defaultValue: 'All notifications marked as read' }));
  };

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length <= 1) return t('admin.sidebar.dashboard');
    const pageName = path[path.length - 1];
    // Try to get translated name from sidebar keys
    const sidebarKey = `admin.sidebar.${pageName}`;
    const translated = t(sidebarKey, { defaultValue: '' });
    if (translated && translated !== sidebarKey) return translated;
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // logout() handles navigation via window.location.href
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

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
        return <AlertCircle className="w-5 h-5" />;
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
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-30"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Mobile Menu + Search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>{t('admin.common.adminPanel')}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{getBreadcrumb()}</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.topbar.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Search Button (Mobile) */}
          <button className="md:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

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
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-lg">
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
                        <h3 className="font-semibold text-gray-900">{t('admin.sidebar.notifications')}</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">
                            {t('admin.topbar.unreadCount', { count: unreadCount })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {isLoadingNotifications && notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          {t('admin.notifications.loading', { defaultValue: 'Loading notifications...' })}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {t('admin.notifications.empty', { defaultValue: 'No notifications yet' })}
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            whileHover={{ backgroundColor: '#f9fafb' }}
                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-indigo-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationIconBg(notification.type)}`}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
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
                          {t('admin.notifications.markAllRead', { defaultValue: 'Mark all read' })}
                        </button>
                      )}
                      <Link
                        to="/admin/notifications"
                        className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium ml-auto"
                        onClick={() => setShowNotifications(false)}
                      >
                        {t('admin.topbar.viewAllNotifications')}
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{t('admin.topbar.admin')}</p>
                <p className="text-xs text-gray-500">{t('admin.topbar.superAdmin')}</p>
              </div>
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{t('admin.topbar.adminUser')}</p>
                          <p className="text-xs text-gray-500">{t('admin.topbar.superAdmin')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all text-left"
                      >
                        <Globe className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">{t('admin.topbar.goToWebsite')}</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('admin.sidebar.logout')}</span>
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

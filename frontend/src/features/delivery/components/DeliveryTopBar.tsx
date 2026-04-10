import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Truck,
  Menu,
  MapPin,
  Wifi,
  Package,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { deliveryApi } from '../api/deliveryApi';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'earning' | 'system';
  icon?: React.ElementType;
}

interface DeliveryTopBarProps {
  onMenuClick?: () => void;
}

export const DeliveryTopBar: React.FC<DeliveryTopBarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { deliveryMan, logout: deliveryLogout } = useDeliveryAuthStore();
  const { logout: authLogout } = useAuth();

  // Fetch notifications from orders and deliveries
  const fetchNotifications = useCallback(async () => {
    if (!deliveryMan?.id) return;

    setIsLoadingNotifications(true);
    try {
      // Fetch recent orders and delivery history
      const [ordersResponse, historyResponse] = await Promise.all([
        deliveryApi.getOrders(deliveryMan.id).catch((e) => {
          console.log('[DeliveryTopBar] getOrders error:', e);
          return null;
        }),
        deliveryApi.getDeliveryHistory(deliveryMan.id, { limit: 5 }).catch((e) => {
          console.log('[DeliveryTopBar] getDeliveryHistory error:', e);
          return null;
        }),
      ]);

      // Debug: Log the response structure
      console.log('[DeliveryTopBar] Orders response:', ordersResponse);
      console.log('[DeliveryTopBar] History response:', historyResponse);

      // Handle different response structures: response.data.data or response.data or response
      const ordersData = ordersResponse?.data;
      const orders = ordersData?.data || ordersData || ordersResponse || [];

      const historyData = historyResponse?.data;
      const history = historyData?.data || historyData || historyResponse || [];

      // Combine orders and history, removing duplicates
      const allOrders = [...(Array.isArray(orders) ? orders : [])];
      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          if (!allOrders.find((o: any) => o.id === h.id)) {
            allOrders.push(h);
          }
        });
      }

      console.log('[DeliveryTopBar] All orders combined:', allOrders.length, allOrders);

      const newNotifications: Notification[] = [];
      const now = new Date();

      // Generate notifications from orders
      if (allOrders.length > 0) {
        console.log('[DeliveryTopBar] Processing', allOrders.length, 'orders for notifications');
        allOrders.slice(0, 10).forEach((order: any, index: number) => {
          console.log('[DeliveryTopBar] Order', index, ':', {
            id: order.id,
            status: order.status,
            orderNumber: order.orderNumber || order.order_number,
            createdAt: order.createdAt || order.created_at || order.updatedAt || order.updated_at,
          });

          // Get date from various possible fields
          const dateStr = order.createdAt || order.created_at || order.updatedAt || order.updated_at || order.assignedAt || order.assigned_at;
          const orderDate = dateStr ? new Date(dateStr) : new Date();
          const timeDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60)); // minutes

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

          if (status === 'delivered' || status === 'completed') {
            // Completed delivery notification
            newNotifications.push({
              id: `delivery-${order.id}`,
              title: t('delivery.topbar.deliveryCompleted'),
              message: `${t('delivery.topbar.orderDeliveredMsg')} #${order.orderNumber || order.order_number}`,
              time: timeString,
              read: timeDiff > 60, // Mark as read if older than 1 hour
              type: 'earning',
              icon: CheckCircle,
            });
          } else if (status === 'shipped' || status === 'in_transit' || status === 'out_for_delivery') {
            // Active delivery notification
            newNotifications.push({
              id: `active-${order.id}`,
              title: t('delivery.topbar.activeDelivery'),
              message: `${t('delivery.topbar.deliverToMsg')} ${order.shippingAddress?.city || order.shipping_address?.city || ''}`,
              time: timeString,
              read: timeDiff > 30,
              type: 'order',
              icon: Package,
            });
          } else if (status === 'pending' || status === 'confirmed' || status === 'processing') {
            // New order assigned notification
            newNotifications.push({
              id: `new-${order.id}`,
              title: t('delivery.topbar.newOrderAssigned'),
              message: `${t('delivery.topbar.orderAssignedMsg')} #${order.orderNumber || order.order_number}`,
              time: timeString,
              read: timeDiff > 15,
              type: 'order',
              icon: Package,
            });
          } else {
            // Log unhandled status but still create notification for any order
            console.log('[DeliveryTopBar] Unhandled status:', status, '- creating generic notification');
            newNotifications.push({
              id: `order-${order.id}`,
              title: t('delivery.topbar.newOrderAssigned'),
              message: `${t('delivery.topbar.orderAssignedMsg')} #${order.orderNumber || order.order_number}`,
              time: timeString,
              read: timeDiff > 30,
              type: 'order',
              icon: Package,
            });
          }
        });
      }

      console.log('[DeliveryTopBar] Created notifications:', newNotifications.length, newNotifications);

      // Sort by unread first, then by time
      newNotifications.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return 0;
      });

      setNotifications(newNotifications);
    } catch (error) {
      console.error('[DeliveryTopBar] Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [deliveryMan?.id, t]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length <= 2) return t('delivery.sidebar.dashboard');
    const lastSegment = path[path.length - 1];
    // Map path segments to translation keys
    const segmentMap: Record<string, string> = {
      dashboard: 'delivery.sidebar.dashboard',
      orders: 'delivery.sidebar.orders',
      history: 'delivery.sidebar.history',
      earnings: 'delivery.sidebar.earnings',
      reviews: 'delivery.sidebar.reviews',
      zones: 'delivery.sidebar.zones',
      profile: 'delivery.sidebar.profile',
      settings: 'delivery.sidebar.settings',
    };
    return segmentMap[lastSegment] ? t(segmentMap[lastSegment]) : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const handleLogout = async () => {
    // Clear delivery-specific auth state
    deliveryLogout();
    // Clear delivery auth storage
    localStorage.removeItem('delivery-auth-storage');
    // Clear main auth state (this handles API logout, token clearing, etc.)
    await authLogout();
    // Note: authLogout() redirects to '/' via window.location.href
  };

  // Delivery man is always online when using the app
  // No toggle needed - status changes to ON_DELIVERY automatically when they accept orders

  const profileMenuItems = [
    { icon: User, label: t('delivery.sidebar.profile'), path: `/delivery/${deliveryMan?.id}/profile` },
    { icon: Settings, label: t('delivery.sidebar.settings'), path: `/delivery/${deliveryMan?.id}/settings` },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-30"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Section - Mobile Menu + Breadcrumb */}
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
            <span>{t('delivery.common.deliveryPanel')}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{getBreadcrumb()}</span>
          </div>

          {/* Current Location (if available) */}
          {deliveryMan?.currentLocation && (
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500 ml-4">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[200px]">
                {deliveryMan.currentLocation.address || t('delivery.topbar.locationTrackingActive')}
              </span>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <LanguageSelector variant="topbar" showLabel={false} />

          {/* Availability Status Indicator */}
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              deliveryMan?.availability === 'ON_DELIVERY'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">
              {deliveryMan?.availability === 'ON_DELIVERY'
                ? t('delivery.dashboard.onDelivery')
                : t('delivery.dashboard.online')}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-lg">
                  {unreadCount}
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
                        <h3 className="font-semibold text-gray-900">{t('delivery.topbar.notifications')}</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">{unreadCount} {t('delivery.topbar.unread')}</span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {isLoadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">{t('delivery.topbar.loadingNotifications')}</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">{t('delivery.topbar.noNotifications')}</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const IconComponent = notification.icon || Bell;
                          return (
                            <motion.div
                              key={notification.id}
                              whileHover={{ backgroundColor: '#f9fafb' }}
                              className={`p-4 border-b border-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-orange-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    notification.type === 'order'
                                      ? 'bg-blue-100 text-blue-600'
                                      : notification.type === 'earning'
                                      ? 'bg-green-100 text-green-600'
                                      : 'bg-orange-100 text-orange-600'
                                  }`}
                                >
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                                  <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(`/delivery/${deliveryMan?.id}/notifications`);
                        }}
                        className="w-full text-center text-sm text-orange-600 hover:text-orange-700 transition-colors font-medium"
                      >
                        {t('delivery.topbar.viewAllNotifications')}
                      </button>
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                {deliveryMan?.avatar ? (
                  <img
                    src={deliveryMan.avatar}
                    alt={deliveryMan.firstName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <Truck className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {deliveryMan?.firstName || t('delivery.topbar.deliveryPartner')}
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryMan?.rating ? `${Number(deliveryMan.rating).toFixed(1)} ${t('delivery.dashboard.rating')}` : t('delivery.topbar.partner')}
                </p>
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                          {deliveryMan?.avatar ? (
                            <img
                              src={deliveryMan.avatar}
                              alt={deliveryMan.firstName}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <Truck className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {deliveryMan?.firstName} {deliveryMan?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{deliveryMan?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="p-3 border-b border-gray-100 grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {deliveryMan?.totalDeliveries || 0}
                        </p>
                        <p className="text-xs text-gray-500">{t('delivery.dashboard.deliveries')}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {Number(deliveryMan?.rating || 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">{t('delivery.dashboard.rating')}</p>
                      </div>
                    </div>

                    <div className="p-2">
                      {profileMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            navigate(item.path);
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-all text-left"
                        >
                          <item.icon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">{t('delivery.sidebar.logout')}</span>
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

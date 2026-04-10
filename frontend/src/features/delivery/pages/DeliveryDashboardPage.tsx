import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Wallet,
  Clock,
  Star,
  MapPin,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  Phone,
  RefreshCw,
  Radio,
  MapPinOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import type { DeliveryOrder } from '../types/delivery.types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useDeliveryLocationSender } from '@/hooks/useDeliveryLocationSender';

interface DashboardStats {
  todayDeliveries: number;
  weekDeliveries: number;
  totalDeliveries: number;
  todayEarnings: number;
  weekEarnings: number;
  totalEarnings: number;
  pendingEarnings: number;
  pendingOrders: number;
  activeOrders: number;
  completionRate: number;
  averageRating: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'orange' | 'green' | 'blue' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorClasses = {
    orange: 'from-orange-500 to-amber-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export const DeliveryDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan } = useDeliveryAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<DeliveryOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Live location tracking - sends GPS to backend when online/on delivery
  // Check both uppercase and lowercase since database stores lowercase
  const availability = deliveryMan?.availability?.toUpperCase();
  const shouldSendLocation = availability === 'ONLINE' || availability === 'ON_DELIVERY';
  const currentOrderId = activeOrders.length > 0 ? activeOrders[0].orderId : undefined;

  const {
    isSending: isLocationSending,
    lastSentAt: locationLastSent,
    error: locationError,
  } = useDeliveryLocationSender({
    deliveryManId: deliveryMan?.id || '',
    orderId: currentOrderId,
    updateInterval: 10000, // Send location every 10 seconds
    enabled: shouldSendLocation && !!deliveryMan?.id,
    onError: (error) => {
      console.error('Location sending error:', error);
    },
  });

  const loadDashboardData = async () => {
    if (!deliveryMan?.id) return;

    setIsLoading(true);
    try {
      // Fetch all orders and earnings in parallel
      const [allOrdersRes, pendingOrdersRes, activeOrdersRes, earningsRes] = await Promise.all([
        deliveryApi.getOrders(deliveryMan.id), // All orders
        deliveryApi.getOrders(deliveryMan.id, 'assigned'), // Pending
        deliveryApi.getOrders(deliveryMan.id, 'accepted,picked_up,on_the_way'), // Active
        deliveryApi.getEarnings(deliveryMan.id, 'week'),
      ]);

      const allOrders = allOrdersRes.data?.data || allOrdersRes.data || [];
      const pending = pendingOrdersRes.data?.data || pendingOrdersRes.data || [];
      const active = activeOrdersRes.data?.data || activeOrdersRes.data || [];
      const earnings = earningsRes.data?.data || earningsRes.data || {};

      setPendingOrders(Array.isArray(pending) ? pending : []);
      setActiveOrders(Array.isArray(active) ? active : []);

      // Calculate stats from orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const deliveredOrders = allOrders.filter((o: DeliveryOrder) => o.status === 'DELIVERED');
      const todayDeliveries = deliveredOrders.filter((o: DeliveryOrder) => {
        const date = new Date(o.deliveredAt || o.assignedAt);
        return date >= today;
      });
      const weekDeliveries = deliveredOrders.filter((o: DeliveryOrder) => {
        const date = new Date(o.deliveredAt || o.assignedAt);
        return date >= weekAgo;
      });

      // Calculate completion rate
      const totalAssigned = allOrders.length;
      const completed = deliveredOrders.length;
      const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

      // Calculate earnings from delivered orders
      const todayEarnings = todayDeliveries.reduce((sum: number, o: DeliveryOrder) => {
        return sum + (parseFloat(String(o.deliveryFee)) || 0) + (parseFloat(String(o.tip)) || 0);
      }, 0);

      const weekEarnings = weekDeliveries.reduce((sum: number, o: DeliveryOrder) => {
        return sum + (parseFloat(String(o.deliveryFee)) || 0) + (parseFloat(String(o.tip)) || 0);
      }, 0);

      setStats({
        todayDeliveries: todayDeliveries.length,
        weekDeliveries: weekDeliveries.length,
        totalDeliveries: deliveredOrders.length,
        todayEarnings,
        weekEarnings,
        totalEarnings: parseFloat(String(earnings.totalEarnings || deliveryMan.totalEarnings)) || 0,
        pendingEarnings: parseFloat(String(earnings.pendingEarnings || deliveryMan.pendingEarnings)) || 0,
        pendingOrders: pending.length,
        activeOrders: active.length,
        completionRate,
        averageRating: parseFloat(String(deliveryMan.rating)) || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error(t('delivery.dashboard.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [deliveryMan]);

  const handleAcceptOrder = async (order: DeliveryOrder) => {
    if (!deliveryMan?.id) return;

    setProcessingOrderId(order.id);
    try {
      await deliveryApi.acceptOrder(deliveryMan.id, order.orderId);
      toast.success(t('delivery.orders.orderAccepted'));
      loadDashboardData();
    } catch (error) {
      toast.error(t('delivery.orders.acceptFailed'));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (order: DeliveryOrder) => {
    if (!deliveryMan?.id) return;

    setProcessingOrderId(order.id);
    try {
      await deliveryApi.rejectOrder(deliveryMan.id, order.orderId);
      toast.success(t('delivery.orders.orderDeclined'));
      loadDashboardData();
    } catch (error) {
      toast.error(t('delivery.orders.declineFailed'));
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('delivery.common.welcome')}, {deliveryMan?.firstName || (deliveryMan as any)?.name?.split(' ')[0] || t('delivery.dashboard.rider')}!
          </h1>
          <p className="text-gray-500 mt-1">{t('delivery.dashboard.subtitle')}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('delivery.common.refreshData')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {/* Location sharing indicator */}
          {shouldSendLocation && (
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                isLocationSending && !locationError
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : locationError
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
              title={
                locationError
                  ? t('delivery.location.sharingError')
                  : isLocationSending
                  ? t('delivery.location.sharingActive')
                  : t('delivery.location.sharingInactive')
              }
            >
              {isLocationSending && !locationError ? (
                <>
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>{t('delivery.location.live')}</span>
                </>
              ) : locationError ? (
                <>
                  <MapPinOff className="w-3 h-3" />
                  <span>{t('delivery.location.error')}</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{t('delivery.location.waiting')}</span>
                </>
              )}
            </div>
          )}
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              availability === 'ON_DELIVERY'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {availability === 'ON_DELIVERY'
              ? t('delivery.dashboard.onDelivery')
              : t('delivery.dashboard.online')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('delivery.dashboard.todayDeliveries')}
          value={stats?.todayDeliveries || 0}
          subtitle={`${stats?.weekDeliveries || 0} ${t('delivery.dashboard.thisWeek')}`}
          icon={Package}
          color="orange"
        />
        <StatCard
          title={t('delivery.dashboard.todayEarnings')}
          value={`$${(stats?.todayEarnings || 0).toFixed(2)}`}
          subtitle={`$${(stats?.pendingEarnings || 0).toFixed(2)} ${t('delivery.dashboard.pending')}`}
          icon={Wallet}
          color="green"
        />
        <StatCard
          title={t('delivery.dashboard.activeOrders')}
          value={stats?.activeOrders || 0}
          subtitle={`${stats?.pendingOrders || 0} ${t('delivery.dashboard.pending')}`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title={t('delivery.dashboard.rating')}
          value={(stats?.averageRating || 0).toFixed(1)}
          subtitle={`${deliveryMan?.totalReviews || 0} ${t('delivery.reviews.totalReviews')}`}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Pending Orders & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('delivery.dashboard.pendingOrders')}</h2>
                <p className="text-sm text-gray-500">{pendingOrders.length} {t('delivery.dashboard.ordersWaiting')}</p>
              </div>
              <Link
                to={`/delivery/${deliveryMan?.id}/orders`}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
              >
                {t('delivery.common.viewAll')}
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {pendingOrders.length > 0 ? (
              pendingOrders.slice(0, 5).map((order) => {
                const isProcessing = processingOrderId === order.id;
                return (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                            {t('delivery.orders.assigned')}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                            <span className="truncate">{order.pickupAddress?.shopName || order.pickupAddress?.address || '-'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
                            <span className="truncate">{order.deliveryAddress?.customerName || order.deliveryAddress?.address || '-'}</span>
                          </div>
                          {order.deliveryAddress?.customerPhone && (
                            <a
                              href={`tel:${order.deliveryAddress.customerPhone}`}
                              className="flex items-center text-sm text-orange-600"
                            >
                              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                              {order.deliveryAddress.customerPhone}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">${(parseFloat(String(order.deliveryFee)) || 0).toFixed(2)}</p>
                        {order.distance && (
                          <p className="text-sm text-gray-500">{(parseFloat(String(order.distance)) || 0).toFixed(1)} km</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        disabled={isProcessing}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {t('delivery.common.accept')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order)}
                        disabled={isProcessing}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {t('delivery.orders.decline')}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('delivery.dashboard.noPendingOrders')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('delivery.dashboard.newOrdersAppear')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Earnings */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('delivery.dashboard.performance')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{t('delivery.dashboard.completionRate')}</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.completionRate || 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${stats?.completionRate || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{t('delivery.dashboard.totalDeliveries')}</span>
                  <span className="text-sm font-medium text-gray-900">{stats?.totalDeliveries || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min((stats?.totalDeliveries || 0) * 2, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{t('delivery.dashboard.customerRating')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(stats?.averageRating || 0).toFixed(1)}/5
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${((stats?.averageRating || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">{t('delivery.dashboard.thisWeek')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-orange-100">{t('delivery.dashboard.deliveries')}</span>
                <span className="font-semibold">{stats?.weekDeliveries || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-100">{t('delivery.sidebar.earnings')}</span>
                <span className="font-semibold">${(stats?.weekEarnings || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-100">{t('delivery.dashboard.pending')}</span>
                <span className="font-semibold">${(stats?.pendingEarnings || 0).toFixed(2)}</span>
              </div>
              <hr className="border-orange-400/50" />
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('delivery.dashboard.totalEarned')}</span>
                <span className="text-xl font-bold">
                  ${(stats?.totalEarnings || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

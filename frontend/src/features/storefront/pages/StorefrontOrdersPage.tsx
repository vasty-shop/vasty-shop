'use client';

/**
 * Storefront Orders Page
 * Full-featured orders display with statistics, filters, and order details
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  Eye,
  Search,
  ChevronRight,
  ChevronLeft,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ShoppingBag,
  MapPin,
  CreditCard,
  Calendar,
  Filter,
  Download,
  Loader2,
  BarChart3,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import api from '@/lib/api';
import { useStorefront } from '../StorefrontLayout';
import { useCartStore } from '@/stores/useCartStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  id: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  product?: {
    id: string;
    name: string;
    images: string[];
    shopId?: string;
  };
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  items: OrderItem[];
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryDate?: string;
  canCancel?: boolean;
  canReturn?: boolean;
}

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: '#ca8a04', bgColor: 'rgba(234, 179, 8, 0.1)', label: 'Pending' },
  processing: { icon: Clock, color: '#2563eb', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'Processing' },
  confirmed: { icon: CheckCircle2, color: '#16a34a', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Confirmed' },
  shipped: { icon: Truck, color: '#9333ea', bgColor: 'rgba(147, 51, 234, 0.1)', label: 'Shipped' },
  in_transit: { icon: Package, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)', label: 'In Transit' },
  out_for_delivery: { icon: Truck, color: '#ea580c', bgColor: 'rgba(234, 88, 12, 0.1)', label: 'Out for Delivery' },
  delivered: { icon: CheckCircle2, color: '#16a34a', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Delivered' },
  cancelled: { icon: XCircle, color: '#dc2626', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Cancelled' },
  refunded: { icon: AlertCircle, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)', label: 'Refunded' },
};

const ORDERS_PER_PAGE = 10;

interface LocationState {
  orderNumber?: string;
  orderId?: string;
  success?: boolean;
  justPlaced?: boolean;
}

export function StorefrontOrdersPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useStorefront();
  const { storeCustomer, isStoreAuthenticated } = useStoreAuth();
  const { addItem } = useCartStore();
  const { t } = useTranslation();

  // Check if user is authenticated for this specific store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  // Check if we just placed an order
  const locationState = location.state as LocationState | null;
  const [showOrderSuccess, setShowOrderSuccess] = useState(!!locationState?.justPlaced);
  const justPlacedOrderNumber = locationState?.orderNumber;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [dateRange, setDateRange] = useState('last_6_months');
  const [sortBy, setSortBy] = useState('most_recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Cancel order modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Clear location state after reading it (to prevent showing on refresh)
  useEffect(() => {
    if (locationState?.justPlaced) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

  // Statistics
  const statistics = useMemo(() => {
    const totalOrders = orders.length;
    const activeStatuses = ['processing', 'confirmed', 'shipped', 'in_transit', 'out_for_delivery'];
    const activeOrders = orders.filter(o => activeStatuses.includes(o.status.toLowerCase())).length;
    const currentYear = new Date().getFullYear();
    const totalSpent = orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getFullYear() === currentYear && o.status !== 'cancelled' && o.status !== 'refunded';
      })
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return { totalOrders, activeOrders, totalSpent };
  }, [orders]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch orders - filtered by shopId for this store
        const response = await api.getOrders({ limit: 100, shopId });

        // Use response.data directly like main OrdersPage does
        let ordersData = response.data || [];

        // Additional frontend filter to ensure only orders for this shop are shown
        // This is a fallback in case backend filtering missed some orders
        if (shopId) {
          ordersData = ordersData.filter((order: any) => {
            // Check if order has any items from this shop
            const hasShopItems = order.items?.some((item: any) =>
              item.shopId === shopId || item.shop_id === shopId
            );
            // Also check order-level shopId
            const orderShopMatch = order.shopId === shopId || order.shop_id === shopId;
            return hasShopItems || orderShopMatch;
          });
        }

        setOrders(ordersData);
      } catch (err: any) {
        console.error('[StorefrontOrders] Failed to fetch orders:', err);
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, shopId, storeCustomer?.id, storeCustomer?.email]);

  if (!theme) return null;

  const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const radiusMap: Record<string, Record<string, string>> = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-xl', medium: 'rounded-2xl', large: 'rounded-3xl' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  const getSecondaryTextStyle = () => ({
    color: theme.textColor,
    opacity: 0.7,
  });

  const getCardBg = () => {
    const isDark = theme.backgroundColor.toLowerCase() === '#000000' ||
                   theme.backgroundColor.toLowerCase() === '#1a1a1a' ||
                   theme.backgroundColor.toLowerCase().includes('rgb(0');
    if (isDark) {
      return 'rgba(255,255,255,0.05)';
    }
    return theme.backgroundColor;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status.toLowerCase() === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(o =>
        o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some(item =>
          (item.product?.name || item.productName || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Date range filter
    if (dateRange !== 'all_time') {
      const now = new Date();
      let startDate: Date;
      if (dateRange === 'last_30_days') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (dateRange === 'last_6_months') {
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      } else if (dateRange === 'this_year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else {
        startDate = new Date(0);
      }
      filtered = filtered.filter(o => new Date(o.createdAt) >= startDate);
    }

    // Sort
    if (sortBy === 'most_recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest_first') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'price_high_low') {
      filtered.sort((a, b) => Number(b.total) - Number(a.total));
    } else if (sortBy === 'price_low_high') {
      filtered.sort((a, b) => Number(a.total) - Number(b.total));
    }

    return filtered;
  }, [orders, statusFilter, searchQuery, dateRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handleBuyAgain = async (order: Order) => {
    try {
      let addedCount = 0;
      for (const item of order.items) {
        const product = item.product || {
          id: item.productId || '',
          name: item.productName || '',
          images: item.productImage ? [item.productImage] : [],
          price: item.price,
          shopId: shopId,
        };
        await addItem(product as any, (item.size || 'M') as any, item.color);
        addedCount++;
      }
      toast.success(`Added ${addedCount} item(s) to cart`, {
        action: {
          label: 'View Cart',
          onClick: () => navigate(`/store/${shopId}/cart`),
        },
      });
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  const openCancelModal = (order: Order) => {
    setOrderToCancel(order);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
    setCancelReason('');
    setCancelling(false);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setCancelling(true);
      await api.cancelOrder(orderToCancel.id, cancelReason || 'Customer requested cancellation', shopId);
      toast.success(t('orders.orderCancelled') || 'Order cancelled successfully');
      setOrders(prev => prev.map(o =>
        o.id === orderToCancel.id ? { ...o, status: 'cancelled', canCancel: false } : o
      ));
      closeCancelModal();
    } catch (error: any) {
      toast.error(error.message || t('orders.cancelFailed') || 'Failed to cancel order');
      setCancelling(false);
    }
  };

  const STATUS_TABS: { value: OrderStatus; label: string }[] = [
    { value: 'all', label: t('orders.myOrders') },
    { value: 'processing', label: t('orders.orderStatuses.processing') },
    { value: 'shipped', label: t('orders.orderStatuses.shipped') },
    { value: 'delivered', label: t('orders.orderStatuses.delivered') },
    { value: 'cancelled', label: t('orders.orderStatuses.cancelled') },
  ];

  // Not logged in state - redirect to store login
  if (!isAuthenticated) {
    return (
      <div className="py-20 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className={`w-32 h-32 mx-auto mb-8 ${getBorderRadius('large')} flex items-center justify-center`}
            style={{ backgroundColor: `${theme.textColor}10` }}
          >
            <Package className="w-16 h-16" style={{ color: theme.textColor, opacity: 0.3 }} />
          </div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('auth.signInToContinue')}
          </h1>
          <p className="text-lg mb-8" style={getSecondaryTextStyle()}>
            {t('orders.noOrdersMessage')}
          </p>
          <Link
            to={`/store/${shopId}/login`}
            state={{ from: location }}
            className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            {t('common.login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-6xl mx-auto">
        {/* Order Success Banner */}
        <AnimatePresence>
          {showOrderSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`mb-8 p-6 ${getBorderRadius('large')} border-2`}
              style={{
                backgroundColor: `${theme.primaryColor}15`,
                borderColor: theme.primaryColor,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{ color: theme.textColor, fontFamily: theme.headingFont }}
                  >
                    {t('checkout.orderPlaced')}
                  </h2>
                  <p style={getSecondaryTextStyle()}>
                    {t('orders.orderNumber')}: {justPlacedOrderNumber && <strong>#{justPlacedOrderNumber}</strong>}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderSuccess(false)}
                  className="p-1 rounded-full hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('orders.myOrders')}
          </h1>
          <p style={getSecondaryTextStyle()}>{t('orders.trackOrder')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: t('orders.orderHistory'), value: statistics.totalOrders, icon: Package, color: '#3b82f6' },
            { label: t('orders.orderStatuses.processing'), value: statistics.activeOrders, icon: Truck, color: '#22c55e' },
            { label: t('common.total'), value: `$${statistics.totalSpent.toFixed(2)}`, icon: BarChart3, color: '#a855f7' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 md:p-6 border ${getBorderRadius('large')}`}
              style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm mb-1" style={getSecondaryTextStyle()}>
                    {stat.label}
                  </p>
                  <p className="text-xl md:text-2xl font-bold" style={{ color: theme.textColor }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status Tabs */}
        <div
          className={`p-1 border ${getBorderRadius('medium')} mb-6 overflow-x-auto`}
          style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
        >
          <div className="flex gap-1 min-w-max">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium ${getBorderRadius('small')} transition-all whitespace-nowrap`}
                style={{
                  backgroundColor: statusFilter === tab.value ? theme.primaryColor : 'transparent',
                  color: statusFilter === tab.value ? '#fff' : theme.textColor,
                }}
              >
                {tab.label}
                {tab.value === 'all' && (
                  <span
                    className="ml-2 px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: statusFilter === tab.value ? 'rgba(255,255,255,0.2)' : `${theme.textColor}10`,
                    }}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div
          className={`flex flex-wrap items-center gap-4 mb-6 p-4 border ${getBorderRadius('medium')}`}
          style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
        >
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: theme.textColor, opacity: 0.5 }}
            />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
              style={{
                backgroundColor: 'transparent',
                borderColor: `${theme.textColor}20`,
                color: theme.textColor,
              }}
            />
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
            style={{
              backgroundColor: 'transparent',
              borderColor: `${theme.textColor}20`,
              color: theme.textColor,
            }}
          >
            <option value="last_30_days">Last 30 days</option>
            <option value="last_6_months">Last 6 months</option>
            <option value="this_year">This year</option>
            <option value="all_time">All time</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
            style={{
              backgroundColor: 'transparent',
              borderColor: `${theme.textColor}20`,
              color: theme.textColor,
            }}
          >
            <option value="most_recent">Most Recent</option>
            <option value="oldest_first">Oldest First</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="price_low_high">Price: Low to High</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className={`p-12 text-center border ${getBorderRadius('large')}`}
            style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: theme.textColor, fontFamily: theme.headingFont }}
            >
              {t('common.error')}
            </h3>
            <p className="mb-6" style={getSecondaryTextStyle()}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`px-6 py-2 border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
              style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
            >
              {t('common.tryAgain')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div
            className={`p-12 text-center border ${getBorderRadius('large')}`}
            style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.2 }} />
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: theme.textColor, fontFamily: theme.headingFont }}
            >
              {t('orders.noOrders')}
            </h3>
            <p className="mb-6" style={getSecondaryTextStyle()}>
              {orders.length === 0
                ? t('orders.noOrdersMessage')
                : t('common.noResults')}
            </p>
            <Link
              to={`/store/${shopId}/products`}
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
              style={{ backgroundColor: theme.primaryColor }}
            >
              {t('common.shopNow')}
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && paginatedOrders.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedOrders.map((order, index) => {
                const config = STATUS_CONFIG[order.status.toLowerCase()] || {
                  icon: AlertCircle,
                  color: '#6b7280',
                  bgColor: 'rgba(107, 114, 128, 0.1)',
                  label: order.status,
                };
                const StatusIcon = config.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border ${getBorderRadius('large')} overflow-hidden`}
                    style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 border-b"
                      style={{ borderColor: `${theme.textColor}10`, backgroundColor: `${theme.textColor}03` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs" style={getSecondaryTextStyle()}>{t('orders.orderNumber')}</p>
                            <p className="font-semibold" style={{ color: theme.textColor }}>
                              {order.orderNumber}
                            </p>
                          </div>
                          <div className="h-8 w-px" style={{ backgroundColor: `${theme.textColor}20` }} />
                          <div>
                            <p className="text-xs" style={getSecondaryTextStyle()}>{t('orders.orderDate')}</p>
                            <p className="font-medium" style={{ color: theme.textColor }}>
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 ${getBorderRadius('small')}`}
                            style={{ backgroundColor: config.bgColor }}
                          >
                            <StatusIcon className="w-4 h-4" style={{ color: config.color }} />
                            <span className="text-sm font-medium" style={{ color: config.color }}>
                              {config.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs" style={getSecondaryTextStyle()}>{t('common.total')}</p>
                            <p className="font-bold" style={{ color: theme.primaryColor }}>
                              ${Number(order.total || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4" style={{ color: '#22c55e' }} />
                          <span style={getSecondaryTextStyle()}>{t('checkout.estimatedDelivery')}:</span>
                          <span className="font-medium" style={{ color: '#22c55e' }}>
                            {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Product Images */}
                        <div className="flex gap-2">
                          {order.items.slice(0, 4).map((item, idx) => {
                            const imageUrl = item.product?.images?.[0] || item.productImage || '';
                            return (
                              <div
                                key={item.id || idx}
                                className={`w-14 h-14 md:w-16 md:h-16 ${getBorderRadius('medium')} overflow-hidden border`}
                                style={{ borderColor: `${theme.textColor}15`, backgroundColor: `${theme.textColor}10` }}
                              >
                                {imageUrl ? (
                                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6" style={{ color: theme.textColor, opacity: 0.3 }} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {order.items.length > 4 && (
                            <div
                              className={`w-14 h-14 md:w-16 md:h-16 ${getBorderRadius('medium')} flex items-center justify-center border`}
                              style={{ borderColor: `${theme.textColor}15`, backgroundColor: `${theme.textColor}10` }}
                            >
                              <span className="text-sm font-semibold" style={getSecondaryTextStyle()}>
                                +{order.items.length - 4}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Items Summary */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={getSecondaryTextStyle()}>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="font-medium truncate" style={{ color: theme.textColor }}>
                            {order.items[0]?.product?.name || order.items[0]?.productName || 'Product'}
                            {order.items.length > 1 && ` and ${order.items.length - 1} more`}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
                            style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                          >
                            <Eye className="w-4 h-4" />
                            {isExpanded ? t('common.close') : t('orders.orderDetails')}
                          </button>

                          {order.trackingNumber && (
                            <Link
                              to={`/store/${shopId}/track-order?order=${order.orderNumber}`}
                              className={`flex items-center gap-2 px-3 py-2 text-sm border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
                              style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                            >
                              <MapPin className="w-4 h-4" />
                              {t('orders.trackOrder')}
                            </Link>
                          )}

                          <button
                            onClick={() => handleBuyAgain(order)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {t('orders.reorder')}
                          </button>

                          {order.canCancel && (
                            <button
                              onClick={() => openCancelModal(order)}
                              className={`flex items-center gap-2 px-3 py-2 text-sm border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
                              style={{ borderColor: '#ef4444', color: '#ef4444' }}
                            >
                              <X className="w-4 h-4" />
                              {t('orders.cancelOrder')}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.textColor}10` }}>
                              {/* Order Items */}
                              <div className="mb-6">
                                <h4
                                  className="font-semibold mb-4"
                                  style={{ color: theme.textColor, fontFamily: theme.headingFont }}
                                >
                                  {t('orders.orderItems')}
                                </h4>
                                <div className="space-y-3">
                                  {order.items.map((item, idx) => {
                                    const imageUrl = item.product?.images?.[0] || item.productImage || '';
                                    const productName = item.product?.name || item.productName || 'Product';
                                    return (
                                      <div
                                        key={item.id || idx}
                                        className={`flex items-start gap-4 p-4 ${getBorderRadius('medium')}`}
                                        style={{ backgroundColor: `${theme.textColor}05` }}
                                      >
                                        <div
                                          className={`w-16 h-16 ${getBorderRadius('medium')} overflow-hidden flex-shrink-0`}
                                          style={{ backgroundColor: `${theme.textColor}10` }}
                                        >
                                          {imageUrl ? (
                                            <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <Package className="w-6 h-6" style={{ color: theme.textColor, opacity: 0.3 }} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-semibold" style={{ color: theme.textColor }}>
                                            {productName}
                                          </p>
                                          <div className="flex items-center gap-4 mt-1 text-sm" style={getSecondaryTextStyle()}>
                                            {item.size && <span>{t('cart.size')}: {item.size}</span>}
                                            <span>{t('common.qty')}: {item.quantity}</span>
                                            {item.color && (
                                              <div className="flex items-center gap-1">
                                                <span>{t('cart.color')}:</span>
                                                <div
                                                  className="w-4 h-4 rounded-full border"
                                                  style={{ backgroundColor: item.color, borderColor: `${theme.textColor}20` }}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold" style={{ color: theme.primaryColor }}>
                                            ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                  <div>
                                    <h4
                                      className="font-semibold mb-3 flex items-center gap-2"
                                      style={{ color: theme.textColor }}
                                    >
                                      <MapPin className="w-4 h-4" />
                                      {t('checkout.shippingAddress')}
                                    </h4>
                                    <div
                                      className={`p-4 text-sm ${getBorderRadius('medium')}`}
                                      style={{ backgroundColor: `${theme.textColor}05` }}
                                    >
                                      <p className="font-medium" style={{ color: theme.textColor }}>
                                        {order.shippingAddress.fullName}
                                      </p>
                                      <p style={getSecondaryTextStyle()}>{order.shippingAddress.addressLine1}</p>
                                      {order.shippingAddress.addressLine2 && (
                                        <p style={getSecondaryTextStyle()}>{order.shippingAddress.addressLine2}</p>
                                      )}
                                      <p style={getSecondaryTextStyle()}>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                      </p>
                                      <p style={getSecondaryTextStyle()}>{order.shippingAddress.phone}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Payment Summary */}
                                <div>
                                  <h4
                                    className="font-semibold mb-3 flex items-center gap-2"
                                    style={{ color: theme.textColor }}
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    {t('checkout.paymentDetails')}
                                  </h4>
                                  <div
                                    className={`p-4 text-sm space-y-2 ${getBorderRadius('medium')}`}
                                    style={{ backgroundColor: `${theme.textColor}05` }}
                                  >
                                    {order.paymentMethod && (
                                      <div className="flex justify-between">
                                        <span style={getSecondaryTextStyle()}>{t('checkout.paymentMethod')}</span>
                                        <span style={{ color: theme.textColor }}>{order.paymentMethod}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span style={getSecondaryTextStyle()}>{t('common.subtotal')}</span>
                                      <span style={{ color: theme.textColor }}>
                                        ${Number(order.subtotal || order.total || 0).toFixed(2)}
                                      </span>
                                    </div>
                                    {Number(order.discount || 0) > 0 && (
                                      <div className="flex justify-between" style={{ color: '#22c55e' }}>
                                        <span>{t('common.discount')}</span>
                                        <span>-${Number(order.discount || 0).toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span style={getSecondaryTextStyle()}>{t('common.shipping')}</span>
                                      <span style={{ color: theme.textColor }}>
                                        {Number(order.shipping ?? 0) === 0 ? t('common.free') : `$${Number(order.shipping ?? 0).toFixed(2)}`}
                                      </span>
                                    </div>
                                    {Number(order.tax || 0) > 0 && (
                                      <div className="flex justify-between">
                                        <span style={getSecondaryTextStyle()}>{t('common.tax')}</span>
                                        <span style={{ color: theme.textColor }}>${Number(order.tax || 0).toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div
                                      className="flex justify-between pt-2 border-t font-bold"
                                      style={{ borderColor: `${theme.textColor}15` }}
                                    >
                                      <span style={{ color: theme.textColor }}>{t('common.total')}</span>
                                      <span style={{ color: theme.primaryColor }}>${Number(order.total).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className={`mt-8 p-4 flex items-center justify-between border ${getBorderRadius('medium')}`}
                style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
              >
                <p className="text-sm" style={getSecondaryTextStyle()}>
                  Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 border ${getBorderRadius('small')} transition-opacity disabled:opacity-30`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span style={getSecondaryTextStyle()}>...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[36px] py-1 ${getBorderRadius('small')} transition-all`}
                          style={{
                            backgroundColor: currentPage === page ? theme.primaryColor : 'transparent',
                            color: currentPage === page ? '#fff' : theme.textColor,
                          }}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 border ${getBorderRadius('small')} transition-opacity disabled:opacity-30`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancel Order Modal */}
        <AnimatePresence>
          {cancelModalOpen && orderToCancel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onClick={closeCancelModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`w-full max-w-md p-6 ${getBorderRadius('large')} shadow-2xl`}
                style={{ backgroundColor: theme.backgroundColor }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    </div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: theme.textColor, fontFamily: theme.headingFont }}
                    >
                      {t('orders.cancelOrder')}
                    </h3>
                  </div>
                  <button
                    onClick={closeCancelModal}
                    className="p-2 rounded-full hover:opacity-70 transition-opacity"
                    style={{ color: theme.textColor }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Info */}
                <div
                  className={`p-4 mb-4 ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: `${theme.textColor}05`, border: `1px solid ${theme.textColor}15` }}
                >
                  <p className="text-sm" style={getSecondaryTextStyle()}>
                    {t('orders.orderNumber')}
                  </p>
                  <p className="font-semibold" style={{ color: theme.textColor }}>
                    #{orderToCancel.orderNumber}
                  </p>
                </div>

                {/* Warning Message */}
                <div
                  className={`p-4 mb-4 ${getBorderRadius('medium')}`}
                  style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                    <p className="text-sm" style={{ color: '#92400e' }}>
                      {t('orders.cancelWarning') || 'This action cannot be undone. The order will be cancelled and you will receive a refund if applicable.'}
                    </p>
                  </div>
                </div>

                {/* Reason Input */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textColor }}
                  >
                    {t('orders.cancelReason') || 'Reason for cancellation'} ({t('common.optional') || 'Optional'})
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={t('orders.cancelReasonPlaceholder') || 'Please tell us why you want to cancel this order...'}
                    rows={3}
                    className={`w-full px-4 py-3 border ${getBorderRadius('medium')} focus:outline-none focus:ring-2 resize-none`}
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: `${theme.textColor}20`,
                      color: theme.textColor,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={closeCancelModal}
                    disabled={cancelling}
                    className={`flex-1 px-4 py-3 text-sm font-medium border ${getBorderRadius('medium')} transition-opacity hover:opacity-80 disabled:opacity-50`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                  >
                    {t('common.cancel') || 'Keep Order'}
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('common.cancelling') || 'Cancelling...'}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        {t('orders.confirmCancel') || 'Yes, Cancel Order'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StorefrontOrdersPage;

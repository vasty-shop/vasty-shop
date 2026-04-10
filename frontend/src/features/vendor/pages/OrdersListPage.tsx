import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  AlertCircle,
  Calendar,
  ChevronRight,
  RefreshCw,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  DollarSign,
  X,
  FileText
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { LoadingState, OrderCardSkeleton } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import { useActiveShop } from '../../../hooks/useActiveShop';

interface Order {
  id: string;          // Actual UUID for API calls
  orderNumber: string; // Display number like FLX-2025-63462
  customer: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
  shippingAddress: string;
}

export const OrdersListPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Get active shop from unified hook (works with both vendor and customer auth)
  const { shop, shopId, isLoading: shopsLoading, hasShops } = useActiveShop();

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  const fetchOrders = async () => {
    if (!shop?.id) {
      setError('Shop context not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ensure shop ID is set before making the request
      if (shopId) {
        api.setShopId(shopId);
      }

      // shopId will be automatically added via x-shop-id header in api-client.ts
      const response = await api.getVendorOrders({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        limit: 100
      });

      // Transform API response to match component interface
      const transformedOrders: Order[] = (response.data || []).map((order: any) => {
        // Get customer name from various sources
        const customerName = order.customer?.name ||
          `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() ||
          order.shippingAddress?.fullName ||
          order.shippingAddress?.name ||
          'Unknown Customer';

        // Get customer email from various sources
        const customerEmail = order.customer?.email ||
          order.shippingAddress?.email ||
          order.email ||
          'N/A';

        // Get customer phone
        const customerPhone = order.customer?.phone ||
          order.shippingAddress?.phone ||
          '';

        // Build full address string
        const addressParts = [
          order.shippingAddress?.addressLine1 || order.shippingAddress?.street || order.shippingAddress?.address,
          order.shippingAddress?.addressLine2,
          order.shippingAddress?.city,
          order.shippingAddress?.state,
          order.shippingAddress?.postalCode || order.shippingAddress?.zipCode,
          order.shippingAddress?.country
        ].filter(Boolean);

        const fullAddress = order.shippingAddress?.fullAddress ||
          addressParts.join(', ') ||
          'N/A';

        return {
          id: order.id, // Actual UUID for API calls
          orderNumber: order.orderNumber || order.id, // Display number
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            avatar: order.customer?.avatar
          },
          products: (order.items || []).map((item: any) => ({
            name: item.productName || item.product?.name || item.name || 'Unknown Product',
            quantity: item.quantity || 0,
            price: item.price || 0
          })),
          total: order.total || order.totalAmount || 0,
          status: order.status || 'pending',
          date: order.createdAt || new Date().toISOString(),
          paymentMethod: order.paymentMethod || 'N/A',
          shippingAddress: fullAddress
        };
      });

      setOrders(transformedOrders);

      // Calculate statistics
      const stats = {
        total: transformedOrders.length,
        pending: transformedOrders.filter((o) => o.status === 'pending').length,
        processing: transformedOrders.filter((o) => o.status === 'processing').length,
        shipped: transformedOrders.filter((o) => o.status === 'shipped').length,
        delivered: transformedOrders.filter((o) => o.status === 'delivered').length
      };
      setStatistics(stats);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load orders';
      setError(errorMessage);
      toast.error('Error Loading Orders', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Date range filter
    let matchesDate = true;
    if (dateRange !== 'all') {
      const orderDate = new Date(order.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'last7':
          matchesDate = daysDiff <= 7;
          break;
        case 'last30':
          matchesDate = daysDiff <= 30;
          break;
        case 'last90':
          matchesDate = daysDiff <= 90;
          break;
      }
    }

    // Payment method filter
    const matchesPayment = paymentMethod === 'all' ||
      order.paymentMethod.toLowerCase().includes(paymentMethod.toLowerCase());

    return matchesSearch && matchesDate && matchesPayment;
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      pending: {
        color: 'text-yellow-600 bg-yellow-100',
        icon: Clock,
        label: t('vendor.orders.statuses.pending', { defaultValue: 'Pending' })
      },
      processing: {
        color: 'text-blue-600 bg-blue-100',
        icon: Package,
        label: t('vendor.orders.statuses.processing', { defaultValue: 'Processing' })
      },
      shipped: {
        color: 'text-purple-600 bg-purple-100',
        icon: Truck,
        label: t('vendor.orders.statuses.shipped', { defaultValue: 'Shipped' })
      },
      delivered: {
        color: 'text-green-600 bg-green-100',
        icon: CheckCircle,
        label: t('vendor.orders.statuses.delivered', { defaultValue: 'Delivered' })
      },
      cancelled: {
        color: 'text-red-600 bg-red-100',
        icon: XCircle,
        label: t('vendor.orders.statuses.cancelled', { defaultValue: 'Cancelled' })
      }
    };
    return configs[status] || configs.pending;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setDateRange('all');
    setPaymentMethod('all');
    toast.success(t('vendor.orders.filtersCleared', { defaultValue: 'Filters cleared' }));
  };

  const handleAcceptOrder = async (order: Order) => {
    try {
      setActionLoading(true);
      // Ensure shop ID is set before making the request
      if (shopId) {
        api.setShopId(shopId);
      }
      await api.acceptOrder(order.id);
      toast.success('Order Accepted', {
        description: `Order ${order.orderNumber} has been accepted and is now processing`
      });
      await fetchOrders();
    } catch (err: any) {
      console.error('Failed to accept order:', err);
      toast.error('Failed to accept order', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setActionLoading(true);
      // Ensure shop ID is set before making the request
      if (shopId) {
        api.setShopId(shopId);
      }
      await api.cancelOrderByVendor(orderToCancel.id, cancelReason);
      toast.success('Order Cancelled', {
        description: `Order ${orderToCancel.orderNumber} has been cancelled`
      });
      setShowCancelDialog(false);
      setOrderToCancel(null);
      setCancelReason('');
      await fetchOrders();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.error('Failed to cancel order', {
        description: err?.response?.data?.message || 'An error occurred'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Loading State (including shops loading)
  if (loading || shopsLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <GlassCard key={i} hover={false}>
              <div className="space-y-3">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Filters Skeleton */}
        <GlassCard hover={false}>
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        </GlassCard>

        {/* Orders List Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error && !error.includes('Shop context not found')) {
    return (
      <ErrorState
        title={t('vendor.orders.failedToLoad', { defaultValue: 'Failed to Load Orders' })}
        message={error}
        onRetry={fetchOrders}
        type="error"
        showDetails={false}
      />
    );
  }

  // No Shop Context
  if (!shop?.id) {
    return (
      <ErrorState
        title={t('vendor.orders.shopNotFound', { defaultValue: 'Shop Not Found' })}
        message={hasShops
          ? t('vendor.orders.shopNoAccess', { defaultValue: "This shop doesn't exist or you don't have access to it. Please select one of your shops." })
          : t('vendor.orders.createShopPrompt', { defaultValue: "Please create a shop or ensure you are logged in with a valid shop account." })
        }
        onRetry={() => (window.location.href = hasShops ? '/vendor/shops' : '/vendor/create-shop')}
        retryLabel={hasShops ? t('vendor.orders.selectShop', { defaultValue: 'Select Shop' }) : t('vendor.orders.createShop', { defaultValue: 'Create Shop' })}
        type="forbidden"
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('vendor.orders.title', { defaultValue: 'Orders' })}
          </h1>
          <p className="text-gray-500 mt-1">{t('vendor.orders.subtitle', { defaultValue: 'Manage and track your orders' })} ({statistics.total} {t('vendor.orders.total', { defaultValue: 'total' })})</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('vendor.common.refresh', { defaultValue: 'Refresh' })}</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>{t('vendor.common.export', { defaultValue: 'Export' })}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: t('vendor.orders.totalOrders', { defaultValue: 'Total Orders' }), value: statistics.total, color: 'text-gray-900' },
          { label: t('vendor.orders.pending', { defaultValue: 'Pending' }), value: statistics.pending, color: 'text-yellow-600' },
          { label: t('vendor.orders.processing', { defaultValue: 'Processing' }), value: statistics.processing, color: 'text-blue-600' },
          { label: t('vendor.orders.shipped', { defaultValue: 'Shipped' }), value: statistics.shipped, color: 'text-purple-600' },
          { label: t('vendor.orders.delivered', { defaultValue: 'Delivered' }), value: statistics.delivered, color: 'text-green-600' }
        ].map((stat) => (
          <GlassCard key={stat.label} hover={false}>
            <div className="text-center space-y-2">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Search & Filters */}
      <GlassCard hover={false}>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('vendor.orders.searchOrders', { defaultValue: 'Search by order ID or customer name...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl transition-all flex items-center space-x-2 ${
                showFilters ? 'bg-primary-lime/10 border border-primary-lime/30 text-gray-900' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>{t('vendor.common.filter', { defaultValue: 'Filters' })}</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.common.status', { defaultValue: 'Status' })}</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.orders.dateRange', { defaultValue: 'Date Range' })}</label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="all">{t('vendor.analytics.allTime', { defaultValue: 'All Time' })}</option>
                        <option value="today">{t('vendor.analytics.today', { defaultValue: 'Today' })}</option>
                        <option value="last7">{t('vendor.analytics.last7Days', { defaultValue: 'Last 7 Days' })}</option>
                        <option value="last30">{t('vendor.analytics.last30Days', { defaultValue: 'Last 30 Days' })}</option>
                        <option value="last90">{t('vendor.analytics.last90Days', { defaultValue: 'Last 90 Days' })}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 mb-2 block">{t('vendor.orders.paymentMethod', { defaultValue: 'Payment Method' })}</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      >
                        <option value="all">{t('vendor.orders.allMethods', { defaultValue: 'All Methods' })}</option>
                        <option value="credit">{t('vendor.orders.creditCard', { defaultValue: 'Credit Card' })}</option>
                        <option value="paypal">{t('vendor.orders.paypal', { defaultValue: 'PayPal' })}</option>
                        <option value="bank">{t('vendor.orders.bankTransfer', { defaultValue: 'Bank Transfer' })}</option>
                      </select>
                    </div>
                  </div>
                  {(searchQuery || selectedStatus !== 'all' || dateRange !== 'all' || paymentMethod !== 'all') && (
                    <div className="flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>{t('vendor.orders.clearFilters', { defaultValue: 'Clear Filters' })}</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          type="orders"
          title={
            searchQuery
              ? t('vendor.orders.noOrdersFound', { defaultValue: 'No Orders Found' })
              : selectedStatus !== 'all'
              ? t('vendor.orders.noStatusOrders', { status: selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1), defaultValue: `No ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders` })
              : t('vendor.orders.noOrdersYet', { defaultValue: 'No Orders Yet' })
          }
          message={
            searchQuery
              ? t('vendor.orders.noOrdersSearchMessage', { defaultValue: 'No orders match your search criteria. Try adjusting your search or filters.' })
              : selectedStatus !== 'all'
              ? t('vendor.orders.noStatusOrdersMessage', { status: selectedStatus, defaultValue: `No ${selectedStatus} orders found. Try selecting a different status.` })
              : t('vendor.orders.noOrdersMessage', { defaultValue: 'Orders will appear here once customers start purchasing from your shop.' })
          }
          onAction={searchQuery || selectedStatus !== 'all' ? clearFilters : undefined}
          actionLabel={searchQuery || selectedStatus !== 'all' ? t('vendor.orders.clearFilters', { defaultValue: 'Clear Filters' }) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard hover={true}>
                  <div className="space-y-4">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-lime flex items-center justify-center font-bold text-white">
                          {order.orderNumber.split('-')[2] || order.orderNumber.substring(0, 4)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                            <span className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{statusConfig.label}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(order.date).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${(Number(order.total) || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all group"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Products */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="text-xs text-gray-500 font-medium mb-3">{t('vendor.orders.customer', { defaultValue: 'CUSTOMER' })}</h4>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-lime flex items-center justify-center">
                            <span className="text-white font-semibold">{order.customer.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs text-gray-500 font-medium mb-3">{t('vendor.orders.products', { defaultValue: 'PRODUCTS' })} ({order.products.length})</h4>
                        <div className="space-y-2">
                          {order.products.slice(0, 3).map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {product.quantity}x {product.name}
                              </span>
                              <span className="text-gray-900 font-medium">${(Number(product.quantity || 0) * Number(product.price || 0)).toFixed(2)}</span>
                            </div>
                          ))}
                          {order.products.length > 3 && (
                            <p className="text-xs text-gray-400">+{order.products.length - 3} more items</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center justify-center space-x-2 group"
                      >
                        <Eye className="w-4 h-4 group-hover:text-primary-lime transition-colors" />
                        <span>{t('vendor.orders.viewOrder', { defaultValue: 'View Details' })}</span>
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order)}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{actionLoading ? t('vendor.orders.processing', { defaultValue: 'Processing...' }) : t('vendor.orders.acceptOrder', { defaultValue: 'Accept Order' })}</span>
                          </button>
                          <button
                            onClick={() => {
                              setOrderToCancel(order);
                              setShowCancelDialog(true);
                            }}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-gray-100 hover:bg-red-50 border border-red-200 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500">{t('vendor.common.cancel', { defaultValue: 'Cancel' })}</span>
                          </button>
                        </>
                      )}
                      {/* Processing orders - waiting for delivery assignment */}
                      {order.status === 'processing' && (
                        <span className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-center text-sm">
                          {t('vendor.orders.awaitingDelivery', { defaultValue: 'Awaiting delivery assignment' })}
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('vendor.orders.orderDetails', { defaultValue: 'Order Details' })}</h2>
                      <p className="text-gray-500 text-sm">Order #{selectedOrder.orderNumber}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Status & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs mb-2">{t('vendor.orders.orderStatus', { defaultValue: 'ORDER STATUS' })}</p>
                      <div className={`flex items-center space-x-2 ${getStatusConfig(selectedOrder.status).color} px-3 py-2 rounded-lg w-fit`}>
                        {React.createElement(getStatusConfig(selectedOrder.status).icon, { className: 'w-4 h-4' })}
                        <span className="font-medium">{getStatusConfig(selectedOrder.status).label}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs mb-2">{t('vendor.orders.orderDate', { defaultValue: 'ORDER DATE' })}</p>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-primary-lime" />
                        <span className="font-medium">{new Date(selectedOrder.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.orders.customerInfo', { defaultValue: 'Customer Information' })}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-primary-lime flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-lg">{selectedOrder.customer.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{selectedOrder.customer.name}</p>
                          <div className="flex items-center space-x-2 text-gray-500 text-sm mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{selectedOrder.customer.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-primary-lime mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-500 text-xs mb-1">{t('vendor.orders.shippingAddress', { defaultValue: 'SHIPPING ADDRESS' })}</p>
                            <p className="text-gray-900 text-sm">{selectedOrder.shippingAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                      <Package className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.orders.orderItems', { defaultValue: 'Order Items' })} ({selectedOrder.products.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.products.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-primary-lime/10 flex items-center justify-center">
                              <Package className="w-6 h-6 text-primary-lime" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{product.name}</p>
                              <p className="text-gray-500 text-sm">{t('vendor.orders.quantity', { defaultValue: 'Quantity' })}: {product.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 font-medium">${(Number(product.quantity || 0) * Number(product.price || 0)).toFixed(2)}</p>
                            <p className="text-gray-500 text-sm">${(Number(product.price) || 0).toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Total */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-primary-lime" />
                      <span>{t('vendor.orders.paymentInfo', { defaultValue: 'Payment Information' })}</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-500">{t('vendor.orders.paymentMethod', { defaultValue: 'Payment Method' })}</span>
                        <span className="text-gray-900 font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-500">{t('vendor.orders.subtotal', { defaultValue: 'Subtotal' })}</span>
                        <span className="text-gray-900">${(Number(selectedOrder.total) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-gray-500">{t('vendor.orders.shipping', { defaultValue: 'Shipping' })}</span>
                        <span className="text-gray-900">$0.00</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-gray-900 font-semibold text-lg">{t('vendor.orders.total', { defaultValue: 'Total' })}</span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${(Number(selectedOrder.total) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleAcceptOrder(selectedOrder);
                            setSelectedOrder(null);
                          }}
                          disabled={actionLoading}
                          className="w-full sm:flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>{t('vendor.orders.acceptOrder', { defaultValue: 'Accept Order' })}</span>
                        </button>
                        <button
                          onClick={() => {
                            setOrderToCancel(selectedOrder);
                            setShowCancelDialog(true);
                            setSelectedOrder(null);
                          }}
                          disabled={actionLoading}
                          className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-red-50 border border-red-200 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-500">{t('vendor.orders.cancelOrder', { defaultValue: 'Cancel Order' })}</span>
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <div className="w-full sm:flex-1 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-center">
                        {t('vendor.orders.awaitingDelivery', { defaultValue: 'Awaiting delivery assignment' })}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                    >
                      {t('vendor.common.close', { defaultValue: 'Close' })}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Order Dialog */}
      <AnimatePresence>
        {showCancelDialog && orderToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !actionLoading && setShowCancelDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{t('vendor.orders.cancelOrder', { defaultValue: 'Cancel Order' })}</h3>
                      <p className="text-gray-500 text-sm">Order #{orderToCancel.orderNumber}</p>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    {t('vendor.orders.cancelConfirmMessage', { defaultValue: 'Are you sure you want to cancel this order? Please provide a reason for cancellation.' })}
                  </p>

                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.orders.cancellationReason', { defaultValue: 'Cancellation Reason' })}</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={t('vendor.orders.enterCancellationReason', { defaultValue: 'Enter reason for cancellation...' })}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={handleCancelOrder}
                      disabled={actionLoading || !cancelReason.trim()}
                      className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? t('vendor.orders.cancelling', { defaultValue: 'Cancelling...' }) : t('vendor.orders.confirmCancellation', { defaultValue: 'Confirm Cancellation' })}
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelDialog(false);
                        setOrderToCancel(null);
                        setCancelReason('');
                      }}
                      disabled={actionLoading}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {t('vendor.common.close', { defaultValue: 'Close' })}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

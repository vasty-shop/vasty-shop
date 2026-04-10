import React, { useState, useEffect, useCallback } from 'react';
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
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingCart,
  Store,
  User,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../vendor/components/GlassCard';
import { api } from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  shop: {
    id: string;
    name: string;
  };
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export const AdminOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch orders from API (admin endpoint - all orders)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getAdminOrders({ limit: 100 });
      const ordersData: any[] = Array.isArray(response) ? response : (response?.data || []);

      // Transform API response to match Order interface
      const transformedOrders: Order[] = ordersData.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || order.order_number || order.id?.slice(0, 8),
        customer: {
          name: order.customer?.name || order.shippingAddress?.name || order.shippingAddress?.fullName || 'Customer',
          email: order.customer?.email || order.shippingAddress?.email || ''
        },
        shop: {
          id: order.shopId || order.shop_id || order.shop?.id || '',
          name: order.shopName || order.shop_name || order.shop?.name || 'Shop'
        },
        amount: Number(order.total) || 0,
        status: order.status || 'pending',
        date: order.createdAt || order.created_at || new Date().toISOString()
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate statistics
  const statistics = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'delivered').length
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shop.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status configuration
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: typeof Clock; label: string }> = {
      pending: {
        color: 'text-yellow-600 bg-yellow-100',
        icon: Clock,
        label: t('admin.orders.pending')
      },
      processing: {
        color: 'text-blue-600 bg-blue-100',
        icon: Package,
        label: t('admin.orders.processing')
      },
      shipped: {
        color: 'text-purple-600 bg-purple-100',
        icon: Truck,
        label: t('admin.orders.shipped')
      },
      delivered: {
        color: 'text-green-600 bg-green-100',
        icon: CheckCircle,
        label: t('admin.orders.delivered')
      },
      cancelled: {
        color: 'text-red-600 bg-red-100',
        icon: XCircle,
        label: t('admin.orders.cancelled')
      }
    };
    return configs[status] || configs.pending;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Refresh handler
  const handleRefresh = () => {
    fetchOrders();
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
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.orders.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('admin.orders.subtitle')} ({filteredOrders.length} {t('admin.sidebar.orders').toLowerCase()})
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.common.refresh')}</span>
          </button>
          <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-all flex items-center space-x-2 border border-gray-200 shadow-sm">
            <Download className="w-4 h-4" />
            <span>{t('admin.common.export')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t('admin.dashboard.totalOrders'),
            value: statistics.total,
            icon: ShoppingCart,
            color: 'from-indigo-500 to-indigo-600'
          },
          {
            label: t('admin.orders.pending'),
            value: statistics.pending,
            icon: Clock,
            color: 'from-yellow-500 to-yellow-600'
          },
          {
            label: t('admin.orders.processing'),
            value: statistics.processing,
            icon: Package,
            color: 'from-blue-500 to-blue-600'
          },
          {
            label: t('admin.orders.completed'),
            value: statistics.completed,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600'
          }
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

      {/* Search & Filters */}
      <GlassCard hover={false}>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.orders.searchOrders')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl transition-all flex items-center space-x-2 ${
                showFilters
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>{t('admin.common.filters')}</span>
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
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('admin.common.status')}</label>
                    <div className="flex flex-wrap gap-2">
                      {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as StatusFilter[]).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                              statusFilter === status
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  {(searchQuery || statusFilter !== 'all') && (
                    <div className="flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>{t('admin.common.clearFilters')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Orders Table */}
      {loading ? (
        <GlassCard hover={false}>
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">{t('admin.common.loading')}</p>
          </div>
        </GlassCard>
      ) : paginatedOrders.length === 0 ? (
        <GlassCard hover={false}>
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('admin.orders.noOrders')}
            </h3>
            <p className="text-gray-500">
              {t('admin.common.noData')}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md"
              >
                {t('admin.common.clearFilters')}
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <>
          <GlassCard hover={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.orders.orderId')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.orders.customer')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.orders.shop')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.orders.amount')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.common.status')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.common.date')}</th>
                    <th className="text-left p-4 text-sm text-gray-600 font-medium">{t('admin.common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, index) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                      >
                        {/* Order ID */}
                        <td className="p-4">
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">#{order.id.substring(0, 8)}</p>
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{order.customer.name}</p>
                              <p className="text-xs text-gray-500">{order.customer.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Shop */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Store className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{order.shop.name}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">${order.amount.toFixed(2)}</p>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium w-fit ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(order.date)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                {t('admin.common.page')} {currentPage} {t('admin.common.of')} {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white hover:bg-gray-50 rounded-lg transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
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
              className="relative w-full max-w-2xl"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('admin.orders.orderDetails')}</h2>
                    <p className="text-gray-500 text-sm">{selectedOrder.orderNumber}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-all border border-gray-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        getStatusConfig(selectedOrder.status).color
                      }`}
                    >
                      {React.createElement(getStatusConfig(selectedOrder.status).icon, {
                        className: 'w-4 h-4'
                      })}
                      <span>{getStatusConfig(selectedOrder.status).label}</span>
                    </span>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedOrder.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>{t('admin.orders.customerInfo')}</span>
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-900 font-medium">{selectedOrder.customer.name}</p>
                      <p className="text-gray-500 text-sm">{selectedOrder.customer.email}</p>
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <span>{t('admin.orders.shopInfo')}</span>
                    </h3>
                    <p className="text-gray-900 font-medium">{selectedOrder.shop.name}</p>
                  </div>

                  {/* Order Amount */}
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">{t('admin.orders.totalAmount')}</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ${selectedOrder.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                  >
                    {t('admin.common.close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

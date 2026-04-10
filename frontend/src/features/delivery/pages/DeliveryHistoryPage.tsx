import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import type { DeliveryOrder } from '../types/delivery.types';
import { toast } from 'sonner';

export const DeliveryHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan } = useDeliveryAuthStore();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    loadHistory();
  }, [deliveryMan, page, dateFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await deliveryApi.syncEarnings(deliveryMan!.id);
      await loadHistory();
      toast.success(t('delivery.history.refreshed'));
    } catch (error) {
      toast.error(t('delivery.history.refreshFailed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadHistory = async () => {
    if (!deliveryMan?.id) return;

    if (!isRefreshing) {
      setIsLoading(true);
    }
    try {
      const response = await deliveryApi.getDeliveryHistory(deliveryMan.id, { page, limit });
      const historyData = response.data?.data || response.data || [];

      const transformedOrders: DeliveryOrder[] = (Array.isArray(historyData) ? historyData : []).map((item: any) => {
        const pickupAddr = item.pickupAddress || item.pickup_address || {};
        const deliveryAddr = item.deliveryAddress || item.delivery_address || {};

        return {
          id: item.id,
          orderId: item.orderId || item.order_id || item.id,
          orderNumber: item.orderNumber || item.order_number || 'N/A',
          deliveryManId: item.deliveryManId || deliveryMan.id,
          status: (item.status || 'delivered').toUpperCase() as any,
          pickupAddress: {
            address: pickupAddr?.address || 'Pickup Location',
            lat: pickupAddr?.lat || 0,
            lng: pickupAddr?.lng || 0,
            shopName: pickupAddr?.shopName || pickupAddr?.shop_name || 'Shop',
            contactPhone: pickupAddr?.contactPhone || '',
          },
          deliveryAddress: {
            address: deliveryAddr?.address || 'Delivery Location',
            lat: deliveryAddr?.lat || 0,
            lng: deliveryAddr?.lng || 0,
            customerName: deliveryAddr?.customerName || deliveryAddr?.customer_name || 'Customer',
            customerPhone: deliveryAddr?.customerPhone || '',
          },
          distance: item.distance || 0,
          estimatedTime: item.duration || 0,
          deliveryFee: Number(item.deliveryFee) || 0,
          tip: Number(item.tip) || 0,
          assignedAt: item.assignedAt,
          acceptedAt: item.acceptedAt,
          pickedUpAt: item.pickedUpAt,
          deliveredAt: item.deliveredAt,
          cancelledAt: item.cancelledAt,
          cancellationReason: item.cancellationReason,
        };
      });

      setOrders(transformedOrders);
      setTotal(response.data?.total || transformedOrders.length);

      const earned = transformedOrders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (Number(o.deliveryFee) || 0) + (Number(o.tip) || 0), 0);
      setTotalEarnings(earned);
    } catch (error) {
      console.error('Failed to load history:', error);
      setOrders([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.deliveryAddress?.customerName?.toLowerCase().includes(query) ||
      order.deliveryAddress?.customerPhone?.includes(query) ||
      order.deliveryAddress?.address?.toLowerCase().includes(query) ||
      order.pickupAddress?.shopName?.toLowerCase().includes(query) ||
      order.pickupAddress?.address?.toLowerCase().includes(query)
    );
  });

  // Apply date filter
  const getFilteredByDate = () => {
    if (dateFilter === 'all') return filteredOrders;

    const now = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return filteredOrders;
    }

    return filteredOrders.filter((order) => {
      const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
      return deliveredAt && deliveredAt >= startDate;
    });
  };

  const displayOrders = getFilteredByDate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">{t('delivery.history.delivered')}</span>;
      case 'CANCELLED':
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">{t('delivery.history.cancelled')}</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('delivery.history.title')}</h1>
          <p className="text-gray-500 mt-1">{t('delivery.history.subtitle')}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="mt-4 md:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('delivery.history.refresh')}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('delivery.history.totalDeliveries')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total || displayOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('delivery.history.completed')}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {displayOrders.filter((o) => o.status === 'DELIVERED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('delivery.history.cancelled')}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {displayOrders.filter((o) => o.status === 'CANCELLED' || (o.status as string) === 'REJECTED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">{t('delivery.history.totalEarned')}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${totalEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('delivery.history.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all', 'today', 'week', 'month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  dateFilter === filter
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t(`delivery.history.${filter}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-48 flex-1" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : displayOrders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('delivery.orders.order')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('delivery.orders.customer')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    {t('delivery.history.deliveryAddress')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('delivery.history.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('delivery.orders.status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('delivery.history.earned')}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('delivery.history.details')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            order.status === 'DELIVERED' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {order.status === 'DELIVERED' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.deliveryAddress?.customerName || 'Customer'}</p>
                          <p className="text-sm text-gray-500">{order.deliveryAddress?.customerPhone || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {order.deliveryAddress?.address || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{formatDate(order.deliveredAt || order.assignedAt)}</p>
                          <p className="text-xs text-gray-500">{formatTime(order.deliveredAt || order.assignedAt)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-bold text-green-600">
                          ${((Number(order.deliveryFee) || 0) + (Number(order.tip) || 0)).toFixed(2)}
                        </p>
                        {order.tip && Number(order.tip) > 0 && (
                          <p className="text-xs text-gray-500">+${Number(order.tip).toFixed(2)} {t('delivery.history.tipAmount')}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Pickup Info */}
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('delivery.orders.pickup')}</span>
                              </div>
                              <p className="font-medium text-gray-900">{order.pickupAddress?.shopName || 'Shop'}</p>
                              <p className="text-sm text-gray-600">{order.pickupAddress?.address || '-'}</p>
                              {order.pickupAddress?.contactPhone && (
                                <p className="text-sm text-gray-500 mt-1">{order.pickupAddress.contactPhone}</p>
                              )}
                            </div>
                            {/* Delivery Info */}
                            <div className="bg-white rounded-lg p-4 border border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('delivery.history.delivery')}</span>
                              </div>
                              <p className="font-medium text-gray-900">{order.deliveryAddress?.customerName || 'Customer'}</p>
                              <p className="text-sm text-gray-600">{order.deliveryAddress?.address || '-'}</p>
                              {order.deliveryAddress?.customerPhone && (
                                <p className="text-sm text-gray-500 mt-1">{order.deliveryAddress.customerPhone}</p>
                              )}
                            </div>
                          </div>
                          {/* Earnings Breakdown */}
                          <div className="mt-4 flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-gray-500">{t('delivery.history.deliveryFee')}:</span>
                              <span className="ml-2 font-medium text-gray-900">${(Number(order.deliveryFee) || 0).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('delivery.history.tip')}:</span>
                              <span className="ml-2 font-medium text-gray-900">${(Number(order.tip) || 0).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">{t('delivery.earnings.total')}:</span>
                              <span className="ml-2 font-bold text-green-600">
                                ${((Number(order.deliveryFee) || 0) + (Number(order.tip) || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('delivery.history.noHistory')}</h3>
          <p className="text-gray-500">
            {searchQuery ? t('delivery.history.noDeliveriesMatch') : t('delivery.history.completedAppearHere')}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-600">
            {t('delivery.history.page')} {page} {t('delivery.history.of')} {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

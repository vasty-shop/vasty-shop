import React, { useState, useEffect } from 'react';
import {
  Package,
  Phone,
  CheckCircle,
  XCircle,
  Navigation,
  Camera,
  Loader2,
  Search,
  Eye,
  MapPin,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import type { DeliveryOrder, DeliveryOrderStatus } from '../types/delivery.types';
import { toast } from 'sonner';

const statusColors: Record<DeliveryOrderStatus, string> = {
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-purple-100 text-purple-700',
  ON_THE_WAY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const getStatusLabel = (status: DeliveryOrderStatus, t: (key: string) => string): string => {
  const labels: Record<DeliveryOrderStatus, string> = {
    ASSIGNED: t('delivery.orders.assigned'),
    ACCEPTED: t('delivery.orders.accepted'),
    PICKED_UP: t('delivery.orders.pickedUp'),
    ON_THE_WAY: t('delivery.orders.onTheWay'),
    DELIVERED: t('delivery.orders.delivered'),
    CANCELLED: t('delivery.orders.cancelled'),
  };
  return labels[status] || status;
};

type FilterStatus = 'all' | 'active' | 'completed';

export const DeliveryOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { deliveryMan } = useDeliveryAuthStore();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [deliveryMan, filterStatus]);

  const loadOrders = async () => {
    if (!deliveryMan?.id) {
      return;
    }

    setIsLoading(true);
    try {
      let status: string | undefined;
      if (filterStatus === 'active') {
        status = 'assigned,accepted,picked_up,on_the_way';
      } else if (filterStatus === 'completed') {
        status = 'delivered,cancelled';
      }
      // 'all' means no status filter

      const response = await deliveryApi.getOrders(deliveryMan.id, status);

      const ordersData = response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error(t('delivery.orders.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (order: DeliveryOrder) => {
    if (!deliveryMan?.id) return;

    setProcessingOrderId(order.id);
    try {
      await deliveryApi.acceptOrder(deliveryMan.id, order.orderId);
      toast.success(t('delivery.orders.orderAccepted'));
      loadOrders();
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
      loadOrders();
    } catch (error) {
      toast.error(t('delivery.orders.declineFailed'));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handlePickedUp = async (order: DeliveryOrder) => {
    if (!deliveryMan?.id) return;

    setProcessingOrderId(order.id);
    try {
      await deliveryApi.markPickedUp(deliveryMan.id, order.orderId);
      toast.success(t('delivery.orders.markedPickedUp'));
      loadOrders();
    } catch (error) {
      toast.error(t('delivery.orders.updateFailed'));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleOnTheWay = async (order: DeliveryOrder) => {
    if (!deliveryMan?.id) return;

    setProcessingOrderId(order.id);
    try {
      await deliveryApi.markOnTheWay(deliveryMan.id, order.orderId);
      toast.success(t('delivery.orders.markedOnTheWay'));
      loadOrders();
    } catch (error) {
      toast.error(t('delivery.orders.updateFailed'));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCompleteDelivery = async (order: DeliveryOrder) => {
    if (!deliveryMan?.id) return;

    setProcessingOrderId(order.id);
    try {
      await deliveryApi.completeDelivery(deliveryMan.id, order.orderId, {});
      toast.success(t('delivery.orders.deliveryCompleted'));
      loadOrders();
    } catch (error) {
      toast.error(t('delivery.orders.completeFailed'));
    } finally {
      setProcessingOrderId(null);
    }
  };

  const renderOrderActions = (order: DeliveryOrder) => {
    const isProcessing = processingOrderId === order.id;

    switch (order.status) {
      case 'ASSIGNED':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAcceptOrder(order)}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
              {t('delivery.common.accept')}
            </button>
            <button
              onClick={() => handleRejectOrder(order)}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
            >
              <XCircle className="w-3 h-3 mr-1" />
              {t('delivery.orders.decline')}
            </button>
          </div>
        );

      case 'ACCEPTED':
        return (
          <button
            onClick={() => handlePickedUp(order)}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors flex items-center disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3 mr-1" />}
            {t('delivery.orders.pickedUp')}
          </button>
        );

      case 'PICKED_UP':
        return (
          <button
            onClick={() => handleOnTheWay(order)}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors flex items-center disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 mr-1" />}
            {t('delivery.orders.onTheWay')}
          </button>
        );

      case 'ON_THE_WAY':
        return (
          <button
            onClick={() => handleCompleteDelivery(order)}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3 mr-1" />}
            {t('delivery.orders.complete')}
          </button>
        );

      default:
        return <span className="text-xs text-gray-400">-</span>;
    }
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
      order.pickupAddress?.shopName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('delivery.orders.title')}</h1>
          <p className="text-gray-500 mt-1">{t('delivery.orders.subtitle')}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('delivery.orders.searchOrders')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(['all', 'active', 'completed'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterStatus === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'all' ? t('delivery.orders.all') : status === 'active' ? t('delivery.orders.activeFilter') : t('delivery.orders.completedFilter')}
            {status === 'all' && ` (${orders.length})`}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-gray-500 mt-2">{t('delivery.orders.loadingOrders')}</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('delivery.orders.order')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('delivery.orders.customer')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('delivery.orders.pickup')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('delivery.orders.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('delivery.orders.fee')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('delivery.orders.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {order.deliveryAddress?.customerName || '-'}
                          </p>
                          {order.deliveryAddress?.customerPhone && (
                            <a
                              href={`tel:${order.deliveryAddress.customerPhone}`}
                              className="text-xs text-orange-600 flex items-center mt-0.5"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              {order.deliveryAddress.customerPhone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {order.pickupAddress?.shopName || '-'}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {order.pickupAddress?.address || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                          {getStatusLabel(order.status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${(parseFloat(String(order.deliveryFee)) || 0).toFixed(2)}
                          </p>
                          {order.tip && Number(order.tip) > 0 && (
                            <p className="text-xs text-green-600">+${(parseFloat(String(order.tip)) || 0).toFixed(2)} {t('delivery.orders.tipAmount')}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {renderOrderActions(order)}
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedOrderId === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Pickup Address */}
                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-green-600" />
                                </div>
                                <h4 className="font-medium text-gray-900 text-sm">{t('delivery.orders.pickupLocation')}</h4>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.pickupAddress?.shopName || t('delivery.orders.store')}
                              </p>
                              <p className="text-sm text-gray-500">{order.pickupAddress?.address || '-'}</p>
                              {order.pickupAddress?.contactPhone && (
                                <a
                                  href={`tel:${order.pickupAddress.contactPhone}`}
                                  className="text-sm text-orange-600 flex items-center mt-1"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  {order.pickupAddress.contactPhone}
                                </a>
                              )}
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                  <MapPin className="w-3 h-3 text-red-600" />
                                </div>
                                <h4 className="font-medium text-gray-900 text-sm">{t('delivery.orders.deliveryLocation')}</h4>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.deliveryAddress?.customerName || 'Customer'}
                              </p>
                              <p className="text-sm text-gray-500">{order.deliveryAddress?.address || '-'}</p>
                              {order.deliveryAddress?.customerPhone && (
                                <a
                                  href={`tel:${order.deliveryAddress.customerPhone}`}
                                  className="text-sm text-orange-600 flex items-center mt-1"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  {order.deliveryAddress.customerPhone}
                                </a>
                              )}
                            </div>

                            {/* Notes */}
                            {order.notes && (
                              <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-100">
                                <h4 className="font-medium text-gray-900 text-sm mb-1">{t('delivery.orders.notes')}</h4>
                                <p className="text-sm text-gray-600">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('delivery.orders.noOrdersFound')}</h3>
            <p className="text-gray-500">
              {searchQuery
                ? t('delivery.orders.noOrdersMatch')
                : filterStatus === 'active'
                ? t('delivery.orders.noActiveOrders')
                : filterStatus === 'completed'
                ? t('delivery.orders.noCompletedOrders')
                : t('delivery.orders.noOrdersToDisplay')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

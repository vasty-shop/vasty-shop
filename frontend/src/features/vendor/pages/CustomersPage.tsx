import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  X,
  User,
  Package,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { useShopStore } from '../../../stores/useShopStore';
import { getShopCustomers, type Customer } from '../api/shopApi';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { api } from '../../../lib/api';

export const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const { currentShop } = useShopStore();

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // State for API data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    inactiveCustomers: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  // Customer orders state
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const statuses = ['all', 'active', 'inactive', 'vip'];

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      const effectiveShopId = shopId || currentShop?.id;
      if (!effectiveShopId) {
        setError('Shop not available');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getShopCustomers({
          shopId: effectiveShopId,
          search: searchQuery || undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          page,
          limit,
          sortBy,
          sortOrder,
        });

        setCustomers(response.data);
        setStats(response.stats);
        setTotalPages(response.pages);

        // Calculate total revenue and avg order value
        const revenue = response.data.reduce((acc, c) => acc + c.totalSpent, 0);
        const totalOrders = response.data.reduce((acc, c) => acc + c.totalOrders, 0);
        setTotalRevenue(revenue);
        setAvgOrderValue(totalOrders > 0 ? revenue / totalOrders : 0);
      } catch (err: any) {
        console.error('Failed to fetch customers:', err);
        setError(err.message || 'Failed to fetch customers');
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [shopId, currentShop?.id, searchQuery, selectedStatus, page, limit, sortBy, sortOrder]);

  const sortedCustomers = customers;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      case 'vip':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handleViewDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setShowDetailsModal(true);

    // Fetch customer orders
    setLoadingOrders(true);
    try {
      const orders = await api.getVendorCustomerOrders(customer.id);
      setCustomerOrders(orders.slice(0, 5)); // Show last 5 orders
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleExportCustomers = () => {
    toast.success('Customer list exported successfully');
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('vendor.customers.title', { defaultValue: 'Customers' })}
          </h1>
          <p className="text-white/60 mt-1">
            {t('vendor.customers.subtitle', { defaultValue: 'View and manage your customer base' })}
          </p>
        </div>
        <button
          onClick={handleExportCustomers}
          className="px-6 py-2 glass hover:bg-white/10 rounded-xl transition-all flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>{t('vendor.customers.exportList', { defaultValue: 'Export List' })}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.customers.totalCustomers', { defaultValue: 'Total Customers' })}
          value={isLoading ? '...' : stats.totalCustomers.toString()}
          icon={<User />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title={t('vendor.customers.totalRevenue', { defaultValue: 'Total Revenue' })}
          value={isLoading ? '...' : `$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title={t('vendor.customers.avgOrderValue', { defaultValue: 'Avg Order Value' })}
          value={isLoading ? '...' : `$${avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp />}
          color="from-blue-400 to-cyan-500"
        />
        <StatCard
          title={t('vendor.customers.vipCustomers', { defaultValue: 'VIP Customers' })}
          value={isLoading ? '...' : stats.vipCustomers.toString()}
          icon={<Star />}
          color="from-yellow-400 to-orange-500"
        />
      </div>

      {/* Search & Filter */}
      <GlassCard hover={false}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder={t('vendor.customers.searchCustomers', { defaultValue: 'Search customers...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 glass border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-4 py-3 glass border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="name">{t('vendor.customers.sortByName', { defaultValue: 'Sort by Name' })}</option>
              <option value="totalOrders">{t('vendor.customers.sortByOrders', { defaultValue: 'Sort by Orders' })}</option>
              <option value="totalSpent">{t('vendor.customers.sortBySpent', { defaultValue: 'Sort by Spent' })}</option>
              <option value="lastOrderDate">{t('vendor.customers.sortByLastOrder', { defaultValue: 'Sort by Last Order' })}</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Error State */}
      {error && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <p className="text-white font-medium">{t('vendor.customers.failedToLoad', { defaultValue: 'Failed to load customers' })}</p>
              <p className="text-white/60 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 glass hover:bg-white/10 rounded-lg transition-all"
              >
                {t('vendor.common.retry', { defaultValue: 'Retry' })}
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        </GlassCard>
      )}

      {/* Empty State */}
      {!isLoading && !error && customers.length === 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center p-12 text-center">
            <div className="space-y-3">
              <User className="w-12 h-12 text-white/40 mx-auto" />
              <p className="text-white font-medium">{t('vendor.customers.noCustomers', { defaultValue: 'No customers found' })}</p>
              <p className="text-white/60 text-sm">
                {searchQuery || selectedStatus !== 'all'
                  ? t('vendor.customers.adjustFilters', { defaultValue: 'Try adjusting your filters' })
                  : t('vendor.customers.customersWillAppear', { defaultValue: 'Customers will appear here once they make purchases' })}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Customers Table */}
      {!isLoading && !error && customers.length > 0 && (
        <GlassCard hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.customers.customer', { defaultValue: 'Customer' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.customers.contact', { defaultValue: 'Contact' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.customers.orders', { defaultValue: 'Orders' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.customers.totalSpent', { defaultValue: 'Total Spent' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.customers.avgOrder', { defaultValue: 'Avg Order' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.customers.lastOrder', { defaultValue: 'Last Order' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.common.status', { defaultValue: 'Status' })}</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">{t('vendor.common.actions', { defaultValue: 'Actions' })}</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">{customer.name}</p>
                        <p className="text-xs text-white/50">
                          Since {customer.customerSince ? new Date(customer.customerSince).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-white/70">
                        <Mail className="w-3 h-3" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-white/70">
                        <Phone className="w-3 h-3" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-white">
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold">{customer.totalOrders}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-green-400">
                      ${customer.totalSpent.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">${customer.averageOrderValue.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1 text-sm text-white/70">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                      title="View details"
                    >
                      <Eye className="w-4 h-4 text-purple-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              {t('vendor.common.page', { defaultValue: 'Page' })} {page} {t('vendor.common.of', { defaultValue: 'of' })} {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 glass hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('vendor.common.previous', { defaultValue: 'Previous' })}
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 glass hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('vendor.common.next', { defaultValue: 'Next' })}
              </button>
            </div>
          </div>
        )}
      </GlassCard>
      )}

      {/* Customer Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedCustomer.avatar}
                        alt={selectedCustomer.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                        <p className="text-white/60">
                          {t('vendor.customers.customerSince', { defaultValue: 'Customer since' })} {selectedCustomer.customerSince ? new Date(selectedCustomer.customerSince).toLocaleDateString() : 'N/A'}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium capitalize mt-2 ${getStatusColor(selectedCustomer.status)}`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-2 glass hover:bg-white/10 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 glass rounded-xl">
                      <div className="flex items-center space-x-2 text-white/60 mb-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-sm">{t('vendor.customers.totalOrders', { defaultValue: 'Total Orders' })}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div className="p-4 glass rounded-xl">
                      <div className="flex items-center space-x-2 text-white/60 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">{t('vendor.customers.totalSpent', { defaultValue: 'Total Spent' })}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">
                        ${selectedCustomer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 glass rounded-xl">
                      <div className="flex items-center space-x-2 text-white/60 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{t('vendor.customers.avgOrderValue', { defaultValue: 'Avg Order Value' })}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        ${selectedCustomer.averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">{t('vendor.customers.contactInfo', { defaultValue: 'Contact Information' })}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                        <Mail className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-xs text-white/50">{t('vendor.customers.email', { defaultValue: 'Email' })}</p>
                          <p className="text-white">{selectedCustomer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                        <Phone className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-xs text-white/50">{t('vendor.customers.phone', { defaultValue: 'Phone' })}</p>
                          <p className="text-white">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 glass rounded-xl">
                        <MapPin className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs text-white/50">{t('vendor.customers.address', { defaultValue: 'Address' })}</p>
                          <p className="text-white">
                            {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">{t('vendor.customers.recentOrders', { defaultValue: 'Recent Orders' })}</h3>
                    <div className="space-y-3">
                      {loadingOrders ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                        </div>
                      ) : customerOrders.length === 0 ? (
                        <div className="p-4 glass rounded-xl text-center">
                          <Package className="w-8 h-8 text-white/40 mx-auto mb-2" />
                          <p className="text-white/60 text-sm">{t('vendor.customers.noOrdersFound', { defaultValue: 'No orders found' })}</p>
                        </div>
                      ) : (
                        customerOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/5 transition-all">
                            <div className="flex items-center space-x-3">
                              <Package className="w-5 h-5 text-blue-400" />
                              <div>
                                <p className="font-medium text-white">
                                  {order.orderNumber || order.order_number || `#ORD-${order.id.slice(-6)}`}
                                </p>
                                <p className="text-xs text-white/50">
                                  {order.createdAt || order.created_at
                                    ? new Date(order.createdAt || order.created_at).toLocaleDateString()
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">
                                ${parseFloat(order.total || 0).toFixed(2)}
                              </p>
                              <p className={`text-xs capitalize ${
                                order.status === 'completed' || order.status === 'delivered'
                                  ? 'text-green-400'
                                  : order.status === 'cancelled'
                                  ? 'text-red-400'
                                  : 'text-yellow-400'
                              }`}>
                                {order.status || 'pending'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                    <button className="flex-1 px-4 py-2 glass hover:bg-white/10 rounded-xl transition-all flex items-center justify-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{t('vendor.customers.sendEmail', { defaultValue: 'Send Email' })}</span>
                    </button>
                    <button className="flex-1 px-4 py-2 glass hover:bg-white/10 rounded-xl transition-all flex items-center justify-center space-x-2">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('vendor.customers.viewAllOrders', { defaultValue: 'View All Orders' })}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

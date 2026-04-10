import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Star,
  Eye,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { StatCard, ChartCard, GlassCard } from '../components/GlassCard';
import { api } from '../../../lib/api';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { toast } from 'sonner';

interface FullStatistics {
  // Basic stats
  shop_id: string;
  shop_name: string;
  total_products: number;
  total_orders: number;
  completed_orders: number;
  total_sales: string;
  average_order_value: string;
  rating: string;
  total_reviews: number;
  status: string;
  is_verified: boolean;
  created_at: string;
  // Dashboard data
  revenue: {
    total: number;
    change: number;
    data: Array<{ name: string; revenue: number; orders: number }>;
  };
  orders: {
    total: number;
    change: number;
    statusBreakdown: {
      pending: number;
      processing: number;
      completed: number;
      cancelled: number;
    };
  };
  products: {
    total: number;
    active: number;
    draft: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    new: number;
    change: number;
  };
  revenueData: Array<{ name: string; revenue: number; orders: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number; trend: number }>;
  recentOrders: Array<{ id: string; orderNumber: string; customer: string; product: string; amount: number; status: string; time: string }>;
}

// Colors for charts
const CHART_COLORS = {
  primary: '#84CC16',
  secondary: '#06B6D4',
  tertiary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const ORDER_STATUS_COLORS = [
  { name: 'Completed', color: '#10B981', fill: '#10B981' },
  { name: 'Processing', color: '#3B82F6', fill: '#3B82F6' },
  { name: 'Pending', color: '#F59E0B', fill: '#F59E0B' },
  { name: 'Cancelled', color: '#EF4444', fill: '#EF4444' },
];

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<FullStatistics | null>(null);

  // Set shop context
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!shopId) return;

    setLoading(true);
    setError(null);

    try {
      const statsResponse = await api.getShopStatistics();
      setStatistics(statsResponse);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load analytics');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [shopId, timeRange]);

  // Format currency
  const formatCurrency = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Calculate growth indicator
  const GrowthIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-500 text-sm font-medium">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-500 text-sm font-medium">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          {value}%
        </span>
      );
    }
    return <span className="text-gray-400 text-sm">0%</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary-lime animate-spin mx-auto" />
          <p className="text-gray-500">{t('vendor.analytics.loading', { defaultValue: 'Loading analytics...' })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900">{t('vendor.analytics.failedToLoad', { defaultValue: 'Failed to load analytics' })}</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-primary-lime text-white rounded-xl hover:bg-primary-lime/90 transition-all flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('vendor.common.retry', { defaultValue: 'Retry' })}</span>
          </button>
        </div>
      </div>
    );
  }

  // Prepare order status data for pie chart
  const orderStatusData = statistics ? [
    { name: 'Completed', value: statistics.orders.statusBreakdown.completed, color: '#10B981' },
    { name: 'Processing', value: statistics.orders.statusBreakdown.processing, color: '#3B82F6' },
    { name: 'Pending', value: statistics.orders.statusBreakdown.pending, color: '#F59E0B' },
    { name: 'Cancelled', value: statistics.orders.statusBreakdown.cancelled, color: '#EF4444' },
  ].filter(item => item.value > 0) : [];

  // Prepare product status data for radial chart
  const productStatusData = statistics ? [
    { name: 'Active', value: statistics.products.active, fill: '#10B981' },
    { name: 'Draft', value: statistics.products.draft, fill: '#F59E0B' },
    { name: 'Out of Stock', value: statistics.products.outOfStock, fill: '#EF4444' },
  ].filter(item => item.value > 0) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('vendor.analytics.title', { defaultValue: 'Analytics & Insights' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.analytics.subtitle', { defaultValue: 'Track your store performance and metrics' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
          >
            <option value="7d">{t('vendor.analytics.last7Days', { defaultValue: 'Last 7 Days' })}</option>
            <option value="30d">{t('vendor.analytics.last30Days', { defaultValue: 'Last 30 Days' })}</option>
            <option value="3m">{t('vendor.analytics.last3Months', { defaultValue: 'Last 3 Months' })}</option>
            <option value="6m">{t('vendor.analytics.last6Months', { defaultValue: 'Last 6 Months' })}</option>
            <option value="1y">{t('vendor.analytics.lastYear', { defaultValue: 'Last Year' })}</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button className="px-6 py-2 bg-primary-lime rounded-xl font-medium text-white hover:bg-primary-lime/90 transition-all shadow-lg flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">{t('vendor.analytics.exportReport', { defaultValue: 'Export' })}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.analytics.totalRevenue', { defaultValue: 'Total Revenue' })}
          value={formatCurrency(statistics?.total_sales || 0)}
          icon={<DollarSign />}
          color="from-green-400 to-emerald-500"
          subtitle={
            <div className="flex items-center space-x-2">
              <GrowthIndicator value={statistics?.revenue?.change || 0} />
              <span className="text-gray-500">vs last period</span>
            </div>
          }
        />
        <StatCard
          title={t('vendor.analytics.totalOrders', { defaultValue: 'Total Orders' })}
          value={formatNumber(statistics?.total_orders || 0)}
          icon={<ShoppingCart />}
          color="from-blue-400 to-cyan-500"
          subtitle={`${statistics?.completed_orders || 0} completed`}
        />
        <StatCard
          title={t('vendor.analytics.avgOrderValue', { defaultValue: 'Avg Order Value' })}
          value={formatCurrency(statistics?.average_order_value || 0)}
          icon={<TrendingUp />}
          color="from-purple-400 to-pink-500"
          subtitle="Per completed order"
        />
        <StatCard
          title={t('vendor.analytics.totalCustomers', { defaultValue: 'Total Customers' })}
          value={formatNumber(statistics?.customers?.total || 0)}
          icon={<Users />}
          color="from-orange-400 to-red-500"
          subtitle={
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{statistics?.rating || '0'} ({statistics?.total_reviews || 0} reviews)</span>
            </div>
          }
        />
      </div>

      {/* Revenue & Orders Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title={t('vendor.analytics.revenueOrdersTrend', { defaultValue: 'Revenue & Orders Trend' })}
            subtitle={t('vendor.analytics.weeklyPerformance', { defaultValue: 'Weekly performance overview' })}
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={statistics?.revenueData || []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84CC16" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#84CC16" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,231,235,1)" />
                <XAxis dataKey="name" stroke="rgba(107,114,128,0.7)" fontSize={12} />
                <YAxis yAxisId="left" stroke="rgba(107,114,128,0.7)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(107,114,128,0.7)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#84CC16"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                  name="Revenue"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#ordersGradient)"
                  strokeWidth={3}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Order Status Breakdown */}
        <ChartCard
          title={t('vendor.analytics.orderStatus', { defaultValue: 'Order Status' })}
          subtitle={t('vendor.analytics.breakdownByStatus', { defaultValue: 'Breakdown by status' })}
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [value, 'Orders']}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{item.name}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Category Performance & Product Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <ChartCard
          title={t('vendor.analytics.categoryDistribution', { defaultValue: 'Category Distribution' })}
          subtitle={t('vendor.analytics.productsByCategory', { defaultValue: 'Products by category' })}
        >
          {(statistics?.categoryData?.length || 0) > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statistics?.categoryData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(229,231,235,1)" />
                  <XAxis type="number" stroke="rgba(107,114,128,0.7)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="rgba(107,114,128,0.7)" fontSize={12} width={100} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Share']}
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.98)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {(statistics?.categoryData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
              <Package className="w-12 h-12 mb-3" />
              <p>No category data available</p>
            </div>
          )}
        </ChartCard>

        {/* Product Stats */}
        <ChartCard
          title={t('vendor.analytics.productStatus', { defaultValue: 'Product Status' })}
          subtitle={t('vendor.analytics.inventoryOverview', { defaultValue: 'Inventory overview' })}
        >
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">{statistics?.products?.active || 0}</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-3xl font-bold text-yellow-600">{statistics?.products?.draft || 0}</p>
              <p className="text-sm text-yellow-600">Draft</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-3xl font-bold text-red-600">{statistics?.products?.outOfStock || 0}</p>
              <p className="text-sm text-red-600">Out of Stock</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Products</span>
              <span className="font-bold text-gray-900">{statistics?.products?.total || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${statistics?.products?.total ? (statistics.products.active / statistics.products.total) * 100 : 0}%`
                }}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              {statistics?.products?.total
                ? Math.round((statistics.products.active / statistics.products.total) * 100)
                : 0}% of products are active
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Top Products Table */}
      {(statistics?.topProducts?.length || 0) > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vendor.analytics.topProducts', { defaultValue: 'Top Performing Products' })}
              </h3>
              <p className="text-sm text-gray-500">Based on revenue</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">#</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Product</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Units Sold</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(statistics?.topProducts || []).map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-lime to-green-500 flex items-center justify-center font-bold text-white text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900 font-medium">{product.name}</span>
                    </td>
                    <td className="p-4 text-gray-700">{product.sales}</td>
                    <td className="p-4 text-gray-900 font-semibold">{formatCurrency(product.revenue)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Recent Orders */}
      {(statistics?.recentOrders?.length || 0) > 0 && (
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vendor.analytics.recentOrders', { defaultValue: 'Recent Orders' })}
              </h3>
              <p className="text-sm text-gray-500">Latest order activity</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Order</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Customer</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Product</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Amount</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Status</th>
                  <th className="text-left p-4 text-sm text-gray-600 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {(statistics?.recentOrders || []).map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <span className="text-primary-lime font-medium">{order.orderNumber}</span>
                    </td>
                    <td className="p-4 text-gray-700">{order.customer}</td>
                    <td className="p-4 text-gray-700 max-w-[150px] truncate">{order.product}</td>
                    <td className="p-4 text-gray-900 font-semibold">{formatCurrency(order.amount)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' || order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{order.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Customer & Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard hover={false}>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(statistics?.customers?.total || 0)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.rating || '0'} / 5</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(statistics?.total_reviews || 0)}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

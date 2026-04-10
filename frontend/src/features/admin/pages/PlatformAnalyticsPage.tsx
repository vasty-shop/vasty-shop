import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  Package,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

// Types
interface OverviewStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  activeShops: number;
  shopsGrowth: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface OrdersDataPoint {
  date: string;
  orders: number;
  completed: number;
  pending: number;
  cancelled: number;
}

interface UserRegistration {
  date: string;
  users: number;
  vendors: number;
}

interface CategorySales {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface TopShop {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  growth: number;
}

interface TopProduct {
  id: string;
  name: string;
  shopName: string;
  unitsSold: number;
  revenue: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}

// Chart colors - updated for light theme
const COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

// Card Components - updated for light theme
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({
  children,
  className = '',
  hover = true
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`
      bg-white border border-gray-200 rounded-xl shadow-sm p-6
      ${hover ? 'hover:shadow-md hover:border-gray-300 cursor-pointer transition-all' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactElement;
  color?: string;
  subtitle?: string;
}> = ({ title, value, change, icon, color = 'from-indigo-500 to-purple-500', subtitle }) => {
  const { t } = useTranslation();
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            {React.cloneElement(icon as any, { className: 'w-5 h-5 text-white' })}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>

          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}

          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(change)}%
              </span>
              <span className="text-gray-400 text-xs">{t('admin.common.vsLastPeriod')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gray-100 rounded-full blur-3xl group-hover:bg-gray-200 transition-all duration-500" />
    </motion.div>
  );
};

const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, children, actions }) => (
  <GlassCard hover={false}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
    <div>{children}</div>
  </GlassCard>
);

export const PlatformAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'this_month' | 'this_year'>('30d');
  const [chartTimeframe, setChartTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [ordersData, setOrdersData] = useState<OrdersDataPoint[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [topShops, setTopShops] = useState<TopShop[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, chartTimeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch overview stats
      const overviewData = await api.getAdminOverviewStats({ dateRange });
      setOverviewStats(overviewData);

      // Fetch revenue data
      const revenueData = await api.getAdminRevenueData({
        dateRange,
        timeframe: chartTimeframe
      });
      setRevenueData(revenueData);

      // Fetch orders data
      const ordersData = await api.getAdminOrdersData({
        dateRange,
        timeframe: chartTimeframe
      });
      setOrdersData(ordersData);

      // Fetch user registrations
      const usersData = await api.getAdminUsersData({
        dateRange,
        timeframe: chartTimeframe
      });
      setUserRegistrations(usersData);

      // Fetch category sales
      const categoriesData = await api.getAdminCategoriesData({ dateRange });
      setCategorySales(categoriesData.map((cat: any, idx: number) => ({
        ...cat,
        color: COLORS[idx % COLORS.length]
      })));

      // Fetch top performers
      const [shopsData, productsData, customersData] = await Promise.all([
        api.getAdminTopShops({ dateRange, limit: 10 }),
        api.getAdminTopProducts({ dateRange, limit: 10 }),
        api.getAdminTopCustomers({ dateRange, limit: 10 })
      ]);

      setTopShops(shopsData);
      setTopProducts(productsData);
      setTopCustomers(customersData);

    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load analytics');
      toast.error(t('admin.analytics.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // Prepare CSV data
      const exportData: string[] = [];
      const timestamp = new Date().toISOString().split('T')[0];

      // Header
      exportData.push('Platform Analytics Report');
      exportData.push(`Date Range: ${dateRange}`);
      exportData.push(`Generated: ${new Date().toLocaleString()}`);
      exportData.push('');

      // Overview Stats
      if (overviewStats) {
        exportData.push('=== OVERVIEW STATS ===');
        exportData.push(`Total Revenue,$${overviewStats.totalRevenue.toFixed(2)}`);
        exportData.push(`Revenue Growth,${overviewStats.revenueGrowth.toFixed(1)}%`);
        exportData.push(`Total Orders,${overviewStats.totalOrders}`);
        exportData.push(`Orders Growth,${overviewStats.ordersGrowth.toFixed(1)}%`);
        exportData.push(`Active Users,${overviewStats.activeUsers}`);
        exportData.push(`Users Growth,${overviewStats.usersGrowth.toFixed(1)}%`);
        exportData.push(`Active Shops,${overviewStats.activeShops}`);
        exportData.push(`Shops Growth,${overviewStats.shopsGrowth.toFixed(1)}%`);
        exportData.push('');
      }

      // Revenue Data
      if (revenueData.length > 0) {
        exportData.push('=== REVENUE DATA ===');
        exportData.push('Date,Revenue,Orders');
        revenueData.forEach(item => {
          exportData.push(`${item.date},$${item.revenue.toFixed(2)},${item.orders}`);
        });
        exportData.push('');
      }

      // Orders Data
      if (ordersData.length > 0) {
        exportData.push('=== ORDERS DATA ===');
        exportData.push('Date,Total Orders,Completed,Pending,Cancelled');
        ordersData.forEach(item => {
          exportData.push(`${item.date},${item.orders},${item.completed},${item.pending},${item.cancelled}`);
        });
        exportData.push('');
      }

      // User Registrations
      if (userRegistrations.length > 0) {
        exportData.push('=== USER REGISTRATIONS ===');
        exportData.push('Date,Users,Vendors');
        userRegistrations.forEach(item => {
          exportData.push(`${item.date},${item.users},${item.vendors}`);
        });
        exportData.push('');
      }

      // Category Sales
      if (categorySales.length > 0) {
        exportData.push('=== CATEGORY SALES ===');
        exportData.push('Category,Sales Value');
        categorySales.forEach(item => {
          exportData.push(`${item.name},$${item.value.toFixed(2)}`);
        });
        exportData.push('');
      }

      // Top Shops
      if (topShops.length > 0) {
        exportData.push('=== TOP SHOPS ===');
        exportData.push('Shop Name,Orders,Revenue,Growth %');
        topShops.forEach(shop => {
          exportData.push(`${shop.name},${shop.orders},$${shop.revenue.toFixed(2)},${shop.growth.toFixed(1)}%`);
        });
        exportData.push('');
      }

      // Top Products
      if (topProducts.length > 0) {
        exportData.push('=== TOP PRODUCTS ===');
        exportData.push('Product Name,Shop,Units Sold,Revenue');
        topProducts.forEach(product => {
          exportData.push(`${product.name},${product.shopName},${product.unitsSold},$${product.revenue.toFixed(2)}`);
        });
        exportData.push('');
      }

      // Top Customers
      if (topCustomers.length > 0) {
        exportData.push('=== TOP CUSTOMERS ===');
        exportData.push('Customer Name,Email,Orders,Total Spent');
        topCustomers.forEach(customer => {
          exportData.push(`${customer.name},${customer.email},${customer.orders},$${customer.totalSpent.toFixed(2)}`);
        });
      }

      // Create and download CSV file
      const csvContent = exportData.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `platform-analytics-${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t('admin.analytics.exportedSuccess'), {
        description: `Report saved as platform-analytics-${timestamp}.csv`
      });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error(t('admin.analytics.exportFailed'));
    }
  };

  // Format currency
  const formatCurrency = (value: number | string | undefined | null): string => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(1)}K`;
    }
    return `$${numValue.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
          <p className="text-gray-500">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900">{t('common.error')}</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('admin.analytics.title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('admin.analytics.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          >
            <option value="today">{t('admin.analytics.today')}</option>
            <option value="7d">{t('admin.analytics.thisWeek')}</option>
            <option value="30d">{t('admin.analytics.thisMonth')}</option>
            <option value="this_month">{t('admin.analytics.thisMonth')}</option>
            <option value="this_year">{t('admin.analytics.thisYear')}</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/30 flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>{t('admin.common.export')}</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.totalRevenue')}
          value={formatCurrency(overviewStats?.totalRevenue || 0)}
          change={overviewStats?.revenueGrowth}
          icon={<DollarSign />}
          color="from-green-500 to-emerald-500"
          subtitle={t('admin.analytics.revenue')}
        />
        <StatCard
          title={t('admin.dashboard.totalOrders')}
          value={(overviewStats?.totalOrders || 0).toLocaleString()}
          change={overviewStats?.ordersGrowth}
          icon={<ShoppingCart />}
          color="from-indigo-500 to-blue-500"
          subtitle={t('admin.analytics.orders')}
        />
        <StatCard
          title={t('admin.dashboard.totalUsers')}
          value={(overviewStats?.activeUsers || 0).toLocaleString()}
          change={overviewStats?.usersGrowth}
          icon={<Users />}
          color="from-purple-500 to-pink-500"
          subtitle={t('admin.analytics.users')}
        />
        <StatCard
          title={t('admin.dashboard.activeShops')}
          value={(overviewStats?.activeShops || 0).toLocaleString()}
          change={overviewStats?.shopsGrowth}
          icon={<Store />}
          color="from-orange-500 to-red-500"
          subtitle={t('admin.analytics.shops')}
        />
      </div>

      {/* Chart Timeframe Toggle */}
      <div className="flex justify-end">
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-1 flex space-x-1">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setChartTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                chartTimeframe === tf
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t(`admin.analytics.${tf}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue & Orders Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartCard title={t('admin.analytics.revenueOverTime')} subtitle={t('admin.analytics.platformRevenueTrend')}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#111827',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ color: '#374151' }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ fill: '#4F46E5', r: 5 }}
                activeDot={{ r: 7 }}
                name={t('admin.analytics.revenue')}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Orders Chart */}
        <ChartCard title={t('admin.analytics.ordersOverTime')} subtitle={t('admin.analytics.orderVolumeAnalysis')}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#111827',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ color: '#374151' }} />
              <Bar dataKey="completed" stackId="a" fill="#10B981" name={t('admin.analytics.completed')} />
              <Bar dataKey="pending" stackId="a" fill="#F59E0B" name={t('admin.analytics.pending')} />
              <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name={t('admin.analytics.cancelled')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* User Registrations & Category Sales */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Registrations Trend */}
        <div className="xl:col-span-2">
          <ChartCard title={t('admin.analytics.userRegistrations')} subtitle={t('admin.analytics.newUserGrowthTrend')}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userRegistrations}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="vendorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    color: '#111827',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ color: '#374151' }} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#usersGrad)"
                  strokeWidth={3}
                  name={t('admin.analytics.customers')}
                />
                <Area
                  type="monotone"
                  dataKey="vendors"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#vendorsGrad)"
                  strokeWidth={3}
                  name={t('admin.analytics.vendors')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Category Sales */}
        <ChartCard title={t('admin.analytics.topCategories')} subtitle={t('admin.analytics.salesByCategory')}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => entry.name}
              >
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#111827',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Performers Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Shops */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.analytics.topShops')}</h3>
              <p className="text-gray-500 text-sm mt-1">{t('admin.analytics.shops')}</p>
            </div>
            <Store className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="space-y-3">
            {topShops.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">{shop.name}</p>
                    <p className="text-gray-500 text-xs">{shop.orders} {t('admin.analytics.orders')}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-gray-900 font-semibold">{formatCurrency(shop.revenue)}</p>
                  <p className={`text-xs ${shop.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {shop.growth > 0 ? '+' : ''}{shop.growth}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Top Products */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.analytics.topProducts')}</h3>
              <p className="text-gray-500 text-sm mt-1">{t('admin.sidebar.products')}</p>
            </div>
            <Package className="w-6 h-6 text-purple-500" />
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">{product.name}</p>
                    <p className="text-gray-500 text-xs truncate">{product.shopName}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-gray-900 font-semibold">{product.unitsSold}</p>
                  <p className="text-gray-500 text-xs">{t('admin.analytics.units')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Top Customers */}
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.analytics.topCustomers')}</h3>
              <p className="text-gray-500 text-sm mt-1">{t('admin.users.customers')}</p>
            </div>
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">{customer.name}</p>
                    <p className="text-gray-500 text-xs">{customer.orders} {t('admin.analytics.orders')}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-gray-900 font-semibold">{formatCurrency(customer.totalSpent)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

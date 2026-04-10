import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Store,
  DollarSign,
  Users,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
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
import { StatCard, ChartCard, GlassCard, QuickActionCard } from '../../vendor/components/GlassCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  totalRevenue: number;
  pendingShops: number;
  activeShops: number;
  usersChange: number;
  shopsChange: number;
  ordersChange: number;
  revenueChange: number;
}

interface RecentActivity {
  id: string;
  type: 'shop' | 'order' | 'user';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'pending' | 'failed';
}

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalShops: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingShops: 0,
    activeShops: 0,
    usersChange: 0,
    shopsChange: 0,
    ordersChange: 0,
    revenueChange: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number; orders: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch admin dashboard statistics from API
      const statsResponse = await api.getAdminDashboardStats();
      if (statsResponse) {
        setStats({
          totalUsers: statsResponse.totalUsers || 0,
          totalShops: statsResponse.totalShops || 0,
          totalOrders: statsResponse.totalOrders || 0,
          totalRevenue: statsResponse.totalRevenue || 0,
          pendingShops: statsResponse.pendingShops || 0,
          activeShops: statsResponse.activeShops || 0,
          usersChange: statsResponse.usersChange || 0,
          shopsChange: statsResponse.shopsChange || 0,
          ordersChange: statsResponse.ordersChange || 0,
          revenueChange: statsResponse.revenueChange || 0
        });
      }

      // Fetch recent activity
      const activityResponse = await api.getAdminRecentActivity();
      if (activityResponse?.data) {
        setRecentActivity(activityResponse.data.map((item: any) => ({
          id: item.id,
          type: item.type || 'order',
          title: item.title,
          description: item.description,
          time: item.timeAgo || item.time,
          status: item.status || 'success'
        })));
      }

      // Fetch revenue overview data (last 7 days)
      if (statsResponse?.revenueOverview) {
        setRevenueData(statsResponse.revenueOverview);
      }

      // Fetch shop categories distribution
      if (statsResponse?.categoryDistribution) {
        setCategoryData(statsResponse.categoryDistribution);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(t('admin.analytics.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {t('admin.dashboard.title')}
            </h1>
            <p className="text-gray-500 mt-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all flex items-center space-x-2 text-gray-700"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{t('admin.common.refresh')}</span>
            </button>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="7d">{t('admin.analytics.last7Days')}</option>
              <option value="30d">{t('admin.analytics.last30Days')}</option>
              <option value="90d">{t('admin.analytics.last90Days')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard
          title={t('admin.dashboard.totalUsers')}
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersChange}
          icon={<Users />}
          color="from-blue-400 to-cyan-500"
          subtitle={t('admin.users.allUsers')}
        />
        <StatCard
          title={t('admin.dashboard.totalShops')}
          value={stats.totalShops.toString()}
          change={stats.shopsChange}
          icon={<Store />}
          color="from-purple-400 to-pink-500"
          subtitle={`${stats.pendingShops} ${t('admin.dashboard.pendingShops')}`}
        />
        <StatCard
          title={t('admin.dashboard.totalOrders')}
          value={stats.totalOrders.toLocaleString()}
          change={stats.ordersChange}
          icon={<ShoppingCart />}
          color="from-green-400 to-emerald-500"
          subtitle={t('admin.orders.allOrders')}
        />
        <StatCard
          title={t('admin.dashboard.totalRevenue')}
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={<DollarSign />}
          color="from-orange-400 to-red-500"
          subtitle={t('admin.analytics.revenue')}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.quickActions')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              icon={<Store />}
              title={t('admin.shops.approveShop')}
              description={t('admin.shops.pendingApprovals')}
              color="from-purple-500 to-pink-500"
            />
            <QuickActionCard
              icon={<Users />}
              title={t('admin.users.title')}
              description={t('admin.users.subtitle')}
              color="from-blue-500 to-cyan-500"
            />
            <QuickActionCard
              icon={<Package />}
              title={t('admin.sidebar.products')}
              description={t('admin.products.subtitle')}
              color="from-green-500 to-emerald-500"
            />
            <QuickActionCard
              icon={<ShoppingCart />}
              title={t('admin.sidebar.orders')}
              description={t('admin.orders.subtitle')}
              color="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {/* Revenue Chart */}
        <div className="xl:col-span-2">
          <ChartCard
            title={t('admin.dashboard.revenueOverview')}
            subtitle={t('admin.analytics.dailyTrends')}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Category Distribution */}
        <ChartCard title={t('admin.dashboard.shopCategories')} subtitle={t('admin.categories.allCategories')}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{cat.name}</p>
                  <p className="text-sm font-semibold text-gray-900">{cat.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.recentActivity')}</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors flex items-center space-x-1">
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'shop'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : activity.type === 'order'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}
                  >
                    {activity.type === 'shop' ? (
                      <Store className="w-5 h-5 text-white" />
                    ) : activity.type === 'order' ? (
                      <ShoppingCart className="w-5 h-5 text-white" />
                    ) : (
                      <Users className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {getStatusIcon(activity.status)}
                    <span className="capitalize">{t(`admin.dashboard.activityStatus.${activity.status}`)}</span>
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

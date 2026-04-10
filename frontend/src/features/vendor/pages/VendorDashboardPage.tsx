import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Eye,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Settings,
  Palette,
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveShop } from '@/hooks/useActiveShop';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps & { vsLastPeriodText?: string }> = ({ title, value, change, icon, color, subtitle, vsLastPeriodText }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{Math.abs(change)}% {subtitle || vsLastPeriodText}</span>
          </div>
        )}
        {change === undefined && subtitle && (
          <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Quick Action Card
interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, description, href, color }) => (
  <Link
    to={href}
    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 group-hover:text-primary-lime transition-colors">{title}</p>
      <p className="text-sm text-gray-500 truncate">{description}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-lime group-hover:translate-x-1 transition-all" />
  </Link>
);

// Order Status Badge
const getStatusBadge = (status: string, t: (key: string, options?: { defaultValue: string }) => string) => {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <AlertCircle className="w-3 h-3" /> },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3 h-3" /> },
  };
  const style = styles[status] || styles.pending;
  const statusLabels: Record<string, string> = {
    pending: t('vendor.orders.statuses.pending', { defaultValue: 'Pending' }),
    processing: t('vendor.orders.statuses.processing', { defaultValue: 'Processing' }),
    completed: t('vendor.orders.statuses.delivered', { defaultValue: 'Completed' }),
    delivered: t('vendor.orders.statuses.delivered', { defaultValue: 'Delivered' }),
    cancelled: t('vendor.orders.statuses.cancelled', { defaultValue: 'Cancelled' }),
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      <span>{statusLabels[status] || status}</span>
    </span>
  );
};

export const VendorDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shop, shopId, isLoading: shopsLoading } = useActiveShop();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Set shop context
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // Fetch dashboard data
  const fetchData = async (showRefresh = false) => {
    if (!shop?.id) return;

    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      let statsData: any = {};

      // Try to fetch statistics from the shop stats endpoint
      try {
        const response = await apiClient.get('/shops/current/statistics');
        statsData = response.data || {};
      } catch (error) {
        // Statistics API not available, fetch individual data
      }

      // Fetch products count if not in stats
      if (!statsData.products?.total) {
        try {
          const productsResponse: any = await api.getVendorProducts({ limit: 5 });
          const products = Array.isArray(productsResponse) ? productsResponse : (productsResponse?.data || []);
          const total = productsResponse?.total || products.length;
          statsData.products = { total, active: products.length };

          // Only set topProducts if backend didn't return any (backend data has real sales)
          if (!statsData.topProducts || statsData.topProducts.length === 0) {
            statsData.topProducts = products.map((p: any) => ({
              id: p.id,
              name: p.name,
              sales: p.salesCount || p.sales || 0,
              revenue: p.revenue || ((p.salesCount || p.sales || 0) * (p.salePrice || p.price || 0)),
              image: p.images?.[0] || p.image,
            }));
          }
        } catch (error) {
          // Failed to fetch products
        }
      }

      // Fetch recent orders if not in stats
      if (!statsData.recentOrders || statsData.recentOrders.length === 0) {
        try {
          const ordersResponse = await api.getVendorOrders({ limit: 5 });
          const orders = ordersResponse?.data || [];
          statsData.recentOrders = orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customer: o.customer?.name || o.customerName || o.shippingAddress?.fullName || o.shippingAddress?.name || o.shipping_address?.fullName || o.shipping_address?.name || 'Guest',
            amount: o.total || o.totalAmount || 0,
            status: o.status || 'pending',
          }));
          statsData.orders = { total: ordersResponse?.total || orders.length };
        } catch (error) {
          // Failed to fetch orders
        }
      }

      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty stats if API fails
      setStats({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (shop?.id) {
      fetchData();
    }
  }, [shop?.id]);

  // Loading state
  if (loading || shopsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-2xl" />
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // No shop state
  if (!shop?.id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('vendor.dashboard.noShopSelected', { defaultValue: 'No Shop Selected' })}</h2>
          <p className="text-gray-500 mb-6">{t('vendor.dashboard.selectOrCreateShop', { defaultValue: 'Please select a shop or create a new one' })}</p>
          <Link
            to="/vendor/create-shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('vendor.createShop.createShop', { defaultValue: 'Create Shop' })}
          </Link>
        </div>
      </div>
    );
  }

  // Default stats values
  const totalRevenue = stats?.revenue?.total || stats?.total_sales || 0;
  const totalOrders = stats?.orders?.total || stats?.total_orders || 0;
  const totalProducts = stats?.products?.total || stats?.total_products || 0;
  const totalCustomers = stats?.customers?.total || 0;
  const recentOrders = stats?.recentOrders || [];
  const topProducts = stats?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('vendor.common.welcome', { defaultValue: 'Welcome back' })}, {shop.name}!
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.dashboard.storeOverview', { defaultValue: "Here's what's happening with your store today" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('vendor.common.refresh', { defaultValue: 'Refresh' })}
          </button>
          <a
            href={`/store/${shop.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t('vendor.dashboard.visitStorefront', { defaultValue: 'View Store' })}
          </a>
        </div>
      </div>

      {/* Pending Approval Banner */}
      {shop.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">{t('vendor.dashboard.shopPendingApproval', { defaultValue: 'Shop Pending Approval' })}</h3>
              <p className="text-yellow-700 text-sm mt-1">
                {t('vendor.dashboard.pendingApprovalMessage', { defaultValue: 'Your shop is under review. You can still add products and configure settings while waiting.' })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.dashboard.totalRevenue', { defaultValue: 'Total Revenue' })}
          value={`৳${Number(totalRevenue).toLocaleString()}`}
          change={stats?.revenue?.change}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          vsLastPeriodText={t('vendor.dashboard.vsLastPeriod', { defaultValue: 'vs last period' })}
        />
        <StatCard
          title={t('vendor.dashboard.totalOrders', { defaultValue: 'Total Orders' })}
          value={totalOrders}
          change={stats?.orders?.change}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
          vsLastPeriodText={t('vendor.dashboard.vsLastPeriod', { defaultValue: 'vs last period' })}
        />
        <StatCard
          title={t('vendor.dashboard.totalProducts', { defaultValue: 'Products' })}
          value={totalProducts}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
          subtitle={`${stats?.products?.active || 0} ${t('vendor.common.active', { defaultValue: 'active' })}`}
        />
        <StatCard
          title={t('vendor.dashboard.totalCustomers', { defaultValue: 'Customers' })}
          value={totalCustomers}
          change={stats?.customers?.change}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-red-600"
          vsLastPeriodText={t('vendor.dashboard.vsLastPeriod', { defaultValue: 'vs last period' })}
        />
      </div>

      {/* Earnings Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('vendor.dashboard.earningsBreakdown', { defaultValue: 'Earnings Breakdown' })}</h2>
            <p className="text-sm text-gray-500">{t('vendor.dashboard.profitAfterDeductions', { defaultValue: 'Your profit after all deductions' })}</p>
          </div>
          <Link
            to={`/shop/${shopId}/vendor/analytics`}
            className="text-sm text-primary-lime hover:text-primary-lime/80 font-medium flex items-center gap-1"
          >
            {t('vendor.common.view', { defaultValue: 'View' })} {t('vendor.dashboard.details', { defaultValue: 'Details' })} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gross Sales */}
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-green-700">{t('vendor.dashboard.grossSales', { defaultValue: 'Gross Sales' })}</span>
            </div>
            <p className="text-2xl font-bold text-green-800">৳{Number(stats?.earnings?.grossSales || totalRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{t('vendor.dashboard.totalOrderValue', { defaultValue: 'Total order value' })}</p>
          </div>

          {/* Delivery Costs */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700">{t('vendor.dashboard.deliveryCosts', { defaultValue: 'Delivery Costs' })}</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">-৳{Number(stats?.earnings?.deliveryCosts || 0).toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">{t('vendor.dashboard.paidToDeliveryPartners', { defaultValue: 'Paid to delivery partners' })}</p>
          </div>

          {/* Net Profit */}
          <div className="p-4 bg-gradient-to-br from-primary-lime/10 to-green-100 rounded-xl border border-primary-lime/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-lime to-green-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-green-700">{t('vendor.dashboard.netProfit', { defaultValue: 'Net Profit' })}</span>
            </div>
            <p className="text-2xl font-bold text-green-800">
              ৳{Number(
                stats?.earnings?.netProfit ||
                ((stats?.earnings?.grossSales || totalRevenue || 0) - (stats?.earnings?.deliveryCosts || 0))
              ).toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">{t('vendor.dashboard.actualEarnings', { defaultValue: 'Your actual earnings' })}</p>
          </div>
        </div>

        {/* Earnings Summary Bar */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">{t('vendor.dashboard.profitMargin', { defaultValue: 'Profit Margin' })}</span>
            <span className="font-semibold text-gray-900">
              {(() => {
                const grossSales = stats?.earnings?.grossSales || totalRevenue || 0;
                const deliveryCosts = stats?.earnings?.deliveryCosts || 0;
                return grossSales > 0
                  ? Math.round(((grossSales - deliveryCosts) / grossSales) * 100)
                  : 0;
              })()}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-lime to-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${(() => {
                  const grossSales = stats?.earnings?.grossSales || totalRevenue || 0;
                  const deliveryCosts = stats?.earnings?.deliveryCosts || 0;
                  return grossSales > 0
                    ? Math.min(100, Math.round(((grossSales - deliveryCosts) / grossSales) * 100))
                    : 0;
                })()}%`
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('vendor.dashboard.quickActions', { defaultValue: 'Quick Actions' })}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={<Plus className="w-5 h-5 text-white" />}
            title={t('vendor.dashboard.addProduct', { defaultValue: 'Add Product' })}
            description={t('vendor.dashboard.createNewListing', { defaultValue: 'Create new listing' })}
            href={`/shop/${shopId}/vendor/products/add`}
            color="bg-gradient-to-br from-primary-lime to-green-600"
          />
          <QuickAction
            icon={<ShoppingCart className="w-5 h-5 text-white" />}
            title={t('vendor.dashboard.viewOrders', { defaultValue: 'View Orders' })}
            description={t('vendor.dashboard.manageOrders', { defaultValue: 'Manage orders' })}
            href={`/shop/${shopId}/vendor/orders`}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <QuickAction
            icon={<Palette className="w-5 h-5 text-white" />}
            title={t('vendor.dashboard.customizeStorefront', { defaultValue: 'Customize Store' })}
            description={t('vendor.dashboard.editStorefront', { defaultValue: 'Edit storefront' })}
            href={`/shop/${shopId}/vendor/storefront`}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <QuickAction
            icon={<Settings className="w-5 h-5 text-white" />}
            title={t('vendor.dashboard.shopSettings', { defaultValue: 'Settings' })}
            description={t('vendor.dashboard.shopSettingsDesc', { defaultValue: 'Shop settings' })}
            href={`/shop/${shopId}/vendor/settings`}
            color="bg-gradient-to-br from-gray-600 to-gray-800"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('vendor.dashboard.recentOrders', { defaultValue: 'Recent Orders' })}</h2>
            <Link
              to={`/shop/${shopId}/vendor/orders`}
              className="text-sm text-primary-lime hover:text-primary-lime/80 font-medium flex items-center gap-1"
            >
              {t('vendor.common.viewAll', { defaultValue: 'View All' })} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('vendor.dashboard.noOrders', { defaultValue: 'No orders yet' })}</p>
              <p className="text-sm text-gray-400 mt-1">{t('vendor.dashboard.ordersWillAppear', { defaultValue: 'Orders will appear here when customers purchase' })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/shop/${shopId}/vendor/orders`)}
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber || `#${order.id.slice(-6)}`}</p>
                    <p className="text-sm text-gray-500">{order.customer || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">৳{order.amount || 0}</p>
                    {getStatusBadge(order.status, t)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('vendor.dashboard.topProducts', { defaultValue: 'Top Products' })}</h2>
            <Link
              to={`/shop/${shopId}/vendor/products`}
              className="text-sm text-primary-lime hover:text-primary-lime/80 font-medium flex items-center gap-1"
            >
              {t('vendor.common.viewAll', { defaultValue: 'View All' })} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('vendor.dashboard.noProducts', { defaultValue: 'No products yet' })}</p>
              <p className="text-sm text-gray-400 mt-1">{t('vendor.dashboard.addProductsToSeePerformance', { defaultValue: 'Add products to see performance' })}</p>
              <Link
                to={`/shop/${shopId}/vendor/products/add`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-lime text-white rounded-lg text-sm font-medium hover:bg-primary-lime/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('vendor.dashboard.addFirstProduct', { defaultValue: 'Add First Product' })}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-lime to-green-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} {t('vendor.dashboard.sales', { defaultValue: 'sales' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">৳{product.revenue?.toLocaleString() || 0}</p>
                    {product.trend !== undefined && product.trend !== 0 && (
                      <p className={`text-xs ${product.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.trend > 0 ? '+' : ''}{product.trend}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {stats?.performanceMetrics && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('vendor.dashboard.performanceMetrics', { defaultValue: 'Performance Metrics' })}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ৳{stats.performanceMetrics.avgOrderValue?.value?.toFixed(0) || 0}
              </p>
              <p className="text-sm text-gray-500">{t('vendor.analytics.averageOrderValue', { defaultValue: 'Avg Order Value' })}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.performanceMetrics.conversionRate?.value?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-gray-500">{t('vendor.analytics.conversionRate', { defaultValue: 'Conversion Rate' })}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.performanceMetrics.storeViews?.value || 0}
              </p>
              <p className="text-sm text-gray-500">{t('vendor.dashboard.storeViews', { defaultValue: 'Store Views' })}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.performanceMetrics.avgRating?.value?.toFixed(1) || 0}/5
              </p>
              <p className="text-sm text-gray-500">{t('vendor.dashboard.averageRating', { defaultValue: 'Avg Rating' })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started (Show when no data) */}
      {!stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-lime/10 to-green-50 rounded-2xl p-8 border border-primary-lime/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-lime flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('vendor.dashboard.getStartedTitle', { defaultValue: 'Get Started with Your Store' })}</h2>
              <p className="text-gray-600 mb-6">
                {t('vendor.dashboard.getStartedSubtitle', { defaultValue: 'Complete these steps to start selling' })}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to={`/shop/${shopId}/vendor/products/add`}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('vendor.dashboard.addProducts', { defaultValue: 'Add Products' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.dashboard.createFirstListing', { defaultValue: 'Create your first listing' })}</p>
                  </div>
                </Link>
                <Link
                  to={`/shop/${shopId}/vendor/settings`}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('vendor.dashboard.shopSettings', { defaultValue: 'Shop Settings' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.dashboard.addLogoDetails', { defaultValue: 'Add logo & details' })}</p>
                  </div>
                </Link>
                <Link
                  to={`/shop/${shopId}/vendor/storefront`}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('vendor.dashboard.customize', { defaultValue: 'Customize' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.dashboard.designStorefront', { defaultValue: 'Design your storefront' })}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

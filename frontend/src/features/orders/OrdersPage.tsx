import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  RotateCcw,
  X,
  MapPin,
  CreditCard,
  Calendar,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Star,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useDialog } from '@/hooks/useDialog';
import { useCartStore } from '@/stores/useCartStore';
import type { Size } from '@/types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import type { OrderHistory, OrderStatus, OrderStatistics } from '@/types/order';

// Status configuration with icons and colors
const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    label: 'Pending',
  },
  processing: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Processing',
  },
  confirmed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Confirmed',
  },
  shipped: {
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'Shipped',
  },
  in_transit: {
    icon: Package,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: 'In Transit',
  },
  out_for_delivery: {
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Out for Delivery',
  },
  delivered: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Delivered',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Cancelled',
  },
  refunded: {
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    label: 'Refunded',
  },
  refund_requested: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Refund Requested',
  },
  returned: {
    icon: RotateCcw,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    label: 'Returned',
  },
};

// Default config for unknown statuses
const defaultStatusConfig = {
  icon: AlertCircle,
  color: 'text-gray-600',
  bgColor: 'bg-gray-50 border-gray-200',
  label: 'Unknown',
};

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialog = useDialog();
  const { addItem } = useCartStore();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [isBuyingAgain, setIsBuyingAgain] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<string>('last_6_months');
  const [sortBy, setSortBy] = useState<string>('most_recent');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics>({
    totalOrders: 0,
    activeOrders: 0,
    totalSpentThisYear: 0,
    pendingReturns: 0,
  });
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          limit: ordersPerPage,
          offset: (currentPage - 1) * ordersPerPage,
        };

        // Add status filter
        if (activeTab !== 'all') {
          params.status = activeTab;
        }

        // Add search filter
        if (searchQuery.trim()) {
          params.search = searchQuery;
        }

        // Add date range filter
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
            startDate = now;
          }

          params.startDate = startDate.toISOString();
        }

        // Add sorting
        if (sortBy === 'most_recent') {
          params.sortBy = 'createdAt';
          params.sortOrder = 'desc';
        } else if (sortBy === 'oldest_first') {
          params.sortBy = 'createdAt';
          params.sortOrder = 'asc';
        } else if (sortBy === 'price_high_low') {
          params.sortBy = 'total';
          params.sortOrder = 'desc';
        } else if (sortBy === 'price_low_high') {
          params.sortBy = 'total';
          params.sortOrder = 'asc';
        }

        const response = await api.getOrders(params);
        setOrders(response.data || []);
        setTotalOrders(response.total || 0);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch orders:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load orders';
        setError(errorMessage);
        toast.error(errorMessage);
        setOrders([]);
        setTotalOrders(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, activeTab, searchQuery, dateRange, sortBy]);

  // Fetch statistics separately
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch all orders to calculate statistics
        const allOrdersResponse = await api.getOrders({ limit: 1000 });
        const allOrders = allOrdersResponse.data || [];

        // Calculate statistics from orders
        const totalOrdersCount = allOrdersResponse.total || 0;

        // Active orders: processing, confirmed, shipped, in_transit, out_for_delivery
        const activeStatuses: OrderStatus[] = ['processing', 'confirmed', 'shipped', 'in_transit', 'out_for_delivery'];
        const activeOrdersCount = allOrders.filter(order =>
          activeStatuses.includes(order.status)
        ).length;

        // Total spent this year
        const currentYear = new Date().getFullYear();
        const totalSpent = allOrders
          .filter(order => {
            // Safely parse the order date (handle orderDate, createdAt, or created_at)
            const dateStr = order.orderDate || order.createdAt || order.created_at;
            if (!dateStr) return false;
            const orderDate = new Date(dateStr);
            if (isNaN(orderDate.getTime())) return false;
            const orderYear = orderDate.getFullYear();
            return orderYear === currentYear && order.status !== 'cancelled' && order.status !== 'refunded';
          })
          .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        // Pending returns
        const pendingReturnsCount = allOrders.filter(order =>
          order.status === 'returned'
        ).length;

        setStatistics({
          totalOrders: totalOrdersCount,
          activeOrders: activeOrdersCount,
          totalSpentThisYear: totalSpent,
          pendingReturns: pendingReturnsCount,
        });
      } catch (error: any) {
        console.error('Failed to fetch statistics:', error);
        // Keep default statistics on error
      }
    };

    fetchStatistics();
  }, []);

  // Since we're doing server-side pagination and filtering, we use orders directly
  const filteredOrders = orders;

  // Pagination
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const paginatedOrders = filteredOrders;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      paypal: 'PayPal',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      bank_transfer: 'Bank Transfer',
    };
    return labels[method] || method;
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleBuyAgain = async (order: OrderHistory) => {
    if (isBuyingAgain) return;

    const confirmed = await dialog.showConfirm({
      title: 'Buy Again',
      message: `Add ${order.items.length} item${order.items.length > 1 ? 's' : ''} from this order to your cart?`,
      confirmText: 'Add to Cart',
      cancelText: 'Cancel',
      variant: 'info'
    });

    if (!confirmed) return;

    setIsBuyingAgain(true);
    try {
      let addedCount = 0;
      const errors: string[] = [];

      for (const item of order.items) {
        try {
          // Handle both formats: nested product or flat structure
          const productName = item.product?.name || item.productName || 'Product';
          const productId = item.product?.id || item.productId;
          const itemSize = item.size || item.variant?.size || 'M';
          const itemColor = item.color || item.variant?.color;

          if (item.product) {
            // If we have the full product object, use addItem
            const size = (itemSize) as Size;
            await addItem(item.product, size, itemColor);
          } else {
            // If we only have flat data, use API directly
            await api.addToCart(productId, item.quantity, itemSize, itemColor);
          }
          addedCount++;
        } catch (error: any) {
          const productName = item.product?.name || item.productName || 'Product';
          errors.push(productName);
          console.error(`Failed to add ${productName} to cart:`, error);
        }
      }

      if (addedCount > 0) {
        toast.success(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart`, {
          action: {
            label: 'View Cart',
            onClick: () => navigate('/cart'),
          },
        });
      }

      if (errors.length > 0) {
        toast.error(`Failed to add ${errors.length} item${errors.length > 1 ? 's' : ''}`, {
          description: `Could not add: ${errors.join(', ')}`
        });
      }
    } catch (error: any) {
      console.error('Buy again error:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setIsBuyingAgain(false);
    }
  };

  const handleCancelOrder = async (order: OrderHistory) => {
    const confirmed = await dialog.showConfirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      confirmText: 'Cancel Order',
      cancelText: 'Keep Order',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await api.cancelOrder(order.id, 'Customer requested cancellation');
      toast.success('Order cancelled successfully');

      // Refresh orders
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === order.id ? { ...o, status: 'cancelled' as OrderStatus, canCancel: false } : o
        )
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
      console.error('Cancel order error:', error);
    }
  };

  const handleReturnOrder = async (order: OrderHistory) => {
    // Show confirmation dialog with return reason selection
    const confirmed = await dialog.showConfirm({
      title: 'Return Order Items',
      message: `You are about to initiate a return for order #${order.orderNumber}. This will create a return request for review. Do you want to continue?`,
      confirmText: 'Request Return',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (!confirmed) return;

    try {
      // Request return through the API
      await api.requestReturn(order.id, {
        reason: 'Customer requested return',
        itemIds: order.items.map(item => item.id),
      });

      toast.success('Return request submitted', {
        description: 'We will review your request and email you within 24-48 hours.',
      });

      // Update order status locally
      setOrders(prevOrders =>
        prevOrders.map(o =>
          o.id === order.id ? { ...o, canReturn: false } : o
        )
      );
    } catch (error: any) {
      console.error('Return order error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit return request';
      toast.error('Failed to request return', {
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <BreadcrumbNavigation
            items={[
              { label: 'My Account', href: '/profile' },
              { label: 'My Orders' },
            ]}
          />

          {/* Hero Section */}
          <div className="mt-6 mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-2">My Orders</h1>
            <p className="text-text-secondary">
              Track, manage, and review your orders
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-text-primary">
                        {statistics.totalOrders}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Active Orders</p>
                      <p className="text-3xl font-bold text-text-primary">
                        {statistics.activeOrders}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Total Spent (2025)</p>
                      <p className="text-3xl font-bold text-text-primary">
                        {formatPrice(statistics.totalSpentThisYear)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Pending Returns</p>
                      <p className="text-3xl font-bold text-text-primary">
                        {statistics.pendingReturns}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <RotateCcw className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div>
            {/* Main Content - Orders List */}
            <div>
              <Card>
                <CardContent className="p-6">
                  {/* Filter Tabs */}
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="w-full mb-6 overflow-x-auto flex-wrap h-auto">
                      <TabsTrigger value="all" className="flex items-center gap-2">
                        All Orders
                        <Badge variant="secondary" className="ml-1">
                          {statistics.totalOrders}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="processing" className="flex items-center gap-2">
                        Processing
                      </TabsTrigger>
                      <TabsTrigger value="shipped" className="flex items-center gap-2">
                        Shipped
                      </TabsTrigger>
                      <TabsTrigger value="delivered" className="flex items-center gap-2">
                        Delivered
                      </TabsTrigger>
                      <TabsTrigger value="cancelled" className="flex items-center gap-2">
                        Cancelled
                      </TabsTrigger>
                    </TabsList>

                    {/* Search and Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Search Bar */}
                      <div className="md:col-span-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                          <Input
                            type="text"
                            placeholder={t('common.placeholders.searchOrders')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Date Range Filter */}
                      <div className="md:col-span-1">
                        <Select value={dateRange} onValueChange={setDateRange}>
                          <SelectTrigger>
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder={t('common.placeholders.dateRange')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last_30_days">Last 30 days</SelectItem>
                            <SelectItem value="last_6_months">Last 6 months</SelectItem>
                            <SelectItem value="this_year">This year</SelectItem>
                            <SelectItem value="all_time">All time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort By */}
                      <div className="md:col-span-1">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder={t('common.placeholders.sortBy')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="most_recent">Most Recent</SelectItem>
                            <SelectItem value="oldest_first">Oldest First</SelectItem>
                            <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                            <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <TabsContent value={activeTab} className="mt-0">
                      {/* Loading State */}
                      {isLoading ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 border-4 border-primary-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-text-secondary">Loading your orders...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-text-primary mb-2">
                            Failed to load orders
                          </h3>
                          <p className="text-text-secondary mb-6">
                            {error}
                          </p>
                          <Button onClick={() => window.location.reload()}>
                            Try Again
                          </Button>
                        </div>
                      ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-text-primary mb-2">
                            No orders found
                          </h3>
                          <p className="text-text-secondary mb-6">
                            {searchQuery
                              ? 'Try adjusting your search or filters'
                              : 'Start shopping to see your orders here'}
                          </p>
                          <Link to="/products">
                            <Button>Start Shopping</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence mode="popLayout">
                            {paginatedOrders.map((order, index) => {
                              const config = statusConfig[order.status] || defaultStatusConfig;
                              const isExpanded = expandedOrder === order.id;

                              return (
                                <motion.div
                                  key={order.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                >
                                  {/* Order Card Header */}
                                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                      <div className="flex items-center gap-4">
                                        <div>
                                          <p className="text-sm text-text-secondary">Order Number</p>
                                          <p className="font-semibold text-text-primary">
                                            {order.orderNumber}
                                          </p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-300" />
                                        <div>
                                          <p className="text-sm text-text-secondary">Order Date</p>
                                          <p className="font-medium text-text-primary">
                                            {formatDate(order.orderDate)}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <div
                                          className={cn(
                                            'flex items-center gap-2 px-3 py-1.5 rounded-full border',
                                            config.bgColor
                                          )}
                                        >
                                          <config.icon className={cn('w-4 h-4', config.color)} />
                                          <span className={cn('text-sm font-medium', config.color)}>
                                            {config.label}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-text-secondary">Total</p>
                                          <p className="font-bold text-text-primary">
                                            {formatPrice(order.total)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Delivery Info */}
                                    {order.estimatedDelivery && (
                                      <div className="mt-3 flex items-center gap-2 text-sm">
                                        <Truck className="w-4 h-4 text-green-600" />
                                        <span className="text-text-secondary">
                                          Estimated Delivery:
                                        </span>
                                        <span className="font-medium text-green-600">
                                          {formatDate(order.estimatedDelivery)}
                                        </span>
                                      </div>
                                    )}
                                    {order.deliveryDate && (
                                      <div className="mt-3 flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-text-secondary">Delivered on:</span>
                                        <span className="font-medium text-green-600">
                                          {formatDate(order.deliveryDate)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Order Items Preview */}
                                  <div className="p-4">
                                    <div className="flex items-center gap-4 flex-wrap">
                                      {/* Product Images Grid */}
                                      <div className="flex gap-2">
                                        {order.items.slice(0, 4).map((item, itemIdx) => {
                                          // Handle both formats: item.product.images or item.productImage
                                          const imageUrl = item.product?.images?.[0] || item.productImage || '/placeholder-product.png';
                                          const productName = item.product?.name || item.productName || 'Product';
                                          return (
                                            <div
                                              key={item.id || `${order.id}-item-${itemIdx}`}
                                              className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                                            >
                                              <img
                                                src={imageUrl}
                                                alt={productName}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          );
                                        })}
                                        {order.items.length > 4 && (
                                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-text-secondary">
                                              +{order.items.length - 4}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Items Summary */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-secondary mb-1">
                                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                        </p>
                                        <p className="font-medium text-text-primary truncate">
                                          {order.items[0]?.product?.name || order.items[0]?.productName || 'Product'}
                                          {order.items.length > 1 && ` and ${order.items.length - 1} more`}
                                        </p>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex flex-wrap gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => toggleOrderExpand(order.id)}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          {isExpanded ? 'Hide Details' : 'View Details'}
                                        </Button>

                                        {order.trackingNumber && (
                                          <Link to={`/track-order?number=${order.trackingNumber}`}>
                                            <Button variant="outline" size="sm">
                                              <MapPin className="w-4 h-4 mr-2" />
                                              Track
                                            </Button>
                                          </Link>
                                        )}

                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleBuyAgain(order)}
                                        >
                                          <ShoppingBag className="w-4 h-4 mr-2" />
                                          Buy Again
                                        </Button>

                                        {order.invoiceUrl && (
                                          <a href={order.invoiceUrl} download>
                                            <Button variant="outline" size="sm">
                                              <Download className="w-4 h-4 mr-2" />
                                              Invoice
                                            </Button>
                                          </a>
                                        )}

                                        {order.canCancel && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelOrder(order)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                          </Button>
                                        )}

                                        {order.canReturn && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReturnOrder(order)}
                                          >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Return
                                          </Button>
                                        )}

                                        {order.canReview && (
                                          <Button variant="default" size="sm">
                                            <Star className="w-4 h-4 mr-2" />
                                            Review
                                          </Button>
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
                                          <div className="mt-6 pt-6 border-t border-gray-200">
                                            {/* All Order Items */}
                                            <div className="mb-6">
                                              <h4 className="font-semibold text-text-primary mb-4">
                                                Order Items
                                              </h4>
                                              <div className="space-y-4">
                                                {order.items.map((item, itemIdx) => {
                                                  // Handle both formats: nested product or flat structure
                                                  const imageUrl = item.product?.images?.[0] || item.productImage || '/placeholder-product.png';
                                                  const productName = item.product?.name || item.productName || 'Product';
                                                  const productId = item.product?.id || item.productId;
                                                  const productBrand = item.product?.brand || item.shopName || '';
                                                  const itemSize = item.size || item.variant?.size || '';
                                                  const itemColor = item.color || item.variant?.color || '';

                                                  return (
                                                    <div
                                                      key={item.id || `${order.id}-detail-${itemIdx}`}
                                                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                                                    >
                                                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                                        <img
                                                          src={imageUrl}
                                                          alt={productName}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      </div>
                                                      <div className="flex-1">
                                                        <Link
                                                          to={`/product/${productId}`}
                                                          className="font-semibold text-text-primary hover:text-primary-lime"
                                                        >
                                                          {productName}
                                                        </Link>
                                                        {productBrand && (
                                                          <p className="text-sm text-text-secondary mt-1">
                                                            {productBrand}
                                                          </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                                          {itemSize && (
                                                            <span className="text-text-secondary">
                                                              Size: <span className="font-medium">{itemSize}</span>
                                                            </span>
                                                          )}
                                                          <span className="text-text-secondary">
                                                            Qty: <span className="font-medium">{item.quantity}</span>
                                                          </span>
                                                          {itemColor && (
                                                            <div className="flex items-center gap-2">
                                                              <span className="text-text-secondary">Color:</span>
                                                              <div
                                                                className="w-5 h-5 rounded-full border-2 border-gray-200"
                                                                style={{ backgroundColor: itemColor }}
                                                              />
                                                            </div>
                                                          )}
                                                        </div>
                                                      </div>
                                                      <div className="text-right">
                                                        <p className="font-bold text-text-primary">
                                                          {formatPrice((item.price || item.subtotal || 0) * (item.subtotal ? 1 : item.quantity))}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>

                                            {/* Order Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              {/* Shipping Address */}
                                              <div>
                                                <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                                                  <MapPin className="w-4 h-4" />
                                                  Shipping Address
                                                </h4>
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                                                  <p className="text-text-secondary mt-1">
                                                    {order.shippingAddress.addressLine1}
                                                  </p>
                                                  {order.shippingAddress.addressLine2 && (
                                                    <p className="text-text-secondary">
                                                      {order.shippingAddress.addressLine2}
                                                    </p>
                                                  )}
                                                  <p className="text-text-secondary">
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                                                    {order.shippingAddress.zipCode}
                                                  </p>
                                                  <p className="text-text-secondary">
                                                    {order.shippingAddress.country}
                                                  </p>
                                                  <p className="text-text-secondary mt-2">
                                                    {order.shippingAddress.phone}
                                                  </p>
                                                </div>
                                              </div>

                                              {/* Payment & Summary */}
                                              <div>
                                                <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                                                  <CreditCard className="w-4 h-4" />
                                                  Payment Information
                                                </h4>
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                                  <div className="flex justify-between">
                                                    <span className="text-text-secondary">Payment Method</span>
                                                    <span className="font-medium">
                                                      {getPaymentMethodLabel(order.paymentMethod)}
                                                      {order.lastFourDigits && ` •••• ${order.lastFourDigits}`}
                                                    </span>
                                                  </div>
                                                  <div className="border-t border-gray-200 pt-2 mt-2" />
                                                  <div className="flex justify-between">
                                                    <span className="text-text-secondary">Subtotal</span>
                                                    <span>{formatPrice(order.subtotal)}</span>
                                                  </div>
                                                  {order.discount > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                      <span>Discount</span>
                                                      <span>-{formatPrice(order.discount)}</span>
                                                    </div>
                                                  )}
                                                  <div className="flex justify-between">
                                                    <span className="text-text-secondary">Shipping</span>
                                                    <span>
                                                      {(order.shipping ?? 0) === 0 ? 'Free' : formatPrice(order.shipping ?? 0)}
                                                    </span>
                                                  </div>
                                                  <div className="flex justify-between">
                                                    <span className="text-text-secondary">Tax</span>
                                                    <span>{formatPrice(order.tax || 0)}</span>
                                                  </div>
                                                  <div className="border-t border-gray-200 pt-2 mt-2" />
                                                  <div className="flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-primary-lime">
                                                      {formatPrice(order.total)}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Order Timeline */}
                                            {order.timeline && order.timeline.length > 0 && (
                                              <div className="mt-6">
                                                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                                                  <Clock className="w-4 h-4" />
                                                  Order Timeline
                                                </h4>
                                                <div className="relative">
                                                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                                                  <div className="space-y-4">
                                                    {order.timeline.map((event, eventIdx) => {
                                                      const eventConfig = statusConfig[event.status] || defaultStatusConfig;
                                                      return (
                                                        <div key={event.id || `${order.id}-event-${eventIdx}`} className="relative flex gap-4 pl-10">
                                                          <div
                                                            className={cn(
                                                              'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white',
                                                              eventIdx === 0
                                                                ? 'border-primary-lime'
                                                                : 'border-gray-300'
                                                            )}
                                                          >
                                                            <eventConfig.icon
                                                              className={cn(
                                                                'w-4 h-4',
                                                                eventIdx === 0 ? 'text-primary-lime' : 'text-gray-400'
                                                              )}
                                                            />
                                                          </div>
                                                          <div className="flex-1 pb-4">
                                                            <div className="flex items-start justify-between">
                                                              <div>
                                                                <p className="font-semibold text-text-primary">
                                                                  {event.title}
                                                                </p>
                                                                <p className="text-sm text-text-secondary mt-1">
                                                                  {event.description}
                                                                </p>
                                                                {event.location && (
                                                                  <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {event.location}
                                                                  </p>
                                                                )}
                                                              </div>
                                                              <p className="text-sm text-text-secondary whitespace-nowrap">
                                                                {formatDate(event.timestamp)}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Contact Support */}
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                              <Link to="/contact">
                                                <Button variant="outline" className="w-full">
                                                  <HelpCircle className="w-4 h-4 mr-2" />
                                                  Contact Support About This Order
                                                </Button>
                                              </Link>
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
                            <div className="mt-8 flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              >
                                Previous
                              </Button>

                              <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="min-w-[40px]"
                                  >
                                    {page}
                                  </Button>
                                ))}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </>
  );
};

export default OrdersPage;

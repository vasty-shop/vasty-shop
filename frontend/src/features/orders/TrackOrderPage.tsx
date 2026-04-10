import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Search,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MessageSquare,
  Share2,
  Bell,
  BellOff,
  Copy,
  Check,
  Phone,
  HelpCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { useDeliveryLocationTracking } from '@/hooks/useDeliveryLocationTracking';
import { SEO } from '@/components/seo';

// Lazy load the map component
const LiveDeliveryMap = lazy(() => import('@/components/maps/LiveDeliveryMap'));

// Types
interface TrackingUpdate {
  date: string;
  time: string;
  status: string;
  location?: string;
  description: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface DeliveryManInfo {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  rating: number;
  totalDeliveries: number;
  vehicleType?: string;
  vehicleNumber?: string;
  status: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

interface OrderData {
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  carrierUrl: string;
  currentStatus: number; // 0-4 representing the 5 stages
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  trackingHistory: TrackingUpdate[];
  totalAmount: number;
  shippingMethod: string;
  deliveryMan?: DeliveryManInfo;
}

// Order tracking stages - 5 simple stages
const TRACKING_STAGES = [
  { id: 0, label: 'Order Placed', icon: CheckCircle2, status: 'order_placed' },
  { id: 1, label: 'Confirmed', icon: CheckCircle2, status: 'confirmed' },
  { id: 2, label: 'Assigned', icon: Package, status: 'assigned' },
  { id: 3, label: 'Shipped', icon: Truck, status: 'shipped' },
  { id: 4, label: 'Delivered', icon: CheckCircle2, status: 'delivered' },
];

// Status to stage mapping for progress bar
const STATUS_TO_STAGE: Record<string, number> = {
  pending: 0,
  order_placed: 0,
  processing: 1,
  confirmed: 1,
  assigned: 2,
  accepted: 2,
  picked_up: 3,
  shipped: 3,
  in_transit: 3,
  on_the_way: 3,
  out_for_delivery: 3,
  delivered: 4,
};

/**
 * Track Order Page Component
 * Comprehensive order tracking page with search, timeline, and detailed order information
 * Based on research from Amazon, FedEx, UPS, DHL, and Shopify stores
 */
export const TrackOrderPage: React.FC = () => {
  // SEO: noindex for user-specific page
  const seoElement = <SEO title="Track Order" noIndex={true} />;

  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dialog = useDialog();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('number') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delivery location tracking
  const {
    currentLocation: deliveryLocation,
    eta: deliveryEta,
    isTracking,
    startTracking,
    stopTracking,
  } = useDeliveryLocationTracking({
    orderId: orderData?.orderNumber,
    deliveryManId: orderData?.deliveryMan?.id,
  });

  // Start tracking when order is in shipping/delivery state
  useEffect(() => {
    if (orderData && orderData.currentStatus >= 2 && orderData.currentStatus < 4 && orderData.deliveryMan) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [orderData, startTracking, stopTracking]);

  // Auto-search if tracking number in URL
  useEffect(() => {
    const trackingNumber = searchParams.get('number');
    if (trackingNumber && !orderData) {
      setSearchQuery(trackingNumber);
      handleSearchInternal(trackingNumber);
    }
  }, [searchParams]);

  // Handle order search
  const handleSearchInternal = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter an order number or tracking ID');
      return;
    }

    setIsSearching(true);

    try {
      // Try to fetch order by tracking number
      const order = await api.trackOrder(query.trim());

      // Map API response to OrderData format
      const mappedOrder: OrderData = {
        orderNumber: order.orderNumber || order.id,
        orderDate: new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        estimatedDelivery: order.estimatedDelivery
          ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'TBD',
        carrier: order.carrier || 'Standard Shipping',
        trackingNumber: order.trackingNumber || query,
        carrierUrl: order.carrierUrl || `https://www.fedex.com/fedextrack/?tracknumbers=${query}`,
        currentStatus: mapStatusToStage(order.status, order.deliveryMan?.status),
        shippingAddress: {
          name: order.shippingAddress?.fullName || '',
          street: order.shippingAddress?.addressLine1 || '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          zip: order.shippingAddress?.zipCode || '',
          country: order.shippingAddress?.country || '',
        },
        items: order.items?.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          name: item.product?.name || item.name || 'Product',
          image: item.product?.images?.[0] || item.image || '/placeholder-product.png',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          size: item.size,
          color: item.color,
        })) || [],
        // Filter to unique events by status and map to display format
        trackingHistory: (order.timeline || [])
          .filter((event: any, index: number, self: any[]) =>
            // Keep only the first occurrence of each status
            index === self.findIndex((e: any) => e.status === event.status)
          )
          .map((event: any) => ({
            date: event.timestamp ? new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
            time: event.timestamp ? new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
            status: event.title || event.status,
            location: event.location || '',
            description: event.description || '',
          })),
        totalAmount: Number(order.total) || 0,
        shippingMethod: order.deliveryMethod || 'Standard Shipping',
        deliveryMan: order.deliveryMan ? {
          id: order.deliveryMan.id,
          name: order.deliveryMan.name || '',
          firstName: order.deliveryMan.firstName || '',
          lastName: order.deliveryMan.lastName || '',
          phone: order.deliveryMan.phone,
          avatar: order.deliveryMan.avatar,
          rating: Number(order.deliveryMan.rating) || 0,
          totalDeliveries: Number(order.deliveryMan.totalDeliveries) || 0,
          vehicleType: order.deliveryMan.vehicleType,
          vehicleNumber: order.deliveryMan.vehicleNumber,
          status: order.deliveryMan.status || 'assigned',
          assignedAt: order.deliveryMan.assignedAt,
          pickedUpAt: order.deliveryMan.pickedUpAt,
          deliveredAt: order.deliveryMan.deliveredAt,
        } : undefined,
      };

      setOrderData(mappedOrder);
      toast.success('Order found!');
    } catch (error: any) {
      console.error('Track order error:', error);
      toast.error(error.message || 'Order not found. Please check your tracking number.');
      setOrderData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchInternal(searchQuery);
  };

  // Map order status to tracking stage (0-4)
  const mapStatusToStage = (status: string, deliveryManStatus?: string): number => {
    // If delivery man has a more specific status, use that
    if (deliveryManStatus) {
      const dmStatus = deliveryManStatus.toLowerCase();
      if (dmStatus === 'delivered') return 4;
      if (['on_the_way', 'picked_up', 'out_for_delivery'].includes(dmStatus)) return 3;
      if (['accepted', 'assigned'].includes(dmStatus)) return 2;
    }

    const statusMap: Record<string, number> = {
      pending: 0,
      order_placed: 0,
      processing: 1,
      confirmed: 1,
      assigned: 2,
      accepted: 2,
      picked_up: 3,
      shipped: 3,
      in_transit: 3,
      on_the_way: 3,
      out_for_delivery: 3,
      delivered: 4,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  // Copy tracking number
  const handleCopyTracking = () => {
    if (orderData) {
      navigator.clipboard.writeText(orderData.trackingNumber);
      setCopied(true);
      toast.success('Tracking number copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share tracking link
  const handleShare = async () => {
    if (orderData) {
      const shareData = {
        title: `Order ${orderData.orderNumber}`,
        text: `Track my order: ${orderData.orderNumber}`,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          toast.success('Shared successfully!');
        } catch (err) {
          // Share cancelled
        }
      } else {
        // Fallback: copy link
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  // Toggle notifications
  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      notificationsEnabled
        ? 'Notifications disabled'
        : 'Notifications enabled! You will receive updates via email and SMS.'
    );
  };

  // Breadcrumb items
  const breadcrumbItems = [{ label: 'Track Order' }];

  return (
    <>
      {seoElement}
      <div className="min-h-screen bg-gray-50">
        <Header />

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <BreadcrumbNavigation items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-lime via-green-400 to-emerald-500 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Track Your Order
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Enter your order number or tracking ID to see real-time updates
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-xl">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('common.placeholders.enterOrderNumber')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 border-0 focus-visible:ring-0 text-base"
                      disabled={isSearching}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 text-base font-semibold whitespace-nowrap"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Track Order
                      </>
                    )}
                  </Button>
                </div>

                {/* Example */}
                <p className="text-white/70 text-sm mt-4">
                  Example: <span className="font-medium">FL-2024-12345</span>
                </p>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Order Tracking Display */}
      <AnimatePresence mode="wait">
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 md:py-12"
          >
            {/* Progress Timeline */}
            <Card className="mb-8 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Order Status
                </h2>

                {/* Desktop Timeline */}
                <div className="hidden md:block">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
                      <motion.div
                        className="h-full bg-primary-lime"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(orderData.currentStatus / (TRACKING_STAGES.length - 1)) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>

                    {/* Stages */}
                    <div className="relative flex justify-between">
                      {TRACKING_STAGES.map((stage, index) => {
                        const isCompleted = index <= orderData.currentStatus;
                        const isCurrent = index === orderData.currentStatus;
                        const Icon = stage.icon;

                        return (
                          <motion.div
                            key={stage.id}
                            className="flex flex-col items-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            {/* Icon Circle */}
                            <div
                              className={cn(
                                'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative z-10',
                                isCompleted
                                  ? isCurrent
                                    ? 'bg-primary-lime text-white shadow-lg shadow-primary-lime/30 animate-pulse'
                                    : 'bg-primary-lime text-white'
                                  : 'bg-gray-200 text-gray-400'
                              )}
                            >
                              <Icon className="w-8 h-8" />
                            </div>

                            {/* Label */}
                            <p
                              className={cn(
                                'mt-3 text-sm font-medium text-center max-w-[120px]',
                                isCompleted ? 'text-text-primary' : 'text-text-secondary'
                              )}
                            >
                              {stage.label}
                            </p>

                            {/* Checkmark for completed */}
                            {isCompleted && !isCurrent && (
                              <motion.div
                                className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                              >
                                <Check className="w-3 h-3" />
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden space-y-4">
                  {TRACKING_STAGES.map((stage, index) => {
                    const isCompleted = index <= orderData.currentStatus;
                    const isCurrent = index === orderData.currentStatus;
                    const Icon = stage.icon;

                    return (
                      <motion.div
                        key={stage.id}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                            isCompleted
                              ? isCurrent
                                ? 'bg-primary-lime text-white animate-pulse'
                                : 'bg-primary-lime text-white'
                              : 'bg-gray-200 text-gray-400'
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* Label */}
                        <div className="flex-1">
                          <p
                            className={cn(
                              'font-medium',
                              isCompleted ? 'text-text-primary' : 'text-text-secondary'
                            )}
                          >
                            {stage.label}
                          </p>
                        </div>

                        {/* Status */}
                        {isCompleted && (
                          <div className="text-green-600">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Details & Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Details Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-text-primary mb-1">
                          Order Details
                        </h2>
                        <p className="text-text-secondary">
                          Order #{orderData.orderNumber}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleShare}
                          title="Share tracking link"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleToggleNotifications}
                          title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                        >
                          {notificationsEnabled ? (
                            <Bell className="w-4 h-4 text-primary-lime" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Date */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Order Date</p>
                          <p className="font-semibold text-text-primary">
                            {orderData.orderDate}
                          </p>
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Estimated Delivery</p>
                          <p className="font-bold text-xl text-primary-lime">
                            {orderData.estimatedDelivery}
                          </p>
                        </div>
                      </div>

                      {/* Carrier */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Carrier</p>
                          <p className="font-semibold text-text-primary">
                            {orderData.carrier}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {orderData.shippingMethod}
                          </p>
                        </div>
                      </div>

                      {/* Tracking Number */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-secondary">Tracking Number</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-mono font-semibold text-text-primary truncate">
                              {orderData.trackingNumber}
                            </p>
                            <button
                              onClick={handleCopyTracking}
                              className="text-primary-lime hover:text-primary-lime-dark transition-colors"
                              title="Copy tracking number"
                            >
                              {copied ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <a
                            href={orderData.carrierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary-lime hover:text-primary-lime-dark mt-2 font-medium"
                          >
                            Track on {orderData.carrier}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items in Order */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4">
                      Items in Order ({orderData.items.length})
                    </h3>

                    <div className="space-y-4">
                      {orderData.items.map((item) => (
                        <motion.div
                          key={item.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {/* Product Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-text-primary mb-1 truncate">
                              {item.name}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-sm text-text-secondary mb-2">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>• Color: {item.color}</span>}
                              <span>• Qty: {item.quantity}</span>
                            </div>
                            <p className="font-bold text-text-primary">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-text-primary">
                          Order Total
                        </span>
                        <span className="text-2xl font-bold text-primary-lime">
                          ${orderData.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Updates Timeline */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4">
                      Delivery Updates
                    </h3>

                    <div className="space-y-4">
                      {orderData.trackingHistory.map((update, index) => (
                        <motion.div
                          key={index}
                          className="relative pl-8 pb-4 last:pb-0"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          {/* Timeline Line */}
                          {index !== orderData.trackingHistory.length - 1 && (
                            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200" />
                          )}

                          {/* Timeline Dot */}
                          <div
                            className={cn(
                              'absolute left-0 top-1 w-4 h-4 rounded-full border-2',
                              index === 0
                                ? 'bg-primary-lime border-primary-lime'
                                : 'bg-white border-gray-300'
                            )}
                          />

                          {/* Update Content */}
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-text-primary">
                                {update.status}
                              </h4>
                              <span className="text-sm text-text-secondary whitespace-nowrap">
                                {update.date}, {update.time}
                              </span>
                            </div>
                            {update.location && (
                              <p className="text-sm text-text-secondary mb-1">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {update.location}
                              </p>
                            )}
                            <p className="text-sm text-text-secondary">
                              {update.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Shipping Address & Support */}
              <div className="space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-lime" />
                      Shipping Address
                    </h3>

                    <div className="space-y-2 text-text-secondary">
                      <p className="font-semibold text-text-primary">
                        {orderData.shippingAddress.name}
                      </p>
                      <p>{orderData.shippingAddress.street}</p>
                      <p>
                        {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{' '}
                        {orderData.shippingAddress.zip}
                      </p>
                      <p>{orderData.shippingAddress.country}</p>
                    </div>

                    {/* Live Delivery Map */}
                    <div className="mt-4">
                      <Suspense fallback={
                        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-primary-lime mx-auto mb-2 animate-spin" />
                            <p className="text-sm text-text-secondary">{t('tracking.loadingMap', { defaultValue: 'Loading map...' })}</p>
                          </div>
                        </div>
                      }>
                        <LiveDeliveryMap
                          deliveryLocation={deliveryLocation ? {
                            lat: deliveryLocation.lat,
                            lng: deliveryLocation.lng,
                            timestamp: deliveryLocation.timestamp,
                            address: deliveryLocation.address,
                          } : null}
                          destinationLocation={{
                            lat: 23.8103, // TODO: Get from actual address geocoding
                            lng: 90.4125,
                            address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}`,
                          }}
                          deliveryPerson={orderData.deliveryMan ? {
                            name: `${orderData.deliveryMan.firstName} ${orderData.deliveryMan.lastName}`,
                            phone: orderData.deliveryMan.phone,
                            avatar: orderData.deliveryMan.avatar,
                            vehicleType: orderData.deliveryMan.vehicleType,
                            vehicleNumber: orderData.deliveryMan.vehicleNumber,
                          } : undefined}
                          eta={deliveryEta ? {
                            distance: deliveryEta.distance,
                            duration: deliveryEta.duration,
                          } : undefined}
                          isLive={isTracking && !!deliveryLocation}
                          height="280px"
                          onCallDelivery={() => {
                            if (orderData.deliveryMan?.phone) {
                              window.location.href = `tel:${orderData.deliveryMan.phone}`;
                            }
                          }}
                        />
                      </Suspense>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Man Info */}
                {orderData.deliveryMan && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary-lime" />
                        Your Delivery Partner
                      </h3>

                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {orderData.deliveryMan.avatar ? (
                            <img
                              src={orderData.deliveryMan.avatar}
                              alt={orderData.deliveryMan.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {orderData.deliveryMan.firstName?.charAt(0) || orderData.deliveryMan.name?.charAt(0) || 'D'}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-primary text-lg">
                            {orderData.deliveryMan.firstName} {orderData.deliveryMan.lastName}
                          </h4>

                          {/* Rating & Deliveries */}
                          <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              ⭐ {orderData.deliveryMan.rating.toFixed(1)}
                            </span>
                            <span>
                              {orderData.deliveryMan.totalDeliveries} deliveries
                            </span>
                          </div>

                          {/* Vehicle Info */}
                          {orderData.deliveryMan.vehicleType && (
                            <p className="text-sm text-text-secondary mt-1">
                              {orderData.deliveryMan.vehicleType}
                              {orderData.deliveryMan.vehicleNumber && ` • ${orderData.deliveryMan.vehicleNumber}`}
                            </p>
                          )}

                          {/* Status Badge */}
                          <div className="mt-2">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              orderData.deliveryMan.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : orderData.deliveryMan.status === 'picked_up' || orderData.deliveryMan.status === 'on_the_way'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            )}>
                              {orderData.deliveryMan.status === 'delivered' ? 'Delivered' :
                               orderData.deliveryMan.status === 'picked_up' ? 'Picked Up' :
                               orderData.deliveryMan.status === 'on_the_way' ? 'On The Way' :
                               orderData.deliveryMan.status === 'accepted' ? 'Order Accepted' :
                               'Assigned'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Button */}
                      {orderData.deliveryMan.phone && (
                        <a
                          href={`tel:${orderData.deliveryMan.phone}`}
                          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary-lime text-white rounded-lg hover:bg-primary-lime/90 transition-colors font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          Call Delivery Partner
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Contact Support */}
                <Card className="bg-gradient-to-br from-primary-lime/10 to-green-50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      Need Help?
                    </h3>
                    <p className="text-text-secondary mb-4 text-sm">
                      Our customer service team is here to help with any questions about
                      your order.
                    </p>

                    <div className="space-y-3">
                      <Link to="/contact">
                        <Button className="w-full" size="lg">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Customer Service
                        </Button>
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <a href="tel:1-800-358-9391" className="block">
                          <Button variant="outline" size="sm" className="w-full">
                            <Phone className="w-4 h-4 mr-1" />
                            Call Us
                          </Button>
                        </a>

                        <a href="mailto:support@vasty.shop" className="block">
                          <Button variant="outline" size="sm" className="w-full">
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        </a>
                      </div>

                      <Link to="/faq">
                        <Button variant="ghost" className="w-full text-sm">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Visit FAQ
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Section (shown when no order is displayed) */}
      {!orderData && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
              How to Track Your Order
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-white rounded-xl p-6 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-primary-lime/10 rounded-full flex items-center justify-center text-primary-lime mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">1. Enter Your Details</h3>
                <p className="text-text-secondary text-sm">
                  Enter your order number (found in your confirmation email) or tracking ID
                  in the search box above.
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl p-6 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-primary-lime/10 rounded-full flex items-center justify-center text-primary-lime mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">2. View Status</h3>
                <p className="text-text-secondary text-sm">
                  See real-time updates on your order's journey from our warehouse to your
                  doorstep.
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl p-6 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-primary-lime/10 rounded-full flex items-center justify-center text-primary-lime mb-4">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">3. Get Notifications</h3>
                <p className="text-text-secondary text-sm">
                  Enable notifications to receive updates via email and SMS throughout the
                  delivery process.
                </p>
              </motion.div>
            </div>

            {/* FAQ Quick Links */}
            <div className="mt-12 bg-white rounded-xl p-6 shadow-card">
              <h3 className="font-bold text-xl mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <Link
                  to="/faq#track-order"
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-text-primary group-hover:text-primary-lime">
                    Where can I find my order number?
                  </span>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary-lime" />
                </Link>
                <Link
                  to="/faq#shipping"
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-text-primary group-hover:text-primary-lime">
                    How long does shipping take?
                  </span>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary-lime" />
                </Link>
                <Link
                  to="/faq#change-order"
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-text-primary group-hover:text-primary-lime">
                    Can I change my shipping address?
                  </span>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary-lime" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-text-primary group-hover:text-primary-lime">
                    Need more help? Contact Support
                  </span>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary-lime" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
      </div>
    </>
  );
};

export default TrackOrderPage;

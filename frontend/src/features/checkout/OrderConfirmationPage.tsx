import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Package, MapPin, Mail, Phone, Calendar, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import type { ShippingAddress, DeliveryMethod, CartItem } from '@/types';

interface LocationState {
  orderNumber: string;
  orderId?: string;
  shippingInfo: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  items: CartItem[];
  total?: number;
}

const deliveryDays: Record<DeliveryMethod, number> = {
  standard: 7,
  express: 3,
  overnight: 1,
};

export const OrderConfirmationPage: React.FC = () => {
  const dialog = useDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as LocationState | null;
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [state, setState] = useState<LocationState | null>(locationState);

  useEffect(() => {
    const initializePage = async () => {
      // Check for session_id from Stripe Checkout redirect
      const sessionId = searchParams.get('session_id');

      // If we have a session_id, we're coming back from Stripe Checkout
      if (sessionId) {
        console.log('[Confirmation] Stripe Checkout session_id detected:', sessionId);

        // Load pending order info from localStorage
        const pendingOrderStr = localStorage.getItem('pending-order');
        if (pendingOrderStr) {
          try {
            const pendingOrder = JSON.parse(pendingOrderStr);
            console.log('[Confirmation] Loaded pending order:', pendingOrder);

            // Set state from localStorage
            setState({
              orderNumber: pendingOrder.orderNumber,
              orderId: pendingOrder.orderId,
              shippingInfo: pendingOrder.shippingInfo,
              deliveryMethod: pendingOrder.deliveryMethod,
              items: pendingOrder.items || [],
              total: pendingOrder.total,
            });

            // Confirm payment with backend
            setIsConfirmingPayment(true);
            try {
              console.log('[Confirmation] Calling confirm-payment endpoint...');
              const response = await apiClient.post(`/orders/${pendingOrder.orderId}/confirm-payment`, {
                sessionId: sessionId,
              });
              console.log('[Confirmation] Payment confirmed:', response.data);
              setPaymentConfirmed(true);
              toast.success('Payment confirmed successfully!');

              // Clear the pending order from localStorage
              localStorage.removeItem('pending-order');

              // Fetch updated order details
              const order = await api.getOrder(pendingOrder.orderId);
              setOrderDetails(order);
            } catch (error: any) {
              console.error('[Confirmation] Failed to confirm payment:', error);
              toast.error(error.response?.data?.message || 'Failed to confirm payment');
            } finally {
              setIsConfirmingPayment(false);
            }
          } catch (e) {
            console.error('[Confirmation] Failed to parse pending order:', e);
          }
        } else {
          console.log('[Confirmation] No pending order found in localStorage');
        }
      } else if (!locationState?.orderNumber) {
        // No session_id and no location state - check localStorage
        const pendingOrderStr = localStorage.getItem('pending-order');
        if (pendingOrderStr) {
          try {
            const pendingOrder = JSON.parse(pendingOrderStr);
            setState({
              orderNumber: pendingOrder.orderNumber,
              orderId: pendingOrder.orderId,
              shippingInfo: pendingOrder.shippingInfo,
              deliveryMethod: pendingOrder.deliveryMethod,
              items: pendingOrder.items || [],
              total: pendingOrder.total,
            });
          } catch (e) {
            console.error('[Confirmation] Failed to parse pending order:', e);
            navigate('/');
            return;
          }
        } else {
          // No data available, redirect to home
          navigate('/');
          return;
        }
      }
    };

    initializePage();
  }, [searchParams, locationState, navigate]);

  // Fetch order details when state is available
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (state?.orderId && !orderDetails && !isConfirmingPayment) {
        setIsLoading(true);
        try {
          const order = await api.getOrder(state.orderId);
          setOrderDetails(order);
        } catch (error) {
          console.error('Failed to fetch order details:', error);
          // Don't show error toast if we're still in the confirmation flow
          if (!searchParams.get('session_id')) {
            toast.error('Could not load complete order details');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [state, orderDetails, isConfirmingPayment, searchParams]);

  // Trigger confetti animation
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { y: 0.6 },
        colors: ['#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Show loading state while confirming payment
  if (isConfirmingPayment) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary-lime mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Confirming Payment...</h2>
            <p className="text-text-secondary">Please wait while we verify your payment</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!state) {
    return null;
  }

  const orderNumber = state?.orderNumber || '';
  const shippingInfo = state?.shippingInfo || {
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };
  const deliveryMethod = state?.deliveryMethod || '';
  const items = state?.items || [];

  // Use order details from API if available, otherwise use state
  const displayOrderDetails = orderDetails || state;

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    if (displayOrderDetails?.estimatedDelivery) {
      const estDate = new Date(displayOrderDetails.estimatedDelivery);
      if (!isNaN(estDate.getTime())) {
        return estDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }

    // Default to 5-7 days if no delivery method specified
    const days = deliveryDays[deliveryMethod as DeliveryMethod] || 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate totals - use API data if available
  const subtotal = displayOrderDetails.subtotal || items.reduce((total, item) => {
    const price = item.product.salePrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  const shippingCost = displayOrderDetails.shipping || (deliveryMethod === 'standard' ? 0 : deliveryMethod === 'express' ? 15 : 35);
  const tax = displayOrderDetails.tax || (subtotal + shippingCost) * 0.08;
  const total = displayOrderDetails.total || state.total || (subtotal + shippingCost + tax);

  const handleDownloadReceipt = async () => {
    // Mock download functionality
    await dialog.showAlert({
      title: 'Download Receipt',
      message: 'Receipt download functionality will be implemented soon.',
      type: 'info'
    });
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Hero Section */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-text-primary mb-4"
            >
              Order Confirmed!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-text-secondary mb-2"
            >
              Thank you for your purchase
            </motion.p>

            {/* Order Number */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-lime/10 border-2 border-primary-lime rounded-lg mt-4"
            >
              <span className="text-sm font-medium text-text-secondary">Order Number:</span>
              <span className="text-xl font-bold text-primary-lime">{orderNumber}</span>
            </motion.div>

            {/* Email Confirmation Notice */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary"
            >
              <Mail className="w-4 h-4" />
              <span>Confirmation email sent to <strong>{shippingInfo.email}</strong></span>
            </motion.div>
          </motion.div>

          {/* Estimated Delivery */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 mb-8 bg-gradient-to-r from-primary-lime/5 to-green-50 border-primary-lime/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-lime rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Estimated Delivery
                  </h3>
                  <p className="text-2xl font-bold text-primary-lime">
                    {getEstimatedDelivery()}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    We'll send you tracking information once your order ships
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleDownloadReceipt}
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            <Link to="/orders" className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Track Your Order
              </Button>
            </Link>
            <Link to="/products" className="flex-1">
              <Button className="w-full flex items-center justify-center gap-2">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Shipping Address
                </h3>
              </div>
              <div className="text-sm text-text-secondary space-y-1">
                <p className="font-medium text-text-primary">{shippingInfo.fullName}</p>
                <p>{shippingInfo.addressLine1}</p>
                {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
                <p>
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                </p>
                <p>{shippingInfo.country}</p>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Contact Information
                </h3>
              </div>
              <div className="text-sm text-text-secondary space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{shippingInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{shippingInfo.phone}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              Order Items ({items.length})
            </h3>
            <div className="space-y-4">
              {items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary mb-1 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-text-secondary mb-2">
                        {item.product.brand}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">
                          Size: {item.size} • Qty: {item.quantity}
                        </span>
                        <span className="font-semibold text-text-primary">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Shipping</span>
                <span className="font-medium text-text-primary">
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="font-medium text-text-primary">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2">
                <span className="text-lg font-bold text-text-primary">Total Paid</span>
                <span className="text-2xl font-bold text-primary-lime">{formatPrice(total)}</span>
              </div>
            </div>
          </Card>

          {/* What's Next Section */}
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              What happens next?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Order Processing</h4>
                  <p className="text-sm text-text-secondary">
                    We're preparing your order and will send you a confirmation email shortly.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Shipping Notification</h4>
                  <p className="text-sm text-text-secondary">
                    Once shipped, you'll receive tracking information via email.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Delivery</h4>
                  <p className="text-sm text-text-secondary">
                    Your order will arrive by {getEstimatedDelivery()}.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Support */}
          <Card className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Our customer support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline">Visit FAQ</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Footer />

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </>
  );
};

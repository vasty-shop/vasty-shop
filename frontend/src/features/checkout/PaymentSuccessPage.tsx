import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

interface PaymentSuccessState {
  orderNumber?: string;
  orderId?: string;
  email?: string;
  amount?: number;
  paymentMethod?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentSuccessState || {};

  useEffect(() => {
    // If no order information, redirect to home
    if (!state.orderNumber && !state.orderId) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, navigate]);

  const formatAmount = (amount?: number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
      case 'applepay':
        return 'Apple Pay';
      case 'google_pay':
      case 'googlepay':
        return 'Google Pay';
      default:
        return 'Card';
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Order Details</h2>

              <div className="space-y-4">
                {state.orderNumber && (
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-text-secondary">Order Number</span>
                    <span className="font-semibold text-text-primary">{state.orderNumber}</span>
                  </div>
                )}

                {state.orderId && (
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-text-secondary">Order ID</span>
                    <span className="font-mono text-sm text-text-primary">{state.orderId}</span>
                  </div>
                )}

                {state.amount && (
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-text-secondary">Amount Paid</span>
                    <span className="font-semibold text-text-primary text-lg">
                      {formatAmount(state.amount)}
                    </span>
                  </div>
                )}

                {state.paymentMethod && (
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-text-secondary">Payment Method</span>
                    <span className="font-medium text-text-primary">
                      {getPaymentMethodDisplay(state.paymentMethod)}
                    </span>
                  </div>
                )}

                {state.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Confirmation Email</span>
                    <span className="font-medium text-text-primary">{state.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Email Confirmation */}
              <div className="bg-blue-50 rounded-lg p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Email Confirmation</h3>
                    <p className="text-sm text-text-secondary">
                      A confirmation email with order details has been sent to your email address.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Tracking */}
              <div className="bg-purple-50 rounded-lg p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Track Your Order</h3>
                    <p className="text-sm text-text-secondary">
                      You can track your order status anytime from your order history.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/orders">
                <Button size="lg" className="w-full sm:w-auto">
                  <Package className="w-5 h-5 mr-2" />
                  View Order History
                </Button>
              </Link>

              <Link to="/products">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Home Link */}
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-lime transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

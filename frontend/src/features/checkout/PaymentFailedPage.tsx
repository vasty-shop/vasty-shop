import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

interface PaymentFailedState {
  error?: string;
  orderId?: string;
  amount?: number;
  reason?: string;
}

export const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentFailedState || {};

  const handleRetry = () => {
    // Go back to checkout page
    navigate('/checkout', {
      state: {
        retry: true,
        orderId: state.orderId
      }
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getErrorMessage = () => {
    if (state.error) return state.error;
    if (state.reason) return state.reason;
    return 'We were unable to process your payment. Please try again or use a different payment method.';
  };

  const commonReasons = [
    {
      title: 'Insufficient Funds',
      description: 'Make sure your card or account has sufficient balance.',
    },
    {
      title: 'Incorrect Card Details',
      description: 'Verify your card number, expiry date, and CVV are correct.',
    },
    {
      title: 'Bank Declined',
      description: 'Your bank may have declined the transaction for security reasons.',
    },
    {
      title: 'Network Error',
      description: 'A temporary network issue may have occurred. Please try again.',
    },
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-red-600" />
            </motion.div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Payment Failed
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              {getErrorMessage()}
            </p>

            {/* Payment Details Card (if available) */}
            {(state.orderId || state.amount) && (
              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8 text-left">
                <h2 className="text-xl font-semibold text-text-primary mb-4">Payment Details</h2>

                <div className="space-y-4">
                  {state.orderId && (
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-text-secondary">Order ID</span>
                      <span className="font-mono text-sm text-text-primary">{state.orderId}</span>
                    </div>
                  )}

                  {state.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Attempted Amount</span>
                      <span className="font-semibold text-text-primary text-lg">
                        {formatAmount(state.amount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Reasons */}
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-primary-lime" />
                <h2 className="text-xl font-semibold text-text-primary">Common Reasons for Payment Failure</h2>
              </div>

              <div className="grid gap-4">
                {commonReasons.map((reason, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-lime rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">{reason.title}</h3>
                      <p className="text-sm text-text-secondary">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" onClick={handleRetry} className="w-full sm:w-auto">
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>

              <Link to="/cart">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Cart
                </Button>
              </Link>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-text-primary mb-2">Need Help?</h3>
              <p className="text-sm text-text-secondary mb-4">
                If you continue to experience issues, please contact our support team for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="outline" size="sm">Contact Support</Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" size="sm">View FAQ</Button>
                </Link>
              </div>
            </div>

            {/* Home Link */}
            <div>
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

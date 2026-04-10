import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalCheckoutProps {
  clientId: string;
  amount: number;
  currency?: string;
  description?: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  clientId,
  amount,
  currency = 'USD',
  description = 'Payment',
  onSuccess,
  onError,
  onCancel,
  className = '',
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadPayPalScript();
  }, [clientId]);

  useEffect(() => {
    if (scriptLoaded && window.paypal && paypalRef.current) {
      renderPayPalButton();
    }
  }, [scriptLoaded, amount, currency]);

  const loadPayPalScript = () => {
    // Check if script already exists
    const existingScript = document.querySelector('script[data-namespace="paypal"]');
    if (existingScript) {
      if (window.paypal) {
        setScriptLoaded(true);
        setLoading(false);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.setAttribute('data-namespace', 'paypal');
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
      setLoading(false);
    };

    script.onerror = () => {
      setError('Failed to load PayPal SDK');
      setLoading(false);
    };

    document.body.appendChild(script);
  };

  const renderPayPalButton = () => {
    if (!window.paypal || !paypalRef.current) return;

    // Clear any existing buttons
    paypalRef.current.innerHTML = '';

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: currency,
                    value: (amount / 100).toFixed(2),
                  },
                  description: description,
                },
              ],
              application_context: {
                brand_name: 'Vasty Shop',
                shipping_preference: 'NO_SHIPPING',
              },
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const order = await actions.order.capture();
              onSuccess(order.id);
            } catch (err: any) {
              const errorMessage = err.message || 'Failed to capture payment';
              setError(errorMessage);
              onError(errorMessage);
            }
          },
          onError: (err: any) => {
            const errorMessage = err.message || 'PayPal payment error';
            setError(errorMessage);
            onError(errorMessage);
          },
          onCancel: () => {
            if (onCancel) {
              onCancel();
            }
          },
        })
        .render(paypalRef.current);
    } catch (err: any) {
      setError(err.message || 'Failed to render PayPal button');
      setLoading(false);
    }
  };

  const formatAmount = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Pay with PayPal</h3>
        <p className="text-text-secondary text-sm">
          Complete your payment securely with PayPal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold mb-1">Payment Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Amount Display */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Amount to pay:</span>
          <span className="text-2xl font-bold text-text-primary">{formatAmount()}</span>
        </div>
        {description && <p className="text-text-secondary text-sm mt-2">{description}</p>}
      </div>

      {/* PayPal Button Container */}
      <div className="relative">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
          </div>
        )}
        <div ref={paypalRef} className={loading ? 'hidden' : ''} />
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-text-secondary text-xs pt-4">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
        <span>Secured by PayPal • Buyer Protection</span>
      </div>
    </div>
  );
};

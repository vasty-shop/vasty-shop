import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Smartphone } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface GooglePayButtonProps {
  merchantId: string;
  merchantName: string;
  gatewayMerchantId: string;
  amount: number;
  currency?: string;
  countryCode?: string;
  description?: string;
  onSuccess: (token: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  environment?: 'TEST' | 'PRODUCTION';
  className?: string;
}

export const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  merchantId,
  merchantName,
  gatewayMerchantId,
  amount,
  currency = 'USD',
  countryCode = 'US',
  description = 'Payment',
  onSuccess,
  onError,
  onCancel,
  environment = 'TEST',
  className = '',
}) => {
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentsClient, setPaymentsClient] = useState<any>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGooglePayScript();
  }, []);

  useEffect(() => {
    if (paymentsClient) {
      checkGooglePayAvailability();
    }
  }, [paymentsClient]);

  const loadGooglePayScript = () => {
    // Check if script already exists
    if (window.google?.payments?.api) {
      initializeGooglePay();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;

    script.onload = () => {
      initializeGooglePay();
    };

    script.onerror = () => {
      setError('Failed to load Google Pay SDK');
      setChecking(false);
    };

    document.body.appendChild(script);
  };

  const initializeGooglePay = () => {
    if (!window.google?.payments?.api) {
      setError('Google Pay SDK not available');
      setChecking(false);
      return;
    }

    try {
      const client = new window.google.payments.api.PaymentsClient({
        environment,
      });
      setPaymentsClient(client);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Pay');
      setChecking(false);
    }
  };

  const checkGooglePayAvailability = async () => {
    if (!paymentsClient) return;

    try {
      setChecking(true);

      const isReadyToPayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
            },
          },
        ],
      };

      const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
      setAvailable(response.result);

      if (response.result && buttonContainerRef.current) {
        renderGooglePayButton();
      }

      setChecking(false);
    } catch (err: any) {
      console.error('Google Pay availability check failed:', err);
      setAvailable(false);
      setChecking(false);
    }
  };

  const renderGooglePayButton = () => {
    if (!paymentsClient || !buttonContainerRef.current) return;

    try {
      const button = paymentsClient.createButton({
        onClick: handleGooglePayClick,
        buttonColor: 'default',
        buttonType: 'pay',
        buttonSizeMode: 'fill',
      });

      buttonContainerRef.current.innerHTML = '';
      buttonContainerRef.current.appendChild(button);
    } catch (err: any) {
      console.error('Failed to render Google Pay button:', err);
    }
  };

  const getGooglePaymentDataRequest = () => {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              gatewayMerchantId: gatewayMerchantId,
            },
          },
        },
      ],
      merchantInfo: {
        merchantId: merchantId,
        merchantName: merchantName,
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: (amount / 100).toFixed(2),
        currencyCode: currency,
        countryCode: countryCode,
      },
    };
  };

  const handleGooglePayClick = async () => {
    if (!paymentsClient) {
      setError('Google Pay is not initialized');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const paymentDataRequest = getGooglePaymentDataRequest();
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      // Return payment data to parent
      setProcessing(false);
      onSuccess(paymentData);
    } catch (err: any) {
      if (err.statusCode === 'CANCELED') {
        setProcessing(false);
        if (onCancel) {
          onCancel();
        }
      } else {
        setError(err.message || 'Payment processing failed');
        setProcessing(false);
        onError(err.message || 'Payment processing failed');
      }
    }
  };

  const formatAmount = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  if (checking) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
      </div>
    );
  }

  if (!available) {
    return (
      <div className={className}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-800 font-semibold mb-1">Google Pay Not Available</h4>
              <p className="text-yellow-700 text-sm">
                Google Pay is not available on this device or browser. Please use another payment
                method.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Pay with Google Pay</h3>
        <p className="text-text-secondary text-sm">
          Complete your payment securely with Google Pay
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

      {/* Google Pay Button Container */}
      <div className="relative">
        {processing && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
          </div>
        )}
        <div ref={buttonContainerRef} className="w-full min-h-[48px]" style={{ minHeight: '48px' }} />
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-text-secondary text-xs pt-4">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
        <span>Secured by Google • Encrypted Payment</span>
      </div>
    </div>
  );
};

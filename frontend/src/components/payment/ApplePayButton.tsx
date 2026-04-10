import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Smartphone } from 'lucide-react';

declare global {
  interface Window {
    ApplePaySession?: any;
  }
}

interface ApplePayButtonProps {
  merchantId: string;
  amount: number;
  currency?: string;
  countryCode?: string;
  description?: string;
  onSuccess: (token: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  merchantId,
  amount,
  currency = 'USD',
  countryCode = 'US',
  description = 'Payment',
  onSuccess,
  onError,
  onCancel,
  className = '',
}) => {
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApplePayAvailability();
  }, [merchantId]);

  const checkApplePayAvailability = async () => {
    try {
      setChecking(true);

      // Check if Apple Pay is available in the browser
      if (!window.ApplePaySession) {
        setAvailable(false);
        setChecking(false);
        return;
      }

      // Check if Apple Pay is supported in this browser version
      if (!window.ApplePaySession.canMakePayments()) {
        setAvailable(false);
        setChecking(false);
        return;
      }

      // Check if user has an active card
      const canMakePayments = await window.ApplePaySession.canMakePaymentsWithActiveCard(
        merchantId
      );
      setAvailable(canMakePayments);
      setChecking(false);
    } catch (err: any) {
      console.error('Apple Pay availability check failed:', err);
      setAvailable(false);
      setChecking(false);
    }
  };

  const handleApplePayClick = async () => {
    if (!window.ApplePaySession) {
      setError('Apple Pay is not available');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const paymentRequest = {
        countryCode,
        currencyCode: currency,
        merchantCapabilities: ['supports3DS', 'supportsDebit', 'supportsCredit'],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        total: {
          label: description,
          amount: (amount / 100).toFixed(2),
          type: 'final',
        },
      };

      const session = new window.ApplePaySession(3, paymentRequest);

      session.onvalidatemerchant = async (event: any) => {
        try {
          // In production, validate with your backend
          const merchantSession = {
            merchantSessionIdentifier: 'mock_session_' + Date.now(),
            merchantIdentifier: merchantId,
            domainName: window.location.hostname,
            displayName: description,
          };
          session.completeMerchantValidation(merchantSession);
        } catch (err: any) {
          session.abort();
          setError(err.message || 'Merchant validation failed');
          setProcessing(false);
          onError(err.message || 'Merchant validation failed');
        }
      };

      session.onpaymentauthorized = async (event: any) => {
        try {
          // Return payment token to parent
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          setProcessing(false);
          onSuccess(event.payment);
        } catch (err: any) {
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          setError(err.message || 'Payment processing failed');
          setProcessing(false);
          onError(err.message || 'Payment processing failed');
        }
      };

      session.oncancel = () => {
        setProcessing(false);
        if (onCancel) {
          onCancel();
        }
      };

      session.begin();
    } catch (err: any) {
      setError(err.message || 'Failed to start Apple Pay');
      setProcessing(false);
      onError(err.message || 'Failed to start Apple Pay');
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
              <h4 className="text-yellow-800 font-semibold mb-1">Apple Pay Not Available</h4>
              <p className="text-yellow-700 text-sm">
                Apple Pay is not available on this device or browser. Please use another payment
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
        <h3 className="text-lg font-semibold text-text-primary mb-2">Pay with Apple Pay</h3>
        <p className="text-text-secondary text-sm">
          Complete your payment securely with Apple Pay
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

      {/* Apple Pay Button */}
      <Button
        onClick={handleApplePayClick}
        disabled={processing}
        className="w-full h-12 bg-black hover:bg-black/90 text-white"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="font-semibold">Pay with Apple Pay</span>
          </div>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-text-secondary text-xs pt-4">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
        <span>Secured by Apple • Touch ID / Face ID</span>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  publishableKey: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  publishableKey,
  amount,
  currency = 'usd',
  customerEmail: initialEmail = '',
  customerName: initialName = '',
  onSuccess,
  onError,
  className = '',
}) => {
  const { t } = useTranslation();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Form state
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);

  // Card validation state
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Track if we've already created a payment method
  const paymentMethodCreated = useRef(false);

  useEffect(() => {
    initializeStripe();
  }, [publishableKey]);

  // Update email when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Update name when initialName changes
  useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);

  const initializeStripe = async () => {
    try {
      setLoading(true);
      setError(null);

      const stripeInstance = await loadStripe(publishableKey);

      if (!stripeInstance) {
        throw new Error('Failed to load Stripe');
      }

      setStripe(stripeInstance);

      const elementsInstance = stripeInstance.elements();

      const card = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': {
              color: '#9ca3af',
            },
            backgroundColor: 'transparent',
          },
          invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
          },
        },
        hidePostalCode: false,
      });

      card.on('change', (event) => {
        setCardComplete(event.complete);
        setCardError(event.error ? event.error.message : null);
        // Reset payment method created flag if card changes
        if (!event.complete) {
          paymentMethodCreated.current = false;
          setIsReady(false);
        }
      });

      setCardElement(card);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardElement) {
      const container = document.getElementById('card-element');
      if (container) {
        cardElement.mount('#card-element');
      }
    }

    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, [cardElement]);

  // Auto-create payment method when card is complete and email is valid
  useEffect(() => {
    const createPaymentMethod = async () => {
      if (!stripe || !cardElement || !cardComplete || paymentMethodCreated.current) {
        return;
      }

      // Validate email
      if (!email || !email.includes('@')) {
        return;
      }

      try {
        setProcessing(true);
        setError(null);
        paymentMethodCreated.current = true;

        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            email,
            name: name || undefined,
          },
        });

        if (pmError) {
          throw new Error(pmError.message);
        }

        if (!paymentMethod) {
          throw new Error('Failed to create payment method');
        }

        console.log('[StripePaymentForm] Payment method created successfully:', paymentMethod.id);
        setIsReady(true);
        setProcessing(false);
        onSuccess(paymentMethod.id);
        console.log('[StripePaymentForm] Called onSuccess with:', paymentMethod.id);
      } catch (err: any) {
        setProcessing(false);
        paymentMethodCreated.current = false;
        const errorMessage = err.message || 'Payment setup failed';
        setError(errorMessage);
        onError(errorMessage);
      }
    };

    // Debounce the payment method creation
    const timer = setTimeout(createPaymentMethod, 500);
    return () => clearTimeout(timer);
  }, [stripe, cardElement, cardComplete, email, name, onSuccess, onError]);

  const formatAmount = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-lime" />
            <h3 className="text-lg font-semibold text-text-primary">Pay with Card</h3>
          </div>
          <div className="flex items-center gap-1 text-text-secondary text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure</span>
          </div>
        </div>
        <p className="text-text-secondary text-sm">
          Enter your card details below. Payment will be processed when you place your order.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold mb-1">Card Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isReady && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="text-green-800 font-semibold">Card Ready</h4>
              <p className="text-green-700 text-sm">Your card is ready. Click "Review Order" below to continue.</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Amount Display */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Amount to pay:</span>
            <span className="text-2xl font-bold text-text-primary">{formatAmount()}</span>
          </div>
        </div>

        {/* Email Input */}
        <div>
          <Label htmlFor="stripe-email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stripe-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              paymentMethodCreated.current = false;
              setIsReady(false);
            }}
            placeholder="your.email@domain.com"
            required
            disabled={processing}
          />
        </div>

        {/* Name Input */}
        <div>
          <Label htmlFor="stripe-name">Cardholder Name</Label>
          <Input
            id="stripe-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              paymentMethodCreated.current = false;
              setIsReady(false);
            }}
            placeholder="John Doe"
            disabled={processing}
          />
        </div>

        {/* Card Element */}
        <div>
          <Label>
            Card Information <span className="text-red-500">*</span>
          </Label>
          <div
            id="card-element"
            className="p-3 bg-white border border-gray-300 rounded-lg mt-2"
            style={{ minHeight: '40px' }}
          />
          {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}
          {processing && (
            <div className="flex items-center gap-2 mt-2 text-text-secondary text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Validating card...</span>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-text-secondary text-xs pt-2">
          <Lock className="w-3 h-3" />
          <span>Secured by Stripe - PCI DSS Compliant</span>
        </div>
      </div>
    </div>
  );
};

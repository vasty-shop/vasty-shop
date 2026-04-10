import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface StripeCardFormProps {
  onPaymentMethodCreated: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  amount: number;
  currency: string;
  processing?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
      iconColor: '#84cc16',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onPaymentMethodCreated,
  onError,
  amount,
  currency,
  processing = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card element not found');
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        onError(error.message || 'Failed to create payment method');
        setCardError(error.message || null);
      } else if (paymentMethod) {
        onPaymentMethodCreated(paymentMethod.id);
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Badge */}
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Lock className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          Your payment information is encrypted and secure
        </span>
      </div>

      {/* Accepted Cards */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-text-secondary">We accept:</span>
        <div className="flex items-center gap-2">
          {['VISA', 'MC', 'AMEX', 'DISC'].map((card) => (
            <div
              key={card}
              className="px-3 py-1.5 border-2 border-gray-200 rounded-lg bg-white text-xs font-bold text-text-primary"
            >
              {card}
            </div>
          ))}
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Card Information
        </label>
        <div
          className={cn(
            'p-4 border-2 rounded-lg transition-colors',
            cardError
              ? 'border-red-500 bg-red-50'
              : cardComplete
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-primary-lime focus-within:border-primary-lime'
          )}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
        </div>
        {cardError && <p className="text-sm text-red-500 mt-2">{cardError}</p>}
      </div>

      {/* Save Card */}
      <div className="flex items-start space-x-3 pt-4 border-t">
        <Checkbox
          id="saveCard"
          checked={saveCard}
          onCheckedChange={(checked) => setSaveCard(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="saveCard"
            className="text-sm font-medium text-text-primary cursor-pointer"
          >
            Save card for future purchases
          </label>
          <p className="text-sm text-text-secondary">
            Your card details will be securely encrypted
          </p>
        </div>
      </div>

      {/* PCI Compliance Notice */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Secure & PCI Compliant</p>
            <p className="text-gray-600">
              Your payment information is processed securely. We do not store credit card
              details nor have access to your credit card information.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

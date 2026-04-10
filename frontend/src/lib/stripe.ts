/**
 * Stripe configuration and utilities
 */

import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance (singleton)
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Check if Apple Pay is available
 */
export const isApplePayAvailable = async (): Promise<boolean> => {
  const stripe = await getStripe();
  if (!stripe) return false;

  try {
    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Test',
        amount: 100,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const result = await paymentRequest.canMakePayment();
    return result ? result.applePay === true : false;
  } catch (error) {
    console.error('Error checking Apple Pay availability:', error);
    return false;
  }
};

/**
 * Check if Google Pay is available
 */
export const isGooglePayAvailable = async (): Promise<boolean> => {
  const stripe = await getStripe();
  if (!stripe) return false;

  try {
    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Test',
        amount: 100,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const result = await paymentRequest.canMakePayment();
    return result ? result.googlePay === true : false;
  } catch (error) {
    console.error('Error checking Google Pay availability:', error);
    return false;
  }
};

/**
 * Stripe Elements appearance configuration
 */
export const stripeElementsAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#84cc16', // primary-lime
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',
    colorDanger: '#ef4444',
    fontFamily: 'system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};

/**
 * Stripe Elements options
 */
export const stripeElementsOptions = {
  mode: 'payment' as const,
  appearance: stripeElementsAppearance,
};

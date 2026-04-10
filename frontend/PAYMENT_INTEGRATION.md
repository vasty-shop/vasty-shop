# Fluxez Shop Payment Integration

This document describes the complete payment system integration in Fluxez Shop frontend, including all payment methods (Stripe, PayPal, Apple Pay, and Google Pay).

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Payment Flow](#payment-flow)
5. [Configuration](#configuration)
6. [API Integration](#api-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Overview

The Fluxez Shop payment system supports multiple payment methods:

- **Stripe Card Payments**: Credit/Debit card processing via Stripe
- **PayPal**: PayPal Checkout integration
- **Apple Pay**: Apple Pay for iOS/Safari users
- **Google Pay**: Google Pay for Android/Chrome users

All payment methods are integrated into the checkout flow and work seamlessly with the shop's backend API.

## Architecture

### Component Structure

```
src/
├── components/
│   └── payment/
│       ├── StripePaymentForm.tsx     # Stripe card payment form
│       ├── PayPalCheckout.tsx        # PayPal button integration
│       ├── ApplePayButton.tsx        # Apple Pay button
│       ├── GooglePayButton.tsx       # Google Pay button
│       ├── PaymentMethodSelector.tsx # Payment method switcher
│       └── index.ts                  # Exports
│
├── features/
│   └── checkout/
│       ├── CheckoutPage.tsx          # Main checkout page
│       ├── PaymentSuccessPage.tsx    # Payment success confirmation
│       ├── PaymentFailedPage.tsx     # Payment failure handling
│       ├── components/
│       │   └── PaymentForm.tsx       # Integrated payment form
│       └── api/
│           └── paymentApi.ts         # Payment API client
│
└── types/
    └── checkout.ts                   # Type definitions
```

### Data Flow

1. **Cart** → User adds items and proceeds to checkout
2. **Checkout Form** → User enters shipping and delivery information
3. **Payment Selection** → User selects payment method
4. **Payment Processing** → Payment method handles transaction
5. **Order Confirmation** → Backend creates order and sends confirmation
6. **Success/Failure** → User redirected to appropriate page

## Components

### 1. StripePaymentForm

**Location**: `src/components/payment/StripePaymentForm.tsx`

Handles credit/debit card payments through Stripe.

**Features**:
- Stripe Elements integration
- Real-time card validation
- PCI-compliant card input
- Email and name collection
- Error handling and loading states

**Props**:
```typescript
interface StripePaymentFormProps {
  publishableKey: string;      // Stripe publishable key
  amount: number;              // Amount in cents
  currency?: string;           // Currency code (default: 'usd')
  customerEmail?: string;      // Pre-filled email
  customerName?: string;       // Pre-filled name
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

**Usage**:
```typescript
<StripePaymentForm
  publishableKey="pk_test_..."
  amount={9999} // $99.99
  currency="usd"
  customerEmail="user@example.com"
  onSuccess={(paymentMethodId) => {
    // Handle successful payment method creation
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

### 2. PayPalCheckout

**Location**: `src/components/payment/PayPalCheckout.tsx`

Integrates PayPal Checkout buttons.

**Features**:
- PayPal SDK dynamic loading
- Order creation and capture
- Buyer protection badge
- Responsive button styling

**Props**:
```typescript
interface PayPalCheckoutProps {
  clientId: string;            // PayPal client ID
  amount: number;              // Amount in cents
  currency?: string;           // Currency code (default: 'USD')
  description?: string;        // Payment description
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

### 3. ApplePayButton

**Location**: `src/components/payment/ApplePayButton.tsx`

Provides Apple Pay integration for Safari/iOS devices.

**Features**:
- Availability detection
- Apple Pay session management
- Touch ID / Face ID support
- Graceful fallback for unsupported devices

**Props**:
```typescript
interface ApplePayButtonProps {
  merchantId: string;          // Apple Pay merchant ID
  amount: number;              // Amount in cents
  currency?: string;           // Currency code
  countryCode?: string;        // Country code
  description?: string;        // Payment description
  onSuccess: (token: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

### 4. GooglePayButton

**Location**: `src/components/payment/GooglePayButton.tsx`

Integrates Google Pay for Chrome/Android users.

**Features**:
- Google Pay API integration
- Availability detection
- Encrypted payment data
- Fallback UI for unsupported devices

**Props**:
```typescript
interface GooglePayButtonProps {
  merchantId: string;          // Google Pay merchant ID
  merchantName: string;        // Business name
  gatewayMerchantId: string;  // Stripe publishable key
  amount: number;              // Amount in cents
  currency?: string;           // Currency code
  countryCode?: string;        // Country code
  description?: string;        // Payment description
  onSuccess: (token: any) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  environment?: 'TEST' | 'PRODUCTION';
  className?: string;
}
```

### 5. PaymentMethodSelector

**Location**: `src/components/payment/PaymentMethodSelector.tsx`

Provides tabbed interface for switching between payment methods.

**Features**:
- Responsive tab layout
- Payment method icons
- Smooth transitions

## Payment Flow

### Standard Flow

1. **Cart Review**
   - User reviews items in cart
   - Clicks "Proceed to Checkout"

2. **Shipping Information** (Step 1)
   - User enters shipping address
   - Email and phone number
   - Proceeds to delivery options

3. **Delivery Method** (Step 2)
   - User selects shipping speed
   - Standard, Express, or Overnight
   - Proceeds to payment

4. **Payment** (Step 3)
   - User selects payment method
   - Enters payment information
   - System validates payment details
   - Proceeds to review

5. **Order Review** (Step 4)
   - User reviews complete order
   - Accepts terms and conditions
   - Clicks "Place Order"

6. **Payment Processing**
   - Frontend creates payment intent
   - Backend processes payment
   - Order is created in database

7. **Confirmation**
   - User redirected to success page
   - Email confirmation sent
   - Order tracking available

### Payment Method Specific Flows

#### Stripe Card Payment
1. User enters card details
2. Stripe validates card
3. Payment method is created
4. Backend creates payment intent
5. Payment is confirmed
6. Order is created

#### PayPal
1. User clicks PayPal button
2. Redirected to PayPal
3. User authorizes payment
4. Returns to shop
5. Payment is captured
6. Order is created

#### Apple Pay
1. User clicks Apple Pay button
2. Touch ID / Face ID prompt
3. User authorizes
4. Payment token created
5. Backend processes payment
6. Order is created

#### Google Pay
1. User clicks Google Pay button
2. Google Pay sheet opens
3. User selects card
4. Payment token created
5. Backend processes payment
6. Order is created

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Apple Pay Configuration (Optional)
VITE_APPLE_PAY_MERCHANT_ID=merchant.com.yourcompany.shop

# Google Pay Configuration (Optional)
VITE_GOOGLE_PAY_MERCHANT_ID=your_merchant_id
VITE_GOOGLE_PAY_MERCHANT_NAME=Fluxez Shop
```

### Backend Configuration

The backend should be configured with:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live'
```

## API Integration

### Payment API Client

**Location**: `src/features/checkout/api/paymentApi.ts`

#### Create Payment Intent

```typescript
const response = await paymentApi.createPaymentIntent({
  orderId: 'order_123',
  amount: 9999,  // $99.99 in cents
  paymentMethod: 'card',
  currency: 'usd',
  metadata: {
    customerId: 'cust_123',
    items: 3
  }
});
```

#### Confirm Payment

```typescript
const result = await paymentApi.confirmPayment({
  transactionId: 'txn_123',
  paymentIntentId: 'pi_123'
});
```

#### Process PayPal Payment

```typescript
const result = await paymentApi.processPayPalPayment({
  orderId: 'order_123',
  paypalOrderId: 'PAYPAL-ORDER-ID',
  metadata: {}
});
```

## Testing

### Test Cards (Stripe)

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Visa - Success |
| 4000 0000 0000 0002 | Visa - Declined |
| 4000 0025 0000 3155 | Visa - 3D Secure |
| 5555 5555 5555 4444 | Mastercard - Success |

Use any future expiry date and any 3-digit CVV.

### Test PayPal

Use PayPal sandbox accounts:
- Buyer: sb-buyer@personal.example.com
- Password: test1234

### Testing Apple Pay

Apple Pay requires:
- Safari browser or iOS device
- Valid Apple Pay merchant ID
- Test cards added to Wallet

### Testing Google Pay

Google Pay requires:
- Chrome browser or Android device
- Test environment configuration
- Test cards in Google account

## Troubleshooting

### Common Issues

#### Stripe Not Loading

**Problem**: Stripe Elements not rendering

**Solution**:
1. Check publishable key is correct
2. Verify Stripe script loaded
3. Check console for errors
4. Ensure element container exists

#### PayPal Button Not Showing

**Problem**: PayPal button container empty

**Solution**:
1. Verify client ID is correct
2. Check script loaded successfully
3. Ensure container has minimum height
4. Check for JavaScript errors

#### Apple Pay Not Available

**Problem**: Apple Pay button shows "not available"

**Solution**:
1. Use Safari or iOS device
2. Verify merchant ID is registered
3. Check domain is verified
4. Ensure test cards in Wallet

#### Google Pay Not Working

**Problem**: Google Pay button not rendering

**Solution**:
1. Check merchant ID configuration
2. Verify gateway configuration
3. Use TEST environment for testing
4. Check browser compatibility

### Error Messages

#### "Payment system not initialized"

- Check environment variables are set
- Verify API keys are correct
- Check network connectivity

#### "Failed to create payment intent"

- Check backend is running
- Verify API endpoint is correct
- Check request payload format

#### "Card declined"

- Use test card numbers
- Check card expiry is future date
- Verify CVV format

## Security Considerations

1. **Never expose secret keys** - Only use publishable keys in frontend
2. **Validate on backend** - Always validate payment on server side
3. **Use HTTPS** - Required for payment processing
4. **Implement CSP** - Content Security Policy for scripts
5. **Monitor transactions** - Set up alerts for suspicious activity

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [Apple Pay Documentation](https://developer.apple.com/apple-pay/)
- [Google Pay Documentation](https://developers.google.com/pay/api)

## Support

For issues or questions:
- Check backend logs for errors
- Review browser console for frontend issues
- Test with different payment methods
- Contact payment provider support if needed

# Payment Module - Complete Integration Guide

## Overview

The Fluxez Shop Payment Module provides comprehensive payment processing capabilities with support for multiple payment methods, automatic order status updates, transaction recording, and customer notifications.

## Features

- **Multiple Payment Methods**
  - Credit/Debit Cards (via Stripe)
  - PayPal
  - Apple Pay (via Stripe)
  - Google Pay (via Stripe)

- **Payment Processing**
  - Direct payment intent creation
  - Direct card payments
  - Wallet payments (Apple Pay, Google Pay)
  - PayPal order creation and capture

- **Order Integration**
  - Automatic order status updates on payment success/failure
  - Payment transaction recording in database
  - Order timeline updates

- **Notifications**
  - Payment success notifications
  - Payment failure notifications
  - Refund processed notifications

- **Advanced Features**
  - Stripe webhook handling
  - Refund processing
  - Payment method configuration per shop
  - Multi-shop payment support

## Payment Methods

### 1. Credit/Debit Card Payments

#### Create Payment Intent (Client-side confirmation)
```http
POST /api/v1/payment/create-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "paymentMethod": "card",
  "currency": "USD"
}
```

#### Direct Card Payment (Server-side confirmation)
```http
POST /api/v1/payment/direct-card
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "token": "pm_1234567890",
  "savePaymentMethod": false,
  "currency": "USD"
}
```

### 2. PayPal Payments

#### Step 1: Create PayPal Order
```http
POST /api/v1/payment/paypal/create-order
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "currency": "USD",
  "returnUrl": "https://yoursite.com/payment/success",
  "cancelUrl": "https://yoursite.com/payment/cancel"
}

Response:
{
  "transactionId": "trans_123",
  "paypalOrderId": "PAYPAL-1234567890",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
  "amount": 99.99,
  "currency": "USD"
}
```

#### Step 2: Capture PayPal Payment (after user approval)
```http
POST /api/v1/payment/paypal/capture
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "paypalOrderId": "PAYPAL-1234567890"
}

Response:
{
  "transactionId": "trans_123",
  "paypalOrderId": "PAYPAL-1234567890",
  "status": "succeeded",
  "amount": 99.99,
  "currency": "USD"
}
```

### 3. Apple Pay

```http
POST /api/v1/payment/apple-pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "token": "pm_apple_pay_token",
  "currency": "USD",
  "savePaymentMethod": false
}

Response:
{
  "transactionId": "trans_123",
  "paymentIntentId": "pi_1234567890",
  "status": "succeeded",
  "amount": 99.99,
  "currency": "USD"
}
```

### 4. Google Pay

```http
POST /api/v1/payment/google-pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "token": "pm_google_pay_token",
  "currency": "USD",
  "savePaymentMethod": false
}

Response:
{
  "transactionId": "trans_123",
  "paymentIntentId": "pi_1234567890",
  "status": "succeeded",
  "amount": 99.99,
  "currency": "USD"
}
```

## Payment Confirmation

For payment intents created with `create-intent`, confirm the payment after client-side processing:

```http
POST /api/v1/payment/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "transactionId": "507f1f77bcf86cd799439011",
  "paymentIntentId": "pi_1234567890abcdef"
}
```

## Refunds

Process a full or partial refund:

```http
POST /api/v1/payment/refund/{transactionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50.00,  // Optional: leave empty for full refund
  "reason": "Customer requested refund"
}

Response:
{
  "id": "trans_123",
  "orderId": "order_123",
  "status": "refunded",
  "refundAmount": 50.00,
  "refundReason": "Customer requested refund"
}
```

## Transaction Management

### Get Transaction by ID
```http
GET /api/v1/payment/transaction/{transactionId}
Authorization: Bearer {token}

Response:
{
  "id": "trans_123",
  "orderId": "order_123",
  "userId": "user_123",
  "amount": 99.99,
  "currency": "USD",
  "method": "card",
  "provider": "Stripe",
  "status": "succeeded",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get Order Transactions
```http
GET /api/v1/payment/transactions/{orderId}
Authorization: Bearer {token}

Response:
[
  {
    "id": "trans_123",
    "amount": 99.99,
    "status": "succeeded",
    "method": "card"
  }
]
```

## Payment Method Configuration

### Configure Payment Methods for a Shop
```http
PUT /api/v1/payment/configure/{shopId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "card": {
    "enabled": true,
    "config": {
      "publicKey": "pk_test_..."
    }
  },
  "paypal": {
    "enabled": true,
    "config": {
      "clientId": "paypal_client_id"
    }
  },
  "applePay": {
    "enabled": true
  },
  "googlePay": {
    "enabled": true
  }
}
```

### Get Shop Payment Methods
```http
GET /api/v1/payment/config/{shopId}

Response:
{
  "card": { "enabled": true },
  "paypal": { "enabled": true },
  "applePay": { "enabled": true },
  "googlePay": { "enabled": true }
}
```

### Get Available Payment Methods
```http
GET /api/v1/payment/methods
Authorization: Bearer {token}

Response:
{
  "methods": [
    {
      "type": "card",
      "name": "Credit/Debit Card",
      "enabled": true,
      "providers": ["stripe"]
    },
    {
      "type": "paypal",
      "name": "PayPal",
      "enabled": true,
      "providers": ["paypal"]
    },
    {
      "type": "apple_pay",
      "name": "Apple Pay",
      "enabled": true,
      "providers": ["stripe"]
    },
    {
      "type": "google_pay",
      "name": "Google Pay",
      "enabled": true,
      "providers": ["stripe"]
    }
  ]
}
```

## Webhook Integration

### Stripe Webhooks

The payment module handles the following Stripe webhook events:

- `payment_intent.succeeded` - Updates order status to paid, sends success notification
- `payment_intent.payment_failed` - Updates transaction and order, sends failure notification
- `payment_intent.canceled` - Marks payment as failed
- `charge.refunded` - Processes refund and sends notification

#### Webhook Endpoint
```
POST /api/v1/payment/webhook
Headers:
  stripe-signature: {webhook_signature}
```

Configure this endpoint in your Stripe Dashboard under Webhooks.

## Order Integration

When a payment succeeds, the following automatic updates occur:

1. **Order Status Updates**
   - Payment status changed to "paid"
   - Order status changed from "pending" to "processing"
   - Transaction ID recorded in order
   - Payment timestamp (paidAt) recorded

2. **Order Timeline**
   - New timeline entry added with payment confirmation

3. **Notifications**
   - Payment success notification sent to customer
   - Order placed notification sent to customer

## Database Schema

### Payment Transaction Entity

```typescript
{
  id: string;                    // UUID
  orderId: string;               // Reference to order
  userId: string;                // Customer user ID
  amount: number;                // Payment amount
  currency: string;              // Currency code (USD, EUR, etc.)
  method: string;                // card, paypal, apple_pay, google_pay
  provider: string;              // Stripe, PayPal
  providerTransactionId: string; // External transaction ID
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status: string;                // pending, succeeded, failed, refunded
  metadata?: object;             // Additional data
  errorMessage?: string;         // Error details if failed
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Payment Flow Diagrams

### Card Payment Flow
```
1. Customer selects product and proceeds to checkout
2. Frontend calls POST /api/v1/payment/direct-card with token
3. Backend creates Stripe payment intent and confirms
4. Transaction record created in database
5. Order status updated to "processing"
6. Customer receives payment success notification
7. Shop receives order notification
```

### PayPal Payment Flow
```
1. Customer selects PayPal at checkout
2. Frontend calls POST /api/v1/payment/paypal/create-order
3. Backend returns PayPal approval URL
4. Customer redirected to PayPal to approve payment
5. After approval, frontend calls POST /api/v1/payment/paypal/capture
6. Backend captures payment and updates order
7. Customer receives payment success notification
```

### Apple Pay / Google Pay Flow
```
1. Customer clicks Apple Pay / Google Pay button
2. Payment sheet appears with order details
3. Customer authorizes payment
4. Frontend receives payment token
5. Frontend calls POST /api/v1/payment/apple-pay or google-pay
6. Backend processes payment via Stripe
7. Order updated and notifications sent
```

## Error Handling

All payment endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Failed to process payment: Insufficient funds",
  "error": "Bad Request"
}
```

Common error codes:
- `400` - Invalid request data
- `401` - Unauthorized (missing or invalid token)
- `404` - Transaction or order not found
- `500` - Internal server error

## Environment Variables

Required environment variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration (for production implementation)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or production

# Fluxez Configuration
FLUXEZ_API_KEY=your_fluxez_api_key
FLUXEZ_API_SECRET=your_fluxez_api_secret
```

## Testing

### Test Cards (Stripe)

- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- 3D Secure required: `4000 0027 6000 3184`

### Test PayPal Account

Use PayPal Sandbox credentials for testing PayPal payments.

## Security Considerations

1. **API Keys**: Never expose Stripe secret keys or PayPal credentials in frontend code
2. **Webhook Signatures**: Always verify webhook signatures to prevent spoofing
3. **Amount Validation**: Server always validates payment amounts against order totals
4. **User Authorization**: All endpoints require valid JWT authentication
5. **Order Ownership**: Verify user owns the order before processing payment

## Future Enhancements

- [ ] Saved payment methods for returning customers
- [ ] Subscription/recurring payments
- [ ] Split payments for marketplace commissions
- [ ] Multi-currency support with automatic conversion
- [ ] Fraud detection and prevention
- [ ] Payment analytics and reporting
- [ ] Cash on delivery (COD) support
- [ ] Bank transfer support
- [ ] Cryptocurrency payments

## Support

For issues or questions:
- Check the logs for detailed error messages
- Review Stripe Dashboard for payment details
- Contact support@fluxez.com

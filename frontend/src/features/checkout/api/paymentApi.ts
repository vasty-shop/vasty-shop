/**
 * Payment API Service
 * Handles all payment-related API calls
 */

import { apiClient } from '@/lib/api-client';

export type PaymentMethod = 'card' | 'paypal' | 'apple_pay' | 'google_pay';

export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  shopId?: string; // For Stripe Connect destination charges
  currency?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentResponse {
  transactionId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  paymentMethod: PaymentMethod;
  // Stripe Connect fields
  stripeConnectEnabled?: boolean;
  platformFee?: number;
  vendorAmount?: number;
}

export interface ConfirmPaymentRequest {
  transactionId: string;
  paymentIntentId: string;
}

export interface DirectCardPaymentRequest {
  orderId: string;
  amount: number;
  token: string;
  savePaymentMethod?: boolean;
  currency?: string;
}

export interface PayPalPaymentRequest {
  orderId: string;
  paypalOrderId: string;
  metadata?: Record<string, any>;
}

export interface PaymentMethodConfig {
  enabled: boolean;
  config?: Record<string, any>;
}

export interface ShopPaymentMethods {
  card?: PaymentMethodConfig;
  paypal?: PaymentMethodConfig;
  applePay?: PaymentMethodConfig;
  googlePay?: PaymentMethodConfig;
}

class PaymentApiService {
  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    const response = await apiClient.post<CreatePaymentIntentResponse>(
      '/payment/create-intent',
      request
    );
    return response.data;
  }

  /**
   * Confirm a payment after client-side processing
   */
  async confirmPayment(request: ConfirmPaymentRequest): Promise<any> {
    const response = await apiClient.post('/payment/confirm', request);
    return response.data;
  }

  /**
   * Process direct card payment
   */
  async processDirectCardPayment(request: DirectCardPaymentRequest): Promise<any> {
    const response = await apiClient.post('/payment/direct-card', request);
    return response.data;
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment(request: PayPalPaymentRequest): Promise<any> {
    const response = await apiClient.post('/payment/paypal/capture', request);
    return response.data;
  }

  /**
   * Get shop payment methods configuration
   */
  async getShopPaymentMethods(shopId: string): Promise<ShopPaymentMethods> {
    const response = await apiClient.get<ShopPaymentMethods>(`/payment/config/${shopId}`);
    return response.data;
  }

  /**
   * Get payment transactions for an order
   */
  async getOrderTransactions(orderId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/payment/transactions/${orderId}`);
    return response.data;
  }
}

export const paymentApi = new PaymentApiService();

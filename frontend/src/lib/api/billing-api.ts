/**
 * Billing API Client
 * Handles subscription, plans, invoices, and payment methods
 */

import { apiClient } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Subscription,
  SubscriptionPlan,
  Invoice,
  PaymentMethod,
  CheckoutSession,
  CreateCheckoutRequest,
  CancelSubscriptionRequest,
} from '@/types/billing';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  paymentMethods: () => [...billingKeys.all, 'paymentMethods'] as const,
};

// API Functions
export const billingApi = {
  /**
   * Get current subscription for the user
   */
  async getSubscription(): Promise<Subscription> {
    const response = await apiClient.get<Subscription>('/billing/subscription');
    return response.data;
  },

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<{ plans: SubscriptionPlan[] }>('/billing/plans');
    return response.data.plans;
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckout(data: CreateCheckoutRequest): Promise<CheckoutSession> {
    const response = await apiClient.post<CheckoutSession>('/billing/checkout', data);
    return response.data;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(data: CancelSubscriptionRequest): Promise<Subscription> {
    const response = await apiClient.post<Subscription>('/billing/subscription/cancel', data);
    return response.data;
  },

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(): Promise<Subscription> {
    const response = await apiClient.post<Subscription>('/billing/subscription/resume', {});
    return response.data;
  },

  /**
   * Get invoices for the user
   */
  async getInvoices(options?: { limit?: number; offset?: number }): Promise<{ invoices: Invoice[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{ invoices: Invoice[]; total: number }>(`/billing/invoices${query}`);
    return response.data;
  },

  /**
   * Get payment methods for the user
   */
  async getPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
    const response = await apiClient.get<{ paymentMethods: PaymentMethod[] }>('/billing/payment-methods');
    return response.data;
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/billing/payment-methods/${paymentMethodId}`);
    return response.data;
  },

  /**
   * Create setup session for adding new payment method
   */
  async createSetupSession(): Promise<{ url: string }> {
    const response = await apiClient.post<{ url: string }>('/billing/setup-session', {});
    return response.data;
  },

  /**
   * Sync subscription from Stripe
   */
  async syncSubscription(): Promise<Subscription | null> {
    const response = await apiClient.post<Subscription | null>('/billing/subscription/sync', {});
    return response.data;
  },
};

// React Query Hooks

/**
 * Hook to get current subscription
 */
export const useSubscription = () => {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => billingApi.getSubscription(),
    retry: false, // Don't retry on failure
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to get available plans
 */
export const usePlans = () => {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingApi.getPlans(),
    retry: false, // Don't retry on failure
    staleTime: 1000 * 60 * 60, // Cache for 1 hour (plans rarely change)
  });
};

/**
 * Hook to create checkout session
 */
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutRequest) => billingApi.createCheckout(data),
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelSubscriptionRequest) => billingApi.cancelSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    },
  });
};

/**
 * Hook to resume subscription
 */
export const useResumeSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => billingApi.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    },
  });
};

/**
 * Hook to get invoices
 */
export const useInvoices = (options?: { limit?: number; offset?: number; page?: number }) => {
  // Calculate offset from page if provided
  const limit = options?.limit || 10;
  const offset = options?.page ? (options.page - 1) * limit : (options?.offset || 0);

  return useQuery({
    queryKey: [...billingKeys.invoices(), { limit, offset }],
    queryFn: async () => {
      const response = await billingApi.getInvoices({ limit, offset });
      return response;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get payment methods
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: billingKeys.paymentMethods(),
    queryFn: async () => {
      const response = await billingApi.getPaymentMethods();
      return response.paymentMethods;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to delete payment method
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) => billingApi.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() });
    },
  });
};

/**
 * Hook to create setup session for new payment method
 */
export const useCreateSetupSession = () => {
  return useMutation({
    mutationFn: () => billingApi.createSetupSession(),
  });
};

/**
 * Hook to sync subscription from Stripe
 */
export const useSyncSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => billingApi.syncSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    },
  });
};

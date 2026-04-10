import { api } from '@/lib/api';

export interface ConnectAccountStatus {
  accountId: string | null;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: any | null;
  currentDeadline: number | null;
}

export interface CreateConnectAccountResponse {
  accountId: string;
  onboardingUrl: string;
}

export interface BalanceItem {
  type: 'available' | 'pending';
  currency: string;
  amount: number;
  raw: number;
}

export interface VendorBalance {
  available: number;
  pending: number;
  currency: string;
  allBalances?: BalanceItem[];
}

export interface VendorTransfer {
  id: string;
  amount: number;
  currency: string;
  created: string;
  description: string | null;
  metadata: Record<string, any>;
  reversed: boolean;
  balanceTransaction: string | null;
}

export interface VendorPayout {
  id: string;
  shopId: string;
  orderId: string | null;
  amount: number;
  platformFee: number;
  currency: string;
  stripeTransferId: string | null;
  stripePayoutId: string | null;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  estimatedArrival: string | null;
  paidAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  description: string | null;
  createdAt: string;
}

export interface SupportedCountry {
  code: string;
  name: string;
  flag: string;
}

/**
 * Stripe Connect API for vendor payment settings
 */
export const stripeConnectApi = {
  /**
   * Create a Stripe Connect Express account for a shop
   */
  createConnectAccount: async (
    shopId: string,
    data: { country: string; businessName?: string; email?: string },
  ): Promise<CreateConnectAccountResponse> => {
    const response = await api.post(`/stripe-connect/account/${shopId}`, data, {
      headers: {
        'x-return-url': window.location.origin,
      },
    });
    return response.data;
  },

  /**
   * Get onboarding link for incomplete account setup
   */
  getOnboardingLink: async (shopId: string): Promise<{ onboardingUrl: string }> => {
    const response = await api.get(`/stripe-connect/onboarding/${shopId}`, {
      headers: {
        'x-return-url': window.location.origin,
      },
    });
    return response.data;
  },

  /**
   * Get Connect account status for a shop
   */
  getAccountStatus: async (shopId: string): Promise<ConnectAccountStatus> => {
    const response = await api.get(`/stripe-connect/status/${shopId}`);
    return response.data;
  },

  /**
   * Get Stripe Express Dashboard login link
   */
  getDashboardLink: async (shopId: string): Promise<{ url: string }> => {
    const response = await api.get(`/stripe-connect/dashboard/${shopId}`);
    return response.data;
  },

  /**
   * Disconnect Stripe Connect account from shop
   */
  disconnectAccount: async (shopId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/stripe-connect/account/${shopId}`);
    return response.data;
  },

  /**
   * Get vendor balance from their connected account
   */
  getVendorBalance: async (shopId: string): Promise<VendorBalance> => {
    const response = await api.get(`/stripe-connect/balance/${shopId}`);
    return response.data;
  },

  /**
   * Get recent transfers to vendor connected account
   */
  getVendorTransfers: async (shopId: string, limit?: number): Promise<VendorTransfer[]> => {
    const response = await api.get(`/stripe-connect/transfers/${shopId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get vendor payout history from database
   */
  getPayoutHistory: async (shopId: string, limit?: number): Promise<VendorPayout[]> => {
    const response = await api.get(`/stripe-connect/payouts/${shopId}`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get list of Stripe Connect supported countries
   */
  getSupportedCountries: async (): Promise<{ countries: SupportedCountry[] }> => {
    const response = await api.get('/stripe-connect/supported-countries');
    return response.data;
  },
};

export default stripeConnectApi;

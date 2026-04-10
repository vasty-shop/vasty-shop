/**
 * Shop API
 * API functions for shop management operations
 */

import type { VendorShop as Shop } from '@/features/vendor-auth/types';
import { apiClient } from '@/lib/api-client';

/**
 * Get all shops for the current vendor
 */
export const getVendorShops = async (): Promise<Shop[]> => {
  const response = await apiClient.get<{ shops: Shop[] }>('/vendor/shops');
  return response.data.shops || [];
};

/**
 * Get shop details
 */
export const getShopDetails = async (shopId: string): Promise<Shop> => {
  const response = await apiClient.get<Shop>(`/vendor/shops/${shopId}`);
  return response.data;
};

/**
 * Switch to a different shop
 */
export const switchShop = async (shopId: string): Promise<Shop> => {
  const response = await apiClient.post<Shop>(`/vendor/shops/${shopId}/switch`, {});
  return response.data;
};

/**
 * Create a new shop
 */
export const createShop = async (shopData: Partial<Shop>): Promise<Shop> => {
  const response = await apiClient.post<{ data: Shop } | Shop>('/shops', shopData);
  // Handle both response structures: { data: Shop } or Shop directly
  if ('data' in response.data && response.data.data) {
    return response.data.data as Shop;
  }
  return response.data as Shop;
};

/**
 * Customer types
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  customerSince: string | null;
  status: 'active' | 'inactive' | 'vip';
  address: string;
  city: string;
  country: string;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  pages: number;
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    vipCustomers: number;
    inactiveCustomers: number;
  };
}

export interface GetCustomersParams {
  shopId: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'totalOrders' | 'totalSpent' | 'lastOrderDate';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get shop customers
 */
export const getShopCustomers = async (
  params: GetCustomersParams
): Promise<CustomersResponse> => {
  const { shopId, ...queryParams } = params;

  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const url = `/shops/${shopId}/customers${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<CustomersResponse>(url);
  return response.data;
};

/**
 * Vendor Authentication API
 * API functions for vendor authentication operations
 */

import type {
  VendorLoginForm,
  VendorRegisterForm,
  VendorLoginResponse,
  VendorRegisterResponse,
  VendorProfileResponse,
} from './types';
import { apiClient } from '@/lib/api-client';

/**
 * Vendor Login
 */
export const vendorLogin = async (
  credentials: Omit<VendorLoginForm, 'rememberMe'>
): Promise<VendorLoginResponse> => {
  const response = await apiClient.post('/auth/vendor/login', credentials);
  return response.data;
};

/**
 * Vendor Registration
 */
export const vendorRegister = async (
  data: Omit<VendorRegisterForm, 'confirmPassword' | 'agreeToTerms'>
): Promise<VendorRegisterResponse> => {
  const response = await apiClient.post('/auth/vendor/register', data);
  return response.data;
};

/**
 * Get Vendor Profile
 */
export const getVendorProfile = async (token: string): Promise<VendorProfileResponse> => {
  const response = await apiClient.get('/auth/vendor/profile');
  return response.data;
};

/**
 * Verify Shop Access
 */
export const verifyShopAccess = async (
  token: string,
  shopId: string
): Promise<{ hasAccess: boolean; shopId: string }> => {
  const response = await apiClient.get(`/auth/vendor/verify-shop/${shopId}`);
  return response.data;
};

/**
 * Vendor Logout (client-side)
 */
export const vendorLogout = (): void => {
  localStorage.removeItem('vendor_token');
  localStorage.removeItem('vendor_user');
  localStorage.removeItem('vendor_shop');
  sessionStorage.removeItem('vendor_token');
  sessionStorage.removeItem('vendor_user');
  sessionStorage.removeItem('vendor_shop');
};

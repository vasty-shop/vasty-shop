/**
 * API Client with automatic token refresh
 * Following teamatonce pattern for robust authentication
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from './token-manager';
import { useShopStore } from '@/stores/useShopStore';
import { BASE_URL } from '@/config/api.config';

const API_BASE_URL = BASE_URL;

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];
  private shopId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      // Don't set default Content-Type here - let it be determined per request
    });

    this.setupInterceptors();
  }

  /**
   * Set the shop ID for automatic header injection
   * @param shopId - The shop identifier
   */
  setShopId(shopId: string | null) {
    this.shopId = shopId;
  }

  /**
   * Get the current shop ID
   */
  getShopId(): string | null {
    return this.shopId;
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token, shop ID, and session ID to requests
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Set Content-Type header based on data type
        // IMPORTANT: Don't set Content-Type for FormData - let the browser set it with boundary
        if (config.headers && !(config.data instanceof FormData)) {
          config.headers['Content-Type'] = 'application/json';
        }

        // Determine shop ID to use
        // Priority: request params > programmatically set shopId > URL path > localStorage
        let shopIdToUse = this.shopId;

        // Check if shopId is in the request params (for store-specific requests)
        if (!shopIdToUse && config.params?.shopId) {
          shopIdToUse = config.params.shopId;
        }

        // Check if shopId is in the URL path (e.g., /store/{shopId}/... or /auth/store/{shopId}/...)
        if (!shopIdToUse && config.url) {
          const storeMatch = config.url.match(/\/store\/([a-f0-9-]+)/i);
          if (storeMatch) {
            shopIdToUse = storeMatch[1];
          }
        }

        if (!shopIdToUse) {
          // Fallback to localStorage if not set programmatically
          try {
            const vendorStorage = localStorage.getItem('vendor-auth-storage');
            if (vendorStorage) {
              const { state } = JSON.parse(vendorStorage);
              shopIdToUse = state?.shop?.id;
            }
          } catch {
            // Silently fail - shop ID is optional
          }
        }

        // Get auth token - prioritize main app token, then store-specific token
        let token = TokenManager.getToken();
        if (!token && shopIdToUse) {
          token = TokenManager.getStoreToken(shopIdToUse);
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (shopIdToUse && config.headers) {
          config.headers['x-shop-id'] = shopIdToUse;
        }

        // Add session ID for guest cart operations only
        // This is used when the user is not authenticated and accessing cart endpoints
        const isCartEndpoint = config.url?.includes('/cart');
        if (!token && isCartEndpoint && config.headers) {
          const sessionId = TokenManager.getSessionId();
          if (sessionId) {
            config.headers['x-session-id'] = sessionId;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log errors for debugging (skip expected errors)
        const isExpected404 = error.response?.status === 404 &&
          originalRequest?.url?.includes('/analytics');
        const isExpected401 = error.response?.status === 401 &&
          originalRequest?.url?.includes('/delivery/addresses');

        if (!isExpected404 && !isExpected401) {
          console.error('[API Client] Response error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: originalRequest?.url,
            data: error.response?.data
          });
        }

        // Handle missing shop context error (403 with specific message)
        if (error.response?.status === 403) {
          const errorData = error.response.data as any;
          if (errorData?.message?.includes('shop') || errorData?.code === 'MISSING_SHOP_CONTEXT') {
            console.error('[API Client] Missing shop context. Please select a shop.');
            // You can dispatch a notification or redirect here
          }
        }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.warn('[API Client] 401 Unauthorized - attempting token refresh');
          if (this.isRefreshing) {
            // Queue this request to retry after token refresh
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          const refreshToken = TokenManager.getRefreshToken();

          if (!refreshToken) {
            // No refresh token, clear everything and reject
            TokenManager.clearAll();
            this.processQueue(new Error('No refresh token available'), null);
            return Promise.reject(error);
          }

          try {
            // Attempt to refresh the token
            const response = await axios.post<RefreshResponse>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Update tokens
            TokenManager.setToken(accessToken);
            if (newRefreshToken) {
              TokenManager.setRefreshToken(newRefreshToken);
            }

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Process queued requests
            this.processQueue(null, accessToken);

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and reject
            TokenManager.clearAll();
            this.processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Public methods to make API calls
  get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  // Get the raw axios instance if needed
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

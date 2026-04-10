import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile, GenerationOptions, API_ENDPOINTS } from '../interfaces/types';

@Injectable()
export class RNApiClientTemplatesService {
  /**
   * Generate all API-related files
   */
  generateApiFiles(config: MobileAppConfig, options: GenerationOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Core API client
    files.push(this.generateApiClient(config, options));

    // API modules
    files.push(this.generateAuthApi());
    files.push(this.generateProductsApi());
    files.push(this.generateCategoriesApi());
    files.push(this.generateCartApi());
    files.push(this.generateWishlistApi());
    files.push(this.generateOrdersApi());
    files.push(this.generateDeliveryApi());
    files.push(this.generateNotificationsApi());
    files.push(this.generatePaymentApi());
    files.push(this.generateReviewsApi());
    files.push(this.generateOffersApi());
    files.push(this.generateShopApi());

    // Delivery Man specific APIs
    if (config.appType === 'delivery') {
      files.push(this.generateDeliveryManApi());
    }

    // API index export
    files.push(this.generateApiIndex(config));

    // Types
    files.push(this.generateApiTypes());

    return files;
  }

  /**
   * Generate core API client with axios
   */
  private generateApiClient(config: MobileAppConfig, options: GenerationOptions): GeneratedFile {
    return {
      path: 'src/api/client.ts',
      type: 'api',
      content: `import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

// API Configuration
const API_BASE_URL = Config.API_BASE_URL || '${options.apiBaseUrl || 'https://api.database.shop/api/v1'}';
const SHOP_ID = Config.SHOP_ID || '${config.shopId}';

// Storage keys
export const TOKEN_KEY = '@auth_token';
export const REFRESH_TOKEN_KEY = '@refresh_token';
export const USER_KEY = '@user';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-shop-id': SHOP_ID,
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(\`\${API_BASE_URL}/auth/refresh-token\`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;

          await AsyncStorage.setItem(TOKEN_KEY, token);
          if (newRefreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = \`Bearer \${token}\`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
        // Navigation to login will be handled by auth context
      }
    }

    return Promise.reject(error);
  }
);

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Helper function to extract data from response
export function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.error || response.data.message || 'Unknown error');
}

// API methods
export const api = {
  get: async <T>(url: string, params?: object): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return extractData(response);
  },

  post: async <T>(url: string, data?: object): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data || {});
    return extractData(response);
  },

  put: async <T>(url: string, data?: object): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data || {});
    return extractData(response);
  },

  patch: async <T>(url: string, data?: object): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data || {});
    return extractData(response);
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return extractData(response);
  },

  // Upload file
  upload: async <T>(url: string, formData: FormData): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData(response);
  },
};

export default apiClient;
`,
    };
  }

  /**
   * Generate Auth API
   */
  private generateAuthApi(): GeneratedFile {
    return {
      path: 'src/api/auth.ts',
      type: 'api',
      content: `import { api } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './client';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@types/api';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Store tokens
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    if (response.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

    return response;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Store tokens
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    if (response.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

    return response;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      // Ignore logout errors
    } finally {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/me', data);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
    return response;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Verify email
   */
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  resendVerification: async (): Promise<void> => {
    await api.post('/auth/resend-verification', {});
  },

  /**
   * Check if user is logged in (from storage)
   */
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  /**
   * Get stored user
   */
  getStoredUser: async (): Promise<User | null> => {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
};
`,
    };
  }

  /**
   * Generate Products API
   */
  private generateProductsApi(): GeneratedFile {
    return {
      path: 'src/api/products.ts',
      type: 'api',
      content: `import { api } from './client';
import { Product, PaginatedResponse, ProductFilters } from '@types/api';

export const productsApi = {
  /**
   * Get all products with pagination and filters
   */
  getProducts: async (params?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>('/products', params);
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    return api.get<Product>(\`/products/\${id}\`);
  },

  /**
   * Search products
   */
  searchProducts: async (query: string, params?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>('/products/search', { q: query, ...params });
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId: string, params?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    return api.get<PaginatedResponse<Product>>(\`/products/category/\${categoryId}\`, params);
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (limit?: number): Promise<Product[]> => {
    return api.get<Product[]>('/products/featured', { limit });
  },

  /**
   * Get bestseller products
   */
  getBestsellerProducts: async (limit?: number): Promise<Product[]> => {
    return api.get<Product[]>('/products/bestsellers', { limit });
  },

  /**
   * Get new arrivals
   */
  getNewArrivals: async (limit?: number): Promise<Product[]> => {
    return api.get<Product[]>('/products/new-arrivals', { limit });
  },

  /**
   * Get related products
   */
  getRelatedProducts: async (productId: string, limit?: number): Promise<Product[]> => {
    return api.get<Product[]>(\`/products/\${productId}/related\`, { limit });
  },
};
`,
    };
  }

  /**
   * Generate Categories API
   */
  private generateCategoriesApi(): GeneratedFile {
    return {
      path: 'src/api/categories.ts',
      type: 'api',
      content: `import { api } from './client';
import { Category } from '@types/api';

export const categoriesApi = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>('/categories');
  },

  /**
   * Get single category
   */
  getCategory: async (id: string): Promise<Category> => {
    return api.get<Category>(\`/categories/\${id}\`);
  },

  /**
   * Get category tree (hierarchical)
   */
  getCategoryTree: async (): Promise<Category[]> => {
    return api.get<Category[]>('/categories/tree');
  },

  /**
   * Get featured categories
   */
  getFeaturedCategories: async (limit?: number): Promise<Category[]> => {
    return api.get<Category[]>('/categories/featured', { limit });
  },
};
`,
    };
  }

  /**
   * Generate Cart API
   */
  private generateCartApi(): GeneratedFile {
    return {
      path: 'src/api/cart.ts',
      type: 'api',
      content: `import { api } from './client';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@types/api';

export const cartApi = {
  /**
   * Get user's cart
   */
  getCart: async (): Promise<Cart> => {
    return api.get<Cart>('/cart');
  },

  /**
   * Add item to cart
   */
  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    return api.post<Cart>('/cart/add', data);
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<Cart> => {
    return api.put<Cart>(\`/cart/update/\${itemId}\`, data);
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId: string): Promise<Cart> => {
    return api.delete<Cart>(\`/cart/remove/\${itemId}\`);
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    await api.delete('/cart/clear');
  },

  /**
   * Apply coupon code
   */
  applyCoupon: async (code: string): Promise<Cart> => {
    return api.post<Cart>('/cart/apply-coupon', { code });
  },

  /**
   * Remove coupon
   */
  removeCoupon: async (): Promise<Cart> => {
    return api.post<Cart>('/cart/remove-coupon', {});
  },

  /**
   * Get cart count (for badge)
   */
  getCartCount: async (): Promise<number> => {
    const cart = await api.get<Cart>('/cart');
    return cart.items?.length || 0;
  },
};
`,
    };
  }

  /**
   * Generate Wishlist API
   */
  private generateWishlistApi(): GeneratedFile {
    return {
      path: 'src/api/wishlist.ts',
      type: 'api',
      content: `import { api } from './client';
import { WishlistItem, Product } from '@types/api';

export const wishlistApi = {
  /**
   * Get user's wishlist
   */
  getWishlist: async (): Promise<WishlistItem[]> => {
    return api.get<WishlistItem[]>('/wishlist');
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId: string): Promise<WishlistItem> => {
    return api.post<WishlistItem>('/wishlist', { productId });
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId: string): Promise<void> => {
    await api.delete(\`/wishlist/\${productId}\`);
  },

  /**
   * Check if product is in wishlist
   */
  isInWishlist: async (productId: string): Promise<boolean> => {
    try {
      const result = await api.get<{ inWishlist: boolean }>(\`/wishlist/check/\${productId}\`);
      return result.inWishlist;
    } catch {
      return false;
    }
  },

  /**
   * Toggle wishlist (add if not in, remove if in)
   */
  toggleWishlist: async (productId: string): Promise<boolean> => {
    const isIn = await wishlistApi.isInWishlist(productId);
    if (isIn) {
      await wishlistApi.removeFromWishlist(productId);
      return false;
    } else {
      await wishlistApi.addToWishlist(productId);
      return true;
    }
  },

  /**
   * Get wishlist count
   */
  getWishlistCount: async (): Promise<number> => {
    const wishlist = await wishlistApi.getWishlist();
    return wishlist.length;
  },
};
`,
    };
  }

  /**
   * Generate Orders API
   */
  private generateOrdersApi(): GeneratedFile {
    return {
      path: 'src/api/orders.ts',
      type: 'api',
      content: `import { api } from './client';
import { Order, CreateOrderRequest, PaginatedResponse, OrderFilters } from '@types/api';

export const ordersApi = {
  /**
   * Get user's orders
   */
  getOrders: async (params?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    return api.get<PaginatedResponse<Order>>('/orders', params);
  },

  /**
   * Get single order
   */
  getOrder: async (id: string): Promise<Order> => {
    return api.get<Order>(\`/orders/\${id}\`);
  },

  /**
   * Create new order (checkout)
   */
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    return api.post<Order>('/orders', data);
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    return api.post<Order>(\`/orders/\${id}/cancel\`, { reason });
  },

  /**
   * Track order
   */
  trackOrder: async (id: string): Promise<{ status: string; updates: any[] }> => {
    return api.get(\`/orders/\${id}/track\`);
  },

  /**
   * Reorder (create order from previous order)
   */
  reorder: async (orderId: string): Promise<Order> => {
    return api.post<Order>(\`/orders/\${orderId}/reorder\`, {});
  },

  /**
   * Request return
   */
  requestReturn: async (orderId: string, reason: string, items?: string[]): Promise<void> => {
    await api.post(\`/orders/\${orderId}/return\`, { reason, items });
  },

  /**
   * Get active orders count
   */
  getActiveOrdersCount: async (): Promise<number> => {
    const result = await ordersApi.getOrders({ status: 'active' });
    return result.total || 0;
  },
};
`,
    };
  }

  /**
   * Generate Delivery API
   */
  private generateDeliveryApi(): GeneratedFile {
    return {
      path: 'src/api/delivery.ts',
      type: 'api',
      content: `import { api } from './client';
import { DeliveryAddress, DeliveryMethod, DeliveryCost } from '@types/api';

export const deliveryApi = {
  /**
   * Get user's delivery addresses
   */
  getAddresses: async (): Promise<DeliveryAddress[]> => {
    return api.get<DeliveryAddress[]>('/delivery/addresses');
  },

  /**
   * Get single address
   */
  getAddress: async (id: string): Promise<DeliveryAddress> => {
    return api.get<DeliveryAddress>(\`/delivery/addresses/\${id}\`);
  },

  /**
   * Add new address
   */
  addAddress: async (data: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress> => {
    return api.post<DeliveryAddress>('/delivery/addresses', data);
  },

  /**
   * Update address
   */
  updateAddress: async (id: string, data: Partial<DeliveryAddress>): Promise<DeliveryAddress> => {
    return api.put<DeliveryAddress>(\`/delivery/addresses/\${id}\`, data);
  },

  /**
   * Delete address
   */
  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(\`/delivery/addresses/\${id}\`);
  },

  /**
   * Set address as default
   */
  setDefaultAddress: async (id: string): Promise<DeliveryAddress> => {
    return api.patch<DeliveryAddress>(\`/delivery/addresses/\${id}/default\`, {});
  },

  /**
   * Get available delivery methods
   */
  getDeliveryMethods: async (): Promise<DeliveryMethod[]> => {
    return api.get<DeliveryMethod[]>('/delivery/methods');
  },

  /**
   * Calculate delivery cost
   */
  calculateDeliveryCost: async (addressId: string, methodId: string): Promise<DeliveryCost> => {
    return api.post<DeliveryCost>('/delivery/calculate', { addressId, methodId });
  },
};
`,
    };
  }

  /**
   * Generate Delivery Man API (for delivery app)
   */
  private generateDeliveryManApi(): GeneratedFile {
    return {
      path: 'src/api/deliveryMan.ts',
      type: 'api',
      content: `import { api } from './client';
import {
  DeliveryManDashboard,
  ActiveDelivery,
  DeliveryHistory,
  Earnings,
  DeliveryManProfile,
  DeliveryStatus
} from '@types/api';

export const deliveryManApi = {
  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<DeliveryManDashboard> => {
    return api.get<DeliveryManDashboard>('/delivery-man/dashboard');
  },

  /**
   * Get active deliveries
   */
  getActiveDeliveries: async (): Promise<ActiveDelivery[]> => {
    return api.get<ActiveDelivery[]>('/delivery-man/active');
  },

  /**
   * Get delivery history
   */
  getDeliveryHistory: async (params?: { page?: number; limit?: number }): Promise<DeliveryHistory> => {
    return api.get<DeliveryHistory>('/delivery-man/history', params);
  },

  /**
   * Get single delivery details
   */
  getDeliveryDetail: async (id: string): Promise<ActiveDelivery> => {
    return api.get<ActiveDelivery>(\`/delivery-man/delivery/\${id}\`);
  },

  /**
   * Accept delivery
   */
  acceptDelivery: async (id: string): Promise<ActiveDelivery> => {
    return api.post<ActiveDelivery>(\`/delivery-man/delivery/\${id}/accept\`, {});
  },

  /**
   * Update delivery status
   */
  updateDeliveryStatus: async (id: string, status: DeliveryStatus, notes?: string): Promise<ActiveDelivery> => {
    return api.patch<ActiveDelivery>(\`/delivery-man/delivery/\${id}/status\`, { status, notes });
  },

  /**
   * Mark delivery as picked up
   */
  markPickedUp: async (id: string): Promise<ActiveDelivery> => {
    return deliveryManApi.updateDeliveryStatus(id, 'picked_up');
  },

  /**
   * Mark delivery as completed
   */
  completeDelivery: async (id: string, proof?: { photo?: string; signature?: string; notes?: string }): Promise<ActiveDelivery> => {
    return api.post<ActiveDelivery>(\`/delivery-man/delivery/\${id}/complete\`, proof || {});
  },

  /**
   * Get earnings
   */
  getEarnings: async (period?: 'daily' | 'weekly' | 'monthly'): Promise<Earnings> => {
    return api.get<Earnings>('/delivery-man/earnings', { period });
  },

  /**
   * Get profile
   */
  getProfile: async (): Promise<DeliveryManProfile> => {
    return api.get<DeliveryManProfile>('/delivery-man/profile');
  },

  /**
   * Update profile
   */
  updateProfile: async (data: Partial<DeliveryManProfile>): Promise<DeliveryManProfile> => {
    return api.put<DeliveryManProfile>('/delivery-man/profile', data);
  },

  /**
   * Update current location
   */
  updateLocation: async (latitude: number, longitude: number): Promise<void> => {
    await api.post('/delivery-man/location', { latitude, longitude });
  },

  /**
   * Set availability status
   */
  setAvailability: async (available: boolean): Promise<void> => {
    await api.post('/delivery-man/availability', { available });
  },

  /**
   * Get today's stats
   */
  getTodayStats: async (): Promise<{ completed: number; earnings: number; distance: number }> => {
    return api.get('/delivery-man/stats/today');
  },
};
`,
    };
  }

  /**
   * Generate Notifications API
   */
  private generateNotificationsApi(): GeneratedFile {
    return {
      path: 'src/api/notifications.ts',
      type: 'api',
      content: `import { api } from './client';
import { Notification, NotificationSettings, PaginatedResponse } from '@types/api';

export const notificationsApi = {
  /**
   * Get all notifications
   */
  getNotifications: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Notification>> => {
    return api.get<PaginatedResponse<Notification>>('/notifications', params);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(\`/notifications/\${id}/read\`, {});
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all', {});
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const result = await api.get<{ count: number }>('/notifications/unread-count');
    return result.count;
  },

  /**
   * Get notification settings
   */
  getSettings: async (): Promise<NotificationSettings> => {
    return api.get<NotificationSettings>('/notifications/settings');
  },

  /**
   * Update notification settings
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    return api.put<NotificationSettings>('/notifications/settings', settings);
  },

  /**
   * Register device for push notifications
   */
  registerDevice: async (token: string, platform: 'ios' | 'android'): Promise<void> => {
    await api.post('/notifications/register-device', { token, platform });
  },

  /**
   * Unregister device
   */
  unregisterDevice: async (token: string): Promise<void> => {
    await api.post('/notifications/unregister-device', { token });
  },
};
`,
    };
  }

  /**
   * Generate Payment API
   */
  private generatePaymentApi(): GeneratedFile {
    return {
      path: 'src/api/payment.ts',
      type: 'api',
      content: `import { api } from './client';
import { PaymentMethod, PaymentIntent, WalletBalance } from '@types/api';

export const paymentApi = {
  /**
   * Get saved payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return api.get<PaymentMethod[]>('/payment/methods');
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (data: { type: string; token: string }): Promise<PaymentMethod> => {
    return api.post<PaymentMethod>('/payment/methods', data);
  },

  /**
   * Remove payment method
   */
  removePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(\`/payment/methods/\${id}\`);
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (id: string): Promise<void> => {
    await api.patch(\`/payment/methods/\${id}/default\`, {});
  },

  /**
   * Create payment intent
   */
  createPaymentIntent: async (orderId: string, methodId: string): Promise<PaymentIntent> => {
    return api.post<PaymentIntent>('/payment/create-intent', { orderId, methodId });
  },

  /**
   * Confirm payment
   */
  confirmPayment: async (intentId: string): Promise<{ success: boolean }> => {
    return api.post('/payment/confirm', { intentId });
  },

  /**
   * Get wallet balance
   */
  getWalletBalance: async (): Promise<WalletBalance> => {
    return api.get<WalletBalance>('/wallet/balance');
  },

  /**
   * Add money to wallet
   */
  addToWallet: async (amount: number, methodId: string): Promise<WalletBalance> => {
    return api.post<WalletBalance>('/wallet/add', { amount, methodId });
  },

  /**
   * Get wallet transactions
   */
  getWalletTransactions: async (params?: { page?: number; limit?: number }): Promise<any> => {
    return api.get('/wallet/transactions', params);
  },
};
`,
    };
  }

  /**
   * Generate Reviews API
   */
  private generateReviewsApi(): GeneratedFile {
    return {
      path: 'src/api/reviews.ts',
      type: 'api',
      content: `import { api } from './client';
import { Review, CreateReviewRequest, PaginatedResponse } from '@types/api';

export const reviewsApi = {
  /**
   * Get product reviews
   */
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Review>> => {
    return api.get<PaginatedResponse<Review>>(\`/reviews/product/\${productId}\`, params);
  },

  /**
   * Get user's reviews
   */
  getUserReviews: async (): Promise<Review[]> => {
    return api.get<Review[]>('/reviews/user');
  },

  /**
   * Add review
   */
  addReview: async (data: CreateReviewRequest): Promise<Review> => {
    return api.post<Review>('/reviews', data);
  },

  /**
   * Update review
   */
  updateReview: async (id: string, data: Partial<CreateReviewRequest>): Promise<Review> => {
    return api.put<Review>(\`/reviews/\${id}\`, data);
  },

  /**
   * Delete review
   */
  deleteReview: async (id: string): Promise<void> => {
    await api.delete(\`/reviews/\${id}\`);
  },

  /**
   * Mark review as helpful
   */
  markHelpful: async (id: string): Promise<void> => {
    await api.post(\`/reviews/\${id}/helpful\`, {});
  },
};
`,
    };
  }

  /**
   * Generate Offers API
   */
  private generateOffersApi(): GeneratedFile {
    return {
      path: 'src/api/offers.ts',
      type: 'api',
      content: `import { api } from './client';
import { Offer, Banner, FlashSale, Coupon } from '@types/api';

export const offersApi = {
  /**
   * Get active offers
   */
  getActiveOffers: async (): Promise<Offer[]> => {
    return api.get<Offer[]>('/offers/active');
  },

  /**
   * Get offer details
   */
  getOffer: async (id: string): Promise<Offer> => {
    return api.get<Offer>(\`/offers/\${id}\`);
  },

  /**
   * Get banners
   */
  getBanners: async (): Promise<Banner[]> => {
    return api.get<Banner[]>('/banners/active');
  },

  /**
   * Get active flash sales
   */
  getFlashSales: async (): Promise<FlashSale[]> => {
    return api.get<FlashSale[]>('/flash-sales/active');
  },

  /**
   * Get upcoming flash sales
   */
  getUpcomingFlashSales: async (): Promise<FlashSale[]> => {
    return api.get<FlashSale[]>('/flash-sales/upcoming');
  },

  /**
   * Validate coupon
   */
  validateCoupon: async (code: string): Promise<Coupon> => {
    return api.post<Coupon>('/coupons/validate', { code });
  },
};
`,
    };
  }

  /**
   * Generate Shop API
   */
  private generateShopApi(): GeneratedFile {
    return {
      path: 'src/api/shop.ts',
      type: 'api',
      content: `import { api } from './client';
import { Shop, StorefrontConfig } from '@types/api';

export const shopApi = {
  /**
   * Get shop info
   */
  getShopInfo: async (shopId: string): Promise<Shop> => {
    return api.get<Shop>(\`/shops/\${shopId}\`);
  },

  /**
   * Get storefront configuration
   */
  getStorefront: async (shopId: string): Promise<StorefrontConfig> => {
    return api.get<StorefrontConfig>(\`/shops/\${shopId}/storefront\`);
  },

  /**
   * Get shop products
   */
  getShopProducts: async (shopId: string, params?: any): Promise<any> => {
    return api.get(\`/shops/\${shopId}/products\`, params);
  },

  /**
   * Get shop categories
   */
  getShopCategories: async (shopId: string): Promise<any> => {
    return api.get(\`/shops/\${shopId}/categories\`);
  },

  /**
   * Get shop reviews
   */
  getShopReviews: async (shopId: string, params?: any): Promise<any> => {
    return api.get(\`/shops/\${shopId}/reviews\`, params);
  },
};
`,
    };
  }

  /**
   * Generate API index file
   */
  private generateApiIndex(config: MobileAppConfig): GeneratedFile {
    const isDelivery = config.appType === 'delivery';

    return {
      path: 'src/api/index.ts',
      type: 'api',
      content: `// API Client Exports
export { api, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './client';
export type { ApiResponse } from './client';

// API Modules
export { authApi } from './auth';
export { productsApi } from './products';
export { categoriesApi } from './categories';
export { cartApi } from './cart';
export { wishlistApi } from './wishlist';
export { ordersApi } from './orders';
export { deliveryApi } from './delivery';
export { notificationsApi } from './notifications';
export { paymentApi } from './payment';
export { reviewsApi } from './reviews';
export { offersApi } from './offers';
export { shopApi } from './shop';
${isDelivery ? "export { deliveryManApi } from './deliveryMan';" : ''}
`,
    };
  }

  /**
   * Generate API Types
   */
  private generateApiTypes(): GeneratedFile {
    return {
      path: 'src/types/api.ts',
      type: 'api',
      content: `// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'vendor' | 'delivery_man' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  thumbnail: string;
  categoryId: string;
  category?: Category;
  stock: number;
  sku?: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stock: number;
  sku?: string;
  options: { name: string; value: string }[];
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

// Cart Types
export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  coupon?: Coupon;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCost: number;
  total: number;
  shippingAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus | 'active';
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethodId: string;
  notes?: string;
}

// Delivery Types
export interface DeliveryAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  buildingNumber?: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description?: string;
  estimatedDays: string;
  price: number;
}

export interface DeliveryCost {
  cost: number;
  estimatedDays: string;
}

// Delivery Man Types
export interface DeliveryManDashboard {
  todayDeliveries: number;
  todayEarnings: number;
  activeDeliveries: number;
  rating: number;
  isAvailable: boolean;
}

export interface ActiveDelivery {
  id: string;
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
  customer: {
    name: string;
    phone: string;
    address: DeliveryAddress;
  };
  items: { name: string; quantity: number }[];
  total: number;
  pickupAddress: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryFee: number;
  distance: number;
  estimatedTime: string;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export type DeliveryStatus =
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface DeliveryHistory {
  deliveries: ActiveDelivery[];
  total: number;
  page: number;
  limit: number;
}

export interface Earnings {
  period: 'daily' | 'weekly' | 'monthly';
  total: number;
  deliveries: number;
  tips: number;
  bonuses: number;
  breakdown: { date: string; amount: number; deliveries: number }[];
}

export interface DeliveryManProfile {
  id: string;
  userId: string;
  user: User;
  vehicleType: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  rating: number;
  totalDeliveries: number;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cod';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: { name: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

// Offer Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  image?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  validFrom: string;
  validTo: string;
  products?: string[];
  categories?: string[];
}

export interface Banner {
  id: string;
  title?: string;
  image: string;
  link?: string;
  linkType?: 'product' | 'category' | 'offer' | 'external';
  linkId?: string;
}

export interface FlashSale {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  products: Product[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  address?: string;
  phone?: string;
  email?: string;
}

export interface StorefrontConfig {
  theme: any;
  sections: any[];
  navigation: any;
  published: boolean;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
`,
    };
  }
}

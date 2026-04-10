/**
 * API Service Layer
 * Centralized API calls for the application
 */

import { apiClient } from './api-client';
import { TokenManager } from './token-manager';

// ============================================
// RESPONSE HELPERS
// ============================================

/**
 * Extract array data from API response with consistent handling.
 * Backend may return: { data: [...] }, [...], or { data: { data: [...] } }
 * This helper normalizes all formats to return the array.
 */
function extractArrayData<T = any>(response: any): T[] {
  const data = response?.data;
  if (!data) return [];

  // If data itself is an array, return it
  if (Array.isArray(data)) return data;

  // If data has a nested data property that's an array, return it
  if (data.data && Array.isArray(data.data)) return data.data;

  // Fallback to empty array
  return [];
}

/**
 * Extract paginated response with consistent handling.
 * Returns { data: [...], total: number }
 */
function extractPaginatedData<T = any>(response: any): { data: T[]; total: number } {
  const data = response?.data;
  if (!data) return { data: [], total: 0 };

  // If data has the expected structure
  if (data.data !== undefined && data.total !== undefined) {
    return { data: Array.isArray(data.data) ? data.data : [], total: data.total };
  }

  // If data is an array directly (no pagination metadata)
  if (Array.isArray(data)) {
    return { data, total: data.length };
  }

  return { data: [], total: 0 };
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'vendor' | 'admin' | 'delivery_man';
  metadata?: {
    role?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Shop info returned from unified login
export interface AuthShop {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'pending' | 'active' | 'suspended' | 'closed';
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  shops?: AuthShop[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  role?: string;
}

export interface VendorRegisterData extends RegisterData {
  shopName: string;
  businessName?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: any;
}

// Team Management Types
export interface TeamMember {
  id: string;
  shopId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  permissions: string[];
  status: string;
  isActive: boolean;
  joinedAt?: string;
  invitedBy?: string;
  invitedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatar: string | null;
  };
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  message?: string;
}

export interface TeamRole {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

class API {
  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;

    TokenManager.setToken(accessToken);
    if (refreshToken) {
      TokenManager.setRefreshToken(refreshToken);
    }

    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    const { accessToken, refreshToken } = response.data;

    TokenManager.setToken(accessToken);
    if (refreshToken) {
      TokenManager.setRefreshToken(refreshToken);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      // Best effort - continue with local cleanup even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      TokenManager.clearAll();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = TokenManager.getRefreshToken();
    const response = await apiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', { refreshToken });
    TokenManager.setToken(response.data.accessToken);
    if (response.data.refreshToken) {
      TokenManager.setRefreshToken(response.data.refreshToken);
    }
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  }

  // ============================================
  // VENDOR AUTHENTICATION
  // ============================================

  async vendorLogin(credentials: LoginCredentials): Promise<any> {
    const response = await apiClient.post('/auth/vendor/login', credentials);
    const { accessToken, refreshToken } = response.data;

    TokenManager.setToken(accessToken);
    if (refreshToken) {
      TokenManager.setRefreshToken(refreshToken);
    }

    return response.data;
  }

  async vendorRegister(data: VendorRegisterData): Promise<any> {
    const response = await apiClient.post('/auth/vendor/register', data);
    const { accessToken, refreshToken } = response.data;

    TokenManager.setToken(accessToken);
    if (refreshToken) {
      TokenManager.setRefreshToken(refreshToken);
    }

    return response.data;
  }

  async getVendorProfile(): Promise<any> {
    const response = await apiClient.get('/auth/vendor/profile');
    return response.data;
  }

  async updateVendorProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: string;
  }): Promise<any> {
    const response = await apiClient.put('/auth/vendor/profile', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/auth/upload-avatar', formData);
    return response.data;
  }

  async verifyShopAccess(): Promise<any> {
    const response = await apiClient.get('/auth/vendor/verify-shop');
    return response.data;
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    shopId?: string;
    status?: string;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<any> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  }

  async getProductBySlug(slug: string): Promise<any> {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  }

  async getFeaturedProducts(limit = 10): Promise<any[]> {
    const response = await apiClient.get('/products/featured', { params: { limit } });
    return extractArrayData(response);
  }

  async searchProducts(query: string, params?: any): Promise<any> {
    const response = await apiClient.get('/products/search', { params: { q: query, ...params } });
    return response.data;
  }

  async getRelatedProducts(productId: string, limit = 6): Promise<any[]> {
    const response = await apiClient.get(`/products/${productId}/related`, { params: { limit } });
    return response.data;
  }

  // ============================================
  // CATEGORIES
  // ============================================

  async getCategories(): Promise<any[]> {
    const response = await apiClient.get('/categories');
    return extractArrayData(response);
  }

  async getCategoryTree(): Promise<any[]> {
    const response = await apiClient.get('/categories/tree');
    return response.data;
  }

  async getCategory(id: string): Promise<any> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<any> {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  }

  // ============================================
  // CART
  // ============================================

  async getCart(): Promise<any> {
    const response = await apiClient.get('/cart');
    return response.data;
  }

  async addToCart(productId: string, quantity: number, size?: string, color?: string): Promise<any> {
    const payload: any = { productId, quantity };

    // Add variant if size or color is provided
    if (size || color) {
      payload.variant = {};
      if (size) payload.variant.size = size;
      if (color) payload.variant.color = color;
    }

    // Include sessionId for guest users (when not authenticated)
    if (!TokenManager.hasToken()) {
      payload.sessionId = TokenManager.getSessionId();
    }

    const response = await apiClient.post('/cart/add', payload);
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<any> {
    const response = await apiClient.put(`/cart/item/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: string): Promise<any> {
    const response = await apiClient.delete(`/cart/item/${itemId}`);
    return response.data;
  }

  async clearCart(): Promise<any> {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  }

  async applyCoupon(code: string): Promise<any> {
    const payload: any = { code };

    // Include sessionId for guest users
    if (!TokenManager.hasToken()) {
      payload.sessionId = TokenManager.getSessionId();
    }

    const response = await apiClient.post('/cart/apply-coupon', payload);
    return response.data;
  }

  async removeCoupon(code: string): Promise<any> {
    const response = await apiClient.delete(`/cart/remove-coupon/${code}`);
    return response.data;
  }

  // ============================================
  // WISHLIST
  // ============================================

  async getWishlist(): Promise<any> {
    const response = await apiClient.get('/wishlist');
    return response.data;
  }

  async addToWishlist(productId: string): Promise<any> {
    const response = await apiClient.post('/wishlist/add', { productId });
    return response.data;
  }

  async removeFromWishlist(productId: string): Promise<any> {
    const response = await apiClient.delete(`/wishlist/remove/${productId}`);
    return response.data;
  }

  // ============================================
  // ORDERS
  // ============================================

  async createOrder(orderData: any): Promise<any> {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  }

  async getOrders(params?: any): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/orders', { params });
    const result = response.data;

    // Transform backend response to frontend format
    if (result.data && Array.isArray(result.data)) {
      result.data = result.data.map((order: any) => ({
        ...order,
        // Map createdAt to orderDate for frontend compatibility
        orderDate: order.orderDate || order.createdAt || order.created_at,
        // Ensure other date fields are properly mapped
        estimatedDelivery: order.estimatedDelivery || order.estimated_delivery,
        deliveryDate: order.deliveryDate || order.delivered_at || order.deliveredAt,
        // Map snake_case to camelCase for common fields
        orderNumber: order.orderNumber || order.order_number,
        trackingNumber: order.trackingNumber || order.tracking_number,
        paymentMethod: order.paymentMethod || order.payment_method,
        shippingAddress: order.shippingAddress || order.shipping_address,
        // Ensure items array exists
        items: (order.items || []).map((item: any) => ({
          ...item,
          productId: item.productId || item.product_id,
          productName: item.productName || item.product_name,
          productImage: item.productImage || item.product_image,
          shopId: item.shopId || item.shop_id,
          shopName: item.shopName || item.shop_name,
        })),
      }));
    }

    return result;
  }

  async getAdminOrders(params?: any): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/orders/admin/all', { params });
    return response.data;
  }

  async getAdminPayments(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: any[]; total: number; stats: any }> {
    const response = await apiClient.get('/orders/admin/payments', { params });
    return response.data;
  }

  async getOrder(id: string): Promise<any> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  }

  async getOrderByNumber(orderNumber: string): Promise<any> {
    const response = await apiClient.get(`/orders/number/${orderNumber}`);
    return response.data;
  }

  async trackOrder(trackingNumber: string): Promise<any> {
    const response = await apiClient.get(`/orders/track/${trackingNumber}`);
    const order = response.data;

    // Transform backend response to frontend format
    return {
      ...order,
      // Map createdAt to orderDate for frontend compatibility
      orderDate: order.orderDate || order.createdAt || order.created_at,
      createdAt: order.createdAt || order.created_at,
      // Ensure other date fields are properly mapped
      estimatedDelivery: order.estimatedDelivery || order.estimated_delivery,
      deliveryDate: order.deliveryDate || order.delivered_at || order.deliveredAt,
      // Map snake_case to camelCase for common fields
      orderNumber: order.orderNumber || order.order_number,
      trackingNumber: order.trackingNumber || order.tracking_number,
      paymentMethod: order.paymentMethod || order.payment_method,
      shippingAddress: order.shippingAddress || order.shipping_address,
      deliveryMethod: order.deliveryMethod || order.delivery_method,
    };
  }

  async cancelOrder(id: string, reason?: string, shopId?: string): Promise<any> {
    const response = await apiClient.post(`/orders/${id}/cancel`, { reason }, {
      params: shopId ? { shopId } : undefined,
    });
    return response.data;
  }

  async requestReturn(id: string, returnData: { reason: string; itemIds: string[]; notes?: string }): Promise<any> {
    const response = await apiClient.post(`/orders/${id}/return`, returnData);
    return response.data;
  }

  // ============================================
  // USER PROFILE
  // ============================================

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  }

  // ============================================
  // DELIVERY ADDRESSES
  // ============================================

  async getAddresses(): Promise<any[]> {
    // Only fetch if user has platform token (not store token)
    if (!TokenManager.hasToken()) {
      return [];
    }
    try {
      const response = await apiClient.get('/delivery/addresses');
      return response.data;
    } catch (error: any) {
      // Return empty array for 401 (not authenticated) - don't throw
      if (error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  }

  async getDeliveryMethods(): Promise<any[]> {
    const response = await apiClient.get('/delivery/methods');
    return response.data;
  }

  async getAddress(id: string): Promise<any> {
    const response = await apiClient.get(`/delivery/addresses/${id}`);
    return response.data;
  }

  async createAddress(data: any): Promise<any> {
    const response = await apiClient.post('/delivery/addresses', data);
    return response.data;
  }

  async updateAddress(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/delivery/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<any> {
    const response = await apiClient.delete(`/delivery/addresses/${id}`);
    return response.data;
  }

  async setDefaultAddress(id: string): Promise<any> {
    const response = await apiClient.patch(`/delivery/addresses/${id}/default`);
    return response.data;
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================

  async getPaymentMethods(): Promise<any> {
    const response = await apiClient.get('/payment/methods');
    return response.data;
  }

  async getShopPaymentMethods(shopId: string): Promise<any> {
    const response = await apiClient.get(`/payment/config/${shopId}`);
    return response.data;
  }

  // ============================================
  // CAMPAIGNS & OFFERS
  // ============================================

  async getCampaigns(params?: any): Promise<any> {
    const response = await apiClient.get('/campaigns', { params });
    return response.data;
  }

  async getCampaign(id: string): Promise<any> {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  }

  async getActiveCampaigns(): Promise<any[]> {
    const response = await apiClient.get('/campaigns/active');
    return response.data;
  }

  async getOffers(params?: any): Promise<any> {
    const response = await apiClient.get('/offers', { params });
    return response.data;
  }

  async validateCoupon(code: string, cartTotal?: number): Promise<any> {
    const response = await apiClient.post('/offers/validate', { code, cartTotal });
    return response.data;
  }

  async getCampaignBySlug(slug: string): Promise<any> {
    const response = await apiClient.get(`/campaigns/slug/${slug}`);
    return response.data;
  }

  async trackCampaignView(id: string): Promise<any> {
    const response = await apiClient.post(`/campaigns/${id}/track-view`, {});
    return response.data;
  }

  async trackCampaignClick(id: string): Promise<any> {
    const response = await apiClient.post(`/campaigns/${id}/track-click`, {});
    return response.data;
  }

  async getActiveOffers(): Promise<any[]> {
    const response = await apiClient.get('/offers/active');
    return response.data;
  }

  async getOffer(id: string): Promise<any> {
    const response = await apiClient.get(`/offers/${id}`);
    return response.data;
  }

  // ============================================
  // SHOPS
  // ============================================

  async getShops(params?: any): Promise<any> {
    const response = await apiClient.get('/shops', { params });
    return response.data;
  }

  async getMyShops(): Promise<any> {
    const response = await apiClient.get('/shops/my-shops');
    return response.data;
  }

  async getShop(id: string): Promise<any> {
    const response = await apiClient.get(`/shops/${id}`);
    return response.data;
  }

  async getShopBySlug(slug: string): Promise<any> {
    const response = await apiClient.get(`/shops/slug/${slug}`);
    return response.data;
  }

  async updateShop(data: any): Promise<any> {
    const response = await apiClient.put('/shops/current', data);
    return response.data;
  }

  // ============================================
  // STOREFRONT APIs
  // ============================================

  /**
   * Get a shop's published storefront configuration (public - no auth needed)
   * Accepts shopId (UUID) or slug
   */
  async getPublicStorefront(shopIdOrSlug: string): Promise<any> {
    // Determine if it's a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shopIdOrSlug);

    let shop: any = null;
    try {
      if (isUUID) {
        const response = await apiClient.get(`/shops/${shopIdOrSlug}`);
        shop = response.data;
      } else {
        const response = await apiClient.get(`/shops/slug/${shopIdOrSlug}`);
        shop = response.data;
      }
    } catch (error) {
      console.error('Failed to fetch shop for storefront:', error);
      throw error;
    }

    if (!shop) {
      throw new Error('Shop not found');
    }

    // Handle both camelCase and snake_case field names
    const storefrontConfig = shop.storefrontConfig || shop.storefront_config || {};
    const isPublished = shop.storefrontPublished ?? shop.storefront_published ?? false;
    const publishedAt = shop.storefrontPublishedAt || shop.storefront_published_at || null;

    return {
      ...storefrontConfig,
      config: storefrontConfig,
      published: isPublished,
      publishedAt: publishedAt,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        logo: shop.logo,
        banner: shop.banner,
        description: shop.description,
      },
    };
  }

  /**
   * Get the shop's storefront configuration (vendor - uses x-shop-id header)
   */
  async getStorefrontConfig(): Promise<any> {
    const response = await apiClient.get('/shops/current/storefront');
    return response.data;
  }

  /**
   * Save storefront configuration (vendor - uses x-shop-id header)
   */
  async saveStorefrontConfig(config: any): Promise<any> {
    const response = await apiClient.put('/shops/current/storefront', config);
    return response.data;
  }

  /**
   * Publish the storefront (vendor - uses x-shop-id header)
   */
  async publishStorefront(): Promise<any> {
    const response = await apiClient.post('/shops/current/storefront/publish', {});
    return response.data;
  }

  /**
   * Unpublish the storefront (vendor - uses x-shop-id header)
   */
  async unpublishStorefront(): Promise<any> {
    const response = await apiClient.delete('/shops/current/storefront/unpublish');
    return response.data;
  }

  // ============================================
  // MOBILE APP BUILDER APIs
  // ============================================

  /**
   * Get mobile app configuration (vendor - uses x-shop-id header)
   * Returns unified mobile app config with theme, navigation, features, etc.
   */
  async getMobileAppConfig(): Promise<any> {
    const response = await apiClient.get('/shops/mobile-config');
    return response.data;
  }

  /**
   * Create mobile app configuration (vendor - uses x-shop-id header)
   * Used for initial auto-generation from storefront builder
   * @param config - Mobile app configuration (theme, navigation, features, etc.)
   */
  async createMobileAppConfig(config: any): Promise<any> {
    const response = await apiClient.post('/shops/mobile-config', config);
    return response.data;
  }

  /**
   * Update mobile app configuration (vendor - uses x-shop-id header)
   * @param config - Mobile app configuration (theme, navigation, features, etc.)
   */
  async updateMobileAppConfig(config: any): Promise<any> {
    const response = await apiClient.put('/shops/mobile-config', config);
    return response.data;
  }

  /**
   * Upload app icon/logo to storage
   * Returns the uploaded icon URL
   */
  async uploadAppIcon(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/shops/upload-app-icon', formData);
    return response.data;
  }

  /**
   * Publish mobile app (vendor - uses x-shop-id header)
   * Marks the mobile app as published and sets published timestamp
   */
  async publishMobileApp(): Promise<any> {
    const response = await apiClient.post('/shops/mobile-config/publish', {});
    return response.data;
  }

  /**
   * Unpublish mobile app (vendor - uses x-shop-id header)
   * Marks the mobile app as unpublished
   */
  async unpublishMobileApp(): Promise<any> {
    const response = await apiClient.delete('/shops/mobile-config/unpublish');
    return response.data;
  }

  /**
   * Download mobile app with shop ID and app config injected (vendor - uses x-shop-id header)
   * Returns a ZIP file containing the pre-built mobile app with shop ID and app config in all .env files
   */
  async downloadMobileApp(appConfig?: {
    appName: string;
    packageName: string;
    versionCode: string;
    versionName: string;
  }): Promise<Blob> {
    const response = await apiClient.get('/shops/mobile-config/download', {
      params: appConfig,
      responseType: 'blob',
    });
    return response.data;
  }

  // ============================================
  // SHOP REVIEWS APIs
  // ============================================

  /**
   * Get reviews for a shop
   */
  async getShopReviews(shopId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  }): Promise<{
    data: any[];
    total: number;
    averageRating: number;
    ratingBreakdown: Record<number, number>;
  }> {
    const response = await apiClient.get(`/reviews/by-shop/${shopId}`, { params });
    return response.data;
  }

  /**
   * Submit a review for a shop
   */
  async submitShopReview(shopId: string, data: {
    rating: number;
    title?: string;
    comment: string;
    orderId?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/reviews`, { ...data, shopId });
    return response.data;
  }

  /**
   * Update a shop review
   */
  async updateShopReview(shopId: string, reviewId: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
  }): Promise<any> {
    const response = await apiClient.put(`/reviews/${reviewId}`, data);
    return response.data;
  }

  /**
   * Delete a shop review
   */
  async deleteShopReview(shopId: string, reviewId: string): Promise<void> {
    await apiClient.delete(`/reviews/${reviewId}`);
  }

  /**
   * Reply to a shop review (vendor only)
   */
  async replyToShopReview(shopId: string, reviewId: string, reply: string): Promise<any> {
    const response = await apiClient.post(`/reviews/${reviewId}/respond`, { response: reply }, {
      headers: { 'x-shop-id': shopId }
    });
    return response.data;
  }

  /**
   * Report a shop review
   */
  async reportShopReview(shopId: string, reviewId: string, reason: string): Promise<void> {
    await apiClient.post(`/reviews/${reviewId}/report`, { reason });
  }

  async getShopStatistics(): Promise<any> {
    const response = await apiClient.get('/shops/current/statistics');
    return response.data;
  }

  async getShopAnalytics(timeRange: string = '6m'): Promise<any> {
    try {
      const response = await apiClient.get(`/shops/current/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error: any) {
      // Analytics endpoint may not exist - return empty data silently
      if (error.response?.status === 404) {
        return {};
      }
      throw error;
    }
  }

  async uploadShopImage(file: File, type: 'logo' | 'banner'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    // Note: Do NOT set Content-Type header for FormData - browser handles boundary automatically
    const response = await apiClient.post('/shops/current/upload-image', formData);
    return response.data;
  }

  // ============================================
  // VENDOR ORDERS
  // ============================================

  async getVendorOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; total: number }> {
    // Use /orders/shop endpoint for vendor orders (filters by shop items)
    const response = await apiClient.get('/orders/shop', { params });
    return response.data;
  }

  async getVendorOrderStatistics(): Promise<any> {
    const response = await apiClient.get('/orders/shop/statistics');
    return response.data;
  }

  async getShopOrders(params?: any): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/orders/shop', { params });
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string, data?: any): Promise<any> {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status, ...data });
    return response.data;
  }

  async acceptOrder(orderId: string): Promise<any> {
    const response = await apiClient.post(`/orders/${orderId}/accept`, {});
    return response.data;
  }

  async markOrderAsShipped(orderId: string, trackingData?: { trackingNumber?: string; carrier?: string }): Promise<any> {
    const response = await apiClient.post(`/orders/${orderId}/ship`, trackingData || {});
    return response.data;
  }

  async cancelOrderByVendor(orderId: string, reason: string): Promise<any> {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason, cancelledBy: 'vendor' });
    return response.data;
  }

  // ============================================
  // VENDOR PRODUCTS
  // ============================================

  async getVendorProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    status?: string;
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/products/shop', { params });
    return response.data;
  }

  async createProduct(data: any): Promise<any> {
    const response = await apiClient.post('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<any> {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }

  async updateProductStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.patch(`/products/${id}/status`, { status });
    return response.data;
  }

  async updateProductInventory(id: string, data: any): Promise<any> {
    const response = await apiClient.patch(`/products/${id}/inventory`, data);
    return response.data;
  }

  async bulkEditProducts(data: {
    productIds: string[];
    action: 'update_status' | 'update_price' | 'update_inventory' | 'update_category' | 'delete';
    status?: string;
    priceAdjustmentType?: 'set' | 'increase' | 'decrease' | 'percentage_increase' | 'percentage_decrease';
    priceValue?: number;
    inventoryAdjustmentType?: 'set' | 'increase' | 'decrease';
    inventoryValue?: number;
    categoryId?: string;
  }): Promise<{
    successCount: number;
    failedCount: number;
    updatedProductIds: string[];
    errors: Array<{ productId: string; error: string }>;
  }> {
    const response = await apiClient.patch('/products/bulk', data);
    return response.data;
  }

  // ============================================
  // VENDOR CAMPAIGNS
  // ============================================

  async getVendorCampaigns(params?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/campaigns/shop', { params });
    return response.data;
  }

  async createCampaign(data: any): Promise<any> {
    const response = await apiClient.post('/campaigns', data);
    return response.data;
  }

  async updateCampaign(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/campaigns/${id}`, data);
    return response.data;
  }

  async deleteCampaign(id: string): Promise<any> {
    const response = await apiClient.delete(`/campaigns/${id}`);
    return response.data;
  }

  async updateCampaignStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.patch(`/campaigns/${id}/status`, { status });
    return response.data;
  }

  async getCampaignAnalytics(id: string): Promise<any> {
    const response = await apiClient.get(`/campaigns/${id}/analytics`);
    return response.data;
  }

  // ============================================
  // VENDOR CATEGORIES
  // ============================================

  async getVendorCategories(): Promise<any[]> {
    // Use public categories endpoint - categories are platform-wide, not shop-specific
    const response = await apiClient.get('/categories');
    return extractArrayData(response);
  }

  async createCategory(data: any): Promise<any> {
    const response = await apiClient.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<any> {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  }

  async toggleCategoryFeatured(id: string): Promise<any> {
    const response = await apiClient.patch(`/categories/${id}/featured`, {});
    return response.data;
  }

  // ============================================
  // VENDOR CUSTOMERS
  // ============================================

  async getVendorCustomers(params?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/customers/shop', { params });
    return response.data;
  }

  async getVendorCustomerDetails(customerId: string): Promise<any> {
    const response = await apiClient.get(`/customers/shop/${customerId}`);
    return response.data;
  }

  async getVendorCustomerOrders(customerId: string): Promise<any[]> {
    const response = await apiClient.get(`/customers/shop/${customerId}/orders`);
    return response.data;
  }

  async exportVendorCustomers(): Promise<any> {
    const response = await apiClient.get('/customers/shop/export', { responseType: 'blob' });
    return response.data;
  }

  // ============================================
  // VENDOR DELIVERY
  // ============================================

  async getVendorDeliveryMethods(): Promise<any[]> {
    // Use public delivery methods endpoint
    const response = await apiClient.get('/delivery/methods');
    return response.data;
  }

  async createDeliveryMethod(data: any): Promise<any> {
    const response = await apiClient.post('/delivery/methods', data);
    return response.data;
  }

  async updateDeliveryMethod(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/delivery/methods/${id}`, data);
    return response.data;
  }

  async deleteDeliveryMethod(id: string): Promise<any> {
    const response = await apiClient.delete(`/delivery/methods/${id}`);
    return response.data;
  }

  async toggleDeliveryMethod(id: string): Promise<any> {
    const response = await apiClient.patch(`/delivery/methods/${id}/toggle`);
    return response.data;
  }

  async getVendorShippingZones(): Promise<any[]> {
    const response = await apiClient.get('/delivery/zones/shop');
    return response.data;
  }

  async createShippingZone(data: any): Promise<any> {
    const response = await apiClient.post('/delivery/zones', data);
    return response.data;
  }

  async updateShippingZone(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/delivery/zones/${id}`, data);
    return response.data;
  }

  async deleteShippingZone(id: string): Promise<any> {
    const response = await apiClient.delete(`/delivery/zones/${id}`);
    return response.data;
  }

  async getVendorShipments(params?: any): Promise<any[]> {
    // Get all orders and filter to those with tracking info
    const response = await apiClient.get('/orders/shop', {
      params: {
        ...params,
        limit: 100
      }
    });
    // Transform orders to shipment format - only include orders with tracking number
    const orders = response.data?.data || response.data || [];
    return orders
      .filter((order: any) => order.trackingNumber || order.tracking_number)
      .map((order: any) => {
        const carrier = order.carrier || 'Own Delivery';
        const deliveryManName = order.deliveryManName || order.delivery_man_name || '';
        // Show delivery man name if carrier is Own Delivery Man, otherwise show carrier
        const displayCarrier = carrier === 'Own Delivery Man' && deliveryManName
          ? deliveryManName
          : carrier;

        return {
          id: order.id,
          orderId: order.orderNumber || order.order_number || order.id?.slice(0, 8),
          customer: order.shippingAddress?.name || order.shippingAddress?.fullName || order.shipping_address?.name || 'Customer',
          method: order.deliveryMethod || order.delivery_method || 'Standard',
          carrier: displayCarrier,
          trackingNumber: order.trackingNumber || order.tracking_number || '',
          status: order.status,
          shippedDate: order.updatedAt || order.updated_at || order.createdAt || order.created_at,
          estimatedDelivery: order.estimatedDelivery || order.estimated_delivery || '',
          createdAt: order.createdAt || order.created_at
        };
      });
  }

  async createShipment(data: {
    orderId: string;
    customer: string;
    method: string;
    carrier: string;
    deliveryManName?: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery: string;
  }): Promise<any> {
    // Update the order with shipping/tracking info
    // Only update status if it's 'shipped' - otherwise just add tracking info
    const updateData: Record<string, any> = {
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery,
      deliveryMethod: data.method,
      deliveryManName: data.deliveryManName || ''
    };

    // Only include status if explicitly set to shipped
    if (data.status === 'shipped') {
      updateData.status = 'shipped';
    }

    const response = await apiClient.patch(`/orders/${data.orderId}/status`, updateData);
    return response.data;
  }

  async updateShipment(id: string, data: {
    orderId?: string;
    customer?: string;
    method?: string;
    carrier?: string;
    trackingNumber?: string;
    status?: string;
    estimatedDelivery?: string;
  }): Promise<any> {
    // Update the order with shipping info
    const response = await apiClient.patch(`/orders/${id}/status`, {
      status: data.status,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery
    });
    return response.data;
  }

  // ============================================
  // VENDOR OFFERS
  // ============================================

  async getVendorOffers(params?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/offers/shop', { params });
    return response.data;
  }

  async createOffer(data: any): Promise<any> {
    const response = await apiClient.post('/offers', data);
    return response.data;
  }

  async updateOffer(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/offers/${id}`, data);
    return response.data;
  }

  async deleteOffer(id: string): Promise<any> {
    const response = await apiClient.delete(`/offers/${id}`);
    return response.data;
  }

  async changeOfferStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.patch(`/offers/${id}/status`, { status });
    return response.data;
  }

  // ============================================
  // CUSTOMER REVIEWS
  // ============================================

  async createReview(data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    shopId?: string; // Optional shopId for store-specific auth
  }): Promise<any> {
    // Map frontend field names to backend DTO field names
    const payload = {
      productId: data.productId,
      rating: data.rating,
      title: data.title,
      reviewText: data.comment, // Backend expects 'reviewText' not 'comment'
      images: data.images,
    };
    // Pass shopId in params so api-client can use store-specific token
    const response = await apiClient.post('/reviews', payload, {
      params: data.shopId ? { shopId: data.shopId } : undefined
    });
    return response.data;
  }

  async getProductReviews(productId: string, params?: {
    rating?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get(`/reviews/product/${productId}`, { params });
    const rawData = response.data?.data || response.data || [];

    // Map backend fields to frontend expected fields (handle both camelCase and snake_case)
    const mappedData = rawData.map((review: any) => ({
      ...review,
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.review_text || review.reviewText || review.comment,
      userName: review.userName || review.user_name || review.user?.name || 'Anonymous',
      userAvatar: review.userAvatar || review.user_avatar || review.user?.avatar,
      createdAt: review.created_at || review.createdAt,
      verified: review.is_verified_purchase || review.isVerifiedPurchase || review.verified,
      helpful: review.helpful_count || review.helpfulCount || review.helpful || 0,
      images: review.review_images || review.reviewImages || review.images || [],
    }));

    return {
      data: mappedData,
      total: response.data?.count || response.data?.total || 0
    };
  }

  async markReviewHelpful(reviewId: string): Promise<any> {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`, {});
    return response.data;
  }

  async getUserReviews(): Promise<any[]> {
    const response = await apiClient.get('/reviews/user/me');
    return response.data?.data || response.data || [];
  }

  async getAdminReviews(params?: {
    rating?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; count: number; stats: any }> {
    const response = await apiClient.get('/reviews/admin/all', { params });
    return response.data;
  }

  // ============================================
  // VENDOR REVIEWS
  // ============================================

  async getVendorReviews(params?: {
    rating?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/reviews/shop', { params });
    // Backend returns { data: [], count: number }, transform to { data: [], total: number }
    // Handle error responses or unexpected formats
    if (!response.data || typeof response.data !== 'object') {
      console.error('[API] Unexpected response format from /reviews/shop:', response.data);
      return { data: [], total: 0 };
    }

    return {
      data: response.data.data || [],
      total: response.data.count || 0
    };
  }

  async replyToReview(reviewId: string, reply: string): Promise<any> {
    const response = await apiClient.post(`/reviews/${reviewId}/respond`, {
      responseText: reply
    });
    return response.data;
  }

  async updateReviewReply(reviewId: string, reply: string): Promise<any> {
    // Backend uses same endpoint for both create and update
    const response = await apiClient.post(`/reviews/${reviewId}/respond`, {
      responseText: reply
    });
    return response.data;
  }

  async toggleReviewFeatured(reviewId: string): Promise<any> {
    const response = await apiClient.patch(`/reviews/${reviewId}/featured`, {});
    return response.data;
  }

  async toggleReviewVisibility(reviewId: string): Promise<any> {
    const response = await apiClient.patch(`/reviews/${reviewId}/visibility`, {});
    return response.data;
  }

  async reportReview(reviewId: string, reason: string, details?: string): Promise<any> {
    const response = await apiClient.post(`/reviews/${reviewId}/report`, {
      reason,
      details: details || `Reported for: ${reason}`
    });
    return response.data;
  }

  async getReviewStatistics(): Promise<any> {
    const response = await apiClient.get('/reviews/shop/statistics');
    return response.data;
  }

  // ============================================
  // VENDOR TEAM
  // ============================================

  async getVendorTeam(): Promise<TeamMember[]> {
    const response = await apiClient.get('/shops/current/team');
    return response.data?.data || response.data || [];
  }

  async getTeamInvitations(): Promise<TeamInvitation[]> {
    const response = await apiClient.get('/shops/current/team/invitations');
    return response.data?.invitations || response.data || [];
  }

  async getAvailableRoles(): Promise<TeamRole[]> {
    const response = await apiClient.get('/shops/current/team/roles');
    return response.data?.roles || response.data || [];
  }

  async inviteTeamMember(data: {
    email: string;
    role: string;
    permissions?: string[];
    message?: string;
  }): Promise<any> {
    const response = await apiClient.post('/shops/current/team/invite', data);
    return response.data;
  }

  async updateTeamMemberRole(memberId: string, data: {
    role: string;
    permissions?: string[];
  }): Promise<any> {
    const response = await apiClient.patch(`/shops/current/team/${memberId}/role`, data);
    return response.data;
  }

  async removeTeamMember(memberId: string): Promise<any> {
    const response = await apiClient.delete(`/shops/current/team/${memberId}`);
    return response.data;
  }

  async resendInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.post(`/shops/current/team/invitations/${invitationId}/resend`, {});
    return response.data;
  }

  async cancelInvitation(invitationId: string): Promise<any> {
    const response = await apiClient.delete(`/shops/current/team/invitations/${invitationId}`);
    return response.data;
  }

  // Kept for backward compatibility
  async updateTeamMember(memberId: string, data: {
    role?: string;
    permissions?: string[];
  }): Promise<any> {
    return this.updateTeamMemberRole(memberId, {
      role: data.role || 'staff',
      permissions: data.permissions
    });
  }

  async suspendTeamMember(memberId: string): Promise<any> {
    // Suspend is implemented as removing (soft delete with is_active=false)
    return this.removeTeamMember(memberId);
  }

  async activateTeamMember(memberId: string): Promise<any> {
    // Re-invite member if needed
    throw new Error('To reactivate a member, please send a new invitation');
  }

  async getTeamActivity(_params?: any): Promise<any[]> {
    // TODO: Implement activity log endpoint
    return [];
  }

  // ============================================
  // CONTEXT MANAGEMENT
  // ============================================

  /**
   * Set the shop ID context for automatic header injection
   * Use this in useEffect when shopId is extracted from URL params
   * @param shopId - The shop identifier from URL params
   */
  setShopId(shopId: string | null) {
    apiClient.setShopId(shopId);
  }

  /**
   * Get the current shop ID context
   */
  getShopId(): string | null {
    return apiClient.getShopId();
  }

  /**
   * Upload product image to storage
   * Returns the uploaded image URL
   */
  async uploadProductImage(file: File): Promise<{ url: string; fileName: string; size: number; mimeType: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/products/upload-image', formData);
    return response.data;
  }

  // ============================================
  // ADMIN - USER MODERATION
  // ============================================

  async getAdminUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; totalPages: number; stats?: any }> {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  }

  async getAdminUserDetails(userId: string): Promise<any> {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  }

  async getAdminUserOrders(userId: string): Promise<{ data: any[] }> {
    const response = await apiClient.get(`/admin/users/${userId}/orders`);
    return response.data;
  }

  async getAdminUserShops(userId: string): Promise<{ data: any[] }> {
    const response = await apiClient.get(`/admin/users/${userId}/shops`);
    return response.data;
  }

  async updateAdminUserRole(userId: string, role: string): Promise<any> {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  async updateAdminUserStatus(userId: string, status: string): Promise<any> {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  }

  async deleteAdminUser(userId: string): Promise<any> {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async bulkActionAdminUsers(userIds: string[], action: string): Promise<any> {
    const response = await apiClient.post('/admin/users/bulk-action', { userIds, action });
    return response.data;
  }

  async exportAdminUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<any> {
    const response = await apiClient.get('/admin/users/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // ============================================
  // ADMIN - SHOP APPROVALS
  // ============================================

  async getAdminShops(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/admin/shops', { params });
    return response.data;
  }

  async approveShop(shopId: string): Promise<any> {
    const response = await apiClient.patch(`/admin/shops/${shopId}/approve`, {});
    return response.data;
  }

  async rejectShop(shopId: string, reason: string): Promise<any> {
    const response = await apiClient.patch(`/admin/shops/${shopId}/reject`, { reason });
    return response.data;
  }

  // ============================================
  // ADMIN ANALYTICS
  // ============================================

  /**
   * Get platform overview statistics
   */
  async getAdminOverviewStats(params?: { dateRange?: string }): Promise<any> {
    const response = await apiClient.get('/admin/analytics/overview', { params });
    return response.data;
  }

  /**
   * Get platform revenue data for charts
   */
  async getAdminRevenueData(params?: { dateRange?: string; timeframe?: string }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/revenue', { params });
    return extractArrayData(response);
  }

  /**
   * Get platform orders data
   */
  async getAdminOrdersData(params?: { dateRange?: string; timeframe?: string }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/orders', { params });
    return extractArrayData(response);
  }

  /**
   * Get user registration trends
   */
  async getAdminUsersData(params?: { dateRange?: string; timeframe?: string }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/users', { params });
    return extractArrayData(response);
  }

  /**
   * Get category sales data
   */
  async getAdminCategoriesData(params?: { dateRange?: string }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/categories', { params });
    return extractArrayData(response);
  }

  /**
   * Get top performing shops
   */
  async getAdminTopShops(params?: { dateRange?: string; limit?: number }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/top-shops', { params });
    return extractArrayData(response);
  }

  /**
   * Get top selling products
   */
  async getAdminTopProducts(params?: { dateRange?: string; limit?: number }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/top-products', { params });
    return extractArrayData(response);
  }

  /**
   * Get top spending customers
   */
  async getAdminTopCustomers(params?: { dateRange?: string; limit?: number }): Promise<any[]> {
    const response = await apiClient.get('/admin/analytics/top-customers', { params });
    return extractArrayData(response);
  }

  // ============================================
  // ADMIN - GLOBAL SETTINGS
  // ============================================

  /**
   * Get public platform settings (no auth required - for landing page)
   */
  async getPublicPlatformSettings(): Promise<{
    platformName: string;
    platformLogo: string;
    supportEmail: string;
    defaultCurrency: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  }> {
    const response = await apiClient.get('/admin/platform-settings');
    return response.data;
  }

  /**
   * Get all global platform settings (admin only)
   */
  async getGlobalSettings(): Promise<any> {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  }

  /**
   * Update global platform settings (admin only)
   */
  async updateGlobalSettings(settings: any): Promise<any> {
    const response = await apiClient.patch('/admin/settings', settings);
    return response.data;
  }

  /**
   * Upload platform logo (admin only)
   */
  async uploadPlatformLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/admin/settings/logo', formData);
    return response.data;
  }

  // ============================================
  // CMS - CONTENT MANAGEMENT SYSTEM
  // ============================================

  /**
   * Get public page content by slug
   */
  async getPageContent(slug: string): Promise<any> {
    const response = await apiClient.get(`/cms/pages/public/${slug}`);
    return response.data?.data || response.data;
  }

  /**
   * Get public site settings
   */
  async getPublicSiteSettings(): Promise<Record<string, any>> {
    const response = await apiClient.get('/cms/settings/public');
    return response.data?.data || response.data || {};
  }

  /**
   * Get all CMS pages (admin only)
   */
  async getCmsPages(includeArchived?: boolean): Promise<{ data: any[]; total: number }> {
    const response = await apiClient.get('/cms/pages', {
      params: { includeArchived: includeArchived ? 'true' : undefined }
    });
    return response.data;
  }

  /**
   * Get CMS page by ID (admin only)
   */
  async getCmsPageById(id: string): Promise<any> {
    const response = await apiClient.get(`/cms/pages/${id}`);
    return response.data?.data || response.data;
  }

  /**
   * Create CMS page (admin only)
   */
  async createCmsPage(data: {
    slug: string;
    title: string;
    content: Record<string, any>;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    template?: string;
    headerImage?: string;
    showBreadcrumb?: boolean;
    showTableOfContents?: boolean;
    status?: string;
    isPublic?: boolean;
    requiresAuth?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/cms/pages', data);
    return response.data?.data || response.data;
  }

  /**
   * Update CMS page (admin only)
   */
  async updateCmsPage(id: string, data: Partial<{
    slug: string;
    title: string;
    content: Record<string, any>;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    template?: string;
    headerImage?: string;
    showBreadcrumb?: boolean;
    showTableOfContents?: boolean;
    status?: string;
    isPublic?: boolean;
    requiresAuth?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/cms/pages/${id}`, data);
    return response.data?.data || response.data;
  }

  /**
   * Delete CMS page (admin only)
   */
  async deleteCmsPage(id: string): Promise<void> {
    await apiClient.delete(`/cms/pages/${id}`);
  }

  /**
   * Publish CMS page (admin only)
   */
  async publishCmsPage(id: string): Promise<any> {
    const response = await apiClient.post(`/cms/pages/${id}/publish`, {});
    return response.data?.data || response.data;
  }

  /**
   * Unpublish CMS page (admin only)
   */
  async unpublishCmsPage(id: string): Promise<any> {
    const response = await apiClient.post(`/cms/pages/${id}/unpublish`, {});
    return response.data?.data || response.data;
  }

  /**
   * Get all CMS settings (admin only)
   */
  async getCmsSettings(): Promise<{ data: any[] }> {
    const response = await apiClient.get('/cms/settings');
    return response.data;
  }

  /**
   * Update CMS setting (admin only)
   */
  async updateCmsSetting(key: string, data: {
    value: any;
    group?: string;
    valueType?: string;
    label?: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`/cms/settings/${key}`, data);
    return response.data?.data || response.data;
  }

  /**
   * Bulk update CMS settings (admin only)
   */
  async bulkUpdateCmsSettings(settings: Array<{
    key: string;
    value: any;
    group?: string;
    isPublic?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put('/cms/settings', { settings });
    return response.data;
  }

  // ============================================
  // ADMIN - DASHBOARD
  // ============================================

  /**
   * Get admin dashboard statistics
   */
  async getAdminDashboardStats(): Promise<any> {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data?.data || response.data;
  }

  /**
   * Get admin recent activity
   */
  async getAdminRecentActivity(limit?: number): Promise<{ data: any[] }> {
    const response = await apiClient.get('/admin/dashboard/activity', {
      params: { limit: limit || 10 }
    });
    return response.data;
  }

  // ============================================
  // ADMIN REPORTS
  // ============================================

  /**
   * Generate sales report
   */
  async getAdminSalesReport(params?: { startDate?: string; endDate?: string }): Promise<{
    summary: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      topPaymentMethod: string;
    };
    data: any[];
    generatedAt: string;
  }> {
    const response = await apiClient.get('/admin/reports/sales', { params });
    return response.data?.data || response.data;
  }

  /**
   * Generate users report
   */
  async getAdminUsersReport(params?: { startDate?: string; endDate?: string }): Promise<{
    summary: {
      totalUsers: number;
      newUsersThisPeriod: number;
      activeUsers: number;
      vendorCount: number;
    };
    data: any[];
    generatedAt: string;
  }> {
    const response = await apiClient.get('/admin/reports/users', { params });
    return response.data?.data || response.data;
  }

  /**
   * Generate shops report
   */
  async getAdminShopsReport(params?: { startDate?: string; endDate?: string }): Promise<{
    summary: {
      totalShops: number;
      activeShops: number;
      pendingApproval: number;
      suspendedShops: number;
    };
    data: any[];
    generatedAt: string;
  }> {
    const response = await apiClient.get('/admin/reports/shops', { params });
    return response.data?.data || response.data;
  }

  /**
   * Generate products report
   */
  async getAdminProductsReport(params?: { startDate?: string; endDate?: string }): Promise<{
    summary: {
      totalProducts: number;
      activeProducts: number;
      outOfStock: number;
      averagePrice: number;
    };
    data: any[];
    generatedAt: string;
  }> {
    const response = await apiClient.get('/admin/reports/products', { params });
    return response.data?.data || response.data;
  }

  // ============================================
  // CONTACT FORM
  // ============================================

  /**
   * Submit contact form
   */
  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<any> {
    const response = await apiClient.post('/contact', data);
    return response.data;
  }

  // ============================================
  // PROMO CODES
  // ============================================

  /**
   * Validate promo code
   */
  async validatePromoCode(code: string): Promise<{ valid: boolean; discount?: number; discountType?: string }> {
    const response = await apiClient.post('/cart/validate-promo', { code });
    return response.data?.data || response.data;
  }

  // ============================================
  // AUTH - EMAIL VERIFICATION
  // ============================================

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<any> {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<any> {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  }

  // ============================================
  // EXPORT / IMPORT
  // ============================================

  /**
   * Export data to CSV or JSON
   */
  async exportData(params: {
    type: 'products' | 'orders' | 'customers' | 'categories' | 'reviews' | 'coupons' | 'campaigns' | 'shops';
    format?: 'csv' | 'json';
    shopId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    categoryId?: string;
    columns?: string[];
  }): Promise<Blob> {
    const response = await apiClient.post('/export', params, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Download export as file
   */
  async downloadExport(params: {
    type: 'products' | 'orders' | 'customers' | 'categories' | 'reviews' | 'coupons' | 'campaigns' | 'shops';
    format?: 'csv' | 'json';
    shopId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    categoryId?: string;
  }): Promise<void> {
    const blob = await this.exportData(params);
    const format = params.format || 'csv';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${params.type}-export-${timestamp}.${format}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get import template CSV
   */
  async getImportTemplate(type: 'products' | 'orders' | 'customers' | 'categories' | 'reviews' | 'coupons' | 'campaigns' | 'shops'): Promise<void> {
    const response = await apiClient.get(`/export/template/${type}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-import-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Import data from CSV file
   */
  async importData(params: {
    type: 'products' | 'orders' | 'customers' | 'categories' | 'reviews' | 'coupons' | 'campaigns' | 'shops';
    file: File;
    shopId?: string;
    updateExisting?: boolean;
    skipErrors?: boolean;
  }): Promise<{
    totalRows: number;
    successCount: number;
    failedCount: number;
    skippedCount: number;
    errors: Array<{ row: number; field?: string; message: string }>;
    createdIds: string[];
    updatedIds: string[];
  }> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('type', params.type);
    if (params.shopId) formData.append('shopId', params.shopId);
    if (params.updateExisting !== undefined) formData.append('updateExisting', String(params.updateExisting));
    if (params.skipErrors !== undefined) formData.append('skipErrors', String(params.skipErrors));

    const response = await apiClient.post('/export/import', formData);
    return response.data;
  }

  /**
   * Get available export types
   */
  async getExportTypes(): Promise<{ types: Array<{ value: string; label: string }> }> {
    const response = await apiClient.get('/export/types');
    return response.data;
  }

  // ============================================
  // WALLET
  // ============================================

  /**
   * Get user wallet
   */
  async getWallet(): Promise<any> {
    const response = await apiClient.get('/wallet');
    return response.data;
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<{ balance: number; pendingBalance: number; currency: string; status: string }> {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  }

  /**
   * Create top-up payment intent
   */
  async createTopupIntent(amount: number, currency: string = 'usd'): Promise<{ topupId: string; clientSecret: string; amount: number; currency: string }> {
    const response = await apiClient.post('/wallet/topup/intent', { amount, currency });
    return response.data;
  }

  /**
   * Confirm top-up after payment
   */
  async confirmTopup(topupId: string, paymentIntentId: string): Promise<{ success: boolean; newBalance: number; amount: number; message: string }> {
    const response = await apiClient.post('/wallet/topup/confirm', { topupId, paymentIntentId });
    return response.data;
  }

  /**
   * Transfer funds to another user
   */
  async transferFunds(recipientId: string, amount: number, description?: string): Promise<{ success: boolean; newBalance: number; amount: number; recipientId: string; message: string }> {
    const response = await apiClient.post('/wallet/transfer', { recipientId, amount, description });
    return response.data;
  }

  /**
   * Pay for order with wallet
   */
  async payWithWallet(orderId: string, amount: number): Promise<{ success: boolean; newBalance: number; transactionId: string; message: string }> {
    const response = await apiClient.post('/wallet/pay', { orderId, amount });
    return response.data;
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(params?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/wallet/transactions', { params });
    return response.data;
  }

  // ============================================
  // REFUNDS
  // ============================================

  /**
   * Create refund request
   */
  async createRefundRequest(data: {
    orderId: string;
    reason: string;
    description?: string;
    images?: string[];
    items?: Array<{ orderItemId: string; quantity: number; reason?: string }>;
    preferredMethod?: 'original_payment' | 'wallet';
  }): Promise<any> {
    const response = await apiClient.post('/refunds', data);
    return response.data;
  }

  /**
   * Get user refund requests
   */
  async getRefunds(params?: {
    status?: string;
    orderId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/refunds', { params });
    return response.data;
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string): Promise<any> {
    const response = await apiClient.get(`/refunds/${refundId}`);
    return response.data;
  }

  /**
   * Cancel refund request
   */
  async cancelRefund(refundId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/refunds/${refundId}`);
    return response.data;
  }

  /**
   * Get refund reasons
   */
  async getRefundReasons(): Promise<Array<{ code: string; name: string; description: string; requiresEvidence: boolean }>> {
    const response = await apiClient.get('/refunds/reasons');
    return response.data;
  }

  /**
   * Get shop refunds (vendor)
   */
  async getShopRefunds(shopId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get(`/refunds/shop/${shopId}`, { params });
    return response.data;
  }

  /**
   * Process refund (vendor/admin)
   */
  async processRefund(data: {
    refundId: string;
    action: 'approve' | 'reject';
    approvedAmount?: number;
    refundMethod?: 'original_payment' | 'wallet';
    refundToWallet: boolean;
    adminNotes?: string;
  }): Promise<any> {
    const response = await apiClient.post('/refunds/process', data);
    return response.data;
  }

  // ============================================
  // LOYALTY POINTS
  // ============================================

  /**
   * Get loyalty account
   */
  async getLoyaltyAccount(): Promise<any> {
    const response = await apiClient.get('/loyalty');
    return response.data;
  }

  /**
   * Get points balance with tier info
   */
  async getLoyaltyBalance(): Promise<{
    pointsBalance: number;
    tier: string;
    tierName: string;
    multiplier: number;
    nextTier: string | null;
    pointsToNextTier: number;
    benefits: string[];
  }> {
    const response = await apiClient.get('/loyalty/balance');
    return response.data;
  }

  /**
   * Get loyalty tiers
   */
  async getLoyaltyTiers(): Promise<Array<{
    name: string;
    slug: string;
    minPoints: number;
    multiplier: number;
    benefits: string[];
  }>> {
    const response = await apiClient.get('/loyalty/tiers');
    return response.data;
  }

  /**
   * Redeem loyalty points
   */
  async redeemPoints(points: number, orderId?: string): Promise<{
    success: boolean;
    pointsRedeemed: number;
    discountAmount: number;
    newBalance: number;
  }> {
    const response = await apiClient.post('/loyalty/redeem', { points, orderId });
    return response.data;
  }

  /**
   * Get loyalty transactions
   */
  async getLoyaltyTransactions(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/loyalty/transactions', { params });
    return response.data;
  }

  /**
   * Calculate discount value for points
   */
  async calculatePointsValue(points: number): Promise<{ points: number; discountValue: number; currency: string }> {
    const response = await apiClient.get(`/loyalty/calculate/${points}`);
    return response.data;
  }

  /**
   * Get points needed for discount amount
   */
  async getPointsForDiscount(amount: number): Promise<{ discountAmount: number; pointsRequired: number; currency: string }> {
    const response = await apiClient.get(`/loyalty/points-for/${amount}`);
    return response.data;
  }

  // ============================================
  // SUBSCRIPTION APIs (Phase 2)
  // ============================================

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/subscriptions/plans', { params: { includeInactive } });
    return response.data;
  }

  /**
   * Get subscription plan by ID
   */
  async getSubscriptionPlan(planId: string): Promise<any> {
    const response = await apiClient.get(`/subscriptions/plans/${planId}`);
    return response.data;
  }

  /**
   * Subscribe a shop to a plan
   */
  async subscribeShop(data: {
    shopId: string;
    planId: string;
    billingCycle?: 'monthly' | 'yearly';
    stripePaymentMethodId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/subscriptions/subscribe', data);
    return response.data;
  }

  /**
   * Get shop subscription
   */
  async getShopSubscription(shopId: string): Promise<any> {
    const response = await apiClient.get(`/subscriptions/shop/${shopId}`);
    return response.data;
  }

  /**
   * Change shop subscription plan
   */
  async changeSubscriptionPlan(shopId: string, data: {
    newPlanId: string;
    billingCycle?: 'monthly' | 'yearly';
    immediate?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`/subscriptions/shop/${shopId}/change-plan`, data);
    return response.data;
  }

  /**
   * Cancel shop subscription
   */
  async cancelSubscription(shopId: string, reason?: string, feedback?: string): Promise<any> {
    const response = await apiClient.post(`/subscriptions/shop/${shopId}/cancel`, { reason, feedback });
    return response.data;
  }

  /**
   * Reactivate shop subscription
   */
  async reactivateSubscription(shopId: string): Promise<any> {
    const response = await apiClient.post(`/subscriptions/shop/${shopId}/reactivate`, {});
    return response.data;
  }

  /**
   * Check if shop can add more products
   */
  async canAddProduct(shopId: string): Promise<{ canAdd: boolean; currentCount: number; limit: number; remainingSlots: number }> {
    const response = await apiClient.get(`/subscriptions/shop/${shopId}/can-add-product`);
    return response.data;
  }

  /**
   * Get subscription invoices
   */
  async getSubscriptionInvoices(shopId: string, limit = 20): Promise<any[]> {
    const response = await apiClient.get(`/subscriptions/shop/${shopId}/invoices`, { params: { limit } });
    return response.data;
  }

  // ============================================
  // CASHBACK APIs (Phase 2)
  // ============================================

  /**
   * Get user cashback history
   */
  async getCashbackHistory(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/cashback/history', { params });
    return response.data;
  }

  /**
   * Get user total cashback stats
   */
  async getCashbackTotal(): Promise<{ total: number; pending: number; credited: number }> {
    const response = await apiClient.get('/cashback/total');
    return response.data;
  }

  /**
   * Calculate potential cashback for an order
   */
  async calculateCashback(amount: number, shopId?: string): Promise<{ amount: number; rule: any | null }> {
    const response = await apiClient.get('/cashback/calculate', { params: { amount, shopId } });
    return response.data;
  }

  /**
   * Get cashback rules (admin)
   */
  async getCashbackRules(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/cashback/rules', { params: { includeInactive } });
    return response.data;
  }

  /**
   * Create cashback rule (admin)
   */
  async createCashbackRule(data: {
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    maxCashback?: number;
    minOrderAmount?: number;
    appliesTo?: string;
    categoryIds?: string[];
    productIds?: string[];
    shopIds?: string[];
    userType?: string;
    loyaltyTiers?: string[];
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    perUserLimit?: number;
    priority?: number;
  }): Promise<any> {
    const response = await apiClient.post('/cashback/rules', data);
    return response.data;
  }

  /**
   * Update cashback rule (admin)
   */
  async updateCashbackRule(ruleId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/cashback/rules/${ruleId}`, data);
    return response.data;
  }

  /**
   * Delete cashback rule (admin)
   */
  async deleteCashbackRule(ruleId: string): Promise<void> {
    await apiClient.delete(`/cashback/rules/${ruleId}`);
  }

  // ============================================
  // REFERRAL APIs (Phase 2)
  // ============================================

  /**
   * Get referral program config
   */
  async getReferralConfig(): Promise<any> {
    const response = await apiClient.get('/referrals/config');
    return response.data;
  }

  /**
   * Get or create user's referral code
   */
  async getMyReferralCode(): Promise<{
    id: string;
    code: string;
    isCustom: boolean;
    usageCount: number;
    maxUsages: number | null;
    isActive: boolean;
    createdAt: string;
    expiresAt: string | null;
  }> {
    const response = await apiClient.get('/referrals/my-code');
    return response.data;
  }

  /**
   * Create custom referral code
   */
  async createCustomReferralCode(code: string): Promise<any> {
    const response = await apiClient.post('/referrals/my-code/custom', { code });
    return response.data;
  }

  /**
   * Get user referral stats
   */
  async getMyReferralStats(): Promise<{
    totalReferrals: number;
    pendingReferrals: number;
    qualifiedReferrals: number;
    rewardedReferrals: number;
    totalEarned: number;
    pendingEarnings: number;
    referralCode: string;
  }> {
    const response = await apiClient.get('/referrals/my-stats');
    return response.data;
  }

  /**
   * Get user's referrals list
   */
  async getMyReferrals(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/referrals/my-referrals', { params });
    return response.data;
  }

  /**
   * Apply referral code
   */
  async applyReferralCode(code: string): Promise<{
    success: boolean;
    message: string;
    referral: any;
  }> {
    const response = await apiClient.post('/referrals/apply', { code });
    return response.data;
  }

  /**
   * Get referral code info (for validation)
   */
  async getReferralCodeInfo(code: string): Promise<{
    code: string;
    isValid: boolean;
    isExpired: boolean;
    isMaxedOut: boolean;
    refereeRewardType: string;
    refereeRewardValue: number;
    rewardDescription: string;
  }> {
    const response = await apiClient.get(`/referrals/code/${code}/info`);
    return response.data;
  }

  /**
   * Update referral config (admin)
   */
  async updateReferralConfig(data: {
    isEnabled?: boolean;
    referrerRewardType?: string;
    referrerRewardValue?: number;
    referrerMaxReward?: number;
    refereeRewardType?: string;
    refereeRewardValue?: number;
    refereeMaxReward?: number;
    rewardTrigger?: string;
    minOrderAmount?: number;
    expiryDays?: number;
    maxReferralsPerUser?: number;
  }): Promise<any> {
    const response = await apiClient.put('/referrals/config', data);
    return response.data;
  }

  /**
   * Get all referrals (admin)
   */
  async getAllReferrals(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/referrals/all', { params });
    return response.data;
  }

  /**
   * Get referral program stats (admin)
   */
  async getReferralProgramStats(): Promise<any> {
    const response = await apiClient.get('/referrals/stats');
    return response.data;
  }

  // ============================================
  // EMAIL TEMPLATE APIs (Phase 2 - Admin)
  // ============================================

  /**
   * Get all email templates
   */
  async getEmailTemplates(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/email-templates', { params: { includeInactive } });
    return response.data;
  }

  /**
   * Get available template types
   */
  async getEmailTemplateTypes(): Promise<Array<{ value: string; label: string }>> {
    const response = await apiClient.get('/email-templates/types');
    return response.data;
  }

  /**
   * Get email template by ID
   */
  async getEmailTemplate(templateId: string): Promise<any> {
    const response = await apiClient.get(`/email-templates/${templateId}`);
    return response.data;
  }

  /**
   * Create email template
   */
  async createEmailTemplate(data: {
    type: string;
    name: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    variables?: string[];
    description?: string;
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/email-templates', data);
    return response.data;
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(templateId: string, data: {
    name?: string;
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    variables?: string[];
    description?: string;
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`/email-templates/${templateId}`, data);
    return response.data;
  }

  /**
   * Delete email template
   */
  async deleteEmailTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/email-templates/${templateId}`);
  }

  /**
   * Send email using template
   */
  async sendEmail(data: {
    to: string;
    templateType: string;
    variables?: Record<string, any>;
    subjectOverride?: string;
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
  }): Promise<{ success: boolean; emailId: string; message: string }> {
    const response = await apiClient.post('/email-templates/send', data);
    return response.data;
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmail(data: {
    recipients: string[];
    templateType: string;
    commonVariables?: Record<string, any>;
    recipientVariables?: Record<string, Record<string, any>>;
  }): Promise<{ total: number; sent: number; failed: number; errors: any[] }> {
    const response = await apiClient.post('/email-templates/send-bulk', data);
    return response.data;
  }

  /**
   * Preview email
   */
  async previewEmail(templateType: string, variables?: Record<string, any>): Promise<{
    subject: string;
    htmlBody: string;
    textBody: string | null;
    variables: string[];
  }> {
    const response = await apiClient.post('/email-templates/preview', { templateType, variables });
    return response.data;
  }

  /**
   * Get email logs
   */
  async getEmailLogs(params?: {
    templateType?: string;
    status?: string;
    recipientEmail?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/email-templates/logs/list', { params });
    return response.data;
  }

  /**
   * Get email statistics
   */
  async getEmailStats(startDate?: string, endDate?: string): Promise<{
    totalSent: number;
    delivered: number;
    failed: number;
    bounced: number;
    opened: number;
    clicked: number;
    openRate: string;
    clickRate: string;
    bounceRate: string;
  }> {
    const response = await apiClient.get('/email-templates/logs/stats', { params: { startDate, endDate } });
    return response.data;
  }

  /**
   * Initialize default email templates
   */
  async initializeDefaultEmailTemplates(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/email-templates/initialize-defaults', {});
    return response.data;
  }

  // ============================================
  // PHASE 3: I18N (INTERNATIONALIZATION) API
  // ============================================

  /**
   * Get all active languages
   */
  async getLanguages(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/i18n/languages', { params: { includeInactive: includeInactive ? 'true' : undefined } });
    return response.data;
  }

  /**
   * Get default language
   */
  async getDefaultLanguage(): Promise<any> {
    const response = await apiClient.get('/i18n/languages/default');
    return response.data;
  }

  /**
   * Get language by code
   */
  async getLanguage(code: string): Promise<any> {
    const response = await apiClient.get(`/i18n/languages/${code}`);
    return response.data;
  }

  /**
   * Get translations for a language
   */
  async getTranslations(languageCode: string, namespace?: string): Promise<Record<string, any>> {
    const response = await apiClient.get(`/i18n/translations/${languageCode}`, { params: { namespace } });
    return response.data;
  }

  /**
   * Get all translation namespaces
   */
  async getTranslationNamespaces(): Promise<string[]> {
    const response = await apiClient.get('/i18n/namespaces');
    return response.data;
  }

  /**
   * Get content translation
   */
  async getContentTranslation(entityType: string, entityId: string, languageCode?: string): Promise<any> {
    const response = await apiClient.get(`/i18n/content/${entityType}/${entityId}`, { params: { languageCode } });
    return response.data;
  }

  /**
   * Create language (Admin)
   */
  async createLanguage(data: {
    code: string;
    name: string;
    nativeName: string;
    direction?: 'ltr' | 'rtl';
    flag?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/i18n/languages', data);
    return response.data;
  }

  /**
   * Update language (Admin)
   */
  async updateLanguage(code: string, data: {
    name?: string;
    nativeName?: string;
    direction?: 'ltr' | 'rtl';
    flag?: string;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`/i18n/languages/${code}`, data);
    return response.data;
  }

  /**
   * Set translation (Admin)
   */
  async setTranslation(data: {
    languageCode: string;
    namespace: string;
    key: string;
    value: string;
  }): Promise<any> {
    const response = await apiClient.post('/i18n/translations', data);
    return response.data;
  }

  /**
   * Bulk update translations (Admin)
   */
  async bulkSetTranslations(data: {
    languageCode: string;
    namespace: string;
    translations: Record<string, string>;
  }): Promise<{ updated: number; created: number }> {
    const response = await apiClient.post('/i18n/translations/bulk', data);
    return response.data;
  }

  /**
   * Import translations (Admin)
   */
  async importTranslations(data: {
    languageCode: string;
    overwrite?: boolean;
    data: Record<string, Record<string, string>>;
  }): Promise<{ namespaces: number; keys: number }> {
    const response = await apiClient.post('/i18n/translations/import', data);
    return response.data;
  }

  /**
   * Export translations (Admin)
   */
  async exportTranslations(languageCode: string): Promise<any> {
    const response = await apiClient.get(`/i18n/translations/${languageCode}/export`);
    return response.data;
  }

  /**
   * Set content translation (Admin/Vendor)
   */
  async setContentTranslation(data: {
    entityType: string;
    entityId: string;
    languageCode: string;
    fields: Record<string, string>;
  }): Promise<any> {
    const response = await apiClient.post('/i18n/content', data);
    return response.data;
  }

  // ============================================
  // PHASE 3: SMS NOTIFICATIONS API
  // ============================================

  /**
   * Get SMS configuration (Admin)
   */
  async getSmsConfig(): Promise<any> {
    const response = await apiClient.get('/sms/config');
    return response.data;
  }

  /**
   * Configure SMS provider (Admin)
   */
  async configureSmsProvider(data: {
    provider: 'twilio' | 'nexmo' | 'aws_sns' | 'msg91' | 'firebase';
    credentials: Record<string, string>;
    defaultSenderId?: string;
    isEnabled?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/sms/config', data);
    return response.data;
  }

  /**
   * Get SMS templates
   */
  async getSmsTemplates(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/sms/templates', { params: { includeInactive: includeInactive ? 'true' : undefined } });
    return response.data;
  }

  /**
   * Create SMS template (Admin)
   */
  async createSmsTemplate(data: {
    type: string;
    name: string;
    body: string;
    variables?: string[];
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/sms/templates', data);
    return response.data;
  }

  /**
   * Send SMS
   */
  async sendSms(data: {
    to: string;
    templateType: string;
    variables?: Record<string, any>;
  }): Promise<{ success: boolean; messageId: string }> {
    const response = await apiClient.post('/sms/send', data);
    return response.data;
  }

  /**
   * Send OTP (Public)
   */
  async sendOtp(phoneNumber: string, purpose?: string): Promise<{ success: boolean; expiresAt: string; expiryMinutes: number }> {
    const response = await apiClient.post('/sms/otp/send', { phoneNumber, purpose });
    return response.data;
  }

  /**
   * Verify OTP (Public)
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<{ valid: boolean; message: string }> {
    const response = await apiClient.post('/sms/otp/verify', { phoneNumber, otp });
    return response.data;
  }

  /**
   * Get SMS logs (Admin)
   */
  async getSmsLogs(params?: {
    templateType?: string;
    status?: string;
    phoneNumber?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/sms/logs', { params });
    return response.data;
  }

  /**
   * Get SMS statistics (Admin)
   */
  async getSmsStats(startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get('/sms/stats', { params: { startDate, endDate } });
    return response.data;
  }

  // ============================================
  // PHASE 3: ZONES/DELIVERY AREAS API
  // ============================================

  /**
   * Get all delivery zones
   */
  async getDeliveryZones(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/zones', { params: { includeInactive: includeInactive ? 'true' : undefined } });
    return response.data;
  }

  /**
   * Get zone by ID
   */
  async getDeliveryZone(zoneId: string): Promise<any> {
    const response = await apiClient.get(`/zones/${zoneId}`);
    return response.data;
  }

  /**
   * Get delivery options for a zone
   */
  async getZoneDeliveryOptions(zoneId: string): Promise<any[]> {
    const response = await apiClient.get(`/zones/${zoneId}/delivery-options`);
    return response.data;
  }

  /**
   * Check delivery availability for location
   */
  async checkDeliveryAvailability(data: {
    location: { lat: number; lng: number };
    postalCode?: string;
    shopId?: string;
  }): Promise<{
    available: boolean;
    zone: any | null;
    deliveryOptions: any[];
    message: string;
  }> {
    const response = await apiClient.post('/zones/check-availability', data);
    return response.data;
  }

  /**
   * Calculate delivery fee
   */
  async calculateDeliveryFee(data: {
    zoneId: string;
    deliveryType: string;
    orderAmount: number;
    distance?: number;
    shopId?: string;
  }): Promise<{
    baseFee: number;
    distanceFee: number;
    totalFee: number;
    freeDelivery: boolean;
    freeDeliveryMinimum: number | null;
    estimatedTime: string;
  }> {
    const response = await apiClient.post('/zones/calculate-fee', data);
    return response.data;
  }

  /**
   * Create delivery zone (Admin)
   */
  async createDeliveryZone(data: {
    name: string;
    description?: string;
    type: 'polygon' | 'circle' | 'city' | 'postal_code';
    coordinates?: { lat: number; lng: number }[];
    center?: { lat: number; lng: number };
    radius?: number;
    city?: string;
    postalCodes?: string[];
    country?: string;
    state?: string;
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/zones', data);
    return response.data;
  }

  /**
   * Update delivery zone (Admin)
   */
  async updateDeliveryZone(zoneId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/zones/${zoneId}`, data);
    return response.data;
  }

  /**
   * Create delivery option (Admin)
   */
  async createDeliveryOption(data: {
    zoneId: string;
    deliveryType: string;
    name: string;
    description?: string;
    baseFee: number;
    perKmFee?: number;
    freeDeliveryMinimum?: number;
    minDeliveryTime?: number;
    maxDeliveryTime?: number;
  }): Promise<any> {
    const response = await apiClient.post('/zones/delivery-options', data);
    return response.data;
  }

  /**
   * Assign zone to shop (Vendor)
   */
  async assignZoneToShop(data: {
    shopId: string;
    zoneId: string;
    baseFeeOverride?: number;
    minDeliveryTimeOverride?: number;
    maxDeliveryTimeOverride?: number;
  }): Promise<any> {
    const response = await apiClient.post('/zones/shop-zones', data);
    return response.data;
  }

  /**
   * Get zones for shop
   */
  async getShopZones(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/zones/shop/${shopId}`);
    return response.data;
  }

  // ============================================
  // PHASE 3: STORE SCHEDULE API
  // ============================================

  /**
   * Get shop schedule
   */
  async getShopSchedule(shopId: string): Promise<any> {
    const response = await apiClient.get(`/schedule/shop/${shopId}`);
    return response.data;
  }

  /**
   * Check if shop is open
   */
  async checkShopAvailability(data: {
    shopId: string;
    datetime?: string;
  }): Promise<{
    isOpen: boolean;
    currentStatus: string;
    nextOpenTime: string | null;
    todayHours: any[];
    message: string;
  }> {
    const response = await apiClient.post('/schedule/check-availability', data);
    return response.data;
  }

  /**
   * Get available time slots for a date
   */
  async getAvailableTimeSlots(data: {
    shopId: string;
    date: string;
    slotDuration?: number;
  }): Promise<{ startTime: string; endTime: string; available: boolean }[]> {
    const response = await apiClient.post('/schedule/available-slots', data);
    return response.data;
  }

  /**
   * Get shop holidays
   */
  async getShopHolidays(shopId: string, year?: number): Promise<any[]> {
    const response = await apiClient.get(`/schedule/shop/${shopId}/holidays`, { params: { year } });
    return response.data;
  }

  /**
   * Get upcoming holidays
   */
  async getUpcomingHolidays(shopId: string, days = 30): Promise<any[]> {
    const response = await apiClient.get(`/schedule/shop/${shopId}/holidays/upcoming`, { params: { days } });
    return response.data;
  }

  /**
   * Set shop schedule (Vendor)
   */
  async setShopSchedule(data: {
    shopId: string;
    schedule: { day: number; isOpen: boolean; slots?: { openTime: string; closeTime: string }[] }[];
    timezone?: string;
    acceptPreOrders?: boolean;
    preOrderLeadTime?: number;
  }): Promise<any> {
    const response = await apiClient.post('/schedule', data);
    return response.data;
  }

  /**
   * Create holiday (Vendor)
   */
  async createShopHoliday(data: {
    shopId: string;
    date: string;
    name: string;
    description?: string;
    type: 'closed' | 'special_hours';
    specialHours?: { openTime: string; closeTime: string }[];
    isRecurring?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/schedule/holidays', data);
    return response.data;
  }

  /**
   * Create temporary closure (Vendor)
   */
  async createTemporaryClosure(data: {
    shopId: string;
    startTime: string;
    endTime: string;
    reason: string;
    message?: string;
  }): Promise<any> {
    const response = await apiClient.post('/schedule/closures', data);
    return response.data;
  }

  /**
   * Get temporary closures (Vendor)
   */
  async getTemporaryClosures(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/schedule/shop/${shopId}/closures`);
    return response.data;
  }

  // ============================================
  // PHASE 3: DISBURSEMENT API
  // ============================================

  /**
   * Get vendor balance
   */
  async getVendorBalance(shopId: string): Promise<{
    available: number;
    pending: number;
    onHold: number;
    totalEarnings: number;
    totalWithdrawn: number;
    currency: string;
  }> {
    const response = await apiClient.get(`/disbursements/balance/${shopId}`);
    return response.data;
  }

  /**
   * Get payment methods
   */
  async getVendorPaymentMethods(shopId: string): Promise<any[]> {
    const response = await apiClient.get(`/disbursements/payment-methods/${shopId}`);
    return response.data;
  }

  /**
   * Setup payment method
   */
  async setupVendorPaymentMethod(data: {
    shopId: string;
    method: 'bank_transfer' | 'stripe_connect' | 'paypal' | 'wallet' | 'check';
    bankAccount?: {
      accountHolderName: string;
      bankName: string;
      accountNumber: string;
      routingNumber: string;
      swiftCode?: string;
      iban?: string;
    };
    paypalEmail?: string;
    stripeAccountId?: string;
    isDefault?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/disbursements/payment-methods', data);
    return response.data;
  }

  /**
   * Get disbursement settings
   */
  async getDisbursementSettings(shopId: string): Promise<any> {
    const response = await apiClient.get(`/disbursements/settings/${shopId}`);
    return response.data;
  }

  /**
   * Set disbursement settings
   */
  async setDisbursementSettings(data: {
    shopId: string;
    schedule: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'on_demand';
    minimumAmount?: number;
    holdPeriodDays?: number;
    weeklyDay?: number;
    monthlyDay?: number;
    autoDisburse?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/disbursements/settings', data);
    return response.data;
  }

  /**
   * Request disbursement
   */
  async requestDisbursement(data: {
    shopId: string;
    amount?: number;
    paymentMethodId?: string;
    note?: string;
  }): Promise<any> {
    const response = await apiClient.post('/disbursements/request', data);
    return response.data;
  }

  /**
   * Get shop disbursements
   */
  async getShopDisbursements(shopId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get(`/disbursements/shop/${shopId}`, { params });
    return response.data;
  }

  /**
   * Cancel disbursement (Vendor)
   */
  async cancelDisbursement(disbursementId: string, shopId: string): Promise<void> {
    await apiClient.delete(`/disbursements/${disbursementId}/shop/${shopId}`);
  }

  /**
   * Create Stripe Connect account
   */
  async createStripeConnectAccount(data: {
    shopId: string;
    email: string;
    country?: string;
  }): Promise<{ accountId: string; onboardingUrl: string; isOnboarded: boolean }> {
    const response = await apiClient.post('/disbursements/stripe-connect', data);
    return response.data;
  }

  /**
   * Get Stripe Connect status
   */
  async getStripeConnectStatus(shopId: string): Promise<any> {
    const response = await apiClient.get(`/disbursements/stripe-connect/${shopId}`);
    return response.data;
  }

  // ============================================
  // PHASE 3: GIFT CARDS API
  // ============================================

  /**
   * Get gift card templates
   */
  async getGiftCardTemplates(includeInactive = false): Promise<any[]> {
    const response = await apiClient.get('/gift-cards/templates', { params: { includeInactive: includeInactive ? 'true' : undefined } });
    return response.data;
  }

  /**
   * Get gift card template by ID
   */
  async getGiftCardTemplate(templateId: string): Promise<any> {
    const response = await apiClient.get(`/gift-cards/templates/${templateId}`);
    return response.data;
  }

  /**
   * Check gift card balance (Public)
   */
  async checkGiftCardBalance(code: string): Promise<{
    code: string;
    currentBalance: number;
    currency: string;
    status: string;
    expiresAt: string | null;
    isValid: boolean;
    message: string;
  }> {
    const response = await apiClient.post('/gift-cards/check-balance', { code });
    return response.data;
  }

  /**
   * Purchase gift cards
   */
  async purchaseGiftCards(data: {
    templateId?: string;
    amount: number;
    quantity: number;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    deliveryDate?: string;
  }): Promise<{
    success: boolean;
    orderId: string;
    giftCards: any[];
    totalAmount: number;
  }> {
    const response = await apiClient.post('/gift-cards/purchase', data);
    return response.data;
  }

  /**
   * Get my gift cards
   */
  async getMyGiftCards(status?: string): Promise<any[]> {
    const response = await apiClient.get('/gift-cards/my-cards', { params: { status } });
    return response.data;
  }

  /**
   * Redeem gift card
   */
  async redeemGiftCard(data: {
    code: string;
    orderId?: string;
    amount?: number;
  }): Promise<{
    success: boolean;
    amountRedeemed: number;
    remainingBalance: number;
    status: string;
  }> {
    const response = await apiClient.post('/gift-cards/redeem', data);
    return response.data;
  }

  /**
   * Transfer gift card
   */
  async transferGiftCard(data: {
    code: string;
    recipientEmail: string;
    message?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/gift-cards/transfer', data);
    return response.data;
  }

  /**
   * Top up gift card
   */
  async topUpGiftCard(data: {
    code: string;
    amount: number;
  }): Promise<{
    success: boolean;
    amountAdded: number;
    newBalance: number;
  }> {
    const response = await apiClient.post('/gift-cards/top-up', data);
    return response.data;
  }

  /**
   * Get gift card transactions
   */
  async getGiftCardTransactions(code: string): Promise<any[]> {
    const response = await apiClient.get(`/gift-cards/${code}/transactions`);
    return response.data;
  }

  /**
   * Create gift card template (Admin)
   */
  async createGiftCardTemplate(data: {
    name: string;
    description?: string;
    presetAmounts: number[];
    allowCustomAmount?: boolean;
    minAmount?: number;
    maxAmount?: number;
    validityDays?: number;
    designImage?: string;
    type?: 'digital' | 'physical';
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/gift-cards/templates', data);
    return response.data;
  }

  /**
   * Get all gift cards (Admin)
   */
  async getAllGiftCards(params?: {
    userId?: string;
    status?: string;
    code?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const response = await apiClient.get('/gift-cards/admin/all', { params });
    return response.data;
  }

  /**
   * Get gift card statistics (Admin)
   */
  async getGiftCardStatistics(): Promise<{
    totalCards: number;
    activeCards: number;
    usedCards: number;
    expiredCards: number;
    cancelledCards: number;
    totalIssued: number;
    totalRedeemed: number;
    totalOutstanding: number;
    currency: string;
  }> {
    const response = await apiClient.get('/gift-cards/admin/statistics');
    return response.data;
  }

  // ============================================
  // PHASE 4: SURGE PRICING API
  // ============================================

  /**
   * Create surge pricing rule (Admin)
   */
  async createSurgeRule(data: {
    name: string;
    description?: string;
    type: 'time_based' | 'demand_based' | 'zone_based' | 'event_based' | 'weather_based';
    appliesTo: 'delivery_fee' | 'product_price' | 'all';
    multiplier: number;
    fixedAmount?: number;
    maxSurgeAmount?: number;
    timeWindows?: { days: number[]; startTime: string; endTime: string }[];
    zoneIds?: string[];
    shopIds?: string[];
    categoryIds?: string[];
    productIds?: string[];
    startDate?: string;
    endDate?: string;
    priority?: number;
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/surge-pricing/rules', data);
    return response.data;
  }

  /**
   * Get surge pricing rules
   */
  async getSurgeRules(params?: {
    type?: string;
    appliesTo?: string;
    shopId?: string;
    zoneId?: string;
    activeOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/surge-pricing/rules', { params });
    return response.data;
  }

  /**
   * Get surge rule by ID
   */
  async getSurgeRule(id: string): Promise<any> {
    const response = await apiClient.get(`/surge-pricing/rules/${id}`);
    return response.data;
  }

  /**
   * Update surge rule
   */
  async updateSurgeRule(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/surge-pricing/rules/${id}`, data);
    return response.data;
  }

  /**
   * Delete surge rule
   */
  async deleteSurgeRule(id: string): Promise<any> {
    const response = await apiClient.delete(`/surge-pricing/rules/${id}`);
    return response.data;
  }

  /**
   * Toggle surge rule active status
   */
  async toggleSurgeRule(id: string): Promise<any> {
    const response = await apiClient.patch(`/surge-pricing/rules/${id}/toggle`, {});
    return response.data;
  }

  /**
   * Configure demand-based surge pricing
   */
  async configureDemandSurge(data: {
    shopId?: string;
    zoneId?: string;
    threshold1: number;
    multiplier1: number;
    threshold2?: number;
    multiplier2?: number;
    threshold3?: number;
    multiplier3?: number;
    timeWindowMinutes?: number;
  }): Promise<any> {
    const response = await apiClient.post('/surge-pricing/demand/configure', data);
    return response.data;
  }

  /**
   * Get demand surge configuration
   */
  async getDemandSurgeConfig(params?: { shopId?: string; zoneId?: string }): Promise<any> {
    const response = await apiClient.get('/surge-pricing/demand/config', { params });
    return response.data;
  }

  /**
   * Get current demand level
   */
  async getCurrentDemandLevel(params?: { shopId?: string; zoneId?: string }): Promise<any> {
    const response = await apiClient.get('/surge-pricing/demand/level', { params });
    return response.data;
  }

  /**
   * Calculate surge pricing for an amount
   */
  async calculateSurge(data: {
    shopId?: string;
    zoneId?: string;
    productId?: string;
    categoryId?: string;
    baseAmount: number;
    type: 'delivery_fee' | 'product_price' | 'all';
    datetime?: string;
  }): Promise<{
    baseAmount: number;
    surgeMultiplier: number;
    surgeAmount: number;
    finalAmount: number;
    appliedRules: { id: string; name: string; type: string; multiplier: number }[];
    surgeActive: boolean;
    message: string;
  }> {
    const response = await apiClient.post('/surge-pricing/calculate', data);
    return response.data;
  }

  /**
   * Get surge pricing statistics
   */
  async getSurgeStats(params?: { shopId?: string; startDate?: string; endDate?: string }): Promise<any> {
    const response = await apiClient.get('/surge-pricing/stats', { params });
    return response.data;
  }

  // ============================================
  // PHASE 4: EXPENSES API
  // ============================================

  /**
   * Create custom expense category
   */
  async createExpenseCategory(shopId: string, data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parentId?: string;
    budgetLimit?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/expenses/categories/${shopId}`, data);
    return response.data;
  }

  /**
   * Get expense categories for shop
   */
  async getExpenseCategories(shopId: string): Promise<any> {
    const response = await apiClient.get(`/expenses/categories/${shopId}`);
    return response.data;
  }

  /**
   * Update expense category
   */
  async updateExpenseCategory(shopId: string, categoryId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/expenses/categories/${shopId}/${categoryId}`, data);
    return response.data;
  }

  /**
   * Delete expense category
   */
  async deleteExpenseCategory(shopId: string, categoryId: string): Promise<any> {
    const response = await apiClient.delete(`/expenses/categories/${shopId}/${categoryId}`);
    return response.data;
  }

  /**
   * Create expense
   */
  async createExpense(data: {
    shopId: string;
    title: string;
    description?: string;
    category: string;
    customCategoryId?: string;
    amount: number;
    currency?: string;
    expenseDate: string;
    vendorName?: string;
    vendorId?: string;
    invoiceNumber?: string;
    receiptUrl?: string;
    attachments?: string[];
    recurrence?: string;
    recurrenceEndDate?: string;
    tags?: string[];
    notes?: string;
    orderId?: string;
    productId?: string;
    isTaxDeductible?: boolean;
    taxAmount?: number;
  }): Promise<any> {
    const response = await apiClient.post('/expenses', data);
    return response.data;
  }

  /**
   * Get expenses with filters
   */
  async getExpenses(params?: {
    shopId?: string;
    category?: string;
    customCategoryId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    vendorName?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<any> {
    const response = await apiClient.get('/expenses', { params });
    return response.data;
  }

  /**
   * Get expense by ID
   */
  async getExpense(id: string): Promise<any> {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  }

  /**
   * Update expense
   */
  async updateExpense(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/expenses/${id}`, data);
    return response.data;
  }

  /**
   * Update expense status (approve/reject)
   */
  async updateExpenseStatus(id: string, data: { status: string; rejectionReason?: string }): Promise<any> {
    const response = await apiClient.patch(`/expenses/${id}/status`, data);
    return response.data;
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string): Promise<any> {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  }

  /**
   * Set expense budget
   */
  async setExpenseBudget(data: {
    shopId: string;
    category: string;
    customCategoryId?: string;
    budgetAmount: number;
    period: string;
    alertThreshold?: number;
  }): Promise<any> {
    const response = await apiClient.post('/expenses/budgets', data);
    return response.data;
  }

  /**
   * Get budget status for shop
   */
  async getExpenseBudgetStatus(shopId: string, period?: string): Promise<any> {
    const response = await apiClient.get(`/expenses/budgets/${shopId}`, { params: { period } });
    return response.data;
  }

  /**
   * Get expense summary
   */
  async getExpenseSummary(shopId: string, startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get(`/expenses/summary/${shopId}`, { params: { startDate, endDate } });
    return response.data;
  }

  /**
   * Generate expense report
   */
  async generateExpenseReport(data: {
    shopId: string;
    startDate: string;
    endDate: string;
    groupBy?: string;
    categories?: string[];
    includeProjections?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/expenses/reports', data);
    return response.data;
  }

  /**
   * Get expense projections
   */
  async getExpenseProjections(shopId: string): Promise<any> {
    const response = await apiClient.get(`/expenses/projections/${shopId}`);
    return response.data;
  }

  /**
   * Export expenses
   */
  async exportExpenses(shopId: string, startDate: string, endDate: string, format?: string): Promise<any> {
    const response = await apiClient.get(`/expenses/export/${shopId}`, {
      params: { startDate, endDate, format },
    });
    return response.data;
  }

  // ============================================
  // PHASE 4: AI PRODUCT AUTO-FILL API
  // ============================================

  /**
   * Auto-fill product details from image
   */
  async aiAutoFillFromImage(shopId: string, data: {
    source: 'url' | 'base64' | 'upload';
    imageUrl?: string;
    imageBase64?: string;
    filePath?: string;
    categoryHint?: string;
    language?: string;
    includeSeo?: boolean;
    includePricing?: boolean;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/auto-fill/image/${shopId}`, data);
    return response.data;
  }

  /**
   * Auto-fill product details from text/name
   */
  async aiAutoFillFromText(shopId: string, data: {
    productName: string;
    context?: string;
    categoryHint?: string;
    language?: string;
    includeSeo?: boolean;
    includePricing?: boolean;
    includeFeatures?: boolean;
    variants?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/auto-fill/text/${shopId}`, data);
    return response.data;
  }

  /**
   * Auto-fill product details from barcode
   */
  async aiAutoFillFromBarcode(shopId: string, data: {
    barcode: string;
    language?: string;
    includeSeo?: boolean;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/auto-fill/barcode/${shopId}`, data);
    return response.data;
  }

  /**
   * Generate product description
   */
  async aiGenerateDescription(shopId: string, data: {
    productName: string;
    category?: string;
    features?: string[];
    targetAudience?: string;
    length?: 'short' | 'medium' | 'long';
    tone?: 'professional' | 'casual' | 'luxury' | 'playful';
    language?: string;
    variants?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/description/generate/${shopId}`, data);
    return response.data;
  }

  /**
   * Improve existing product description
   */
  async aiImproveDescription(shopId: string, data: {
    currentDescription: string;
    improvementGoals?: string[];
    language?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/description/improve/${shopId}`, data);
    return response.data;
  }

  /**
   * Generate SEO metadata
   */
  async aiGenerateSeo(shopId: string, data: {
    productName: string;
    description?: string;
    category?: string;
    features?: string[];
    language?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/seo/generate/${shopId}`, data);
    return response.data;
  }

  /**
   * Generate product tags
   */
  async aiGenerateTags(shopId: string, data: {
    productName: string;
    description?: string;
    category?: string;
    maxTags?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/tags/generate/${shopId}`, data);
    return response.data;
  }

  /**
   * Suggest product category
   */
  async aiSuggestCategory(shopId: string, data: {
    productName: string;
    description?: string;
    availableCategories?: string[];
  }): Promise<any> {
    const response = await apiClient.post(`/ai/category/suggest/${shopId}`, data);
    return response.data;
  }

  /**
   * Suggest product pricing
   */
  async aiSuggestPricing(shopId: string, data: {
    productName: string;
    category?: string;
    brand?: string;
    features?: string[];
    region?: string;
    currency?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/pricing/suggest/${shopId}`, data);
    return response.data;
  }

  /**
   * Analyze product image
   */
  async aiAnalyzeImage(shopId: string, data: {
    source: 'url' | 'base64';
    imageUrl?: string;
    imageBase64?: string;
    extractColors?: boolean;
    detectObjects?: boolean;
    generateAltText?: boolean;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/image/analyze/${shopId}`, data);
    return response.data;
  }

  /**
   * Translate product content
   */
  async aiTranslateProduct(shopId: string, data: {
    productName: string;
    description?: string;
    features?: string[];
    sourceLanguage: string;
    targetLanguage: string;
    includeSeo?: boolean;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/translate/${shopId}`, data);
    return response.data;
  }

  /**
   * Bulk auto-fill multiple products
   */
  async aiBulkAutoFill(shopId: string, data: {
    productIds: string[];
    fields?: string[];
    overwrite?: boolean;
    language?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/bulk/auto-fill/${shopId}`, data);
    return response.data;
  }

  /**
   * Configure AI settings
   */
  async configureAI(shopId: string, data: {
    provider: 'openai' | 'anthropic' | 'google';
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/ai/config/${shopId}`, data);
    return response.data;
  }

  /**
   * Get AI configuration
   */
  async getAIConfig(shopId: string): Promise<any> {
    const response = await apiClient.get(`/ai/config/${shopId}`);
    return response.data;
  }

  /**
   * Get AI usage statistics
   */
  async getAIUsageStats(shopId: string, params?: { startDate?: string; endDate?: string }): Promise<any> {
    const response = await apiClient.get(`/ai/usage/${shopId}`, { params });
    return response.data;
  }

  // ============================================
  // Phase 5: Delivery Man Management
  // ============================================

  async registerDeliveryMan(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    type?: 'freelancer' | 'salaried';
    vehicleType?: string;
    vehicleNumber?: string;
    imageUrl?: string;
    identityType?: string;
    identityNumber?: string;
    zoneId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/delivery-man/register', data);
    return response.data;
  }

  async getDeliveryMen(params?: {
    page?: number;
    limit?: number;
    status?: string;
    availability?: string;
    type?: string;
    zoneId?: string;
    search?: string;
  }): Promise<any> {
    const response = await apiClient.get('/delivery-man', { params });
    return response.data;
  }

  async syncDeliveryMenFromAuth(): Promise<any> {
    const response = await apiClient.post('/delivery-man/sync-from-auth', {});
    return response.data;
  }

  async getDeliveryMan(id: string): Promise<any> {
    const response = await apiClient.get(`/delivery-man/${id}`);
    return response.data;
  }

  async updateDeliveryMan(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/delivery-man/${id}`, data);
    return response.data;
  }

  async updateDeliveryManStatus(id: string, status: string, reason?: string): Promise<any> {
    const response = await apiClient.patch(`/delivery-man/${id}/status`, { status, reason });
    return response.data;
  }

  async updateDeliveryManAvailability(id: string, availability: string, location?: { lat: number; lng: number }): Promise<any> {
    const response = await apiClient.patch(`/delivery-man/${id}/availability`, { availability, location });
    return response.data;
  }

  async updateDeliveryManLocation(id: string, lat: number, lng: number, heading?: number, speed?: number): Promise<any> {
    const response = await apiClient.patch(`/delivery-man/${id}/location`, { lat, lng, heading, speed });
    return response.data;
  }

  async assignOrderToDeliveryMan(orderId: string, deliveryManId: string, note?: string, deliveryFee?: number): Promise<any> {
    const response = await apiClient.post('/delivery-man/assign-order', { orderId, deliveryManId, note, deliveryFee });
    return response.data;
  }

  async getDeliveryManOrders(id: string, status?: string): Promise<any> {
    const response = await apiClient.get(`/delivery-man/${id}/orders`, { params: { status } });
    return response.data;
  }

  async getDeliveryManEarnings(id: string, period?: string): Promise<any> {
    const response = await apiClient.get(`/delivery-man/${id}/earnings`, { params: { period } });
    return response.data;
  }

  async requestDeliveryManWithdrawal(id: string, data: { amount: number; paymentMethod: string; paymentDetails?: any }): Promise<any> {
    const response = await apiClient.post(`/delivery-man/${id}/withdraw`, data);
    return response.data;
  }

  async getDispatchOverview(zoneId?: string): Promise<any> {
    const response = await apiClient.get('/delivery-man/dispatch-overview', { params: { zoneId } });
    return response.data;
  }

  async getNearbyDeliveryMen(lat: number, lng: number, radius?: number, zoneId?: string): Promise<any> {
    const response = await apiClient.get('/delivery-man/nearby', { params: { lat, lng, radius, zoneId } });
    return response.data;
  }

  // ============================================
  // Phase 5: Parcel/Shipping
  // ============================================

  async createParcel(data: {
    senderAddress: any;
    receiverAddress: any;
    category: string;
    deliveryType: string;
    paymentMethod: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    declaredValue?: number;
    specialInstructions?: string;
    isFragile?: boolean;
    requiresSignature?: boolean;
    insuranceRequired?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/parcel', data);
    return response.data;
  }

  async trackParcel(trackingNumber: string): Promise<any> {
    const response = await apiClient.get(`/parcel/track/${trackingNumber}`);
    return response.data;
  }

  async getMyParcels(params?: { page?: number; limit?: number; status?: string }): Promise<any> {
    const response = await apiClient.get('/parcel/my-parcels', { params });
    return response.data;
  }

  async getParcels(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.get('/parcel', { params });
    return response.data;
  }

  async updateParcelStatus(id: string, status: string, note?: string, location?: any, proofImageUrl?: string): Promise<any> {
    const response = await apiClient.patch(`/parcel/${id}/status`, { status, note, location, proofImageUrl });
    return response.data;
  }

  async calculateShippingCost(data: {
    origin: { postalCode?: string; lat?: number; lng?: number };
    destination: { postalCode?: string; lat?: number; lng?: number };
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    category?: string;
  }): Promise<any> {
    const response = await apiClient.post('/parcel/calculate-shipping', data);
    return response.data;
  }

  async getParcelCategories(): Promise<any> {
    const response = await apiClient.get('/parcel/categories');
    return response.data;
  }

  async getDeliveryTypes(): Promise<any> {
    const response = await apiClient.get('/parcel/delivery-types');
    return response.data;
  }

  async getParcelStats(period?: string, zoneId?: string): Promise<any> {
    const response = await apiClient.get('/parcel/stats', { params: { period, zoneId } });
    return response.data;
  }

  // ============================================
  // Phase 5: Chat System
  // ============================================

  async startConversation(data: {
    type: string;
    participantId: string;
    orderId?: string;
    productId?: string;
    subject?: string;
    initialMessage?: string;
  }): Promise<any> {
    const response = await apiClient.post('/chat/conversations', data);
    return response.data;
  }

  async getConversations(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    hasUnread?: boolean;
  }): Promise<any> {
    const response = await apiClient.get('/chat/conversations', { params });
    return response.data;
  }

  async getConversation(id: string): Promise<any> {
    const response = await apiClient.get(`/chat/conversations/${id}`);
    return response.data;
  }

  async sendMessage(data: {
    conversationId: string;
    type: string;
    content?: string;
    mediaUrl?: string;
    replyToMessageId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/chat/messages', data);
    return response.data;
  }

  async getMessages(conversationId: string, params?: { page?: number; limit?: number; beforeMessageId?: string }): Promise<any> {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  }

  async markMessagesAsRead(conversationId: string): Promise<any> {
    const response = await apiClient.post(`/chat/conversations/${conversationId}/read`, {});
    return response.data;
  }

  async closeConversation(conversationId: string): Promise<any> {
    const response = await apiClient.post(`/chat/conversations/${conversationId}/close`, {});
    return response.data;
  }

  async getPredefinedMessages(type?: string): Promise<any> {
    const response = await apiClient.get('/chat/predefined-messages', { params: { type } });
    return response.data;
  }

  async getChatSettings(): Promise<any> {
    const response = await apiClient.get('/chat/settings');
    return response.data;
  }

  // ============================================
  // Phase 5: Enhanced Coupons
  // ============================================

  async createCoupon(data: {
    code: string;
    title?: string;
    type: string;
    value: number;
    scope: string;
    expiryDate: string;
    expenseBearer: string;
    maxDiscount?: number;
    minOrderAmount?: number;
    shopId?: string;
    categoryIds?: string[];
    productIds?: string[];
    totalUsageLimit?: number;
    perUserLimit?: number;
  }): Promise<any> {
    const response = await apiClient.post('/coupons', data);
    return response.data;
  }

  async getCoupons(params?: {
    page?: number;
    limit?: number;
    type?: string;
    scope?: string;
    status?: string;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.get('/coupons', { params });
    return response.data;
  }

  async getCoupon(id: string): Promise<any> {
    const response = await apiClient.get(`/coupons/${id}`);
    return response.data;
  }

  async updateCoupon(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/coupons/${id}`, data);
    return response.data;
  }

  async deleteCoupon(id: string): Promise<any> {
    const response = await apiClient.delete(`/coupons/${id}`);
    return response.data;
  }

  async validateAndApplyCoupon(code: string, shopId?: string, subtotal?: number, items?: any[], zoneId?: string): Promise<any> {
    const response = await apiClient.post('/coupons/apply', { code, shopId, subtotal, items, zoneId });
    return response.data;
  }

  async getAvailableCoupons(shopId?: string, zoneId?: string): Promise<any> {
    const response = await apiClient.get('/coupons/available', { params: { shopId, zoneId } });
    return response.data;
  }

  async getCouponStats(period?: string, shopId?: string): Promise<any> {
    const response = await apiClient.get('/coupons/stats', { params: { period, shopId } });
    return response.data;
  }

  // ============================================
  // Phase 5: POS (Point of Sale)
  // ============================================

  async openPOSSession(shopId: string, openingCash: number, note?: string): Promise<any> {
    const response = await apiClient.post('/pos/sessions/open', { shopId, openingCash, note });
    return response.data;
  }

  async closePOSSession(sessionId: string, closingCash: number, cardSales?: number, mobileSales?: number, note?: string): Promise<any> {
    const response = await apiClient.post(`/pos/sessions/${sessionId}/close`, { closingCash, cardSales, mobileSales, note });
    return response.data;
  }

  async getCurrentPOSSession(shopId: string): Promise<any> {
    const response = await apiClient.get('/pos/sessions/current', { params: { shopId } });
    return response.data;
  }

  async getPOSSessionHistory(shopId: string, page?: number, limit?: number): Promise<any> {
    const response = await apiClient.get('/pos/sessions/history', { params: { shopId, page, limit } });
    return response.data;
  }

  async createPOSOrder(data: {
    shopId: string;
    items: { productId: string; quantity: number; unitPrice?: number; discountPercent?: number }[];
    paymentMethod: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    couponCode?: string;
    orderDiscountPercent?: number;
    cashReceived?: number;
    note?: string;
  }): Promise<any> {
    const response = await apiClient.post('/pos/orders', data);
    return response.data;
  }

  async getPOSOrders(params?: {
    shopId?: string;
    sessionId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/pos/orders', { params });
    return response.data;
  }

  async getPOSOrder(id: string): Promise<any> {
    const response = await apiClient.get(`/pos/orders/${id}`);
    return response.data;
  }

  async refundPOSOrder(id: string, reason: string, refundAmount?: number, items?: any[]): Promise<any> {
    const response = await apiClient.post(`/pos/orders/${id}/refund`, { reason, refundAmount, items });
    return response.data;
  }

  async searchPOSProducts(shopId: string, query: string): Promise<any> {
    const response = await apiClient.get('/pos/products/search', { params: { shopId, q: query } });
    return response.data;
  }

  async getPOSSettings(shopId: string): Promise<any> {
    const response = await apiClient.get('/pos/settings', { params: { shopId } });
    return response.data;
  }

  async updatePOSSettings(shopId: string, settings: any): Promise<any> {
    const response = await apiClient.put('/pos/settings', settings, { params: { shopId } });
    return response.data;
  }

  async getPOSReports(shopId: string, period?: string, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get('/pos/reports', { params: { shopId, period, startDate, endDate } });
    return response.data;
  }

  async holdPOSOrder(shopId: string, items: any[], customerName?: string, note?: string): Promise<any> {
    const response = await apiClient.post('/pos/hold', { shopId, items, customerName, note });
    return response.data;
  }

  async getHeldPOSOrders(shopId: string): Promise<any> {
    const response = await apiClient.get('/pos/hold', { params: { shopId } });
    return response.data;
  }

  async deleteHeldPOSOrder(id: string): Promise<any> {
    const response = await apiClient.delete(`/pos/hold/${id}`);
    return response.data;
  }

  // ============================================
  // Phase 5: Banners/Ads Management
  // ============================================

  async getActiveBanners(placement?: string, zoneId?: string): Promise<any> {
    const response = await apiClient.get('/banners/active', { params: { placement, zoneId } });
    return response.data;
  }

  async createBanner(data: {
    title: string;
    imageUrl: string;
    type: string;
    placement: string;
    subtitle?: string;
    mobileImageUrl?: string;
    clickUrl?: string;
    categoryId?: string;
    productId?: string;
    shopId?: string;
    zoneIds?: string[];
    startDate?: string;
    endDate?: string;
    sortOrder?: number;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonColor?: string;
  }): Promise<any> {
    const response = await apiClient.post('/banners', data);
    return response.data;
  }

  async getBanners(params?: {
    page?: number;
    limit?: number;
    type?: string;
    placement?: string;
    status?: string;
    zoneId?: string;
  }): Promise<any> {
    const response = await apiClient.get('/banners', { params });
    return response.data;
  }

  async getBanner(id: string): Promise<any> {
    const response = await apiClient.get(`/banners/${id}`);
    return response.data;
  }

  async updateBanner(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/banners/${id}`, data);
    return response.data;
  }

  async deleteBanner(id: string): Promise<any> {
    const response = await apiClient.delete(`/banners/${id}`);
    return response.data;
  }

  async reorderBanners(bannerIds: string[]): Promise<any> {
    const response = await apiClient.post('/banners/reorder', { bannerIds });
    return response.data;
  }

  async getBannerStats(id: string, period?: string): Promise<any> {
    const response = await apiClient.get(`/banners/${id}/stats`, { params: { period } });
    return response.data;
  }

  async recordBannerInteraction(entityId: string, entityType: 'banner' | 'ad', interactionType: 'impression' | 'click'): Promise<any> {
    const response = await apiClient.post('/banners/interaction', { entityId, entityType, interactionType });
    return response.data;
  }

  // Paid Ads
  async createAd(data: {
    type: string;
    title: string;
    imageUrl: string;
    billingType: string;
    startDate: string;
    endDate: string;
    description?: string;
    clickUrl?: string;
    shopId?: string;
    productIds?: string[];
    zoneIds?: string[];
    budget?: number;
    dailyBudget?: number;
  }): Promise<any> {
    const response = await apiClient.post('/banners/ads', data);
    return response.data;
  }

  async getMyAds(status?: string): Promise<any> {
    const response = await apiClient.get('/banners/ads/my-ads', { params: { status } });
    return response.data;
  }

  async getAds(params?: { page?: number; limit?: number; type?: string; status?: string; shopId?: string }): Promise<any> {
    const response = await apiClient.get('/banners/ads', { params });
    return response.data;
  }

  async getAd(id: string): Promise<any> {
    const response = await apiClient.get(`/banners/ads/${id}`);
    return response.data;
  }

  async updateAd(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/banners/ads/${id}`, data);
    return response.data;
  }

  async toggleAd(id: string): Promise<any> {
    const response = await apiClient.patch(`/banners/ads/${id}/toggle`, {});
    return response.data;
  }

  async reviewAd(id: string, approved: boolean, reason?: string): Promise<any> {
    const response = await apiClient.patch(`/banners/ads/${id}/review`, { approved, reason });
    return response.data;
  }

  async getAdPricing(): Promise<any> {
    const response = await apiClient.get('/banners/ads/pricing');
    return response.data;
  }

  async getAdStats(id: string, period?: string): Promise<any> {
    const response = await apiClient.get(`/banners/ads/${id}/stats`, { params: { period } });
    return response.data;
  }

  // ============================================
  // Phase 6A: Advanced Analytics/Reports
  // ============================================

  // Dashboard
  async getAnalyticsDashboard(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    zoneId?: string;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/dashboard', { params });
    return response.data;
  }

  async getVendorDashboard(shopId: string, params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/dashboard/vendor', { params: { shopId, ...params } });
    return response.data;
  }

  async getDashboardLayout(layoutName?: string): Promise<any> {
    const response = await apiClient.get('/analytics/dashboard/layout', { params: { name: layoutName } });
    return response.data;
  }

  async saveDashboardLayout(widgets: any[], layoutName?: string, isDefault?: boolean): Promise<any> {
    const response = await apiClient.post('/analytics/dashboard/layout', { widgets, layoutName, isDefault });
    return response.data;
  }

  // Transaction Reports
  async getTransactionReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    transactionType?: string;
    transactionStatus?: string;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/transactions', { params });
    return response.data;
  }

  // Order Reports
  async getOrderReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    zoneId?: string;
    orderStatuses?: string[];
    paymentMethod?: string;
    groupBy?: string;
    includeItems?: boolean;
    includeTax?: boolean;
    includeDelivery?: boolean;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/orders', { params });
    return response.data;
  }

  // Item/Product Reports
  async getItemReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: string;
    lowStockOnly?: boolean;
    stockThreshold?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/items', { params });
    return response.data;
  }

  async getLowStockReport(shopId?: string, threshold?: number): Promise<any> {
    const response = await apiClient.get('/analytics/reports/low-stock', { params: { shopId, threshold } });
    return response.data;
  }

  // Store Reports
  async getStoreReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    zoneId?: string;
    sortBy?: string;
    sortOrder?: string;
    activeOnly?: boolean;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/stores', { params });
    return response.data;
  }

  // Customer Reports
  async getCustomerReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    sortBy?: string;
    sortOrder?: string;
    customerSegment?: string;
    minOrders?: number;
    minSpent?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/customers', { params });
    return response.data;
  }

  // Delivery Reports
  async getDeliveryReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    deliveryManId?: string;
    deliveryStatus?: string;
    includeEarnings?: boolean;
    includeRatings?: boolean;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/delivery', { params });
    return response.data;
  }

  // Expense Reports
  async getExpenseReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    expenseCategory?: string;
    expenseType?: string;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/expenses', { params });
    return response.data;
  }

  // Tax Reports
  async getTaxReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    taxType?: string;
    includeVAT?: boolean;
    separateByTaxRate?: boolean;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/tax', { params });
    return response.data;
  }

  // Revenue Reports
  async getRevenueReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    groupBy?: string;
    includeRefunds?: boolean;
    includeFees?: boolean;
    includeCommissions?: boolean;
    netOnly?: boolean;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/revenue', { params });
    return response.data;
  }

  // Performance Reports
  async getPerformanceReport(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    metrics?: string[];
    includeGoals?: boolean;
  }): Promise<any> {
    const response = await apiClient.get('/analytics/reports/performance', { params });
    return response.data;
  }

  // Export Reports
  async exportReport(data: {
    reportType: string;
    format: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    columns?: string[];
    fileName?: string;
    filters?: Record<string, any>;
  }): Promise<any> {
    const response = await apiClient.post('/analytics/export', data, { responseType: 'blob' });
    return response.data;
  }

  // Scheduled Reports
  async createScheduledReport(data: {
    name: string;
    reportType: string;
    format: string;
    schedule: string;
    recipients: string[];
    filters?: Record<string, any>;
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/analytics/scheduled-reports', data);
    return response.data;
  }

  async getScheduledReports(): Promise<any> {
    const response = await apiClient.get('/analytics/scheduled-reports');
    return response.data;
  }

  async updateScheduledReport(id: string, data: {
    name?: string;
    schedule?: string;
    recipients?: string[];
    filters?: Record<string, any>;
    isActive?: boolean;
  }): Promise<any> {
    const response = await apiClient.put(`/analytics/scheduled-reports/${id}`, data);
    return response.data;
  }

  async deleteScheduledReport(id: string): Promise<any> {
    const response = await apiClient.delete(`/analytics/scheduled-reports/${id}`);
    return response.data;
  }

  // Goals/KPIs
  async createGoal(data: {
    name: string;
    metric: string;
    targetValue: number;
    period: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    notifyOnCompletion?: boolean;
    warningThreshold?: number;
  }): Promise<any> {
    const response = await apiClient.post('/analytics/goals', data);
    return response.data;
  }

  async getGoals(shopId?: string): Promise<any> {
    const response = await apiClient.get('/analytics/goals', { params: { shopId } });
    return response.data;
  }

  async updateGoal(id: string, data: {
    name?: string;
    targetValue?: number;
    notifyOnCompletion?: boolean;
    warningThreshold?: number;
  }): Promise<any> {
    const response = await apiClient.put(`/analytics/goals/${id}`, data);
    return response.data;
  }

  async deleteGoal(id: string): Promise<any> {
    const response = await apiClient.delete(`/analytics/goals/${id}`);
    return response.data;
  }

  // Alerts
  async createAlert(data: {
    name: string;
    metric: string;
    condition: string;
    threshold: number;
    shopId?: string;
    notificationChannels: string[];
    webhookUrl?: string;
    isActive?: boolean;
    cooldownMinutes?: number;
  }): Promise<any> {
    const response = await apiClient.post('/analytics/alerts', data);
    return response.data;
  }

  async getAlerts(shopId?: string): Promise<any> {
    const response = await apiClient.get('/analytics/alerts', { params: { shopId } });
    return response.data;
  }

  async updateAlert(id: string, data: {
    name?: string;
    threshold?: number;
    notificationChannels?: string[];
    isActive?: boolean;
    cooldownMinutes?: number;
  }): Promise<any> {
    const response = await apiClient.put(`/analytics/alerts/${id}`, data);
    return response.data;
  }

  async deleteAlert(id: string): Promise<any> {
    const response = await apiClient.delete(`/analytics/alerts/${id}`);
    return response.data;
  }

  // Comparison Reports
  async comparePeriods(data: {
    reportType: string;
    period1Start: string;
    period1End: string;
    period2Start: string;
    period2End: string;
    shopId?: string;
    metrics?: string[];
  }): Promise<any> {
    const response = await apiClient.post('/analytics/compare/periods', data);
    return response.data;
  }

  async compareShops(data: {
    shopIds: string[];
    period?: string;
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }): Promise<any> {
    const response = await apiClient.post('/analytics/compare/shops', data);
    return response.data;
  }

  // Advanced Analysis
  async getCohortAnalysis(data: {
    cohortType: string;
    metric: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    granularity?: string;
  }): Promise<any> {
    const response = await apiClient.post('/analytics/cohort', data);
    return response.data;
  }

  async getFunnelAnalysis(data: {
    steps: string[];
    period?: string;
    startDate?: string;
    endDate?: string;
    shopId?: string;
    segmentBy?: string;
  }): Promise<any> {
    const response = await apiClient.post('/analytics/funnel', data);
    return response.data;
  }

  // Real-time Stats
  async getRealtimeOrders(shopId?: string): Promise<any> {
    const response = await apiClient.get('/analytics/realtime/orders', { params: { shopId } });
    return response.data;
  }

  async getRealtimeRevenue(shopId?: string): Promise<any> {
    const response = await apiClient.get('/analytics/realtime/revenue', { params: { shopId } });
    return response.data;
  }

  // Quick Stats
  async getQuickStats(shopId?: string, period?: string): Promise<any> {
    const response = await apiClient.get('/analytics/quick-stats', { params: { shopId, period } });
    return response.data;
  }

  // ============================================
  // Phase 6B: Vehicle/Rental Management
  // ============================================

  // Rentals - Vehicle Types
  async getVehicleTypes(params?: { shopId?: string; isActive?: boolean }): Promise<any> {
    const response = await apiClient.get('/rentals/vehicles/types', { params });
    return extractArrayData(response);
  }

  async createVehicleType(data: {
    name: string;
    description?: string;
    category?: string;
    basePrice?: number;
    priceUnit?: string;
    specifications?: Record<string, any>;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/rentals/vehicles/types', data);
    return response.data;
  }

  async updateVehicleType(id: string, data: Partial<{
    name: string;
    description?: string;
    category?: string;
    basePrice?: number;
    priceUnit?: string;
    specifications?: Record<string, any>;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/rentals/vehicles/types/${id}`, data);
    return response.data;
  }

  async deleteVehicleType(id: string): Promise<any> {
    const response = await apiClient.delete(`/rentals/vehicles/types/${id}`);
    return response.data;
  }

  // Rentals - Vehicles
  async getVehicles(params?: {
    shopId?: string;
    vehicleTypeId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/rentals/vehicles', { params });
    return extractPaginatedData(response);
  }

  async getVehicle(id: string): Promise<any> {
    const response = await apiClient.get(`/rentals/vehicles/${id}`);
    return response.data?.data || response.data;
  }

  async createVehicle(data: {
    name: string;
    vehicleTypeId: string;
    registrationNumber?: string;
    vin?: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    description?: string;
    features?: string[];
    specifications?: Record<string, any>;
    images?: string[];
    dailyRate: number;
    hourlyRate?: number;
    weeklyRate?: number;
    monthlyRate?: number;
    deposit?: number;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/rentals/vehicles', data);
    return response.data;
  }

  async updateVehicle(id: string, data: Partial<{
    name: string;
    registrationNumber?: string;
    description?: string;
    features?: string[];
    specifications?: Record<string, any>;
    images?: string[];
    dailyRate?: number;
    hourlyRate?: number;
    weeklyRate?: number;
    monthlyRate?: number;
    deposit?: number;
    status?: string;
  }>): Promise<any> {
    const response = await apiClient.put(`/rentals/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<any> {
    const response = await apiClient.delete(`/rentals/vehicles/${id}`);
    return response.data;
  }

  async getVehicleAvailability(id: string, startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get(`/rentals/vehicles/${id}/availability`, { params: { startDate, endDate } });
    return response.data;
  }

  async setVehicleMaintenanceMode(id: string, data: { inMaintenance: boolean; maintenanceNotes?: string; expectedReturnDate?: string }): Promise<any> {
    const response = await apiClient.post(`/rentals/vehicles/${id}/maintenance`, data);
    return response.data;
  }

  // Rentals - Bookings
  async getRentalBookings(params?: {
    shopId?: string;
    vehicleId?: string;
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/rentals/bookings', { params });
    return extractPaginatedData(response);
  }

  async getRentalBooking(id: string): Promise<any> {
    const response = await apiClient.get(`/rentals/bookings/${id}`);
    return response.data?.data || response.data;
  }

  async createRentalBooking(data: {
    vehicleId: string;
    customerId?: string;
    startDate: string;
    endDate: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    addons?: { addonId: string; quantity: number }[];
    notes?: string;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/rentals/bookings', data);
    return response.data;
  }

  async updateRentalBookingStatus(id: string, data: { status: string; notes?: string }): Promise<any> {
    const response = await apiClient.put(`/rentals/bookings/${id}/status`, data);
    return response.data;
  }

  async cancelRentalBooking(id: string, reason?: string): Promise<any> {
    const response = await apiClient.post(`/rentals/bookings/${id}/cancel`, { reason });
    return response.data;
  }

  async checkInRentalBooking(id: string, data: {
    odometerReading?: number;
    fuelLevel?: string;
    conditionNotes?: string;
    photos?: string[];
    signatureUrl?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/rentals/bookings/${id}/check-in`, data);
    return response.data;
  }

  async checkOutRentalBooking(id: string, data: {
    odometerReading?: number;
    fuelLevel?: string;
    conditionNotes?: string;
    photos?: string[];
    additionalCharges?: { description: string; amount: number }[];
    signatureUrl?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/rentals/bookings/${id}/check-out`, data);
    return response.data;
  }

  async calculateRentalPrice(data: {
    vehicleId: string;
    startDate: string;
    endDate: string;
    addons?: { addonId: string; quantity: number }[];
  }): Promise<any> {
    const response = await apiClient.post('/rentals/bookings/calculate-price', data);
    return response.data;
  }

  // Rentals - Addons
  async getRentalAddons(params?: { shopId?: string; vehicleTypeId?: string }): Promise<any> {
    const response = await apiClient.get('/rentals/addons', { params });
    return extractArrayData(response);
  }

  async createRentalAddon(data: {
    name: string;
    description?: string;
    price: number;
    priceType: 'per_day' | 'per_rental' | 'one_time';
    vehicleTypeIds?: string[];
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/rentals/addons', data);
    return response.data;
  }

  async updateRentalAddon(id: string, data: Partial<{
    name: string;
    description?: string;
    price: number;
    priceType: string;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/rentals/addons/${id}`, data);
    return response.data;
  }

  async deleteRentalAddon(id: string): Promise<any> {
    const response = await apiClient.delete(`/rentals/addons/${id}`);
    return response.data;
  }

  // Rentals - Insurance
  async getRentalInsuranceOptions(params?: { shopId?: string; vehicleTypeId?: string }): Promise<any> {
    const response = await apiClient.get('/rentals/insurance', { params });
    return extractArrayData(response);
  }

  async createRentalInsurance(data: {
    name: string;
    description?: string;
    coverageDetails: string;
    dailyPrice: number;
    deductible?: number;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/rentals/insurance', data);
    return response.data;
  }

  async updateRentalInsurance(id: string, data: Partial<{
    name: string;
    description?: string;
    coverageDetails: string;
    dailyPrice: number;
    deductible?: number;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/rentals/insurance/${id}`, data);
    return response.data;
  }

  async deleteRentalInsurance(id: string): Promise<any> {
    const response = await apiClient.delete(`/rentals/insurance/${id}`);
    return response.data;
  }

  // Rentals - Analytics
  async getRentalAnalytics(params?: {
    shopId?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.get('/rentals/analytics', { params });
    return response.data;
  }

  async getVehicleUtilization(vehicleId: string, params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.get(`/rentals/vehicles/${vehicleId}/utilization`, { params });
    return response.data;
  }

  // ============================================
  // Phase 6C: Barcode/QR Scanner Integration
  // ============================================

  // Barcode Generation
  async generateBarcode(data: {
    data: string;
    type?: string;
    format?: string;
    width?: number;
    height?: number;
    includeText?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/generate', data);
    return response.data;
  }

  async generateQRCode(data: {
    data: string;
    type?: string;
    size?: number;
    errorCorrectionLevel?: string;
    format?: string;
    logoUrl?: string;
    foregroundColor?: string;
    backgroundColor?: string;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/qr/generate', data);
    return response.data;
  }

  async generateBulkBarcodes(data: {
    items: { data: string; type?: string }[];
    format?: string;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/generate/bulk', data);
    return response.data;
  }

  // Barcode Scanning
  async scanBarcode(data: {
    imageData: string;
    formats?: string[];
    multiple?: boolean;
    enhanceImage?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/scan', data);
    return response.data;
  }

  async processScannedBarcode(barcode: string, action?: string, context?: Record<string, any>): Promise<any> {
    const response = await apiClient.post('/barcode/process', { barcode, action, context });
    return response.data;
  }

  // Product Barcodes
  async getProductBarcode(productId: string): Promise<any> {
    const response = await apiClient.get(`/barcode/products/${productId}`);
    return response.data?.data || response.data;
  }

  async assignProductBarcode(productId: string, barcode: string, type?: string): Promise<any> {
    const response = await apiClient.post(`/barcode/products/${productId}`, { barcode, type });
    return response.data;
  }

  async generateProductBarcode(productId: string, type?: string): Promise<any> {
    const response = await apiClient.post(`/barcode/products/${productId}/generate`, { type });
    return response.data;
  }

  async lookupProductByBarcode(barcode: string, shopId?: string): Promise<any> {
    const response = await apiClient.get('/barcode/products/lookup', { params: { barcode, shopId } });
    return response.data?.data || response.data;
  }

  // Label Printing
  async printLabel(data: {
    productId: string;
    quantity?: number;
    labelTemplate?: string;
    labelSize?: { width: number; height: number; unit?: string };
    printerType?: string;
    includeName?: boolean;
    includePrice?: boolean;
    includeSKU?: boolean;
    includeShopLogo?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/labels/print', data);
    return response.data;
  }

  async bulkPrintLabels(data: {
    productIds: string[];
    quantityEach?: number;
    labelTemplate?: string;
    labelSize?: { width: number; height: number; unit?: string };
  }): Promise<any> {
    const response = await apiClient.post('/barcode/labels/print/bulk', data);
    return response.data;
  }

  async getLabelTemplates(shopId?: string): Promise<any> {
    const response = await apiClient.get('/barcode/labels/templates', { params: { shopId } });
    return extractArrayData(response);
  }

  async createLabelTemplate(data: {
    name: string;
    description?: string;
    layout: Record<string, any>;
    size: { width: number; height: number; unit?: string };
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/labels/templates', data);
    return response.data;
  }

  // Inventory Scanning
  async startInventorySession(data: {
    name: string;
    locationId?: string;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/barcode/inventory/sessions', data);
    return response.data;
  }

  async getInventorySessions(params?: {
    shopId?: string;
    status?: string;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/barcode/inventory/sessions', { params });
    return extractArrayData(response);
  }

  async getInventorySession(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/barcode/inventory/sessions/${sessionId}`);
    return response.data?.data || response.data;
  }

  async addInventoryScan(sessionId: string, data: {
    barcode: string;
    productId?: string;
    quantity?: number;
    location?: string;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/barcode/inventory/sessions/${sessionId}/scans`, data);
    return response.data;
  }

  async completeInventorySession(sessionId: string, data?: {
    adjustStock?: boolean;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/barcode/inventory/sessions/${sessionId}/complete`, data || {});
    return response.data;
  }

  async getScanHistory(params?: {
    shopId?: string;
    productId?: string;
    scanType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/barcode/scan/history', { params });
    return extractArrayData(response);
  }

  // ============================================
  // Phase 6D: Dynamic Product Attributes
  // ============================================

  // Attributes
  async getAttributes(params?: {
    shopId?: string;
    categoryId?: string;
    scope?: string;
    type?: string;
    isFilterable?: boolean;
    isRequired?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/attributes', { params });
    return extractPaginatedData(response);
  }

  async getAttribute(id: string): Promise<any> {
    const response = await apiClient.get(`/attributes/${id}`);
    return response.data?.data || response.data;
  }

  async createAttribute(data: {
    name: string;
    code: string;
    type: string;
    description?: string;
    scope?: string;
    isRequired?: boolean;
    isFilterable?: boolean;
    isSearchable?: boolean;
    isComparable?: boolean;
    isVisibleOnFront?: boolean;
    displayOrder?: number;
    defaultValue?: any;
    validationRules?: Record<string, any>;
    displayLocation?: string;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/attributes', data);
    return response.data;
  }

  async updateAttribute(id: string, data: Partial<{
    name: string;
    description?: string;
    isRequired?: boolean;
    isFilterable?: boolean;
    isSearchable?: boolean;
    isComparable?: boolean;
    isVisibleOnFront?: boolean;
    displayOrder?: number;
    defaultValue?: any;
    validationRules?: Record<string, any>;
    displayLocation?: string;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/attributes/${id}`, data);
    return response.data;
  }

  async deleteAttribute(id: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/${id}`);
    return response.data;
  }

  // Attribute Options
  async getAttributeOptions(attributeId: string): Promise<any> {
    const response = await apiClient.get(`/attributes/${attributeId}/options`);
    return extractArrayData(response);
  }

  async addAttributeOption(attributeId: string, data: {
    label: string;
    value: string;
    sortOrder?: number;
    swatchType?: string;
    swatchValue?: string;
    isDefault?: boolean;
  }): Promise<any> {
    const response = await apiClient.post(`/attributes/${attributeId}/options`, data);
    return response.data;
  }

  async updateAttributeOption(attributeId: string, optionId: string, data: Partial<{
    label: string;
    value: string;
    sortOrder?: number;
    swatchType?: string;
    swatchValue?: string;
    isDefault?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/attributes/${attributeId}/options/${optionId}`, data);
    return response.data;
  }

  async deleteAttributeOption(attributeId: string, optionId: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/${attributeId}/options/${optionId}`);
    return response.data;
  }

  async reorderAttributeOptions(attributeId: string, optionIds: string[]): Promise<any> {
    const response = await apiClient.post(`/attributes/${attributeId}/options/reorder`, { optionIds });
    return response.data;
  }

  // Attribute Groups
  async getAttributeGroups(params?: { shopId?: string; categoryId?: string }): Promise<any> {
    const response = await apiClient.get('/attributes/groups', { params });
    return extractArrayData(response);
  }

  async createAttributeGroup(data: {
    name: string;
    code: string;
    description?: string;
    sortOrder?: number;
    displayMode?: string;
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/attributes/groups', data);
    return response.data;
  }

  async updateAttributeGroup(id: string, data: Partial<{
    name: string;
    description?: string;
    sortOrder?: number;
    displayMode?: string;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/attributes/groups/${id}`, data);
    return response.data;
  }

  async deleteAttributeGroup(id: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/groups/${id}`);
    return response.data;
  }

  async addAttributesToGroup(groupId: string, attributeIds: string[]): Promise<any> {
    const response = await apiClient.post(`/attributes/groups/${groupId}/attributes`, { attributeIds });
    return response.data;
  }

  async removeAttributeFromGroup(groupId: string, attributeId: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/groups/${groupId}/attributes/${attributeId}`);
    return response.data;
  }

  // Attribute Sets
  async getAttributeSets(params?: { shopId?: string; categoryId?: string }): Promise<any> {
    const response = await apiClient.get('/attributes/sets', { params });
    return extractArrayData(response);
  }

  async getAttributeSet(id: string): Promise<any> {
    const response = await apiClient.get(`/attributes/sets/${id}`);
    return response.data?.data || response.data;
  }

  async createAttributeSet(data: {
    name: string;
    code: string;
    description?: string;
    groupIds?: string[];
    categoryIds?: string[];
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/attributes/sets', data);
    return response.data;
  }

  async updateAttributeSet(id: string, data: Partial<{
    name: string;
    description?: string;
    groupIds?: string[];
    categoryIds?: string[];
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/attributes/sets/${id}`, data);
    return response.data;
  }

  async deleteAttributeSet(id: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/sets/${id}`);
    return response.data;
  }

  // Product Attributes
  async getProductAttributes(productId: string): Promise<any> {
    const response = await apiClient.get(`/attributes/products/${productId}/values`);
    return extractArrayData(response);
  }

  async setProductAttributeValues(productId: string, values: { attributeId: string; value: any }[]): Promise<any> {
    const response = await apiClient.post(`/attributes/products/${productId}/values`, { values });
    return response.data;
  }

  async getProductAttributeValue(productId: string, attributeId: string): Promise<any> {
    const response = await apiClient.get(`/attributes/products/${productId}/values/${attributeId}`);
    return response.data?.data || response.data;
  }

  async deleteProductAttributeValue(productId: string, attributeId: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/products/${productId}/values/${attributeId}`);
    return response.data;
  }

  // Product Variants
  async generateProductVariants(productId: string, data: {
    attributeIds: string[];
    generationType?: string;
    priceAdjustments?: { optionCombination: string; priceAdjustment: number }[];
    skuTemplate?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/attributes/products/${productId}/variants/generate`, data);
    return response.data;
  }

  async getProductVariants(productId: string): Promise<any> {
    const response = await apiClient.get(`/attributes/products/${productId}/variants`);
    return extractArrayData(response);
  }

  async updateProductVariant(productId: string, variantId: string, data: Partial<{
    sku: string;
    price?: number;
    stock?: number;
    isActive?: boolean;
    images?: string[];
  }>): Promise<any> {
    const response = await apiClient.put(`/attributes/products/${productId}/variants/${variantId}`, data);
    return response.data;
  }

  async deleteProductVariant(productId: string, variantId: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/products/${productId}/variants/${variantId}`);
    return response.data;
  }

  // Category-Attribute Mapping
  async getCategoryAttributes(categoryId: string): Promise<any> {
    const response = await apiClient.get(`/attributes/categories/${categoryId}`);
    return extractArrayData(response);
  }

  async mapAttributesToCategory(categoryId: string, attributeIds: string[]): Promise<any> {
    const response = await apiClient.post(`/attributes/categories/${categoryId}/map`, { attributeIds });
    return response.data;
  }

  async unmapAttributeFromCategory(categoryId: string, attributeId: string): Promise<any> {
    const response = await apiClient.delete(`/attributes/categories/${categoryId}/${attributeId}`);
    return response.data;
  }

  // Attribute Import/Export
  async exportAttributes(params?: { shopId?: string; format?: string }): Promise<any> {
    const response = await apiClient.get('/attributes/export', { params });
    return response.data;
  }

  async importAttributes(data: { attributes: any[]; updateExisting?: boolean; shopId?: string }): Promise<any> {
    const response = await apiClient.post('/attributes/import', data);
    return response.data;
  }

  // ============================================
  // Phase 6E: Flash Sales Enhancement
  // ============================================

  // Flash Sales
  async getFlashSales(params?: {
    shopId?: string;
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await apiClient.get('/flash-sales', { params });
    return extractPaginatedData(response);
  }

  async getFlashSale(id: string): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${id}`);
    return response.data?.data || response.data;
  }

  async createFlashSale(data: {
    name: string;
    description?: string;
    type?: string;
    startTime: string;
    endTime: string;
    discountType?: string;
    discountValue?: number;
    discountDistribution?: string;
    maxQuantityPerUser?: number;
    visibility?: string;
    countdownStyle?: string;
    bannerImage?: string;
    teaser?: { enabled?: boolean; teaserStartTime?: string; message?: string };
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/flash-sales', data);
    return response.data;
  }

  async updateFlashSale(id: string, data: Partial<{
    name: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    discountType?: string;
    discountValue?: number;
    maxQuantityPerUser?: number;
    visibility?: string;
    countdownStyle?: string;
    bannerImage?: string;
    teaser?: Record<string, any>;
  }>): Promise<any> {
    const response = await apiClient.put(`/flash-sales/${id}`, data);
    return response.data;
  }

  async deleteFlashSale(id: string): Promise<any> {
    const response = await apiClient.delete(`/flash-sales/${id}`);
    return response.data;
  }

  // Flash Sale Status
  async updateFlashSaleStatus(id: string, status: string): Promise<any> {
    const response = await apiClient.put(`/flash-sales/${id}/status`, { status });
    return response.data;
  }

  async activateFlashSale(id: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${id}/activate`, {});
    return response.data;
  }

  async pauseFlashSale(id: string, reason?: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${id}/pause`, { reason });
    return response.data;
  }

  async resumeFlashSale(id: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${id}/resume`, {});
    return response.data;
  }

  async endFlashSale(id: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${id}/end`, {});
    return response.data;
  }

  async extendFlashSale(id: string, newEndTime: string, reason?: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${id}/extend`, { newEndTime, reason });
    return response.data;
  }

  // Flash Sale Products
  async getFlashSaleProducts(flashSaleId: string): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/products`);
    return extractArrayData(response);
  }

  async addFlashSaleProducts(flashSaleId: string, products: {
    productId: string;
    flashPrice?: number;
    discountPercentage?: number;
    stockLimit?: number;
    maxPerUser?: number;
    displayOrder?: number;
  }[]): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/products`, { products });
    return response.data;
  }

  async updateFlashSaleProduct(flashSaleId: string, productId: string, data: Partial<{
    flashPrice?: number;
    discountPercentage?: number;
    stockLimit?: number;
    maxPerUser?: number;
    displayOrder?: number;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/flash-sales/${flashSaleId}/products/${productId}`, data);
    return response.data;
  }

  async removeFlashSaleProduct(flashSaleId: string, productId: string): Promise<any> {
    const response = await apiClient.delete(`/flash-sales/${flashSaleId}/products/${productId}`);
    return response.data;
  }

  // Flash Sale Bundles
  async getFlashSaleBundles(flashSaleId: string): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/bundles`);
    return extractArrayData(response);
  }

  async createFlashSaleBundle(flashSaleId: string, data: {
    name: string;
    description?: string;
    products: { productId: string; quantity?: number }[];
    bundlePrice: number;
    originalPrice?: number;
    stockLimit?: number;
    maxPerUser?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/bundles`, data);
    return response.data;
  }

  async updateFlashSaleBundle(flashSaleId: string, bundleId: string, data: Partial<{
    name: string;
    description?: string;
    bundlePrice?: number;
    stockLimit?: number;
    maxPerUser?: number;
    isActive?: boolean;
  }>): Promise<any> {
    const response = await apiClient.put(`/flash-sales/${flashSaleId}/bundles/${bundleId}`, data);
    return response.data;
  }

  async deleteFlashSaleBundle(flashSaleId: string, bundleId: string): Promise<any> {
    const response = await apiClient.delete(`/flash-sales/${flashSaleId}/bundles/${bundleId}`);
    return response.data;
  }

  // Flash Sale Subscriptions
  async subscribeToFlashSale(flashSaleId: string, data?: {
    notificationTypes?: string[];
    email?: string;
    phone?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/subscribe`, data || {});
    return response.data;
  }

  async unsubscribeFromFlashSale(flashSaleId: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/unsubscribe`, {});
    return response.data;
  }

  async getFlashSaleSubscribers(flashSaleId: string, params?: { limit?: number; offset?: number }): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/subscribers`, { params });
    return extractArrayData(response);
  }

  // Flash Sale Early Access
  async getFlashSaleEarlyAccess(flashSaleId: string): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/early-access`);
    return response.data?.data || response.data;
  }

  async setFlashSaleEarlyAccess(flashSaleId: string, data: {
    enabled: boolean;
    startOffset?: number;
    eligibleSegments?: string[];
    maxEarlyUsers?: number;
  }): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/early-access`, data);
    return response.data;
  }

  async checkFlashSaleEarlyAccessEligibility(flashSaleId: string): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/early-access/check`);
    return response.data;
  }

  // Flash Sale Reservations
  async reserveFlashSaleItems(flashSaleId: string, items: { productId: string; quantity: number }[]): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/reserve`, { items });
    return response.data;
  }

  async releaseFlashSaleReservation(reservationId: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/reservations/${reservationId}/release`, {});
    return response.data;
  }

  async confirmFlashSaleReservation(reservationId: string, orderId: string): Promise<any> {
    const response = await apiClient.post(`/flash-sales/reservations/${reservationId}/confirm`, { orderId });
    return response.data;
  }

  // Flash Sale Validation
  async validateFlashSalePurchase(flashSaleId: string, items: { productId: string; quantity: number }[]): Promise<any> {
    const response = await apiClient.post(`/flash-sales/${flashSaleId}/validate`, { items });
    return response.data;
  }

  // Flash Sale Analytics
  async getFlashSaleAnalytics(flashSaleId: string): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/analytics`);
    return response.data;
  }

  async getFlashSaleLeaderboard(flashSaleId: string, params?: { metric?: string; limit?: number }): Promise<any> {
    const response = await apiClient.get(`/flash-sales/${flashSaleId}/leaderboard`, { params });
    return response.data;
  }

  // Active Flash Sales (Public)
  async getActiveFlashSales(params?: { shopId?: string; categoryId?: string }): Promise<any> {
    const response = await apiClient.get('/flash-sales/active', { params });
    return extractArrayData(response);
  }

  async getUpcomingFlashSales(params?: { shopId?: string; limit?: number }): Promise<any> {
    const response = await apiClient.get('/flash-sales/upcoming', { params });
    return extractArrayData(response);
  }

  // ============================================
  // Phase 6F: Store Recommendations AI
  // ============================================

  // Product Recommendations
  async getProductRecommendations(params?: {
    productId?: string;
    productIds?: string[];
    categoryId?: string;
    shopId?: string;
    type?: string;
    context?: string;
    limit?: number;
    excludeProductIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    brand?: string;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/products', { params });
    return extractArrayData(response);
  }

  async getSimilarProducts(productId: string, params?: {
    similarityMetric?: string;
    minSimilarity?: number;
    limit?: number;
    excludeProductIds?: string[];
  }): Promise<any> {
    const response = await apiClient.get(`/recommendations/products/similar/${productId}`, { params });
    return extractArrayData(response);
  }

  async getFrequentlyBoughtTogether(productId: string, params?: {
    limit?: number;
    minConfidence?: number;
  }): Promise<any> {
    const response = await apiClient.get(`/recommendations/products/frequently-bought-together/${productId}`, { params });
    return extractArrayData(response);
  }

  async getTrendingProducts(params?: {
    shopId?: string;
    categoryId?: string;
    period?: string;
    limit?: number;
    zoneId?: string;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/products/trending', { params });
    return extractArrayData(response);
  }

  async getBestSellerProducts(params?: {
    shopId?: string;
    categoryId?: string;
    period?: string;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/products/bestsellers', { params });
    return extractArrayData(response);
  }

  async getNewArrivals(params?: {
    shopId?: string;
    categoryId?: string;
    daysOld?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/products/new-arrivals', { params });
    return extractArrayData(response);
  }

  async getCategoryRecommendations(categoryId: string, limit?: number): Promise<any> {
    const response = await apiClient.get(`/recommendations/products/category/${categoryId}`, { params: { limit } });
    return extractArrayData(response);
  }

  // Personalized Recommendations
  async getPersonalizedRecommendations(params?: {
    context?: string;
    limit?: number;
    shopId?: string;
    excludeProductIds?: string[];
    includeReasons?: boolean;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/personalized', { params });
    return extractArrayData(response);
  }

  async getCartRecommendations(cartItems: { productId: string; quantity: number }[], params?: {
    limit?: number;
    shopId?: string;
    includeUpsells?: boolean;
    includeCrossSells?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/cart', { cartItems, ...params });
    return extractArrayData(response);
  }

  // Upsell & Cross-sell
  async getUpsellRecommendations(productId: string, params?: {
    currentPrice?: number;
    limit?: number;
    maxPriceIncrease?: number;
  }): Promise<any> {
    const response = await apiClient.get(`/recommendations/products/upsell/${productId}`, { params });
    return extractArrayData(response);
  }

  async getCrossSellRecommendations(productIds: string[], params?: {
    limit?: number;
    excludeOwned?: boolean;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/products/cross-sell', { productIds, ...params });
    return extractArrayData(response);
  }

  async getBundleSuggestions(productId: string, params?: {
    bundleSize?: number;
    maxBundlePrice?: number;
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get(`/recommendations/products/bundles/${productId}`, { params });
    return extractArrayData(response);
  }

  // Store Recommendations
  async getStoreRecommendations(params?: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    categoryIds?: string[];
    limit?: number;
    sortByDistance?: boolean;
    sortByRating?: boolean;
    minRating?: number;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/stores', { params });
    return extractArrayData(response);
  }

  async getNearbyStores(latitude: number, longitude: number, params?: {
    radiusKm?: number;
    categoryIds?: string[];
    limit?: number;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/stores/nearby', { params: { latitude, longitude, ...params } });
    return extractArrayData(response);
  }

  // Behavior Tracking
  async trackProductView(data: {
    productId: string;
    sessionId?: string;
    source?: string;
    viewDurationSeconds?: number;
    scrollDepth?: number;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/track/view', data);
    return response.data;
  }

  async trackProductInteraction(data: {
    productId: string;
    interactionType: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/track/interaction', data);
    return response.data;
  }

  async trackSearch(data: {
    query: string;
    resultProductIds?: string[];
    resultCount?: number;
    clickedProductId?: string;
    clickPosition?: number;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/track/search', data);
    return response.data;
  }

  async trackPurchase(data: {
    orderId: string;
    products: { productId: string; quantity: number; price: number }[];
    shopId?: string;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/track/purchase', data);
    return response.data;
  }

  // User Preferences
  async getRecommendationPreferences(): Promise<any> {
    const response = await apiClient.get('/recommendations/preferences');
    return response.data?.data || response.data;
  }

  async updateRecommendationPreferences(data: {
    preferredCategories?: string[];
    preferredBrands?: string[];
    minPriceRange?: number;
    maxPriceRange?: number;
    preferredAttributes?: { key: string; value: string }[];
    enablePersonalization?: boolean;
    showSimilarProductEmails?: boolean;
    showPriceDropAlerts?: boolean;
    showBackInStockAlerts?: boolean;
  }): Promise<any> {
    const response = await apiClient.put('/recommendations/preferences', data);
    return response.data;
  }

  // Recommendation Feedback
  async submitRecommendationFeedback(data: {
    recommendationId: string;
    productId: string;
    action: 'clicked' | 'purchased' | 'dismissed' | 'not_interested';
    reason?: string;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/feedback', data);
    return response.data;
  }

  // Recommendation Analytics (Admin/Vendor)
  async getRecommendationAnalytics(params?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    context?: string;
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/analytics', { params });
    return response.data;
  }

  async getRecommendationPerformance(params?: {
    shopId?: string;
    period?: string;
    metrics?: string[];
  }): Promise<any> {
    const response = await apiClient.get('/recommendations/analytics/performance', { params });
    return response.data;
  }

  // A/B Testing (Admin)
  async createRecommendationTest(data: {
    name: string;
    description?: string;
    shopId: string;
    context: string;
    variants: { name: string; type: string; config?: Record<string, any>; trafficPercent: number }[];
    trafficAllocation?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/tests', data);
    return response.data;
  }

  async getRecommendationTestResults(testId: string, metrics?: string[]): Promise<any> {
    const response = await apiClient.get(`/recommendations/tests/${testId}/results`, { params: { metrics: metrics?.join(',') } });
    return response.data;
  }

  // Recommendation Configuration (Admin/Shop Owner)
  async configureRecommendationEngine(data: {
    shopId?: string;
    enableAI?: boolean;
    enableCollaborativeFiltering?: boolean;
    enableContentBasedFiltering?: boolean;
    enableHybridRecommendations?: boolean;
    weights?: {
      viewHistory?: number;
      purchaseHistory?: number;
      wishlistItems?: number;
      cartItems?: number;
      categoryAffinity?: number;
      brandAffinity?: number;
      priceRange?: number;
      popularityScore?: number;
    };
    excludedProducts?: string[];
    promotedProducts?: string[];
    diversityFactor?: number;
    noveltyFactor?: number;
    recencyDecayDays?: number;
  }): Promise<any> {
    const response = await apiClient.put('/recommendations/config', data);
    return response.data;
  }

  // Generic method to use apiClient directly for admin routes
  get(url: string, config?: any): Promise<any> {
    return apiClient.get(url, config);
  }

  post(url: string, data?: any, config?: any): Promise<any> {
    return apiClient.post(url, data, config);
  }

  put(url: string, data?: any, config?: any): Promise<any> {
    return apiClient.put(url, data, config);
  }

  patch(url: string, data?: any, config?: any): Promise<any> {
    return apiClient.patch(url, data, config);
  }

  delete(url: string, config?: any): Promise<any> {
    return apiClient.delete(url, config);
  }
}

// Export singleton instance
export const api = new API();
export default api;

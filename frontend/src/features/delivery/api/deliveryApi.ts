import { api } from '@/lib/api';
import type { DeliverySettings } from '../types/delivery.types';

// ============================================
// Delivery Man API Endpoints
// ============================================

export const deliveryApi = {
  // ============================================
  // PROFILE & AUTHENTICATION
  // ============================================

  // Get my profile
  getMyProfile: () => api.get('/delivery-man/me'),

  // Get profile by ID
  getProfile: (id: string) => api.get(`/delivery-man/${id}`),

  // Update profile
  updateProfile: (id: string, data: Record<string, any>) =>
    api.put(`/delivery-man/${id}`, data),

  // Register as delivery man
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    vehicleType?: string;
    vehicleNumber?: string;
    identityType?: string;
    identityNumber?: string;
    zoneId?: string;
  }) => api.post('/delivery-man/register', data),

  // ============================================
  // AVAILABILITY & LOCATION
  // ============================================

  // Update availability status (delivery man is always online when using the app)
  updateAvailability: (id: string, availability: 'ONLINE' | 'ON_DELIVERY') =>
    api.patch(`/delivery-man/${id}/availability`, { availability }),

  // Update current location
  updateLocation: (id: string, location: { lat: number; lng: number; address?: string }) =>
    api.patch(`/delivery-man/${id}/location`, location),

  // ============================================
  // ORDERS
  // ============================================

  // Get assigned orders
  getOrders: (id: string, status?: string) =>
    api.get(`/delivery-man/${id}/orders`, { params: { status } }),

  // Accept order
  acceptOrder: (id: string, orderId: string) =>
    api.post(`/delivery-man/${id}/accept-order`, { orderId }),

  // Reject order
  rejectOrder: (id: string, orderId: string, reason?: string) =>
    api.post(`/delivery-man/${id}/reject-order`, { orderId, reason }),

  // Mark order as picked up
  markPickedUp: (id: string, orderId: string) =>
    api.patch(`/delivery-man/${id}/order/${orderId}/picked-up`, {}),

  // Mark order as on the way
  markOnTheWay: (id: string, orderId: string) =>
    api.patch(`/delivery-man/${id}/order/${orderId}/on-the-way`, {}),

  // Complete delivery
  completeDelivery: (id: string, orderId: string, data: { proofOfDelivery?: string; notes?: string }) =>
    api.post(`/delivery-man/${id}/complete-delivery`, { orderId, ...data }),

  // Get delivery history
  getDeliveryHistory: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/delivery-man/${id}/history`, { params }),

  // ============================================
  // EARNINGS & WALLET
  // ============================================

  // Get earnings summary
  getEarnings: (id: string, period?: 'today' | 'week' | 'month' | 'all') =>
    api.get(`/delivery-man/${id}/earnings`, { params: { period } }),

  // Sync/recalculate earnings from completed deliveries
  syncEarnings: (id: string) =>
    api.post(`/delivery-man/${id}/sync-earnings`, {}),

  // Get earnings transactions
  getEarningsTransactions: (id: string, params?: { page?: number; limit?: number; type?: string }) =>
    api.get(`/delivery-man/${id}/earnings/transactions`, { params }),

  // Request withdrawal
  requestWithdrawal: (id: string, data: {
    amount: number;
    paymentMethod?: string;
    paymentDetails?: Record<string, any>;
    bankDetails?: Record<string, any>;
  }) =>
    api.post(`/delivery-man/${id}/withdraw`, data),

  // Get withdrawal history
  getWithdrawals: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/delivery-man/${id}/withdrawals`, { params }),

  // ============================================
  // REVIEWS
  // ============================================

  // Get my reviews
  getReviews: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/delivery-man/${id}/reviews`, { params }),

  // ============================================
  // STATS & DASHBOARD
  // ============================================

  // Get dashboard stats
  getDashboardStats: (id: string) =>
    api.get(`/delivery-man/${id}/stats`),

  // ============================================
  // SETTINGS
  // ============================================

  // Get settings
  getSettings: (id: string) =>
    api.get(`/delivery-man/${id}/settings`),

  // Update settings
  updateSettings: (id: string, settings: Partial<DeliverySettings>) =>
    api.patch(`/delivery-man/${id}/settings`, settings),

  // ============================================
  // NOTIFICATIONS
  // ============================================

  // Get notifications
  getNotifications: (id: string, params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get(`/delivery-man/${id}/notifications`, { params }),

  // Mark notification as read
  markNotificationRead: (id: string, notificationId: string) =>
    api.patch(`/delivery-man/${id}/notifications/${notificationId}/read`, {}),

  // Mark all notifications as read
  markAllNotificationsRead: (id: string) =>
    api.patch(`/delivery-man/${id}/notifications/read-all`, {}),

  // ============================================
  // ZONES
  // ============================================

  // Get all delivery zones
  getZones: (includeInactive?: boolean) =>
    api.get('/zones', { params: { includeInactive } }),

  // Get zone by ID
  getZone: (id: string) =>
    api.get(`/zones/${id}`),

  // Get delivery man preferred zones
  getPreferredZones: (id: string) =>
    api.get(`/delivery-man/${id}/zones`),

  // Update delivery man preferred zones
  updatePreferredZones: (id: string, zoneIds: string[]) =>
    api.patch(`/delivery-man/${id}/zones`, { zoneIds }),

  // ============================================
  // STRIPE CONNECT - WITHDRAWAL VIA STRIPE
  // ============================================

  // Create Stripe Connect account
  createStripeConnectAccount: (id: string, data: { country: string; businessName?: string; email?: string }) =>
    api.post(`/delivery-man/${id}/stripe-connect/account`, data, {
      headers: { 'x-return-url': window.location.origin },
    }),

  // Get Stripe onboarding link
  getStripeOnboardingLink: (id: string) =>
    api.get(`/delivery-man/${id}/stripe-connect/onboarding`, {
      headers: { 'x-return-url': window.location.origin },
    }),

  // Get Stripe Connect account status
  getStripeAccountStatus: (id: string) =>
    api.get(`/delivery-man/${id}/stripe-connect/status`),

  // Get Stripe Express Dashboard link
  getStripeDashboardLink: (id: string) =>
    api.get(`/delivery-man/${id}/stripe-connect/dashboard`),

  // Disconnect Stripe account
  disconnectStripeAccount: (id: string) =>
    api.delete(`/delivery-man/${id}/stripe-connect/account`),

  // Get Stripe balance
  getStripeBalance: (id: string) =>
    api.get(`/delivery-man/${id}/stripe-connect/balance`),

  // Get Stripe transfers
  getStripeTransfers: (id: string, limit?: number) =>
    api.get(`/delivery-man/${id}/stripe-connect/transfers`, { params: { limit } }),

  // Initiate payout via Stripe
  initiateStripePayout: (id: string, data: { amount: number; currency?: string; description?: string }) =>
    api.post(`/delivery-man/${id}/stripe-connect/payout`, data),

  // Get supported countries for Stripe Connect
  getSupportedCountries: () =>
    api.get('/delivery-man/stripe-connect/supported-countries'),
};

export default deliveryApi;

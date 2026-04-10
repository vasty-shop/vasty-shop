import { api } from '@/lib/api';

// ============================================
// Admin API Endpoints
// ============================================

// Dashboard & Analytics
export const adminApi = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentActivity: () => api.get('/admin/dashboard/activity'),

  // Shop Management
  getShops: (params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/shops', { params }),

  getShopById: (shopId: string) => api.get(`/admin/shops/${shopId}`),

  approveShop: (shopId: string) =>
    api.patch(`/admin/shops/${shopId}/approve`, {}),

  rejectShop: (shopId: string, reason: string) =>
    api.patch(`/admin/shops/${shopId}/reject`, { reason }),

  // User Management
  getUsers: (params?: {
    role?: 'customer' | 'vendor' | 'admin' | 'all';
    status?: 'active' | 'suspended' | 'all';
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/users', { params }),

  getUserById: (userId: string) => api.get(`/admin/users/${userId}`),

  updateUserRole: (userId: string, role: string) =>
    api.patch(`/admin/users/${userId}/role`, { role }),

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    api.patch(`/admin/users/${userId}/status`, { status }),

  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

  // Analytics
  getAnalyticsOverview: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/admin/analytics/overview', { params }),

  getRevenueAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => api.get('/admin/analytics/revenue', { params }),

  getOrdersAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => api.get('/admin/analytics/orders', { params }),

  getTopShops: (params?: { limit?: number; startDate?: string; endDate?: string }) =>
    api.get('/admin/analytics/top-shops', { params }),

  getTopProducts: (params?: { limit?: number; startDate?: string; endDate?: string }) =>
    api.get('/admin/analytics/top-products', { params }),

  getTopCustomers: (params?: { limit?: number; startDate?: string; endDate?: string }) =>
    api.get('/admin/analytics/top-customers', { params }),

  // Settings
  getSettings: () => api.get('/admin/settings'),

  updateSettings: (settings: Record<string, any>) =>
    api.patch('/admin/settings', settings),

  uploadLogo: (formData: FormData) =>
    api.post('/admin/settings/logo', formData),

  // Categories (platform-wide)
  getCategories: () => api.get('/admin/categories'),

  createCategory: (data: { name: string; slug: string; description?: string; parentId?: string }) =>
    api.post('/admin/categories', data),

  updateCategory: (categoryId: string, data: { name?: string; slug?: string; description?: string }) =>
    api.patch(`/admin/categories/${categoryId}`, data),

  deleteCategory: (categoryId: string) =>
    api.delete(`/admin/categories/${categoryId}`),

  // Orders (platform-wide view)
  getOrders: (params?: {
    status?: string;
    shopId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/orders', { params }),

  getOrderById: (orderId: string) => api.get(`/admin/orders/${orderId}`),
};

export default adminApi;

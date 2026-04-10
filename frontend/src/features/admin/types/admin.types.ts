// Admin Panel Type Definitions

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  shopGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registered' | 'shop_created' | 'order_placed' | 'shop_approved' | 'shop_rejected';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  productsCount: number;
  ordersCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'vendor' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  emailVerified: boolean;
  ordersCount: number;
  totalSpent: number;
  shopsCount?: number;
  createdAt: string;
  lastLogin?: string;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  activeShops: number;
  shopsGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TopShop {
  id: string;
  name: string;
  logo?: string;
  ordersCount: number;
  revenue: number;
  rank: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image?: string;
  shopName: string;
  unitsSold: number;
  revenue: number;
  rank: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  ordersCount: number;
  totalSpent: number;
  rank: number;
}

export interface PlatformSettings {
  general: {
    platformName: string;
    logoUrl?: string;
    supportEmail: string;
    defaultCurrency: string;
    defaultLanguage: string;
  };
  commission: {
    rate: number;
    minimumOrderAmount: number;
    freeShippingThreshold: number;
  };
  shop: {
    autoApprove: boolean;
    requiredDocuments: string[];
    maxProductsPerShop: number;
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    codEnabled: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  productsCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

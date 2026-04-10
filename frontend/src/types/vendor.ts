import { OrderHistory } from './order';

/**
 * Vendor Dashboard Statistics
 */
export interface VendorStats {
  totalRevenue: number;
  revenueGrowth: number; // percentage
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  ordersGrowth: number; // percentage
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  productsGrowth: number; // percentage
  averageRating: number;
  totalReviews: number;
  ratingGrowth: number; // percentage
  lowStockProducts: number;
  outOfStockProducts: number;
}

/**
 * Revenue Data Point (for charts)
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * Orders Chart Data
 */
export interface OrdersChartData {
  date: string;
  orders: number;
  pending: number;
  processing: number;
  completed: number;
}

/**
 * Top Product Data
 */
export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  image: string;
}

/**
 * Sales by Category
 */
export interface CategorySales {
  category: string;
  sales: number;
  revenue: number;
}

/**
 * Vendor Dashboard Data
 */
export interface VendorDashboardData {
  stats: VendorStats;
  revenueData: RevenueDataPoint[];
  ordersData: OrdersChartData[];
  topProducts: TopProduct[];
  categorySales: CategorySales[];
  recentOrders: OrderHistory[];
  alerts: VendorAlert[];
}

/**
 * Vendor Alert Types
 */
export type VendorAlertType = 'low_stock' | 'pending_order' | 'verification' | 'payment' | 'info' | 'warning' | 'error';

/**
 * Vendor Alert
 */
export interface VendorAlert {
  id: string;
  type: VendorAlertType;
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Product Status
 */
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock';

/**
 * Product Variant
 */
export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

/**
 * Vendor Product (Extended from Product)
 */
export interface VendorProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand: string;
  category: string;
  subcategory?: string;

  // Pricing
  price: number;
  salePrice?: number;
  cost?: number;
  taxRate?: number;

  // Inventory
  sku: string;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;

  // Media
  images: string[];
  featuredImage: string;
  model3d?: string;

  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];
  sizes?: string[];
  colors?: string[];

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];

  // Status
  status: ProductStatus;
  isPublished: boolean;
  publishedAt?: string;

  // Stats
  views: number;
  sales: number;
  revenue: number;
  rating: number;
  reviewCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Product Filters
 */
export interface ProductFilters {
  search?: string;
  category?: string;
  status?: ProductStatus | 'all';
  stockLevel?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy?: 'name' | 'price' | 'stock' | 'sales' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Product List Response
 */
export interface ProductListResponse {
  products: VendorProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Product Form Data
 */
export interface ProductFormData {
  // Basic Info
  name: string;
  description: string;
  shortDescription?: string;
  brand: string;
  category: string;
  subcategory?: string;

  // Pricing
  price: number;
  salePrice?: number;
  cost?: number;
  taxRate?: number;

  // Inventory
  sku: string;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;

  // Media
  images: File[] | string[];
  featuredImageIndex: number;
  model3d?: string;

  // Variants
  hasVariants: boolean;
  variants?: ProductVariant[];
  sizes?: string[];
  colors?: string[];

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  slug?: string;

  // Status
  status: ProductStatus;
  isPublished: boolean;
}

/**
 * Bulk Action Types
 */
export type BulkActionType = 'delete' | 'publish' | 'unpublish' | 'activate' | 'deactivate';

/**
 * Image Upload Response
 */
export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * Product Analytics
 */
export interface ProductAnalytics {
  productId: string;
  views: number;
  viewsGrowth: number;
  sales: number;
  salesGrowth: number;
  revenue: number;
  revenueGrowth: number;
  conversionRate: number;
  averageOrderValue: number;
  recentOrders: OrderHistory[];
  salesByDate: Array<{ date: string; sales: number; revenue: number }>;
}

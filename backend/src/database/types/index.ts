/**
 * Database Entity Types and Interfaces
 * Vasty Shop E-commerce Platform
 */

// Entity Type Constants
export const EntityType = {
  // Multi-vendor
  SHOP: 'shops',
  SHOP_TEAM_MEMBER: 'shop_team_members',

  // Products
  CATEGORY: 'categories',
  PRODUCT: 'products',

  // Shopping
  CART: 'carts',

  // Orders
  ORDER: 'orders',
  ORDER_ITEM: 'order_items',

  // Marketing
  CAMPAIGN: 'campaigns',
  OFFER: 'offers',

  // Delivery
  DELIVERY_ADDRESS: 'delivery_addresses',
  DELIVERY_TRACKING: 'delivery_tracking',

  // Wishlist
  WISHLIST: 'wishlists',

  // Reviews
  REVIEW: 'reviews',

  // Payments
  PAYMENT_TRANSACTION: 'payment_transactions',

  // Notifications
  NOTIFICATION: 'notifications',

  // Analytics
  ACTIVITY_LOG: 'activity_logs',
  SHOP_ANALYTICS: 'shop_analytics',

  // Settings
  PLATFORM_SETTINGS: 'platform_settings',
} as const;

// Entity Interfaces

// Shop Entity
export interface ShopEntity {
  id: string;
  owner_id: string;

  // Shop Details
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;

  // Business Information
  business_name?: string;
  business_type?: 'individual' | 'llc' | 'corporation';
  tax_id?: string;
  business_email: string;
  business_phone?: string;
  business_address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };

  // Shop Status
  status: 'pending' | 'active' | 'suspended' | 'closed';
  is_verified: boolean;
  verified_at?: string;

  // Team Members
  team_members?: Array<{
    user_id: string;
    role: 'owner' | 'admin' | 'manager' | 'staff';
    joined_at: string;
  }>;

  // Shop Settings
  settings?: {
    min_order?: number;
    currency?: string;
    tax_rate?: number;
    shipping_methods?: string[];
    payment_methods?: string[];
    return_policy?: string;
    shipping_policy?: string;
    privacy_policy?: string;
  };

  // Statistics
  total_sales: number;
  total_orders: number;
  total_products: number;
  rating: number;
  total_reviews: number;

  // Storefront Builder
  storefront_config?: Record<string, any>;
  storefront_published?: boolean;
  storefront_published_at?: string;

  // Mobile App Builder (one unified app with multiple panels - separate from web storefront)
  mobile_app_config?: Record<string, any>;
  mobile_app_published?: boolean;
  mobile_app_published_at?: string;

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Shop Team Member Entity
export interface ShopTeamMemberEntity {
  id: string;
  shop_id: string;
  user_id: string;

  // Role & Permissions
  role: 'owner' | 'admin' | 'manager' | 'staff';
  permissions: string[];
  status: 'active' | 'inactive' | 'invited';

  // Invitation
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;

  created_at: string;
  updated_at: string;
}

// Product Entity
export interface ProductEntity {
  id: string;
  shop_id: string;

  // Product Details
  name: string;
  slug: string;
  description?: string;
  short_description?: string;

  // Pricing
  price: number;
  sale_price?: number;
  cost_price?: number;
  compare_price?: number;

  // Inventory
  sku: string;
  barcode?: string;
  stock: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorder: boolean;

  // Product Type & Status
  product_type: 'simple' | 'variable' | 'digital';
  status: 'draft' | 'published' | 'out_of_stock' | 'archived';

  // Media
  images: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
  }>;
  videos?: any[];

  // Variants
  variants?: any[];
  variant_attributes?: any[];

  // Categorization
  categories: string[];
  tags: string[];

  // Shipping
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  requires_shipping: boolean;
  shipping_class?: string;

  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];

  // Features
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;

  // Statistics
  view_count: number;
  total_sales: number;
  rating: number;
  total_reviews: number;

  // Additional Data
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Category Entity
export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Hierarchy
  parent_id?: string;
  level: number;

  // Media
  image?: string;
  icon?: string;

  // Display
  display_order: number;
  is_active: boolean;
  is_featured: boolean;

  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];

  // Statistics
  product_count: number;

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Order Entity
export interface OrderEntity {
  id: string;
  order_number: string;
  user_id: string;
  shop_id: string;

  // Order Items
  items: Array<{
    product_id: string;
    product_name: string;
    product_sku: string;
    product_image?: string;
    variant_id?: string;
    variant_details?: Record<string, any>;
    unit_price: number;
    quantity: number;
    discount: number;
    total: number;
  }>;

  // Pricing
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: string;

  // Payment Information
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_id?: string;
  paid_at?: string;

  // Addresses
  shipping_address: {
    full_name: string;
    phone_number: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address: Record<string, any>;

  // Delivery Information
  delivery_method?: string;
  tracking_number?: string;
  carrier?: string;
  delivery_man_name?: string;
  estimated_delivery?: string;
  delivered_at?: string;

  // Order Status
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';

  // Timeline
  timeline: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;

  // Notes
  customer_note?: string;
  shop_note?: string;
  internal_note?: string;

  // Refund Information
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: string;

  // Applied Discounts
  applied_coupons: any[];

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Review Entity
export interface ReviewEntity {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;

  // Review Content
  rating: number;
  title: string;
  review_text: string;

  // Media
  review_images?: string[];
  review_videos?: string[];

  // Verification
  is_verified_purchase: boolean;

  // Helpfulness
  helpful_count: number;
  not_helpful_count: number;

  // Shop Response
  shop_response?: string;
  responded_by?: string;
  responded_at?: string;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  rejection_reason?: string;

  // Moderation
  is_reported: boolean;
  report_reason?: string;
  report_count: number;

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

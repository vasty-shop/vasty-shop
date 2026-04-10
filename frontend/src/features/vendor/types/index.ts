// Vendor Types & Interfaces

export interface VendorShop {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  totalReviews: number;
  totalSales: number;
  totalRevenue: number;
  joinedDate: string;
  verified: boolean;
  settings: VendorSettings;
}

export interface VendorSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxId?: string;
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
  returnPolicy: string;
  privacyPolicy: string;
}

export interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal' | 'bank_transfer';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  enabled: boolean;
  estimatedDays: number;
  cost: number;
  freeShippingThreshold?: number;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  taxable: boolean;
  taxRate?: number;
  stock: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  status: 'active' | 'draft' | 'archived' | 'out_of_stock';
  featured: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  stock: number;
  options: Record<string, string>; // e.g., { size: 'M', color: 'Red' }
  image?: string;
}

export interface ProductAttribute {
  name: string;
  value: string | string[];
  visible: boolean;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: string;
  trackingNumber?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface VendorAnalytics {
  period: string;
  revenue: {
    total: number;
    change: number;
    data: TimeSeriesData[];
  };
  orders: {
    total: number;
    change: number;
    data: TimeSeriesData[];
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    change: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image?: string;
  sales: number;
  revenue: number;
  trend: number;
}

export interface TopCategory {
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface VendorOffer {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
  value: number;
  code?: string;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: string;
}

export interface VendorReview {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  response?: {
    text: string;
    date: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface VendorTeamMember {
  id: string;
  vendorId: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  permissions: string[];
  status: 'active' | 'inactive';
  invitedAt: string;
  joinedAt?: string;
}

export interface VendorNotification {
  id: string;
  type: 'order' | 'review' | 'product' | 'system' | 'payment';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

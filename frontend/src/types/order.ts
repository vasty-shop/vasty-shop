import { Product } from './product';

/**
 * Order Status Types
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'refund_requested'
  | 'returned';

/**
 * Order Payment Method Types
 */
export type OrderPaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer';

/**
 * Represents a single item within an order
 * Supports both nested product format (frontend) and flat format (backend)
 */
export interface OrderItem {
  id: string;
  quantity: number;
  price: number; // Price at time of purchase
  discount?: number;

  // Nested product format (frontend/legacy)
  product?: Product;
  size?: string;
  color?: string;

  // Flat format (backend)
  productId?: string;
  productName?: string;
  productImage?: string;
  shopId?: string;
  shopName?: string;
  variant?: {
    size?: string;
    color?: string;
  };
  subtotal?: number;
}

/**
 * Order Shipping Address
 */
export interface OrderShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

/**
 * Timeline Event for Order Tracking
 */
export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

/**
 * Main Order History Interface
 */
export interface OrderHistory {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];

  // Pricing
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;

  // Shipping & Delivery
  shippingAddress: OrderShippingAddress;
  estimatedDelivery?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  carrier?: string;

  // Payment
  paymentMethod: OrderPaymentMethod;
  lastFourDigits?: string;

  // Timeline
  timeline: OrderTimelineEvent[];

  // Additional Info
  notes?: string;
  invoiceUrl?: string;
  canCancel: boolean;
  canReturn: boolean;
  canReview: boolean;
}

/**
 * Order Statistics
 */
export interface OrderStatistics {
  totalOrders: number;
  activeOrders: number;
  totalSpentThisYear: number;
  pendingReturns: number;
}

/**
 * Order Filter Options
 */
export interface OrderFilters {
  status?: OrderStatus | 'all';
  dateRange?: 'last_30_days' | 'last_6_months' | 'this_year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  sortBy?: 'most_recent' | 'oldest_first' | 'price_high_low' | 'price_low_high';
  searchQuery?: string;
}

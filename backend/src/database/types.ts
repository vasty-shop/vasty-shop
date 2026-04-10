// ============================================
// TypeScript Type Definitions for Vasty Shop
// ============================================

// Entity Types Enum
export enum EntityType {
  SHOP = 'shops',
  SHOP_TEAM_MEMBER = 'shop_team_members',
  SHOP_INVITE = 'shop_invites',
  CATEGORY = 'categories',
  PRODUCT = 'products',
  CART = 'carts',
  ORDER = 'orders',
  ORDER_ITEM = 'order_items',
  CAMPAIGN = 'campaigns',
  OFFER = 'offers',
  DELIVERY_ADDRESS = 'delivery_addresses',
  DELIVERY_METHOD = 'delivery_methods',
  DELIVERY_TRACKING = 'delivery_tracking',
  WISHLIST = 'wishlists',
  REVIEW = 'reviews',
  PAYMENT = 'payment_transactions',
  VENDOR_PAYOUT = 'vendor_payouts',
  NOTIFICATION = 'notifications',
  ACTIVITY_LOG = 'activity_logs',
  SHOP_ANALYTICS = 'shop_analytics',
  PLATFORM_SETTINGS = 'platform_settings',
  CURRENCY = 'currencies',
  EXCHANGE_RATE = 'exchange_rates',
  USER_PREFERENCES = 'user_preferences',
  TAX_COUNTRY = 'tax_countries',
  TAX_RATE = 'tax_rates',
  PRODUCT_TAX_CATEGORY = 'product_tax_categories',
  TAX_RULE = 'tax_rules',
}

// Status Enums
export enum DeliveryStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum StripeConnectStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  RESTRICTED = 'restricted',
  VERIFICATION_REQUIRED = 'verification_required',
  REJECTED = 'rejected',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_PLACED = 'order_placed',
  ORDER_UPDATED = 'order_updated',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  REVIEW_ADDED = 'review_added',
  SHOP_MESSAGE = 'shop_message',
  OFFER_ALERT = 'offer_alert',
  LOW_STOCK = 'low_stock',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Team Member Roles
export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

// Team Member Status
export enum TeamMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  INVITED = 'invited',
}

// Invitation Status
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

// Entity Interfaces
export interface ShopEntity {
  id: string;
  owner_id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  businessName?: string;
  business_name?: string;
  businessType?: string;
  business_type?: string;
  taxId?: string;
  tax_id?: string;
  businessEmail: string;
  business_email?: string;
  businessPhone?: string;
  business_phone?: string;
  businessAddress?: Record<string, any>;
  business_address?: Record<string, any>;
  status: string;
  isVerified: boolean;
  is_verified: boolean;
  verifiedAt?: string;
  verified_at?: string;
  teamMembers: any[];
  team_members?: any[];
  settings: Record<string, any>;
  // Language Settings
  defaultLanguage?: string;
  default_language?: string;
  supportedLanguages?: string[];
  supported_languages?: string[];
  totalSales: number;
  total_sales?: number;
  totalOrders: number;
  total_orders?: number;
  totalProducts: number;
  total_products?: number;
  rating: number;
  totalReviews: number;
  total_reviews?: number;
  // Stripe Connect fields
  stripeAccountId?: string;
  stripe_account_id?: string;
  stripeConnectStatus?: StripeConnectStatus;
  stripe_connect_status?: string;
  stripeChargesEnabled?: boolean;
  stripe_charges_enabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripe_payouts_enabled?: boolean;
  stripeRequirements?: Record<string, any>;
  stripe_requirements?: Record<string, any>;
  stripeVerificationDeadline?: string;
  stripe_verification_deadline?: string;
  // Storefront Builder fields
  storefrontConfig?: Record<string, any>;
  storefront_config?: Record<string, any>;
  storefrontPublished?: boolean;
  storefront_published?: boolean;
  storefrontPublishedAt?: string;
  storefront_published_at?: string;
  // Mobile App Builder fields (one unified app with multiple panels - separate from web)
  mobileAppConfig?: Record<string, any>;
  mobile_app_config?: Record<string, any>;
  mobileAppPublished?: boolean;
  mobile_app_published?: boolean;
  mobileAppPublishedAt?: string;
  mobile_app_published_at?: string;
  createdAt: string;
  created_at: string;
  updatedAt: string;
  updated_at: string;
  deletedAt?: string;
  deleted_at?: string;
}

export interface ProductEntity {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  brand?: string;
  description?: string;
  shortDescription?: string;
  material?: string;
  features?: string[];
  specifications?: Record<string, string>;
  sizes?: string[];
  colors?: { name: string; code: string }[];
  price: number;
  salePrice?: number;
  costPrice?: number;
  comparePrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  productType: string;
  status: string;
  images: any[];
  videos: any[];
  variants: any[];
  variantAttributes: any[];
  categories: any[];
  tags: any[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  requiresShipping: boolean;
  shippingClass?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: any[];
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  viewCount: number;
  totalSales: number;
  rating: number;
  totalReviews: number;
  attributes: Record<string, any>;
  metadata: Record<string, any>;
  careInstructions?: string[];
  sizeChart?: Array<{ size: string; chest?: string; waist?: string; hips?: string; length?: string }>;
  shippingInfo?: {
    freeShippingThreshold?: number;
    standardDays?: string;
    expressDays?: string;
    expressCost?: number;
    nextDayCost?: number;
  };
  returnPolicy?: {
    returnDays?: number;
    conditions?: string[];
    freeReturns?: boolean;
    refundDays?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DeliveryEntity {
  id: string;
  orderId: string;
  shopId: string;
  method: string;
  status: DeliveryStatus;
  trackingNumber: string;
  pickupAddress?: Record<string, any>;
  deliveryAddress: Record<string, any>;
  carrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  actualPickup?: string;
  attempts: any[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAddressEntity {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DeliveryTrackingEntity {
  id: string;
  orderId: string;
  shopId: string;
  trackingNumber: string;
  carrier?: string;
  deliveryMethod: string;
  currentStatus: DeliveryStatus;
  statusHistory: any[];
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryNotes?: string;
  signatureRequired: boolean;
  proofOfDeliveryUrl?: string;
  deliveryAttempts: number;
  failedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransactionEntity {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  providerTransactionId?: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  errorMessage?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  priority: NotificationPriority;
  createdAt: string;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  userId: string;
  shopId: string;
  items: any[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paidAt?: string;
  shippingAddress: Record<string, any>;
  billingAddress: Record<string, any>;
  deliveryMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  deliveryManName?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  status: string;
  fulfillmentStatus: string;
  timeline: any[];
  customerNote?: string;
  shopNote?: string;
  internalNote?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  appliedCoupons: any[];
  // Stripe Connect fields
  stripePaymentIntentId?: string;
  stripeConnectEnabled?: boolean;
  platformFee?: number;
  vendorAmount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CampaignEntity {
  id: string;
  shopId?: string;
  name: string;
  slug: string;
  description?: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  status: string;
  discountType?: string;
  discountValue?: number;
  maxDiscount?: number;
  minPurchase?: number;
  targetProducts: string[];
  targetCategories: string[];
  targetShops: string[];
  bannerImages: any[];
  featuredImage?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  settings: Record<string, any>;
  termsConditions?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface OfferEntity {
  id: string;
  shopId?: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  minItems?: number;
  specificProducts: string[];
  specificCategories: string[];
  excludedProducts: string[];
  firstOrderOnly: boolean;
  userTypes: string[];
  totalUsageLimit?: number;
  perUserLimit: number;
  currentUsage: number;
  validFrom: string;
  validTo: string;
  status: string;
  appliedTo: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface WishlistEntity {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  products: any[];
  privacy: string;
  shareToken?: string;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ReviewEntity {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title: string;
  reviewText: string;
  reviewImages: string[];
  reviewVideos: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  shopResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  status: string;
  rejectionReason?: string;
  isReported: boolean;
  reportReason?: string;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CartEntity {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  appliedCoupons: any[];
  shippingAddressId?: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  image?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ShopTeamMemberEntity {
  id: string;
  shop_id: string;
  shopId: string;
  user_id: string;
  userId: string;
  role: TeamMemberRole | string;
  permissions: string[];
  status: TeamMemberStatus | string;
  is_active: boolean;
  isActive: boolean;
  invited_by?: string;
  invitedBy?: string;
  invited_at?: string;
  invitedAt?: string;
  joined_at?: string;
  joinedAt?: string;
  created_at: string;
  createdAt: string;
  updated_at: string;
  updatedAt: string;
  // User details (populated when fetching)
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

export interface ShopInviteEntity {
  id: string;
  shop_id: string;
  shopId: string;
  email: string;
  role: TeamMemberRole | string;
  permissions: string[];
  invited_by: string;
  invitedBy: string;
  token: string;
  message?: string;
  expires_at: string;
  expiresAt: string;
  status: InvitationStatus | string;
  accepted_at?: string;
  acceptedAt?: string;
  created_at: string;
  createdAt: string;
  // Related data (populated when fetching)
  shop?: {
    id: string;
    name: string;
    logo?: string;
  };
  inviter?: {
    id: string;
    email: string;
    name?: string;
  };
}

// Cart item interface
export interface CartItem {
  id?: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  total?: number;
  image?: string;
  variant?: Record<string, any>;
  shopId: string;
  shopName?: string;
}

// User entity (database auth users)
// Note: Users are managed by database auth, this is just for typing
export interface UserEntity {
  id: string;
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Multi-Currency & Tax Entity Interfaces

export interface CurrencyEntity {
  id: string;
  code: string;
  name: string;
  symbol: string;
  symbolNative: string;
  symbol_native?: string;
  decimalDigits: number;
  decimal_digits?: number;
  rounding: number;
  symbolPosition: string;
  symbol_position?: string;
  decimalSeparator: string;
  decimal_separator?: string;
  thousandSeparator: string;
  thousand_separator?: string;
  isActive: boolean;
  is_active?: boolean;
  isDefault: boolean;
  is_default?: boolean;
  displayOrder: number;
  display_order?: number;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface ExchangeRateEntity {
  id: string;
  fromCurrency: string;
  from_currency?: string;
  toCurrency: string;
  to_currency?: string;
  rate: number;
  source?: string;
  validFrom: string;
  valid_from?: string;
  validUntil?: string;
  valid_until?: string;
  isActive: boolean;
  is_active?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface UserPreferencesEntity {
  id: string;
  userId: string;
  user_id?: string;
  preferredCurrency?: string;
  preferred_currency?: string;
  preferredLanguage?: string;
  preferred_language?: string;
  preferredCountry?: string;
  preferred_country?: string;
  emailNotifications: boolean;
  email_notifications?: boolean;
  smsNotifications: boolean;
  sms_notifications?: boolean;
  pushNotifications: boolean;
  push_notifications?: boolean;
  theme: string;
  timezone?: string;
  settings: Record<string, any>;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface TaxCountryEntity {
  id: string;
  code: string;
  name: string;
  taxName: string;
  tax_name?: string;
  taxAbbreviation?: string;
  tax_abbreviation?: string;
  defaultRate: number;
  default_rate?: number;
  taxType: string;
  tax_type?: string;
  compoundTax: boolean;
  compound_tax?: boolean;
  taxOnShipping: boolean;
  tax_on_shipping?: boolean;
  requiresTaxId: boolean;
  requires_tax_id?: boolean;
  taxIdFormat?: string;
  tax_id_format?: string;
  isActive: boolean;
  is_active?: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface TaxRateEntity {
  id: string;
  countryId: string;
  country_id?: string;
  name: string;
  rate: number;
  stateProvince?: string;
  state_province?: string;
  city?: string;
  postalCode?: string;
  postal_code?: string;
  postalCodePattern?: string;
  postal_code_pattern?: string;
  priority: number;
  isCompound: boolean;
  is_compound?: boolean;
  validFrom?: string;
  valid_from?: string;
  validUntil?: string;
  valid_until?: string;
  isActive: boolean;
  is_active?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface ProductTaxCategoryEntity {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  is_active?: boolean;
  displayOrder: number;
  display_order?: number;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface TaxRuleEntity {
  id: string;
  countryId: string;
  country_id?: string;
  taxCategoryId: string;
  tax_category_id?: string;
  name: string;
  description?: string;
  rateOverride?: number;
  rate_override?: number;
  customerType?: string;
  customer_type?: string;
  minAmount?: number;
  min_amount?: number;
  maxAmount?: number;
  max_amount?: number;
  validFrom?: string;
  valid_from?: string;
  validUntil?: string;
  valid_until?: string;
  priority: number;
  isActive: boolean;
  is_active?: boolean;
  conditions: Record<string, any>;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

// Stripe Connect / Vendor Payout Entities

export interface VendorPayoutEntity {
  id: string;
  shopId: string;
  shop_id?: string;
  orderId?: string;
  order_id?: string;
  amount: number;
  platformFee: number;
  platform_fee?: number;
  currency: string;
  stripeTransferId?: string;
  stripe_transfer_id?: string;
  stripePayoutId?: string;
  stripe_payout_id?: string;
  stripeBalanceTransactionId?: string;
  stripe_balance_transaction_id?: string;
  status: PayoutStatus;
  estimatedArrival?: string;
  estimated_arrival?: string;
  paidAt?: string;
  paid_at?: string;
  failureCode?: string;
  failure_code?: string;
  failureMessage?: string;
  failure_message?: string;
  metadata: Record<string, any>;
  description?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

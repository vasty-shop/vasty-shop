/**
 * Vasty Shop Database Schema Definition
 * Using database SDK's migration system
 *
 * Note: User authentication is handled by database (auth.users table)
 * - Users are stored in auth.users table (managed by database auth)
 * - Use user_id as string (database user ID) to reference users
 * - Store additional user data in raw_user_meta_data field
 * - All tables go in public schema
 */

// Export types and entity interfaces
export * from './types';

export const schema = {
  // ============================================
  // MULTI-VENDOR MARKETPLACE
  // ============================================

  shops: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'owner_id', type: 'string', nullable: false }, // database user ID

      // Shop Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'slug', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'logo', type: 'string', nullable: true },
      { name: 'banner', type: 'string', nullable: true },

      // Category
      { name: 'category_id', type: 'uuid', nullable: true, references: { table: 'categories' } },
      { name: 'category', type: 'string', nullable: true }, // Category type (fashion, electronics, home, etc.)
      { name: 'template', type: 'string', nullable: true }, // Template type (ai-builder, minimal, modern, classic)

      // Language Settings
      { name: 'default_language', type: 'string', default: 'en' }, // Default shop language (en, ja, es, zh, de, ar, fr, pt, it)
      { name: 'supported_languages', type: 'jsonb', default: '["en"]' }, // Array of supported language codes

      // Business Information
      { name: 'business_name', type: 'string', nullable: true },
      { name: 'business_type', type: 'string', nullable: true }, // individual, llc, corporation
      { name: 'tax_id', type: 'string', nullable: true },
      { name: 'business_email', type: 'string', nullable: false },
      { name: 'business_phone', type: 'string', nullable: true },
      { name: 'business_address', type: 'jsonb', default: '{}' },

      // Shop Status
      { name: 'status', type: 'string', nullable: false, default: 'pending' }, // pending, active, rejected, suspended, closed
      { name: 'is_verified', type: 'boolean', default: false },
      { name: 'verified_at', type: 'timestamptz', nullable: true },
      { name: 'rejection_reason', type: 'text', nullable: true }, // Reason for rejection
      { name: 'suspension_reason', type: 'text', nullable: true }, // Reason for suspension
      { name: 'suspended_at', type: 'timestamptz', nullable: true }, // When shop was suspended

      // Team Members
      { name: 'team_members', type: 'jsonb', default: '[]' }, // Array of user IDs with roles

      // Payment Methods (enabled for customers: ['card', 'paypal', 'cod', 'bank'])
      { name: 'payment_methods', type: 'jsonb', default: '["card"]' }, // Array of enabled payment method IDs

      // Shop Settings
      { name: 'settings', type: 'jsonb', default: '{}' }, // min_order, currency, tax_rate, shipping_methods, policies

      // Statistics
      { name: 'total_sales', type: 'numeric', default: 0 },
      { name: 'total_orders', type: 'integer', default: 0 },
      { name: 'total_products', type: 'integer', default: 0 },
      { name: 'rating', type: 'numeric', default: 0 },
      { name: 'total_reviews', type: 'integer', default: 0 },

      // Stripe Connect Integration
      { name: 'stripe_account_id', type: 'string', nullable: true }, // Stripe Connected Account ID
      { name: 'stripe_connect_status', type: 'string', nullable: true }, // pending, connected, restricted, verification_required, rejected
      { name: 'stripe_charges_enabled', type: 'boolean', default: false }, // Can accept charges
      { name: 'stripe_payouts_enabled', type: 'boolean', default: false }, // Can receive payouts
      { name: 'stripe_requirements', type: 'jsonb', default: '{}' }, // Pending verification requirements
      { name: 'stripe_verification_deadline', type: 'timestamptz', nullable: true }, // When verification expires

      // Storefront Builder Configuration
      { name: 'storefront_config', type: 'jsonb', default: '{}' }, // Full storefront configuration (theme, sections, header, footer, SEO)
      { name: 'storefront_published', type: 'boolean', default: false }, // Whether storefront is published
      { name: 'storefront_published_at', type: 'timestamptz', nullable: true }, // When storefront was last published

      // Mobile App Builder Configuration (one unified app with multiple panels - separate from web storefront)
      { name: 'mobile_app_config', type: 'jsonb', default: '{}' }, // Mobile app configuration (one app with customer, delivery, vendor panels)
      { name: 'mobile_app_published', type: 'boolean', default: false }, // Whether mobile app is published
      { name: 'mobile_app_published_at', type: 'timestamptz', nullable: true }, // When mobile app was last published

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['owner_id'] },
      { columns: ['slug'], unique: true },
      { columns: ['status'] },
      { columns: ['is_verified'] },
      { columns: ['business_email'] },
      { columns: ['category_id'] },
      { columns: ['default_language'] },
      { columns: ['stripe_account_id'] },
      { columns: ['stripe_connect_status'] },
      { columns: ['storefront_published'] },
      { columns: ['mobile_app_published'] },
      { columns: ['created_at'] }
    ]
  },

  shop_team_members: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Role & Permissions
      { name: 'role', type: 'string', nullable: false }, // owner, admin, manager, staff
      { name: 'permissions', type: 'jsonb', default: '[]' }, // Array of permission strings
      { name: 'status', type: 'string', default: 'active' }, // active, inactive, invited
      { name: 'is_active', type: 'boolean', default: true },

      // Invitation
      { name: 'invited_by', type: 'string', nullable: true },
      { name: 'invited_at', type: 'timestamptz', nullable: true },
      { name: 'joined_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id', 'user_id'], unique: true },
      { columns: ['shop_id'] },
      { columns: ['user_id'] },
      { columns: ['role'] },
      { columns: ['status'] },
      { columns: ['is_active'] }
    ]
  },

  // Shop Invitations (for pending/unregistered users)
  shop_invites: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },
      { name: 'email', type: 'string', nullable: false },
      { name: 'role', type: 'string', default: 'staff' }, // admin, manager, staff
      { name: 'permissions', type: 'jsonb', default: '[]' },
      { name: 'invited_by', type: 'string', nullable: false }, // User ID who invited
      { name: 'token', type: 'string', nullable: false }, // Secure invitation token
      { name: 'message', type: 'text', nullable: true }, // Custom invitation message
      { name: 'expires_at', type: 'timestamptz', nullable: false },
      { name: 'status', type: 'string', default: 'pending' }, // pending, accepted, declined, cancelled
      { name: 'accepted_at', type: 'timestamptz', nullable: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['email'] },
      { columns: ['token'], unique: true },
      { columns: ['status'] },
      { columns: ['expires_at'] }
    ]
  },

  // ============================================
  // PRODUCT CATALOG
  // ============================================

  categories: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', nullable: false },
      { name: 'slug', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },

      // Hierarchy
      { name: 'parent_id', type: 'uuid', nullable: true }, // For category hierarchy
      { name: 'level', type: 'integer', default: 0 }, // 0 = root, 1 = subcategory, etc.

      // Media
      { name: 'image', type: 'string', nullable: true },
      { name: 'icon', type: 'string', nullable: true },

      // Display
      { name: 'display_order', type: 'integer', default: 0 },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'is_featured', type: 'boolean', default: false },

      // SEO
      { name: 'meta_title', type: 'string', nullable: true },
      { name: 'meta_description', type: 'text', nullable: true },
      { name: 'meta_keywords', type: 'jsonb', default: '[]' },

      // Statistics
      { name: 'product_count', type: 'integer', default: 0 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['slug'], unique: true },
      { columns: ['parent_id'] },
      { columns: ['is_active'] },
      { columns: ['is_featured'] },
      { columns: ['display_order'] },
      { columns: ['level'] }
    ]
  },

  products: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false }, // Which shop owns this product

      // Product Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'slug', type: 'string', nullable: false },
      { name: 'brand', type: 'string', nullable: true },
      { name: 'description', type: 'text', nullable: true },
      { name: 'short_description', type: 'text', nullable: true },
      { name: 'material', type: 'string', nullable: true },
      { name: 'features', type: 'jsonb', default: '[]' }, // Array of feature strings
      { name: 'specifications', type: 'jsonb', default: '{}' }, // Key-value specifications
      { name: 'sizes', type: 'jsonb', default: '[]' }, // Array of available sizes
      { name: 'colors', type: 'jsonb', default: '[]' }, // Array of {name, code} color objects
      { name: 'care_instructions', type: 'jsonb', default: '[]' }, // Array of care instruction strings
      { name: 'size_chart', type: 'jsonb', default: '[]' }, // Array of {size, chest, waist, hips, length}
      { name: 'shipping_info', type: 'jsonb', default: '{}' }, // {freeShippingThreshold, standardDays, expressDays, expressCost, nextDayCost}
      { name: 'return_policy', type: 'jsonb', default: '{}' }, // {returnDays, returnConditions, freeReturns, refundDays}

      // Pricing
      { name: 'price', type: 'numeric', nullable: false },
      { name: 'sale_price', type: 'numeric', nullable: true },
      { name: 'cost_price', type: 'numeric', nullable: true },
      { name: 'compare_price', type: 'numeric', nullable: true },

      // Inventory
      { name: 'sku', type: 'string', nullable: false },
      { name: 'barcode', type: 'string', nullable: true },
      { name: 'stock', type: 'integer', default: 0 },
      { name: 'low_stock_threshold', type: 'integer', default: 5 },
      { name: 'track_inventory', type: 'boolean', default: true },
      { name: 'allow_backorder', type: 'boolean', default: false },

      // Product Type & Status
      { name: 'product_type', type: 'string', default: 'simple' }, // simple, variable, digital
      { name: 'status', type: 'string', default: 'draft' }, // draft, published, out_of_stock, archived

      // Media
      { name: 'images', type: 'jsonb', default: '[]' }, // Array of {id, url, alt, isPrimary, order}
      { name: 'videos', type: 'jsonb', default: '[]' },

      // Variants
      { name: 'variants', type: 'jsonb', default: '[]' }, // Array of variant objects (size, color, etc.)
      { name: 'variant_attributes', type: 'jsonb', default: '[]' }, // Attribute definitions

      // Categorization
      { name: 'categories', type: 'jsonb', default: '[]' }, // Array of category IDs
      { name: 'tags', type: 'jsonb', default: '[]' }, // Array of tag strings

      // Shipping
      { name: 'weight', type: 'numeric', nullable: true }, // In kg
      { name: 'length', type: 'numeric', nullable: true }, // In cm
      { name: 'width', type: 'numeric', nullable: true },
      { name: 'height', type: 'numeric', nullable: true },
      { name: 'requires_shipping', type: 'boolean', default: true },
      { name: 'shipping_class', type: 'string', nullable: true },

      // SEO
      { name: 'meta_title', type: 'string', nullable: true },
      { name: 'meta_description', type: 'text', nullable: true },
      { name: 'meta_keywords', type: 'jsonb', default: '[]' },

      // Features
      { name: 'is_featured', type: 'boolean', default: false },
      { name: 'is_new', type: 'boolean', default: false },
      { name: 'is_bestseller', type: 'boolean', default: false },

      // Statistics
      { name: 'view_count', type: 'integer', default: 0 },
      { name: 'total_sales', type: 'integer', default: 0 },
      { name: 'rating', type: 'numeric', default: 0 },
      { name: 'total_reviews', type: 'integer', default: 0 },

      // Additional Data
      { name: 'attributes', type: 'jsonb', default: '{}' }, // Custom product attributes
      { name: 'metadata', type: 'jsonb', default: '{}' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['slug'], unique: true },
      { columns: ['sku'] },
      { columns: ['barcode'] },
      { columns: ['status'] },
      { columns: ['product_type'] },
      { columns: ['is_featured'] },
      { columns: ['is_new'] },
      { columns: ['is_bestseller'] },
      { columns: ['price'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // SHOPPING CART
  // ============================================

  carts: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: true }, // database user ID (nullable for guest carts)
      { name: 'session_id', type: 'string', nullable: true }, // For guest tracking

      // Cart Items
      { name: 'items', type: 'jsonb', default: '[]' }, // Array of cart items with product_id, quantity, price, variant

      // Totals
      { name: 'subtotal', type: 'numeric', default: 0 },
      { name: 'tax', type: 'numeric', default: 0 },
      { name: 'shipping', type: 'numeric', default: 0 },
      { name: 'discount', type: 'numeric', default: 0 },
      { name: 'total', type: 'numeric', default: 0 },

      // Applied Coupons
      { name: 'applied_coupons', type: 'jsonb', default: '[]' }, // Array of coupon codes

      // Shipping
      { name: 'shipping_address_id', type: 'uuid', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'active' }, // active, abandoned, converted
      { name: 'expires_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['session_id'] },
      { columns: ['status'] },
      { columns: ['expires_at'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  orders: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'order_number', type: 'string', nullable: false }, // e.g., FLX-2024-00001
      { name: 'user_id', type: 'string', nullable: false }, // Customer's database user ID
      { name: 'shop_id', type: 'uuid', nullable: false }, // Which shop

      // Order Items
      { name: 'items', type: 'jsonb', nullable: false }, // Array of order items

      // Pricing
      { name: 'subtotal', type: 'numeric', nullable: false },
      { name: 'tax', type: 'numeric', default: 0 },
      { name: 'shipping_cost', type: 'numeric', default: 0 },
      { name: 'discount', type: 'numeric', default: 0 },
      { name: 'total', type: 'numeric', nullable: false },
      { name: 'currency', type: 'string', default: 'USD' },

      // Payment Information
      { name: 'payment_method', type: 'string', nullable: false }, // stripe, paypal, cod
      { name: 'payment_status', type: 'string', default: 'pending' }, // pending, paid, failed, refunded
      { name: 'transaction_id', type: 'string', nullable: true },
      { name: 'paid_at', type: 'timestamptz', nullable: true },

      // Stripe Connect Payment Fields
      { name: 'stripe_payment_intent_id', type: 'string', nullable: true },
      { name: 'stripe_connect_enabled', type: 'boolean', default: false },
      { name: 'platform_fee', type: 'numeric', nullable: true },
      { name: 'vendor_amount', type: 'numeric', nullable: true },

      // Addresses
      { name: 'shipping_address', type: 'jsonb', nullable: false },
      { name: 'billing_address', type: 'jsonb', nullable: false },

      // Delivery Information
      { name: 'delivery_method', type: 'string', nullable: true }, // standard, express, overnight, pickup
      { name: 'tracking_number', type: 'string', nullable: true },
      { name: 'carrier', type: 'string', nullable: true },
      { name: 'delivery_man_id', type: 'uuid', nullable: true, references: { table: 'delivery_men' } }, // Assigned delivery person
      { name: 'delivery_man_name', type: 'string', nullable: true }, // Name of delivery person for "Own Delivery Man"
      { name: 'delivery_fee', type: 'numeric', default: 0 }, // Fee paid to delivery person
      { name: 'estimated_delivery', type: 'date', nullable: true },
      { name: 'delivered_at', type: 'timestamptz', nullable: true },

      // Order Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, processing, shipped, delivered, cancelled, refunded
      { name: 'fulfillment_status', type: 'string', default: 'unfulfilled' }, // unfulfilled, partially_fulfilled, fulfilled

      // Timeline
      { name: 'timeline', type: 'jsonb', default: '[]' }, // Array of status changes with timestamps

      // Notes
      { name: 'customer_note', type: 'text', nullable: true },
      { name: 'shop_note', type: 'text', nullable: true }, // Internal note for shop
      { name: 'internal_note', type: 'text', nullable: true },

      // Refund Information
      { name: 'refund_amount', type: 'numeric', nullable: true },
      { name: 'refund_reason', type: 'text', nullable: true },
      { name: 'refunded_at', type: 'timestamptz', nullable: true },

      // Applied Discounts
      { name: 'applied_coupons', type: 'jsonb', default: '[]' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['order_number'], unique: true },
      { columns: ['user_id'] },
      { columns: ['shop_id'] },
      { columns: ['status'] },
      { columns: ['payment_status'] },
      { columns: ['fulfillment_status'] },
      { columns: ['tracking_number'] },
      { columns: ['stripe_payment_intent_id'] },
      { columns: ['created_at'] }
    ]
  },

  order_items: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'order_id', type: 'uuid', nullable: false },
      { name: 'product_id', type: 'uuid', nullable: false },
      { name: 'shop_id', type: 'uuid', nullable: false },

      // Product Snapshot (at time of order)
      { name: 'product_name', type: 'string', nullable: false },
      { name: 'product_sku', type: 'string', nullable: false },
      { name: 'product_image', type: 'string', nullable: true },

      // Variant Details
      { name: 'variant_id', type: 'string', nullable: true },
      { name: 'variant_details', type: 'jsonb', default: '{}' }, // size, color, etc.

      // Pricing
      { name: 'unit_price', type: 'numeric', nullable: false },
      { name: 'quantity', type: 'integer', nullable: false },
      { name: 'discount', type: 'numeric', default: 0 },
      { name: 'total', type: 'numeric', nullable: false },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, fulfilled, cancelled, returned

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['order_id'] },
      { columns: ['product_id'] },
      { columns: ['shop_id'] },
      { columns: ['status'] }
    ]
  },

  // ============================================
  // MARKETING & CAMPAIGNS
  // ============================================

  campaigns: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: true }, // null = platform-wide

      // Campaign Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'slug', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },

      // Campaign Type
      { name: 'campaign_type', type: 'string', nullable: false }, // flash_sale, seasonal, clearance, new_arrival

      // Timeline
      { name: 'start_date', type: 'timestamptz', nullable: false },
      { name: 'end_date', type: 'timestamptz', nullable: false },
      { name: 'status', type: 'string', default: 'draft' }, // draft, active, ended, paused

      // Discount Information
      { name: 'discount_type', type: 'string', nullable: true }, // percentage, fixed, bogo
      { name: 'discount_value', type: 'numeric', nullable: true },
      { name: 'max_discount', type: 'numeric', nullable: true },
      { name: 'min_purchase', type: 'numeric', nullable: true },

      // Target Products/Categories
      { name: 'target_products', type: 'jsonb', default: '[]' }, // Array of product IDs
      { name: 'target_categories', type: 'jsonb', default: '[]' }, // Array of category IDs
      { name: 'target_shops', type: 'jsonb', default: '[]' }, // Array of shop IDs

      // Media
      { name: 'banner_images', type: 'jsonb', default: '[]' },
      { name: 'featured_image', type: 'string', nullable: true },

      // Analytics
      { name: 'impressions', type: 'integer', default: 0 },
      { name: 'clicks', type: 'integer', default: 0 },
      { name: 'conversions', type: 'integer', default: 0 },
      { name: 'revenue', type: 'numeric', default: 0 },

      // Settings
      { name: 'settings', type: 'jsonb', default: '{}' },
      { name: 'terms_conditions', type: 'text', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['slug'], unique: true },
      { columns: ['campaign_type'] },
      { columns: ['status'] },
      { columns: ['start_date'] },
      { columns: ['end_date'] }
    ]
  },

  offers: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: true }, // null = platform-wide

      // Coupon Details
      { name: 'code', type: 'string', nullable: false }, // Unique coupon code
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },

      // Discount Type
      { name: 'type', type: 'string', nullable: false }, // percentage, fixed, free_shipping, buy_x_get_y
      { name: 'value', type: 'numeric', nullable: false }, // Discount amount or percentage

      // Conditions
      { name: 'min_purchase', type: 'numeric', nullable: true },
      { name: 'max_discount', type: 'numeric', nullable: true },
      { name: 'min_items', type: 'integer', nullable: true },
      { name: 'specific_products', type: 'jsonb', default: '[]' }, // Array of product IDs
      { name: 'specific_categories', type: 'jsonb', default: '[]' }, // Array of category IDs
      { name: 'excluded_products', type: 'jsonb', default: '[]' },
      { name: 'first_order_only', type: 'boolean', default: false },
      { name: 'user_types', type: 'jsonb', default: '[]' }, // [all, new, returning]

      // Usage Limits
      { name: 'total_usage_limit', type: 'integer', nullable: true }, // null = unlimited
      { name: 'per_user_limit', type: 'integer', default: 1 },
      { name: 'current_usage', type: 'integer', default: 0 },

      // Timeline
      { name: 'valid_from', type: 'timestamptz', nullable: false },
      { name: 'valid_to', type: 'timestamptz', nullable: false },

      // Status
      { name: 'status', type: 'string', default: 'active' }, // active, expired, disabled

      // Applied To
      { name: 'applied_to', type: 'jsonb', default: '{}' }, // {products: [], categories: [], shops: []}

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['code'], unique: true },
      { columns: ['type'] },
      { columns: ['status'] },
      { columns: ['valid_from'] },
      { columns: ['valid_to'] }
    ]
  },

  // ============================================
  // DELIVERY ADDRESSES
  // ============================================

  delivery_addresses: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Address Details
      { name: 'full_name', type: 'string', nullable: false },
      { name: 'phone_number', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },

      // Address
      { name: 'address_line_1', type: 'string', nullable: false },
      { name: 'address_line_2', type: 'string', nullable: true },
      { name: 'city', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: false },
      { name: 'postal_code', type: 'string', nullable: false },
      { name: 'country', type: 'string', nullable: false },

      // Address Type
      { name: 'address_type', type: 'string', default: 'home' }, // home, office, other
      { name: 'is_default', type: 'boolean', default: false },

      // Location (for maps)
      { name: 'latitude', type: 'numeric', nullable: true },
      { name: 'longitude', type: 'numeric', nullable: true },

      // Additional Info
      { name: 'delivery_instructions', type: 'text', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['is_default'] },
      { columns: ['country'] },
      { columns: ['postal_code'] }
    ]
  },

  // ============================================
  // DELIVERY METHODS
  // ============================================

  delivery_methods: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },

      // Method Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: false }, // standard, express, overnight, pickup, same_day
      { name: 'description', type: 'text', nullable: true },

      // Pricing
      { name: 'base_cost', type: 'numeric', nullable: false, default: 0 },
      { name: 'cost_per_kg', type: 'numeric', nullable: true },
      { name: 'free_shipping_threshold', type: 'numeric', nullable: true },

      // Timing
      { name: 'estimated_days', type: 'string', nullable: true }, // "3-5" or "1"
      { name: 'cutoff_time', type: 'time', nullable: true }, // Orders after this time ship next day

      // Carrier
      { name: 'carrier', type: 'string', nullable: true }, // fedex, ups, usps, dhl, local
      { name: 'tracking_enabled', type: 'boolean', default: true },

      // Zones
      { name: 'zones', type: 'jsonb', default: '["domestic"]' }, // Array of zones: domestic, international, local

      // Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'sort_order', type: 'integer', default: 0 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['type'] },
      { columns: ['is_active'] },
      { columns: ['sort_order'] }
    ]
  },

  // ============================================
  // SHIPPING ZONES
  // ============================================

  shipping_zones: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },
      { name: 'name', type: 'string', nullable: false },
      { name: 'countries', type: 'jsonb', default: '[]' },
      { name: 'regions', type: 'jsonb', default: '[]' },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['is_active'] }
    ]
  },

  // ============================================
  // DELIVERY TRACKING
  // ============================================

  delivery_tracking: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'order_id', type: 'uuid', nullable: false },
      { name: 'shop_id', type: 'uuid', nullable: false },

      // Tracking Information
      { name: 'tracking_number', type: 'string', nullable: false },
      { name: 'carrier', type: 'string', nullable: true }, // fedex, ups, usps, dhl, local
      { name: 'delivery_method', type: 'string', nullable: false }, // standard, express, overnight, pickup

      // Status
      { name: 'current_status', type: 'string', default: 'pending' }, // pending, picked_up, in_transit, out_for_delivery, delivered, failed

      // Status History
      { name: 'status_history', type: 'jsonb', default: '[]' }, // Array of {status, message, location, timestamp}

      // Delivery Dates
      { name: 'estimated_delivery_date', type: 'date', nullable: true },
      { name: 'actual_delivery_date', type: 'timestamptz', nullable: true },

      // Additional Details
      { name: 'delivery_notes', type: 'text', nullable: true },
      { name: 'signature_required', type: 'boolean', default: false },
      { name: 'proof_of_delivery_url', type: 'string', nullable: true }, // Image URL

      // Attempt Information
      { name: 'delivery_attempts', type: 'integer', default: 0 },
      { name: 'failed_reason', type: 'text', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['order_id'] },
      { columns: ['shop_id'] },
      { columns: ['tracking_number'], unique: true },
      { columns: ['carrier'] },
      { columns: ['current_status'] },
      { columns: ['estimated_delivery_date'] }
    ]
  },

  // ============================================
  // SHIPPING METHODS
  // ============================================

  shipping_methods: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Method Identification
      { name: 'type', type: 'string', nullable: false }, // standard, express, overnight, pickup, same_day
      { name: 'name', type: 'string', nullable: false }, // Internal name
      { name: 'display_name', type: 'string', nullable: false }, // Customer-facing name

      // Cost Information
      { name: 'base_cost', type: 'numeric', default: 0 }, // Base shipping cost
      { name: 'free_shipping_threshold', type: 'numeric', nullable: true }, // Free shipping if order exceeds this amount

      // Time Estimates
      { name: 'estimated_days', type: 'integer', nullable: true }, // Min-max range in calendar days
      { name: 'estimated_business_days', type: 'integer', nullable: true }, // Min-max range in business days
      { name: 'duration', type: 'string', nullable: true }, // Human-readable: "3-5 business days", "Next day", etc.

      // Display Information
      { name: 'description', type: 'text', nullable: true },
      { name: 'icon', type: 'string', nullable: true }, // Icon identifier or emoji
      { name: 'features', type: 'jsonb', default: '[]' }, // Array of feature strings

      // Availability & Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'available_countries', type: 'jsonb', default: '[]' }, // Array of country codes, empty = all countries
      { name: 'display_order', type: 'integer', default: 0 },

      // Requirements
      { name: 'requires_signature', type: 'boolean', default: false },
      { name: 'min_weight', type: 'numeric', nullable: true }, // In kg
      { name: 'max_weight', type: 'numeric', nullable: true }, // In kg
      { name: 'min_order_value', type: 'numeric', nullable: true }, // Minimum order value to use this method

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['type'] },
      { columns: ['is_active'] },
      { columns: ['display_order'] }
    ]
  },

  // ============================================
  // WISHLISTS
  // ============================================

  wishlists: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Wishlist Details
      { name: 'name', type: 'string', default: 'My Wishlist' },
      { name: 'is_default', type: 'boolean', default: false },

      // Products
      { name: 'products', type: 'jsonb', default: '[]' }, // Array of {product_id, variant_id, added_at, notes}

      // Sharing
      { name: 'privacy', type: 'string', default: 'private' }, // private, public, shared
      { name: 'share_token', type: 'string', nullable: true },

      // Statistics
      { name: 'total_items', type: 'integer', default: 0 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['is_default'] },
      { columns: ['privacy'] },
      { columns: ['share_token'], unique: true }
    ]
  },

  // ============================================
  // PRODUCT REVIEWS
  // ============================================

  reviews: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'product_id', type: 'uuid', nullable: false },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID
      { name: 'user_name', type: 'string', nullable: true }, // Cached user display name
      { name: 'user_avatar', type: 'string', nullable: true }, // Cached user avatar URL
      { name: 'order_id', type: 'uuid', nullable: true }, // For verified purchase

      // Review Content
      { name: 'rating', type: 'integer', nullable: false }, // 1-5 stars
      { name: 'title', type: 'string', nullable: false },
      { name: 'review_text', type: 'text', nullable: false },

      // Media
      { name: 'review_images', type: 'jsonb', default: '[]' }, // Array of image URLs
      { name: 'review_videos', type: 'jsonb', default: '[]' },

      // Verification
      { name: 'is_verified_purchase', type: 'boolean', default: false },

      // Helpfulness
      { name: 'helpful_count', type: 'integer', default: 0 },
      { name: 'not_helpful_count', type: 'integer', default: 0 },

      // Shop Response
      { name: 'shop_response', type: 'text', nullable: true },
      { name: 'responded_by', type: 'string', nullable: true }, // Shop user ID
      { name: 'responded_at', type: 'timestamptz', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, approved, rejected, flagged
      { name: 'rejection_reason', type: 'text', nullable: true },

      // Moderation
      { name: 'is_reported', type: 'boolean', default: false },
      { name: 'report_reason', type: 'text', nullable: true },
      { name: 'report_count', type: 'integer', default: 0 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['product_id'] },
      { columns: ['user_id'] },
      { columns: ['order_id'] },
      { columns: ['rating'] },
      { columns: ['status'] },
      { columns: ['is_verified_purchase'] },
      { columns: ['is_reported'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // VENDOR PAYOUTS (Stripe Connect)
  // ============================================

  vendor_payouts: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false },
      { name: 'order_id', type: 'uuid', nullable: true }, // Optional: linked to specific order

      // Payout Details
      { name: 'amount', type: 'numeric', nullable: false }, // Amount to vendor
      { name: 'platform_fee', type: 'numeric', default: 0 }, // Platform commission
      { name: 'currency', type: 'string', default: 'USD' },

      // Stripe Transfer Details
      { name: 'stripe_transfer_id', type: 'string', nullable: true },
      { name: 'stripe_payout_id', type: 'string', nullable: true },
      { name: 'stripe_balance_transaction_id', type: 'string', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, processing, paid, failed, cancelled

      // Dates
      { name: 'estimated_arrival', type: 'date', nullable: true },
      { name: 'paid_at', type: 'timestamptz', nullable: true },

      // Failure Information
      { name: 'failure_code', type: 'string', nullable: true },
      { name: 'failure_message', type: 'text', nullable: true },

      // Additional Data
      { name: 'metadata', type: 'jsonb', default: '{}' },
      { name: 'description', type: 'text', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['order_id'] },
      { columns: ['stripe_transfer_id'], unique: true },
      { columns: ['stripe_payout_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] },
      { columns: ['paid_at'] }
    ]
  },

  // ============================================
  // PAYMENT TRANSACTIONS
  // ============================================

  payment_transactions: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'order_id', type: 'uuid', nullable: false },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Transaction Details
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'string', default: 'USD' },

      // Payment Method
      { name: 'payment_method', type: 'string', nullable: false }, // card, paypal, apple_pay, google_pay, bank_transfer
      { name: 'provider', type: 'string', nullable: false }, // stripe, paypal

      // Provider Details
      { name: 'transaction_id', type: 'string', nullable: true }, // From payment provider
      { name: 'stripe_payment_intent_id', type: 'string', nullable: true },
      { name: 'stripe_charge_id', type: 'string', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, succeeded, failed, refunded

      // Additional Information
      { name: 'metadata', type: 'jsonb', default: '{}' },
      { name: 'error_message', type: 'text', nullable: true },

      // Refund Information
      { name: 'refund_amount', type: 'numeric', nullable: true },
      { name: 'refund_reason', type: 'text', nullable: true },
      { name: 'refunded_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['order_id'] },
      { columns: ['user_id'] },
      { columns: ['transaction_id'], unique: true },
      { columns: ['stripe_payment_intent_id'] },
      { columns: ['payment_method'] },
      { columns: ['provider'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  notifications: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Notification Details
      { name: 'type', type: 'string', nullable: false }, // order_update, delivery_update, payment_success, review_response, offer
      { name: 'title', type: 'string', nullable: false },
      { name: 'message', type: 'text', nullable: false },

      // Additional Data
      { name: 'data', type: 'jsonb', default: '{}' }, // Related order ID, product ID, etc.
      { name: 'action_url', type: 'string', nullable: true },

      // Status
      { name: 'is_read', type: 'boolean', default: false },
      { name: 'read_at', type: 'timestamptz', nullable: true },

      // Priority
      { name: 'priority', type: 'string', default: 'normal' }, // low, normal, high, urgent

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id', 'is_read'] },
      { columns: ['user_id', 'created_at'] },
      { columns: ['type'] },
      { columns: ['priority'] }
    ]
  },

  // ============================================
  // ANALYTICS & ACTIVITY LOGS
  // ============================================

  activity_logs: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: true }, // database user ID
      { name: 'shop_id', type: 'uuid', nullable: true },

      // Activity Details
      { name: 'activity_type', type: 'string', nullable: false }, // order, product, review, etc.
      { name: 'action', type: 'string', nullable: false }, // created, updated, deleted, viewed
      { name: 'entity_type', type: 'string', nullable: true }, // order, product, shop, etc.
      { name: 'entity_id', type: 'uuid', nullable: true },

      // Changes
      { name: 'changes', type: 'jsonb', nullable: true }, // Old and new values
      { name: 'metadata', type: 'jsonb', default: '{}' },

      // Request Information
      { name: 'ip_address', type: 'string', nullable: true },
      { name: 'user_agent', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id', 'created_at'] },
      { columns: ['shop_id', 'created_at'] },
      { columns: ['entity_type', 'entity_id'] },
      { columns: ['activity_type'] },
      { columns: ['action'] }
    ]
  },

  // ============================================
  // SHOP ANALYTICS
  // ============================================

  shop_analytics: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false },
      { name: 'date', type: 'date', nullable: false },

      // Sales Metrics
      { name: 'total_revenue', type: 'numeric', default: 0 },
      { name: 'total_orders', type: 'integer', default: 0 },
      { name: 'total_items_sold', type: 'integer', default: 0 },
      { name: 'average_order_value', type: 'numeric', default: 0 },

      // Traffic Metrics
      { name: 'page_views', type: 'integer', default: 0 },
      { name: 'unique_visitors', type: 'integer', default: 0 },
      { name: 'product_views', type: 'integer', default: 0 },

      // Customer Metrics
      { name: 'new_customers', type: 'integer', default: 0 },
      { name: 'returning_customers', type: 'integer', default: 0 },

      // Product Metrics
      { name: 'products_added', type: 'integer', default: 0 },
      { name: 'products_updated', type: 'integer', default: 0 },

      // Review Metrics
      { name: 'reviews_received', type: 'integer', default: 0 },
      { name: 'average_rating', type: 'numeric', nullable: true },

      // Additional Metadata
      { name: 'metadata', type: 'jsonb', default: '{}' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id', 'date'], unique: true },
      { columns: ['shop_id'] },
      { columns: ['date'] }
    ]
  },

  // ============================================
  // GLOBAL SETTINGS (Admin Settings Page)
  // ============================================

  settings: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // General Settings
      { name: 'platform_name', type: 'string', default: 'Vasty Shop' },
      { name: 'platform_logo', type: 'string', nullable: true },
      { name: 'support_email', type: 'string', default: 'support@vasty.shop' },
      { name: 'default_currency', type: 'string', default: 'USD' },
      { name: 'default_language', type: 'string', default: 'en' },

      // Commission Settings
      { name: 'platform_commission_rate', type: 'numeric', default: 10 },
      { name: 'minimum_order_amount', type: 'numeric', default: 0 },
      { name: 'free_shipping_threshold', type: 'numeric', default: 50 },

      // Shop Settings
      { name: 'auto_approve_shops', type: 'boolean', default: false },
      { name: 'required_documents', type: 'jsonb', default: '[]' },
      { name: 'max_products_per_shop', type: 'integer', default: 1000 },
      { name: 'allowed_categories', type: 'jsonb', default: '[]' },

      // Payment Settings
      { name: 'stripe_enabled', type: 'boolean', default: true },
      { name: 'stripe_status', type: 'string', default: 'active' },
      { name: 'paypal_enabled', type: 'boolean', default: false },
      { name: 'paypal_status', type: 'string', default: 'inactive' },
      { name: 'cod_enabled', type: 'boolean', default: true },
      { name: 'cod_status', type: 'string', default: 'active' },

      // Notification Settings
      { name: 'email_notifications', type: 'boolean', default: true },
      { name: 'push_notifications', type: 'boolean', default: false },
      { name: 'sms_notifications', type: 'boolean', default: false },

      // Maintenance Settings
      { name: 'maintenance_mode', type: 'boolean', default: false },
      { name: 'maintenance_message', type: 'text', nullable: true },

      // API Settings
      { name: 'webhook_url', type: 'string', nullable: true },
      { name: 'api_key', type: 'string', nullable: true },
      { name: 'rate_limit_per_minute', type: 'integer', default: 60 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: []
  },

  // ============================================
  // PLATFORM SETTINGS (Key-Value Store)
  // ============================================

  platform_settings: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'key', type: 'string', nullable: false },
      { name: 'value', type: 'jsonb', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'is_public', type: 'boolean', default: false },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['key'], unique: true }
    ]
  },

  // ============================================
  // MULTI-CURRENCY SYSTEM
  // ============================================

  currencies: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Currency Details
      { name: 'code', type: 'string', nullable: false }, // ISO 4217 currency code (USD, EUR, JPY, etc.)
      { name: 'name', type: 'string', nullable: false }, // Full name (US Dollar, Euro, Japanese Yen)
      { name: 'symbol', type: 'string', nullable: false }, // Currency symbol ($, €, ¥, etc.)
      { name: 'symbol_native', type: 'string', nullable: false }, // Native symbol

      // Formatting
      { name: 'decimal_digits', type: 'integer', default: 2 }, // Number of decimal places
      { name: 'rounding', type: 'numeric', default: 0 }, // Rounding increment (0 = no rounding)
      { name: 'symbol_position', type: 'string', default: 'before' }, // before or after
      { name: 'decimal_separator', type: 'string', default: '.' }, // . or ,
      { name: 'thousand_separator', type: 'string', default: ',' }, // , or . or space

      // Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'is_default', type: 'boolean', default: false },
      { name: 'display_order', type: 'integer', default: 0 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['code'], unique: true },
      { columns: ['is_active'] },
      { columns: ['is_default'] },
      { columns: ['display_order'] }
    ]
  },

  exchange_rates: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Rate Details
      { name: 'from_currency', type: 'string', nullable: false }, // Base currency code (e.g., USD)
      { name: 'to_currency', type: 'string', nullable: false }, // Target currency code (e.g., EUR)
      { name: 'rate', type: 'numeric', nullable: false }, // Exchange rate (e.g., 0.85 for USD to EUR)

      // Source & Validity
      { name: 'source', type: 'string', nullable: true }, // API source (e.g., 'fixer.io', 'manual')
      { name: 'valid_from', type: 'timestamptz', default: 'now()' },
      { name: 'valid_until', type: 'timestamptz', nullable: true }, // null = no expiration

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['from_currency', 'to_currency'] },
      { columns: ['from_currency'] },
      { columns: ['to_currency'] },
      { columns: ['is_active'] },
      { columns: ['valid_from'] },
      { columns: ['valid_until'] }
    ]
  },

  user_preferences: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Currency & Locale Preferences
      { name: 'preferred_currency', type: 'string', nullable: true }, // ISO 4217 code (USD, EUR, etc.)
      { name: 'preferred_language', type: 'string', nullable: true }, // ISO 639-1 code (en, ja, fr, etc.)
      { name: 'preferred_country', type: 'string', nullable: true }, // ISO 3166-1 alpha-2 (US, JP, CA, etc.)

      // Notification Preferences
      { name: 'email_notifications', type: 'boolean', default: true },
      { name: 'sms_notifications', type: 'boolean', default: false },
      { name: 'push_notifications', type: 'boolean', default: true },

      // Display Preferences
      { name: 'theme', type: 'string', default: 'light' }, // light, dark, auto
      { name: 'timezone', type: 'string', nullable: true }, // IANA timezone (America/New_York, etc.)

      // Additional Settings
      { name: 'settings', type: 'jsonb', default: '{}' }, // Additional user preferences

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'], unique: true },
      { columns: ['preferred_currency'] },
      { columns: ['preferred_country'] }
    ]
  },

  // ============================================
  // TAX SYSTEM
  // ============================================

  tax_countries: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Country Details
      { name: 'code', type: 'string', nullable: false }, // ISO 3166-1 alpha-2 (US, CA, JP, BD, etc.)
      { name: 'name', type: 'string', nullable: false }, // Full country name

      // Tax Configuration
      { name: 'tax_name', type: 'string', nullable: false }, // VAT, GST, Sales Tax, etc.
      { name: 'tax_abbreviation', type: 'string', nullable: true }, // VAT, GST, ST, etc.
      { name: 'default_rate', type: 'numeric', default: 0 }, // Default tax rate percentage

      // Tax Calculation Settings
      { name: 'tax_type', type: 'string', default: 'inclusive' }, // inclusive or exclusive
      { name: 'compound_tax', type: 'boolean', default: false }, // Whether tax is compounded
      { name: 'tax_on_shipping', type: 'boolean', default: true }, // Apply tax to shipping

      // Registration Requirements
      { name: 'requires_tax_id', type: 'boolean', default: false }, // Business requires tax ID
      { name: 'tax_id_format', type: 'string', nullable: true }, // Regex or description

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      // Additional Details
      { name: 'metadata', type: 'jsonb', default: '{}' }, // Additional country-specific settings

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['code'], unique: true },
      { columns: ['is_active'] },
      { columns: ['name'] }
    ]
  },

  tax_rates: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'country_id', type: 'uuid', nullable: false }, // Reference to tax_countries

      // Rate Details
      { name: 'name', type: 'string', nullable: false }, // Federal Tax, State Tax, Provincial Tax, etc.
      { name: 'rate', type: 'numeric', nullable: false }, // Tax rate percentage

      // Geographic Scope
      { name: 'state_province', type: 'string', nullable: true }, // State/Province code (CA, ON, etc.)
      { name: 'city', type: 'string', nullable: true }, // City name
      { name: 'postal_code', type: 'string', nullable: true }, // Specific postal/zip code
      { name: 'postal_code_pattern', type: 'string', nullable: true }, // Regex for postal code matching

      // Priority & Application
      { name: 'priority', type: 'integer', default: 0 }, // Higher priority applied first
      { name: 'is_compound', type: 'boolean', default: false }, // Compound on other taxes

      // Validity Period
      { name: 'valid_from', type: 'date', nullable: true },
      { name: 'valid_until', type: 'date', nullable: true },

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['country_id'] },
      { columns: ['state_province'] },
      { columns: ['is_active'] },
      { columns: ['priority'] },
      { columns: ['valid_from'] },
      { columns: ['valid_until'] }
    ]
  },

  product_tax_categories: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Category Details
      { name: 'name', type: 'string', nullable: false }, // Standard, Reduced, Zero-rated, Exempt
      { name: 'code', type: 'string', nullable: false }, // Unique code (standard, reduced, zero, exempt)
      { name: 'description', type: 'text', nullable: true },

      // Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'display_order', type: 'integer', default: 0 },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['code'], unique: true },
      { columns: ['is_active'] },
      { columns: ['display_order'] }
    ]
  },

  tax_rules: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'country_id', type: 'uuid', nullable: false }, // Reference to tax_countries
      { name: 'tax_category_id', type: 'uuid', nullable: false }, // Reference to product_tax_categories

      // Rule Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },

      // Tax Rate Override
      { name: 'rate_override', type: 'numeric', nullable: true }, // Overrides standard rate for this category

      // Conditions
      { name: 'customer_type', type: 'string', nullable: true }, // individual, business, reseller
      { name: 'min_amount', type: 'numeric', nullable: true }, // Minimum order amount
      { name: 'max_amount', type: 'numeric', nullable: true }, // Maximum order amount

      // Validity Period
      { name: 'valid_from', type: 'date', nullable: true },
      { name: 'valid_until', type: 'date', nullable: true },

      // Priority
      { name: 'priority', type: 'integer', default: 0 }, // Higher priority rules applied first

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      // Additional Conditions
      { name: 'conditions', type: 'jsonb', default: '{}' }, // Additional rule conditions

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['country_id'] },
      { columns: ['tax_category_id'] },
      { columns: ['is_active'] },
      { columns: ['priority'] },
      { columns: ['customer_type'] },
      { columns: ['valid_from'] },
      { columns: ['valid_until'] }
    ]
  },

  // ============================================
  // CONTENT MANAGEMENT SYSTEM (CMS)
  // ============================================

  site_pages: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Page Identification
      { name: 'slug', type: 'string', nullable: false }, // privacy, terms, about, contact, etc.
      { name: 'title', type: 'string', nullable: false },

      // Content
      { name: 'content', type: 'jsonb', nullable: false }, // Structured content (sections, blocks)
      { name: 'meta_title', type: 'string', nullable: true }, // SEO title
      { name: 'meta_description', type: 'text', nullable: true }, // SEO description
      { name: 'meta_keywords', type: 'string', nullable: true }, // SEO keywords

      // Page Settings
      { name: 'template', type: 'string', default: 'default' }, // default, legal, about, contact
      { name: 'header_image', type: 'string', nullable: true },
      { name: 'show_breadcrumb', type: 'boolean', default: true },
      { name: 'show_table_of_contents', type: 'boolean', default: false },

      // Publishing
      { name: 'status', type: 'string', default: 'draft' }, // draft, published, archived
      { name: 'published_at', type: 'timestamptz', nullable: true },
      { name: 'publish_scheduled_at', type: 'timestamptz', nullable: true },

      // Version Control
      { name: 'version', type: 'integer', default: 1 },
      { name: 'last_edited_by', type: 'string', nullable: true }, // Admin user ID

      // Access Control
      { name: 'is_public', type: 'boolean', default: true },
      { name: 'requires_auth', type: 'boolean', default: false },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['slug'], unique: true },
      { columns: ['status'] },
      { columns: ['template'] },
      { columns: ['is_public'] },
      { columns: ['published_at'] }
    ]
  },

  site_settings: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Setting Key
      { name: 'key', type: 'string', nullable: false }, // site_name, logo, footer_text, etc.
      { name: 'setting_group', type: 'string', default: 'general' }, // general, branding, social, seo

      // Setting Value
      { name: 'value', type: 'jsonb', nullable: false }, // Can be string, object, array
      { name: 'value_type', type: 'string', default: 'string' }, // string, json, array, boolean, number

      // Metadata
      { name: 'label', type: 'string', nullable: true }, // Display label
      { name: 'description', type: 'text', nullable: true }, // Help text

      // Admin
      { name: 'is_public', type: 'boolean', default: false }, // Can be accessed without auth
      { name: 'last_updated_by', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['key'], unique: true },
      { columns: ['setting_group'] },
      { columns: ['is_public'] }
    ]
  },

  // ============================================
  // WALLET SYSTEM
  // ============================================

  wallets: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Balance
      { name: 'balance', type: 'numeric', default: 0 }, // Current balance
      { name: 'currency', type: 'string', default: 'USD' }, // Currency code
      { name: 'pending_balance', type: 'numeric', default: 0 }, // Pending transactions

      // Lifetime Stats
      { name: 'total_credited', type: 'numeric', default: 0 },
      { name: 'total_debited', type: 'numeric', default: 0 },
      { name: 'total_refunded', type: 'numeric', default: 0 },

      // Status
      { name: 'status', type: 'string', default: 'active' }, // active, frozen, suspended
      { name: 'is_verified', type: 'boolean', default: false },

      // Limits
      { name: 'daily_limit', type: 'numeric', nullable: true },
      { name: 'monthly_limit', type: 'numeric', nullable: true },
      { name: 'max_balance', type: 'numeric', nullable: true },

      // Metadata
      { name: 'metadata', type: 'jsonb', default: '{}' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'], unique: true },
      { columns: ['status'] },
      { columns: ['currency'] }
    ]
  },

  wallet_transactions: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'wallet_id', type: 'uuid', nullable: false, references: { table: 'wallets' } },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID

      // Transaction Details
      { name: 'type', type: 'string', nullable: false }, // credit, debit, transfer_in, transfer_out, refund, topup, payment, bonus, cashback
      { name: 'amount', type: 'numeric', nullable: false }, // Always positive
      { name: 'currency', type: 'string', default: 'USD' },

      // Balance Tracking
      { name: 'balance_before', type: 'numeric', nullable: false },
      { name: 'balance_after', type: 'numeric', nullable: false },

      // Status
      { name: 'status', type: 'string', default: 'completed' }, // pending, completed, failed, cancelled, reversed

      // Reference
      { name: 'reference_type', type: 'string', nullable: true }, // order, refund, transfer, topup, promotion
      { name: 'reference_id', type: 'string', nullable: true }, // Related entity ID
      { name: 'external_reference', type: 'string', nullable: true }, // Stripe payment ID, etc.

      // Transfer Details (for transfers between users)
      { name: 'sender_wallet_id', type: 'uuid', nullable: true },
      { name: 'recipient_wallet_id', type: 'uuid', nullable: true },

      // Description & Notes
      { name: 'description', type: 'string', nullable: true },
      { name: 'notes', type: 'text', nullable: true }, // Admin/internal notes

      // Metadata
      { name: 'metadata', type: 'jsonb', default: '{}' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['wallet_id'] },
      { columns: ['user_id'] },
      { columns: ['type'] },
      { columns: ['status'] },
      { columns: ['reference_type', 'reference_id'] },
      { columns: ['created_at'] }
    ]
  },

  wallet_topups: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'wallet_id', type: 'uuid', nullable: false, references: { table: 'wallets' } },
      { name: 'user_id', type: 'string', nullable: false },

      // Amount
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'string', default: 'USD' },

      // Bonus (optional topup bonus)
      { name: 'bonus_amount', type: 'numeric', default: 0 },
      { name: 'bonus_percentage', type: 'numeric', nullable: true },

      // Payment
      { name: 'payment_method', type: 'string', nullable: false }, // stripe, paypal, bank_transfer
      { name: 'payment_status', type: 'string', default: 'pending' }, // pending, completed, failed
      { name: 'payment_intent_id', type: 'string', nullable: true }, // Stripe payment intent
      { name: 'payment_details', type: 'jsonb', default: '{}' },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, completed, failed, cancelled

      // Metadata
      { name: 'metadata', type: 'jsonb', default: '{}' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'completed_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['wallet_id'] },
      { columns: ['user_id'] },
      { columns: ['status'] },
      { columns: ['payment_status'] },
      { columns: ['payment_intent_id'] },
      { columns: ['created_at'] }
    ]
  },

  wallet_bonuses: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Bonus Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'type', type: 'string', nullable: false }, // topup_bonus, signup_bonus, referral_bonus, promotional

      // Bonus Value
      { name: 'bonus_type', type: 'string', nullable: false }, // fixed, percentage
      { name: 'bonus_value', type: 'numeric', nullable: false }, // Amount or percentage
      { name: 'max_bonus', type: 'numeric', nullable: true }, // Maximum bonus for percentage type

      // Conditions
      { name: 'min_topup', type: 'numeric', nullable: true }, // Minimum topup for bonus
      { name: 'max_topup', type: 'numeric', nullable: true }, // Maximum topup for bonus

      // Validity
      { name: 'start_date', type: 'timestamptz', nullable: true },
      { name: 'end_date', type: 'timestamptz', nullable: true },

      // Usage Limits
      { name: 'usage_limit', type: 'integer', nullable: true }, // Total uses allowed
      { name: 'usage_count', type: 'integer', default: 0 },
      { name: 'per_user_limit', type: 'integer', default: 1 },

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['type'] },
      { columns: ['is_active'] },
      { columns: ['start_date'] },
      { columns: ['end_date'] }
    ]
  },

  // ============================================
  // REFUND SYSTEM
  // ============================================

  refund_requests: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'order_id', type: 'uuid', nullable: false, references: { table: 'orders' } },
      { name: 'user_id', type: 'string', nullable: false },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },

      // Refund Details
      { name: 'reason', type: 'string', nullable: false }, // damaged, wrong_item, not_delivered, quality_issue, changed_mind, other
      { name: 'description', type: 'text', nullable: true },
      { name: 'images', type: 'jsonb', default: '[]' }, // Evidence photos

      // Amount
      { name: 'amount_requested', type: 'numeric', nullable: false },
      { name: 'amount_approved', type: 'numeric', nullable: true },
      { name: 'currency', type: 'string', default: 'USD' },

      // Items
      { name: 'items', type: 'jsonb', default: '[]' }, // Array of {order_item_id, quantity, reason}

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, approved, rejected, processing, completed, cancelled

      // Processing
      { name: 'refund_method', type: 'string', nullable: true }, // original_payment, wallet, bank_transfer
      { name: 'refund_to_wallet', type: 'boolean', default: false },
      { name: 'transaction_id', type: 'uuid', nullable: true }, // wallet_transaction or payment_transaction

      // Admin
      { name: 'reviewed_by', type: 'string', nullable: true },
      { name: 'reviewed_at', type: 'timestamptz', nullable: true },
      { name: 'admin_notes', type: 'text', nullable: true },

      // Metadata
      { name: 'metadata', type: 'jsonb', default: '{}' },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'completed_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['order_id'] },
      { columns: ['user_id'] },
      { columns: ['shop_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  refund_reasons: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'code', type: 'string', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'requires_evidence', type: 'boolean', default: false },
      { name: 'auto_approve', type: 'boolean', default: false },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'sort_order', type: 'integer', default: 0 },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['code'], unique: true },
      { columns: ['is_active'] }
    ]
  },

  // ============================================
  // LOYALTY POINTS SYSTEM
  // ============================================

  loyalty_points: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false },

      // Points Balance
      { name: 'points_balance', type: 'integer', default: 0 },
      { name: 'points_earned', type: 'integer', default: 0 },
      { name: 'points_redeemed', type: 'integer', default: 0 },
      { name: 'points_expired', type: 'integer', default: 0 },

      // Tier
      { name: 'tier', type: 'string', default: 'bronze' }, // bronze, silver, gold, platinum
      { name: 'tier_progress', type: 'integer', default: 0 }, // Points toward next tier

      // Lifetime Stats
      { name: 'lifetime_points', type: 'integer', default: 0 },
      { name: 'lifetime_value', type: 'numeric', default: 0 }, // Total spent

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'], unique: true },
      { columns: ['tier'] },
      { columns: ['points_balance'] }
    ]
  },

  loyalty_transactions: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false },

      // Transaction Details
      { name: 'type', type: 'string', nullable: false }, // earn, redeem, expire, bonus, adjustment
      { name: 'points', type: 'integer', nullable: false }, // Positive for earn, negative for redeem
      { name: 'points_before', type: 'integer', nullable: false },
      { name: 'points_after', type: 'integer', nullable: false },

      // Reference
      { name: 'reference_type', type: 'string', nullable: true }, // order, review, referral, promotion, admin
      { name: 'reference_id', type: 'string', nullable: true },
      { name: 'description', type: 'string', nullable: true },

      // Expiry (for earned points)
      { name: 'expires_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['type'] },
      { columns: ['reference_type', 'reference_id'] },
      { columns: ['expires_at'] },
      { columns: ['created_at'] }
    ]
  },

  loyalty_tiers: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', nullable: false }, // Bronze, Silver, Gold, Platinum
      { name: 'slug', type: 'string', nullable: false },
      { name: 'min_points', type: 'integer', nullable: false }, // Minimum points to reach tier
      { name: 'multiplier', type: 'numeric', default: 1 }, // Points earning multiplier
      { name: 'benefits', type: 'jsonb', default: '[]' }, // Array of benefits
      { name: 'icon', type: 'string', nullable: true },
      { name: 'color', type: 'string', nullable: true },
      { name: 'sort_order', type: 'integer', default: 0 },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['slug'], unique: true },
      { columns: ['min_points'] },
      { columns: ['is_active'] }
    ]
  },

  loyalty_rules: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: false }, // purchase, review, referral, signup, birthday
      { name: 'points_type', type: 'string', default: 'fixed' }, // fixed, percentage, per_amount
      { name: 'points_value', type: 'numeric', nullable: false },
      { name: 'per_amount', type: 'numeric', nullable: true }, // For per_amount type (e.g., 1 point per $1)
      { name: 'max_points', type: 'integer', nullable: true }, // Maximum points per transaction
      { name: 'conditions', type: 'jsonb', default: '{}' }, // Additional conditions
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['type'] },
      { columns: ['is_active'] }
    ]
  },

  // ============================================
  // VENDOR SUBSCRIPTION PLANS
  // ============================================

  subscription_plans: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Plan Details
      { name: 'name', type: 'string', nullable: false }, // Basic, Professional, Enterprise
      { name: 'slug', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'badge_color', type: 'string', nullable: true }, // For UI display

      // Pricing
      { name: 'price_monthly', type: 'numeric', nullable: false },
      { name: 'price_yearly', type: 'numeric', nullable: true }, // Discounted yearly price
      { name: 'currency', type: 'string', default: 'USD' },
      { name: 'trial_days', type: 'integer', default: 0 },

      // Limits & Features
      { name: 'max_products', type: 'integer', nullable: true }, // null = unlimited
      { name: 'max_orders_per_month', type: 'integer', nullable: true },
      { name: 'max_team_members', type: 'integer', default: 1 },
      { name: 'commission_rate', type: 'numeric', default: 0 }, // Platform commission %
      { name: 'features', type: 'jsonb', default: '[]' }, // Array of feature strings

      // Advanced Features
      { name: 'has_analytics', type: 'boolean', default: false },
      { name: 'has_priority_support', type: 'boolean', default: false },
      { name: 'has_custom_domain', type: 'boolean', default: false },
      { name: 'has_api_access', type: 'boolean', default: false },
      { name: 'has_bulk_upload', type: 'boolean', default: false },
      { name: 'has_promotions', type: 'boolean', default: true },

      // Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'is_featured', type: 'boolean', default: false },
      { name: 'sort_order', type: 'integer', default: 0 },

      // Stripe Integration
      { name: 'stripe_price_id_monthly', type: 'string', nullable: true },
      { name: 'stripe_price_id_yearly', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['slug'], unique: true },
      { columns: ['is_active'] },
      { columns: ['sort_order'] }
    ]
  },

  shop_subscriptions: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },
      { name: 'plan_id', type: 'uuid', nullable: false, references: { table: 'subscription_plans' } },

      // Subscription Period
      { name: 'billing_cycle', type: 'string', nullable: false }, // monthly, yearly
      { name: 'current_period_start', type: 'timestamptz', nullable: false },
      { name: 'current_period_end', type: 'timestamptz', nullable: false },
      { name: 'trial_ends_at', type: 'timestamptz', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'active' }, // trial, active, past_due, cancelled, expired
      { name: 'cancel_at_period_end', type: 'boolean', default: false },
      { name: 'cancelled_at', type: 'timestamptz', nullable: true },

      // Payment
      { name: 'stripe_subscription_id', type: 'string', nullable: true },
      { name: 'stripe_customer_id', type: 'string', nullable: true },
      { name: 'last_payment_at', type: 'timestamptz', nullable: true },
      { name: 'next_payment_at', type: 'timestamptz', nullable: true },

      // Usage Tracking
      { name: 'products_used', type: 'integer', default: 0 },
      { name: 'orders_this_month', type: 'integer', default: 0 },
      { name: 'usage_reset_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['plan_id'] },
      { columns: ['status'] },
      { columns: ['current_period_end'] },
      { columns: ['stripe_subscription_id'] }
    ]
  },

  subscription_invoices: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'subscription_id', type: 'uuid', nullable: false, references: { table: 'shop_subscriptions' } },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },

      // Invoice Details
      { name: 'invoice_number', type: 'string', nullable: false },
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'string', default: 'USD' },
      { name: 'tax_amount', type: 'numeric', default: 0 },
      { name: 'total_amount', type: 'numeric', nullable: false },

      // Period
      { name: 'period_start', type: 'timestamptz', nullable: false },
      { name: 'period_end', type: 'timestamptz', nullable: false },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, paid, failed, refunded
      { name: 'paid_at', type: 'timestamptz', nullable: true },

      // Stripe
      { name: 'stripe_invoice_id', type: 'string', nullable: true },
      { name: 'stripe_payment_intent_id', type: 'string', nullable: true },
      { name: 'invoice_pdf_url', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['subscription_id'] },
      { columns: ['shop_id'] },
      { columns: ['invoice_number'], unique: true },
      { columns: ['status'] },
      { columns: ['stripe_invoice_id'] }
    ]
  },

  // ============================================
  // CASHBACK SYSTEM
  // ============================================

  cashback_rules: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Rule Details
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'type', type: 'string', nullable: false }, // percentage, fixed

      // Cashback Value
      { name: 'value', type: 'numeric', nullable: false }, // Percentage or fixed amount
      { name: 'max_cashback', type: 'numeric', nullable: true }, // Cap for percentage type
      { name: 'min_order_amount', type: 'numeric', default: 0 },

      // Scope
      { name: 'applies_to', type: 'string', default: 'all' }, // all, category, product, shop, first_order
      { name: 'category_ids', type: 'jsonb', default: '[]' },
      { name: 'product_ids', type: 'jsonb', default: '[]' },
      { name: 'shop_ids', type: 'jsonb', default: '[]' },

      // User Targeting
      { name: 'user_type', type: 'string', default: 'all' }, // all, new, existing, tier_specific
      { name: 'loyalty_tiers', type: 'jsonb', default: '[]' }, // For tier-specific cashback

      // Validity
      { name: 'start_date', type: 'timestamptz', nullable: true },
      { name: 'end_date', type: 'timestamptz', nullable: true },

      // Limits
      { name: 'usage_limit', type: 'integer', nullable: true },
      { name: 'usage_count', type: 'integer', default: 0 },
      { name: 'per_user_limit', type: 'integer', nullable: true },

      // Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'priority', type: 'integer', default: 0 }, // Higher priority wins

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['is_active'] },
      { columns: ['applies_to'] },
      { columns: ['start_date'] },
      { columns: ['end_date'] },
      { columns: ['priority'] }
    ]
  },

  cashback_transactions: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false },
      { name: 'order_id', type: 'uuid', nullable: false, references: { table: 'orders' } },
      { name: 'rule_id', type: 'uuid', nullable: true, references: { table: 'cashback_rules' } },

      // Cashback Details
      { name: 'order_amount', type: 'numeric', nullable: false },
      { name: 'cashback_amount', type: 'numeric', nullable: false },
      { name: 'cashback_type', type: 'string', nullable: false }, // percentage, fixed
      { name: 'cashback_value', type: 'numeric', nullable: false }, // The rule value applied

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, credited, cancelled
      { name: 'credited_at', type: 'timestamptz', nullable: true },
      { name: 'wallet_transaction_id', type: 'uuid', nullable: true },

      // Expiry (cashback may expire if order is cancelled/refunded)
      { name: 'expires_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['order_id'] },
      { columns: ['rule_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // REFERRAL / REFER & EARN PROGRAM
  // ============================================

  referral_config: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Referrer Rewards
      { name: 'referrer_reward_type', type: 'string', default: 'wallet' }, // wallet, points, discount
      { name: 'referrer_reward_amount', type: 'numeric', nullable: false },
      { name: 'referrer_reward_currency', type: 'string', default: 'USD' },

      // Referee (New User) Rewards
      { name: 'referee_reward_type', type: 'string', default: 'wallet' }, // wallet, points, discount
      { name: 'referee_reward_amount', type: 'numeric', nullable: false },
      { name: 'referee_min_order', type: 'numeric', default: 0 }, // Min first order for referee to get reward

      // Requirements
      { name: 'require_first_purchase', type: 'boolean', default: true },
      { name: 'min_purchase_amount', type: 'numeric', default: 0 },

      // Limits
      { name: 'max_referrals_per_user', type: 'integer', nullable: true },
      { name: 'reward_validity_days', type: 'integer', default: 30 }, // Days until reward expires

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['is_active'] }
    ]
  },

  referral_codes: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // Referrer

      // Code
      { name: 'code', type: 'string', nullable: false },
      { name: 'custom_code', type: 'boolean', default: false }, // User-created custom code

      // Stats
      { name: 'total_referrals', type: 'integer', default: 0 },
      { name: 'successful_referrals', type: 'integer', default: 0 },
      { name: 'total_earned', type: 'numeric', default: 0 },

      // Status
      { name: 'is_active', type: 'boolean', default: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['code'], unique: true },
      { columns: ['is_active'] }
    ]
  },

  referrals: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'referrer_id', type: 'string', nullable: false }, // User who referred
      { name: 'referee_id', type: 'string', nullable: false }, // New user who signed up
      { name: 'referral_code_id', type: 'uuid', nullable: false, references: { table: 'referral_codes' } },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, qualified, rewarded, expired

      // First Order (if required)
      { name: 'first_order_id', type: 'uuid', nullable: true, references: { table: 'orders' } },
      { name: 'first_order_amount', type: 'numeric', nullable: true },
      { name: 'first_order_at', type: 'timestamptz', nullable: true },

      // Rewards
      { name: 'referrer_reward_amount', type: 'numeric', nullable: true },
      { name: 'referrer_rewarded_at', type: 'timestamptz', nullable: true },
      { name: 'referee_reward_amount', type: 'numeric', nullable: true },
      { name: 'referee_rewarded_at', type: 'timestamptz', nullable: true },

      // Expiry
      { name: 'expires_at', type: 'timestamptz', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['referrer_id'] },
      { columns: ['referee_id'], unique: true }, // A user can only be referred once
      { columns: ['referral_code_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  email_templates: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },

      // Template Identification
      { name: 'slug', type: 'string', nullable: false }, // order_confirmation, password_reset, etc.
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'category', type: 'string', nullable: false }, // auth, order, marketing, notification

      // Content
      { name: 'subject', type: 'string', nullable: false },
      { name: 'html_body', type: 'text', nullable: false },
      { name: 'text_body', type: 'text', nullable: true }, // Plain text fallback

      // Variables
      { name: 'variables', type: 'jsonb', default: '[]' }, // Available merge tags

      // Settings
      { name: 'from_name', type: 'string', nullable: true },
      { name: 'from_email', type: 'string', nullable: true },
      { name: 'reply_to', type: 'string', nullable: true },

      // Status
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'is_system', type: 'boolean', default: false }, // System templates can't be deleted

      // Versioning
      { name: 'version', type: 'integer', default: 1 },
      { name: 'last_edited_by', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['slug'], unique: true },
      { columns: ['category'] },
      { columns: ['is_active'] }
    ]
  },

  // ============================================
  // DELIVERY MEN
  // ============================================

  delivery_men: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: true }, // database user ID

      // Personal Information
      { name: 'name', type: 'string', nullable: false },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: false },
      { name: 'phone', type: 'string', nullable: true },
      { name: 'image_url', type: 'string', nullable: true },
      { name: 'address', type: 'jsonb', default: '{}' },

      // Type
      { name: 'type', type: 'string', default: 'freelancer' }, // freelancer, salaried

      // Vehicle Information
      { name: 'vehicle_type', type: 'string', nullable: true }, // bicycle, motorcycle, car, van, truck, scooter, walk
      { name: 'vehicle_number', type: 'string', nullable: true },
      { name: 'vehicle_model', type: 'string', nullable: true },
      { name: 'vehicle_color', type: 'string', nullable: true },

      // Identity Verification
      { name: 'identity_type', type: 'string', nullable: true }, // passport, driving_license, national_id
      { name: 'identity_number', type: 'string', nullable: true },
      { name: 'identity_images', type: 'jsonb', default: '[]' },
      { name: 'is_verified', type: 'boolean', default: false },

      // Location & Availability
      { name: 'current_location', type: 'jsonb', nullable: true }, // {lat, lng, address}
      { name: 'availability', type: 'string', default: 'offline' }, // online, offline, busy, on_break
      { name: 'zone_id', type: 'string', nullable: true },

      // Distance settings
      { name: 'min_delivery_distance', type: 'numeric', nullable: true },
      { name: 'max_delivery_distance', type: 'numeric', nullable: true },

      // Performance Metrics
      { name: 'rating', type: 'numeric', default: 0 },
      { name: 'total_reviews', type: 'integer', default: 0 },
      { name: 'total_deliveries', type: 'integer', default: 0 },
      { name: 'completed_deliveries', type: 'integer', default: 0 },
      { name: 'cancelled_deliveries', type: 'integer', default: 0 },

      // Earnings
      { name: 'total_earnings', type: 'numeric', default: 0 },
      { name: 'pending_earnings', type: 'numeric', default: 0 },
      { name: 'withdrawn_earnings', type: 'numeric', default: 0 },
      { name: 'cash_in_hand', type: 'numeric', default: 0 },

      // Bank Details for Withdrawals
      { name: 'bank_name', type: 'string', nullable: true },
      { name: 'bank_account_number', type: 'string', nullable: true },
      { name: 'bank_routing_number', type: 'string', nullable: true },
      { name: 'bank_account_holder', type: 'string', nullable: true },

      // Stripe Connect for Payouts
      { name: 'stripe_account_id', type: 'string', nullable: true },
      { name: 'stripe_connect_status', type: 'string', nullable: true }, // pending, connected, restricted, disabled
      { name: 'stripe_charges_enabled', type: 'boolean', default: false },
      { name: 'stripe_payouts_enabled', type: 'boolean', default: false },
      { name: 'stripe_requirements', type: 'jsonb', nullable: true },
      { name: 'stripe_verification_deadline', type: 'timestamptz', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'pending' }, // pending, active, suspended, inactive, rejected
      { name: 'approved_at', type: 'timestamptz', nullable: true },
      { name: 'approved_by', type: 'string', nullable: true },

      // Settings
      { name: 'settings', type: 'jsonb', default: '{}' },
      { name: 'notification_preferences', type: 'jsonb', default: '{}' },

      // Soft Delete
      { name: 'is_deleted', type: 'boolean', default: false },
      { name: 'deleted_at', type: 'timestamptz', nullable: true },
      { name: 'deleted_by', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['email'], unique: true },
      { columns: ['phone'] },
      { columns: ['availability'] },
      { columns: ['status'] },
      { columns: ['zone_id'] },
      { columns: ['rating'] },
      { columns: ['is_deleted'] },
      { columns: ['stripe_account_id'] },
      { columns: ['stripe_connect_status'] }
    ]
  },

  delivery_assignments: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'order_id', type: 'uuid', nullable: false, references: { table: 'orders' } },
      { name: 'delivery_man_id', type: 'uuid', nullable: false, references: { table: 'delivery_men' } },
      { name: 'shop_id', type: 'uuid', nullable: true, references: { table: 'shops' } },

      // Assignment Details
      { name: 'assigned_by', type: 'string', nullable: true }, // User ID of admin/vendor who assigned
      { name: 'assigned_at', type: 'timestamptz', default: 'now()' },

      // Status: assigned, accepted, rejected, picked_up, on_the_way, delivered, cancelled, failed
      { name: 'status', type: 'string', default: 'assigned' },
      { name: 'status_updated_at', type: 'timestamptz', default: 'now()' },

      // Pickup Details
      { name: 'pickup_address', type: 'jsonb', default: '{}' },
      { name: 'pickup_contact', type: 'jsonb', default: '{}' },
      { name: 'picked_up_at', type: 'timestamptz', nullable: true },

      // Delivery Details
      { name: 'delivery_address', type: 'jsonb', default: '{}' },
      { name: 'delivery_contact', type: 'jsonb', default: '{}' },
      { name: 'delivered_at', type: 'timestamptz', nullable: true },

      // Distance & Duration
      { name: 'estimated_distance', type: 'numeric', nullable: true }, // in km
      { name: 'actual_distance', type: 'numeric', nullable: true },
      { name: 'estimated_duration', type: 'integer', nullable: true }, // in minutes
      { name: 'actual_duration', type: 'integer', nullable: true },

      // Earnings
      { name: 'delivery_fee', type: 'numeric', default: 0 },
      { name: 'tip', type: 'numeric', default: 0 },
      { name: 'total_earnings', type: 'numeric', default: 0 },

      // Proof of Delivery
      { name: 'proof_of_delivery', type: 'jsonb', default: '{}' }, // {image_url, signature_url, recipient_name}

      // Notes
      { name: 'notes', type: 'text', nullable: true },
      { name: 'rejection_reason', type: 'text', nullable: true },
      { name: 'cancellation_reason', type: 'text', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['order_id'] },
      { columns: ['delivery_man_id'] },
      { columns: ['shop_id'] },
      { columns: ['status'] },
      { columns: ['assigned_at'] },
      { columns: ['delivery_man_id', 'status'] }
    ]
  },

  email_logs: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'template_id', type: 'uuid', nullable: true, references: { table: 'email_templates' } },

      // Recipient
      { name: 'to_email', type: 'string', nullable: false },
      { name: 'to_name', type: 'string', nullable: true },
      { name: 'user_id', type: 'string', nullable: true },

      // Email Details
      { name: 'subject', type: 'string', nullable: false },
      { name: 'template_slug', type: 'string', nullable: true },

      // Status
      { name: 'status', type: 'string', default: 'sent' }, // sent, delivered, opened, clicked, bounced, failed
      { name: 'error_message', type: 'text', nullable: true },

      // Tracking
      { name: 'opened_at', type: 'timestamptz', nullable: true },
      { name: 'clicked_at', type: 'timestamptz', nullable: true },
      { name: 'bounced_at', type: 'timestamptz', nullable: true },

      // Provider
      { name: 'provider', type: 'string', nullable: true }, // database, sendgrid, ses
      { name: 'provider_message_id', type: 'string', nullable: true },

      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['to_email'] },
      { columns: ['user_id'] },
      { columns: ['template_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // DELIVERY ZONES
  // ============================================

  delivery_zones: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: true, references: { table: 'shops' } }, // null = platform-wide, set = shop-specific
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'type', type: 'string', default: 'polygon' }, // polygon, circle, city, postal_code
      { name: 'coordinates', type: 'jsonb', nullable: true }, // For polygon type
      { name: 'center', type: 'jsonb', nullable: true }, // For circle type {lat, lng}
      { name: 'radius', type: 'numeric', nullable: true }, // In km for circle type
      { name: 'city', type: 'string', nullable: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'country', type: 'string', nullable: true },
      { name: 'postal_codes', type: 'jsonb', nullable: true }, // Array of postal codes
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'sort_order', type: 'integer', default: 0 },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['name'] },
      { columns: ['type'] },
      { columns: ['is_active'] },
      { columns: ['sort_order'] }
    ]
  },

  zone_delivery_options: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'zone_id', type: 'uuid', nullable: false, references: { table: 'delivery_zones' } },
      { name: 'delivery_type', type: 'string', nullable: false }, // standard, express, same_day, scheduled
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'base_fee', type: 'numeric', default: 0 },
      { name: 'per_km_fee', type: 'numeric', nullable: true },
      { name: 'free_delivery_minimum', type: 'numeric', nullable: true },
      { name: 'min_delivery_time', type: 'integer', nullable: true }, // In minutes
      { name: 'max_delivery_time', type: 'integer', nullable: true }, // In minutes
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['zone_id'] },
      { columns: ['delivery_type'] },
      { columns: ['is_active'] }
    ]
  },

  shop_zones: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'shop_id', type: 'uuid', nullable: false, references: { table: 'shops' } },
      { name: 'zone_id', type: 'uuid', nullable: false, references: { table: 'delivery_zones' } },
      { name: 'base_fee_override', type: 'numeric', nullable: true },
      { name: 'min_delivery_time_override', type: 'integer', nullable: true },
      { name: 'max_delivery_time_override', type: 'integer', nullable: true },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['shop_id'] },
      { columns: ['zone_id'] },
      { columns: ['shop_id', 'zone_id'], unique: true },
      { columns: ['is_active'] }
    ]
  },

  // Delivery Man Preferred Zones (many-to-many)
  delivery_man_zones: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'delivery_man_id', type: 'uuid', nullable: false, references: { table: 'delivery_men' } },
      { name: 'zone_id', type: 'uuid', nullable: false, references: { table: 'delivery_zones' } },
      { name: 'is_primary', type: 'boolean', default: false }, // Primary preferred zone
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['delivery_man_id'] },
      { columns: ['zone_id'] },
      { columns: ['delivery_man_id', 'zone_id'], unique: true },
      { columns: ['is_active'] }
    ]
  },

  // Delivery Man Reviews
  delivery_man_reviews: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'delivery_man_id', type: 'uuid', nullable: false, references: { table: 'delivery_men' } },
      { name: 'order_id', type: 'uuid', nullable: false, references: { table: 'orders' } },
      { name: 'customer_id', type: 'string', nullable: false }, // database user ID
      { name: 'rating', type: 'integer', nullable: false }, // 1-5
      { name: 'comment', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['delivery_man_id'] },
      { columns: ['order_id'] },
      { columns: ['customer_id'] },
      { columns: ['rating'] },
      { columns: ['created_at'] }
    ]
  },

  // Delivery Man Withdrawals
  delivery_man_withdrawals: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'delivery_man_id', type: 'uuid', nullable: false, references: { table: 'delivery_men' } },
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'payment_method', type: 'string', nullable: true }, // bank, mobile_money, cash
      { name: 'payment_details', type: 'jsonb', default: '{}' },
      { name: 'status', type: 'string', default: 'pending' }, // pending, approved, completed, rejected
      { name: 'processed_by', type: 'string', nullable: true }, // Admin user ID
      { name: 'processed_at', type: 'timestamptz', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['delivery_man_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  // Delivery Location Logs (for tracking)
  delivery_location_logs: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'delivery_man_id', type: 'uuid', nullable: false, references: { table: 'delivery_men' } },
      { name: 'assignment_id', type: 'uuid', nullable: true, references: { table: 'delivery_assignments' } },
      { name: 'lat', type: 'numeric', nullable: false },
      { name: 'lng', type: 'numeric', nullable: false },
      { name: 'heading', type: 'numeric', nullable: true },
      { name: 'speed', type: 'numeric', nullable: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['delivery_man_id'] },
      { columns: ['assignment_id'] },
      { columns: ['created_at'] }
    ]
  },

  // ============================================
  // BLOG SYSTEM
  // ============================================

  // Blog Categories
  blog_categories: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'name', type: 'string', nullable: false },
      { name: 'slug', type: 'string', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'image_url', type: 'string', nullable: true },
      { name: 'parent_id', type: 'uuid', nullable: true, references: { table: 'blog_categories' } },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'sort_order', type: 'integer', default: 0 },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['slug'], unique: true },
      { columns: ['parent_id'] },
      { columns: ['is_active'] },
      { columns: ['sort_order'] }
    ]
  },

  // Blog Posts
  blog_posts: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID (author)
      { name: 'title', type: 'string', nullable: false },
      { name: 'slug', type: 'string', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'excerpt', type: 'text', nullable: true },
      { name: 'status', type: 'string', default: 'draft' }, // draft, published, archived
      { name: 'category', type: 'string', nullable: true }, // Category name
      { name: 'author', type: 'string', nullable: true }, // Author name
      { name: 'tags', type: 'jsonb', default: '[]' }, // Array of tags
      { name: 'image_urls', type: 'jsonb', default: '[]' }, // Array of image URLs
      { name: 'meta_title', type: 'string', nullable: true },
      { name: 'meta_description', type: 'text', nullable: true },
      { name: 'featured', type: 'boolean', default: false },
      { name: 'views_count', type: 'integer', default: 0 },
      { name: 'likes_count', type: 'integer', default: 0 },
      { name: 'comments_count', type: 'integer', default: 0 },
      { name: 'rating', type: 'numeric', default: 0 },
      { name: 'rating_count', type: 'integer', default: 0 },
      { name: 'published_at', type: 'timestamptz', nullable: true },
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' },
      { name: 'deleted_at', type: 'timestamptz', nullable: true }
    ],
    indexes: [
      { columns: ['user_id'] },
      { columns: ['slug'], unique: true },
      { columns: ['status'] },
      { columns: ['category'] },
      { columns: ['featured'] },
      { columns: ['published_at'] },
      { columns: ['created_at'] },
      { columns: ['views_count'] },
      { columns: ['likes_count'] }
    ]
  },

  // Blog Comments
  blog_comments: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'post_id', type: 'uuid', nullable: false, references: { table: 'blog_posts' } },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID
      { name: 'parent_id', type: 'uuid', nullable: true, references: { table: 'blog_comments' } }, // For replies
      { name: 'content', type: 'text', nullable: false },
      { name: 'status', type: 'string', default: 'approved' }, // pending, approved, spam, deleted
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['post_id'] },
      { columns: ['user_id'] },
      { columns: ['parent_id'] },
      { columns: ['status'] },
      { columns: ['created_at'] }
    ]
  },

  // Blog Likes
  blog_likes: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'post_id', type: 'uuid', nullable: false, references: { table: 'blog_posts' } },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID
      { name: 'created_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['post_id'] },
      { columns: ['user_id'] },
      { columns: ['post_id', 'user_id'], unique: true }
    ]
  },

  // Blog Ratings
  blog_ratings: {
    columns: [
      { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
      { name: 'post_id', type: 'uuid', nullable: false, references: { table: 'blog_posts' } },
      { name: 'user_id', type: 'string', nullable: false }, // database user ID
      { name: 'rating', type: 'integer', nullable: false }, // 1-5
      { name: 'created_at', type: 'timestamptz', default: 'now()' },
      { name: 'updated_at', type: 'timestamptz', default: 'now()' }
    ],
    indexes: [
      { columns: ['post_id'] },
      { columns: ['user_id'] },
      { columns: ['post_id', 'user_id'], unique: true }
    ]
  }
};

// NOTE: All TypeScript type definitions (EntityType, interfaces, etc.) are in ./types.ts
// They are exported via "export * from './types'" at the top of this file

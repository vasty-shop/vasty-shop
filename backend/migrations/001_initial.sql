-- Vasty Shop Database Schema
-- Tables: 67

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SHOPS
CREATE TABLE IF NOT EXISTS "shops" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "owner_id" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "logo" VARCHAR(255),
  "banner" VARCHAR(255),
  "category_id" UUID REFERENCES "categories"(id) ON DELETE CASCADE,
  "category" VARCHAR(255),
  "template" VARCHAR(255),
  "default_language" VARCHAR(255) DEFAULT 'en',
  "supported_languages" JSONB DEFAULT '["en"]',
  "business_name" VARCHAR(255),
  "business_type" VARCHAR(255),
  "tax_id" VARCHAR(255),
  "business_email" VARCHAR(255) NOT NULL,
  "business_phone" VARCHAR(255),
  "business_address" JSONB DEFAULT '{}',
  "status" VARCHAR(255) NOT NULL DEFAULT 'pending',
  "is_verified" BOOLEAN DEFAULT false,
  "verified_at" TIMESTAMPTZ,
  "rejection_reason" TEXT,
  "suspension_reason" TEXT,
  "suspended_at" TIMESTAMPTZ,
  "team_members" JSONB DEFAULT '[]',
  "payment_methods" JSONB DEFAULT '["card"]',
  "settings" JSONB DEFAULT '{}',
  "total_sales" TEXT DEFAULT 0,
  "total_orders" INTEGER DEFAULT 0,
  "total_products" INTEGER DEFAULT 0,
  "rating" TEXT DEFAULT 0,
  "total_reviews" INTEGER DEFAULT 0,
  "stripe_account_id" VARCHAR(255),
  "stripe_connect_status" VARCHAR(255),
  "stripe_charges_enabled" BOOLEAN DEFAULT false,
  "stripe_payouts_enabled" BOOLEAN DEFAULT false,
  "stripe_requirements" JSONB DEFAULT '{}',
  "stripe_verification_deadline" TIMESTAMPTZ,
  "storefront_config" JSONB DEFAULT '{}',
  "storefront_published" BOOLEAN DEFAULT false,
  "storefront_published_at" TIMESTAMPTZ,
  "mobile_app_config" JSONB DEFAULT '{}',
  "mobile_app_published" BOOLEAN DEFAULT false,
  "mobile_app_published_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_shops_owner_id" ON "shops" ("owner_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_shops_slug" ON "shops" ("slug");
CREATE INDEX IF NOT EXISTS "idx_shops_status" ON "shops" ("status");
CREATE INDEX IF NOT EXISTS "idx_shops_is_verified" ON "shops" ("is_verified");
CREATE INDEX IF NOT EXISTS "idx_shops_business_email" ON "shops" ("business_email");
CREATE INDEX IF NOT EXISTS "idx_shops_category_id" ON "shops" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_shops_default_language" ON "shops" ("default_language");
CREATE INDEX IF NOT EXISTS "idx_shops_stripe_account_id" ON "shops" ("stripe_account_id");
CREATE INDEX IF NOT EXISTS "idx_shops_stripe_connect_status" ON "shops" ("stripe_connect_status");
CREATE INDEX IF NOT EXISTS "idx_shops_storefront_published" ON "shops" ("storefront_published");
CREATE INDEX IF NOT EXISTS "idx_shops_mobile_app_published" ON "shops" ("mobile_app_published");
CREATE INDEX IF NOT EXISTS "idx_shops_created_at" ON "shops" ("created_at");

-- SHOP_TEAM_MEMBERS
CREATE TABLE IF NOT EXISTS "shop_team_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "role" VARCHAR(255) NOT NULL,
  "permissions" JSONB DEFAULT '[]',
  "status" VARCHAR(255) DEFAULT 'active',
  "is_active" BOOLEAN DEFAULT true,
  "invited_by" VARCHAR(255),
  "invited_at" TIMESTAMPTZ,
  "joined_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_shop_team_members_shop_id_user_id" ON "shop_team_members" ("shop_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_shop_team_members_shop_id" ON "shop_team_members" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_shop_team_members_user_id" ON "shop_team_members" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_shop_team_members_role" ON "shop_team_members" ("role");
CREATE INDEX IF NOT EXISTS "idx_shop_team_members_status" ON "shop_team_members" ("status");
CREATE INDEX IF NOT EXISTS "idx_shop_team_members_is_active" ON "shop_team_members" ("is_active");

-- SHOP_INVITES
CREATE TABLE IF NOT EXISTS "shop_invites" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "email" VARCHAR(255) NOT NULL,
  "role" VARCHAR(255) DEFAULT 'staff',
  "permissions" JSONB DEFAULT '[]',
  "invited_by" VARCHAR(255) NOT NULL,
  "token" VARCHAR(255) NOT NULL,
  "message" TEXT,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "status" VARCHAR(255) DEFAULT 'pending',
  "accepted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_shop_invites_shop_id" ON "shop_invites" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_shop_invites_email" ON "shop_invites" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_shop_invites_token" ON "shop_invites" ("token");
CREATE INDEX IF NOT EXISTS "idx_shop_invites_status" ON "shop_invites" ("status");
CREATE INDEX IF NOT EXISTS "idx_shop_invites_expires_at" ON "shop_invites" ("expires_at");

-- CATEGORIES
CREATE TABLE IF NOT EXISTS "categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "parent_id" UUID,
  "level" INTEGER DEFAULT 0,
  "image" VARCHAR(255),
  "icon" VARCHAR(255),
  "display_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "is_featured" BOOLEAN DEFAULT false,
  "meta_title" VARCHAR(255),
  "meta_description" TEXT,
  "meta_keywords" JSONB DEFAULT '[]',
  "product_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories" ("slug");
CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories" ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_categories_is_active" ON "categories" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_categories_is_featured" ON "categories" ("is_featured");
CREATE INDEX IF NOT EXISTS "idx_categories_display_order" ON "categories" ("display_order");
CREATE INDEX IF NOT EXISTS "idx_categories_level" ON "categories" ("level");

-- PRODUCTS
CREATE TABLE IF NOT EXISTS "products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "brand" VARCHAR(255),
  "description" TEXT,
  "short_description" TEXT,
  "material" VARCHAR(255),
  "features" JSONB DEFAULT '[]',
  "specifications" JSONB DEFAULT '{}',
  "sizes" JSONB DEFAULT '[]',
  "colors" JSONB DEFAULT '[]',
  "care_instructions" JSONB DEFAULT '[]',
  "size_chart" JSONB DEFAULT '[]',
  "shipping_info" JSONB DEFAULT '{}',
  "return_policy" JSONB DEFAULT '{}',
  "price" TEXT NOT NULL,
  "sale_price" TEXT,
  "cost_price" TEXT,
  "compare_price" TEXT,
  "sku" VARCHAR(255) NOT NULL,
  "barcode" VARCHAR(255),
  "stock" INTEGER DEFAULT 0,
  "low_stock_threshold" INTEGER DEFAULT 5,
  "track_inventory" BOOLEAN DEFAULT true,
  "allow_backorder" BOOLEAN DEFAULT false,
  "product_type" VARCHAR(255) DEFAULT 'simple',
  "status" VARCHAR(255) DEFAULT 'draft',
  "images" JSONB DEFAULT '[]',
  "videos" JSONB DEFAULT '[]',
  "variants" JSONB DEFAULT '[]',
  "variant_attributes" JSONB DEFAULT '[]',
  "categories" JSONB DEFAULT '[]',
  "tags" JSONB DEFAULT '[]',
  "weight" TEXT,
  "length" TEXT,
  "width" TEXT,
  "height" TEXT,
  "requires_shipping" BOOLEAN DEFAULT true,
  "shipping_class" VARCHAR(255),
  "meta_title" VARCHAR(255),
  "meta_description" TEXT,
  "meta_keywords" JSONB DEFAULT '[]',
  "is_featured" BOOLEAN DEFAULT false,
  "is_new" BOOLEAN DEFAULT false,
  "is_bestseller" BOOLEAN DEFAULT false,
  "view_count" INTEGER DEFAULT 0,
  "total_sales" INTEGER DEFAULT 0,
  "rating" TEXT DEFAULT 0,
  "total_reviews" INTEGER DEFAULT 0,
  "attributes" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_products_shop_id" ON "products" ("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_products_slug" ON "products" ("slug");
CREATE INDEX IF NOT EXISTS "idx_products_sku" ON "products" ("sku");
CREATE INDEX IF NOT EXISTS "idx_products_barcode" ON "products" ("barcode");
CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" ("status");
CREATE INDEX IF NOT EXISTS "idx_products_product_type" ON "products" ("product_type");
CREATE INDEX IF NOT EXISTS "idx_products_is_featured" ON "products" ("is_featured");
CREATE INDEX IF NOT EXISTS "idx_products_is_new" ON "products" ("is_new");
CREATE INDEX IF NOT EXISTS "idx_products_is_bestseller" ON "products" ("is_bestseller");
CREATE INDEX IF NOT EXISTS "idx_products_price" ON "products" ("price");
CREATE INDEX IF NOT EXISTS "idx_products_created_at" ON "products" ("created_at");

-- CARTS
CREATE TABLE IF NOT EXISTS "carts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255),
  "session_id" VARCHAR(255),
  "items" JSONB DEFAULT '[]',
  "subtotal" TEXT DEFAULT 0,
  "tax" TEXT DEFAULT 0,
  "shipping" TEXT DEFAULT 0,
  "discount" TEXT DEFAULT 0,
  "total" TEXT DEFAULT 0,
  "applied_coupons" JSONB DEFAULT '[]',
  "shipping_address_id" UUID,
  "status" VARCHAR(255) DEFAULT 'active',
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_carts_user_id" ON "carts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_carts_session_id" ON "carts" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_carts_status" ON "carts" ("status");
CREATE INDEX IF NOT EXISTS "idx_carts_expires_at" ON "carts" ("expires_at");
CREATE INDEX IF NOT EXISTS "idx_carts_created_at" ON "carts" ("created_at");

-- ORDERS
CREATE TABLE IF NOT EXISTS "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_number" VARCHAR(255) NOT NULL,
  "user_id" VARCHAR(255) NOT NULL,
  "shop_id" UUID NOT NULL,
  "items" JSONB NOT NULL,
  "subtotal" TEXT NOT NULL,
  "tax" TEXT DEFAULT 0,
  "shipping_cost" TEXT DEFAULT 0,
  "discount" TEXT DEFAULT 0,
  "total" TEXT NOT NULL,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "payment_method" VARCHAR(255) NOT NULL,
  "payment_status" VARCHAR(255) DEFAULT 'pending',
  "transaction_id" VARCHAR(255),
  "paid_at" TIMESTAMPTZ,
  "stripe_payment_intent_id" VARCHAR(255),
  "stripe_connect_enabled" BOOLEAN DEFAULT false,
  "platform_fee" TEXT,
  "vendor_amount" TEXT,
  "shipping_address" JSONB NOT NULL,
  "billing_address" JSONB NOT NULL,
  "delivery_method" VARCHAR(255),
  "tracking_number" VARCHAR(255),
  "carrier" VARCHAR(255),
  "delivery_man_id" UUID REFERENCES "delivery_men"(id) ON DELETE CASCADE,
  "delivery_man_name" VARCHAR(255),
  "delivery_fee" TEXT DEFAULT 0,
  "estimated_delivery" DATE,
  "delivered_at" TIMESTAMPTZ,
  "status" VARCHAR(255) DEFAULT 'pending',
  "fulfillment_status" VARCHAR(255) DEFAULT 'unfulfilled',
  "timeline" JSONB DEFAULT '[]',
  "customer_note" TEXT,
  "shop_note" TEXT,
  "internal_note" TEXT,
  "refund_amount" TEXT,
  "refund_reason" TEXT,
  "refunded_at" TIMESTAMPTZ,
  "applied_coupons" JSONB DEFAULT '[]',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_orders_order_number" ON "orders" ("order_number");
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_shop_id" ON "orders" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_payment_status" ON "orders" ("payment_status");
CREATE INDEX IF NOT EXISTS "idx_orders_fulfillment_status" ON "orders" ("fulfillment_status");
CREATE INDEX IF NOT EXISTS "idx_orders_tracking_number" ON "orders" ("tracking_number");
CREATE INDEX IF NOT EXISTS "idx_orders_stripe_payment_intent_id" ON "orders" ("stripe_payment_intent_id");
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at");

-- ORDER_ITEMS
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "shop_id" UUID NOT NULL,
  "product_name" VARCHAR(255) NOT NULL,
  "product_sku" VARCHAR(255) NOT NULL,
  "product_image" VARCHAR(255),
  "variant_id" VARCHAR(255),
  "variant_details" JSONB DEFAULT '{}',
  "unit_price" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "discount" TEXT DEFAULT 0,
  "total" TEXT NOT NULL,
  "status" VARCHAR(255) DEFAULT 'pending',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_product_id" ON "order_items" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_shop_id" ON "order_items" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_status" ON "order_items" ("status");

-- CAMPAIGNS
CREATE TABLE IF NOT EXISTS "campaigns" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID,
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "campaign_type" VARCHAR(255) NOT NULL,
  "start_date" TIMESTAMPTZ NOT NULL,
  "end_date" TIMESTAMPTZ NOT NULL,
  "status" VARCHAR(255) DEFAULT 'draft',
  "discount_type" VARCHAR(255),
  "discount_value" TEXT,
  "max_discount" TEXT,
  "min_purchase" TEXT,
  "target_products" JSONB DEFAULT '[]',
  "target_categories" JSONB DEFAULT '[]',
  "target_shops" JSONB DEFAULT '[]',
  "banner_images" JSONB DEFAULT '[]',
  "featured_image" VARCHAR(255),
  "impressions" INTEGER DEFAULT 0,
  "clicks" INTEGER DEFAULT 0,
  "conversions" INTEGER DEFAULT 0,
  "revenue" TEXT DEFAULT 0,
  "settings" JSONB DEFAULT '{}',
  "terms_conditions" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_campaigns_shop_id" ON "campaigns" ("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_campaigns_slug" ON "campaigns" ("slug");
CREATE INDEX IF NOT EXISTS "idx_campaigns_campaign_type" ON "campaigns" ("campaign_type");
CREATE INDEX IF NOT EXISTS "idx_campaigns_status" ON "campaigns" ("status");
CREATE INDEX IF NOT EXISTS "idx_campaigns_start_date" ON "campaigns" ("start_date");
CREATE INDEX IF NOT EXISTS "idx_campaigns_end_date" ON "campaigns" ("end_date");

-- OFFERS
CREATE TABLE IF NOT EXISTS "offers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID,
  "code" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(255) NOT NULL,
  "value" TEXT NOT NULL,
  "min_purchase" TEXT,
  "max_discount" TEXT,
  "min_items" INTEGER,
  "specific_products" JSONB DEFAULT '[]',
  "specific_categories" JSONB DEFAULT '[]',
  "excluded_products" JSONB DEFAULT '[]',
  "first_order_only" BOOLEAN DEFAULT false,
  "user_types" JSONB DEFAULT '[]',
  "total_usage_limit" INTEGER,
  "per_user_limit" INTEGER DEFAULT 1,
  "current_usage" INTEGER DEFAULT 0,
  "valid_from" TIMESTAMPTZ NOT NULL,
  "valid_to" TIMESTAMPTZ NOT NULL,
  "status" VARCHAR(255) DEFAULT 'active',
  "applied_to" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_offers_shop_id" ON "offers" ("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_offers_code" ON "offers" ("code");
CREATE INDEX IF NOT EXISTS "idx_offers_type" ON "offers" ("type");
CREATE INDEX IF NOT EXISTS "idx_offers_status" ON "offers" ("status");
CREATE INDEX IF NOT EXISTS "idx_offers_valid_from" ON "offers" ("valid_from");
CREATE INDEX IF NOT EXISTS "idx_offers_valid_to" ON "offers" ("valid_to");

-- DELIVERY_ADDRESSES
CREATE TABLE IF NOT EXISTS "delivery_addresses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(255) NOT NULL,
  "phone_number" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "address_line_1" VARCHAR(255) NOT NULL,
  "address_line_2" VARCHAR(255),
  "city" VARCHAR(255) NOT NULL,
  "state" VARCHAR(255) NOT NULL,
  "postal_code" VARCHAR(255) NOT NULL,
  "country" VARCHAR(255) NOT NULL,
  "address_type" VARCHAR(255) DEFAULT 'home',
  "is_default" BOOLEAN DEFAULT false,
  "latitude" TEXT,
  "longitude" TEXT,
  "delivery_instructions" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_delivery_addresses_user_id" ON "delivery_addresses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_addresses_is_default" ON "delivery_addresses" ("is_default");
CREATE INDEX IF NOT EXISTS "idx_delivery_addresses_country" ON "delivery_addresses" ("country");
CREATE INDEX IF NOT EXISTS "idx_delivery_addresses_postal_code" ON "delivery_addresses" ("postal_code");

-- DELIVERY_METHODS
CREATE TABLE IF NOT EXISTS "delivery_methods" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "base_cost" TEXT NOT NULL DEFAULT 0,
  "cost_per_kg" TEXT,
  "free_shipping_threshold" TEXT,
  "estimated_days" VARCHAR(255),
  "cutoff_time" TEXT,
  "carrier" VARCHAR(255),
  "tracking_enabled" BOOLEAN DEFAULT true,
  "zones" JSONB DEFAULT '["domestic"]',
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_delivery_methods_shop_id" ON "delivery_methods" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_methods_type" ON "delivery_methods" ("type");
CREATE INDEX IF NOT EXISTS "idx_delivery_methods_is_active" ON "delivery_methods" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_delivery_methods_sort_order" ON "delivery_methods" ("sort_order");

-- SHIPPING_ZONES
CREATE TABLE IF NOT EXISTS "shipping_zones" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "countries" JSONB DEFAULT '[]',
  "regions" JSONB DEFAULT '[]',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_shipping_zones_shop_id" ON "shipping_zones" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_shipping_zones_is_active" ON "shipping_zones" ("is_active");

-- DELIVERY_TRACKING
CREATE TABLE IF NOT EXISTS "delivery_tracking" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "shop_id" UUID NOT NULL,
  "tracking_number" VARCHAR(255) NOT NULL,
  "carrier" VARCHAR(255),
  "delivery_method" VARCHAR(255) NOT NULL,
  "current_status" VARCHAR(255) DEFAULT 'pending',
  "status_history" JSONB DEFAULT '[]',
  "estimated_delivery_date" DATE,
  "actual_delivery_date" TIMESTAMPTZ,
  "delivery_notes" TEXT,
  "signature_required" BOOLEAN DEFAULT false,
  "proof_of_delivery_url" VARCHAR(255),
  "delivery_attempts" INTEGER DEFAULT 0,
  "failed_reason" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_tracking_order_id" ON "delivery_tracking" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_tracking_shop_id" ON "delivery_tracking" ("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_delivery_tracking_tracking_number" ON "delivery_tracking" ("tracking_number");
CREATE INDEX IF NOT EXISTS "idx_delivery_tracking_carrier" ON "delivery_tracking" ("carrier");
CREATE INDEX IF NOT EXISTS "idx_delivery_tracking_current_status" ON "delivery_tracking" ("current_status");
CREATE INDEX IF NOT EXISTS "idx_delivery_tracking_estimated_delivery_date" ON "delivery_tracking" ("estimated_delivery_date");

-- SHIPPING_METHODS
CREATE TABLE IF NOT EXISTS "shipping_methods" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "display_name" VARCHAR(255) NOT NULL,
  "base_cost" TEXT DEFAULT 0,
  "free_shipping_threshold" TEXT,
  "estimated_days" INTEGER,
  "estimated_business_days" INTEGER,
  "duration" VARCHAR(255),
  "description" TEXT,
  "icon" VARCHAR(255),
  "features" JSONB DEFAULT '[]',
  "is_active" BOOLEAN DEFAULT true,
  "available_countries" JSONB DEFAULT '[]',
  "display_order" INTEGER DEFAULT 0,
  "requires_signature" BOOLEAN DEFAULT false,
  "min_weight" TEXT,
  "max_weight" TEXT,
  "min_order_value" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_shipping_methods_type" ON "shipping_methods" ("type");
CREATE INDEX IF NOT EXISTS "idx_shipping_methods_is_active" ON "shipping_methods" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_shipping_methods_display_order" ON "shipping_methods" ("display_order");

-- WISHLISTS
CREATE TABLE IF NOT EXISTS "wishlists" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) DEFAULT 'My Wishlist',
  "is_default" BOOLEAN DEFAULT false,
  "products" JSONB DEFAULT '[]',
  "privacy" VARCHAR(255) DEFAULT 'private',
  "share_token" VARCHAR(255),
  "total_items" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_wishlists_user_id" ON "wishlists" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_wishlists_is_default" ON "wishlists" ("is_default");
CREATE INDEX IF NOT EXISTS "idx_wishlists_privacy" ON "wishlists" ("privacy");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_wishlists_share_token" ON "wishlists" ("share_token");

-- REVIEWS
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "user_id" VARCHAR(255) NOT NULL,
  "user_name" VARCHAR(255),
  "user_avatar" VARCHAR(255),
  "order_id" UUID,
  "rating" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "review_text" TEXT NOT NULL,
  "review_images" JSONB DEFAULT '[]',
  "review_videos" JSONB DEFAULT '[]',
  "is_verified_purchase" BOOLEAN DEFAULT false,
  "helpful_count" INTEGER DEFAULT 0,
  "not_helpful_count" INTEGER DEFAULT 0,
  "shop_response" TEXT,
  "responded_by" VARCHAR(255),
  "responded_at" TIMESTAMPTZ,
  "status" VARCHAR(255) DEFAULT 'pending',
  "rejection_reason" TEXT,
  "is_reported" BOOLEAN DEFAULT false,
  "report_reason" TEXT,
  "report_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_reviews_product_id" ON "reviews" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_user_id" ON "reviews" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_order_id" ON "reviews" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_rating" ON "reviews" ("rating");
CREATE INDEX IF NOT EXISTS "idx_reviews_status" ON "reviews" ("status");
CREATE INDEX IF NOT EXISTS "idx_reviews_is_verified_purchase" ON "reviews" ("is_verified_purchase");
CREATE INDEX IF NOT EXISTS "idx_reviews_is_reported" ON "reviews" ("is_reported");
CREATE INDEX IF NOT EXISTS "idx_reviews_created_at" ON "reviews" ("created_at");

-- VENDOR_PAYOUTS
CREATE TABLE IF NOT EXISTS "vendor_payouts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL,
  "order_id" UUID,
  "amount" TEXT NOT NULL,
  "platform_fee" TEXT DEFAULT 0,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "stripe_transfer_id" VARCHAR(255),
  "stripe_payout_id" VARCHAR(255),
  "stripe_balance_transaction_id" VARCHAR(255),
  "status" VARCHAR(255) DEFAULT 'pending',
  "estimated_arrival" DATE,
  "paid_at" TIMESTAMPTZ,
  "failure_code" VARCHAR(255),
  "failure_message" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "description" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_shop_id" ON "vendor_payouts" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_order_id" ON "vendor_payouts" ("order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_vendor_payouts_stripe_transfer_id" ON "vendor_payouts" ("stripe_transfer_id");
CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_stripe_payout_id" ON "vendor_payouts" ("stripe_payout_id");
CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_status" ON "vendor_payouts" ("status");
CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_created_at" ON "vendor_payouts" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_vendor_payouts_paid_at" ON "vendor_payouts" ("paid_at");

-- PAYMENT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS "payment_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "user_id" VARCHAR(255) NOT NULL,
  "amount" TEXT NOT NULL,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "payment_method" VARCHAR(255) NOT NULL,
  "provider" VARCHAR(255) NOT NULL,
  "transaction_id" VARCHAR(255),
  "stripe_payment_intent_id" VARCHAR(255),
  "stripe_charge_id" VARCHAR(255),
  "status" VARCHAR(255) DEFAULT 'pending',
  "metadata" JSONB DEFAULT '{}',
  "error_message" TEXT,
  "refund_amount" TEXT,
  "refund_reason" TEXT,
  "refunded_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_order_id" ON "payment_transactions" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_user_id" ON "payment_transactions" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_payment_transactions_transaction_id" ON "payment_transactions" ("transaction_id");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_stripe_payment_intent_id" ON "payment_transactions" ("stripe_payment_intent_id");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_payment_method" ON "payment_transactions" ("payment_method");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_provider" ON "payment_transactions" ("provider");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_status" ON "payment_transactions" ("status");
CREATE INDEX IF NOT EXISTS "idx_payment_transactions_created_at" ON "payment_transactions" ("created_at");

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB DEFAULT '{}',
  "action_url" VARCHAR(255),
  "is_read" BOOLEAN DEFAULT false,
  "read_at" TIMESTAMPTZ,
  "priority" VARCHAR(255) DEFAULT 'normal',
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id_is_read" ON "notifications" ("user_id", "is_read");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id_created_at" ON "notifications" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "notifications" ("type");
CREATE INDEX IF NOT EXISTS "idx_notifications_priority" ON "notifications" ("priority");

-- ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255),
  "shop_id" UUID,
  "activity_type" VARCHAR(255) NOT NULL,
  "action" VARCHAR(255) NOT NULL,
  "entity_type" VARCHAR(255),
  "entity_id" UUID,
  "changes" JSONB,
  "metadata" JSONB DEFAULT '{}',
  "ip_address" VARCHAR(255),
  "user_agent" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_activity_logs_user_id_created_at" ON "activity_logs" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_shop_id_created_at" ON "activity_logs" ("shop_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_entity_type_entity_id" ON "activity_logs" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_activity_type" ON "activity_logs" ("activity_type");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_action" ON "activity_logs" ("action");

-- SHOP_ANALYTICS
CREATE TABLE IF NOT EXISTS "shop_analytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "total_revenue" TEXT DEFAULT 0,
  "total_orders" INTEGER DEFAULT 0,
  "total_items_sold" INTEGER DEFAULT 0,
  "average_order_value" TEXT DEFAULT 0,
  "page_views" INTEGER DEFAULT 0,
  "unique_visitors" INTEGER DEFAULT 0,
  "product_views" INTEGER DEFAULT 0,
  "new_customers" INTEGER DEFAULT 0,
  "returning_customers" INTEGER DEFAULT 0,
  "products_added" INTEGER DEFAULT 0,
  "products_updated" INTEGER DEFAULT 0,
  "reviews_received" INTEGER DEFAULT 0,
  "average_rating" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_shop_analytics_shop_id_date" ON "shop_analytics" ("shop_id", "date");
CREATE INDEX IF NOT EXISTS "idx_shop_analytics_shop_id" ON "shop_analytics" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_shop_analytics_date" ON "shop_analytics" ("date");

-- SETTINGS
CREATE TABLE IF NOT EXISTS "settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "platform_name" VARCHAR(255) DEFAULT 'My Shop',
  "platform_logo" VARCHAR(255),
  "support_email" VARCHAR(255) DEFAULT 'support@example.com',
  "default_currency" VARCHAR(255) DEFAULT 'USD',
  "default_language" VARCHAR(255) DEFAULT 'en',
  "platform_commission_rate" TEXT DEFAULT 10,
  "minimum_order_amount" TEXT DEFAULT 0,
  "free_shipping_threshold" TEXT DEFAULT 50,
  "auto_approve_shops" BOOLEAN DEFAULT false,
  "required_documents" JSONB DEFAULT '[]',
  "max_products_per_shop" INTEGER DEFAULT 1000,
  "allowed_categories" JSONB DEFAULT '[]',
  "stripe_enabled" BOOLEAN DEFAULT true,
  "stripe_status" VARCHAR(255) DEFAULT 'active',
  "paypal_enabled" BOOLEAN DEFAULT false,
  "paypal_status" VARCHAR(255) DEFAULT 'inactive',
  "cod_enabled" BOOLEAN DEFAULT true,
  "cod_status" VARCHAR(255) DEFAULT 'active',
  "email_notifications" BOOLEAN DEFAULT true,
  "push_notifications" BOOLEAN DEFAULT false,
  "sms_notifications" BOOLEAN DEFAULT false,
  "maintenance_mode" BOOLEAN DEFAULT false,
  "maintenance_message" TEXT,
  "webhook_url" VARCHAR(255),
  "api_key" VARCHAR(255),
  "rate_limit_per_minute" INTEGER DEFAULT 60,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);

-- PLATFORM_SETTINGS
CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" VARCHAR(255) NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "is_public" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_platform_settings_key" ON "platform_settings" ("key");

-- CURRENCIES
CREATE TABLE IF NOT EXISTS "currencies" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "symbol" VARCHAR(255) NOT NULL,
  "symbol_native" VARCHAR(255) NOT NULL,
  "decimal_digits" INTEGER DEFAULT 2,
  "rounding" TEXT DEFAULT 0,
  "symbol_position" VARCHAR(255) DEFAULT 'before',
  "decimal_separator" VARCHAR(255) DEFAULT '.',
  "thousand_separator" VARCHAR(255) DEFAULT ',',
  "is_active" BOOLEAN DEFAULT true,
  "is_default" BOOLEAN DEFAULT false,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_currencies_code" ON "currencies" ("code");
CREATE INDEX IF NOT EXISTS "idx_currencies_is_active" ON "currencies" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_currencies_is_default" ON "currencies" ("is_default");
CREATE INDEX IF NOT EXISTS "idx_currencies_display_order" ON "currencies" ("display_order");

-- EXCHANGE_RATES
CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "from_currency" VARCHAR(255) NOT NULL,
  "to_currency" VARCHAR(255) NOT NULL,
  "rate" TEXT NOT NULL,
  "source" VARCHAR(255),
  "valid_from" TIMESTAMPTZ DEFAULT now(),
  "valid_until" TIMESTAMPTZ,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_exchange_rates_from_currency_to_currency" ON "exchange_rates" ("from_currency", "to_currency");
CREATE INDEX IF NOT EXISTS "idx_exchange_rates_from_currency" ON "exchange_rates" ("from_currency");
CREATE INDEX IF NOT EXISTS "idx_exchange_rates_to_currency" ON "exchange_rates" ("to_currency");
CREATE INDEX IF NOT EXISTS "idx_exchange_rates_is_active" ON "exchange_rates" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_exchange_rates_valid_from" ON "exchange_rates" ("valid_from");
CREATE INDEX IF NOT EXISTS "idx_exchange_rates_valid_until" ON "exchange_rates" ("valid_until");

-- USER_PREFERENCES
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "preferred_currency" VARCHAR(255),
  "preferred_language" VARCHAR(255),
  "preferred_country" VARCHAR(255),
  "email_notifications" BOOLEAN DEFAULT true,
  "sms_notifications" BOOLEAN DEFAULT false,
  "push_notifications" BOOLEAN DEFAULT true,
  "theme" VARCHAR(255) DEFAULT 'light',
  "timezone" VARCHAR(255),
  "settings" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_preferences_user_id" ON "user_preferences" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_preferences_preferred_currency" ON "user_preferences" ("preferred_currency");
CREATE INDEX IF NOT EXISTS "idx_user_preferences_preferred_country" ON "user_preferences" ("preferred_country");

-- TAX_COUNTRIES
CREATE TABLE IF NOT EXISTS "tax_countries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "tax_name" VARCHAR(255) NOT NULL,
  "tax_abbreviation" VARCHAR(255),
  "default_rate" TEXT DEFAULT 0,
  "tax_type" VARCHAR(255) DEFAULT 'inclusive',
  "compound_tax" BOOLEAN DEFAULT false,
  "tax_on_shipping" BOOLEAN DEFAULT true,
  "requires_tax_id" BOOLEAN DEFAULT false,
  "tax_id_format" VARCHAR(255),
  "is_active" BOOLEAN DEFAULT true,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_tax_countries_code" ON "tax_countries" ("code");
CREATE INDEX IF NOT EXISTS "idx_tax_countries_is_active" ON "tax_countries" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_tax_countries_name" ON "tax_countries" ("name");

-- TAX_RATES
CREATE TABLE IF NOT EXISTS "tax_rates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "country_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "rate" TEXT NOT NULL,
  "state_province" VARCHAR(255),
  "city" VARCHAR(255),
  "postal_code" VARCHAR(255),
  "postal_code_pattern" VARCHAR(255),
  "priority" INTEGER DEFAULT 0,
  "is_compound" BOOLEAN DEFAULT false,
  "valid_from" DATE,
  "valid_until" DATE,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_tax_rates_country_id" ON "tax_rates" ("country_id");
CREATE INDEX IF NOT EXISTS "idx_tax_rates_state_province" ON "tax_rates" ("state_province");
CREATE INDEX IF NOT EXISTS "idx_tax_rates_is_active" ON "tax_rates" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_tax_rates_priority" ON "tax_rates" ("priority");
CREATE INDEX IF NOT EXISTS "idx_tax_rates_valid_from" ON "tax_rates" ("valid_from");
CREATE INDEX IF NOT EXISTS "idx_tax_rates_valid_until" ON "tax_rates" ("valid_until");

-- PRODUCT_TAX_CATEGORIES
CREATE TABLE IF NOT EXISTS "product_tax_categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "code" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_product_tax_categories_code" ON "product_tax_categories" ("code");
CREATE INDEX IF NOT EXISTS "idx_product_tax_categories_is_active" ON "product_tax_categories" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_product_tax_categories_display_order" ON "product_tax_categories" ("display_order");

-- TAX_RULES
CREATE TABLE IF NOT EXISTS "tax_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "country_id" UUID NOT NULL,
  "tax_category_id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "rate_override" TEXT,
  "customer_type" VARCHAR(255),
  "min_amount" TEXT,
  "max_amount" TEXT,
  "valid_from" DATE,
  "valid_until" DATE,
  "priority" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "conditions" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_tax_rules_country_id" ON "tax_rules" ("country_id");
CREATE INDEX IF NOT EXISTS "idx_tax_rules_tax_category_id" ON "tax_rules" ("tax_category_id");
CREATE INDEX IF NOT EXISTS "idx_tax_rules_is_active" ON "tax_rules" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_tax_rules_priority" ON "tax_rules" ("priority");
CREATE INDEX IF NOT EXISTS "idx_tax_rules_customer_type" ON "tax_rules" ("customer_type");
CREATE INDEX IF NOT EXISTS "idx_tax_rules_valid_from" ON "tax_rules" ("valid_from");
CREATE INDEX IF NOT EXISTS "idx_tax_rules_valid_until" ON "tax_rules" ("valid_until");

-- SITE_PAGES
CREATE TABLE IF NOT EXISTS "site_pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "content" JSONB NOT NULL,
  "meta_title" VARCHAR(255),
  "meta_description" TEXT,
  "meta_keywords" VARCHAR(255),
  "template" VARCHAR(255) DEFAULT 'default',
  "header_image" VARCHAR(255),
  "show_breadcrumb" BOOLEAN DEFAULT true,
  "show_table_of_contents" BOOLEAN DEFAULT false,
  "status" VARCHAR(255) DEFAULT 'draft',
  "published_at" TIMESTAMPTZ,
  "publish_scheduled_at" TIMESTAMPTZ,
  "version" INTEGER DEFAULT 1,
  "last_edited_by" VARCHAR(255),
  "is_public" BOOLEAN DEFAULT true,
  "requires_auth" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_site_pages_slug" ON "site_pages" ("slug");
CREATE INDEX IF NOT EXISTS "idx_site_pages_status" ON "site_pages" ("status");
CREATE INDEX IF NOT EXISTS "idx_site_pages_template" ON "site_pages" ("template");
CREATE INDEX IF NOT EXISTS "idx_site_pages_is_public" ON "site_pages" ("is_public");
CREATE INDEX IF NOT EXISTS "idx_site_pages_published_at" ON "site_pages" ("published_at");

-- SITE_SETTINGS
CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" VARCHAR(255) NOT NULL,
  "setting_group" VARCHAR(255) DEFAULT 'general',
  "value" JSONB NOT NULL,
  "value_type" VARCHAR(255) DEFAULT 'string',
  "label" VARCHAR(255),
  "description" TEXT,
  "is_public" BOOLEAN DEFAULT false,
  "last_updated_by" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_site_settings_key" ON "site_settings" ("key");
CREATE INDEX IF NOT EXISTS "idx_site_settings_setting_group" ON "site_settings" ("setting_group");
CREATE INDEX IF NOT EXISTS "idx_site_settings_is_public" ON "site_settings" ("is_public");

-- WALLETS
CREATE TABLE IF NOT EXISTS "wallets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "balance" TEXT DEFAULT 0,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "pending_balance" TEXT DEFAULT 0,
  "total_credited" TEXT DEFAULT 0,
  "total_debited" TEXT DEFAULT 0,
  "total_refunded" TEXT DEFAULT 0,
  "status" VARCHAR(255) DEFAULT 'active',
  "is_verified" BOOLEAN DEFAULT false,
  "daily_limit" TEXT,
  "monthly_limit" TEXT,
  "max_balance" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_wallets_user_id" ON "wallets" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_wallets_status" ON "wallets" ("status");
CREATE INDEX IF NOT EXISTS "idx_wallets_currency" ON "wallets" ("currency");

-- WALLET_TRANSACTIONS
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "wallet_id" UUID NOT NULL REFERENCES "wallets"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "amount" TEXT NOT NULL,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "balance_before" TEXT NOT NULL,
  "balance_after" TEXT NOT NULL,
  "status" VARCHAR(255) DEFAULT 'completed',
  "reference_type" VARCHAR(255),
  "reference_id" VARCHAR(255),
  "external_reference" VARCHAR(255),
  "sender_wallet_id" UUID,
  "recipient_wallet_id" UUID,
  "description" VARCHAR(255),
  "notes" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_wallet_id" ON "wallet_transactions" ("wallet_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_user_id" ON "wallet_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_type" ON "wallet_transactions" ("type");
CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_status" ON "wallet_transactions" ("status");
CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_reference_type_reference_id" ON "wallet_transactions" ("reference_type", "reference_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_transactions_created_at" ON "wallet_transactions" ("created_at");

-- WALLET_TOPUPS
CREATE TABLE IF NOT EXISTS "wallet_topups" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "wallet_id" UUID NOT NULL REFERENCES "wallets"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "amount" TEXT NOT NULL,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "bonus_amount" TEXT DEFAULT 0,
  "bonus_percentage" TEXT,
  "payment_method" VARCHAR(255) NOT NULL,
  "payment_status" VARCHAR(255) DEFAULT 'pending',
  "payment_intent_id" VARCHAR(255),
  "payment_details" JSONB DEFAULT '{}',
  "status" VARCHAR(255) DEFAULT 'pending',
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "completed_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_wallet_topups_wallet_id" ON "wallet_topups" ("wallet_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_topups_user_id" ON "wallet_topups" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_topups_status" ON "wallet_topups" ("status");
CREATE INDEX IF NOT EXISTS "idx_wallet_topups_payment_status" ON "wallet_topups" ("payment_status");
CREATE INDEX IF NOT EXISTS "idx_wallet_topups_payment_intent_id" ON "wallet_topups" ("payment_intent_id");
CREATE INDEX IF NOT EXISTS "idx_wallet_topups_created_at" ON "wallet_topups" ("created_at");

-- WALLET_BONUSES
CREATE TABLE IF NOT EXISTS "wallet_bonuses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(255) NOT NULL,
  "bonus_type" VARCHAR(255) NOT NULL,
  "bonus_value" TEXT NOT NULL,
  "max_bonus" TEXT,
  "min_topup" TEXT,
  "max_topup" TEXT,
  "start_date" TIMESTAMPTZ,
  "end_date" TIMESTAMPTZ,
  "usage_limit" INTEGER,
  "usage_count" INTEGER DEFAULT 0,
  "per_user_limit" INTEGER DEFAULT 1,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_wallet_bonuses_type" ON "wallet_bonuses" ("type");
CREATE INDEX IF NOT EXISTS "idx_wallet_bonuses_is_active" ON "wallet_bonuses" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_wallet_bonuses_start_date" ON "wallet_bonuses" ("start_date");
CREATE INDEX IF NOT EXISTS "idx_wallet_bonuses_end_date" ON "wallet_bonuses" ("end_date");

-- REFUND_REQUESTS
CREATE TABLE IF NOT EXISTS "refund_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "reason" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "images" JSONB DEFAULT '[]',
  "amount_requested" TEXT NOT NULL,
  "amount_approved" TEXT,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "items" JSONB DEFAULT '[]',
  "status" VARCHAR(255) DEFAULT 'pending',
  "refund_method" VARCHAR(255),
  "refund_to_wallet" BOOLEAN DEFAULT false,
  "transaction_id" UUID,
  "reviewed_by" VARCHAR(255),
  "reviewed_at" TIMESTAMPTZ,
  "admin_notes" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "completed_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_refund_requests_order_id" ON "refund_requests" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_refund_requests_user_id" ON "refund_requests" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_refund_requests_shop_id" ON "refund_requests" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_refund_requests_status" ON "refund_requests" ("status");
CREATE INDEX IF NOT EXISTS "idx_refund_requests_created_at" ON "refund_requests" ("created_at");

-- REFUND_REASONS
CREATE TABLE IF NOT EXISTS "refund_reasons" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "requires_evidence" BOOLEAN DEFAULT false,
  "auto_approve" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_refund_reasons_code" ON "refund_reasons" ("code");
CREATE INDEX IF NOT EXISTS "idx_refund_reasons_is_active" ON "refund_reasons" ("is_active");

-- LOYALTY_POINTS
CREATE TABLE IF NOT EXISTS "loyalty_points" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "points_balance" INTEGER DEFAULT 0,
  "points_earned" INTEGER DEFAULT 0,
  "points_redeemed" INTEGER DEFAULT 0,
  "points_expired" INTEGER DEFAULT 0,
  "tier" VARCHAR(255) DEFAULT 'bronze',
  "tier_progress" INTEGER DEFAULT 0,
  "lifetime_points" INTEGER DEFAULT 0,
  "lifetime_value" TEXT DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_loyalty_points_user_id" ON "loyalty_points" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_points_tier" ON "loyalty_points" ("tier");
CREATE INDEX IF NOT EXISTS "idx_loyalty_points_points_balance" ON "loyalty_points" ("points_balance");

-- LOYALTY_TRANSACTIONS
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "points" INTEGER NOT NULL,
  "points_before" INTEGER NOT NULL,
  "points_after" INTEGER NOT NULL,
  "reference_type" VARCHAR(255),
  "reference_id" VARCHAR(255),
  "description" VARCHAR(255),
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_user_id" ON "loyalty_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_type" ON "loyalty_transactions" ("type");
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_reference_type_reference_id" ON "loyalty_transactions" ("reference_type", "reference_id");
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_expires_at" ON "loyalty_transactions" ("expires_at");
CREATE INDEX IF NOT EXISTS "idx_loyalty_transactions_created_at" ON "loyalty_transactions" ("created_at");

-- LOYALTY_TIERS
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "min_points" INTEGER NOT NULL,
  "multiplier" TEXT DEFAULT 1,
  "benefits" JSONB DEFAULT '[]',
  "icon" VARCHAR(255),
  "color" VARCHAR(255),
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_loyalty_tiers_slug" ON "loyalty_tiers" ("slug");
CREATE INDEX IF NOT EXISTS "idx_loyalty_tiers_min_points" ON "loyalty_tiers" ("min_points");
CREATE INDEX IF NOT EXISTS "idx_loyalty_tiers_is_active" ON "loyalty_tiers" ("is_active");

-- LOYALTY_RULES
CREATE TABLE IF NOT EXISTS "loyalty_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "points_type" VARCHAR(255) DEFAULT 'fixed',
  "points_value" TEXT NOT NULL,
  "per_amount" TEXT,
  "max_points" INTEGER,
  "conditions" JSONB DEFAULT '{}',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_loyalty_rules_type" ON "loyalty_rules" ("type");
CREATE INDEX IF NOT EXISTS "idx_loyalty_rules_is_active" ON "loyalty_rules" ("is_active");

-- SUBSCRIPTION_PLANS
CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "badge_color" VARCHAR(255),
  "price_monthly" TEXT NOT NULL,
  "price_yearly" TEXT,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "trial_days" INTEGER DEFAULT 0,
  "max_products" INTEGER,
  "max_orders_per_month" INTEGER,
  "max_team_members" INTEGER DEFAULT 1,
  "commission_rate" TEXT DEFAULT 0,
  "features" JSONB DEFAULT '[]',
  "has_analytics" BOOLEAN DEFAULT false,
  "has_priority_support" BOOLEAN DEFAULT false,
  "has_custom_domain" BOOLEAN DEFAULT false,
  "has_api_access" BOOLEAN DEFAULT false,
  "has_bulk_upload" BOOLEAN DEFAULT false,
  "has_promotions" BOOLEAN DEFAULT true,
  "is_active" BOOLEAN DEFAULT true,
  "is_featured" BOOLEAN DEFAULT false,
  "sort_order" INTEGER DEFAULT 0,
  "stripe_price_id_monthly" VARCHAR(255),
  "stripe_price_id_yearly" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_subscription_plans_slug" ON "subscription_plans" ("slug");
CREATE INDEX IF NOT EXISTS "idx_subscription_plans_is_active" ON "subscription_plans" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_subscription_plans_sort_order" ON "subscription_plans" ("sort_order");

-- SHOP_SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS "shop_subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "plan_id" UUID NOT NULL REFERENCES "subscription_plans"(id) ON DELETE CASCADE,
  "billing_cycle" VARCHAR(255) NOT NULL,
  "current_period_start" TIMESTAMPTZ NOT NULL,
  "current_period_end" TIMESTAMPTZ NOT NULL,
  "trial_ends_at" TIMESTAMPTZ,
  "status" VARCHAR(255) DEFAULT 'active',
  "cancel_at_period_end" BOOLEAN DEFAULT false,
  "cancelled_at" TIMESTAMPTZ,
  "stripe_subscription_id" VARCHAR(255),
  "stripe_customer_id" VARCHAR(255),
  "last_payment_at" TIMESTAMPTZ,
  "next_payment_at" TIMESTAMPTZ,
  "products_used" INTEGER DEFAULT 0,
  "orders_this_month" INTEGER DEFAULT 0,
  "usage_reset_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_shop_subscriptions_shop_id" ON "shop_subscriptions" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_shop_subscriptions_plan_id" ON "shop_subscriptions" ("plan_id");
CREATE INDEX IF NOT EXISTS "idx_shop_subscriptions_status" ON "shop_subscriptions" ("status");
CREATE INDEX IF NOT EXISTS "idx_shop_subscriptions_current_period_end" ON "shop_subscriptions" ("current_period_end");
CREATE INDEX IF NOT EXISTS "idx_shop_subscriptions_stripe_subscription_id" ON "shop_subscriptions" ("stripe_subscription_id");

-- SUBSCRIPTION_INVOICES
CREATE TABLE IF NOT EXISTS "subscription_invoices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscription_id" UUID NOT NULL REFERENCES "shop_subscriptions"(id) ON DELETE CASCADE,
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "invoice_number" VARCHAR(255) NOT NULL,
  "amount" TEXT NOT NULL,
  "currency" VARCHAR(255) DEFAULT 'USD',
  "tax_amount" TEXT DEFAULT 0,
  "total_amount" TEXT NOT NULL,
  "period_start" TIMESTAMPTZ NOT NULL,
  "period_end" TIMESTAMPTZ NOT NULL,
  "status" VARCHAR(255) DEFAULT 'pending',
  "paid_at" TIMESTAMPTZ,
  "stripe_invoice_id" VARCHAR(255),
  "stripe_payment_intent_id" VARCHAR(255),
  "invoice_pdf_url" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_subscription_id" ON "subscription_invoices" ("subscription_id");
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_shop_id" ON "subscription_invoices" ("shop_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_subscription_invoices_invoice_number" ON "subscription_invoices" ("invoice_number");
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_status" ON "subscription_invoices" ("status");
CREATE INDEX IF NOT EXISTS "idx_subscription_invoices_stripe_invoice_id" ON "subscription_invoices" ("stripe_invoice_id");

-- CASHBACK_RULES
CREATE TABLE IF NOT EXISTS "cashback_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(255) NOT NULL,
  "value" TEXT NOT NULL,
  "max_cashback" TEXT,
  "min_order_amount" TEXT DEFAULT 0,
  "applies_to" VARCHAR(255) DEFAULT 'all',
  "category_ids" JSONB DEFAULT '[]',
  "product_ids" JSONB DEFAULT '[]',
  "shop_ids" JSONB DEFAULT '[]',
  "user_type" VARCHAR(255) DEFAULT 'all',
  "loyalty_tiers" JSONB DEFAULT '[]',
  "start_date" TIMESTAMPTZ,
  "end_date" TIMESTAMPTZ,
  "usage_limit" INTEGER,
  "usage_count" INTEGER DEFAULT 0,
  "per_user_limit" INTEGER,
  "is_active" BOOLEAN DEFAULT true,
  "priority" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_cashback_rules_is_active" ON "cashback_rules" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_cashback_rules_applies_to" ON "cashback_rules" ("applies_to");
CREATE INDEX IF NOT EXISTS "idx_cashback_rules_start_date" ON "cashback_rules" ("start_date");
CREATE INDEX IF NOT EXISTS "idx_cashback_rules_end_date" ON "cashback_rules" ("end_date");
CREATE INDEX IF NOT EXISTS "idx_cashback_rules_priority" ON "cashback_rules" ("priority");

-- CASHBACK_TRANSACTIONS
CREATE TABLE IF NOT EXISTS "cashback_transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "order_id" UUID NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "rule_id" UUID REFERENCES "cashback_rules"(id) ON DELETE CASCADE,
  "order_amount" TEXT NOT NULL,
  "cashback_amount" TEXT NOT NULL,
  "cashback_type" VARCHAR(255) NOT NULL,
  "cashback_value" TEXT NOT NULL,
  "status" VARCHAR(255) DEFAULT 'pending',
  "credited_at" TIMESTAMPTZ,
  "wallet_transaction_id" UUID,
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_cashback_transactions_user_id" ON "cashback_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_cashback_transactions_order_id" ON "cashback_transactions" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_cashback_transactions_rule_id" ON "cashback_transactions" ("rule_id");
CREATE INDEX IF NOT EXISTS "idx_cashback_transactions_status" ON "cashback_transactions" ("status");
CREATE INDEX IF NOT EXISTS "idx_cashback_transactions_created_at" ON "cashback_transactions" ("created_at");

-- REFERRAL_CONFIG
CREATE TABLE IF NOT EXISTS "referral_config" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrer_reward_type" VARCHAR(255) DEFAULT 'wallet',
  "referrer_reward_amount" TEXT NOT NULL,
  "referrer_reward_currency" VARCHAR(255) DEFAULT 'USD',
  "referee_reward_type" VARCHAR(255) DEFAULT 'wallet',
  "referee_reward_amount" TEXT NOT NULL,
  "referee_min_order" TEXT DEFAULT 0,
  "require_first_purchase" BOOLEAN DEFAULT true,
  "min_purchase_amount" TEXT DEFAULT 0,
  "max_referrals_per_user" INTEGER,
  "reward_validity_days" INTEGER DEFAULT 30,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_referral_config_is_active" ON "referral_config" ("is_active");

-- REFERRAL_CODES
CREATE TABLE IF NOT EXISTS "referral_codes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "code" VARCHAR(255) NOT NULL,
  "custom_code" BOOLEAN DEFAULT false,
  "total_referrals" INTEGER DEFAULT 0,
  "successful_referrals" INTEGER DEFAULT 0,
  "total_earned" TEXT DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_referral_codes_user_id" ON "referral_codes" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_referral_codes_code" ON "referral_codes" ("code");
CREATE INDEX IF NOT EXISTS "idx_referral_codes_is_active" ON "referral_codes" ("is_active");

-- REFERRALS
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrer_id" VARCHAR(255) NOT NULL,
  "referee_id" VARCHAR(255) NOT NULL,
  "referral_code_id" UUID NOT NULL REFERENCES "referral_codes"(id) ON DELETE CASCADE,
  "status" VARCHAR(255) DEFAULT 'pending',
  "first_order_id" UUID REFERENCES "orders"(id) ON DELETE CASCADE,
  "first_order_amount" TEXT,
  "first_order_at" TIMESTAMPTZ,
  "referrer_reward_amount" TEXT,
  "referrer_rewarded_at" TIMESTAMPTZ,
  "referee_reward_amount" TEXT,
  "referee_rewarded_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_referrals_referrer_id" ON "referrals" ("referrer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_referrals_referee_id" ON "referrals" ("referee_id");
CREATE INDEX IF NOT EXISTS "idx_referrals_referral_code_id" ON "referrals" ("referral_code_id");
CREATE INDEX IF NOT EXISTS "idx_referrals_status" ON "referrals" ("status");
CREATE INDEX IF NOT EXISTS "idx_referrals_created_at" ON "referrals" ("created_at");

-- EMAIL_TEMPLATES
CREATE TABLE IF NOT EXISTS "email_templates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "html_body" TEXT NOT NULL,
  "text_body" TEXT,
  "variables" JSONB DEFAULT '[]',
  "from_name" VARCHAR(255),
  "from_email" VARCHAR(255),
  "reply_to" VARCHAR(255),
  "is_active" BOOLEAN DEFAULT true,
  "is_system" BOOLEAN DEFAULT false,
  "version" INTEGER DEFAULT 1,
  "last_edited_by" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_templates_slug" ON "email_templates" ("slug");
CREATE INDEX IF NOT EXISTS "idx_email_templates_category" ON "email_templates" ("category");
CREATE INDEX IF NOT EXISTS "idx_email_templates_is_active" ON "email_templates" ("is_active");

-- DELIVERY_MEN
CREATE TABLE IF NOT EXISTS "delivery_men" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255),
  "name" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(255),
  "last_name" VARCHAR(255),
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "image_url" VARCHAR(255),
  "address" JSONB DEFAULT '{}',
  "type" VARCHAR(255) DEFAULT 'freelancer',
  "vehicle_type" VARCHAR(255),
  "vehicle_number" VARCHAR(255),
  "vehicle_model" VARCHAR(255),
  "vehicle_color" VARCHAR(255),
  "identity_type" VARCHAR(255),
  "identity_number" VARCHAR(255),
  "identity_images" JSONB DEFAULT '[]',
  "is_verified" BOOLEAN DEFAULT false,
  "current_location" JSONB,
  "availability" VARCHAR(255) DEFAULT 'offline',
  "zone_id" VARCHAR(255),
  "min_delivery_distance" TEXT,
  "max_delivery_distance" TEXT,
  "rating" TEXT DEFAULT 0,
  "total_reviews" INTEGER DEFAULT 0,
  "total_deliveries" INTEGER DEFAULT 0,
  "completed_deliveries" INTEGER DEFAULT 0,
  "cancelled_deliveries" INTEGER DEFAULT 0,
  "total_earnings" TEXT DEFAULT 0,
  "pending_earnings" TEXT DEFAULT 0,
  "withdrawn_earnings" TEXT DEFAULT 0,
  "cash_in_hand" TEXT DEFAULT 0,
  "bank_name" VARCHAR(255),
  "bank_account_number" VARCHAR(255),
  "bank_routing_number" VARCHAR(255),
  "bank_account_holder" VARCHAR(255),
  "stripe_account_id" VARCHAR(255),
  "stripe_connect_status" VARCHAR(255),
  "stripe_charges_enabled" BOOLEAN DEFAULT false,
  "stripe_payouts_enabled" BOOLEAN DEFAULT false,
  "stripe_requirements" JSONB,
  "stripe_verification_deadline" TIMESTAMPTZ,
  "status" VARCHAR(255) DEFAULT 'pending',
  "approved_at" TIMESTAMPTZ,
  "approved_by" VARCHAR(255),
  "settings" JSONB DEFAULT '{}',
  "notification_preferences" JSONB DEFAULT '{}',
  "is_deleted" BOOLEAN DEFAULT false,
  "deleted_at" TIMESTAMPTZ,
  "deleted_by" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_men_user_id" ON "delivery_men" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_delivery_men_email" ON "delivery_men" ("email");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_phone" ON "delivery_men" ("phone");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_availability" ON "delivery_men" ("availability");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_status" ON "delivery_men" ("status");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_zone_id" ON "delivery_men" ("zone_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_rating" ON "delivery_men" ("rating");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_is_deleted" ON "delivery_men" ("is_deleted");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_stripe_account_id" ON "delivery_men" ("stripe_account_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_men_stripe_connect_status" ON "delivery_men" ("stripe_connect_status");

-- DELIVERY_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS "delivery_assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "delivery_man_id" UUID NOT NULL REFERENCES "delivery_men"(id) ON DELETE CASCADE,
  "shop_id" UUID REFERENCES "shops"(id) ON DELETE CASCADE,
  "assigned_by" VARCHAR(255),
  "assigned_at" TIMESTAMPTZ DEFAULT now(),
  "status" VARCHAR(255) DEFAULT 'assigned',
  "status_updated_at" TIMESTAMPTZ DEFAULT now(),
  "pickup_address" JSONB DEFAULT '{}',
  "pickup_contact" JSONB DEFAULT '{}',
  "picked_up_at" TIMESTAMPTZ,
  "delivery_address" JSONB DEFAULT '{}',
  "delivery_contact" JSONB DEFAULT '{}',
  "delivered_at" TIMESTAMPTZ,
  "estimated_distance" TEXT,
  "actual_distance" TEXT,
  "estimated_duration" INTEGER,
  "actual_duration" INTEGER,
  "delivery_fee" TEXT DEFAULT 0,
  "tip" TEXT DEFAULT 0,
  "total_earnings" TEXT DEFAULT 0,
  "proof_of_delivery" JSONB DEFAULT '{}',
  "notes" TEXT,
  "rejection_reason" TEXT,
  "cancellation_reason" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_assignments_order_id" ON "delivery_assignments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_assignments_delivery_man_id" ON "delivery_assignments" ("delivery_man_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_assignments_shop_id" ON "delivery_assignments" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_assignments_status" ON "delivery_assignments" ("status");
CREATE INDEX IF NOT EXISTS "idx_delivery_assignments_assigned_at" ON "delivery_assignments" ("assigned_at");
CREATE INDEX IF NOT EXISTS "idx_delivery_assignments_delivery_man_id_status" ON "delivery_assignments" ("delivery_man_id", "status");

-- EMAIL_LOGS
CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "template_id" UUID REFERENCES "email_templates"(id) ON DELETE CASCADE,
  "to_email" VARCHAR(255) NOT NULL,
  "to_name" VARCHAR(255),
  "user_id" VARCHAR(255),
  "subject" VARCHAR(255) NOT NULL,
  "template_slug" VARCHAR(255),
  "status" VARCHAR(255) DEFAULT 'sent',
  "error_message" TEXT,
  "opened_at" TIMESTAMPTZ,
  "clicked_at" TIMESTAMPTZ,
  "bounced_at" TIMESTAMPTZ,
  "provider" VARCHAR(255),
  "provider_message_id" VARCHAR(255),
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_email_logs_to_email" ON "email_logs" ("to_email");
CREATE INDEX IF NOT EXISTS "idx_email_logs_user_id" ON "email_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_logs_template_id" ON "email_logs" ("template_id");
CREATE INDEX IF NOT EXISTS "idx_email_logs_status" ON "email_logs" ("status");
CREATE INDEX IF NOT EXISTS "idx_email_logs_created_at" ON "email_logs" ("created_at");

-- DELIVERY_ZONES
CREATE TABLE IF NOT EXISTS "delivery_zones" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID REFERENCES "shops"(id) ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(255) DEFAULT 'polygon',
  "coordinates" JSONB,
  "center" JSONB,
  "radius" TEXT,
  "city" VARCHAR(255),
  "state" VARCHAR(255),
  "country" VARCHAR(255),
  "postal_codes" JSONB,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_zones_shop_id" ON "delivery_zones" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_zones_name" ON "delivery_zones" ("name");
CREATE INDEX IF NOT EXISTS "idx_delivery_zones_type" ON "delivery_zones" ("type");
CREATE INDEX IF NOT EXISTS "idx_delivery_zones_is_active" ON "delivery_zones" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_delivery_zones_sort_order" ON "delivery_zones" ("sort_order");

-- ZONE_DELIVERY_OPTIONS
CREATE TABLE IF NOT EXISTS "zone_delivery_options" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "zone_id" UUID NOT NULL REFERENCES "delivery_zones"(id) ON DELETE CASCADE,
  "delivery_type" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "base_fee" TEXT DEFAULT 0,
  "per_km_fee" TEXT,
  "free_delivery_minimum" TEXT,
  "min_delivery_time" INTEGER,
  "max_delivery_time" INTEGER,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_zone_delivery_options_zone_id" ON "zone_delivery_options" ("zone_id");
CREATE INDEX IF NOT EXISTS "idx_zone_delivery_options_delivery_type" ON "zone_delivery_options" ("delivery_type");
CREATE INDEX IF NOT EXISTS "idx_zone_delivery_options_is_active" ON "zone_delivery_options" ("is_active");

-- SHOP_ZONES
CREATE TABLE IF NOT EXISTS "shop_zones" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shop_id" UUID NOT NULL REFERENCES "shops"(id) ON DELETE CASCADE,
  "zone_id" UUID NOT NULL REFERENCES "delivery_zones"(id) ON DELETE CASCADE,
  "base_fee_override" TEXT,
  "min_delivery_time_override" INTEGER,
  "max_delivery_time_override" INTEGER,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_shop_zones_shop_id" ON "shop_zones" ("shop_id");
CREATE INDEX IF NOT EXISTS "idx_shop_zones_zone_id" ON "shop_zones" ("zone_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_shop_zones_shop_id_zone_id" ON "shop_zones" ("shop_id", "zone_id");
CREATE INDEX IF NOT EXISTS "idx_shop_zones_is_active" ON "shop_zones" ("is_active");

-- DELIVERY_MAN_ZONES
CREATE TABLE IF NOT EXISTS "delivery_man_zones" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "delivery_man_id" UUID NOT NULL REFERENCES "delivery_men"(id) ON DELETE CASCADE,
  "zone_id" UUID NOT NULL REFERENCES "delivery_zones"(id) ON DELETE CASCADE,
  "is_primary" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_man_zones_delivery_man_id" ON "delivery_man_zones" ("delivery_man_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_zones_zone_id" ON "delivery_man_zones" ("zone_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_delivery_man_zones_delivery_man_id_zone_id" ON "delivery_man_zones" ("delivery_man_id", "zone_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_zones_is_active" ON "delivery_man_zones" ("is_active");

-- DELIVERY_MAN_REVIEWS
CREATE TABLE IF NOT EXISTS "delivery_man_reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "delivery_man_id" UUID NOT NULL REFERENCES "delivery_men"(id) ON DELETE CASCADE,
  "order_id" UUID NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "customer_id" VARCHAR(255) NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_man_reviews_delivery_man_id" ON "delivery_man_reviews" ("delivery_man_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_reviews_order_id" ON "delivery_man_reviews" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_reviews_customer_id" ON "delivery_man_reviews" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_reviews_rating" ON "delivery_man_reviews" ("rating");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_reviews_created_at" ON "delivery_man_reviews" ("created_at");

-- DELIVERY_MAN_WITHDRAWALS
CREATE TABLE IF NOT EXISTS "delivery_man_withdrawals" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "delivery_man_id" UUID NOT NULL REFERENCES "delivery_men"(id) ON DELETE CASCADE,
  "amount" TEXT NOT NULL,
  "payment_method" VARCHAR(255),
  "payment_details" JSONB DEFAULT '{}',
  "status" VARCHAR(255) DEFAULT 'pending',
  "processed_by" VARCHAR(255),
  "processed_at" TIMESTAMPTZ,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_man_withdrawals_delivery_man_id" ON "delivery_man_withdrawals" ("delivery_man_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_withdrawals_status" ON "delivery_man_withdrawals" ("status");
CREATE INDEX IF NOT EXISTS "idx_delivery_man_withdrawals_created_at" ON "delivery_man_withdrawals" ("created_at");

-- DELIVERY_LOCATION_LOGS
CREATE TABLE IF NOT EXISTS "delivery_location_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "delivery_man_id" UUID NOT NULL REFERENCES "delivery_men"(id) ON DELETE CASCADE,
  "assignment_id" UUID REFERENCES "delivery_assignments"(id) ON DELETE CASCADE,
  "lat" TEXT NOT NULL,
  "lng" TEXT NOT NULL,
  "heading" TEXT,
  "speed" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_delivery_location_logs_delivery_man_id" ON "delivery_location_logs" ("delivery_man_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_location_logs_assignment_id" ON "delivery_location_logs" ("assignment_id");
CREATE INDEX IF NOT EXISTS "idx_delivery_location_logs_created_at" ON "delivery_location_logs" ("created_at");

-- BLOG_CATEGORIES
CREATE TABLE IF NOT EXISTS "blog_categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "image_url" VARCHAR(255),
  "parent_id" UUID REFERENCES "blog_categories"(id) ON DELETE CASCADE,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_blog_categories_slug" ON "blog_categories" ("slug");
CREATE INDEX IF NOT EXISTS "idx_blog_categories_parent_id" ON "blog_categories" ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_blog_categories_is_active" ON "blog_categories" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_blog_categories_sort_order" ON "blog_categories" ("sort_order");

-- BLOG_POSTS
CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "excerpt" TEXT,
  "status" VARCHAR(255) DEFAULT 'draft',
  "category" VARCHAR(255),
  "author" VARCHAR(255),
  "tags" JSONB DEFAULT '[]',
  "image_urls" JSONB DEFAULT '[]',
  "meta_title" VARCHAR(255),
  "meta_description" TEXT,
  "featured" BOOLEAN DEFAULT false,
  "views_count" INTEGER DEFAULT 0,
  "likes_count" INTEGER DEFAULT 0,
  "comments_count" INTEGER DEFAULT 0,
  "rating" TEXT DEFAULT 0,
  "rating_count" INTEGER DEFAULT 0,
  "published_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "deleted_at" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_blog_posts_user_id" ON "blog_posts" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_blog_posts_slug" ON "blog_posts" ("slug");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_status" ON "blog_posts" ("status");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_category" ON "blog_posts" ("category");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_featured" ON "blog_posts" ("featured");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_published_at" ON "blog_posts" ("published_at");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_created_at" ON "blog_posts" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_views_count" ON "blog_posts" ("views_count");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_likes_count" ON "blog_posts" ("likes_count");

-- BLOG_COMMENTS
CREATE TABLE IF NOT EXISTS "blog_comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL REFERENCES "blog_posts"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "parent_id" UUID REFERENCES "blog_comments"(id) ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "status" VARCHAR(255) DEFAULT 'approved',
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_blog_comments_post_id" ON "blog_comments" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_blog_comments_user_id" ON "blog_comments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_blog_comments_parent_id" ON "blog_comments" ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_blog_comments_status" ON "blog_comments" ("status");
CREATE INDEX IF NOT EXISTS "idx_blog_comments_created_at" ON "blog_comments" ("created_at");

-- BLOG_LIKES
CREATE TABLE IF NOT EXISTS "blog_likes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL REFERENCES "blog_posts"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_blog_likes_post_id" ON "blog_likes" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_blog_likes_user_id" ON "blog_likes" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_blog_likes_post_id_user_id" ON "blog_likes" ("post_id", "user_id");

-- BLOG_RATINGS
CREATE TABLE IF NOT EXISTS "blog_ratings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL REFERENCES "blog_posts"(id) ON DELETE CASCADE,
  "user_id" VARCHAR(255) NOT NULL,
  "rating" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_blog_ratings_post_id" ON "blog_ratings" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_blog_ratings_user_id" ON "blog_ratings" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_blog_ratings_post_id_user_id" ON "blog_ratings" ("post_id", "user_id");

-- Migration: Add mobile_app_config fields to shops table
-- Purpose: Add separate mobile app configuration fields (independent from web storefront)
-- Date: 2024-12-25

-- Add mobile app configuration fields
ALTER TABLE shops
ADD COLUMN IF NOT EXISTS mobile_app_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mobile_app_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mobile_app_published_at TIMESTAMPTZ;

-- Add comments to document the fields
COMMENT ON COLUMN shops.mobile_app_config IS 'Mobile app configuration (one unified app with customer, delivery, vendor panels - separate from web storefront)';
COMMENT ON COLUMN shops.mobile_app_published IS 'Whether mobile app is published and visible to end users';
COMMENT ON COLUMN shops.mobile_app_published_at IS 'Timestamp when mobile app was last published';

-- Optional: Create an index on published status for faster queries
CREATE INDEX IF NOT EXISTS idx_shops_mobile_app_published ON shops(mobile_app_published) WHERE mobile_app_published = true;

-- Product Bundles Migration
-- Adds product_bundles and bundle_items tables for bundling capability

CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  bundle_type VARCHAR(20) NOT NULL DEFAULT 'fixed',   -- 'fixed' or 'dynamic'
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed_amount'
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_selections INTEGER,  -- for dynamic bundles
  max_selections INTEGER,  -- for dynamic bundles
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_product_bundles_vendor ON product_bundles(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_bundles_active ON product_bundles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON bundle_items(product_id);

-- Migration: Create delivery_methods table
-- Generated: 2025-12-18
-- Description: Creates the delivery_methods table for shop-specific delivery method configurations
-- Note: Run this SQL in your Fluxez dashboard or database console to create the table

-- Create delivery_methods table
CREATE TABLE IF NOT EXISTS public.delivery_methods (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Shop Reference (shop-specific delivery methods)
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,

  -- Method Details
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- standard, express, overnight, pickup, same_day
  description TEXT,

  -- Pricing
  base_cost NUMERIC DEFAULT 0 NOT NULL,
  cost_per_kg NUMERIC,
  free_shipping_threshold NUMERIC,

  -- Timing
  estimated_days VARCHAR, -- "3-5" or "1"
  cutoff_time TIME, -- Orders after this time ship next day

  -- Carrier
  carrier VARCHAR, -- fedex, ups, usps, dhl, local
  tracking_enabled BOOLEAN DEFAULT TRUE NOT NULL,

  -- Zones
  zones JSONB DEFAULT '["domestic"]'::JSONB NOT NULL, -- Array of zones: domestic, international, local

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_delivery_methods_shop_id ON public.delivery_methods(shop_id);
CREATE INDEX IF NOT EXISTS idx_delivery_methods_type ON public.delivery_methods(type);
CREATE INDEX IF NOT EXISTS idx_delivery_methods_is_active ON public.delivery_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_methods_sort_order ON public.delivery_methods(sort_order);

-- Add comments for documentation
COMMENT ON TABLE public.delivery_methods IS 'Stores shop-specific delivery methods with pricing and configuration';
COMMENT ON COLUMN public.delivery_methods.shop_id IS 'Reference to the shop that owns this delivery method';
COMMENT ON COLUMN public.delivery_methods.name IS 'Display name for the delivery method';
COMMENT ON COLUMN public.delivery_methods.type IS 'Delivery method type: standard, express, overnight, pickup, same_day';
COMMENT ON COLUMN public.delivery_methods.base_cost IS 'Base cost for this delivery method';
COMMENT ON COLUMN public.delivery_methods.estimated_days IS 'Estimated delivery time (e.g., "3-5" or "1")';
COMMENT ON COLUMN public.delivery_methods.carrier IS 'Carrier name: fedex, ups, usps, dhl, local';
COMMENT ON COLUMN public.delivery_methods.tracking_enabled IS 'Whether tracking is available for this method';
COMMENT ON COLUMN public.delivery_methods.zones IS 'JSON array of delivery zones: domestic, international, local';
COMMENT ON COLUMN public.delivery_methods.is_active IS 'Whether this method is currently available';
COMMENT ON COLUMN public.delivery_methods.sort_order IS 'Display order (lower = shown first)';

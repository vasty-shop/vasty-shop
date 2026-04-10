-- Migration: Create shipping_methods table
-- Generated: 2025-10-29
-- Description: Creates the shipping_methods table for managing various shipping options
-- Note: This SQL is for reference. Actual migrations are handled by Fluxez SDK via schema.ts

-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Method Identification
  type VARCHAR NOT NULL, -- standard, express, overnight, pickup, same_day
  name VARCHAR NOT NULL, -- Internal name
  display_name VARCHAR NOT NULL, -- Customer-facing name

  -- Cost Information
  base_cost NUMERIC DEFAULT 0 NOT NULL, -- Base shipping cost
  free_shipping_threshold NUMERIC, -- Free shipping if order exceeds this amount

  -- Time Estimates
  estimated_days INTEGER, -- Min-max range in calendar days
  estimated_business_days INTEGER, -- Min-max range in business days
  duration VARCHAR, -- Human-readable: "3-5 business days", "Next day", etc.

  -- Display Information
  description TEXT, -- Detailed description for customers
  icon VARCHAR, -- Icon identifier or emoji
  features JSONB DEFAULT '[]'::JSONB NOT NULL, -- Array of feature strings

  -- Availability & Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  available_countries JSONB DEFAULT '[]'::JSONB NOT NULL, -- Array of country codes, empty = all countries
  display_order INTEGER DEFAULT 0 NOT NULL,

  -- Requirements
  requires_signature BOOLEAN DEFAULT FALSE NOT NULL,
  min_weight NUMERIC, -- In kg
  max_weight NUMERIC, -- In kg
  min_order_value NUMERIC, -- Minimum order value to use this method

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shipping_methods_type ON public.shipping_methods(type);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_is_active ON public.shipping_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_display_order ON public.shipping_methods(display_order);

-- Add comments for documentation
COMMENT ON TABLE public.shipping_methods IS 'Stores available shipping methods with pricing, delivery estimates, and requirements';
COMMENT ON COLUMN public.shipping_methods.type IS 'Shipping method type: standard, express, overnight, pickup, same_day';
COMMENT ON COLUMN public.shipping_methods.name IS 'Internal name for the shipping method';
COMMENT ON COLUMN public.shipping_methods.display_name IS 'Customer-facing display name';
COMMENT ON COLUMN public.shipping_methods.base_cost IS 'Base cost for this shipping method in USD';
COMMENT ON COLUMN public.shipping_methods.free_shipping_threshold IS 'Order value threshold for free shipping (null = never free)';
COMMENT ON COLUMN public.shipping_methods.estimated_days IS 'Estimated delivery time in calendar days';
COMMENT ON COLUMN public.shipping_methods.estimated_business_days IS 'Estimated delivery time in business days';
COMMENT ON COLUMN public.shipping_methods.duration IS 'Human-readable duration string shown to customers';
COMMENT ON COLUMN public.shipping_methods.description IS 'Detailed description explaining the shipping method';
COMMENT ON COLUMN public.shipping_methods.icon IS 'Icon identifier or emoji for UI display';
COMMENT ON COLUMN public.shipping_methods.features IS 'JSON array of feature strings (e.g., ["Tracking included", "Signature required"])';
COMMENT ON COLUMN public.shipping_methods.is_active IS 'Whether this shipping method is currently available';
COMMENT ON COLUMN public.shipping_methods.available_countries IS 'JSON array of ISO country codes (empty = available everywhere)';
COMMENT ON COLUMN public.shipping_methods.display_order IS 'Order in which to display shipping methods (lower = shown first)';
COMMENT ON COLUMN public.shipping_methods.requires_signature IS 'Whether signature is required on delivery';
COMMENT ON COLUMN public.shipping_methods.min_weight IS 'Minimum package weight in kg (null = no minimum)';
COMMENT ON COLUMN public.shipping_methods.max_weight IS 'Maximum package weight in kg (null = no maximum)';
COMMENT ON COLUMN public.shipping_methods.min_order_value IS 'Minimum order value required to use this method (null = no minimum)';

-- Migration: Create digital products tables
-- Generated: 2026-04-11
-- Description: Adds tables for digital file delivery, download tracking, and license key management

-- 1. product_digital_files: stores digital file metadata for products
CREATE TABLE IF NOT EXISTS public.product_digital_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,        -- storage key in R2/S3
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type VARCHAR NOT NULL DEFAULT 'application/octet-stream',
  download_limit INTEGER,            -- NULL = unlimited
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_digital_files_product_id ON public.product_digital_files(product_id);

-- 2. product_downloads: tracks each download event
CREATE TABLE IF NOT EXISTS public.product_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  user_id VARCHAR NOT NULL,
  file_id UUID NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR
);

CREATE INDEX IF NOT EXISTS idx_product_downloads_order_id ON public.product_downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_product_downloads_product_id ON public.product_downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_product_downloads_user_id ON public.product_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_product_downloads_file_id ON public.product_downloads(file_id);

-- 3. product_licenses: license keys for digital products
CREATE TABLE IF NOT EXISTS public.product_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  order_id UUID,
  user_id VARCHAR,
  license_key VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_licenses_key ON public.product_licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_product_licenses_product_id ON public.product_licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_product_licenses_order_id ON public.product_licenses(order_id);

-- 4. Add is_digital flag to products table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_digital'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_digital BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END
$$;

COMMENT ON TABLE public.product_digital_files IS 'Digital file attachments for products (e-books, software, etc.)';
COMMENT ON TABLE public.product_downloads IS 'Tracks download events for purchased digital products';
COMMENT ON TABLE public.product_licenses IS 'License keys generated and assigned for digital products';

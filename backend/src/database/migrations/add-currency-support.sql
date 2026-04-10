-- Currency Support Migration
-- Adds currency fields to relevant tables

-- ============================================
-- 1. Add currency preference to users (via metadata)
-- ============================================
-- Note: Users are stored in Fluxez auth.users table
-- We'll use the raw_user_meta_data JSONB field to store:
-- {
--   "preferred_currency": "USD",
--   "detected_currency": "USD",
--   "currency_history": ["USD", "CAD"]
-- }

-- ============================================
-- 2. Add currency fields to shops table
-- ============================================
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS accepted_currencies JSONB DEFAULT '["USD"]'::jsonb,
ADD COLUMN IF NOT EXISTS auto_currency_conversion BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_shops_default_currency ON public.shops(default_currency);

COMMENT ON COLUMN public.shops.default_currency IS 'Default currency for the shop (ISO 4217 code)';
COMMENT ON COLUMN public.shops.accepted_currencies IS 'Array of accepted currency codes';
COMMENT ON COLUMN public.shops.auto_currency_conversion IS 'Enable automatic currency conversion';

-- ============================================
-- 3. Products table already has price field
-- We'll add support for multi-currency pricing
-- ============================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS multi_currency_prices JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_price_currency ON public.products(price_currency);

COMMENT ON COLUMN public.products.price_currency IS 'Base currency for the product price';
COMMENT ON COLUMN public.products.multi_currency_prices IS 'Multi-currency pricing: {"USD": 100, "EUR": 92, "JPY": 14950}';

-- ============================================
-- 4. Orders table - currency field already exists
-- Add exchange rate tracking
-- ============================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 6) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS converted_amounts JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_orders_currency ON public.orders(currency);
CREATE INDEX IF NOT EXISTS idx_orders_base_currency ON public.orders(base_currency);

COMMENT ON COLUMN public.orders.exchange_rate IS 'Exchange rate used at the time of order (relative to base currency)';
COMMENT ON COLUMN public.orders.base_currency IS 'Base currency for the platform (usually USD)';
COMMENT ON COLUMN public.orders.converted_amounts IS 'Amounts in different currencies: {"subtotal_usd": 100, "total_eur": 92}';

-- ============================================
-- 5. Payment transactions - currency field exists
-- Add exchange rate tracking
-- ============================================
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 6) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS amount_in_base_currency NUMERIC(10, 2);

COMMENT ON COLUMN public.payment_transactions.exchange_rate IS 'Exchange rate at the time of transaction';
COMMENT ON COLUMN public.payment_transactions.amount_in_base_currency IS 'Transaction amount in platform base currency (USD)';

-- ============================================
-- 6. Create currencies configuration table
-- ============================================
CREATE TABLE IF NOT EXISTS public.currencies (
  code VARCHAR(3) PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  decimal_places INTEGER NOT NULL DEFAULT 2,
  symbol_position VARCHAR(10) NOT NULL DEFAULT 'before',
  thousand_separator VARCHAR(5) NOT NULL DEFAULT ',',
  decimal_separator VARCHAR(5) NOT NULL DEFAULT '.',
  symbol_spacing BOOLEAN DEFAULT false,
  exchange_rate NUMERIC(10, 6) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  is_crypto BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 100,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_currencies_active ON public.currencies(is_active);
CREATE INDEX IF NOT EXISTS idx_currencies_priority ON public.currencies(priority);

COMMENT ON TABLE public.currencies IS 'Supported currencies configuration';

-- ============================================
-- 7. Insert default currencies
-- ============================================
INSERT INTO public.currencies (code, symbol, name, decimal_places, symbol_position, exchange_rate, is_active, priority) VALUES
('USD', '$', 'US Dollar', 2, 'before', 1.0, true, 1),
('CAD', '$', 'Canadian Dollar', 2, 'before', 1.35, true, 2),
('EUR', '€', 'Euro', 2, 'before', 0.92, true, 3),
('GBP', '£', 'British Pound', 2, 'before', 0.79, true, 4),
('JPY', '¥', 'Japanese Yen', 0, 'before', 149.5, true, 5),
('BDT', '৳', 'Bangladeshi Taka', 2, 'before', 110.0, true, 6),
('AUD', '$', 'Australian Dollar', 2, 'before', 1.52, true, 7),
('INR', '₹', 'Indian Rupee', 2, 'before', 83.0, true, 8)
ON CONFLICT (code) DO UPDATE SET
  exchange_rate = EXCLUDED.exchange_rate,
  updated_at = NOW();

-- ============================================
-- 8. Create exchange rate history table
-- ============================================
CREATE TABLE IF NOT EXISTS public.exchange_rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate NUMERIC(10, 6) NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rate_history_currencies
  ON public.exchange_rate_history(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rate_history_created
  ON public.exchange_rate_history(created_at DESC);

COMMENT ON TABLE public.exchange_rate_history IS 'Historical exchange rates for auditing and analysis';

-- ============================================
-- 9. Create user currency preferences table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_currency_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  detected_currency VARCHAR(3),
  last_detected_country VARCHAR(2),
  currency_history JSONB DEFAULT '[]'::jsonb,
  auto_detect BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_currency_user_id
  ON public.user_currency_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_currency_preferred
  ON public.user_currency_preferences(preferred_currency);

COMMENT ON TABLE public.user_currency_preferences IS 'User-specific currency preferences and detection history';

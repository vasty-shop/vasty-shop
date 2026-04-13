-- Product Subscription Plans table (customer-facing recurring billing)
CREATE TABLE IF NOT EXISTS product_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- minor units (cents)
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  interval VARCHAR(20) NOT NULL CHECK (interval IN ('weekly', 'monthly', 'quarterly', 'annual')),
  trial_days INTEGER NOT NULL DEFAULT 0,
  subscription_discount_percent NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_sub_plans_vendor_id ON product_subscription_plans(vendor_id);
CREATE INDEX IF NOT EXISTS idx_prod_sub_plans_product_id ON product_subscription_plans(product_id);
CREATE INDEX IF NOT EXISTS idx_prod_sub_plans_is_active ON product_subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_prod_sub_plans_interval ON product_subscription_plans(interval);

-- Product Subscriptions table (customer subscriptions to product plans)
CREATE TABLE IF NOT EXISTS product_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  plan_id UUID NOT NULL REFERENCES product_subscription_plans(id) ON DELETE RESTRICT,
  vendor_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'paused', 'canceling', 'past_due', 'cancelled')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  next_billing_date TIMESTAMPTZ NOT NULL,
  cancel_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  payment_method_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  renewal_count INTEGER NOT NULL DEFAULT 0,
  last_payment_at TIMESTAMPTZ,
  last_payment_amount INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_subs_user_id ON product_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prod_subs_plan_id ON product_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_prod_subs_vendor_id ON product_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_prod_subs_status ON product_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_prod_subs_next_billing ON product_subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_prod_subs_stripe_id ON product_subscriptions(stripe_subscription_id);

-- Add subscription_discount_percent to products table (subscribe-and-save)
ALTER TABLE products ADD COLUMN IF NOT EXISTS subscription_discount_percent NUMERIC DEFAULT 0;

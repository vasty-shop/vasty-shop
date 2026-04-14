/**
 * Multi-Warehouse Inventory Migration
 *
 * Creates three tables:
 *   - warehouses         : vendor warehouse locations
 *   - warehouse_stock    : per-product stock at each warehouse
 *   - stock_transfers    : audit trail of inter-warehouse transfers
 */
export const WAREHOUSE_MIGRATION_SQL = `
  -- ============================================
  -- warehouses
  -- ============================================
  CREATE TABLE IF NOT EXISTS warehouses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    address       JSONB DEFAULT '{}',
    is_default    BOOLEAN DEFAULT false,
    is_active     BOOLEAN DEFAULT true,
    deleted_at    TIMESTAMPTZ DEFAULT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_warehouses_vendor_id ON warehouses (vendor_id);

  -- ============================================
  -- warehouse_stock
  -- ============================================
  CREATE TABLE IF NOT EXISTS warehouse_stock (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id        UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL,
    quantity            INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (warehouse_id, product_id)
  );

  CREATE INDEX IF NOT EXISTS idx_warehouse_stock_product ON warehouse_stock (product_id);
  CREATE INDEX IF NOT EXISTS idx_warehouse_stock_warehouse ON warehouse_stock (warehouse_id);

  -- ============================================
  -- stock_transfers
  -- ============================================
  CREATE TABLE IF NOT EXISTS stock_transfers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_warehouse_id   UUID NOT NULL REFERENCES warehouses(id),
    to_warehouse_id     UUID NOT NULL REFERENCES warehouses(id),
    product_id          UUID NOT NULL,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    status              VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_by          UUID,
    created_at          TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_stock_transfers_product ON stock_transfers (product_id);

  -- ============================================
  -- stock_reservations  (checkout holds)
  -- ============================================
  CREATE TABLE IF NOT EXISTS stock_reservations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id),
    product_id      UUID NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    status          VARCHAR(50) NOT NULL DEFAULT 'active',
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_stock_reservations_product ON stock_reservations (product_id);
  CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON stock_reservations (status);
`;

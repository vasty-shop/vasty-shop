-- Migration: Create entity_translations table for multi-language product/category content
-- Issue: #47

CREATE TABLE IF NOT EXISTS entity_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  locale VARCHAR(5) NOT NULL,
  translated_fields JSONB NOT NULL DEFAULT '{}',
  is_auto_translated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_entity_translation UNIQUE (entity_type, entity_id, locale)
);

-- Index for fast lookups by entity
CREATE INDEX IF NOT EXISTS idx_entity_translations_entity
  ON entity_translations (entity_type, entity_id);

-- Index for locale-based queries
CREATE INDEX IF NOT EXISTS idx_entity_translations_locale
  ON entity_translations (locale);

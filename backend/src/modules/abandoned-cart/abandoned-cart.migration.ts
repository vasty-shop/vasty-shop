/**
 * Migration: Create abandoned_carts table
 *
 * Run this SQL against your database:
 *
 * CREATE TABLE IF NOT EXISTS "abandoned_carts" (
 *   "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   "cart_id" VARCHAR(255) NOT NULL,
 *   "user_id" VARCHAR(255) NOT NULL,
 *   "cart_total" NUMERIC(12,2) NOT NULL DEFAULT 0,
 *   "items_count" INTEGER NOT NULL DEFAULT 0,
 *   "abandoned_at" TIMESTAMPTZ NOT NULL,
 *   "email_sequence_step" INTEGER NOT NULL DEFAULT 0,
 *   "last_email_sent_at" TIMESTAMPTZ,
 *   "recovered_at" TIMESTAMPTZ,
 *   "discount_code_used" VARCHAR(255),
 *   "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE INDEX "idx_abandoned_carts_cart_id" ON "abandoned_carts" ("cart_id");
 * CREATE INDEX "idx_abandoned_carts_user_id" ON "abandoned_carts" ("user_id");
 * CREATE INDEX "idx_abandoned_carts_abandoned_at" ON "abandoned_carts" ("abandoned_at");
 * CREATE INDEX "idx_abandoned_carts_recovered_at" ON "abandoned_carts" ("recovered_at");
 * CREATE INDEX "idx_abandoned_carts_email_step" ON "abandoned_carts" ("email_sequence_step");
 */

import { DatabaseService } from '../database/database.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('AbandonedCartMigration');

export async function runAbandonedCartMigration(db: DatabaseService): Promise<void> {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "abandoned_carts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "cart_id" VARCHAR(255) NOT NULL,
        "user_id" VARCHAR(255) NOT NULL,
        "cart_total" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "items_count" INTEGER NOT NULL DEFAULT 0,
        "abandoned_at" TIMESTAMPTZ NOT NULL,
        "email_sequence_step" INTEGER NOT NULL DEFAULT 0,
        "last_email_sent_at" TIMESTAMPTZ,
        "recovered_at" TIMESTAMPTZ,
        "discount_code_used" VARCHAR(255),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(`CREATE INDEX IF NOT EXISTS "idx_abandoned_carts_cart_id" ON "abandoned_carts" ("cart_id");`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "idx_abandoned_carts_user_id" ON "abandoned_carts" ("user_id");`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "idx_abandoned_carts_abandoned_at" ON "abandoned_carts" ("abandoned_at");`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "idx_abandoned_carts_recovered_at" ON "abandoned_carts" ("recovered_at");`);
    await db.execute(`CREATE INDEX IF NOT EXISTS "idx_abandoned_carts_email_step" ON "abandoned_carts" ("email_sequence_step");`);

    logger.log('Abandoned carts migration completed successfully');
  } catch (error) {
    logger.error('Abandoned carts migration failed', error.message);
    throw error;
  }
}

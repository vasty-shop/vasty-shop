// TODO: Replace with pg Pool import
import { Pool } from 'pg';

/**
 * Migration: Add Stripe Connect columns to orders table
 * Adds columns for tracking Stripe Connect payments
 */
async function runMigration() {
  const client = new databaseClient(process.env.DATABASE_SERVICE_KEY);

  const migrations = [
    {
      name: 'add_stripe_payment_intent_id_to_orders',
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);`
    },
    {
      name: 'add_stripe_connect_enabled_to_orders',
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_connect_enabled BOOLEAN DEFAULT false;`
    },
    {
      name: 'add_platform_fee_to_orders',
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee NUMERIC;`
    },
    {
      name: 'add_vendor_amount_to_orders',
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_amount NUMERIC;`
    },
    {
      name: 'add_stripe_payment_intent_id_index',
      sql: `CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);`
    }
  ];

  console.log('Running Stripe Connect columns migration...\n');

  for (const migration of migrations) {
    try {
      console.log(`Running: ${migration.name}`);
      await client.execute(migration.sql);
      console.log(`  ✅ Success\n`);
    } catch (error: any) {
      // Check if the error is because column already exists
      if (error?.message?.includes('already exists')) {
        console.log(`  ⏭️ Skipped (already exists)\n`);
      } else {
        console.error(`  ❌ Failed: ${error?.message}\n`);
      }
    }
  }

  console.log('Migration completed!');
}

// Export for use in other scripts
export { runMigration };

// Run if executed directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

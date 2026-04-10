// TODO: Replace with pg Pool import
import { Pool } from 'pg';

/**
 * Migration: Add Stripe Connect columns to delivery_men table
 * Adds columns for tracking Stripe Connect accounts for delivery personnel payouts
 */
async function runMigration() {
  const client = new databaseClient(process.env.DATABASE_SERVICE_KEY);

  const migrations = [
    {
      name: 'add_stripe_account_id_to_delivery_men',
      sql: `ALTER TABLE delivery_men ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);`
    },
    {
      name: 'add_stripe_connect_status_to_delivery_men',
      sql: `ALTER TABLE delivery_men ADD COLUMN IF NOT EXISTS stripe_connect_status VARCHAR(50);`
    },
    {
      name: 'add_stripe_charges_enabled_to_delivery_men',
      sql: `ALTER TABLE delivery_men ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;`
    },
    {
      name: 'add_stripe_payouts_enabled_to_delivery_men',
      sql: `ALTER TABLE delivery_men ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;`
    },
    {
      name: 'add_stripe_requirements_to_delivery_men',
      sql: `ALTER TABLE delivery_men ADD COLUMN IF NOT EXISTS stripe_requirements JSONB;`
    },
    {
      name: 'add_stripe_verification_deadline_to_delivery_men',
      sql: `ALTER TABLE delivery_men ADD COLUMN IF NOT EXISTS stripe_verification_deadline TIMESTAMPTZ;`
    },
    {
      name: 'add_stripe_account_id_index_delivery_men',
      sql: `CREATE INDEX IF NOT EXISTS idx_delivery_men_stripe_account_id ON delivery_men(stripe_account_id);`
    },
    {
      name: 'add_stripe_connect_status_index_delivery_men',
      sql: `CREATE INDEX IF NOT EXISTS idx_delivery_men_stripe_connect_status ON delivery_men(stripe_connect_status);`
    }
  ];

  console.log('Running Stripe Connect columns migration for delivery_men...\n');

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

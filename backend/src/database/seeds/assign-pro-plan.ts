// @ts-nocheck
/**
 * Assign Pro Plan to a Shop for Development Testing
 * Run: npx tsx src/database/seeds/assign-pro-plan.ts
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const DATABASE_SERVICE_KEY = process.env.DATABASE_SERVICE_KEY;

if (!DATABASE_SERVICE_KEY) {
  console.error('❌ Missing DATABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const database = new databaseClient(DATABASE_SERVICE_KEY);

// Shop ID to assign Pro plan to
const SHOP_ID = '2125423a-86cb-4d7f-8a5d-1ce3cf9f0206';

async function main() {
  console.log('🎯 Assigning Pro Plan to Shop for Development\n');

  try {
    // Get the Pro plan
    console.log('📋 Finding Pro plan...');
    const plans = await database.query
      .from('subscription_plans')
      .select('*')
      .where('slug', 'pro')
      .get();

    if (!plans || plans.length === 0) {
      console.error('❌ Pro plan not found. Run seed:stripe-plans first.');
      process.exit(1);
    }

    const proPlan = plans[0];
    console.log(`  ✓ Found Pro plan: ${proPlan.id}`);

    // Check if shop exists
    console.log('\n🏪 Checking shop...');
    const shops = await database.query
      .from('shops')
      .select('*')
      .where('id', SHOP_ID)
      .get();

    if (!shops || shops.length === 0) {
      console.error('❌ Shop not found:', SHOP_ID);
      process.exit(1);
    }

    const shop = shops[0];
    console.log(`  ✓ Found shop: ${shop.name}`);

    // Check if subscription already exists
    console.log('\n📦 Checking existing subscription...');
    const existingSubs = await database.query
      .from('shop_subscriptions')
      .select('*')
      .where('shop_id', SHOP_ID)
      .get();

    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const subscriptionData = {
      shop_id: SHOP_ID,
      plan_id: proPlan.id,
      billing_cycle: 'yearly',
      current_period_start: now.toISOString(),
      current_period_end: oneYearLater.toISOString(),
      status: 'active',
      cancel_at_period_end: false,
      products_used: 0,
      orders_this_month: 0,
      usage_reset_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (existingSubs && existingSubs.length > 0) {
      // Update existing subscription
      console.log('  ⟳ Updating existing subscription to Pro plan...');
      await database.query
        .from('shop_subscriptions')
        .where('shop_id', SHOP_ID)
        .update(subscriptionData)
        .execute();
      console.log('  ✓ Subscription updated to Pro plan');
    } else {
      // Create new subscription
      console.log('  ✚ Creating new Pro subscription...');
      await database.query
        .from('shop_subscriptions')
        .insert({
          ...subscriptionData,
          created_at: now.toISOString(),
        })
        .execute();
      console.log('  ✓ Pro subscription created');
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ SUCCESS! Shop now has Pro plan access');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📱 Mobile App Download: ENABLED`);
    console.log(`📊 Analytics: ENABLED`);
    console.log(`🎨 Premium Themes: ENABLED`);
    console.log(`🌐 Custom Domain: ENABLED`);
    console.log(`🎯 Promotions: ENABLED`);
    console.log(`\n🔄 Restart backend server and refresh the billing page.`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

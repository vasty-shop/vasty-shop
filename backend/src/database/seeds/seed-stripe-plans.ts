// @ts-nocheck
/**
 * Stripe Subscription Plans Seed Script
 * Creates Stripe products/prices and subscription_plans table entries
 *
 * Pricing (matches BillingPage exactly):
 * - Free: $0/month
 * - Starter: $29.99/month, $299.99/year (2 months free)
 * - Pro: $79.99/month, $799.99/year (2 months free) - Popular
 * - Business: $199.99/month, $1999.99/year (2 months free)
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const DATABASE_SERVICE_KEY = process.env.DATABASE_SERVICE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!DATABASE_SERVICE_KEY) {
  console.error('❌ Missing DATABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ Missing or invalid STRIPE_SECRET_KEY in .env file');
  console.error('   STRIPE_SECRET_KEY must start with sk_test_ or sk_live_');
  process.exit(1);
}

const database = new databaseClient(DATABASE_SERVICE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Helper to query database
const query = {
  from: (table: string) => /* TODO */ // vasty.query.from(table),
};

// Plan definitions matching BillingPage exactly
const PLANS = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Start your first store',
    priceMonthly: 0, // $0
    priceYearly: 0, // $0
    trialDays: 0,
    maxProducts: 10,
    maxStores: 1,
    maxTeamMembers: 1,
    features: [
      '1 store with 10 products',
      'Free subdomain (yourstore.vasty.shop)',
      'Basic storefront theme',
      'Marketplace listing',
      'Standard checkout',
      'Community support',
    ],
    hasAnalytics: false,
    hasPrioritySupport: false,
    hasCustomDomain: false,
    hasApiAccess: false,
    hasBulkUpload: false,
    hasPromotions: false,
    hasMobileApp: false,
    hasWhiteLabel: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
  },
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Launch & grow',
    priceMonthly: 29.99, // $29.99/month
    priceYearly: 299.99, // $299.99/year (2 months free)
    trialDays: 14,
    maxProducts: null, // Unlimited
    maxStores: 2,
    maxTeamMembers: 2,
    features: [
      '2 stores with unlimited products',
      'Custom domain',
      'Premium storefront themes',
      'Basic analytics dashboard',
      '2 team members',
      'Email support',
    ],
    hasAnalytics: true,
    hasPrioritySupport: false,
    hasCustomDomain: true,
    hasApiAccess: false,
    hasBulkUpload: true,
    hasPromotions: false,
    hasMobileApp: false,
    hasWhiteLabel: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Grow your business',
    priceMonthly: 79.99, // $79.99/month
    priceYearly: 799.99, // $799.99/year (2 months free)
    trialDays: 14,
    maxProducts: null, // Unlimited
    maxStores: 5,
    maxTeamMembers: 5,
    features: [
      '5 stores with unlimited products',
      'Custom domain per store',
      'Advanced analytics & reports',
      '5 team members',
      'Priority support (Email & Chat)',
      'Mobile app for customers',
      'Advanced promotions & campaigns',
    ],
    hasAnalytics: true,
    hasPrioritySupport: true,
    hasCustomDomain: true,
    hasApiAccess: false,
    hasBulkUpload: true,
    hasPromotions: true,
    hasMobileApp: true,
    hasWhiteLabel: false,
    isActive: true,
    isFeatured: true, // Popular plan
    sortOrder: 3,
  },
  {
    slug: 'business',
    name: 'Business',
    description: 'Scale without limits',
    priceMonthly: 199.99, // $199.99/month
    priceYearly: 1999.99, // $1999.99/year (2 months free)
    trialDays: 14,
    maxProducts: null, // Unlimited
    maxStores: null, // Unlimited
    maxTeamMembers: 15,
    features: [
      'Unlimited stores & products',
      'Custom domain per store',
      'Full analytics + custom reports',
      '15 team members',
      'Full mobile app (All panels)',
      'API access for integrations',
      'White-label solution',
    ],
    hasAnalytics: true,
    hasPrioritySupport: true,
    hasCustomDomain: true,
    hasApiAccess: true,
    hasBulkUpload: true,
    hasPromotions: true,
    hasMobileApp: true,
    hasWhiteLabel: true,
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
  },
];

async function main() {
  console.log('🌱 Starting Stripe Subscription Plans Seeding...\n');
  console.log('📦 Stripe Account:', STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE');
  console.log('');

  const createdPlans = [];

  for (const plan of PLANS) {
    console.log(`\n💳 Processing: ${plan.name} Plan`);
    console.log('─'.repeat(40));

    let stripeProductId: string | null = null;
    let stripePriceIdMonthly: string | null = null;
    let stripePriceIdYearly: string | null = null;

    // Skip Stripe for free plan
    if (plan.priceMonthly > 0) {
      try {
        // Check if product already exists
        const existingProducts = await stripe.products.search({
          query: `metadata['slug']:'${plan.slug}'`,
        });

        let stripeProduct: Stripe.Product;

        if (existingProducts.data.length > 0) {
          stripeProduct = existingProducts.data[0];
          console.log(`  ✓ Found existing Stripe product: ${stripeProduct.id}`);
        } else {
          // Create Stripe product
          stripeProduct = await stripe.products.create({
            name: `Vasty Shop - ${plan.name} Plan`,
            description: plan.description,
            metadata: {
              slug: plan.slug,
              features: plan.features.join('|'),
            },
          });
          console.log(`  ✓ Created Stripe product: ${stripeProduct.id}`);
        }

        stripeProductId = stripeProduct.id;

        // Check for existing prices
        const existingPrices = await stripe.prices.list({
          product: stripeProduct.id,
          active: true,
        });

        const existingMonthlyPrice = existingPrices.data.find(
          p => p.recurring?.interval === 'month'
        );
        const existingYearlyPrice = existingPrices.data.find(
          p => p.recurring?.interval === 'year'
        );

        // Create monthly price if not exists
        if (existingMonthlyPrice) {
          stripePriceIdMonthly = existingMonthlyPrice.id;
          console.log(`  ✓ Found existing monthly price: ${stripePriceIdMonthly}`);
        } else {
          const monthlyPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(plan.priceMonthly * 100), // Convert to cents
            currency: 'usd',
            recurring: { interval: 'month' },
            metadata: {
              slug: plan.slug,
              billing_period: 'monthly',
            },
          });
          stripePriceIdMonthly = monthlyPrice.id;
          console.log(`  ✓ Created monthly price: ${stripePriceIdMonthly} ($${plan.priceMonthly}/month)`);
        }

        // Create yearly price if not exists
        if (existingYearlyPrice) {
          stripePriceIdYearly = existingYearlyPrice.id;
          console.log(`  ✓ Found existing yearly price: ${stripePriceIdYearly}`);
        } else {
          const yearlyPrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(plan.priceYearly * 100), // Convert to cents
            currency: 'usd',
            recurring: { interval: 'year' },
            metadata: {
              slug: plan.slug,
              billing_period: 'yearly',
            },
          });
          stripePriceIdYearly = yearlyPrice.id;
          console.log(`  ✓ Created yearly price: ${stripePriceIdYearly} ($${plan.priceYearly}/year)`);
        }
      } catch (error: any) {
        console.error(`  ❌ Stripe error for ${plan.name}:`, error.message);
        // Continue with null Stripe IDs for this plan
      }
    } else {
      console.log(`  ⏭ Skipping Stripe for free plan`);
    }

    // Save to database
    try {
      // Check if plan already exists
      const existingPlans = await database.query
        .from('subscription_plans')
        .select('*')
        .where('slug', plan.slug)
        .get();

      const planData = {
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        badge_color: plan.isFeatured ? '#22c55e' : null, // Green for popular
        price_monthly: plan.priceMonthly,
        price_yearly: plan.priceYearly,
        currency: 'USD',
        trial_days: plan.trialDays,
        max_products: plan.maxProducts,
        max_orders_per_month: null,
        max_team_members: plan.maxTeamMembers,
        commission_rate: 0,
        features: JSON.stringify(plan.features),
        has_analytics: plan.hasAnalytics,
        has_priority_support: plan.hasPrioritySupport,
        has_custom_domain: plan.hasCustomDomain,
        has_api_access: plan.hasApiAccess,
        has_bulk_upload: plan.hasBulkUpload,
        has_promotions: plan.hasPromotions,
        is_active: plan.isActive,
        is_featured: plan.isFeatured,
        sort_order: plan.sortOrder,
        stripe_price_id_monthly: stripePriceIdMonthly,
        stripe_price_id_yearly: stripePriceIdYearly,
        updated_at: new Date().toISOString(),
      };

      if (existingPlans && existingPlans.length > 0) {
        // Update existing plan
        await database.query
          .from('subscription_plans')
          .where('slug', plan.slug)
          .update(planData)
          .execute();
        console.log(`  ✓ Updated database plan: ${plan.slug}`);
        createdPlans.push({ ...planData, id: existingPlans[0].id });
      } else {
        // Insert new plan
        const result = await database.query
          .from('subscription_plans')
          .insert({
            ...planData,
            created_at: new Date().toISOString(),
          })
          .returning('*')
          .execute();
        console.log(`  ✓ Created database plan: ${plan.slug}`);
        createdPlans.push(result[0]);
      }
    } catch (error: any) {
      console.error(`  ❌ Database error for ${plan.name}:`, error.message);
    }
  }

  // Print summary
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 SUBSCRIPTION PLANS SUMMARY');
  console.log('═'.repeat(60));
  console.log('');
  console.log('┌─────────────┬───────────────┬───────────────┬─────────────────────────┐');
  console.log('│ Plan        │ Monthly       │ Yearly        │ Stripe Price ID         │');
  console.log('├─────────────┼───────────────┼───────────────┼─────────────────────────┤');

  for (const plan of PLANS) {
    const dbPlan = createdPlans.find(p => p.slug === plan.slug);
    const monthly = plan.priceMonthly === 0 ? 'FREE' : `$${plan.priceMonthly}`;
    const yearly = plan.priceYearly === 0 ? 'FREE' : `$${plan.priceYearly}`;
    const priceId = dbPlan?.stripe_price_id_monthly?.slice(0, 20) || 'N/A';

    console.log(`│ ${plan.name.padEnd(11)} │ ${monthly.padEnd(13)} │ ${yearly.padEnd(13)} │ ${priceId.padEnd(23)} │`);
  }

  console.log('└─────────────┴───────────────┴───────────────┴─────────────────────────┘');
  console.log('');
  console.log('✅ Stripe subscription plans created successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Go to the Billing page to see the plans');
  console.log('   3. Click "Upgrade" on any paid plan to test checkout');
  console.log('');
  console.log('💳 Test card numbers:');
  console.log('   Success: 4242 4242 4242 4242');
  console.log('   Decline: 4000 0000 0000 0002');
  console.log('');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });

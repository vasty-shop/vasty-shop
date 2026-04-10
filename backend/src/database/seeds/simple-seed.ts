// @ts-nocheck
/**
 * Simple Seed Script using database SDK directly
 * This bypasses NestJS and directly interacts with database
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const DATABASE_SERVICE_KEY = process.env.DATABASE_SERVICE_KEY;
const DATABASE_ANON_KEY = process.env.DATABASE_ANON_KEY;

if (!DATABASE_SERVICE_KEY || !DATABASE_ANON_KEY) {
  console.error('❌ Missing database API keys in .env file');
  process.exit(1);
}

const serviceClient = new databaseClient(DATABASE_SERVICE_KEY);
const anonClient = new databaseClient(DATABASE_ANON_KEY);

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Create Currencies
    console.log('💱 Creating currencies...');
    const currencies = await seedCurrencies();
    console.log(`✅ Created ${currencies.length} currencies\n`);

    // 2. Create Exchange Rates
    console.log('📊 Creating exchange rates...');
    const exchangeRates = await seedExchangeRates(currencies);
    console.log(`✅ Created ${exchangeRates.length} exchange rates\n`);

    // 3. Create Tax Countries
    console.log('🌍 Creating tax countries...');
    const taxCountries = await seedTaxCountries();
    console.log(`✅ Created ${taxCountries.length} tax countries\n`);

    // 4. Create Product Tax Categories
    console.log('📋 Creating product tax categories...');
    const taxCategories = await seedProductTaxCategories();
    console.log(`✅ Created ${taxCategories.length} product tax categories\n`);

    // 5. Create Tax Rates
    console.log('💰 Creating tax rates...');
    const taxRates = await seedTaxRates(taxCountries);
    console.log(`✅ Created ${taxRates.length} tax rates\n`);

    // 6. Create Shipping Methods
    console.log('🚚 Creating shipping methods...');
    const shippingMethods = await seedShippingMethods();
    console.log(`✅ Created ${shippingMethods.length} shipping methods\n`);

    // 7. Create Users
    console.log('👤 Creating users...');
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users\n`);

    // 8. Create Categories
    console.log('📁 Creating categories...');
    const categories = await seedCategories();
    console.log(`✅ Created ${categories.length} categories\n`);

    // 9. Create Shops
    console.log('🏪 Creating shops...');
    const shops = await seedShops(users.filter(u => u.role === 'vendor'));
    console.log(`✅ Created ${shops.length} shops\n`);

    // 10. Create Products
    console.log('📦 Creating products...');
    const products = await seedProducts(shops, categories);
    console.log(`✅ Created ${products.length} products\n`);

    // 11. Create Campaigns
    console.log('🎯 Creating campaigns...');
    const campaigns = await seedCampaigns(shops);
    console.log(`✅ Created ${campaigns.length} campaigns\n`);

    // 12. Create Offers
    console.log('🎁 Creating offers...');
    const offers = await seedOffers(shops);
    console.log(`✅ Created ${offers.length} offers\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Currencies: ${currencies.length}`);
    console.log(`   - Exchange Rates: ${exchangeRates.length}`);
    console.log(`   - Tax Countries: ${taxCountries.length}`);
    console.log(`   - Product Tax Categories: ${taxCategories.length}`);
    console.log(`   - Tax Rates: ${taxRates.length}`);
    console.log(`   - Shipping Methods: ${shippingMethods.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Shops: ${shops.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Campaigns: ${campaigns.length}`);
    console.log(`   - Offers: ${offers.length}`);
    console.log('\n✨ Test Credentials:');
    console.log('   Customer: customer@database.com / Password123!');
    console.log('   Vendor: vendor@database.com / Password123!');
    console.log('   Admin: admin@database.com / Password123!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function seedCurrencies() {
  const currencies = [];
  const currenciesToCreate = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      symbol_native: '$',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: true,
      display_order: 1,
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'CA$',
      symbol_native: '$',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: false,
      display_order: 2,
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      symbol_native: '¥',
      decimal_digits: 0,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: false,
      display_order: 3,
    },
    {
      code: 'BDT',
      name: 'Bangladeshi Taka',
      symbol: '৳',
      symbol_native: '৳',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: false,
      display_order: 4,
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      symbol_native: '€',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: ',',
      thousand_separator: '.',
      is_active: true,
      is_default: false,
      display_order: 5,
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      symbol_native: '£',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: false,
      display_order: 6,
    },
    {
      code: 'AUD',
      name: 'Australian Dollar',
      symbol: 'AU$',
      symbol_native: '$',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: false,
      display_order: 7,
    },
    {
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹',
      symbol_native: '₹',
      decimal_digits: 2,
      rounding: 0,
      symbol_position: 'before',
      decimal_separator: '.',
      thousand_separator: ',',
      is_active: true,
      is_default: false,
      display_order: 8,
    },
  ];

  for (const currencyData of currenciesToCreate) {
    try {
      const result = await serviceClient.insert('currencies', currencyData);
      if (result && result.data && result.data.length > 0) {
        currencies.push(result.data[0]);
        console.log(`  ✓ Created: ${currencyData.code} - ${currencyData.name}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${currencyData.code} already exists or failed:`, error?.message || error);
    }
  }

  // If no currencies were created, try to fetch existing ones
  if (currencies.length === 0) {
    try {
      const existing = await serviceClient.select('currencies').execute();
      if (existing && existing.data) {
        currencies.push(...existing.data);
      }
    } catch (e) {
      console.log('  ⚠ Could not fetch existing currencies');
    }
  }

  return currencies;
}

async function seedExchangeRates(currencies: any[]) {
  const exchangeRates = [];
  const now = new Date();

  // Exchange rates as of 2025 (approximate values)
  const ratesData = [
    { from: 'USD', to: 'CAD', rate: 1.35 },
    { from: 'USD', to: 'JPY', rate: 148.50 },
    { from: 'USD', to: 'BDT', rate: 110.50 },
    { from: 'USD', to: 'EUR', rate: 0.92 },
    { from: 'USD', to: 'GBP', rate: 0.79 },
    { from: 'USD', to: 'AUD', rate: 1.52 },
    { from: 'USD', to: 'INR', rate: 83.25 },
    // Reverse rates
    { from: 'CAD', to: 'USD', rate: 0.74 },
    { from: 'JPY', to: 'USD', rate: 0.0067 },
    { from: 'BDT', to: 'USD', rate: 0.0091 },
    { from: 'EUR', to: 'USD', rate: 1.09 },
    { from: 'GBP', to: 'USD', rate: 1.27 },
    { from: 'AUD', to: 'USD', rate: 0.66 },
    { from: 'INR', to: 'USD', rate: 0.012 },
  ];

  for (const rateData of ratesData) {
    try {
      const data = {
        from_currency: rateData.from,
        to_currency: rateData.to,
        rate: rateData.rate,
        source: 'manual',
        valid_from: now,
        valid_until: null,
        is_active: true,
      };

      const result = await serviceClient.insert('exchange_rates', data);
      if (result && result.data && result.data.length > 0) {
        exchangeRates.push(result.data[0]);
        console.log(`  ✓ Created: ${rateData.from} → ${rateData.to} (${rateData.rate})`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${rateData.from}→${rateData.to} already exists or failed:`, error?.message || error);
    }
  }

  return exchangeRates;
}

async function seedTaxCountries() {
  const taxCountries = [];
  const countriesToCreate = [
    {
      code: 'US',
      name: 'United States',
      tax_name: 'Sales Tax',
      tax_abbreviation: 'ST',
      default_rate: 0,
      tax_type: 'exclusive',
      compound_tax: false,
      tax_on_shipping: true,
      requires_tax_id: true,
      tax_id_format: 'EIN: XX-XXXXXXX',
      is_active: true,
      metadata: {},
    },
    {
      code: 'CA',
      name: 'Canada',
      tax_name: 'Goods and Services Tax',
      tax_abbreviation: 'GST/HST',
      default_rate: 5,
      tax_type: 'exclusive',
      compound_tax: true,
      tax_on_shipping: true,
      requires_tax_id: true,
      tax_id_format: 'GST/HST Number',
      is_active: true,
      metadata: {},
    },
    {
      code: 'JP',
      name: 'Japan',
      tax_name: 'Consumption Tax',
      tax_abbreviation: 'JCT',
      default_rate: 10,
      tax_type: 'inclusive',
      compound_tax: false,
      tax_on_shipping: true,
      requires_tax_id: false,
      tax_id_format: null,
      is_active: true,
      metadata: {},
    },
    {
      code: 'BD',
      name: 'Bangladesh',
      tax_name: 'Value Added Tax',
      tax_abbreviation: 'VAT',
      default_rate: 15,
      tax_type: 'inclusive',
      compound_tax: false,
      tax_on_shipping: true,
      requires_tax_id: true,
      tax_id_format: 'BIN Number',
      is_active: true,
      metadata: {},
    },
  ];

  for (const countryData of countriesToCreate) {
    try {
      const result = await serviceClient.insert('tax_countries', countryData);
      if (result && result.data && result.data.length > 0) {
        taxCountries.push(result.data[0]);
        console.log(`  ✓ Created: ${countryData.code} - ${countryData.name}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${countryData.code} already exists or failed:`, error?.message || error);
    }
  }

  // If no tax countries were created, try to fetch existing ones
  if (taxCountries.length === 0) {
    try {
      const existing = await serviceClient.select('tax_countries').execute();
      if (existing && existing.data) {
        taxCountries.push(...existing.data);
      }
    } catch (e) {
      console.log('  ⚠ Could not fetch existing tax countries');
    }
  }

  return taxCountries;
}

async function seedProductTaxCategories() {
  const taxCategories = [];
  const categoriesToCreate = [
    {
      name: 'Standard Rate',
      code: 'standard',
      description: 'Standard tax rate applied to most goods and services',
      is_active: true,
      display_order: 1,
    },
    {
      name: 'Reduced Rate',
      code: 'reduced',
      description: 'Reduced tax rate for essential items like food, books, etc.',
      is_active: true,
      display_order: 2,
    },
    {
      name: 'Zero-Rated',
      code: 'zero',
      description: 'Zero tax rate but still VAT registered',
      is_active: true,
      display_order: 3,
    },
    {
      name: 'Exempt',
      code: 'exempt',
      description: 'Tax exempt items like certain healthcare, education services',
      is_active: true,
      display_order: 4,
    },
  ];

  for (const categoryData of categoriesToCreate) {
    try {
      const result = await serviceClient.insert('product_tax_categories', categoryData);
      if (result && result.data && result.data.length > 0) {
        taxCategories.push(result.data[0]);
        console.log(`  ✓ Created: ${categoryData.code} - ${categoryData.name}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${categoryData.code} already exists or failed:`, error?.message || error);
    }
  }

  // If no tax categories were created, try to fetch existing ones
  if (taxCategories.length === 0) {
    try {
      const existing = await serviceClient.select('product_tax_categories').execute();
      if (existing && existing.data) {
        taxCategories.push(...existing.data);
      }
    } catch (e) {
      console.log('  ⚠ Could not fetch existing product tax categories');
    }
  }

  return taxCategories;
}

async function seedTaxRates(taxCountries: any[]) {
  const taxRates = [];

  // US tax rates (state-specific)
  const usCountry = taxCountries.find(c => c.code === 'US');
  if (usCountry) {
    const usRates = [
      { name: 'California Sales Tax', rate: 7.25, state_province: 'CA' },
      { name: 'New York Sales Tax', rate: 4.0, state_province: 'NY' },
      { name: 'Texas Sales Tax', rate: 6.25, state_province: 'TX' },
      { name: 'Florida Sales Tax', rate: 6.0, state_province: 'FL' },
    ];

    for (const rateData of usRates) {
      try {
        const data = {
          country_id: usCountry.id,
          name: rateData.name,
          rate: rateData.rate,
          state_province: rateData.state_province,
          city: null,
          postal_code: null,
          postal_code_pattern: null,
          priority: 0,
          is_compound: false,
          valid_from: null,
          valid_until: null,
          is_active: true,
        };

        const result = await serviceClient.insert('tax_rates', data);
        if (result && result.data && result.data.length > 0) {
          taxRates.push(result.data[0]);
          console.log(`  ✓ Created: ${rateData.name}`);
        }
      } catch (error: any) {
        console.log(`  ⚠ ${rateData.name} already exists or failed:`, error?.message || error);
      }
    }
  }

  // Canada tax rates (provincial)
  const caCountry = taxCountries.find(c => c.code === 'CA');
  if (caCountry) {
    const caRates = [
      { name: 'Ontario HST', rate: 13.0, state_province: 'ON' },
      { name: 'Quebec GST', rate: 5.0, state_province: 'QC' },
      { name: 'Quebec QST', rate: 9.975, state_province: 'QC', is_compound: true },
      { name: 'British Columbia GST', rate: 5.0, state_province: 'BC' },
      { name: 'British Columbia PST', rate: 7.0, state_province: 'BC' },
      { name: 'Alberta GST', rate: 5.0, state_province: 'AB' },
    ];

    for (const rateData of caRates) {
      try {
        const data = {
          country_id: caCountry.id,
          name: rateData.name,
          rate: rateData.rate,
          state_province: rateData.state_province,
          city: null,
          postal_code: null,
          postal_code_pattern: null,
          priority: rateData.is_compound ? 1 : 0,
          is_compound: rateData.is_compound || false,
          valid_from: null,
          valid_until: null,
          is_active: true,
        };

        const result = await serviceClient.insert('tax_rates', data);
        if (result && result.data && result.data.length > 0) {
          taxRates.push(result.data[0]);
          console.log(`  ✓ Created: ${rateData.name}`);
        }
      } catch (error: any) {
        console.log(`  ⚠ ${rateData.name} already exists or failed:`, error?.message || error);
      }
    }
  }

  // Japan tax rate (national)
  const jpCountry = taxCountries.find(c => c.code === 'JP');
  if (jpCountry) {
    try {
      const data = {
        country_id: jpCountry.id,
        name: 'Japan Consumption Tax',
        rate: 10.0,
        state_province: null,
        city: null,
        postal_code: null,
        postal_code_pattern: null,
        priority: 0,
        is_compound: false,
        valid_from: null,
        valid_until: null,
        is_active: true,
      };

      const result = await serviceClient.insert('tax_rates', data);
      if (result && result.data && result.data.length > 0) {
        taxRates.push(result.data[0]);
        console.log(`  ✓ Created: Japan Consumption Tax`);
      }
    } catch (error: any) {
      console.log(`  ⚠ Japan Consumption Tax already exists or failed:`, error?.message || error);
    }
  }

  // Bangladesh tax rate (national)
  const bdCountry = taxCountries.find(c => c.code === 'BD');
  if (bdCountry) {
    try {
      const data = {
        country_id: bdCountry.id,
        name: 'Bangladesh VAT',
        rate: 15.0,
        state_province: null,
        city: null,
        postal_code: null,
        postal_code_pattern: null,
        priority: 0,
        is_compound: false,
        valid_from: null,
        valid_until: null,
        is_active: true,
      };

      const result = await serviceClient.insert('tax_rates', data);
      if (result && result.data && result.data.length > 0) {
        taxRates.push(result.data[0]);
        console.log(`  ✓ Created: Bangladesh VAT`);
      }
    } catch (error: any) {
      console.log(`  ⚠ Bangladesh VAT already exists or failed:`, error?.message || error);
    }
  }

  return taxRates;
}

async function seedShippingMethods() {
  const shippingMethods = [];
  const methodsToCreate = [
    {
      type: 'standard',
      name: 'Standard Shipping',
      display_name: 'Standard Shipping',
      base_cost: 0,
      free_shipping_threshold: 50,
      estimated_days: 5,
      estimated_business_days: 5,
      duration: '5-7 business days',
      description: 'Free standard shipping on orders over $50. Delivery within 5-7 business days.',
      icon: '📦',
      features: ['Free on orders over $50', 'Tracking included', 'Delivered to your door'],
      is_active: true,
      available_countries: [], // Empty array = available everywhere
      display_order: 1,
      requires_signature: false,
      min_weight: null,
      max_weight: null,
      min_order_value: null,
    },
    {
      type: 'express',
      name: 'Express Shipping',
      display_name: 'Express Shipping',
      base_cost: 15.00,
      free_shipping_threshold: null,
      estimated_days: 2,
      estimated_business_days: 2,
      duration: '2-3 business days',
      description: 'Fast delivery within 2-3 business days. Perfect for when you need it sooner.',
      icon: '⚡',
      features: ['2-3 business days', 'Priority handling', 'Real-time tracking', 'Signature on delivery'],
      is_active: true,
      available_countries: [], // Empty array = available everywhere
      display_order: 2,
      requires_signature: true,
      min_weight: null,
      max_weight: 25,
      min_order_value: null,
    },
    {
      type: 'overnight',
      name: 'Overnight Shipping',
      display_name: 'Overnight Shipping',
      base_cost: 35.00,
      free_shipping_threshold: null,
      estimated_days: 1,
      estimated_business_days: 1,
      duration: 'Next business day',
      description: 'Get your order by the next business day. Order before 2 PM for next-day delivery.',
      icon: '🚀',
      features: ['Next business day delivery', 'Premium handling', 'SMS & email notifications', 'Signature required', 'Insurance included'],
      is_active: true,
      available_countries: [], // Empty array = available everywhere
      display_order: 3,
      requires_signature: true,
      min_weight: null,
      max_weight: 10,
      min_order_value: null,
    },
  ];

  for (const methodData of methodsToCreate) {
    try {
      const result = await serviceClient.insert('shipping_methods', methodData);
      if (result && result.data && result.data.length > 0) {
        shippingMethods.push(result.data[0]);
        console.log(`  ✓ Created: ${methodData.name}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${methodData.name} already exists or failed:`, error?.message || error);
    }
  }

  // If no shipping methods were created, try to fetch existing ones
  if (shippingMethods.length === 0) {
    try {
      const existing = await serviceClient.select('shipping_methods').execute();
      if (existing && existing.data) {
        shippingMethods.push(...existing.data);
      }
    } catch (e) {
      console.log('  ⚠ Could not fetch existing shipping methods');
    }
  }

  return shippingMethods;
}

async function seedUsers() {
  const users = [];
  const usersToCreate = [
    { email: 'admin@database.com', password: 'Password123!', name: 'Admin User', metadata: { role: 'admin', firstName: 'Admin', lastName: 'User' } },
    { email: 'vendor@database.com', password: 'Password123!', name: 'Fashion Vendor', metadata: { role: 'vendor', firstName: 'Fashion', lastName: 'Vendor' } },
    { email: 'electronics@database.com', password: 'Password123!', name: 'Electronics Vendor', metadata: { role: 'vendor', firstName: 'Electronics', lastName: 'Vendor' } },
    { email: 'sports@database.com', password: 'Password123!', name: 'Sports Vendor', metadata: { role: 'vendor', firstName: 'Sports', lastName: 'Vendor' } },
    { email: 'customer@database.com', password: 'Password123!', name: 'John Doe', metadata: { role: 'customer', firstName: 'John', lastName: 'Doe' } },
    { email: 'jane@database.com', password: 'Password123!', name: 'Jane Smith', metadata: { role: 'customer', firstName: 'Jane', lastName: 'Smith' } },
  ];

  for (const userData of usersToCreate) {
    try {
      const result = await anonClient.auth.register({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        metadata: userData.metadata,
      });
      users.push({ ...result.user, role: userData.metadata.role });
      console.log(`  ✓ Created: ${userData.email}`);
    } catch (error) {
      console.log(`  ⚠ ${userData.email} already exists or failed`);
      // Try to fetch the user if it exists
      try {
        const loginResult = await anonClient.auth.login({
          email: userData.email,
          password: userData.password,
        });
        users.push({ ...loginResult.user, role: userData.metadata.role });
      } catch (e) {
        // User exists but we can't log in, skip it
      }
    }
  }

  return users;
}

async function seedCategories() {
  const categories = [];
  const categoriesToCreate = [
    { name: "Men's Fashion", slug: 'mens-fashion', description: 'Clothing, shoes & accessories', icon: '👔', is_active: true },
    { name: "Women's Fashion", slug: 'womens-fashion', description: 'Dresses, tops & more', icon: '👗', is_active: true },
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets & devices', icon: '💻', is_active: true },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture & decor', icon: '🏠', is_active: true },
    { name: 'Sports & Fitness', slug: 'sports', description: 'Athletic wear & equipment', icon: '⚽', is_active: true },
    { name: 'Beauty & Personal Care', slug: 'beauty', description: 'Skincare & cosmetics', icon: '💄', is_active: true },
    { name: 'Books & Media', slug: 'books', description: 'Reading & entertainment', icon: '📚', is_active: true },
  ];

  for (const catData of categoriesToCreate) {
    try {
      const result = await serviceClient.insert('categories', catData);
      if (result && result.data && result.data.length > 0) {
        categories.push(result.data[0]);
        console.log(`  ✓ Created: ${catData.name}`);
      }
    } catch (error) {
      console.log(`  ⚠ ${catData.name} already exists or failed`);
    }
  }

  // If no categories were created, try to fetch existing ones
  if (categories.length === 0) {
    try {
      const existing = await serviceClient.select('categories').execute();
      if (existing && existing.data) {
        categories.push(...existing.data);
      }
    } catch (e) {
      console.log('  ⚠ Could not fetch existing categories');
    }
  }

  return categories;
}

async function seedShops(vendors: any[]) {
  const shops = [];
  const shopsToCreate = [
    { name: 'Fashion Hub', description: 'Premium fashion and accessories', business_name: 'Fashion Hub Inc.', business_type: 'retail', business_email: 'contact@fashionhub.com', business_phone: '+1234567890', status: 'active' },
    { name: 'Tech Store', description: 'Latest electronics and gadgets', business_name: 'Tech Store LLC', business_type: 'retail', business_email: 'contact@techstore.com', business_phone: '+1234567891', status: 'active' },
    { name: 'Sports World', description: 'Everything for sports and fitness', business_name: 'Sports World Ltd', business_type: 'retail', business_email: 'contact@sportsworld.com', business_phone: '+1234567892', status: 'active' },
  ];

  for (let i = 0; i < shopsToCreate.length && i < vendors.length; i++) {
    try {
      const shopData = {
        ...shopsToCreate[i],
        owner_id: vendors[i].id,
        slug: shopsToCreate[i].name.toLowerCase().replace(/\s+/g, '-'),
      };
      const result = await serviceClient.insert('shops', shopData);
      if (result && result.data && result.data.length > 0) {
        shops.push(result.data[0]);
        console.log(`  ✓ Created: ${shopsToCreate[i].name}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${shopsToCreate[i].name} already exists or failed:`, error?.message || error);
    }
  }

  // If no shops were created, try to fetch existing ones
  if (shops.length === 0) {
    try {
      const existing = await serviceClient.select('shops').execute();
      if (existing && existing.data) {
        shops.push(...existing.data);
      }
    } catch (e) {
      console.log('  ⚠ Could not fetch existing shops');
    }
  }

  return shops;
}

async function seedProducts(shops: any[], categories: any[]) {
  const products = [];
  const productsToCreate = [
    { name: 'Classic Denim Jacket', slug: 'classic-denim-jacket', description: 'Timeless denim jacket perfect for any season', price: 89.99, compare_at_price: 120.00, categorySlug: 'mens-fashion', shopIndex: 0, inventory: 50, sku: 'FH-DJ-001', isFeatured: true },
    { name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', description: 'Elegant leather bag for everyday use', price: 129.99, compare_at_price: 180.00, categorySlug: 'womens-fashion', shopIndex: 0, inventory: 30, sku: 'FH-LB-001', isFeatured: true },
    { name: 'Running Sneakers Pro', slug: 'running-sneakers-pro', description: 'Professional running shoes with advanced cushioning', price: 149.99, compare_at_price: 200.00, categorySlug: 'sports', shopIndex: 2, inventory: 100, sku: 'SW-RS-001', isFeatured: true },
    { name: 'Wireless Bluetooth Headphones', slug: 'wireless-bluetooth-headphones', description: 'Premium noise-canceling headphones with 30-hour battery', price: 199.99, compare_at_price: 299.00, categorySlug: 'electronics', shopIndex: 1, inventory: 75, sku: 'TS-WH-001', isFeatured: true },
    { name: 'Smart Watch Series X', slug: 'smart-watch-series-x', description: 'Advanced fitness tracking and notifications', price: 349.99, compare_at_price: 450.00, categorySlug: 'electronics', shopIndex: 1, inventory: 60, sku: 'TS-SW-001', isFeatured: true },
    { name: 'Portable Bluetooth Speaker', slug: 'portable-bluetooth-speaker', description: 'Waterproof speaker with amazing sound quality', price: 79.99, compare_at_price: 120.00, categorySlug: 'electronics', shopIndex: 1, inventory: 120, sku: 'TS-BS-001', isFeatured: false },
    { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Extra thick non-slip yoga mat', price: 49.99, compare_at_price: 70.00, categorySlug: 'sports', shopIndex: 2, inventory: 80, sku: 'SW-YM-001', isFeatured: false },
    { name: 'Gym Duffel Bag', slug: 'gym-duffel-bag', description: 'Spacious bag with separate shoe compartment', price: 59.99, compare_at_price: 85.00, categorySlug: 'sports', shopIndex: 2, inventory: 45, sku: 'SW-GB-001', isFeatured: false },
  ];

  for (const productData of productsToCreate) {
    try {
      const category = categories.find(c => c.slug === productData.categorySlug);
      const shop = shops[productData.shopIndex];

      if (!category || !shop) {
        console.log(`  ⚠ Skipping ${productData.name}: missing category or shop`);
        continue;
      }

      const data = {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        short_description: productData.description.substring(0, 100),
        price: productData.price,
        compare_price: productData.compare_at_price,
        categories: [category.id],
        shop_id: shop.id,
        stock: productData.inventory,
        sku: productData.sku,
        status: 'active',
        is_featured: productData.isFeatured || false,
      };

      const result = await serviceClient.insert('products', data);
      if (result && result.data && result.data.length > 0) {
        products.push(result.data[0]);
        console.log(`  ✓ Created: ${productData.name}`);
      }
    } catch (error: any) {
      console.log(`  ⚠ ${productData.name} already exists or failed:`, error.message);
    }
  }

  return products;
}

async function seedCampaigns(shops: any[]) {
  const campaigns = [];
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const campaignsToCreate = [
    { name: 'Summer Sale 2024', slug: 'summer-sale-2024', description: 'Biggest sale of the season! Up to 50% off', campaign_type: 'seasonal', discount_type: 'percentage', discount_value: 50, start_date: now, end_date: future, status: 'active', shopIndex: 0 },
    { name: 'Tech Week Special', slug: 'tech-week-special', description: 'Amazing deals on electronics and gadgets', campaign_type: 'flash_sale', discount_type: 'percentage', discount_value: 30, start_date: now, end_date: future, status: 'active', shopIndex: 1 },
    { name: 'Fitness Month', slug: 'fitness-month', description: 'Get fit with special sports equipment deals', campaign_type: 'seasonal', discount_type: 'percentage', discount_value: 25, start_date: now, end_date: future, status: 'active', shopIndex: 2 },
  ];

  for (const campData of campaignsToCreate) {
    try {
      const shop = shops[campData.shopIndex];
      if (!shop) continue;

      const data = {
        name: campData.name,
        slug: campData.slug,
        description: campData.description,
        campaign_type: campData.campaign_type,
        discount_type: campData.discount_type,
        discount_value: campData.discount_value,
        start_date: campData.start_date,
        end_date: campData.end_date,
        status: campData.status,
        shop_id: shop.id,
      };

      const result = await serviceClient.insert('campaigns', data);
      if (result && result.data && result.data.length > 0) {
        campaigns.push(result.data[0]);
        console.log(`  ✓ Created: ${campData.name}`);
      }
    } catch (error) {
      console.log(`  ⚠ ${campData.name} already exists or failed`);
    }
  }

  return campaigns;
}

async function seedOffers(shops: any[]) {
  const offers = [];
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const offersToCreate = [
    { code: 'WELCOME10', name: 'Welcome Discount', description: '10% off for new customers', type: 'percentage', value: 10, min_purchase: 50, max_discount: 20, valid_from: now, valid_to: future, total_usage_limit: 100, status: 'active' },
    { code: 'SAVE20', name: 'Save 20 USD', description: '20 USD off on orders over 100 USD', type: 'fixed', value: 20, min_purchase: 100, valid_from: now, valid_to: future, total_usage_limit: 50, status: 'active' },
    { code: 'FREESHIP', name: 'Free Shipping', description: 'Free shipping on all orders', type: 'free_shipping', value: 0, min_purchase: 0, valid_from: now, valid_to: future, total_usage_limit: 200, status: 'active' },
  ];

  for (const offerData of offersToCreate) {
    try {
      if (shops.length === 0) continue;

      const data = {
        ...offerData,
        shop_id: shops[0].id,
      };

      const result = await serviceClient.insert('offers', data);
      if (result && result.data && result.data.length > 0) {
        offers.push(result.data[0]);
        console.log(`  ✓ Created: ${offerData.code}`);
      }
    } catch (error) {
      console.log(`  ⚠ ${offerData.code} already exists or failed`);
    }
  }

  return offers;
}

main()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });

/**
 * Currency Seed Script
 * Seeds the database with currency and exchange rate data
 *
 * Run with: npx tsx src/modules/currency/seed-currencies.ts
 */

// TODO: Replace with pg Pool import
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { CURRENCIES } from './config/currencies.config';

// Load environment variables
dotenv.config();

const DATABASE_SERVICE_KEY = process.env.DATABASE_SERVICE_KEY;

if (!DATABASE_SERVICE_KEY) {
  console.error('Error: DATABASE_SERVICE_KEY not found in environment variables');
  process.exit(1);
}

const client = new databaseClient(DATABASE_SERVICE_KEY);

/**
 * Seed currencies table
 */
async function seedCurrencies() {
  console.log('Seeding currencies...');

  const currencyData = Object.values(CURRENCIES).map((currency) => ({
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    symbol_native: currency.symbolNative,
    decimal_digits: currency.decimalDigits,
    rounding: currency.rounding,
    symbol_position: currency.symbolPosition,
    decimal_separator: currency.decimalSeparator,
    thousand_separator: currency.thousandSeparator,
    is_active: currency.isActive,
    is_default: currency.code === 'USD',
    display_order: currency.displayOrder,
  }));

  try {
    // Delete existing currencies
    await client.query.from('currencies').delete().execute();

    // Insert new currencies
    const result = await client.query
      .from('currencies')
      .insert(currencyData)
      .execute();

    console.log(` Seeded ${currencyData.length} currencies`);
  } catch (error) {
    console.error('Error seeding currencies:', error.message);
    throw error;
  }
}

/**
 * Seed exchange rates table
 * These are approximate rates for development/testing
 * In production, use a real-time exchange rate API
 */
async function seedExchangeRates() {
  console.log('Seeding exchange rates...');

  const exchangeRates = [
    // USD conversions
    { from_currency: 'USD', to_currency: 'CAD', rate: 1.35 },
    { from_currency: 'USD', to_currency: 'JPY', rate: 150.0 },
    { from_currency: 'USD', to_currency: 'BDT', rate: 110.0 },
    { from_currency: 'USD', to_currency: 'EUR', rate: 0.92 },
    { from_currency: 'USD', to_currency: 'GBP', rate: 0.79 },
    { from_currency: 'USD', to_currency: 'AUD', rate: 1.52 },
    { from_currency: 'USD', to_currency: 'INR', rate: 83.0 },

    // EUR conversions
    { from_currency: 'EUR', to_currency: 'USD', rate: 1.09 },
    { from_currency: 'EUR', to_currency: 'GBP', rate: 0.86 },
    { from_currency: 'EUR', to_currency: 'JPY', rate: 163.0 },
    { from_currency: 'EUR', to_currency: 'CAD', rate: 1.47 },
    { from_currency: 'EUR', to_currency: 'AUD', rate: 1.65 },
    { from_currency: 'EUR', to_currency: 'INR', rate: 90.5 },
    { from_currency: 'EUR', to_currency: 'BDT', rate: 120.0 },

    // GBP conversions
    { from_currency: 'GBP', to_currency: 'USD', rate: 1.27 },
    { from_currency: 'GBP', to_currency: 'EUR', rate: 1.16 },
    { from_currency: 'GBP', to_currency: 'JPY', rate: 190.0 },
    { from_currency: 'GBP', to_currency: 'CAD', rate: 1.71 },
    { from_currency: 'GBP', to_currency: 'AUD', rate: 1.93 },
    { from_currency: 'GBP', to_currency: 'INR', rate: 105.0 },
    { from_currency: 'GBP', to_currency: 'BDT', rate: 140.0 },

    // JPY conversions
    { from_currency: 'JPY', to_currency: 'USD', rate: 0.0067 },
    { from_currency: 'JPY', to_currency: 'EUR', rate: 0.0061 },
    { from_currency: 'JPY', to_currency: 'GBP', rate: 0.0053 },
    { from_currency: 'JPY', to_currency: 'CAD', rate: 0.009 },
    { from_currency: 'JPY', to_currency: 'AUD', rate: 0.01 },
    { from_currency: 'JPY', to_currency: 'INR', rate: 0.55 },
    { from_currency: 'JPY', to_currency: 'BDT', rate: 0.73 },

    // CAD conversions
    { from_currency: 'CAD', to_currency: 'USD', rate: 0.74 },
    { from_currency: 'CAD', to_currency: 'EUR', rate: 0.68 },
    { from_currency: 'CAD', to_currency: 'GBP', rate: 0.58 },
    { from_currency: 'CAD', to_currency: 'JPY', rate: 111.0 },
    { from_currency: 'CAD', to_currency: 'AUD', rate: 1.13 },
    { from_currency: 'CAD', to_currency: 'INR', rate: 61.5 },
    { from_currency: 'CAD', to_currency: 'BDT', rate: 81.5 },

    // AUD conversions
    { from_currency: 'AUD', to_currency: 'USD', rate: 0.66 },
    { from_currency: 'AUD', to_currency: 'EUR', rate: 0.61 },
    { from_currency: 'AUD', to_currency: 'GBP', rate: 0.52 },
    { from_currency: 'AUD', to_currency: 'JPY', rate: 99.0 },
    { from_currency: 'AUD', to_currency: 'CAD', rate: 0.89 },
    { from_currency: 'AUD', to_currency: 'INR', rate: 54.6 },
    { from_currency: 'AUD', to_currency: 'BDT', rate: 72.6 },

    // INR conversions
    { from_currency: 'INR', to_currency: 'USD', rate: 0.012 },
    { from_currency: 'INR', to_currency: 'EUR', rate: 0.011 },
    { from_currency: 'INR', to_currency: 'GBP', rate: 0.0095 },
    { from_currency: 'INR', to_currency: 'JPY', rate: 1.81 },
    { from_currency: 'INR', to_currency: 'CAD', rate: 0.016 },
    { from_currency: 'INR', to_currency: 'AUD', rate: 0.018 },
    { from_currency: 'INR', to_currency: 'BDT', rate: 1.33 },

    // BDT conversions
    { from_currency: 'BDT', to_currency: 'USD', rate: 0.0091 },
    { from_currency: 'BDT', to_currency: 'EUR', rate: 0.0083 },
    { from_currency: 'BDT', to_currency: 'GBP', rate: 0.0071 },
    { from_currency: 'BDT', to_currency: 'JPY', rate: 1.36 },
    { from_currency: 'BDT', to_currency: 'CAD', rate: 0.012 },
    { from_currency: 'BDT', to_currency: 'AUD', rate: 0.014 },
    { from_currency: 'BDT', to_currency: 'INR', rate: 0.75 },
  ];

  try {
    // Delete existing exchange rates
    await client.query.from('exchange_rates').delete().execute();

    // Insert new exchange rates
    const ratesWithMetadata = exchangeRates.map((rate) => ({
      ...rate,
      source: 'manual',
      is_active: true,
      valid_from: new Date().toISOString(),
    }));

    const result = await client.query
      .from('exchange_rates')
      .insert(ratesWithMetadata)
      .execute();

    console.log(` Seeded ${exchangeRates.length} exchange rates`);
  } catch (error) {
    console.error('Error seeding exchange rates:', error.message);
    throw error;
  }
}

/**
 * Main seed function
 */
async function seed() {
  console.log('Starting currency seed...\n');

  try {
    await seedCurrencies();
    await seedExchangeRates();

    console.log('\n Currency seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n Currency seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();

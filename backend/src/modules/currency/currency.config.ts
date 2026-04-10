/**
 * Currency Configuration
 * Comprehensive multi-currency support for Vasty Shop
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimal_places: number;
  symbol_position: 'before' | 'after';
  thousand_separator: string;
  decimal_separator: string;
  symbol_spacing: boolean;
  exchange_rate?: number; // Relative to USD
  is_active: boolean;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 1.0,
    is_active: true,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimal_places: 0,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 149.5, // Example rate: 1 USD = 149.5 JPY
    is_active: true,
  },
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: true,
    exchange_rate: 110.0, // Example rate: 1 USD = 110 BDT
    is_active: true,
  },
  CAD: {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian Dollar',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 1.35, // Example rate: 1 USD = 1.35 CAD
    is_active: true,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 0.92, // Example rate: 1 USD = 0.92 EUR
    is_active: true,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 0.79, // Example rate: 1 USD = 0.79 GBP
    is_active: true,
  },
  AUD: {
    code: 'AUD',
    symbol: '$',
    name: 'Australian Dollar',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 1.52, // Example rate: 1 USD = 1.52 AUD
    is_active: true,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimal_places: 2,
    symbol_position: 'before',
    thousand_separator: ',',
    decimal_separator: '.',
    symbol_spacing: false,
    exchange_rate: 83.0, // Example rate: 1 USD = 83 INR
    is_active: true,
  },
};

// Country to Currency mapping for automatic detection
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  CA: 'CAD',
  JP: 'JPY',
  BD: 'BDT',
  GB: 'GBP',
  AU: 'AUD',
  IN: 'INR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  FI: 'EUR',
};

// Default currency configuration
export const DEFAULT_CURRENCY = 'USD';

// Currency preference priority
export enum CurrencyPreferencePriority {
  USER_PREFERENCE = 1,
  LOCATION_BASED = 2,
  SHOP_DEFAULT = 3,
  PLATFORM_DEFAULT = 4,
}

/**
 * Currency Configuration
 * Defines all supported currencies with formatting rules
 */

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: number;
  rounding: number;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandSeparator: string;
  countries: string[]; // ISO 3166-1 alpha-2 country codes
  isActive: boolean;
  displayOrder: number;
}

/**
 * All supported currencies configuration
 */
export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['US'],
    isActive: true,
    displayOrder: 1,
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['CA'],
    isActive: true,
    displayOrder: 2,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    symbolNative: '¥',
    decimalDigits: 0, // JPY has no decimal places
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['JP'],
    isActive: true,
    displayOrder: 3,
  },
  BDT: {
    code: 'BDT',
    name: 'Bangladeshi Taka',
    symbol: '৳',
    symbolNative: '৳',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['BD'],
    isActive: true,
    displayOrder: 4,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolNative: '€',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: ',',
    thousandSeparator: '.',
    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR'],
    isActive: true,
    displayOrder: 5,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    symbolNative: '£',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['GB'],
    isActive: true,
    displayOrder: 6,
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['AU'],
    isActive: true,
    displayOrder: 7,
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    symbolNative: '₹',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    countries: ['IN'],
    isActive: true,
    displayOrder: 8,
  },
};

/**
 * Default currency code
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * Country to currency mapping for auto-detection
 */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  CA: 'CAD',
  JP: 'JPY',
  BD: 'BDT',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  GB: 'GBP',
  AU: 'AUD',
  IN: 'INR',
};

/**
 * Language to currency mapping (fallback)
 */
export const LANGUAGE_TO_CURRENCY: Record<string, string> = {
  en: 'USD',
  'en-US': 'USD',
  'en-CA': 'CAD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-IN': 'INR',
  ja: 'JPY',
  'ja-JP': 'JPY',
  bn: 'BDT',
  'bn-BD': 'BDT',
  de: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  es: 'EUR',
  nl: 'EUR',
  pt: 'EUR',
  el: 'EUR',
  hi: 'INR',
};

/**
 * Get currency configuration by code
 */
export function getCurrencyConfig(code: string): CurrencyConfig | null {
  return CURRENCIES[code.toUpperCase()] || null;
}

/**
 * Get all active currencies
 */
export function getActiveCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES)
    .filter((currency) => currency.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Check if currency is supported
 */
export function isCurrencySupported(code: string): boolean {
  const currency = getCurrencyConfig(code);
  return currency !== null && currency.isActive;
}

/**
 * Get currency by country code
 */
export function getCurrencyByCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
}

/**
 * Get currency by language code
 */
export function getCurrencyByLanguage(languageCode: string): string {
  return LANGUAGE_TO_CURRENCY[languageCode.toLowerCase()] || DEFAULT_CURRENCY;
}

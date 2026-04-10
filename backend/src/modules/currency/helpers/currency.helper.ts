/**
 * Currency Helper Functions
 * Utility functions for currency operations throughout the application
 */

import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../currency.config';

/**
 * Quick format currency helper (no service injection needed)
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];

  if (!currency) {
    return `$${amount.toFixed(2)}`;
  }

  const roundedAmount = parseFloat(amount.toFixed(currency.decimal_places));
  const [integerPart, decimalPart] = roundedAmount
    .toFixed(currency.decimal_places)
    .split('.');

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    currency.thousand_separator,
  );

  let formattedNumber: string;
  if (currency.decimal_places > 0 && decimalPart) {
    formattedNumber = `${formattedInteger}${currency.decimal_separator}${decimalPart}`;
  } else {
    formattedNumber = formattedInteger;
  }

  const spacing = currency.symbol_spacing ? ' ' : '';

  if (currency.symbol_position === 'before') {
    return `${currency.symbol}${spacing}${formattedNumber}`;
  } else {
    return `${formattedNumber}${spacing}${currency.symbol}`;
  }
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const from = SUPPORTED_CURRENCIES[fromCurrency.toUpperCase()];
  const to = SUPPORTED_CURRENCIES[toCurrency.toUpperCase()];

  if (!from || !to) {
    return amount;
  }

  const amountInUSD = amount / (from.exchange_rate || 1);
  const convertedAmount = amountInUSD * (to.exchange_rate || 1);

  return parseFloat(convertedAmount.toFixed(to.decimal_places));
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
  return currency?.symbol || '$';
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
  return currency?.name || 'US Dollar';
}

/**
 * Check if currency is supported
 */
export function isCurrencySupported(currencyCode: string): boolean {
  return !!SUPPORTED_CURRENCIES[currencyCode.toUpperCase()];
}

/**
 * Format amount for API response (includes currency info)
 */
export function formatCurrencyResponse(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
): {
  amount: number;
  currency: string;
  formatted: string;
  symbol: string;
} {
  return {
    amount,
    currency: currencyCode.toUpperCase(),
    formatted: formatCurrency(amount, currencyCode),
    symbol: getCurrencySymbol(currencyCode),
  };
}

/**
 * Format multiple currency amounts (for comparison)
 */
export function formatMultiCurrency(
  amount: number,
  baseCurrency: string,
  targetCurrencies: string[],
): Array<{
  currency: string;
  amount: number;
  formatted: string;
}> {
  return targetCurrencies.map((currency) => {
    const converted = convertCurrency(amount, baseCurrency, currency);
    return {
      currency: currency.toUpperCase(),
      amount: converted,
      formatted: formatCurrency(converted, currency),
    };
  });
}

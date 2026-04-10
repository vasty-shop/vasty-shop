/**
 * Currency Service
 * Handles currency formatting, conversion, user preferences, and detection
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CURRENCIES,
  CurrencyConfig,
  DEFAULT_CURRENCY,
  getCurrencyConfig,
  getActiveCurrencies,
  isCurrencySupported,
  getCurrencyByCountry,
  getCurrencyByLanguage,
  COUNTRY_TO_CURRENCY,
} from './config/currencies.config';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  // In-memory cache for exchange rates (24 hour TTL)
  private exchangeRatesCache: Map<string, { rate: number; timestamp: Date }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private readonly db: DatabaseService) {}

  /**
   * Format amount with currency symbol and proper formatting
   *
   * Examples:
   * - formatCurrency(1234.56, 'USD') => "$1,234.56"
   * - formatCurrency(1234.56, 'EUR') => "€1.234,56"
   * - formatCurrency(1234, 'JPY') => "¥1,234"
   * - formatCurrency(1234.56, 'BDT') => "৳1,234.56"
   */
  formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
    const currency = getCurrencyConfig(currencyCode);

    if (!currency) {
      this.logger.warn(`Currency not found: ${currencyCode}, using default`);
      return this.formatCurrency(amount, DEFAULT_CURRENCY);
    }

    // Round to appropriate decimal places
    const roundedAmount = this.roundAmount(amount, currency.decimalDigits);

    // Format the number with separators
    const formattedNumber = this.formatNumber(
      roundedAmount,
      currency.decimalDigits,
      currency.thousandSeparator,
      currency.decimalSeparator,
    );

    // Add currency symbol
    if (currency.symbolPosition === 'before') {
      return `${currency.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber}${currency.symbol}`;
    }
  }

  /**
   * Convert amount from one currency to another
   *
   * Example:
   * - convertCurrency(100, 'USD', 'EUR') => 85.50
   */
  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    if (from === to) {
      return amount;
    }

    if (!isCurrencySupported(from) || !isCurrencySupported(to)) {
      throw new BadRequestException(`Unsupported currency: ${from} or ${to}`);
    }

    // Get exchange rate
    const rate = await this.getExchangeRate(from, to);

    // Convert amount
    const convertedAmount = amount * rate;

    // Round to appropriate decimal places for target currency
    const toCurrency = getCurrencyConfig(to);
    return this.roundAmount(convertedAmount, toCurrency?.decimalDigits || 2);
  }

  /**
   * Get user's preferred currency from database
   */
  async getUserCurrency(userId?: string): Promise<string> {
    if (!userId) {
      return DEFAULT_CURRENCY;
    }

    try {
      // Query user preferences from database
      const result = await this.db.queryEntities('user_preferences', {
        filters: { user_id: userId },
      });

      if (result.data && result.data.length > 0 && result.data[0].preferredCurrency) {
        const currency = result.data[0].preferredCurrency;
        if (isCurrencySupported(currency)) {
          return currency;
        }
      }

      return DEFAULT_CURRENCY;
    } catch (error) {
      this.logger.error(`Error fetching user currency: ${error.message}`);
      return DEFAULT_CURRENCY;
    }
  }

  /**
   * Update user's currency preference
   */
  async updateUserCurrency(userId: string, currencyCode: string): Promise<void> {
    if (!isCurrencySupported(currencyCode)) {
      throw new BadRequestException(`Unsupported currency: ${currencyCode}`);
    }

    try {
      // Check if user preferences exist
      const existing = await this.db.queryEntities('user_preferences', {
        filters: { user_id: userId },
      });

      if (existing.data && existing.data.length > 0) {
        // Update existing preference
        await this.db.updateEntity('user_preferences', existing.data[0].id, {
          preferredCurrency: currencyCode,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Insert new preference
        await this.db.createEntity('user_preferences', {
          userId: userId,
          preferredCurrency: currencyCode,
        });
      }

      this.logger.log(`Updated currency preference for user ${userId} to ${currencyCode}`);
    } catch (error) {
      this.logger.error(`Error updating user currency: ${error.message}`);
      throw new BadRequestException('Failed to update currency preference');
    }
  }

  /**
   * Detect currency based on country code or IP address
   */
  async detectCurrency(countryCode?: string, ipAddress?: string): Promise<string> {
    // If country code is provided, use it directly
    if (countryCode) {
      const currency = getCurrencyByCountry(countryCode);
      if (currency !== DEFAULT_CURRENCY) {
        return currency;
      }
    }

    // If IP address is provided, attempt geolocation
    if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      try {
        const detectedCountry = await this.detectCountryFromIP(ipAddress);
        if (detectedCountry) {
          return getCurrencyByCountry(detectedCountry);
        }
      } catch (error) {
        this.logger.warn(`IP geolocation failed: ${error.message}`);
      }
    }

    return DEFAULT_CURRENCY;
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): CurrencyConfig[] {
    return getActiveCurrencies();
  }

  /**
   * Get currency information by code
   */
  getCurrencyInfo(currencyCode: string): CurrencyConfig | null {
    return getCurrencyConfig(currencyCode);
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) {
      return 1;
    }

    const cacheKey = `${from}_${to}`;

    // Check cache first
    const cached = this.exchangeRatesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_TTL) {
      return cached.rate;
    }

    try {
      // Query exchange rate from database
      const result = await this.db.queryEntities('exchange_rates', {
        filters: {
          from_currency: from,
          to_currency: to,
          is_active: true,
        },
      });

      if (result.data && result.data.length > 0 && result.data[0].rate) {
        const rate = parseFloat(result.data[0].rate);

        // Cache the rate
        this.exchangeRatesCache.set(cacheKey, {
          rate,
          timestamp: new Date(),
        });

        return rate;
      }

      // If no direct rate found, try reverse rate
      const reverseResult = await this.db.queryEntities('exchange_rates', {
        filters: {
          from_currency: to,
          to_currency: from,
          is_active: true,
        },
      });

      if (reverseResult.data && reverseResult.data.length > 0 && reverseResult.data[0].rate) {
        const rate = 1 / parseFloat(reverseResult.data[0].rate);

        // Cache the rate
        this.exchangeRatesCache.set(cacheKey, {
          rate,
          timestamp: new Date(),
        });

        return rate;
      }

      // Fallback to static rates (for development/testing)
      return this.getStaticExchangeRate(from, to);
    } catch (error) {
      this.logger.error(`Error fetching exchange rate: ${error.message}`);
      return this.getStaticExchangeRate(from, to);
    }
  }

  /**
   * Get static exchange rates (fallback for development)
   * These are approximate rates and should be updated regularly in production
   */
  private getStaticExchangeRate(from: string, to: string): number {
    const rates: Record<string, Record<string, number>> = {
      USD: {
        CAD: 1.35,
        JPY: 150.0,
        BDT: 110.0,
        EUR: 0.92,
        GBP: 0.79,
        AUD: 1.52,
        INR: 83.0,
      },
      EUR: {
        USD: 1.09,
        GBP: 0.86,
        JPY: 163.0,
      },
      GBP: {
        USD: 1.27,
        EUR: 1.16,
      },
      JPY: {
        USD: 0.0067,
        EUR: 0.0061,
      },
      CAD: {
        USD: 0.74,
      },
      AUD: {
        USD: 0.66,
      },
      INR: {
        USD: 0.012,
      },
      BDT: {
        USD: 0.0091,
      },
    };

    return rates[from]?.[to] || 1;
  }

  /**
   * Detect country from IP address (simple implementation)
   * In production, use a proper IP geolocation service
   */
  private async detectCountryFromIP(ipAddress: string): Promise<string | null> {
    // This is a placeholder implementation
    // In production, integrate with services like:
    // - ipapi.co
    // - ip-api.com
    // - MaxMind GeoIP2

    this.logger.debug(`IP geolocation not implemented for: ${ipAddress}`);
    return null;
  }

  /**
   * Format number with thousand and decimal separators
   */
  private formatNumber(
    amount: number,
    decimalPlaces: number,
    thousandSeparator: string,
    decimalSeparator: string,
  ): string {
    const fixed = amount.toFixed(decimalPlaces);
    const [integerPart, decimalPart] = fixed.split('.');

    // Add thousand separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    // Combine integer and decimal parts
    if (decimalPlaces > 0 && decimalPart) {
      return `${formattedInteger}${decimalSeparator}${decimalPart}`;
    }

    return formattedInteger;
  }

  /**
   * Round amount to specified decimal places
   */
  private roundAmount(amount: number, decimalPlaces: number): number {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(amount * multiplier) / multiplier;
  }

  /**
   * Check if currency is supported
   */
  isCurrencySupported(currencyCode: string): boolean {
    return isCurrencySupported(currencyCode);
  }
}

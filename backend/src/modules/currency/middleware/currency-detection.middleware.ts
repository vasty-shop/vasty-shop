/**
 * Currency Detection Middleware
 * Automatically detects user's preferred currency based on various factors
 *
 * Detection Priority:
 * 1. User preference (from database)
 * 2. IP geolocation
 * 3. Accept-Language header
 * 4. Default to USD
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CurrencyService } from '../currency.service';
import {
  getCurrencyByLanguage,
  isCurrencySupported,
  DEFAULT_CURRENCY,
} from '../config/currencies.config';

// Extend Express Request to include currency info
declare global {
  namespace Express {
    interface Request {
      userCurrency?: string;
      currencySource?: 'user_preference' | 'ip_location' | 'accept_language' | 'default';
      userId?: string; // Set by auth middleware
    }
  }
}

@Injectable()
export class CurrencyDetectionMiddleware implements NestMiddleware {
  constructor(private readonly currencyService: CurrencyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      let detectedCurrency = DEFAULT_CURRENCY;
      let source: 'user_preference' | 'ip_location' | 'accept_language' | 'default' = 'default';

      // 1. Check for user preference (if user is authenticated)
      if (req.userId) {
        const userCurrency = await this.currencyService.getUserCurrency(req.userId);
        if (userCurrency && isCurrencySupported(userCurrency)) {
          detectedCurrency = userCurrency;
          source = 'user_preference';
          req.userCurrency = detectedCurrency;
          req.currencySource = source;
          res.setHeader('X-Currency', detectedCurrency);
          res.setHeader('X-Currency-Source', source);
          return next();
        }
      }

      // 2. Try IP geolocation detection
      const ipAddress = this.getClientIp(req);
      if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
        const ipCurrency = await this.currencyService.detectCurrency(undefined, ipAddress);
        if (ipCurrency && ipCurrency !== DEFAULT_CURRENCY && isCurrencySupported(ipCurrency)) {
          detectedCurrency = ipCurrency;
          source = 'ip_location';
          req.userCurrency = detectedCurrency;
          req.currencySource = source;
          res.setHeader('X-Currency', detectedCurrency);
          res.setHeader('X-Currency-Source', source);
          return next();
        }
      }

      // 3. Check Accept-Language header
      const acceptLanguage = req.headers['accept-language'];
      if (acceptLanguage) {
        const languageCurrency = this.detectCurrencyFromLanguage(acceptLanguage);
        if (languageCurrency && isCurrencySupported(languageCurrency)) {
          detectedCurrency = languageCurrency;
          source = 'accept_language';
        }
      }

      // Set the detected currency
      req.userCurrency = detectedCurrency;
      req.currencySource = source;

      // Set currency headers
      res.setHeader('X-Currency', detectedCurrency);
      res.setHeader('X-Currency-Source', source);
    } catch (error) {
      // Don't block request if currency detection fails
      req.userCurrency = DEFAULT_CURRENCY;
      req.currencySource = 'default';
      res.setHeader('X-Currency', DEFAULT_CURRENCY);
      res.setHeader('X-Currency-Source', 'default');
    }

    next();
  }

  /**
   * Extract client IP address from request
   */
  private getClientIp(req: Request): string {
    // Check X-Forwarded-For header (set by proxies)
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    // Check X-Real-IP header (set by nginx)
    const realIp = req.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }

    // Fallback to socket address
    return req.socket.remoteAddress || '';
  }

  /**
   * Detect currency from Accept-Language header
   * Example: "en-US,en;q=0.9,ja;q=0.8" -> USD
   */
  private detectCurrencyFromLanguage(acceptLanguage: string): string {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const parts = lang.trim().split(';');
        const code = parts[0].trim();
        const qValue = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { code, qValue };
      })
      .sort((a, b) => b.qValue - a.qValue);

    // Try to find a currency for the preferred languages
    for (const lang of languages) {
      const currency = getCurrencyByLanguage(lang.code);
      if (currency && currency !== DEFAULT_CURRENCY) {
        return currency;
      }
    }

    return DEFAULT_CURRENCY;
  }
}

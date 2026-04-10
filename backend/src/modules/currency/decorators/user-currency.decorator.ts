/**
 * User Currency Decorator
 * Extracts the detected currency from the request
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get the user's detected currency from the request
 *
 * Usage:
 * ```typescript
 * @Get('products')
 * getProducts(@UserCurrency() currency: string) {
 *   // currency will be the detected currency code (e.g., 'USD', 'EUR', etc.)
 * }
 * ```
 */
export const UserCurrency = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Currency is set by the CurrencyDetectionMiddleware
    return request.userCurrency || 'USD';
  },
);

/**
 * Decorator to get the full currency detection info from the request
 *
 * Usage:
 * ```typescript
 * @Get('products')
 * getProducts(@CurrencyInfo() currencyInfo: { currency: string, source: string }) {
 *   // currencyInfo.currency - the detected currency code
 *   // currencyInfo.source - how it was detected ('user_preference', 'ip_location', etc.)
 * }
 * ```
 */
export const CurrencyInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): { currency: string; source: string } => {
    const request = ctx.switchToHttp().getRequest();

    return {
      currency: request.userCurrency || 'USD',
      source: request.currencySource || 'default',
    };
  },
);

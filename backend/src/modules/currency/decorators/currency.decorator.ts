/**
 * Currency Decorators
 * Custom decorators for currency handling in controllers
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get user's currency from request
 * Usage: @UserCurrency() currency: string
 */
export const UserCurrency = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.userCurrency || 'USD';
  },
);

/**
 * Get detected currency from request
 * Usage: @DetectedCurrency() currency: string
 */
export const DetectedCurrency = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.detectedCurrency || 'USD';
  },
);

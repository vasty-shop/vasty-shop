/**
 * Currency Module
 * Provides currency management functionality across the application
 *
 * Features:
 * - Currency formatting with proper symbols and separators
 * - Currency conversion with exchange rates
 * - Auto-detection based on user preference, IP location, or language
 * - User currency preference management
 * - Support for 8 major currencies: USD, CAD, JPY, BDT, EUR, GBP, AUD, INR
 */

import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { CurrencyDetectionMiddleware } from './middleware/currency-detection.middleware';

@Global() // Make currency service available globally
@Module({
  imports: [],
  providers: [CurrencyService, CurrencyDetectionMiddleware],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply currency detection middleware to all routes
    consumer.apply(CurrencyDetectionMiddleware).forRoutes('*');
  }
}

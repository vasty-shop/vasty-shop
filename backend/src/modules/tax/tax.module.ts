import { Module } from '@nestjs/common';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { TaxProviderService } from './tax-provider.service';

/**
 * Tax module.
 *
 * Exposes two services:
 *
 * - `TaxProviderService` (NEW, pluggable)
 *   Façade over the multi-provider adapter (manual-rules, stripe-tax,
 *   taxjar, none). Pick a provider with `TAX_PROVIDER` in .env.
 *   See `docs/providers/tax.md`.
 *
 * - `TaxService` (legacy, reads tax-rates.config directly)
 *   Still exported for backwards compatibility. Functionally
 *   equivalent to the `manual-rules` provider. A follow-up PR will
 *   migrate its internals to delegate to TaxProviderService.
 */
@Module({
  controllers: [TaxController],
  providers: [TaxService, TaxProviderService],
  exports: [TaxService, TaxProviderService],
})
export class TaxModule {}

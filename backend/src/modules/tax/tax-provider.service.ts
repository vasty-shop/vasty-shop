/**
 * TaxProviderService — the pluggable façade over the tax adapter.
 *
 * New code should inject this instead of the legacy `TaxService`.
 * Switching providers (manual-rules → stripe-tax → taxjar) is just
 * a matter of changing `TAX_PROVIDER` in .env.
 *
 * The legacy `TaxService` (tax.service.ts) still exists and still
 * directly reads `tax-rates.config`. It's functionally equivalent
 * to the `manual-rules` provider here. A follow-up PR will migrate
 * `TaxService.calculateTax()` to delegate to `TaxProviderService`
 * and unify the two code paths.
 *
 * See `./providers/` and `docs/providers/tax.md`.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createTaxProvider,
  CalculateTaxInput,
  CalculateTaxResult,
  CommitTransactionInput,
  TaxProvider,
} from './providers';

@Injectable()
export class TaxProviderService implements OnModuleInit {
  private readonly logger = new Logger(TaxProviderService.name);
  private provider!: TaxProvider;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.provider = createTaxProvider(this.config);
    this.logger.log(
      `Tax provider initialized: ${this.provider.name} (available=${this.provider.isAvailable()})`,
    );
  }

  getProviderName(): string {
    return this.provider?.name ?? 'manual-rules';
  }

  isAvailable(): boolean {
    return !!this.provider && this.provider.isAvailable();
  }

  async calculateTax(input: CalculateTaxInput): Promise<CalculateTaxResult> {
    return this.provider.calculateTax(input);
  }

  async commitTransaction(input: CommitTransactionInput): Promise<void> {
    return this.provider.commitTransaction(input);
  }

  async refundTransaction(
    transactionId: string,
    amount?: number,
  ): Promise<void> {
    return this.provider.refundTransaction(transactionId, amount);
  }

  getProvider(): TaxProvider {
    return this.provider;
  }
}

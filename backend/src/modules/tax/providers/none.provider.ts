/**
 * "None" tax provider — returns zero tax for everything.
 *
 * Use this when the frontend never shows tax as a separate line
 * (e.g. prices are already tax-inclusive in the product display) AND
 * the operator has no compliance requirement to track tax on orders.
 *
 * Unlike the other `none` providers in this repo, this one does NOT
 * throw — it returns a valid zero-tax result. That's intentional:
 * tax calculation is a hot-path operation on every cart preview, and
 * throwing would break checkout for operators who simply don't want
 * to configure tax. If you need the "fail loudly" behavior, switch
 * to `manual-rules` and add a rate of 0 to your country's config.
 */
import { Logger } from '@nestjs/common';
import {
  CalculateTaxInput,
  CalculateTaxResult,
  CommitTransactionInput,
  TaxProvider,
} from './tax-provider.interface';

export class NoneTaxProvider implements TaxProvider {
  readonly name = 'none' as const;
  private readonly logger = new Logger('NoneTaxProvider');

  constructor() {
    this.logger.log(
      'Tax is set to NONE — every calculation returns zero tax. Set TAX_PROVIDER to manual-rules, stripe-tax, or taxjar to enable tax calculation.',
    );
  }

  isAvailable(): boolean {
    // "Available" in the sense that calling it is valid — it returns
    // a zero quote instead of throwing.
    return true;
  }

  async calculateTax(input: CalculateTaxInput): Promise<CalculateTaxResult> {
    return {
      totalTax: 0,
      lineItems: input.lineItems.map((item) => ({
        lineItemId: item.id,
        taxAmount: 0,
        taxRate: 0,
      })),
      provider: 'none',
      jurisdictionName: input.toAddress.country,
    };
  }

  async commitTransaction(_input: CommitTransactionInput): Promise<void> {
    /* no-op */
  }

  async refundTransaction(
    _transactionId: string,
    _amount?: number,
  ): Promise<void> {
    /* no-op */
  }
}

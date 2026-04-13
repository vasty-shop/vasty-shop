/**
 * Manual rules tax provider — the default.
 *
 *   TAX_PROVIDER=manual-rules    (default)
 *
 * Uses the existing `tax-rates.config.ts` hardcoded rates that
 * Vasty Shop has always shipped with. Zero infrastructure, zero
 * external API calls, zero cost — but **not tax compliance advice**.
 * This is a starting point, not an audit-ready solution.
 *
 * For real compliance, graduate to `stripe-tax`, `taxjar`, or
 * `avalara`.
 *
 * Supported countries (defined in `tax-rates.config.ts`):
 *   JP — Japan: 10% standard, 8% on reduced-rate food
 *   BD — Bangladesh: 15% VAT with per-category overrides
 *   CA — Canada: per-province GST + PST or HST
 *
 * Rates in the config file are stored as percentages (10.0 = 10%),
 * which this provider converts to the normalized 0-1 decimal used
 * by the unified `CalculateTaxResult.taxRate` field.
 *
 * Adding a country = editing `tax-rates.config.ts`. No provider code
 * changes needed.
 */
import { Logger } from '@nestjs/common';
import {
  CalculateTaxInput,
  CalculateTaxResult,
  CommitTransactionInput,
  TaxLineBreakdown,
  TaxProvider,
} from './tax-provider.interface';
import {
  getTaxConfig,
  isSupportedCountry,
  TaxCategory,
} from '../config/tax-rates.config';

export class ManualRulesTaxProvider implements TaxProvider {
  readonly name = 'manual-rules' as const;
  private readonly logger = new Logger('ManualRulesTaxProvider');

  constructor() {
    this.logger.log(
      'Manual rules tax provider configured (using tax-rates.config hardcoded rates)',
    );
  }

  isAvailable(): boolean {
    // Always available — no external deps.
    return true;
  }

  async calculateTax(input: CalculateTaxInput): Promise<CalculateTaxResult> {
    const countryCode = input.toAddress.country.toUpperCase();

    if (!isSupportedCountry(countryCode)) {
      this.logger.warn(
        `Country "${countryCode}" has no manual tax config — returning zero tax`,
      );
      return this.zeroTax(input, countryCode);
    }

    const config = getTaxConfig(countryCode);
    if (!config) {
      return this.zeroTax(input, countryCode);
    }

    const lineBreakdowns: TaxLineBreakdown[] = [];
    let totalTax = 0;
    let jurisdictionName = config.countryName;

    // Canada: if we know the province, prefer its blended rate
    let canadaProvince: NonNullable<
      typeof config.provinceRates
    >[string] | undefined;
    if (
      countryCode === 'CA' &&
      config.provinceRates &&
      input.toAddress.state
    ) {
      canadaProvince =
        config.provinceRates[input.toAddress.state.toUpperCase()];
      if (canadaProvince) {
        jurisdictionName = `${canadaProvince.provinceName}, ${config.countryName}`;
      }
    }

    // All arithmetic from here on operates in INTEGER MINOR UNITS
    // (cents/paisa) to match the TaxLineItem contract and avoid
    // float-accumulation drift. Rates live in config as percentages
    // (e.g. 10 = 10%), so we compute taxed = round(subtotalMinor *
    // ratePercent / 100) per line, then sum integer results.
    for (const item of input.lineItems) {
      const subtotalMinor = item.unitPrice * item.quantity;

      // Resolve rate (stored in config as percentages, e.g. 10.0 = 10%).
      let ratePercent: number;
      const jurisdictions: NonNullable<
        TaxLineBreakdown['jurisdictions']
      > = [];

      const taxOf = (percent: number): number =>
        Math.round((subtotalMinor * percent) / 100);

      if (canadaProvince) {
        // Canada: use the province's totalRate as the single combined rate,
        // but break it down into GST / PST / HST jurisdictions for the
        // customer-facing display.
        ratePercent = canadaProvince.totalRate;

        if (canadaProvince.hst !== undefined && canadaProvince.hst > 0) {
          jurisdictions.push({
            name: `HST (${canadaProvince.provinceName})`,
            rate: canadaProvince.hst / 100,
            amount: taxOf(canadaProvince.hst),
            type: 'state',
          });
        } else {
          if (canadaProvince.gst !== undefined && canadaProvince.gst > 0) {
            jurisdictions.push({
              name: 'GST (Canada)',
              rate: canadaProvince.gst / 100,
              amount: taxOf(canadaProvince.gst),
              type: 'country',
            });
          }
          if (canadaProvince.pst !== undefined && canadaProvince.pst > 0) {
            jurisdictions.push({
              name: `PST (${canadaProvince.provinceName})`,
              rate: canadaProvince.pst / 100,
              amount: taxOf(canadaProvince.pst),
              type: 'state',
            });
          }
        }
      } else {
        // Non-Canada or Canada without a known province: use category
        // rate if the item has one, otherwise the default country rate.
        //
        // Categories from the unified CalculateTaxInput are case-
        // insensitive strings (e.g. 'essential_food' or 'clothing').
        // The config's TaxCategory enum keys are uppercase constants
        // (e.g. 'ESSENTIAL_FOOD'). Normalize for the lookup so callers
        // don't need to know the repo-internal convention.
        const categoryKey = item.category
          ? (item.category.toUpperCase() as TaxCategory)
          : undefined;
        if (categoryKey && config.categoryRates?.[categoryKey] !== undefined) {
          ratePercent = config.categoryRates[categoryKey];
        } else {
          ratePercent = config.defaultRate;
        }

        jurisdictions.push({
          name: config.countryName,
          rate: ratePercent / 100,
          amount: taxOf(ratePercent),
          type: 'country',
        });
      }

      // Sum jurisdiction amounts for the line total so the breakdown
      // and the reported total never drift apart due to independent
      // round-per-jurisdiction vs round-per-line.
      const lineTaxMinor = jurisdictions.reduce((s, j) => s + j.amount, 0);
      lineBreakdowns.push({
        lineItemId: item.id,
        taxAmount: lineTaxMinor,
        taxRate: ratePercent / 100,
        jurisdictions,
      });
      totalTax += lineTaxMinor;
    }

    return {
      totalTax,
      lineItems: lineBreakdowns,
      provider: 'manual-rules',
      jurisdictionName,
    };
  }

  async commitTransaction(_input: CommitTransactionInput): Promise<void> {
    // No-op. Manual rules don't track transactions for compliance
    // reporting — the order row in the database is the source of truth.
  }

  async refundTransaction(
    _transactionId: string,
    _amount?: number,
  ): Promise<void> {
    // No-op. See commitTransaction.
  }

  private zeroTax(
    input: CalculateTaxInput,
    countryCode: string,
  ): CalculateTaxResult {
    return {
      totalTax: 0,
      lineItems: input.lineItems.map((item) => ({
        lineItemId: item.id,
        taxAmount: 0,
        taxRate: 0,
      })),
      provider: 'manual-rules',
      jurisdictionName: countryCode,
    };
  }
}

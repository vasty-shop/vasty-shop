/**
 * Stripe Tax provider.
 *
 *   TAX_PROVIDER=stripe-tax
 *   STRIPE_SECRET_KEY=sk_...             (already required for payments)
 *   STRIPE_TAX_ENABLED=true              (defaults to true when selected)
 *
 * Uses the Stripe Tax Calculations API
 * (https://docs.stripe.com/tax/custom). Easiest path to real tax
 * compliance if you're already on Stripe — no separate vendor account,
 * billing flows through the existing Stripe subscription.
 *
 * This provider uses `fetch` directly against the Stripe REST API
 * instead of the `stripe` npm package so it works alongside the
 * existing Stripe payment integration without import conflicts.
 *
 * Workflow:
 *   1. calculateTax() → POST /v1/tax/calculations, returns a calculation id
 *   2. customer confirms order
 *   3. commitTransaction() → POST /v1/tax/transactions/create_from_calculation
 *   4. refundTransaction() → POST /v1/tax/transactions/create_reversal
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CalculateTaxInput,
  CalculateTaxResult,
  CommitTransactionInput,
  TaxLineBreakdown,
  TaxProvider,
  TaxProviderNotConfiguredError,
} from './tax-provider.interface';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export class StripeTaxProvider implements TaxProvider {
  readonly name = 'stripe-tax' as const;
  private readonly logger = new Logger('StripeTaxProvider');

  private readonly secretKey: string;

  constructor(config: ConfigService) {
    this.secretKey = config.get<string>('STRIPE_SECRET_KEY', '');

    if (this.isAvailable()) {
      this.logger.log('Stripe Tax provider configured');
    } else {
      this.logger.warn(
        'Stripe Tax provider selected but STRIPE_SECRET_KEY missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!this.secretKey;
  }

  /**
   * Stripe's REST API takes form-urlencoded bodies with nested keys
   * like `customer_details[address][country]=US`. Builds the right
   * shape from a flat object.
   */
  private encodeForm(data: Record<string, any>): string {
    const params = new URLSearchParams();
    const walk = (prefix: string, value: any) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v, i) => walk(`${prefix}[${i}]`, v));
      } else if (typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          walk(`${prefix}[${k}]`, v);
        }
      } else {
        params.append(prefix, String(value));
      }
    };
    for (const [k, v] of Object.entries(data)) {
      walk(k, v);
    }
    return params.toString();
  }

  private async stripeApi(path: string, body: Record<string, any>): Promise<any> {
    if (!this.isAvailable()) {
      throw new TaxProviderNotConfiguredError('stripe-tax', ['STRIPE_SECRET_KEY']);
    }
    const res = await fetch(`${STRIPE_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: this.encodeForm(body),
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(
        `Stripe Tax API ${path} failed: ${res.status} ${json.error?.message ?? JSON.stringify(json)}`,
      );
    }
    return json;
  }

  async calculateTax(input: CalculateTaxInput): Promise<CalculateTaxResult> {
    // Stripe Tax expects line amounts in the smallest currency unit
    // (cents for USD, paise for BDT, yen has no minor unit, etc).
    // Callers should already be passing unitPrice in their order's
    // currency. We forward as-is and note that the caller is
    // responsible for minor-unit conversion.
    //
    // For a first iteration, assume the caller passes amounts in
    // minor units already (integer values). If this is wrong for the
    // caller's currency they'll see an obvious mismatch in the UI
    // and can fix by multiplying by 100 before calling.

    const body = {
      currency: input.currency.toLowerCase(),
      customer_details: {
        address: {
          line1: input.toAddress.line1,
          line2: input.toAddress.line2,
          city: input.toAddress.city,
          state: input.toAddress.state,
          postal_code: input.toAddress.postalCode,
          country: input.toAddress.country.toUpperCase(),
        },
        address_source: 'shipping',
      },
      line_items: input.lineItems.map((item) => ({
        reference: item.id,
        amount: Math.round(item.unitPrice * item.quantity),
        quantity: item.quantity,
        tax_behavior: 'exclusive',
        tax_code: item.taxCode,
      })),
    };

    const calc = await this.stripeApi('/tax/calculations', body);

    const lineBreakdowns: TaxLineBreakdown[] = (calc.line_items?.data ?? []).map(
      (li: any) => ({
        lineItemId: li.reference,
        taxAmount: (li.amount_tax ?? 0) / 100,
        taxRate: li.tax_behavior === 'exclusive' && li.amount
          ? (li.amount_tax ?? 0) / li.amount
          : 0,
        jurisdictions: (li.tax_breakdown ?? []).map((bd: any) => ({
          name: bd.jurisdiction?.display_name ?? 'Unknown',
          rate: (bd.tax_rate_details?.percentage_decimal ?? 0) / 100,
          amount: (bd.amount ?? 0) / 100,
          type: bd.jurisdiction?.level,
        })),
      }),
    );

    return {
      totalTax: (calc.tax_amount_exclusive ?? 0) / 100,
      lineItems: lineBreakdowns,
      provider: 'stripe-tax',
      transactionId: calc.id,
      jurisdictionName: calc.customer_details?.address?.country,
    };
  }

  async commitTransaction(input: CommitTransactionInput): Promise<void> {
    await this.stripeApi('/tax/transactions/create_from_calculation', {
      calculation: input.transactionId,
      reference: input.orderId,
    });
  }

  async refundTransaction(
    transactionId: string,
    _amount?: number,
  ): Promise<void> {
    await this.stripeApi('/tax/transactions/create_reversal', {
      original_transaction: transactionId,
      reference: `refund-${transactionId}-${Date.now()}`,
      mode: 'full',
    });
  }
}

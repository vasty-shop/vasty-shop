/**
 * TaxJar provider.
 *
 *   TAX_PROVIDER=taxjar
 *   TAXJAR_API_KEY=...
 *   TAXJAR_SANDBOX=false          # set true to use sandbox.taxjar.com
 *
 * Pure REST via fetch. TaxJar is a specialist US sales-tax compliance
 * API — great for marketplaces that mostly ship within the US and
 * need economic-nexus tracking. Free tier: 200 calculations/month.
 *
 * Sign up at https://www.taxjar.com. Sandbox requires separate signup.
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

export class TaxJarProvider implements TaxProvider {
  readonly name = 'taxjar' as const;
  private readonly logger = new Logger('TaxJarProvider');

  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('TAXJAR_API_KEY', '');
    const sandbox =
      String(config.get<string>('TAXJAR_SANDBOX', 'false')).toLowerCase() ===
      'true';
    this.baseUrl = sandbox
      ? 'https://api.sandbox.taxjar.com/v2'
      : 'https://api.taxjar.com/v2';

    if (this.isAvailable()) {
      this.logger.log(`TaxJar provider configured (${this.baseUrl})`);
    } else {
      this.logger.warn('TaxJar provider selected but TAXJAR_API_KEY missing');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private async taxjarApi(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: any,
  ): Promise<any> {
    if (!this.isAvailable()) {
      throw new TaxProviderNotConfiguredError('taxjar', ['TAXJAR_API_KEY']);
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(
        `TaxJar API ${method} ${path} failed: ${res.status} ${json.error ?? JSON.stringify(json)}`,
      );
    }
    return json;
  }

  async calculateTax(input: CalculateTaxInput): Promise<CalculateTaxResult> {
    // TaxJar POST /v2/taxes shape:
    //   from_country / from_state / from_city / from_zip / from_street
    //   to_country / to_state / to_city / to_zip / to_street
    //   amount (total of line items before tax, in currency units)
    //   shipping
    //   line_items: [{ id, quantity, product_tax_code, unit_price, discount }]
    const amount = input.lineItems.reduce(
      (sum, li) => sum + li.unitPrice * li.quantity,
      0,
    );

    const body = {
      from_country: input.fromAddress.country.toUpperCase(),
      from_state: input.fromAddress.state,
      from_city: input.fromAddress.city,
      from_zip: input.fromAddress.postalCode,
      from_street: input.fromAddress.line1,
      to_country: input.toAddress.country.toUpperCase(),
      to_state: input.toAddress.state,
      to_city: input.toAddress.city,
      to_zip: input.toAddress.postalCode,
      to_street: input.toAddress.line1,
      amount,
      shipping: 0,
      line_items: input.lineItems.map((li) => ({
        id: li.id,
        quantity: li.quantity,
        product_tax_code: li.taxCode,
        unit_price: li.unitPrice,
      })),
    };

    const { tax } = (await this.taxjarApi('POST', '/taxes', body)) as {
      tax: {
        amount_to_collect?: number;
        rate?: number;
        breakdown?: {
          line_items?: Array<{
            id: string;
            tax_collectable?: number;
            combined_tax_rate?: number;
            state_tax_collectable?: number;
            state_sales_tax_rate?: number;
            county_tax_collectable?: number;
            county_tax_rate?: number;
            city_tax_collectable?: number;
            city_tax_rate?: number;
            special_district_tax_collectable?: number;
            special_tax_rate?: number;
          }>;
        };
      };
    };

    const lineBreakdowns: TaxLineBreakdown[] = (
      tax.breakdown?.line_items ?? []
    ).map((li) => ({
      lineItemId: li.id,
      taxAmount: li.tax_collectable ?? 0,
      taxRate: li.combined_tax_rate ?? 0,
      jurisdictions: [
        li.state_tax_collectable
          ? {
              name: 'State',
              rate: li.state_sales_tax_rate ?? 0,
              amount: li.state_tax_collectable,
              type: 'state' as const,
            }
          : null,
        li.county_tax_collectable
          ? {
              name: 'County',
              rate: li.county_tax_rate ?? 0,
              amount: li.county_tax_collectable,
              type: 'county' as const,
            }
          : null,
        li.city_tax_collectable
          ? {
              name: 'City',
              rate: li.city_tax_rate ?? 0,
              amount: li.city_tax_collectable,
              type: 'city' as const,
            }
          : null,
        li.special_district_tax_collectable
          ? {
              name: 'Special',
              rate: li.special_tax_rate ?? 0,
              amount: li.special_district_tax_collectable,
              type: 'special' as const,
            }
          : null,
      ].filter((j): j is NonNullable<typeof j> => j !== null),
    }));

    return {
      totalTax: tax.amount_to_collect ?? 0,
      lineItems: lineBreakdowns,
      provider: 'taxjar',
      // TaxJar doesn't return a transaction id from /taxes — the
      // order id from commitTransaction becomes the transaction key.
      transactionId: undefined,
    };
  }

  async commitTransaction(input: CommitTransactionInput): Promise<void> {
    // TaxJar records committed transactions via POST /v2/transactions/orders.
    // This is required for economic-nexus reporting. Minimal payload
    // that satisfies the API schema; richer data would use the full
    // calculateTax input.
    await this.taxjarApi('POST', '/transactions/orders', {
      transaction_id: input.orderId,
      transaction_date: new Date().toISOString(),
      to_country: 'US', // caller-provided address would be better; this is a placeholder
      to_zip: '00000',
      to_state: 'NA',
      amount: input.totalAmount,
      shipping: 0,
      sales_tax: input.totalTax,
    });
  }

  async refundTransaction(
    transactionId: string,
    amount?: number,
  ): Promise<void> {
    // POST /v2/transactions/refunds — full refund by default.
    await this.taxjarApi('POST', '/transactions/refunds', {
      transaction_id: `refund-${transactionId}-${Date.now()}`,
      transaction_reference_id: transactionId,
      transaction_date: new Date().toISOString(),
      to_country: 'US',
      to_zip: '00000',
      to_state: 'NA',
      amount: amount ?? 0,
      shipping: 0,
      sales_tax: 0,
    });
  }
}

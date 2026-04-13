/**
 * Common interface that every tax provider implements.
 *
 * Pick a provider by setting TAX_PROVIDER in your .env to one of:
 *
 *   manual-rules  - Admin-configured tax rates (the existing
 *                   `TaxService` + `tax-rates.config`). Zero infra,
 *                   not tax-compliance advice — a starting point.
 *                   The default.
 *
 *   stripe-tax    - Stripe Tax. Requires a Stripe account with
 *                   Tax enabled. Easiest path to real compliance
 *                   if you're already on Stripe.
 *
 *   taxjar        - TaxJar API. Good for US sales tax compliance.
 *
 *   avalara       - Avalara AvaTax. Enterprise-grade global tax.
 *                   [PLANNED follow-up — not implemented in this PR]
 *
 *   none          - Returns zero tax for everything. Use only if
 *                   the frontend never shows tax to the customer.
 *
 * Adding a new provider: implement this interface, register it in
 * providers/index.ts, document the env vars in docs/providers/tax.md.
 */

export interface TaxAddress {
  country: string; // ISO 3166-1 alpha-2 (e.g. "US", "BD", "JP")
  state?: string; // ISO 3166-2 state/province code
  city?: string;
  postalCode?: string;
  line1?: string;
  line2?: string;
}

export interface TaxLineItem {
  id: string;
  description?: string;
  /**
   * Price per unit BEFORE tax, expressed in INTEGER MINOR UNITS of
   * the order's currency (cents for USD, paisa for BDT, etc.).
   * Contract mirrors payment-provider.interface so the same integer
   * amounts can flow end-to-end without lossy float conversions.
   */
  unitPrice: number;
  quantity: number;
  /** Optional tax category (e.g. 'food', 'clothing', 'digital'). */
  category?: string;
  /** Optional HTS/TIC/SaaS tax code the provider recognizes. */
  taxCode?: string;
}

export interface CalculateTaxInput {
  /** ISO 4217 currency code, e.g. "USD", "BDT". */
  currency: string;
  /** Shipping origin (seller / vendor warehouse). */
  fromAddress: TaxAddress;
  /** Shipping destination (customer). */
  toAddress: TaxAddress;
  /** Line items to tax. */
  lineItems: TaxLineItem[];
  /**
   * Optional opaque customer id — used by providers like TaxJar /
   * Avalara that support exemption certificates per customer.
   */
  customerId?: string;
}

export interface TaxLineBreakdown {
  /** Matches the input line item id. */
  lineItemId: string;
  /**
   * Tax amount for this line, in INTEGER MINOR UNITS of the order's
   * currency (cents for USD, paisa for BDT). Matches the input
   * unit convention — no lossy dollar↔cent conversion on the way out.
   */
  taxAmount: number;
  /** Effective tax rate applied to the line (0.15 = 15%). */
  taxRate: number;
  /** Jurisdiction breakdown if the provider reports it. */
  jurisdictions?: Array<{
    name: string;
    rate: number;
    /** Jurisdiction-level tax amount in integer minor units. */
    amount: number;
    type?: 'country' | 'state' | 'county' | 'city' | 'special';
  }>;
}

export interface CalculateTaxResult {
  /** Total tax across all line items, in INTEGER MINOR UNITS. */
  totalTax: number;
  /** Per-line breakdown in the same order as the input. */
  lineItems: TaxLineBreakdown[];
  /** Provider name that produced the quote. */
  provider: string;
  /** Provider-specific transaction id / quote id (for later commit). */
  transactionId?: string;
  /** Jurisdiction name shown to the customer (e.g. "Tokyo, Japan"). */
  jurisdictionName?: string;
}

export interface CommitTransactionInput {
  /** Provider transactionId from the earlier `calculateTax` call. */
  transactionId: string;
  /** Business order id the tax is being committed against. */
  orderId: string;
  /** Final totals at checkout. Providers verify these match the quote. */
  totalAmount: number;
  totalTax: number;
}

export interface TaxProvider {
  /** Stable provider name for logging / clients. */
  readonly name:
    | 'manual-rules'
    | 'stripe-tax'
    | 'taxjar'
    | 'avalara'
    | 'none';

  /** True if the provider has the credentials/config it needs. */
  isAvailable(): boolean;

  /**
   * Calculate tax for a prospective order. Returns a quote that can
   * be shown to the customer at checkout.
   */
  calculateTax(input: CalculateTaxInput): Promise<CalculateTaxResult>;

  /**
   * Finalize a previously-quoted tax calculation once the order is
   * placed. Providers like TaxJar and Avalara need this to record
   * the transaction for compliance reporting.
   *
   * manual-rules and none no-op this method (just return).
   */
  commitTransaction(input: CommitTransactionInput): Promise<void>;

  /**
   * Refund a previously-committed transaction. Used when an order
   * is canceled or returned.
   */
  refundTransaction(transactionId: string, amount?: number): Promise<void>;
}

/**
 * Thrown when a provider is asked to do something it doesn't support.
 */
export class TaxProviderNotSupportedError extends Error {
  constructor(provider: string, operation: string) {
    super(
      `Operation "${operation}" is not supported by the "${provider}" tax provider. See docs/providers/tax.md.`,
    );
    this.name = 'TaxProviderNotSupportedError';
  }
}

/**
 * Thrown when a provider is selected but its credentials are missing.
 */
export class TaxProviderNotConfiguredError extends Error {
  constructor(provider: string, missingVars: string[]) {
    super(
      `Tax provider "${provider}" is selected but the following env vars are missing: ${missingVars.join(', ')}. See docs/providers/tax.md.`,
    );
    this.name = 'TaxProviderNotConfiguredError';
  }
}

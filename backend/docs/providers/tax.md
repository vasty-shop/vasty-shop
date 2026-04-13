# Tax providers

Vasty Shop supports three tax backends (plus a `none` that returns
zero) for calculating sales tax / VAT / GST at checkout.

```
TAX_PROVIDER=manual-rules   # zero-infra default
```

## Comparison

| Provider | Cost | Compliance-grade | Supports | Best for |
|---|---|---|---|---|
| **manual-rules** *(default)* | free | **no** — hardcoded rates | JP, BD, CA | dev + small self-hosted |
| **stripe-tax** | $0.05/txn | ✅ | every country Stripe supports | already on Stripe |
| **taxjar** | 200 free/mo, then paid | ✅ (US) | US + limited international | US-focused marketplaces |
| **avalara** | enterprise pricing | ✅ global | everywhere | enterprise *(planned #23)* |
| **none** | — | — | — | prices are already tax-inclusive |

## Which should I pick?

- **"I just want checkout to work"** → `manual-rules` (no infra, no keys)
- **Real US/EU compliance, already on Stripe** → `stripe-tax`
- **US marketplace with economic-nexus tracking** → `taxjar`
- **Enterprise global compliance** → `avalara` *(planned)*
- **Prices are shown tax-inclusive and you don't track tax separately** → `none` (returns zero, doesn't throw)

## Default fallback behavior

Unlike the other adapters in this repo, **the tax factory falls back to `manual-rules` (not `none`) on unknown or misconfigured values**. Tax calculation is a hot-path operation on every cart preview — silently returning zero would hide checkout bugs. Manual rules with the built-in hardcoded rates is the safest non-zero fallback.

The `none` provider is explicit opt-in: you have to set `TAX_PROVIDER=none` to get it.

## Per-provider setup

### manual-rules (default)

No setup. Uses the rates in `backend/src/modules/tax/config/tax-rates.config.ts`:

| Country | Default rate | Reduced rates |
|---|---|---|
| **Japan (JP)** | 10% | 8% on food / reduced category |
| **Bangladesh (BD)** | 15% VAT | 5% on clothing, 0% on essential food |
| **Canada (CA)** | 5% GST federal + per-province PST/HST | (per-province in `provinceRates`) |

Adding a country = editing the config file, no code changes. Adding a category = adding a `TaxCategory` enum value and mapping it in each country's `categoryRates`.

**Categories** are case-insensitive at the API level — callers can pass `'essential_food'` or `'ESSENTIAL_FOOD'` and both match the `TaxCategory.ESSENTIAL_FOOD` enum value.

**⚠️ Not tax-compliance advice**. The rates are a starting point and are not audit-ready. For real compliance, graduate to `stripe-tax` or `taxjar`.

### stripe-tax

```
TAX_PROVIDER=stripe-tax
STRIPE_SECRET_KEY=sk_live_...    # already set for the payments module
```

Uses the existing `STRIPE_SECRET_KEY` — no new credential to set up. Enable Stripe Tax in the Stripe dashboard at <https://dashboard.stripe.com/settings/tax>.

**Workflow**:
1. `calculateTax()` → `POST /v1/tax/calculations`, returns a Stripe `taxcalc_...` id
2. Checkout UI shows the quote to the customer
3. On order placement: `commitTransaction(taxcalc_id, orderId, …)` → `POST /v1/tax/transactions/create_from_calculation`
4. On refund: `refundTransaction(transactionId)` → `POST /v1/tax/transactions/create_reversal`

**Pricing**: $0.05 per calculation (flat), billed through your existing Stripe subscription.

### taxjar

```
TAX_PROVIDER=taxjar
TAXJAR_API_KEY=...
TAXJAR_SANDBOX=false             # true for sandbox.taxjar.com
```

Sign up at <https://www.taxjar.com>. The sandbox environment requires a separate signup.

**Free tier**: 200 calculations/month. Good for US sales-tax compliance with automatic state-nexus tracking. International coverage is limited.

**Address requirements**: for full jurisdictional accuracy, pass complete `from_` and `to_` addresses including `state`, `postalCode`, and `city`. TaxJar can return state / county / city / special-district breakdowns (the provider exposes them in `TaxLineBreakdown.jurisdictions`).

### avalara (planned #23)

Not yet implemented. Selecting `TAX_PROVIDER=avalara` logs a warning and falls back to `manual-rules`. A follow-up PR will ship the AvaTax REST integration.

### none

```
TAX_PROVIDER=none
```

Returns zero tax for every calculation. Does **not** throw. Use this when:
- Prices are already displayed tax-inclusive in the product catalog
- AND the operator has no requirement to track tax on orders
- AND the frontend never shows a separate "tax" line on receipts

If you want the "fail loudly" behavior, set `TAX_PROVIDER=manual-rules` and add a 0% rate for the country in `tax-rates.config.ts` — that way the provider is still reachable but returns a zero quote you can debug.

## Migration from the existing `TaxService`

`backend/src/modules/tax/tax.service.ts` reads `tax-rates.config` directly and is functionally equivalent to the new `manual-rules` provider. A follow-up PR will migrate `TaxService.calculateTax()` to delegate to `TaxProviderService` so there's a single code path.

For now, new callers should inject `TaxProviderService` directly:

```ts
import { TaxProviderService } from '@/modules/tax/tax-provider.service';

class OrdersService {
  constructor(private readonly tax: TaxProviderService) {}

  async quoteTax(order: Order) {
    return this.tax.calculateTax({
      currency: order.currency,
      fromAddress: { country: 'JP' },
      toAddress: order.shippingAddress,
      lineItems: order.items.map((i) => ({
        id: i.id,
        unitPrice: i.price,
        quantity: i.quantity,
        category: i.taxCategory,
      })),
    });
  }
}
```

## Adding a new provider

1. Implement `TaxProvider` in
   `backend/src/modules/tax/providers/<name>.provider.ts`
2. Add a case to `createTaxProvider()` in `providers/index.ts`
3. Document env vars in this file and in `.env.example`
4. Add smoke-test coverage in
   `backend/scripts/smoke-test-tax-providers.ts`

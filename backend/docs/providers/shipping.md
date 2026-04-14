# Shipping / logistics providers

Vasty Shop supports pluggable shipping backends for rate quotes,
label generation, and parcel tracking. Pick a provider by setting
`SHIPPING_PROVIDER` in your `.env`.

```
SHIPPING_PROVIDER=manual-zones   # zero-infra default
```

## Comparison

| Provider | Coverage | Cost | Infra | Real labels | Best for |
|---|---|---|---|---|---|
| **manual-zones** *(default)* | configurable | free | none | ❌ (internal) | self-hosted, simple pricing |
| **shipengine** | multi-carrier US + global | per label + carrier cost | none | ✅ | US-focused marketplaces |
| **easypost** | multi-carrier US + global | per label + carrier cost | none | ✅ | US alternative to ShipEngine |
| **shippo** | multi-carrier US + global | per label + carrier cost | none | ✅ | small merchants, simpler pricing |
| **pathao** | Bangladesh last-mile | per shipment | none | ✅ | Bangladesh marketplaces |
| **none** | — | — | — | — | shipping disabled |

## Which should I pick?

- **"I just want a flat rate by country"** → `manual-zones` (default)
- **US marketplace, need real-time carrier rates** → `shipengine` or `easypost`
- **Small US merchant, want the simplest paid option** → `shippo`
- **Bangladesh-origin marketplace** → `pathao` (local last-mile, cash-on-delivery support, Bengali tracking UI for customers)
- **Not using shipping yet** → set `SHIPPING_PROVIDER=none` (checkout will show "no shipping options")

## Default fallback behavior

Unlike the other adapters in this repo, **the shipping factory falls back to `manual-zones` (not `none`) on unknown or misconfigured values**. Silent zero shipping would break checkout. `manual-zones` is the safest non-zero fallback — it uses the built-in default zone config and doesn't call any external API.

Planned providers (`delhivery`, `shiprocket`, `steadfast`, `redx`, `sendcloud`) log a warning and fall back to `manual-zones` until they're implemented.

## Per-provider setup

### manual-zones (default)

No setup. The provider ships with three default zones:

```
BD (Bangladesh)  → 60 BDT base + 20 BDT/kg, 2-day estimate
US (USA)         → $8.00 base + $2.00/kg, 5-day estimate
*  (wildcard)    → $30.00 base + $5.00/kg, 14-day estimate
```

Override via a JSON env var:

```bash
MANUAL_SHIPPING_ZONES='[
  {
    "name": "Dhaka Metro",
    "countryCode": "BD",
    "states": ["DHAKA"],
    "baseAmount": 5000,
    "perKgAmount": 1500,
    "currency": "BDT",
    "estimatedDays": 1,
    "carrier": "Internal",
    "service": "Same-day"
  },
  {
    "name": "Bangladesh nationwide",
    "countryCode": "BD",
    "baseAmount": 8000,
    "perKgAmount": 2000,
    "currency": "BDT",
    "estimatedDays": 3
  }
]'
```

Zone matching priority (first match wins):
1. Exact `countryCode` + `postalPrefix` match
2. Exact `countryCode` + `state` match
3. `countryCode` only (no state/postal restrictions)
4. Wildcard `countryCode: "*"`

`baseAmount` and `perKgAmount` are in **smallest currency units**: cents for USD, paisa for BDT, yen for JPY. The formula is `baseAmount + (weightKg × perKgAmount)`.

**Label generation**: not supported. This provider returns a placeholder tracking number (`MANUAL-{timestamp}-{orderRef}`) so the checkout flow can continue. The app's own delivery module handles operational steps (driver assignment, parcel collection). This is the right default for marketplaces with in-house couriers.

### shipengine

Sign up at <https://shipengine.com>, grab an API key from Settings → API Management.

```
SHIPPING_PROVIDER=shipengine
SHIPENGINE_API_KEY=TEST_...           # sandbox key
# or SHIPENGINE_API_KEY=PROD_...
```

Test keys return unlimited mock labels; production keys are billed per label + the carrier's own cost. The provider uses `/v1/rates` for quotes and `POST /v1/labels/rates/{rate_id}` for label generation.

### easypost

Sign up at <https://easypost.com>.

```
SHIPPING_PROVIDER=easypost
EASYPOST_API_KEY=EZTK_...             # test
# or EASYPOST_API_KEY=EZAK_...        # production
```

EasyPost uses Basic auth with the API key as the username. Unit conversion: the provider converts grams→ounces and centimeters→inches automatically — callers pass SI units.

### shippo

Sign up at <https://goshippo.com>.

```
SHIPPING_PROVIDER=shippo
SHIPPO_API_KEY=shippo_test_xxx
# or SHIPPO_API_KEY=shippo_live_xxx
```

Uses the unusual `Authorization: ShippoToken <token>` header (not `Bearer`). Sends parcel dimensions in metric (g + cm).

**Known limitation**: `trackShipment()` throws NotSupported because Shippo's tracking endpoint requires a carrier code that isn't available from the unified tracking number. Use the `trackingUrl` returned by `createShipment()` for customer-facing tracking, or set up a carrier-specific webhook for programmatic updates.

### pathao (Bangladesh)

Sign up at <https://merchant.pathao.com>, contact Pathao merchant support to get API credentials (they're not self-serve as of writing).

```
SHIPPING_PROVIDER=pathao
PATHAO_BASE_URL=https://courier-api-sandbox.pathao.com   # or production
PATHAO_CLIENT_ID=
PATHAO_CLIENT_SECRET=
PATHAO_USERNAME=                       # merchant panel email
PATHAO_PASSWORD=                       # merchant panel password
PATHAO_STORE_ID=                       # your active pickup store id
```

Pathao uses OAuth 2.0 password-grant: the provider automatically fetches an access token on first use and caches it for 24 hours. Subsequent requests use `Authorization: Bearer <token>`.

**Limitations**:
- `getRates()` returns a single default quote (60 BDT base + 15 BDT per additional kg) rather than calling Pathao's price-plan API. This is because Pathao's API requires numeric `city_id` / `zone_id` / `area_id` which aren't present in our unified `ShippingAddress` shape. A follow-up PR can wire up `/aladdin/api/v1/city-list` to map city names → ids.
- `createShipment()` passes `recipient_city: 1, recipient_zone: 1, recipient_area: 1` as defaults (Dhaka). Operators whose marketplace sells outside Dhaka should override these via a city-map lookup before the next iteration.
- No rate shopping — Pathao's pricing is fixed per the merchant agreement.

This is a first-pass integration that covers the happy path. Real production usage will need the city/zone lookup + per-city pricing plan calls.

### none

```
SHIPPING_PROVIDER=none
```

`getRates()` returns an empty array (checkout UI can show "no shipping options" gracefully), but `createShipment()` throws. Use this only when the frontend doesn't collect shipping addresses at all (e.g. digital-goods-only marketplace).

## Adding a new provider

1. Implement `ShippingProvider` in
   `backend/src/modules/shipping/providers/<name>.provider.ts`
2. Add a case to `createShippingProvider()` in `providers/index.ts`
3. Document env vars in this file and in `.env.example`
4. Add smoke-test coverage in
   `backend/scripts/smoke-test-shipping-providers.ts` — mock `fetch`
   to verify URL, auth header, payload translation per method.

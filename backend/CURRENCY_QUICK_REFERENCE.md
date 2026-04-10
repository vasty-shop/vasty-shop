# Currency System - Quick Reference Guide

## Installation Checklist

- [ ] **Step 1:** Add CurrencyModule to app.module.ts imports
- [ ] **Step 2:** Apply CurrencyDetectionMiddleware to routes
- [ ] **Step 3:** Run database migration: `add-currency-support.sql`
- [ ] **Step 4:** Update services with hardcoded $ symbols (5 files)
- [ ] **Step 5:** Test currency endpoints
- [ ] **Step 6:** Update frontend to send currency preferences

---

## Quick Usage Examples

### Format Currency
```typescript
// In any service
constructor(private currencyService: CurrencyService) {}

const formatted = this.currencyService.formatCurrency(100, 'JPY');
// Output: "¥100"
```

### Convert Currency
```typescript
const amount = this.currencyService.convertCurrency(100, 'USD', 'EUR');
// Output: 92
```

### Use in Controllers
```typescript
@Get(':id')
async getProduct(@UserCurrency() currency: string) {
  // currency is automatically detected from request
  return this.currencyService.formatCurrency(product.price, currency);
}
```

### Helper Functions (No Injection Needed)
```typescript
import { formatCurrency } from './modules/currency/helpers/currency.helper';

const formatted = formatCurrency(100, 'BDT');
// Output: "৳ 100.00"
```

---

## Supported Currencies

| Code | Symbol | Name | Decimals | Example |
|------|--------|------|----------|---------|
| USD | $ | US Dollar | 2 | $1,234.56 |
| JPY | ¥ | Japanese Yen | 0 | ¥1,235 |
| BDT | ৳ | Bangladeshi Taka | 2 | ৳ 1,234.56 |
| CAD | $ | Canadian Dollar | 2 | $1,234.56 |
| EUR | € | Euro | 2 | €1,234.56 |
| GBP | £ | British Pound | 2 | £1,234.56 |
| AUD | $ | Australian Dollar | 2 | $1,234.56 |
| INR | ₹ | Indian Rupee | 2 | ₹1,234.56 |

---

## API Endpoints

### GET /api/currency/supported
Returns all supported currencies

### GET /api/currency/convert?amount=100&from=USD&to=JPY
Convert between currencies

### GET /api/currency/format?amount=1234.56&currency=BDT
Format amount with currency

### GET /api/currency/exchange-rate?from=USD&to=EUR
Get exchange rate between two currencies

---

## Files to Update

### 1. Cart Service (`/src/modules/cart/cart.service.ts`)
**Line 353:** Replace `$${coupon.minPurchase}` with formatted currency

### 2. Orders Service (`/src/modules/orders/orders.service.ts`)
**Line 454:** Replace `$${amount}` with formatted currency

### 3. Notifications Service (`/src/modules/notifications/notifications.service.ts`)
**Lines 281, 391, 401, 412:** Replace all `$${amount}` with formatted currency

### 4. Offers Service (`/src/modules/offers/offers.service.ts`)
**Line 149:** Replace `$${offer.minPurchase}` with formatted currency

### 5. Database Seeds (`/src/database/seeds/simple-seed.ts`)
**Line 295:** Update offer descriptions to use currency codes instead of $

---

## Configuration Files

### Main Configuration
`/src/modules/currency/currency.config.ts`
- Add/modify currencies here
- Update exchange rates
- Adjust formatting rules

### Database Schema
`/src/database/migrations/add-currency-support.sql`
- Creates 3 new tables
- Adds currency columns to 4 existing tables
- All snake_case naming

---

## Testing Commands

```bash
# Test currency detection
curl -H "X-Currency: JPY" http://localhost:3000/api/products

# Test conversion
curl "http://localhost:3000/api/currency/convert?amount=100&from=USD&to=JPY"

# Test formatting
curl "http://localhost:3000/api/currency/format?amount=1234.56&currency=BDT"

# Get supported currencies
curl http://localhost:3000/api/currency/supported
```

---

## Common Patterns

### Pattern 1: Format Order Total
```typescript
// Before
message = `Total: $${order.total}`;

// After
message = `Total: ${this.currencyService.formatCurrency(order.total, order.currency)}`;
```

### Pattern 2: Validate Minimum Purchase
```typescript
// Before
throw new BadRequestException(`Minimum purchase of $${minPurchase} required`);

// After
const formatted = this.currencyService.formatCurrency(minPurchase, currency);
throw new BadRequestException(`Minimum purchase of ${formatted} required`);
```

### Pattern 3: Multi-Currency Product Display
```typescript
const product = await this.findOne(id);
const currencies = ['USD', 'EUR', 'JPY'];

return {
  ...product,
  prices: currencies.map(currency => ({
    currency,
    amount: this.currencyService.convertCurrency(product.price, 'USD', currency),
    formatted: this.currencyService.formatCurrency(
      this.currencyService.convertCurrency(product.price, 'USD', currency),
      currency
    ),
  })),
};
```

---

## Troubleshooting

### Currency Not Detected
- Check middleware is applied in app.module.ts
- Verify request has currency in header/query/cookie
- Check IP detection is working

### Wrong Formatting
- Verify currency code is uppercase
- Check currency exists in SUPPORTED_CURRENCIES
- Confirm exchange rates are up to date

### Conversion Errors
- Ensure both currencies are supported
- Check exchange rates are not 0 or undefined
- Verify amount is a valid number

---

## Production Checklist

- [ ] Update exchange rates from reliable API
- [ ] Set up automated rate updates (daily/hourly)
- [ ] Configure IP geolocation service
- [ ] Test all currency conversions
- [ ] Verify formatting for all supported currencies
- [ ] Check mobile display of currency symbols
- [ ] Test RTL languages if applicable
- [ ] Set up monitoring for exchange rate anomalies
- [ ] Create backup strategy for rate history
- [ ] Document currency change policy for customers

---

## Support & Maintenance

### Updating Exchange Rates
```sql
UPDATE public.currencies
SET exchange_rate = 150.0, updated_at = NOW()
WHERE code = 'JPY';
```

### Adding New Currency
```sql
INSERT INTO public.currencies (code, symbol, name, decimal_places, exchange_rate, is_active)
VALUES ('CNY', '¥', 'Chinese Yuan', 2, 7.2, true);
```

Then add to `currency.config.ts`:
```typescript
CNY: {
  code: 'CNY',
  symbol: '¥',
  name: 'Chinese Yuan',
  decimal_places: 2,
  symbol_position: 'before',
  thousand_separator: ',',
  decimal_separator: '.',
  symbol_spacing: false,
  exchange_rate: 7.2,
  is_active: true,
}
```

---

## Performance Tips

1. **Cache Exchange Rates:** Rates don't change frequently, cache for 1+ hour
2. **Pre-calculate Common Conversions:** Store popular currency pairs in memory
3. **Use Indexes:** All currency-related columns are indexed
4. **Batch Operations:** Convert multiple amounts in a single operation when possible
5. **Lazy Load:** Only load currencies user is likely to use

---

## Resources

- Main Documentation: `CURRENCY_SYSTEM_IMPLEMENTATION.md`
- Config File: `/src/modules/currency/currency.config.ts`
- Service: `/src/modules/currency/currency.service.ts`
- Migration: `/src/database/migrations/add-currency-support.sql`
- Helper Functions: `/src/modules/currency/helpers/currency.helper.ts`

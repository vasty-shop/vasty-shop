# Calculation Module

A unified price calculation service that combines tax, shipping, and discounts for e-commerce orders.

## Overview

The Calculation Module provides a comprehensive solution for calculating order totals, including:
- **Subtotal Calculation**: Sum of all item prices
- **Tax Calculation**: Country and state-specific tax rates (integrates with TaxService)
- **Shipping Calculation**: Weight-based shipping with free shipping rules
- **Discount Calculation**: Coupon codes and automatic discounts
- **Currency Formatting**: Multi-currency support with proper formatting

## Features

- **Full Order Calculation**: Calculate complete order totals in a single API call
- **Individual Calculations**: Separate endpoints for tax-only or shipping-only calculations
- **Multi-Country Support**: US, Canada, Japan, Bangladesh, and international shipping
- **Tax Integration**: Seamless integration with existing TaxService
- **Currency Formatting**: Automatic currency formatting using CurrencyService
- **Free Shipping Rules**: Configurable thresholds and coupon-based free shipping
- **Discount Stacking**: Smart coupon stacking with validation
- **Weight-Based Shipping**: Accurate shipping costs based on package weight
- **Category-Specific Discounts**: Apply discounts to specific product categories

## Directory Structure

```
calculation/
├── calculation.module.ts          # NestJS module definition
├── calculation.service.ts         # Core calculation logic
├── calculation.controller.ts      # REST API endpoints
├── config/
│   ├── shipping.config.ts        # Shipping rates and rules
│   └── discount.config.ts        # Discount rules and coupons
├── dto/
│   └── calculate-order.dto.ts    # Request/response DTOs
├── README.md                      # This file
└── EXAMPLES.md                    # API usage examples
```

## Installation

The module is already integrated into the application. It requires:
- `CurrencyModule` - For currency formatting
- `TaxModule` - For tax calculations

## API Endpoints

### 1. Calculate Order Totals
**POST** `/api/calculation/order-totals`

Calculate complete order totals including all components.

**Request Body:**
```typescript
{
  items: OrderItemDto[];           // Array of order items
  countryCode: string;             // ISO 3166-1 alpha-2 country code
  stateCode?: string;              // State/province code (required for Canada)
  deliveryMethod: ShippingMethod;  // Shipping method
  coupons?: CouponDto[];           // Optional coupon codes
  currency: string;                // ISO 4217 currency code
}
```

**Response:**
```typescript
{
  subtotal: number;                // Subtotal before discounts
  tax: number;                     // Total tax amount
  taxBreakdown: TaxBreakdownDto;   // Detailed tax breakdown
  shipping: number;                // Shipping cost
  shippingDetails: ShippingDetailsDto;
  discount: number;                // Total discount amount
  discountDetails: DiscountDetailsDto;
  total: number;                   // Grand total
  currency: string;
  formatted: FormattedAmountsDto;  // Formatted with currency symbols
  calculatedAt: string;
}
```

### 2. Calculate Shipping Only
**POST** `/api/calculation/shipping`

Calculate shipping cost independently.

### 3. Calculate Tax Only
**POST** `/api/calculation/tax`

Calculate tax amount independently.

See [EXAMPLES.md](./EXAMPLES.md) for detailed usage examples.

## Configuration

### Shipping Configuration

Located in `config/shipping.config.ts`. Defines:
- Shipping rates by country and method
- Weight-based pricing
- Free shipping thresholds
- Delivery time estimates

**Supported Countries:**
- United States (US)
- Canada (CA)
- Japan (JP)
- Bangladesh (BD)
- International (default)

**Shipping Methods:**
- STANDARD - Regular delivery
- EXPRESS - Fast delivery
- OVERNIGHT - Next-day delivery
- ECONOMY - Budget option
- PICKUP - Store pickup (always free)

### Discount Configuration

Located in `config/discount.config.ts`. Defines:
- Coupon codes and their rules
- Discount types (percentage, fixed amount, free shipping)
- Minimum order requirements
- Category/product restrictions
- Stacking rules

**Discount Types:**
- `PERCENTAGE` - Percentage off (e.g., 10% off)
- `FIXED_AMOUNT` - Fixed dollar amount off (e.g., $20 off)
- `FREE_SHIPPING` - Free shipping coupon
- `BUY_X_GET_Y` - Buy X get Y free (future)

## Usage in Other Modules

### Importing the Module

```typescript
import { CalculationModule } from '@modules/calculation/calculation.module';

@Module({
  imports: [CalculationModule],
})
export class YourModule {}
```

### Using the Service

```typescript
import { CalculationService } from '@modules/calculation/calculation.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly calculationService: CalculationService,
  ) {}

  async calculateOrder() {
    const result = await this.calculationService.calculateOrderTotals({
      items: [...],
      countryCode: 'US',
      deliveryMethod: ShippingMethod.STANDARD,
      currency: 'USD',
    });

    return result;
  }
}
```

## Calculation Flow

The service follows this calculation order:

1. **Calculate Subtotal**
   - Sum all item prices (price × quantity)

2. **Apply Discounts**
   - Validate coupon codes
   - Apply percentage or fixed amount discounts
   - Check minimum order requirements
   - Handle category-specific discounts

3. **Calculate Shipping**
   - Calculate weight-based shipping cost
   - Apply free shipping rules (threshold or coupon)
   - Handle PICKUP (always free)

4. **Calculate Tax**
   - Use TaxService for country-specific rates
   - Apply to discounted subtotal (not shipping)
   - Handle province-specific rates (Canada)
   - Support category-specific rates (Japan, Bangladesh)

5. **Calculate Total**
   - Total = Discounted Subtotal + Tax + Shipping

6. **Format Amounts**
   - Use CurrencyService for proper formatting
   - Return both raw numbers and formatted strings

## Free Shipping Rules

Free shipping is applied when:

1. **Threshold Met**: Order amount meets country-specific threshold
   - US: $50 for STANDARD shipping
   - CA: $75 CAD for STANDARD shipping
   - JP: ¥5000 for STANDARD shipping
   - BD: 1000 BDT for STANDARD/ECONOMY shipping

2. **Free Shipping Coupon**: User applies a FREE_SHIPPING coupon

3. **Pickup Selected**: PICKUP method is always free

## Tax Calculation

Tax calculation is delegated to the TaxService, which supports:

- **Japan**: 10% standard, 8% reduced (food items)
- **Bangladesh**: 15% standard, category-specific rates
- **Canada**: Province-specific GST/PST/HST rates
- **Other Countries**: Returns 0% tax (no tax configured)

The calculation service automatically maps product categories to tax categories.

## Discount Rules

### Coupon Validation

Coupons are validated against:
- Active status
- Expiration date
- Minimum order amount
- Maximum uses per user
- Applicable categories/products

### Discount Stacking

- Non-stackable coupons: Only the best one is applied
- Stackable coupons: Can be combined
- FREE_SHIPPING coupons stack with other discounts

### Available Coupons

See `config/discount.config.ts` for the full list of configured coupons.

## Error Handling

The service provides detailed error messages for:
- Invalid coupon codes
- Unsupported shipping methods
- Weight limit exceeded
- Missing required fields (e.g., province for Canada)
- Invalid item data

All errors are thrown as `BadRequestException` with descriptive messages.

## Testing

Example test scenarios:

```typescript
describe('CalculationService', () => {
  it('should calculate order totals with discount', async () => {
    const result = await service.calculateOrderTotals({
      items: [{ productId: '1', price: 100, quantity: 1, category: 'ELECTRONICS', weight: 1 }],
      countryCode: 'US',
      deliveryMethod: ShippingMethod.STANDARD,
      coupons: [{ code: 'WELCOME10' }],
      currency: 'USD',
    });

    expect(result.discount).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(result.subtotal);
  });

  it('should apply free shipping when threshold is met', async () => {
    const result = await service.calculateOrderTotals({
      items: [{ productId: '1', price: 60, quantity: 1, category: 'ELECTRONICS', weight: 1 }],
      countryCode: 'US',
      deliveryMethod: ShippingMethod.STANDARD,
      currency: 'USD',
    });

    expect(result.shippingDetails.isFree).toBe(true);
    expect(result.shipping).toBe(0);
  });
});
```

## Performance Considerations

- Tax calculation is asynchronous (calls TaxService)
- Currency formatting is synchronous (fast)
- Discount validation happens in memory
- Shipping calculations are formula-based (instant)

Expected response time: < 100ms for typical orders

## Future Enhancements

Potential improvements:
- [ ] Buy X Get Y free discount type
- [ ] Volume-based bulk discounts
- [ ] Tiered shipping rates
- [ ] Real-time carrier API integration
- [ ] Dynamic tax rate updates via API
- [ ] A/B testing for discount strategies
- [ ] Discount analytics and reporting

## Dependencies

- `@nestjs/common` - NestJS framework
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation
- `CurrencyModule` - Currency formatting
- `TaxModule` - Tax calculations

## Contributing

When adding new features:

1. Update configurations in `config/` directory
2. Update DTOs if adding new fields
3. Update EXAMPLES.md with new use cases
4. Add tests for new functionality
5. Update this README

## License

Internal use only - FluxEZ Shop Backend

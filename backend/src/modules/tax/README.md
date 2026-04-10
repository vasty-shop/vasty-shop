# Tax Calculation Module

Complete tax calculation system supporting Japan, Bangladesh, and Canada with province-specific rates.

## Features

- **Multi-country Support**: JP (Japan), BD (Bangladesh), CA (Canada)
- **Category-based Rates**: Different tax rates based on product categories
- **Province-specific Rates**: Complete support for Canadian provincial tax systems (GST/PST/HST)
- **Detailed Breakdowns**: Tax calculations with line-item and summary breakdowns
- **RESTful API**: Easy-to-use endpoints for tax calculation and rate queries

## Supported Countries

### Japan (JP)
- **Standard Rate**: 10% (消費税)
- **Reduced Rate**: 8% (軽減税率) - Applied to food, beverages (excluding alcohol)

### Bangladesh (BD)
- **Standard VAT**: 15%
- **Essential Food**: 0% (VAT exempt)
- **Clothing**: 5%
- **Electronics, Luxury Goods, Services**: 15%

### Canada (CA)
Province-specific rates with GST/PST/HST:
- **Atlantic Provinces** (NB, NL, NS, PE): 15% HST
- **Ontario**: 13% HST
- **British Columbia**: 5% GST + 7% PST = 12%
- **Manitoba**: 5% GST + 7% PST = 12%
- **Saskatchewan**: 5% GST + 6% PST = 11%
- **Quebec**: 5% GST + 9.975% QST = 14.975%
- **Alberta & Territories** (AB, NT, NU, YT): 5% GST only

## API Endpoints

### 1. Calculate Tax
**POST** `/api/tax/calculate`

Calculate tax for a list of items based on country and province.

#### Request Body
```json
{
  "countryCode": "JP",
  "provinceCode": "optional (required for CA)",
  "currency": "USD",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Organic Rice",
      "unitPrice": 100.0,
      "quantity": 2,
      "category": "ESSENTIAL_FOOD"
    }
  ]
}
```

#### Response
```json
{
  "countryCode": "JP",
  "countryName": "Japan",
  "subtotal": 200.0,
  "totalTax": 16.0,
  "grandTotal": 216.0,
  "currency": "USD",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Organic Rice",
      "subtotal": 200.0,
      "taxRate": 8.0,
      "taxAmount": 16.0,
      "total": 216.0,
      "category": "ESSENTIAL_FOOD"
    }
  ],
  "taxSummary": [
    {
      "rate": 8.0,
      "taxableAmount": 200.0,
      "taxAmount": 16.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 2. Get Tax Rates
**GET** `/api/tax/rates/:countryCode`

Retrieve tax rate information for a specific country.

#### Example Request
```
GET /api/tax/rates/JP
```

#### Response
```json
{
  "countryCode": "JP",
  "countryName": "Japan",
  "defaultRate": 10.0,
  "categoryRates": {
    "STANDARD": 10.0,
    "REDUCED": 8.0,
    "ESSENTIAL_FOOD": 8.0,
    "LUXURY_GOODS": 10.0,
    "ELECTRONICS": 10.0,
    "CLOTHING": 10.0,
    "SERVICES": 10.0
  },
  "metadata": {
    "lastUpdated": "2025-10-29",
    "notes": "Standard rate: 10%, Reduced rate: 8% for food and beverages"
  }
}
```

## Usage Examples

### Example 1: Japan - Mixed Categories
```json
POST /api/tax/calculate
{
  "countryCode": "JP",
  "currency": "JPY",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Rice",
      "unitPrice": 500,
      "quantity": 1,
      "category": "ESSENTIAL_FOOD"
    },
    {
      "itemId": "item-002",
      "itemName": "Laptop",
      "unitPrice": 80000,
      "quantity": 1,
      "category": "ELECTRONICS"
    }
  ]
}
```

**Response:**
- Rice: 500 JPY + 40 JPY tax (8%) = 540 JPY
- Laptop: 80,000 JPY + 8,000 JPY tax (10%) = 88,000 JPY
- **Total: 88,540 JPY**

### Example 2: Bangladesh - Essential Food Items
```json
POST /api/tax/calculate
{
  "countryCode": "BD",
  "currency": "BDT",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Rice",
      "unitPrice": 50,
      "quantity": 10,
      "category": "ESSENTIAL_FOOD"
    },
    {
      "itemId": "item-002",
      "itemName": "T-Shirt",
      "unitPrice": 500,
      "quantity": 2,
      "category": "CLOTHING"
    }
  ]
}
```

**Response:**
- Rice: 500 BDT + 0 BDT tax (0% - exempt) = 500 BDT
- T-Shirts: 1,000 BDT + 50 BDT tax (5%) = 1,050 BDT
- **Total: 1,550 BDT**

### Example 3: Canada - Ontario (HST)
```json
POST /api/tax/calculate
{
  "countryCode": "CA",
  "provinceCode": "ON",
  "currency": "CAD",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Book",
      "unitPrice": 25.00,
      "quantity": 2,
      "category": "STANDARD"
    }
  ]
}
```

**Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "provinceCode": "ON",
  "provinceName": "Ontario",
  "subtotal": 50.0,
  "totalTax": 6.5,
  "grandTotal": 56.5,
  "currency": "CAD",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Book",
      "subtotal": 50.0,
      "taxRate": 13.0,
      "taxAmount": 6.5,
      "total": 56.5,
      "category": "STANDARD",
      "taxBreakdown": {
        "hst": 6.5
      }
    }
  ],
  "taxSummary": [
    {
      "rate": 13.0,
      "taxableAmount": 50.0,
      "taxAmount": 6.5,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### Example 4: Canada - British Columbia (GST + PST)
```json
POST /api/tax/calculate
{
  "countryCode": "CA",
  "provinceCode": "BC",
  "currency": "CAD",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Smartphone",
      "unitPrice": 999.99,
      "quantity": 1,
      "category": "ELECTRONICS"
    }
  ]
}
```

**Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "provinceCode": "BC",
  "provinceName": "British Columbia",
  "subtotal": 999.99,
  "totalTax": 119.99,
  "grandTotal": 1119.98,
  "currency": "CAD",
  "items": [
    {
      "itemId": "item-001",
      "itemName": "Smartphone",
      "subtotal": 999.99,
      "taxRate": 12.0,
      "taxAmount": 119.99,
      "total": 1119.98,
      "category": "ELECTRONICS",
      "taxBreakdown": {
        "gst": 50.0,
        "pst": 69.99
      }
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

## Tax Categories

```typescript
enum TaxCategory {
  STANDARD = 'STANDARD',
  REDUCED = 'REDUCED',
  ESSENTIAL_FOOD = 'ESSENTIAL_FOOD',
  LUXURY_GOODS = 'LUXURY_GOODS',
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  SERVICES = 'SERVICES',
}
```

## Integration

### Import the Module
```typescript
import { TaxModule } from './modules/tax/tax.module';

@Module({
  imports: [
    TaxModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### Use in Other Services
```typescript
import { TaxService } from './modules/tax/tax.service';

@Injectable()
export class OrderService {
  constructor(private readonly taxService: TaxService) {}

  async createOrder(orderData: CreateOrderDto) {
    const taxResult = await this.taxService.calculateTax({
      countryCode: orderData.countryCode,
      provinceCode: orderData.provinceCode,
      items: orderData.items,
      currency: orderData.currency,
    });

    // Use taxResult in your order processing
    return {
      ...orderData,
      tax: taxResult,
    };
  }
}
```

## Error Handling

The service throws `BadRequestException` for:
- Unsupported country codes
- Missing province code for Canada
- Invalid province codes
- Invalid item data (negative prices, zero quantity)
- Empty item lists

## Notes

1. **All DTOs use camelCase** - Following JavaScript/TypeScript conventions
2. **Service handles conversions internally** - No need for external transformations
3. **Decimal precision** - All monetary values rounded to 2 decimal places
4. **Canada requires province** - Province code is mandatory for Canadian tax calculations
5. **Category-based rates** - Categories are optional; defaults to standard rate if not provided
6. **Currency agnostic** - Calculations work with any currency; just for display purposes

## File Structure

```
src/modules/tax/
├── config/
│   └── tax-rates.config.ts        # Tax rate configurations
├── dto/
│   └── calculate-tax.dto.ts       # Request/Response DTOs
├── tax.controller.ts              # REST API endpoints
├── tax.service.ts                 # Business logic
├── tax.module.ts                  # NestJS module
└── README.md                      # This file
```

## Future Enhancements

- Add more countries (US, UK, EU countries)
- Historical tax rate support
- Tax exemption rules
- Special tax zones
- B2B vs B2C tax handling
- Digital goods taxation
- Shipping tax calculations

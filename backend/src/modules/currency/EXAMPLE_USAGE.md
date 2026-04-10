# Currency Module - Example Usage

This document demonstrates how to use the Currency module in controllers, services, and other parts of the application.

## Table of Contents
1. [Using in Controllers](#using-in-controllers)
2. [Using in Services](#using-in-services)
3. [API Endpoints](#api-endpoints)
4. [Decorators](#decorators)
5. [Middleware](#middleware)

---

## Using in Controllers

### Example 1: Get User's Detected Currency

```typescript
import { Controller, Get } from '@nestjs/common';
import { UserCurrency } from '../currency/decorators/user-currency.decorator';

@Controller('products')
export class ProductsController {
  @Get()
  async getProducts(@UserCurrency() currency: string) {
    // currency will be automatically detected (e.g., 'USD', 'EUR', etc.)
    console.log(`User currency: ${currency}`);

    // Use the currency to format prices
    const products = await this.productsService.getProducts();

    return products.map(product => ({
      ...product,
      price: this.currencyService.formatCurrency(product.price, currency),
    }));
  }
}
```

### Example 2: Get Full Currency Detection Info

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrencyInfo } from '../currency/decorators/user-currency.decorator';

@Controller('dashboard')
export class DashboardController {
  @Get()
  async getDashboard(
    @CurrencyInfo() currencyInfo: { currency: string; source: string }
  ) {
    console.log(`Currency: ${currencyInfo.currency}`);
    console.log(`Detected from: ${currencyInfo.source}`);
    // source can be: 'user_preference', 'ip_location', 'accept_language', or 'default'

    return {
      currency: currencyInfo.currency,
      detectionMethod: currencyInfo.source,
    };
  }
}
```

### Example 3: Format Prices in Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';
import { UserCurrency } from '../currency/decorators/user-currency.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get(':id')
  async getProduct(
    @Param('id') id: string,
    @UserCurrency() currency: string,
  ) {
    const product = await this.productsService.getProduct(id);

    return {
      ...product,
      price: product.price, // Original numeric price
      formattedPrice: this.currencyService.formatCurrency(product.price, currency),
      // Examples:
      // USD: "$1,234.56"
      // EUR: "¬1.234,56"
      // JPY: "¥1,235"
      // BDT: "ó1,234.56"
    };
  }
}
```

---

## Using in Services

### Example 1: Format Currency in Service

```typescript
import { Injectable } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class OrdersService {
  constructor(private readonly currencyService: CurrencyService) {}

  async createOrder(orderData: CreateOrderDto, userCurrency: string) {
    const subtotal = this.calculateSubtotal(orderData.items);
    const tax = this.calculateTax(subtotal);
    const total = subtotal + tax;

    return {
      subtotal: this.currencyService.formatCurrency(subtotal, userCurrency),
      tax: this.currencyService.formatCurrency(tax, userCurrency),
      total: this.currencyService.formatCurrency(total, userCurrency),
      currency: userCurrency,
    };
  }
}
```

### Example 2: Convert Currency in Service

```typescript
import { Injectable } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class ProductsService {
  constructor(private readonly currencyService: CurrencyService) {}

  async getProductPrice(productId: string, targetCurrency: string) {
    const product = await this.getProduct(productId);

    // Product price is stored in USD
    const priceInUSD = product.price;

    // Convert to target currency
    const convertedPrice = await this.currencyService.convertCurrency(
      priceInUSD,
      'USD',
      targetCurrency,
    );

    return {
      originalPrice: priceInUSD,
      originalCurrency: 'USD',
      convertedPrice,
      convertedCurrency: targetCurrency,
      formatted: this.currencyService.formatCurrency(convertedPrice, targetCurrency),
    };
  }
}
```

### Example 3: Get User Currency Preference

```typescript
import { Injectable } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class UserService {
  constructor(private readonly currencyService: CurrencyService) {}

  async getUserSettings(userId: string) {
    const preferredCurrency = await this.currencyService.getUserCurrency(userId);

    return {
      userId,
      preferredCurrency,
      // More user settings...
    };
  }

  async updateUserCurrency(userId: string, newCurrency: string) {
    await this.currencyService.updateUserCurrency(userId, newCurrency);

    return {
      success: true,
      message: `Currency updated to ${newCurrency}`,
    };
  }
}
```

---

## API Endpoints

### 1. Get All Supported Currencies

```bash
GET /api/currency/supported
```

**Response:**
```json
{
  "currencies": [
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "symbolNative": "$",
      "decimalDigits": 2,
      "symbolPosition": "before",
      "decimalSeparator": ".",
      "thousandSeparator": ",",
      "countries": ["US"]
    },
    {
      "code": "JPY",
      "name": "Japanese Yen",
      "symbol": "¥",
      "symbolNative": "¥",
      "decimalDigits": 0,
      "symbolPosition": "before",
      "decimalSeparator": ".",
      "thousandSeparator": ",",
      "countries": ["JP"]
    }
    // ... more currencies
  ],
  "defaultCurrency": "USD",
  "total": 8
}
```

### 2. Convert Currency

```bash
POST /api/currency/convert
Content-Type: application/json

{
  "amount": 100,
  "from": "USD",
  "to": "EUR"
}
```

**Response:**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR",
  "convertedAmount": 92,
  "rate": 0.92,
  "formatted": "¬92.00",
  "rateUpdatedAt": "2025-10-29T10:00:00Z"
}
```

### 3. Format Currency

```bash
GET /api/currency/format?amount=1234.56&currency=JPY
```

**Response:**
```json
{
  "amount": 1234.56,
  "currency": "JPY",
  "formatted": "¥1,235",
  "symbol": "¥",
  "name": "Japanese Yen"
}
```

### 4. Get Current User Currency

```bash
GET /api/currency/me
```

**Response:**
```json
{
  "currency": "EUR",
  "source": "ip_location",
  "info": {
    "code": "EUR",
    "name": "Euro",
    "symbol": "¬",
    "symbolNative": "¬",
    "decimalDigits": 2,
    "symbolPosition": "before",
    "decimalSeparator": ",",
    "thousandSeparator": ".",
    "countries": ["DE", "FR", "IT", "ES"]
  }
}
```

### 5. Update User Currency Preference

```bash
POST /api/currency/preference
Authorization: Bearer <token>
Content-Type: application/json

{
  "currency": "GBP"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency preference updated successfully",
  "currency": "GBP"
}
```

### 6. Get Exchange Rate

```bash
GET /api/currency/exchange-rate?from=USD&to=INR
```

**Response:**
```json
{
  "from": "USD",
  "to": "INR",
  "rate": 83.0,
  "inverseRate": 0.012048,
  "timestamp": "2025-10-29T10:00:00Z"
}
```

---

## Decorators

### @UserCurrency()

Extracts the detected currency code from the request.

```typescript
@Get('products')
getProducts(@UserCurrency() currency: string) {
  // currency = 'USD', 'EUR', 'JPY', etc.
}
```

### @CurrencyInfo()

Extracts both the currency and detection source from the request.

```typescript
@Get('dashboard')
getDashboard(@CurrencyInfo() info: { currency: string; source: string }) {
  // info.currency = 'EUR'
  // info.source = 'user_preference' | 'ip_location' | 'accept_language' | 'default'
}
```

---

## Middleware

The `CurrencyDetectionMiddleware` automatically detects the user's currency on every request based on:

1. **User Preference** (from database) - Highest priority
2. **IP Geolocation** - Detects country from IP address
3. **Accept-Language Header** - Fallback to browser language
4. **Default** (USD) - Final fallback

The detected currency is available in:
- Request headers: `X-Currency` and `X-Currency-Source`
- Request object: `req.userCurrency` and `req.currencySource`
- Decorators: `@UserCurrency()` and `@CurrencyInfo()`

---

## Currency Formatting Examples

### USD (US Dollar)
```typescript
formatCurrency(1234.56, 'USD') // "$1,234.56"
```

### CAD (Canadian Dollar)
```typescript
formatCurrency(1234.56, 'CAD') // "CA$1,234.56"
```

### JPY (Japanese Yen) - No decimals
```typescript
formatCurrency(1234.56, 'JPY') // "¥1,235"
```

### BDT (Bangladeshi Taka)
```typescript
formatCurrency(1234.56, 'BDT') // "ó1,234.56"
```

### EUR (Euro) - Different separators
```typescript
formatCurrency(1234.56, 'EUR') // "¬1.234,56"
```

### GBP (British Pound)
```typescript
formatCurrency(1234.56, 'GBP') // "£1,234.56"
```

### AUD (Australian Dollar)
```typescript
formatCurrency(1234.56, 'AUD') // "A$1,234.56"
```

### INR (Indian Rupee)
```typescript
formatCurrency(1234.56, 'INR') // "¹1,234.56"
```

---

## Complete Controller Example

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CurrencyService } from '../currency/currency.service';
import { UserCurrency, CurrencyInfo } from '../currency/decorators/user-currency.decorator';

@Controller('shop')
export class ShopController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('products')
  async getProducts(@UserCurrency() currency: string) {
    const products = await this.productsService.getAllProducts();

    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      formattedPrice: this.currencyService.formatCurrency(product.price, currency),
      currency,
    }));
  }

  @Get('product/:id/price')
  async getProductPrice(
    @Param('id') id: string,
    @UserCurrency() userCurrency: string,
  ) {
    const product = await this.productsService.getProduct(id);

    // Product stored in USD, convert to user currency
    const convertedPrice = await this.currencyService.convertCurrency(
      product.price,
      'USD',
      userCurrency,
    );

    return {
      productId: id,
      basePrice: product.price,
      baseCurrency: 'USD',
      userPrice: convertedPrice,
      userCurrency,
      formatted: this.currencyService.formatCurrency(convertedPrice, userCurrency),
    };
  }

  @Get('checkout')
  async getCheckout(
    @CurrencyInfo() currencyInfo: { currency: string; source: string }
  ) {
    const cart = await this.cartService.getUserCart();

    return {
      items: cart.items,
      subtotal: this.currencyService.formatCurrency(cart.subtotal, currencyInfo.currency),
      tax: this.currencyService.formatCurrency(cart.tax, currencyInfo.currency),
      total: this.currencyService.formatCurrency(cart.total, currencyInfo.currency),
      currency: currencyInfo.currency,
      detectedFrom: currencyInfo.source,
    };
  }
}
```

---

## Testing Currency Detection

You can test currency detection by:

1. **Setting user preference** (requires authentication):
```bash
POST /api/currency/preference
Authorization: Bearer <token>
{ "currency": "EUR" }
```

2. **Using query parameter**:
```bash
GET /api/products?currency=JPY
```

3. **Using custom header**:
```bash
GET /api/products
X-Currency: GBP
```

4. **Accept-Language header** (automatic):
```bash
GET /api/products
Accept-Language: ja-JP
# Will detect JPY
```

---

## Best Practices

1. **Always format prices for display:**
```typescript
// Good
const formatted = this.currencyService.formatCurrency(price, currency);

// Bad
const formatted = `$${price.toFixed(2)}`;
```

2. **Store prices in a base currency (USD) in the database:**
```typescript
// Store in USD
product.price = 100; // USD

// Convert for display
const userPrice = await this.currencyService.convertCurrency(
  product.price,
  'USD',
  userCurrency,
);
```

3. **Use decorators for automatic currency detection:**
```typescript
// Good
@Get('products')
getProducts(@UserCurrency() currency: string) { }

// Bad
@Get('products')
getProducts(@Req() req: Request) {
  const currency = req.query.currency || 'USD';
}
```

4. **Handle currency conversion errors:**
```typescript
try {
  const converted = await this.currencyService.convertCurrency(amount, from, to);
  return { success: true, amount: converted };
} catch (error) {
  return { success: false, error: 'Currency conversion failed' };
}
```

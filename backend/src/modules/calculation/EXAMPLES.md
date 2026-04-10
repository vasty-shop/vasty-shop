# Calculation API Examples

This document provides comprehensive examples of the Calculation API endpoints with request/response examples.

## Base URL
```
http://localhost:3000/api/calculation
```

## Endpoints

### 1. POST /api/calculation/order-totals

Calculate complete order totals including tax, shipping, and discounts.

#### Request Body

```json
{
  "items": [
    {
      "productId": "prod-001",
      "price": 50.00,
      "quantity": 2,
      "category": "ELECTRONICS",
      "weight": 0.5,
      "name": "Wireless Mouse"
    },
    {
      "productId": "prod-002",
      "price": 30.00,
      "quantity": 1,
      "category": "ELECTRONICS",
      "weight": 0.3,
      "name": "USB Cable"
    }
  ],
  "countryCode": "US",
  "deliveryMethod": "STANDARD",
  "coupons": [
    {
      "code": "WELCOME10"
    }
  ],
  "currency": "USD"
}
```

#### Response (200 OK)

```json
{
  "subtotal": 130.00,
  "tax": 0.00,
  "taxBreakdown": {
    "rate": 0.00,
    "taxableAmount": 0.00,
    "countryName": "US"
  },
  "shipping": 10.50,
  "shippingDetails": {
    "method": "STANDARD",
    "methodName": "Standard Delivery",
    "cost": 10.50,
    "isFree": false,
    "estimatedDays": "3-5 business days"
  },
  "discount": 13.00,
  "discountDetails": {
    "amount": 13.00,
    "appliedCoupons": [
      {
        "code": "WELCOME10",
        "type": "PERCENTAGE",
        "amount": 13.00
      }
    ]
  },
  "total": 127.50,
  "currency": "USD",
  "formatted": {
    "subtotal": "$130.00",
    "tax": "$0.00",
    "shipping": "$10.50",
    "discount": "$13.00",
    "total": "$127.50"
  },
  "calculatedAt": "2025-10-29T10:30:00.000Z"
}
```

---

### 2. POST /api/calculation/order-totals (with Free Shipping)

Example with order qualifying for free shipping.

#### Request Body

```json
{
  "items": [
    {
      "productId": "prod-003",
      "price": 75.00,
      "quantity": 1,
      "category": "ELECTRONICS",
      "weight": 1.2,
      "name": "Bluetooth Speaker"
    }
  ],
  "countryCode": "US",
  "deliveryMethod": "STANDARD",
  "currency": "USD"
}
```

#### Response (200 OK)

```json
{
  "subtotal": 75.00,
  "tax": 0.00,
  "taxBreakdown": {
    "rate": 0.00,
    "taxableAmount": 0.00,
    "countryName": "US"
  },
  "shipping": 0.00,
  "shippingDetails": {
    "method": "STANDARD",
    "methodName": "Standard Delivery",
    "cost": 0.00,
    "isFree": true,
    "estimatedDays": "3-5 business days",
    "originalCost": 10.40
  },
  "discount": 0.00,
  "discountDetails": {
    "amount": 0.00
  },
  "total": 75.00,
  "currency": "USD",
  "formatted": {
    "subtotal": "$75.00",
    "tax": "$0.00",
    "shipping": "$0.00",
    "discount": "$0.00",
    "total": "$75.00"
  },
  "calculatedAt": "2025-10-29T10:35:00.000Z"
}
```

---

### 3. POST /api/calculation/order-totals (Canada with Tax)

Example with Canadian address including GST/HST.

#### Request Body

```json
{
  "items": [
    {
      "productId": "prod-004",
      "price": 100.00,
      "quantity": 2,
      "category": "ELECTRONICS",
      "weight": 0.8,
      "name": "Keyboard"
    }
  ],
  "countryCode": "CA",
  "stateCode": "ON",
  "deliveryMethod": "EXPRESS",
  "currency": "CAD"
}
```

#### Response (200 OK)

```json
{
  "subtotal": 200.00,
  "tax": 26.00,
  "taxBreakdown": {
    "hst": 26.00,
    "rate": 13.00,
    "taxableAmount": 200.00,
    "countryName": "Canada",
    "provinceName": "Ontario"
  },
  "shipping": 23.20,
  "shippingDetails": {
    "method": "EXPRESS",
    "methodName": "Express Delivery",
    "cost": 23.20,
    "isFree": false,
    "estimatedDays": "2-3 business days"
  },
  "discount": 0.00,
  "discountDetails": {
    "amount": 0.00
  },
  "total": 249.20,
  "currency": "CAD",
  "formatted": {
    "subtotal": "$200.00",
    "tax": "$26.00",
    "shipping": "$23.20",
    "discount": "$0.00",
    "total": "$249.20"
  },
  "calculatedAt": "2025-10-29T10:40:00.000Z"
}
```

---

### 4. POST /api/calculation/order-totals (Japan with Tax)

Example with Japanese address and reduced tax rate for food items.

#### Request Body

```json
{
  "items": [
    {
      "productId": "prod-005",
      "price": 1000.00,
      "quantity": 3,
      "category": "FOOD",
      "weight": 2.0,
      "name": "Organic Rice"
    }
  ],
  "countryCode": "JP",
  "deliveryMethod": "STANDARD",
  "coupons": [
    {
      "code": "FREESHIP"
    }
  ],
  "currency": "JPY"
}
```

#### Response (200 OK)

```json
{
  "subtotal": 3000.00,
  "tax": 240.00,
  "taxBreakdown": {
    "rate": 8.00,
    "taxableAmount": 3000.00,
    "countryName": "Japan"
  },
  "shipping": 0.00,
  "shippingDetails": {
    "method": "STANDARD",
    "methodName": "Standard Delivery",
    "cost": 0.00,
    "isFree": true,
    "estimatedDays": "3-5 business days",
    "originalCost": 700.00
  },
  "discount": 0.00,
  "discountDetails": {
    "amount": 0.00,
    "appliedCoupons": [
      {
        "code": "FREESHIP",
        "type": "FREE_SHIPPING",
        "amount": 0.00
      }
    ]
  },
  "total": 3240.00,
  "currency": "JPY",
  "formatted": {
    "subtotal": "¥3,000",
    "tax": "¥240",
    "shipping": "¥0",
    "discount": "¥0",
    "total": "¥3,240"
  },
  "calculatedAt": "2025-10-29T10:45:00.000Z"
}
```

---

### 5. POST /api/calculation/shipping

Calculate shipping cost only.

#### Request Body

```json
{
  "countryCode": "US",
  "deliveryMethod": "EXPRESS",
  "weight": 2.5,
  "orderAmount": 45.00,
  "currency": "USD"
}
```

#### Response (200 OK)

```json
{
  "cost": 22.50,
  "isFree": false,
  "method": "EXPRESS",
  "estimatedDays": "1-2 business days",
  "currency": "USD",
  "formatted": "$22.50"
}
```

---

### 6. POST /api/calculation/shipping (Free Shipping Qualified)

#### Request Body

```json
{
  "countryCode": "US",
  "deliveryMethod": "STANDARD",
  "weight": 1.5,
  "orderAmount": 75.00,
  "currency": "USD"
}
```

#### Response (200 OK)

```json
{
  "cost": 0.00,
  "isFree": true,
  "method": "STANDARD",
  "estimatedDays": "3-5 business days",
  "currency": "USD",
  "formatted": "$0.00"
}
```

---

### 7. POST /api/calculation/tax

Calculate tax only.

#### Request Body

```json
{
  "items": [
    {
      "productId": "prod-006",
      "price": 150.00,
      "quantity": 1,
      "category": "ELECTRONICS",
      "weight": 1.0,
      "name": "Headphones"
    }
  ],
  "countryCode": "CA",
  "stateCode": "BC",
  "currency": "CAD"
}
```

#### Response (200 OK)

```json
{
  "tax": 18.00,
  "taxBreakdown": {
    "gst": 7.50,
    "pst": 10.50,
    "rate": 12.00,
    "taxableAmount": 150.00,
    "countryName": "Canada",
    "provinceName": "British Columbia"
  },
  "subtotal": 150.00,
  "currency": "CAD",
  "formatted": "$18.00"
}
```

---

### 8. POST /api/calculation/order-totals (Multiple Coupons)

Example with multiple discount coupons applied.

#### Request Body

```json
{
  "items": [
    {
      "productId": "prod-007",
      "price": 200.00,
      "quantity": 1,
      "category": "ELECTRONICS",
      "weight": 2.0,
      "name": "Tablet"
    }
  ],
  "countryCode": "US",
  "deliveryMethod": "STANDARD",
  "coupons": [
    {
      "code": "SAVE20"
    }
  ],
  "currency": "USD"
}
```

#### Response (200 OK)

```json
{
  "subtotal": 200.00,
  "tax": 0.00,
  "taxBreakdown": {
    "rate": 0.00,
    "taxableAmount": 0.00,
    "countryName": "US"
  },
  "shipping": 0.00,
  "shippingDetails": {
    "method": "STANDARD",
    "methodName": "Standard Delivery",
    "cost": 0.00,
    "isFree": true,
    "estimatedDays": "3-5 business days",
    "originalCost": 12.00
  },
  "discount": 20.00,
  "discountDetails": {
    "amount": 20.00,
    "appliedCoupons": [
      {
        "code": "SAVE20",
        "type": "FIXED_AMOUNT",
        "amount": 20.00
      }
    ]
  },
  "total": 180.00,
  "currency": "USD",
  "formatted": {
    "subtotal": "$200.00",
    "tax": "$0.00",
    "shipping": "$0.00",
    "discount": "$20.00",
    "total": "$180.00"
  },
  "calculatedAt": "2025-10-29T10:50:00.000Z"
}
```

---

## Available Coupon Codes

| Code | Type | Value | Description | Min Order |
|------|------|-------|-------------|-----------|
| WELCOME10 | PERCENTAGE | 10% | First order discount | $30 |
| SAVE20 | FIXED_AMOUNT | $20 | Save $20 on order | $100 |
| FREESHIP | FREE_SHIPPING | N/A | Free shipping | None |
| SUMMER25 | PERCENTAGE | 25% | Summer sale | None |
| ELECTRONICS15 | PERCENTAGE | 15% | Electronics only | None |

---

## Available Shipping Methods

| Country | Method | Base Rate | Per Kg Rate | Est. Days | Free Shipping Threshold |
|---------|--------|-----------|-------------|-----------|------------------------|
| US | ECONOMY | $5 | $1.50 | 7-10 | $50 |
| US | STANDARD | $8 | $2.00 | 3-5 | $50 |
| US | EXPRESS | $15 | $3.00 | 1-2 | N/A |
| US | OVERNIGHT | $25 | $5.00 | Next day | N/A |
| US | PICKUP | $0 | $0 | 2-4 hours | Always Free |
| CA | STANDARD | $10 CAD | $2.00 CAD | 5-7 | $75 CAD |
| CA | EXPRESS | $20 CAD | $4.00 CAD | 2-3 | N/A |
| CA | OVERNIGHT | $35 CAD | $6.00 CAD | Next day | N/A |
| CA | PICKUP | $0 | $0 | 1-2 hours | Always Free |
| JP | STANDARD | ¥500 | ¥100 | 3-5 | ¥5000 |
| JP | EXPRESS | ¥1000 | ¥200 | 1-2 | N/A |
| JP | OVERNIGHT | ¥1500 | ¥250 | Next day | N/A |
| JP | PICKUP | ¥0 | ¥0 | 1-2 hours | Always Free |
| BD | ECONOMY | 50 BDT | 20 BDT | 5-7 | 1000 BDT |
| BD | STANDARD | 80 BDT | 30 BDT | 3-5 | 1000 BDT |
| BD | EXPRESS | 150 BDT | 50 BDT | 1-2 | N/A |
| BD | PICKUP | 0 BDT | 0 BDT | Same day | Always Free |

---

## Supported Tax Countries

| Country | Default Rate | Notes |
|---------|--------------|-------|
| JP | 10% | Reduced 8% for food items |
| BD | 15% | 0% for essential food, 5% for clothing |
| CA | Varies | Province-specific rates (5-15%) |

### Canada Tax Rates by Province

| Province | Code | GST | PST | HST | Total |
|----------|------|-----|-----|-----|-------|
| Ontario | ON | - | - | 13% | 13% |
| British Columbia | BC | 5% | 7% | - | 12% |
| Alberta | AB | 5% | - | - | 5% |
| Quebec | QC | 5% | 9.975% | - | 14.975% |
| Nova Scotia | NS | - | - | 15% | 15% |
| Manitoba | MB | 5% | 7% | - | 12% |
| Saskatchewan | SK | 5% | 6% | - | 11% |

---

## Error Responses

### 400 Bad Request - Invalid Coupon

```json
{
  "statusCode": 400,
  "message": "Minimum order amount of 100 required",
  "error": "Bad Request"
}
```

### 400 Bad Request - Invalid Shipping Method

```json
{
  "statusCode": 400,
  "message": "Shipping method OVERNIGHT not available for country BD",
  "error": "Bad Request"
}
```

### 400 Bad Request - Weight Limit Exceeded

```json
{
  "statusCode": 400,
  "message": "Total weight 35kg exceeds limit of 30kg for US",
  "error": "Bad Request"
}
```

### 400 Bad Request - Missing Province for Canada

```json
{
  "statusCode": 400,
  "message": "Province code is required for Canada tax calculations",
  "error": "Bad Request"
}
```

---

## Integration Notes

1. **Currency Formatting**: All responses include both raw numeric values and formatted strings with currency symbols.

2. **Free Shipping Logic**:
   - PICKUP is always free
   - STANDARD shipping is free when order meets threshold
   - FREE_SHIPPING coupon overrides all shipping costs

3. **Tax Calculation**:
   - Tax is calculated on discounted subtotal
   - Shipping is not included in taxable amount
   - Category-specific rates apply automatically

4. **Discount Stacking**:
   - Non-stackable coupons: Best one is applied
   - FREE_SHIPPING coupons can stack with other discounts

5. **Weight-Based Shipping**:
   - Calculated as: Base Rate + (Weight × Per Kg Rate)
   - Total order weight is sum of all items

6. **Multi-Currency Support**:
   - Supports USD, CAD, JPY, BDT, and more
   - Automatically formats with correct symbols and separators

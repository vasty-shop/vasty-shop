# Tax Calculation System - API Examples

Complete examples for testing the tax calculation API with curl commands and expected responses.

## Quick Test Commands

### 1. Japan - Reduced Rate (Food)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "JP",
    "currency": "JPY",
    "items": [
      {
        "itemId": "jp-001",
        "itemName": "Organic Rice",
        "unitPrice": 500,
        "quantity": 2,
        "category": "ESSENTIAL_FOOD"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "JP",
  "countryName": "Japan",
  "subtotal": 1000.0,
  "totalTax": 80.0,
  "grandTotal": 1080.0,
  "currency": "JPY",
  "items": [
    {
      "itemId": "jp-001",
      "itemName": "Organic Rice",
      "subtotal": 1000.0,
      "taxRate": 8.0,
      "taxAmount": 80.0,
      "total": 1080.0,
      "category": "ESSENTIAL_FOOD"
    }
  ],
  "taxSummary": [
    {
      "rate": 8.0,
      "taxableAmount": 1000.0,
      "taxAmount": 80.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 2. Japan - Standard Rate (Electronics)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "JP",
    "currency": "JPY",
    "items": [
      {
        "itemId": "jp-002",
        "itemName": "Laptop Computer",
        "unitPrice": 80000,
        "quantity": 1,
        "category": "ELECTRONICS"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "JP",
  "countryName": "Japan",
  "subtotal": 80000.0,
  "totalTax": 8000.0,
  "grandTotal": 88000.0,
  "currency": "JPY",
  "items": [
    {
      "itemId": "jp-002",
      "itemName": "Laptop Computer",
      "subtotal": 80000.0,
      "taxRate": 10.0,
      "taxAmount": 8000.0,
      "total": 88000.0,
      "category": "ELECTRONICS"
    }
  ],
  "taxSummary": [
    {
      "rate": 10.0,
      "taxableAmount": 80000.0,
      "taxAmount": 8000.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 3. Japan - Mixed Cart

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "JP",
    "currency": "JPY",
    "items": [
      {
        "itemId": "jp-001",
        "itemName": "Fresh Vegetables",
        "unitPrice": 300,
        "quantity": 3,
        "category": "ESSENTIAL_FOOD"
      },
      {
        "itemId": "jp-002",
        "itemName": "Designer Watch",
        "unitPrice": 50000,
        "quantity": 1,
        "category": "LUXURY_GOODS"
      },
      {
        "itemId": "jp-003",
        "itemName": "Cotton Shirt",
        "unitPrice": 2000,
        "quantity": 2,
        "category": "CLOTHING"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "JP",
  "countryName": "Japan",
  "subtotal": 54900.0,
  "totalTax": 5472.0,
  "grandTotal": 60372.0,
  "currency": "JPY",
  "items": [
    {
      "itemId": "jp-001",
      "itemName": "Fresh Vegetables",
      "subtotal": 900.0,
      "taxRate": 8.0,
      "taxAmount": 72.0,
      "total": 972.0,
      "category": "ESSENTIAL_FOOD"
    },
    {
      "itemId": "jp-002",
      "itemName": "Designer Watch",
      "subtotal": 50000.0,
      "taxRate": 10.0,
      "taxAmount": 5000.0,
      "total": 55000.0,
      "category": "LUXURY_GOODS"
    },
    {
      "itemId": "jp-003",
      "itemName": "Cotton Shirt",
      "subtotal": 4000.0,
      "taxRate": 10.0,
      "taxAmount": 400.0,
      "total": 4400.0,
      "category": "CLOTHING"
    }
  ],
  "taxSummary": [
    {
      "rate": 8.0,
      "taxableAmount": 900.0,
      "taxAmount": 72.0,
      "itemCount": 1
    },
    {
      "rate": 10.0,
      "taxableAmount": 54000.0,
      "taxAmount": 5400.0,
      "itemCount": 2
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 4. Bangladesh - Essential Food (VAT Exempt)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "BD",
    "currency": "BDT",
    "items": [
      {
        "itemId": "bd-001",
        "itemName": "Rice (50kg)",
        "unitPrice": 2500,
        "quantity": 1,
        "category": "ESSENTIAL_FOOD"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "BD",
  "countryName": "Bangladesh",
  "subtotal": 2500.0,
  "totalTax": 0.0,
  "grandTotal": 2500.0,
  "currency": "BDT",
  "items": [
    {
      "itemId": "bd-001",
      "itemName": "Rice (50kg)",
      "subtotal": 2500.0,
      "taxRate": 0.0,
      "taxAmount": 0.0,
      "total": 2500.0,
      "category": "ESSENTIAL_FOOD"
    }
  ],
  "taxSummary": [
    {
      "rate": 0.0,
      "taxableAmount": 2500.0,
      "taxAmount": 0.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 5. Bangladesh - Clothing (Reduced Rate)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "BD",
    "currency": "BDT",
    "items": [
      {
        "itemId": "bd-002",
        "itemName": "Cotton T-Shirt",
        "unitPrice": 500,
        "quantity": 3,
        "category": "CLOTHING"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "BD",
  "countryName": "Bangladesh",
  "subtotal": 1500.0,
  "totalTax": 75.0,
  "grandTotal": 1575.0,
  "currency": "BDT",
  "items": [
    {
      "itemId": "bd-002",
      "itemName": "Cotton T-Shirt",
      "subtotal": 1500.0,
      "taxRate": 5.0,
      "taxAmount": 75.0,
      "total": 1575.0,
      "category": "CLOTHING"
    }
  ],
  "taxSummary": [
    {
      "rate": 5.0,
      "taxableAmount": 1500.0,
      "taxAmount": 75.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 6. Bangladesh - Electronics (Standard Rate)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "BD",
    "currency": "BDT",
    "items": [
      {
        "itemId": "bd-003",
        "itemName": "Smartphone",
        "unitPrice": 25000,
        "quantity": 1,
        "category": "ELECTRONICS"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "BD",
  "countryName": "Bangladesh",
  "subtotal": 25000.0,
  "totalTax": 3750.0,
  "grandTotal": 28750.0,
  "currency": "BDT",
  "items": [
    {
      "itemId": "bd-003",
      "itemName": "Smartphone",
      "subtotal": 25000.0,
      "taxRate": 15.0,
      "taxAmount": 3750.0,
      "total": 28750.0,
      "category": "ELECTRONICS"
    }
  ],
  "taxSummary": [
    {
      "rate": 15.0,
      "taxableAmount": 25000.0,
      "taxAmount": 3750.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 7. Canada - Ontario (HST)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "CA",
    "provinceCode": "ON",
    "currency": "CAD",
    "items": [
      {
        "itemId": "ca-001",
        "itemName": "Book Collection",
        "unitPrice": 49.99,
        "quantity": 2,
        "category": "STANDARD"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "provinceCode": "ON",
  "provinceName": "Ontario",
  "subtotal": 99.98,
  "totalTax": 12.99,
  "grandTotal": 112.97,
  "currency": "CAD",
  "items": [
    {
      "itemId": "ca-001",
      "itemName": "Book Collection",
      "subtotal": 99.98,
      "taxRate": 13.0,
      "taxAmount": 12.99,
      "total": 112.97,
      "category": "STANDARD",
      "taxBreakdown": {
        "hst": 12.99
      }
    }
  ],
  "taxSummary": [
    {
      "rate": 13.0,
      "taxableAmount": 99.98,
      "taxAmount": 12.99,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 8. Canada - British Columbia (GST + PST)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "CA",
    "provinceCode": "BC",
    "currency": "CAD",
    "items": [
      {
        "itemId": "ca-002",
        "itemName": "Gaming Console",
        "unitPrice": 499.99,
        "quantity": 1,
        "category": "ELECTRONICS"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "provinceCode": "BC",
  "provinceName": "British Columbia",
  "subtotal": 499.99,
  "totalTax": 59.99,
  "grandTotal": 559.98,
  "currency": "CAD",
  "items": [
    {
      "itemId": "ca-002",
      "itemName": "Gaming Console",
      "subtotal": 499.99,
      "taxRate": 12.0,
      "taxAmount": 59.99,
      "total": 559.98,
      "category": "ELECTRONICS",
      "taxBreakdown": {
        "gst": 25.0,
        "pst": 34.99
      }
    }
  ],
  "taxSummary": [
    {
      "rate": 12.0,
      "taxableAmount": 499.99,
      "taxAmount": 59.99,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 9. Canada - Alberta (GST Only)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "CA",
    "provinceCode": "AB",
    "currency": "CAD",
    "items": [
      {
        "itemId": "ca-003",
        "itemName": "Office Furniture",
        "unitPrice": 799.99,
        "quantity": 1,
        "category": "STANDARD"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "provinceCode": "AB",
  "provinceName": "Alberta",
  "subtotal": 799.99,
  "totalTax": 40.0,
  "grandTotal": 839.99,
  "currency": "CAD",
  "items": [
    {
      "itemId": "ca-003",
      "itemName": "Office Furniture",
      "subtotal": 799.99,
      "taxRate": 5.0,
      "taxAmount": 40.0,
      "total": 839.99,
      "category": "STANDARD",
      "taxBreakdown": {
        "gst": 40.0
      }
    }
  ],
  "taxSummary": [
    {
      "rate": 5.0,
      "taxableAmount": 799.99,
      "taxAmount": 40.0,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

### 10. Canada - Quebec (GST + QST)

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "CA",
    "provinceCode": "QC",
    "currency": "CAD",
    "items": [
      {
        "itemId": "ca-004",
        "itemName": "Winter Jacket",
        "unitPrice": 199.99,
        "quantity": 1,
        "category": "CLOTHING"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "provinceCode": "QC",
  "provinceName": "Quebec",
  "subtotal": 199.99,
  "totalTax": 29.95,
  "grandTotal": 229.94,
  "currency": "CAD",
  "items": [
    {
      "itemId": "ca-004",
      "itemName": "Winter Jacket",
      "subtotal": 199.99,
      "taxRate": 14.975,
      "taxAmount": 29.95,
      "total": 229.94,
      "category": "CLOTHING",
      "taxBreakdown": {
        "gst": 10.0,
        "pst": 19.95
      }
    }
  ],
  "taxSummary": [
    {
      "rate": 14.975,
      "taxableAmount": 199.99,
      "taxAmount": 29.95,
      "itemCount": 1
    }
  ],
  "calculatedAt": "2025-10-29T10:30:00Z"
}
```

## Get Tax Rates Examples

### Get Japan Tax Rates

```bash
curl -X GET http://localhost:3000/api/tax/rates/JP
```

**Expected Response:**
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

### Get Bangladesh Tax Rates

```bash
curl -X GET http://localhost:3000/api/tax/rates/BD
```

**Expected Response:**
```json
{
  "countryCode": "BD",
  "countryName": "Bangladesh",
  "defaultRate": 15.0,
  "categoryRates": {
    "STANDARD": 15.0,
    "ESSENTIAL_FOOD": 0.0,
    "LUXURY_GOODS": 15.0,
    "ELECTRONICS": 15.0,
    "CLOTHING": 5.0,
    "SERVICES": 15.0,
    "REDUCED": 5.0
  },
  "metadata": {
    "lastUpdated": "2025-10-29",
    "notes": "Standard VAT: 15%, Essential food items are exempt (0%), Clothing: 5%"
  }
}
```

### Get Canada Tax Rates

```bash
curl -X GET http://localhost:3000/api/tax/rates/CA
```

**Expected Response:**
```json
{
  "countryCode": "CA",
  "countryName": "Canada",
  "defaultRate": 5.0,
  "provinceRates": {
    "NB": {
      "provinceName": "New Brunswick",
      "hst": 15.0,
      "totalRate": 15.0,
      "description": "Harmonized Sales Tax (HST)"
    },
    "ON": {
      "provinceName": "Ontario",
      "hst": 13.0,
      "totalRate": 13.0,
      "description": "Harmonized Sales Tax (HST)"
    },
    "BC": {
      "provinceName": "British Columbia",
      "gst": 5.0,
      "pst": 7.0,
      "totalRate": 12.0,
      "description": "GST + PST"
    },
    "AB": {
      "provinceName": "Alberta",
      "gst": 5.0,
      "totalRate": 5.0,
      "description": "GST only (no provincial tax)"
    },
    "QC": {
      "provinceName": "Quebec",
      "gst": 5.0,
      "pst": 9.975,
      "totalRate": 14.975,
      "description": "GST + QST"
    }
  },
  "metadata": {
    "lastUpdated": "2025-10-29",
    "notes": "Tax rates vary by province. HST applies in Atlantic provinces and Ontario. GST+PST in BC, MB, SK, QC. GST only in AB and territories."
  }
}
```

## Error Examples

### Invalid Country Code

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "US",
    "items": [
      {
        "itemId": "test-001",
        "itemName": "Test Item",
        "unitPrice": 100,
        "quantity": 1
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Country code 'US' is not supported. Supported countries: JP, BD, CA",
  "error": "Bad Request"
}
```

### Missing Province for Canada

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "CA",
    "items": [
      {
        "itemId": "test-001",
        "itemName": "Test Item",
        "unitPrice": 100,
        "quantity": 1
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Province code is required for Canada tax calculations",
  "error": "Bad Request"
}
```

### Invalid Province Code

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "CA",
    "provinceCode": "XX",
    "items": [
      {
        "itemId": "test-001",
        "itemName": "Test Item",
        "unitPrice": 100,
        "quantity": 1
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid province code: XX. Please use valid Canadian province codes.",
  "error": "Bad Request"
}
```

### Empty Items Array

```bash
curl -X POST http://localhost:3000/api/tax/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "JP",
    "items": []
  }'
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "At least one item is required for tax calculation",
  "error": "Bad Request"
}
```

## Testing Script

Save this as `test-tax-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3000/api/tax"

echo "=== Testing Japan Tax Calculation ==="
curl -s -X POST $API_URL/calculate \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"JP","items":[{"itemId":"jp-001","itemName":"Rice","unitPrice":1000,"quantity":1,"category":"ESSENTIAL_FOOD"}]}' | jq

echo -e "\n=== Testing Bangladesh Tax Calculation ==="
curl -s -X POST $API_URL/calculate \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"BD","items":[{"itemId":"bd-001","itemName":"Rice","unitPrice":100,"quantity":10,"category":"ESSENTIAL_FOOD"}]}' | jq

echo -e "\n=== Testing Canada (Ontario) Tax Calculation ==="
curl -s -X POST $API_URL/calculate \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"CA","provinceCode":"ON","items":[{"itemId":"ca-001","itemName":"Book","unitPrice":50,"quantity":1}]}' | jq

echo -e "\n=== Getting Japan Tax Rates ==="
curl -s -X GET $API_URL/rates/JP | jq

echo -e "\n=== Testing Error: Unsupported Country ==="
curl -s -X POST $API_URL/calculate \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"US","items":[{"itemId":"test","itemName":"Test","unitPrice":100,"quantity":1}]}' | jq
```

Run with: `chmod +x test-tax-api.sh && ./test-tax-api.sh`

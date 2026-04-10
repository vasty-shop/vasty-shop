# Shipping Methods Table Implementation

## Overview
The `shipping_methods` table stores all available shipping options for Fluxez Shop. This table enables flexible shipping configuration with cost calculation, delivery estimates, and availability rules.

## Table Structure

### All Fields (snake_case)

| Field Name                  | Type       | Nullable | Default    | Description |
|-----------------------------|------------|----------|------------|-------------|
| `id`                        | uuid       | NO       | gen_random_uuid() | Primary key |
| `type`                      | string     | NO       | -          | Shipping type: standard, express, overnight, pickup, same_day |
| `name`                      | string     | NO       | -          | Internal name for the method |
| `display_name`              | string     | NO       | -          | Customer-facing name |
| `base_cost`                 | numeric    | NO       | 0          | Base shipping cost in USD |
| `free_shipping_threshold`   | numeric    | YES      | null       | Order value for free shipping |
| `estimated_days`            | integer    | YES      | null       | Estimated delivery in calendar days |
| `estimated_business_days`   | integer    | YES      | null       | Estimated delivery in business days |
| `duration`                  | string     | YES      | null       | Human-readable duration string |
| `description`               | text       | YES      | null       | Detailed description |
| `icon`                      | string     | YES      | null       | Icon identifier or emoji |
| `features`                  | jsonb      | NO       | []         | Array of feature strings |
| `is_active`                 | boolean    | NO       | true       | Whether method is available |
| `available_countries`       | jsonb      | NO       | []         | Array of country codes (empty = all) |
| `display_order`             | integer    | NO       | 0          | Display order (lower shown first) |
| `requires_signature`        | boolean    | NO       | false      | Signature required on delivery |
| `min_weight`                | numeric    | YES      | null       | Minimum weight in kg |
| `max_weight`                | numeric    | YES      | null       | Maximum weight in kg |
| `min_order_value`           | numeric    | YES      | null       | Minimum order value required |
| `created_at`                | timestamptz| NO       | now()      | Creation timestamp |
| `updated_at`                | timestamptz| NO       | now()      | Last update timestamp |

## Indexes

- `idx_shipping_methods_type` - On `type` field
- `idx_shipping_methods_is_active` - On `is_active` field
- `idx_shipping_methods_display_order` - On `display_order` field

## Integration with Orders Table

The `orders` table has a `delivery_method` field (line 309 in schema.ts) that should reference the `type` field from `shipping_methods`:

```typescript
// orders.delivery_method values match shipping_methods.type values:
// - standard
// - express
// - overnight
// - pickup
// - same_day
```

### Field Consistency Verification

✅ All fields use `snake_case` naming convention
✅ `orders.delivery_method` matches `shipping_methods.type`
✅ No camelCase fields in database schema
✅ Follows existing Fluxez schema patterns

## Default Shipping Methods (Seeded Data)

### 1. Standard Shipping (FREE)
```json
{
  "type": "standard",
  "name": "Standard Shipping",
  "display_name": "Standard Shipping",
  "base_cost": 0,
  "free_shipping_threshold": 50,
  "estimated_days": 5,
  "estimated_business_days": 5,
  "duration": "5-7 business days",
  "description": "Free standard shipping on orders over $50. Delivery within 5-7 business days.",
  "icon": "📦",
  "features": [
    "Free on orders over $50",
    "Tracking included",
    "Delivered to your door"
  ],
  "is_active": true,
  "available_countries": [],
  "display_order": 1,
  "requires_signature": false,
  "min_weight": null,
  "max_weight": null,
  "min_order_value": null
}
```

### 2. Express Shipping ($15)
```json
{
  "type": "express",
  "name": "Express Shipping",
  "display_name": "Express Shipping",
  "base_cost": 15.00,
  "free_shipping_threshold": null,
  "estimated_days": 2,
  "estimated_business_days": 2,
  "duration": "2-3 business days",
  "description": "Fast delivery within 2-3 business days. Perfect for when you need it sooner.",
  "icon": "⚡",
  "features": [
    "2-3 business days",
    "Priority handling",
    "Real-time tracking",
    "Signature on delivery"
  ],
  "is_active": true,
  "available_countries": [],
  "display_order": 2,
  "requires_signature": true,
  "min_weight": null,
  "max_weight": 25,
  "min_order_value": null
}
```

### 3. Overnight Shipping ($35)
```json
{
  "type": "overnight",
  "name": "Overnight Shipping",
  "display_name": "Overnight Shipping",
  "base_cost": 35.00,
  "free_shipping_threshold": null,
  "estimated_days": 1,
  "estimated_business_days": 1,
  "duration": "Next business day",
  "description": "Get your order by the next business day. Order before 2 PM for next-day delivery.",
  "icon": "🚀",
  "features": [
    "Next business day delivery",
    "Premium handling",
    "SMS & email notifications",
    "Signature required",
    "Insurance included"
  ],
  "is_active": true,
  "available_countries": [],
  "display_order": 3,
  "requires_signature": true,
  "min_weight": null,
  "max_weight": 10,
  "min_order_value": null
}
```

## Running Migrations

Since Fluxez uses schema.ts as the source of truth, migrations are automatic:

```bash
# Dry run to see what will change
npm run migrate:dry

# Run migration in development
npm run migrate:dev

# Sync schema (force update)
npm run migrate:sync

# Run production migration
npm run migrate
```

## Running Seeds

```bash
# Seed database with shipping methods and test data
npm run seed

# Refresh database (migrate + seed)
npm run seed:refresh
```

## Usage Examples

### Fetching Active Shipping Methods
```typescript
const shippingMethods = await fluxezClient
  .select('shipping_methods')
  .eq('is_active', true)
  .order('display_order', { ascending: true })
  .execute();
```

### Calculating Shipping Cost
```typescript
function calculateShippingCost(
  method: ShippingMethodEntity,
  orderValue: number
): number {
  if (
    method.free_shipping_threshold &&
    orderValue >= method.free_shipping_threshold
  ) {
    return 0;
  }
  return method.base_cost;
}
```

### Filtering by Weight
```typescript
const availableMethods = await fluxezClient
  .select('shipping_methods')
  .eq('is_active', true)
  .gte('max_weight', packageWeight) // max_weight >= packageWeight
  .order('display_order', { ascending: true })
  .execute();
```

### Filtering by Country
```typescript
// Get methods available for a specific country
const methods = await fluxezClient
  .select('shipping_methods')
  .eq('is_active', true)
  .execute();

// Filter in application code
const availableForCountry = methods.data.filter(method =>
  method.available_countries.length === 0 || // Available everywhere
  method.available_countries.includes(countryCode)
);
```

## TypeScript Interface

```typescript
export interface ShippingMethodEntity {
  id: string;
  type: string;
  name: string;
  displayName: string;
  baseCost: number;
  freeShippingThreshold?: number;
  estimatedDays?: number;
  estimatedBusinessDays?: number;
  duration?: string;
  description?: string;
  icon?: string;
  features: string[];
  isActive: boolean;
  availableCountries: string[];
  displayOrder: number;
  requiresSignature: boolean;
  minWeight?: number;
  maxWeight?: number;
  minOrderValue?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Field Naming Convention Summary

**Database Schema (snake_case):**
- `free_shipping_threshold`
- `estimated_days`
- `estimated_business_days`
- `display_name`
- `base_cost`
- `is_active`
- `available_countries`
- `display_order`
- `requires_signature`
- `min_weight`
- `max_weight`
- `min_order_value`
- `created_at`
- `updated_at`

**TypeScript Interface (camelCase):**
- `freeShippingThreshold`
- `estimatedDays`
- `estimatedBusinessDays`
- `displayName`
- `baseCost`
- `isActive`
- `availableCountries`
- `displayOrder`
- `requiresSignature`
- `minWeight`
- `maxWeight`
- `minOrderValue`
- `createdAt`
- `updatedAt`

Note: Fluxez SDK handles the conversion between snake_case (database) and camelCase (TypeScript) automatically.

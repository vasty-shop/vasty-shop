# Platform Analytics Page - Quick Reference

## File Location
```
frontend/src/features/admin/pages/PlatformAnalyticsPage.tsx
```

## Import
```typescript
import { PlatformAnalyticsPage } from '@/features/admin/pages';
```

## API Endpoints Required

```
GET /admin/analytics/overview?dateRange=30d
GET /admin/analytics/revenue?dateRange=30d&timeframe=daily
GET /admin/analytics/orders?dateRange=30d&timeframe=daily
GET /admin/analytics/users?dateRange=30d&timeframe=daily
GET /admin/analytics/categories?dateRange=30d
GET /admin/analytics/top-shops?dateRange=30d&limit=10
GET /admin/analytics/top-products?dateRange=30d&limit=10
GET /admin/analytics/top-customers?dateRange=30d&limit=10
```

## Usage in Router

```tsx
import { PlatformAnalyticsPage } from '@/features/admin/pages';

<Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
```

## Features Checklist

- [x] Overview stats cards (Revenue, Orders, Users, Shops)
- [x] Growth percentage indicators
- [x] Date range filter (Today, 7d, 30d, This month, This year)
- [x] Chart timeframe toggle (Daily, Weekly, Monthly)
- [x] Revenue line chart
- [x] Orders stacked bar chart
- [x] User registrations area chart
- [x] Category sales pie chart
- [x] Top 10 shops table
- [x] Top 10 products table
- [x] Top 10 customers table
- [x] Export button (placeholder)
- [x] Loading state
- [x] Error state with retry
- [x] Responsive design
- [x] Dark theme with glass morphism
- [x] Framer motion animations

## API Methods Added

```typescript
// In lib/api.ts
api.getAdminOverviewStats({ dateRange })
api.getAdminRevenueData({ dateRange, timeframe })
api.getAdminOrdersData({ dateRange, timeframe })
api.getAdminUsersData({ dateRange, timeframe })
api.getAdminCategoriesData({ dateRange })
api.getAdminTopShops({ dateRange, limit: 10 })
api.getAdminTopProducts({ dateRange, limit: 10 })
api.getAdminTopCustomers({ dateRange, limit: 10 })
```

## Expected Response Formats

### Overview Stats
```typescript
{
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  activeShops: number;
  shopsGrowth: number;
}
```

### Revenue Data
```typescript
[
  { date: "2024-01-01", revenue: 5000, orders: 50 },
  { date: "2024-01-02", revenue: 6000, orders: 60 }
]
```

### Orders Data
```typescript
[
  {
    date: "2024-01-01",
    orders: 100,
    completed: 80,
    pending: 15,
    cancelled: 5
  }
]
```

### User Registrations
```typescript
[
  { date: "2024-01-01", users: 50, vendors: 5 }
]
```

### Category Sales
```typescript
[
  { name: "Electronics", value: 45000 },
  { name: "Fashion", value: 35000 }
]
```

### Top Shops
```typescript
[
  {
    id: "shop-1",
    name: "Tech Store",
    orders: 500,
    revenue: 50000,
    growth: 15.5
  }
]
```

### Top Products
```typescript
[
  {
    id: "product-1",
    name: "iPhone 15",
    shopName: "Tech Store",
    unitsSold: 200,
    revenue: 40000
  }
]
```

### Top Customers
```typescript
[
  {
    id: "customer-1",
    name: "John Doe",
    email: "john@example.com",
    orders: 50,
    totalSpent: 10000
  }
]
```

## Color Scheme

- **Revenue**: Green (#10B981)
- **Orders**: Blue/Cyan (#06B6D4)
- **Users**: Purple (#8B5CF6)
- **Shops**: Orange/Red (#F59E0B)
- **Completed**: Green (#10B981)
- **Pending**: Orange (#F59E0B)
- **Cancelled**: Red (#EF4444)

## Dependencies

- react
- framer-motion
- lucide-react
- recharts
- sonner (toast)

## Backend TODO

To make this page fully functional, implement these backend endpoints:

1. Create `AdminAnalyticsController`
2. Implement analytics aggregation logic
3. Add date range and timeframe query handling
4. Add caching for performance (Redis recommended)
5. Add admin authentication middleware
6. Add rate limiting for analytics endpoints
7. Optimize database queries with proper indexes

## Next Steps

1. Add route to admin router: `/admin/analytics`
2. Add navigation link in admin sidebar
3. Implement backend endpoints
4. Test with real data
5. Add export to PDF/CSV functionality
6. Add real-time updates (optional)

---

**Status**: Frontend Complete ✅
**Backend**: Pending Implementation ⏳
**Build**: No errors ✅

# Platform Analytics Page

## Overview

The **Platform Analytics Page** provides comprehensive insights and metrics across the entire fluxez-shop platform for administrators. This page displays real-time analytics, trends, and performance data for shops, products, orders, and users.

## File Location

```
/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/features/admin/pages/PlatformAnalyticsPage.tsx
```

## Features

### 1. Overview Stats Cards

Four key metric cards displaying:

- **Total Revenue**: Platform-wide revenue with growth percentage
- **Total Orders**: All-time order count with growth trend
- **Active Users**: Registered user count with growth percentage
- **Active Shops**: Number of vendor shops with growth trend

Each card includes:
- Icon with gradient background
- Current value
- Growth percentage (green for positive, red for negative)
- Subtitle with additional context
- Hover animation effects

### 2. Date Range Filter

Preset date range options:
- **Today**: Current day statistics
- **Last 7 Days**: Week-over-week analysis
- **Last 30 Days**: Monthly trends
- **This Month**: Current month data
- **This Year**: Annual overview

### 3. Chart Timeframe Toggle

Toggle between different data aggregation levels:
- **Daily**: Day-by-day breakdown
- **Weekly**: Week-by-week trends
- **Monthly**: Month-by-month analysis

### 4. Charts & Visualizations

#### Revenue Chart (Line Chart)
- **Type**: Line chart with gradient
- **Data**: Revenue trend over time
- **Features**:
  - Responsive design
  - Interactive tooltips
  - Smooth animations
  - Gradient fill
  - Active data points

#### Orders Chart (Stacked Bar Chart)
- **Type**: Stacked bar chart
- **Data**: Order volume breakdown by status
  - Completed (Green)
  - Pending (Orange)
  - Cancelled (Red)
- **Features**:
  - Status-based color coding
  - Interactive tooltips
  - Responsive layout

#### User Registrations Chart (Area Chart)
- **Type**: Dual area chart
- **Data**:
  - Customer registrations (Purple)
  - Vendor registrations (Pink)
- **Features**:
  - Dual metrics comparison
  - Gradient fills
  - Smooth curves
  - Legend

#### Category Sales Chart (Pie Chart)
- **Type**: Donut chart
- **Data**: Top categories by sales
- **Features**:
  - Color-coded segments
  - Labels on chart
  - Interactive tooltips
  - 6 predefined colors

### 5. Top Performers Tables

#### Top 10 Shops
Displays:
- Shop rank (gradient badge)
- Shop name
- Number of orders
- Total revenue
- Growth percentage (color-coded)

**Features**:
- Stagger animation on load
- Hover effects
- Truncated text for long names
- Responsive layout

#### Top 10 Products
Displays:
- Product rank (gradient badge)
- Product name
- Shop name
- Units sold

**Features**:
- Purple/pink gradient badges
- Truncated shop names
- Hover animations
- Card-based layout

#### Top 10 Customers
Displays:
- Customer rank (gradient badge)
- Customer name
- Order count
- Total spent

**Features**:
- Green gradient badges
- Currency formatting
- Responsive grid
- Smooth animations

### 6. Export Functionality

**Export Report Button**:
- Downloads analytics report (feature placeholder)
- Gradient button with icon
- Shadow effects
- Hover animations

## API Integration

### API Endpoints

The page integrates with the following admin analytics endpoints:

```typescript
// Overview Stats
GET /admin/analytics/overview
Params: { dateRange }

// Revenue Data
GET /admin/analytics/revenue
Params: { dateRange, timeframe }

// Orders Data
GET /admin/analytics/orders
Params: { dateRange, timeframe }

// User Registrations
GET /admin/analytics/users
Params: { dateRange, timeframe }

// Category Sales
GET /admin/analytics/categories
Params: { dateRange }

// Top Shops
GET /admin/analytics/top-shops
Params: { dateRange, limit: 10 }

// Top Products
GET /admin/analytics/top-products
Params: { dateRange, limit: 10 }

// Top Customers
GET /admin/analytics/top-customers
Params: { dateRange, limit: 10 }
```

### API Methods (from lib/api.ts)

```typescript
api.getAdminOverviewStats({ dateRange })
api.getAdminRevenueData({ dateRange, timeframe })
api.getAdminOrdersData({ dateRange, timeframe })
api.getAdminUsersData({ dateRange, timeframe })
api.getAdminCategoriesData({ dateRange })
api.getAdminTopShops({ dateRange, limit: 10 })
api.getAdminTopProducts({ dateRange, limit: 10 })
api.getAdminTopCustomers({ dateRange, limit: 10 })
```

## Data Types

```typescript
interface OverviewStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  activeShops: number;
  shopsGrowth: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface OrdersDataPoint {
  date: string;
  orders: number;
  completed: number;
  pending: number;
  cancelled: number;
}

interface UserRegistration {
  date: string;
  users: number;
  vendors: number;
}

interface CategorySales {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface TopShop {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  growth: number;
}

interface TopProduct {
  id: string;
  name: string;
  shopName: string;
  unitsSold: number;
  revenue: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}
```

## Styling & Design

### Theme
- **Background**: Dark theme with glass morphism
- **Primary Colors**: Cyan, Blue, Purple gradient
- **Accent Colors**: Green (revenue), Blue (orders), Purple (users), Orange (shops)

### Components
- **GlassCard**: Glassmorphism card with optional hover effects
- **StatCard**: Metric card with gradient icon and growth indicator
- **ChartCard**: Chart container with title and subtitle

### Animations
- **framer-motion**: Smooth page transitions
- **Hover effects**: Scale and elevation on hover
- **Stagger animations**: Sequential loading for lists
- **Gradient effects**: Animated gradient backgrounds

### Responsive Design
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid
- **Charts**: Fully responsive with ResponsiveContainer

## State Management

```typescript
const [dateRange, setDateRange] = useState('30d');
const [chartTimeframe, setChartTimeframe] = useState('daily');
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
const [ordersData, setOrdersData] = useState<OrdersDataPoint[]>([]);
const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
const [topShops, setTopShops] = useState<TopShop[]>([]);
const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
```

## Error Handling

- **Loading State**: Displays loader with message
- **Error State**: Shows error message with retry button
- **Toast Notifications**: Error alerts via sonner
- **Graceful Degradation**: Continues operation if some data fails

## Utility Functions

### formatCurrency
Formats large numbers into readable currency:
- \$1,000,000+ → \$1.0M
- \$1,000+ → \$1.0K
- < \$1,000 → \$XXX

```typescript
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
};
```

## Dependencies

```json
{
  "react": "Latest",
  "framer-motion": "Motion animations",
  "lucide-react": "Icons",
  "recharts": "Charts library",
  "sonner": "Toast notifications"
}
```

## Usage in Admin Panel

### 1. Add Route to Admin Router

```tsx
import { PlatformAnalyticsPage } from '@/features/admin/pages';

// In your admin routes
<Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
```

### 2. Add Navigation Link

```tsx
<NavLink to="/admin/analytics">
  <Activity className="w-5 h-5" />
  <span>Platform Analytics</span>
</NavLink>
```

### 3. Protected Route (Admin Only)

```tsx
<Route
  path="/admin/analytics"
  element={
    <ProtectedRoute requiredRole="admin">
      <PlatformAnalyticsPage />
    </ProtectedRoute>
  }
/>
```

## Future Enhancements

### Planned Features
1. **Export to PDF/CSV**: Full analytics report export
2. **Custom Date Range Picker**: Select specific date ranges
3. **Real-time Updates**: WebSocket integration for live data
4. **Comparison Mode**: Compare different time periods
5. **Drill-down Reports**: Click to view detailed breakdowns
6. **Email Reports**: Schedule automated analytics emails
7. **Customizable Widgets**: Drag-and-drop dashboard customization
8. **Advanced Filters**: Filter by region, category, shop type
9. **Forecasting**: AI-powered trend predictions
10. **Goal Tracking**: Set and monitor KPI targets

### Backend Integration Checklist

To fully activate this page, ensure the backend implements:

- [ ] `/admin/analytics/overview` endpoint
- [ ] `/admin/analytics/revenue` endpoint
- [ ] `/admin/analytics/orders` endpoint
- [ ] `/admin/analytics/users` endpoint
- [ ] `/admin/analytics/categories` endpoint
- [ ] `/admin/analytics/top-shops` endpoint
- [ ] `/admin/analytics/top-products` endpoint
- [ ] `/admin/analytics/top-customers` endpoint
- [ ] Admin authentication middleware
- [ ] Role-based access control (admin only)
- [ ] Date range query parameter handling
- [ ] Timeframe aggregation (daily/weekly/monthly)
- [ ] Performance optimization (caching, indexing)

## Performance Considerations

1. **Data Caching**: Consider caching analytics data for 5-15 minutes
2. **Pagination**: Top performers limited to 10 items
3. **Lazy Loading**: Charts load only when in viewport
4. **Debouncing**: Debounce date range changes
5. **Memoization**: Use React.memo for expensive components
6. **Code Splitting**: Lazy load analytics page

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus Management**: Visible focus indicators
- **Responsive Text**: Scalable font sizes

## Testing Recommendations

```typescript
// Unit Tests
- Test formatCurrency utility
- Test date range filtering
- Test chart data transformation
- Test error handling

// Integration Tests
- Test API integration
- Test state management
- Test user interactions
- Test responsive behavior

// E2E Tests
- Test full analytics flow
- Test export functionality
- Test filter combinations
- Test loading states
```

## Troubleshooting

### Common Issues

**1. Charts not rendering**
- Ensure recharts is installed
- Check data format matches interface
- Verify ResponsiveContainer has height

**2. API errors**
- Verify backend endpoints exist
- Check authentication headers
- Confirm admin permissions

**3. Performance issues**
- Implement data caching
- Reduce chart data points
- Optimize re-renders with React.memo

**4. Styling issues**
- Ensure Tailwind CSS is configured
- Check vendor-globals.css is imported
- Verify glass-solid class exists

## Maintenance

### Regular Updates
- Update chart data as platform grows
- Optimize queries for performance
- Add new metrics based on business needs
- Monitor error rates and user feedback
- Keep dependencies up to date

### Code Quality
- Follow TypeScript best practices
- Maintain consistent naming conventions
- Add comments for complex logic
- Keep components modular and reusable
- Write tests for critical functionality

---

**Created**: December 2025
**Version**: 1.0.0
**Status**: Production Ready (pending backend integration)
**Author**: InfoInlet Development Team

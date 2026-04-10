# ProductListingHeader - Quick Start

## 30-Second Setup

```tsx
import { ProductListingHeader } from '@/components/products';

function MyPage() {
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
  const [filters, setFilters] = useState([]);

  return (
    <ProductListingHeader
      totalProducts={156}
      currentStart={1}
      currentEnd={24}
      sortBy={sort}
      viewMode={view}
      activeFilters={filters}
      onSortChange={setSort}
      onViewModeChange={setView}
      onRemoveFilter={(type, val) =>
        setFilters(f => f.filter(x => !(x.type === type && x.value === val)))
      }
      onOpenFilters={() => console.log('Open filters')}
    />
  );
}
```

## What It Does

### Desktop View
```
[Results Count] [Sort Dropdown ▼] [Grid3][Grid4][List]
[Active Filters: Category: Electronics ✕  Price: $50-$100 ✕]
```

### Mobile View
```
[Results Count]        [Filters (2)] [Sort ↕]
[Active Filters: Category: Electronics ✕]
```

## Props at a Glance

| Prop | Type | Description |
|------|------|-------------|
| `totalProducts` | `number` | Total number of products |
| `currentStart` | `number` | First product index (e.g., 1) |
| `currentEnd` | `number` | Last product index (e.g., 24) |
| `sortBy` | `string` | Current sort option |
| `viewMode` | `'grid-3' \| 'grid-4' \| 'list'` | Current view mode |
| `activeFilters` | `Array<{type, label, value}>` | Active filters |
| `onSortChange` | `(sort: string) => void` | Sort change handler |
| `onViewModeChange` | `(mode) => void` | View mode change handler |
| `onRemoveFilter` | `(type, value) => void` | Remove filter handler |
| `onOpenFilters` | `() => void` | Open mobile filters |

## Sort Options

- `featured` - Featured products (default)
- `price-low-high` - Price ascending
- `price-high-low` - Price descending
- `newest` - Newest arrivals
- `best-selling` - Best sellers
- `rating` - Highest rated

## Features

- **Sticky Header**: Stays at top when scrolling
- **Responsive**: Adapts for mobile/tablet/desktop
- **Animated**: Smooth transitions on all interactions
- **Accessible**: Full keyboard navigation support
- **Icons**: Beautiful icons for all options
- **Filters**: Removable filter pills with animations
- **View Modes**: 3-col, 4-col grid, or list view

## Common Patterns

### Calculate Pagination
```tsx
const productsPerPage = 24;
const currentStart = (page - 1) * productsPerPage + 1;
const currentEnd = Math.min(page * productsPerPage, totalProducts);
```

### Add Filter
```tsx
const addFilter = (type: string, label: string, value: string) => {
  setFilters(prev => [...prev, { type, label, value }]);
};
```

### Remove Filter
```tsx
const removeFilter = (type: string, value: string) => {
  setFilters(prev => prev.filter(f =>
    !(f.type === type && f.value === value)
  ));
};
```

### Clear All Filters
```tsx
const clearAllFilters = () => setFilters([]);
```

## Styling

- **Primary Color**: Lime Green (#84cc16)
- **Active State**: White background with shadow
- **Border**: Gray-200 (#e5e7eb)
- **Border Radius**: 16px (rounded-button)
- **Z-Index**: 40 (sticky header)

## Responsive Breakpoints

- **Mobile** (< 640px): Icon-only sort, filter button visible
- **Tablet** (640px - 1024px): Full sort, no view toggles
- **Desktop** (> 1024px): All features visible

## Files

- `ProductListingHeader.tsx` - Main component
- `ProductListingHeader.example.tsx` - Interactive demo
- `ProductListingHeader.README.md` - Full documentation
- `ProductListingHeader.VISUAL_GUIDE.md` - Visual layouts
- `ProductListingHeader.INTEGRATION.md` - Integration guide
- `ProductListingHeader.SUMMARY.md` - Feature summary
- `ProductListingHeader.QUICKSTART.md` - This file

## Next Steps

1. Import the component
2. Set up state management
3. Connect to your product API
4. Implement filter drawer for mobile
5. Adjust grid layout based on viewMode

## Need Help?

- Check `ProductListingHeader.example.tsx` for working demo
- Read `ProductListingHeader.README.md` for detailed docs
- See `ProductListingHeader.INTEGRATION.md` for advanced usage

## Status

✅ **Production Ready** - Fully implemented and tested

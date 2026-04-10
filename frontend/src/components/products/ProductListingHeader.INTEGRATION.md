# ProductListingHeader - Integration Guide

## Quick Integration

### Step 1: Import the Component

```tsx
import { ProductListingHeader } from '@/components/products';
```

### Step 2: Set Up State Management

```tsx
const [sortBy, setSortBy] = useState('featured');
const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
const [activeFilters, setActiveFilters] = useState<Array<{
  type: string;
  label: string;
  value: string;
}>>([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalProducts, setTotalProducts] = useState(0);

const productsPerPage = 24;
const currentStart = (currentPage - 1) * productsPerPage + 1;
const currentEnd = Math.min(currentPage * productsPerPage, totalProducts);
```

### Step 3: Implement Handler Functions

```tsx
// Handle filter removal
const handleRemoveFilter = (filterType: string, value: string) => {
  setActiveFilters(prev =>
    prev.filter(f => !(f.type === filterType && f.value === value))
  );
  // Reset to page 1 when filters change
  setCurrentPage(1);
};

// Handle opening mobile filter drawer
const handleOpenFilters = () => {
  // Open your filter drawer/modal
  // Example: setFilterDrawerOpen(true);
};
```

### Step 4: Add the Component to Your Page

```tsx
<ProductListingHeader
  totalProducts={totalProducts}
  currentStart={currentStart}
  currentEnd={currentEnd}
  sortBy={sortBy}
  viewMode={viewMode}
  activeFilters={activeFilters}
  onSortChange={setSortBy}
  onViewModeChange={setViewMode}
  onRemoveFilter={handleRemoveFilter}
  onOpenFilters={handleOpenFilters}
/>
```

## Complete Example

```tsx
import React, { useState, useEffect } from 'react';
import { ProductListingHeader } from '@/components/products';
import { ProductGrid } from '@/components/products';

interface Product {
  id: string;
  name: string;
  price: number;
  // ... other product fields
}

export function ProductListingPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Array<{
    type: string;
    label: string;
    value: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const productsPerPage = 24;
  const currentStart = (currentPage - 1) * productsPerPage + 1;
  const currentEnd = Math.min(currentPage * productsPerPage, totalProducts);

  // Fetch products when dependencies change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: currentPage,
            perPage: productsPerPage,
            sortBy,
            filters: activeFilters.reduce((acc, filter) => {
              if (!acc[filter.type]) acc[filter.type] = [];
              acc[filter.type].push(filter.value);
              return acc;
            }, {} as Record<string, string[]>),
          }),
        });

        const data = await response.json();
        setProducts(data.products);
        setTotalProducts(data.total);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy, activeFilters, currentPage]);

  // Handlers
  const handleRemoveFilter = (filterType: string, value: string) => {
    setActiveFilters(prev =>
      prev.filter(f => !(f.type === filterType && f.value === value))
    );
    setCurrentPage(1); // Reset to first page
  };

  const handleOpenFilters = () => {
    // Open filter drawer/modal
    console.log('Open filters');
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ProductListingHeader
        totalProducts={totalProducts}
        currentStart={currentStart}
        currentEnd={currentEnd}
        sortBy={sortBy}
        viewMode={viewMode}
        activeFilters={activeFilters}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onRemoveFilter={handleRemoveFilter}
        onOpenFilters={handleOpenFilters}
      />

      {/* Product Grid */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <ProductGrid
            products={products}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
}
```

## Advanced Usage

### Persist View Mode to localStorage

```tsx
const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>(() => {
  const saved = localStorage.getItem('productViewMode');
  return (saved as 'grid-3' | 'grid-4' | 'list') || 'grid-4';
});

const handleViewModeChange = (mode: 'grid-3' | 'grid-4' | 'list') => {
  setViewMode(mode);
  localStorage.setItem('productViewMode', mode);
};
```

### Sync with URL Parameters

```tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

// Initialize from URL
const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
const [currentPage, setCurrentPage] = useState(
  parseInt(searchParams.get('page') || '1')
);

// Update URL when state changes
useEffect(() => {
  const params = new URLSearchParams();
  params.set('sort', sortBy);
  params.set('page', currentPage.toString());

  activeFilters.forEach(filter => {
    params.append(filter.type, filter.value);
  });

  setSearchParams(params);
}, [sortBy, currentPage, activeFilters]);
```

### Add Filters from Sidebar

```tsx
const handleAddFilter = (type: string, label: string, value: string) => {
  // Check if filter already exists
  const exists = activeFilters.some(
    f => f.type === type && f.value === value
  );

  if (!exists) {
    setActiveFilters(prev => [...prev, { type, label, value }]);
    setCurrentPage(1);
  }
};
```

### Clear All Filters

```tsx
const handleClearAllFilters = () => {
  setActiveFilters([]);
  setCurrentPage(1);
  setSortBy('featured');
};
```

## Integration with Filter Sidebar

```tsx
import { FilterSidebar } from '@/components/products';

export function ProductListingPage() {
  // ... state and handlers ...

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductListingHeader
        totalProducts={totalProducts}
        currentStart={currentStart}
        currentEnd={currentEnd}
        sortBy={sortBy}
        viewMode={viewMode}
        activeFilters={activeFilters}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onRemoveFilter={handleRemoveFilter}
        onOpenFilters={() => setFilterDrawerOpen(true)}
      />

      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              activeFilters={activeFilters}
              onFilterChange={handleAddFilter}
              onRemoveFilter={handleRemoveFilter}
            />
          </aside>

          {/* Products */}
          <main className="flex-1">
            <ProductGrid
              products={products}
              viewMode={viewMode}
            />
          </main>
        </div>
      </div>

      {/* Filter Drawer - Mobile */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        activeFilters={activeFilters}
        onFilterChange={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
      />
    </div>
  );
}
```

## Customizing Sort Options

You can extend the sort options by modifying the component:

```tsx
// In your custom version
const sortOptions: SortOption[] = [
  {
    value: 'featured',
    label: 'Featured',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: 'price-low-high',
    label: 'Price: Low to High',
    icon: <DollarSign className="w-4 h-4" />,
  },
  // Add custom sort options
  {
    value: 'discount',
    label: 'Biggest Discount',
    icon: <Percent className="w-4 h-4" />,
  },
  {
    value: 'reviews',
    label: 'Most Reviews',
    icon: <MessageSquare className="w-4 h-4" />,
  },
];
```

## Styling Customization

### Change Active Color

```tsx
// Modify the component or use CSS variables
const activeColor = 'text-blue-500'; // Change from lime green

// Or use CSS:
.product-listing-header [data-active="true"] {
  color: theme('colors.blue.500');
}
```

### Custom Filter Badge Styling

```tsx
<Badge
  variant="outline"
  className="custom-filter-badge pl-3 pr-2 py-1.5"
  style={{ borderColor: getFilterColor(filter.type) }}
>
  {/* ... */}
</Badge>
```

## Accessibility Enhancements

### Announce Filter Changes

```tsx
const [announcement, setAnnouncement] = useState('');

const handleRemoveFilter = (filterType: string, value: string) => {
  setActiveFilters(prev =>
    prev.filter(f => !(f.type === filterType && f.value === value))
  );
  setAnnouncement(`Removed filter: ${filterType} ${value}`);
};

// In your JSX
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>
```

### Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          setViewMode('grid-3');
          break;
        case '2':
          e.preventDefault();
          setViewMode('grid-4');
          break;
        case '3':
          e.preventDefault();
          setViewMode('list');
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Performance Optimization

### Memoize Handlers

```tsx
import { useCallback } from 'react';

const handleRemoveFilter = useCallback((filterType: string, value: string) => {
  setActiveFilters(prev =>
    prev.filter(f => !(f.type === filterType && f.value === value))
  );
}, []);

const handleSortChange = useCallback((newSort: string) => {
  setSortBy(newSort);
  setCurrentPage(1);
}, []);
```

### Debounce Filter Changes

```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedFilterChange = useDebouncedCallback(
  (filters) => {
    fetchProducts({ filters });
  },
  500
);

useEffect(() => {
  debouncedFilterChange(activeFilters);
}, [activeFilters]);
```

## Testing

### Unit Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductListingHeader } from './ProductListingHeader';

describe('ProductListingHeader', () => {
  const defaultProps = {
    totalProducts: 100,
    currentStart: 1,
    currentEnd: 24,
    sortBy: 'featured',
    viewMode: 'grid-4' as const,
    activeFilters: [],
    onSortChange: jest.fn(),
    onViewModeChange: jest.fn(),
    onRemoveFilter: jest.fn(),
    onOpenFilters: jest.fn(),
  };

  it('displays results count correctly', () => {
    render(<ProductListingHeader {...defaultProps} />);
    expect(screen.getByText(/Showing 1-24 of 100 products/)).toBeInTheDocument();
  });

  it('shows active filters', () => {
    const props = {
      ...defaultProps,
      activeFilters: [
        { type: 'category', label: 'Category', value: 'Electronics' }
      ],
    };
    render(<ProductListingHeader {...props} />);
    expect(screen.getByText(/Category: Electronics/)).toBeInTheDocument();
  });

  it('calls onRemoveFilter when X is clicked', () => {
    const props = {
      ...defaultProps,
      activeFilters: [
        { type: 'category', label: 'Category', value: 'Electronics' }
      ],
    };
    render(<ProductListingHeader {...props} />);

    const removeButton = screen.getByLabelText('Remove Category filter');
    fireEvent.click(removeButton);

    expect(props.onRemoveFilter).toHaveBeenCalledWith('category', 'Electronics');
  });
});
```

## Troubleshooting

### Issue: Filters not showing
**Solution**: Ensure `activeFilters` is an array, not undefined

### Issue: Sort not changing
**Solution**: Verify `onSortChange` is updating parent state

### Issue: View toggles not visible
**Solution**: Check screen size, they're hidden on mobile (lg:hidden)

### Issue: Mobile filter button not showing
**Solution**: Only visible on mobile, hidden on desktop

## Migration from Other Components

If you're migrating from a different header component:

1. Update import statements
2. Rename props to match new interface
3. Update filter structure to use `{ type, label, value }`
4. Implement `onOpenFilters` handler for mobile
5. Update CSS classes if needed
6. Test responsive behavior

## Support & Resources

- **Documentation**: ProductListingHeader.README.md
- **Visual Guide**: ProductListingHeader.VISUAL_GUIDE.md
- **Example**: ProductListingHeader.example.tsx
- **Component**: ProductListingHeader.tsx

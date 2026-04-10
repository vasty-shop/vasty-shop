# ProductListingHeader Component

A polished, feature-rich header component for product listing pages with sorting, view toggles, and active filter management.

## Features

### Layout Sections

The component is divided into three main sections:

1. **Left Section**: Results count display
   - Shows current range (e.g., "1-24") out of total products
   - Updates dynamically based on pagination

2. **Center Section**: Sort dropdown
   - Beautiful dropdown with icons for each sort option
   - 6 sorting options with intuitive icons
   - Responsive design (full width on tablet, icon-only on mobile)

3. **Right Section**: View toggles + Filter button
   - Grid/List view toggles (desktop only)
   - Filter button with badge counter (mobile only)
   - Clean, accessible design

### Sort Options

All sort options include relevant icons for better UX:

- **Featured** (default) - Sparkles icon
- **Price: Low to High** - Dollar sign icon
- **Price: High to Low** - Dollar sign icon
- **Newest Arrivals** - Clock icon
- **Best Selling** - Trending up icon
- **Customer Rating** - Star icon

### View Modes

Three view modes available (desktop only):

- **Grid 3 Columns** (`grid-3`) - 3x3 grid icon
- **Grid 4 Columns** (`grid-4`) - 4x4 grid icon, default
- **List View** (`list`) - Horizontal lines icon

Active view mode is highlighted with lime green accent color.

### Active Filters

- Displays below the main header when filters are active
- Each filter shown as a removable badge pill
- Format: "Category: Electronics ✕"
- Individual remove buttons on each filter
- "Clear All" button appears when 2+ filters active
- Smooth animations when adding/removing filters

### Mobile Optimizations

- Sort dropdown becomes icon-only button
- View toggles hidden on mobile
- Filter button visible only on mobile
- Badge counter shows number of active filters
- Optimized touch targets for mobile use

## Props Interface

```typescript
interface ProductListingHeaderProps {
  // Pagination
  totalProducts: number;
  currentStart: number;
  currentEnd: number;

  // Sorting
  sortBy: string;
  onSortChange: (sort: string) => void;

  // View mode
  viewMode: 'grid-3' | 'grid-4' | 'list';
  onViewModeChange: (mode: 'grid-3' | 'grid-4' | 'list') => void;

  // Filters
  activeFilters: Array<{ type: string; label: string; value: string }>;
  onRemoveFilter: (filterType: string, value: string) => void;
  onOpenFilters: () => void; // For mobile drawer
}
```

## Usage Example

```tsx
import { ProductListingHeader } from '@/components/products';

function ProductListingPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>('grid-4');
  const [activeFilters, setActiveFilters] = useState([
    { type: 'category', label: 'Category', value: 'Electronics' },
    { type: 'price', label: 'Price', value: '$50-$100' },
  ]);

  const handleRemoveFilter = (filterType: string, value: string) => {
    setActiveFilters((prev) =>
      prev.filter((f) => !(f.type === filterType && f.value === value))
    );
  };

  const handleOpenFilters = () => {
    // Open your filter drawer/modal
  };

  return (
    <div>
      <ProductListingHeader
        totalProducts={156}
        currentStart={1}
        currentEnd={24}
        sortBy={sortBy}
        viewMode={viewMode}
        activeFilters={activeFilters}
        onSortChange={setSortBy}
        onViewModeChange={setViewMode}
        onRemoveFilter={handleRemoveFilter}
        onOpenFilters={handleOpenFilters}
      />
      {/* Your product grid/list here */}
    </div>
  );
}
```

## Sort Values

The component supports these sort values:

- `featured` - Default featured products
- `price-low-high` - Price ascending
- `price-high-low` - Price descending
- `newest` - Newest arrivals first
- `best-selling` - Best sellers first
- `rating` - Highest rated first

## Styling & Customization

### Colors

The component uses the Fluxez brand colors:

- **Primary accent**: `primary-lime` (#84cc16)
- **Active state**: Lime green highlight
- **Borders**: Gray-200 for subtle separation
- **Backgrounds**: White with gray-50 for badges

### Responsive Breakpoints

- **Mobile**: < 640px (sm)
  - Sort becomes icon-only
  - Filter button visible
  - View toggles hidden

- **Tablet**: 640px - 1024px (sm - lg)
  - Full sort dropdown visible
  - Filter button hidden
  - View toggles hidden

- **Desktop**: > 1024px (lg)
  - All features visible
  - View toggles shown
  - Filter button hidden

### Sticky Behavior

The header is sticky positioned at the top of the page (`sticky top-0 z-40`) so it remains visible when scrolling through products.

## Accessibility

- All buttons have proper `aria-label` attributes
- Keyboard navigation fully supported
- Focus states clearly visible
- Screen reader friendly text
- High contrast for readability

## Animation Details

- Filter pills animate in/out with scale and opacity
- Active filter section smoothly expands/collapses
- Button tap animations for better feedback
- Smooth transitions on all hover states

## Dependencies

- `framer-motion` - Animations
- `lucide-react` - Icons
- `@radix-ui/react-select` - Dropdown component
- Custom UI components: `Button`, `Badge`, `Select`

## File Location

```
/frontend/src/components/products/ProductListingHeader.tsx
```

## Related Files

- `ProductListingHeader.example.tsx` - Interactive example
- `index.ts` - Export configuration
- `ProductGrid.tsx` - Works well with this component
- `FilterModal.tsx` - Mobile filter drawer

## Best Practices

1. **Always provide active filters**: Even if empty array, don't pass undefined
2. **Keep filter types consistent**: Use the same type strings throughout your app
3. **Implement filter drawer**: Connect `onOpenFilters` to a proper modal/drawer
4. **Update counts dynamically**: Keep `currentStart`, `currentEnd`, and `totalProducts` in sync
5. **Persist view mode**: Consider saving user's preferred view mode to localStorage
6. **Handle responsive layout**: Adjust your product grid based on `viewMode`

## Performance Notes

- AnimatePresence only renders when filters change
- Icons are tree-shaken from lucide-react
- Component uses React.memo-friendly patterns
- No unnecessary re-renders on state changes

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS Grid support
- Requires Flexbox support

## Future Enhancements

Potential additions:

- Save view preference to localStorage
- Keyboard shortcuts for view toggling
- Export filters to URL params
- Print-friendly layout option
- Compact mode for smaller screens
- Custom filter badge colors by type

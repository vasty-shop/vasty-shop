# FilterSidebar Component

A comprehensive, production-ready filtering sidebar component for product listing pages with full accessibility, TypeScript support, and responsive design.

## Features

### 1. Categories Filter
- Expandable/collapsible accordion sections
- Checkbox selection for multiple categories
- Product count display for each category
- Pre-defined categories:
  - Men's Fashion
  - Women's Fashion
  - Electronics
  - Home & Living
  - Sports
  - Beauty
  - Books

### 2. Price Range Filter
- Dual-range slider for custom price selection
- Preset price range checkboxes:
  - Under $25
  - $25 - $50
  - $50 - $100
  - $100 - $200
  - $200+
- Real-time price display
- Range: $0 - $1000 with $5 increments

### 3. Size Filter
- Button-based size selection
- Sizes: XS, S, M, L, XL, XXL
- Conditional visibility (only shows for clothing categories)
- Multi-select functionality
- Visual feedback with lime green highlights

### 4. Color Filter
- Interactive color swatches (colored circles)
- 12 pre-defined colors:
  - Black, White, Gray, Navy
  - Red, Pink, Green, Blue
  - Yellow, Purple, Brown, Beige
- Visual selection indicator
- Hover effects and scale animation
- Accessible with color names as tooltips

### 5. Brand Filter
- Searchable brand list
- 15+ popular brands included
- Real-time search filtering
- Checkbox multi-select
- Scrollable list (max height: 240px)
- "No brands found" state
- Clear search button

### 6. Rating Filter
- Star-based rating display
- Filter by minimum rating:
  - 4+ Stars
  - 3+ Stars
  - 2+ Stars
  - 1+ Stars
- Single selection
- Visual star indicators

### 7. General Features
- "Clear All Filters" button with active filter count
- Smooth accordion animations
- Sticky positioning on desktop
- Mobile-responsive design
- Works in modal/drawer for mobile
- Fluxez brand styling (lime green accents)
- Full TypeScript support
- WCAG accessibility compliant

## Installation

The component uses the following dependencies (already installed):
```bash
npm install @radix-ui/react-accordion @radix-ui/react-checkbox @radix-ui/react-slider
```

## Usage

### Basic Usage (Desktop)

```tsx
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { useState } from 'react';

function ProductListingPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRange([0, 1000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setMinRating(0);
  };

  return (
    <div className="grid grid-cols-[280px_1fr] gap-8">
      <FilterSidebar
        selectedCategories={selectedCategories}
        selectedPriceRange={selectedPriceRange}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedBrands={selectedBrands}
        minRating={minRating}
        onCategoryChange={setSelectedCategories}
        onPriceRangeChange={setSelectedPriceRange}
        onSizeChange={setSelectedSizes}
        onColorChange={setSelectedColors}
        onBrandChange={setSelectedBrands}
        onRatingChange={setMinRating}
        onClearAll={handleClearAll}
        categoryProductCounts={{
          'mens-fashion': 150,
          'womens-fashion': 200,
          'electronics': 80,
          'home-living': 45,
          'sports': 120,
          'beauty': 90,
          'books': 60,
        }}
      />
      {/* Product Grid */}
    </div>
  );
}
```

### Mobile Usage (In Modal)

```tsx
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function MobileProductPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  // ... filter state

  return (
    <>
      <Button onClick={() => setFilterOpen(true)}>
        Filters
      </Button>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <FilterSidebar
            {...filterProps}
            isMobile
            className="shadow-none"
          />

          <Button onClick={() => setFilterOpen(false)}>
            Apply Filters
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Props

### FilterSidebarProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedCategories` | `string[]` | Yes | Array of selected category IDs |
| `selectedPriceRange` | `[number, number]` | Yes | Min and max price range |
| `selectedSizes` | `string[]` | Yes | Array of selected sizes |
| `selectedColors` | `string[]` | Yes | Array of selected color IDs |
| `selectedBrands` | `string[]` | Yes | Array of selected brand names |
| `minRating` | `number` | Yes | Minimum rating filter (0-5) |
| `onCategoryChange` | `(categories: string[]) => void` | Yes | Category selection handler |
| `onPriceRangeChange` | `(range: [number, number]) => void` | Yes | Price range change handler |
| `onSizeChange` | `(sizes: string[]) => void` | Yes | Size selection handler |
| `onColorChange` | `(colors: string[]) => void` | Yes | Color selection handler |
| `onBrandChange` | `(brands: string[]) => void` | Yes | Brand selection handler |
| `onRatingChange` | `(rating: number) => void` | Yes | Rating change handler |
| `onClearAll` | `() => void` | Yes | Clear all filters handler |
| `categoryProductCounts` | `Record<string, number>` | No | Product count per category |
| `isMobile` | `boolean` | No | Enable mobile layout (default: false) |
| `className` | `string` | No | Additional CSS classes |

## Category IDs

The following category IDs are available:
- `mens-fashion` - Men's Fashion
- `womens-fashion` - Women's Fashion
- `electronics` - Electronics
- `home-living` - Home & Living
- `sports` - Sports
- `beauty` - Beauty
- `books` - Books

## Color IDs

Available color IDs for the color filter:
- `black`, `white`, `gray`, `navy`
- `red`, `pink`, `green`, `blue`
- `yellow`, `purple`, `brown`, `beige`

## Size Options

Available sizes (conditional on clothing categories):
- `XS`, `S`, `M`, `L`, `XL`, `XXL`

## Brand List

Pre-defined brands:
- Nike, Adidas, Puma, Under Armour, New Balance, Reebok
- Zara, H&M, Uniqlo, Gap, Forever 21, Mango
- Levi's, Tommy Hilfiger, Calvin Klein

## Filtering Products

Example of how to filter products based on selected filters:

```tsx
const filteredProducts = products.filter((product) => {
  // Category filter
  if (selectedCategories.length > 0 &&
      !selectedCategories.includes(product.category)) {
    return false;
  }

  // Price filter
  if (product.price < selectedPriceRange[0] ||
      product.price > selectedPriceRange[1]) {
    return false;
  }

  // Size filter
  if (selectedSizes.length > 0 &&
      product.size &&
      !selectedSizes.includes(product.size)) {
    return false;
  }

  // Color filter
  if (selectedColors.length > 0 &&
      !selectedColors.includes(product.color)) {
    return false;
  }

  // Brand filter
  if (selectedBrands.length > 0 &&
      !selectedBrands.includes(product.brand)) {
    return false;
  }

  // Rating filter
  if (minRating > 0 && product.rating < minRating) {
    return false;
  }

  return true;
});
```

## Styling

The component uses Fluxez brand colors:
- Primary: Lime Green (`#84cc16`)
- Primary Dark: `#65a30d`
- Accent: Blue (`#3b82f6`)
- Background: Cloud gradient
- Text: `#0f172a` (primary), `#64748b` (secondary)

### Custom Styling

You can add custom classes using the `className` prop:

```tsx
<FilterSidebar
  {...props}
  className="bg-gradient-to-b from-white to-gray-50"
/>
```

## Accessibility

The component follows WCAG guidelines:
- All interactive elements are keyboard accessible
- Proper ARIA labels and roles
- Focus indicators on all controls
- Color contrast ratios meet AA standards
- Screen reader friendly
- Semantic HTML structure

## Responsive Design

### Desktop (lg+)
- Fixed width sidebar (280px)
- Sticky positioning
- Full feature set visible

### Mobile (<lg)
- Full-width layout
- Optimized for touch
- Works in modal/drawer
- Reduced spacing
- Scrollable content

## Performance

- Memoized filter callbacks recommended
- Efficient re-renders with React state
- Lazy loading for large brand lists
- Optimized accordion animations
- No unnecessary prop drilling

## Examples

See `FilterSidebar.example.tsx` for complete working examples including:
- Desktop layout with sidebar
- Mobile layout with modal
- Filter state management
- Product filtering logic
- Integration with ProductGrid

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: iOS 13+
- Chrome Android: Latest

## License

Part of the Fluxez E-Commerce Platform

# Products Page Implementation

A comprehensive e-commerce products listing page with advanced filtering, sorting, and pagination features.

## Components Overview

### 1. ProductsPage (`ProductsPage.tsx`)
Main page component that orchestrates the entire product browsing experience.

**Features:**
- Responsive layout (desktop sidebar + mobile drawer)
- Real-time filtering without "Apply" button
- Multiple view modes (grid-3, grid-4, list)
- Advanced sorting options
- Pagination with page numbers
- URL query parameter sync for shareable filtered URLs
- Empty state handling
- Loading states
- Wishlist functionality

### 2. FilterSidebar (`components/FilterSidebar.tsx`)
Comprehensive filter sidebar with multiple filter options.

**Filter Options:**
- **Category**: Outerwear, Jackets, Dresses, Knitwear, Vests, Tops, Bottoms, Activewear, Accessories
- **Price Range**: Slider from $0 to $2000
- **Size**: XS, S, M, L, XL, XXL
- **Color**: Visual color swatches + checkboxes
- **Brand**: WinterElegance, UrbanStyle, SeasonalChic, ModernClassics, ActiveLife, LuxeBasics
- **Rating**: 5-star to 1-star filters

**Features:**
- Active filter badges with quick remove
- Collapsible accordion sections (all open by default)
- Product count display
- Clear All button
- Responsive design

### 3. ProductListingHeader (`components/ProductListingHeader.tsx`)
Header component with sorting and view controls.

**Sort Options:**
- Featured
- Most Popular
- Newest
- Highest Rated
- Price: Low to High
- Price: High to Low
- Name: A to Z
- Name: Z to A

**View Modes:**
- Grid 3 columns (desktop) / 1 column (mobile)
- Grid 4 columns (desktop) / 2 columns (mobile)
- List view (horizontal cards)

### 4. ProductListView (`components/ProductListView.tsx`)
Horizontal product card for list view mode.

**Features:**
- Larger image display
- More product details (description, sizes, colors)
- Prominent pricing
- Add to cart and wishlist actions
- Responsive design

## Usage

### Basic Implementation

```tsx
import { ProductsPage } from '@/features/products/ProductsPage';

function App() {
  return <ProductsPage />;
}
```

### URL Query Parameters

The page supports URL query parameters for sharing filtered/sorted product lists:

```
/products?categories=Jackets,Dresses&priceMin=100&priceMax=500&sort=price-low-high&view=list&page=2
```

**Supported Parameters:**
- `categories`: Comma-separated category names
- `sizes`: Comma-separated sizes
- `colors`: Comma-separated color names
- `brands`: Comma-separated brand names
- `ratings`: Comma-separated rating values
- `priceMin`: Minimum price (0-2000)
- `priceMax`: Maximum price (0-2000)
- `sort`: Sort option (see SortOption type)
- `view`: View mode (grid-3, grid-4, list)
- `page`: Current page number

## Data Structure

### Product Interface

```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: string[];
  model3d?: string;
  sizes: Size[];
  rating: number;
  category: string;
  description?: string;
  characteristics?: Record<string, string>;
  colors?: string[];
}
```

### Filter Options Interface

```typescript
interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  brands: string[];
  ratings: number[];
}
```

## Filtering Logic

### Category Filter
```typescript
products.filter(p => filters.categories.includes(p.category))
```

### Price Filter
```typescript
products.filter(p => {
  const price = p.salePrice || p.price;
  return price >= filters.priceRange[0] && price <= filters.priceRange[1];
})
```

### Size Filter
```typescript
products.filter(p =>
  p.sizes.some(size => filters.sizes.includes(size))
)
```

### Color Filter
Supports both color names and hex codes:
```typescript
products.filter(p =>
  p.colors?.some(color => filters.colors.includes(normalizeColor(color)))
)
```

### Rating Filter
Shows products with rating >= selected rating:
```typescript
const minRating = Math.min(...filters.ratings);
products.filter(p => p.rating >= minRating)
```

## Sorting Logic

```typescript
switch (sortBy) {
  case 'price-low-high':
    return products.sort((a, b) =>
      (a.salePrice || a.price) - (b.salePrice || b.price)
    );
  case 'rating':
    return products.sort((a, b) => b.rating - a.rating);
  // ... more cases
}
```

## Pagination

- **Items per page**: 24 products
- **Smart page numbers**: Shows ellipsis for large page counts
- **URL sync**: Current page stored in URL
- **Scroll to top**: Automatic on page change

## Mobile Experience

### Filter Drawer
- Opens via "Filters" button in header
- Full-screen modal on mobile
- "Clear All" and "Apply Filters" buttons at bottom
- Scrollable content

### View Mode Selector
- Dropdown on mobile (instead of icon buttons)
- Grid 3x3, Grid 4x4, List View options

## Responsive Breakpoints

- **Mobile**: < 768px
  - Single column grid
  - Compact product cards
  - Filter drawer instead of sidebar

- **Tablet**: 768px - 1024px
  - 2-3 column grid
  - No sidebar (filter drawer)

- **Desktop**: > 1024px
  - Fixed sidebar (280-320px)
  - 3-4 column grid
  - Icon-based view mode toggles

## Performance Optimizations

1. **useMemo for filtering/sorting**
   - Prevents unnecessary recalculations
   - Only runs when dependencies change

2. **AnimatePresence for smooth transitions**
   - Fade animations between view modes
   - Prevents layout shift

3. **Lazy loading images**
   - `loading="lazy"` on all product images
   - Progressive image loading with blur effect

4. **URL state management**
   - Filters persist across page refreshes
   - Shareable filtered URLs

## Customization

### Adjusting Products Per Page

```typescript
const PRODUCTS_PER_PAGE = 24; // Change this value
```

### Adding New Filter Options

1. Add to `FilterOptions` interface
2. Add to `FilterSidebar` component
3. Add filtering logic in `ProductsPage`
4. Add URL parameter handling

### Adding New Sort Options

1. Add to `SortOption` type
2. Add to `SORT_OPTIONS` array in `ProductListingHeader`
3. Add sorting logic in `ProductsPage`

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- React Router DOM (for navigation and URL params)
- Framer Motion (for animations)
- Radix UI (for accessible components)
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Future Enhancements

- [ ] Infinite scroll option
- [ ] Product quick view modal
- [ ] Compare products feature
- [ ] Save filter presets
- [ ] Recently viewed products
- [ ] Filter by availability
- [ ] Multi-currency support
- [ ] Social sharing buttons
- [ ] Advanced search/autocomplete
- [ ] Product variations (color/size) on cards

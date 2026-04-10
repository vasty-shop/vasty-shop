# CategoriesPage Component

A comprehensive, category-specific product listing page for Fluxez Shop that provides an optimized shopping experience for different product categories.

## Overview

The CategoriesPage component is designed to showcase products from specific categories with tailored filtering, sorting, and navigation options. It provides a specialized version of the general ProductsPage, optimized for category-specific browsing.

## Features

### 1. Dynamic Category Routing
- Route pattern: `/category/:categorySlug`
- Supported categories:
  - `mens-fashion` - Men's Fashion
  - `womens-fashion` - Women's Fashion
  - `electronics` - Electronics
  - `home-living` - Home & Living
  - `sports` - Sports & Fitness
  - `beauty` - Beauty & Personal Care
  - `books` - Books & Media

### 2. Category Header
- **Category Name & Icon**: Each category has a unique icon (Lucide icons)
- **Description**: SEO-friendly category descriptions
- **Breadcrumb Navigation**: Home > Categories > [Category Name]
- **Banner Image**: Optional hero image for visual appeal
- **Product Count**: Shows total products in category
- **Price Range**: Displays category-specific price range

### 3. Sub-category Navigation
- **Horizontal Scrollable Tabs**: Easy navigation between subcategories
- **Category-Specific Subcategories**:
  - Men's Fashion: Shirts, Pants, Shoes, Accessories
  - Women's Fashion: Dresses, Tops, Bottoms, Shoes, Accessories
  - Electronics: Phones, Laptops, Cameras, Audio
  - Home & Living: Furniture, Decor, Bedding, Kitchen
  - Sports: Activewear, Equipment, Footwear, Accessories
  - Beauty: Skincare, Makeup, Haircare, Fragrance
  - Books: Fiction, Non-Fiction, Educational, Magazines

### 4. Featured Products Section
- **Top Picks**: Highlights 4-6 featured products
- **Only on Main Category**: Shows when no subcategory is selected
- **Trending Icon**: Visual indicator for featured items

### 5. Category-Specific Filters
- **Relevant Filters Only**: Shows only applicable filters for each category
  - Fashion: Size, Color, Material, Style, Brand, Price
  - Electronics: Brand, Features, Price, Rating
  - Home: Color, Material, Room, Price
  - Beauty: Skin Type, Category, Brand, Price
  - Books: Genre, Author, Format, Rating, Price
- **Dynamic Price Ranges**: Adjusted based on category
- **No Irrelevant Filters**: E.g., "Size" won't show for Electronics

### 6. Responsive Design
- **Desktop**: Sidebar filters with grid/list view toggle
- **Mobile**: Bottom sheet filters with optimized controls
- **Adaptive Layout**: Grid adjusts from 2 to 6 columns based on screen size

### 7. Sorting Options
- Popular (default)
- Newest
- Price: Low to High
- Price: High to Low
- Top Rated

### 8. View Modes
- **Grid View**: 2-6 columns (responsive)
- **List View**: Single column with detailed product cards

## File Structure

```
/features/categories/
├── CategoriesPage.tsx      # Main component
├── index.ts                # Exports
└── README.md               # This file

/types/
└── category.ts             # Category type definitions

/data/
└── categories.ts           # Category data and configuration
```

## Usage

### Basic Integration

```tsx
import { CategoriesPage } from '@/features/categories';

// In your router configuration
<Route path="/category/:categorySlug" element={<CategoriesPage />} />
```

### Navigation to Categories

```tsx
import { Link } from 'react-router-dom';

// Link to category
<Link to="/category/mens-fashion">Men's Fashion</Link>

// Link to category with subcategory
<Link to="/category/womens-fashion?subcategory=dresses">Women's Dresses</Link>
```

## Type Definitions

### Category Interface

```typescript
interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  subcategories?: Subcategory[];
  bannerImage?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  relevantFilters?: string[];
}
```

### Subcategory Interface

```typescript
interface Subcategory {
  id: string;
  name: string;
  slug: string;
}
```

## Component Architecture

### Main Components

1. **CategoriesPage**: Main page component
2. **FilterSidebar**: Desktop filter sidebar
3. **MobileFiltersDrawer**: Mobile filter bottom sheet

### State Management

```typescript
// View and sorting state
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [sortBy, setSortBy] = useState<SortOption>('popular');

// Filter state
const [filters, setFilters] = useState<FilterState>({
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  rating?: number;
});
```

## Key Features Implementation

### 1. Category Loading

```typescript
React.useEffect(() => {
  if (categorySlug) {
    const cat = getCategoryBySlug(categorySlug);
    if (cat) {
      setCategory(cat);
      // Load products for this category
    } else {
      navigate('/products'); // Redirect if not found
    }
  }
}, [categorySlug, navigate]);
```

### 2. Filter Application

```typescript
React.useEffect(() => {
  let products = [...allProducts];

  // Apply subcategory filter
  if (selectedSubcategory) {
    products = filterBySubcategory(products);
  }

  // Apply price filter
  if (filters.minPrice || filters.maxPrice) {
    products = filterByPrice(products, filters);
  }

  // Apply sorting
  products = sortProducts(products, sortBy);

  setFilteredProducts(products);
}, [allProducts, selectedSubcategory, filters, sortBy]);
```

### 3. URL State Sync

```typescript
// Sync subcategory with URL params
React.useEffect(() => {
  const subcategory = searchParams.get('subcategory');
  if (subcategory) {
    setSelectedSubcategory(subcategory);
  }
}, [searchParams]);
```

## Styling

The component uses Tailwind CSS with custom design tokens:

- **Primary Color**: `primary-lime` (Fluxez brand color)
- **Accent Colors**: `accent-blue`, `card-black`
- **Background**: `cloud-gradient`
- **Text**: `text-primary`, `text-secondary`

## Accessibility

- Semantic HTML structure
- ARIA labels for navigation
- Keyboard navigation support
- Focus states for interactive elements
- Screen reader friendly

## Performance Optimizations

1. **Lazy Loading**: Images use lazy loading
2. **Memoization**: Component memoization where applicable
3. **Animation Performance**: Framer Motion with optimized transitions
4. **Responsive Images**: Appropriate image sizes for different screens

## Integration with Existing Components

### Reused Components

1. **ProductCard** (`/components/products/ProductCard.tsx`)
   - Used for product display
   - Supports grid and list variants

2. **BreadcrumbNavigation** (`/components/layout/BreadcrumbNavigation.tsx`)
   - Category breadcrumb trail
   - SEO-friendly navigation

3. **UI Components** (`/components/ui/`)
   - Button, Badge, Card
   - Consistent design system

## SEO Considerations

- Dynamic page titles based on category
- Meta descriptions for each category
- Structured breadcrumb navigation
- Semantic HTML5 elements
- Category-specific content

## Future Enhancements

1. **Server-Side Rendering**: For better SEO and performance
2. **Infinite Scroll**: Load more products on scroll
3. **Advanced Filters**: Color swatches, multi-select filters
4. **Product Comparison**: Compare products within category
5. **Category Analytics**: Track popular filters and products
6. **Personalization**: Category recommendations based on user behavior
7. **Quick View**: Product preview modal
8. **Wishlist Integration**: Add to wishlist from category page

## Example Routes

```
/category/mens-fashion
/category/mens-fashion?subcategory=shirts
/category/womens-fashion?subcategory=dresses
/category/electronics?subcategory=phones
/category/beauty?subcategory=skincare
```

## Testing Recommendations

1. **Unit Tests**: Component rendering and state management
2. **Integration Tests**: Filter and sort functionality
3. **E2E Tests**: Complete user flows (browse, filter, sort, view)
4. **Performance Tests**: Load time with large product catalogs
5. **Accessibility Tests**: Screen reader and keyboard navigation

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

- React 18+
- React Router DOM
- Framer Motion
- Lucide React (icons)
- Tailwind CSS
- TypeScript

## Contributing

When adding new categories or features:

1. Update `/data/categories.ts` with new category data
2. Add appropriate icons from Lucide React
3. Define relevant filters for the category
4. Add subcategories if applicable
5. Update tests and documentation

## License

Part of the Fluxez Shop project.

# Fluxez Product Components

Comprehensive product card and grid components for the Fluxez e-commerce platform.

## Components

### ProductCard

A versatile product card component that supports multiple variants and features.

#### Features

- **Multiple Variants**: Standard, Flash Sale, Compact
- **Product Image**: Lazy loading with blur placeholder
- **Wishlist Integration**: Heart icon to add/remove from wishlist
- **Quick Add**: Hover-activated "Add to Cart" button
- **Ratings Display**: Star rating with sold count
- **Price Display**: Support for sale prices with strikethrough on original price
- **Badges**: NEW, SALE, HOT, discount percentage badges
- **Flash Sale Features**:
  - Countdown timer
  - Progress bar showing stock sold
  - Special flash sale badge
- **Color Swatches**: Display available product colors
- **Smooth Animations**: Framer Motion powered hover effects
- **Responsive Design**: Works on all screen sizes

#### Props

```typescript
interface ProductCardProps {
  product: Product;                              // Product data
  variant?: 'standard' | 'flash-sale' | 'compact'; // Card variant
  showQuickAdd?: boolean;                        // Show "Add to Cart" on hover
  showRating?: boolean;                          // Show star rating
  showBadges?: boolean;                          // Show discount/sale badges
  onWishlistToggle?: (productId: string) => void; // Wishlist callback
  onAddToCart?: (product: Product) => void;      // Add to cart callback
  onClick?: (product: Product) => void;          // Card click callback
  isWishlisted?: boolean;                        // Wishlist state
  className?: string;                            // Additional CSS classes
  flashSale?: {                                  // Flash sale configuration
    endTime: Date;
    soldCount: number;
    totalStock: number;
  };
}
```

#### Usage Examples

**Standard Card:**
```tsx
<ProductCard
  product={product}
  variant="standard"
  showQuickAdd={true}
  showRating={true}
  showBadges={true}
  onWishlistToggle={handleWishlistToggle}
  onAddToCart={handleAddToCart}
  isWishlisted={false}
/>
```

**Flash Sale Card:**
```tsx
<ProductCard
  product={product}
  variant="flash-sale"
  flashSale={{
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    soldCount: 9,
    totalStock: 10,
  }}
/>
```

---

### ProductGrid

A flexible grid layout component for displaying multiple products with filtering and various column configurations.

#### Features

- **Responsive Grid Layouts**: 2, 3, 4, or 5 column grids
- **Filter Tabs**: Category filtering with smooth animations
- **Section Headers**: Title with "See All" link
- **Stagger Animations**: Products animate in sequentially
- **Multiple Variants**: Support for different product card types
- **Empty State**: Helpful message when no products found
- **Preset Layouts**: Pre-configured grids for common use cases

#### Props

```typescript
interface ProductGridProps {
  products: Product[];                           // Array of products
  title?: string;                                // Section title
  showSeeAll?: boolean;                          // Show "See All" link
  onSeeAllClick?: () => void;                    // See all callback
  showFilters?: boolean;                         // Show filter tabs
  filters?: string[];                            // Filter options
  defaultFilter?: string;                        // Default selected filter
  onFilterChange?: (filter: string) => void;     // Filter change callback
  columns?: 2 | 3 | 4 | 5;                       // Number of columns
  variant?: 'standard' | 'flash-sale' | 'compact'; // Product card variant
  showQuickAdd?: boolean;                        // Enable quick add
  showRating?: boolean;                          // Show ratings
  showBadges?: boolean;                          // Show badges
  onWishlistToggle?: (productId: string) => void; // Wishlist callback
  onAddToCart?: (product: Product) => void;      // Add to cart callback
  onProductClick?: (product: Product) => void;   // Product click callback
  wishlistedProducts?: string[];                 // Array of wishlisted IDs
  className?: string;                            // Additional CSS classes
  flashSaleConfig?: {                            // Flash sale configuration
    endTime: Date;
    getSoldCount?: (productId: string) => number;
    getTotalStock?: (productId: string) => number;
  };
}
```

#### Usage Examples

**Basic Grid:**
```tsx
<ProductGrid
  products={products}
  title="Featured Products"
  columns={4}
  showSeeAll={true}
  onSeeAllClick={() => navigate('/products')}
/>
```

**Grid with Filters:**
```tsx
<ProductGrid
  products={products}
  title="Shop by Category"
  showFilters={true}
  filters={['ALL', 'WOMAN', 'CHILDREN', 'SHOES', 'JACKETS']}
  defaultFilter="ALL"
  onFilterChange={handleFilterChange}
  columns={4}
/>
```

**Flash Sale Grid:**
```tsx
<ProductGrid
  products={flashSaleProducts}
  title="Flash Sale"
  variant="flash-sale"
  columns={4}
  flashSaleConfig={{
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    getSoldCount: (id) => getSoldCountFromAPI(id),
    getTotalStock: (id) => getTotalStockFromAPI(id),
  }}
/>
```

---

### Preset Grid Components

Pre-configured grid components for common use cases:

#### PopularProductsGrid
```tsx
<PopularProductsGrid
  products={popularProducts}
  onAddToCart={handleAddToCart}
/>
```
- Title: "Popular Products"
- 4 columns
- No filters

#### FeaturedProductsGrid
```tsx
<FeaturedProductsGrid
  products={featuredProducts}
  onFilterChange={handleFilterChange}
/>
```
- Title: "Featured Products"
- 4 columns
- With filter tabs

#### TodaysForYouGrid
```tsx
<TodaysForYouGrid
  products={recommendedProducts}
/>
```
- Title: "Today's For You!"
- 5 columns
- No filters

#### FlashSaleGrid
```tsx
<FlashSaleGrid
  products={saleProducts}
  flashSaleConfig={config}
/>
```
- Title: "Flash Sale"
- Flash sale variant
- 4 columns

---

## Styling

### Colors Used

From Fluxez brand colors:
- **Primary**: `primary-lime` (#84cc16)
- **Sale/Discount**: `badge-sale` (#ef4444)
- **Text**: `text-primary` (#0f172a), `text-secondary` (#64748b)
- **Background**: `card-white` (#ffffff)
- **Dark Elements**: `card-black` (#0f172a), `card-dark` (#1f2937)

### Animations

- **Card Hover**: Scale up, shadow increase, translate up
- **Quick Add Button**: Slides up from bottom on hover
- **Filter Tabs**: Animated underline with spring animation
- **Grid Items**: Stagger animation on load
- **Wishlist Icon**: Scale animation on click

### Responsive Breakpoints

- **Mobile**: 2 columns
- **Tablet** (sm): 2-3 columns
- **Desktop** (md): 3-4 columns
- **Large** (lg): 4-5 columns

---

## Dependencies

- **React**: ^19.1.1
- **Framer Motion**: ^12.23.12 (for animations)
- **Lucide React**: ^0.542.0 (for icons)
- **Radix UI Tabs**: ^1.1.13 (for filter tabs)
- **TailwindCSS**: ^3.4.17
- **Class Variance Authority**: ^0.7.1

---

## Integration Guide

### 1. Import Components

```tsx
import {
  ProductCard,
  ProductGrid,
  FeaturedProductsGrid,
  FlashSaleGrid,
} from '@/components/products';
```

### 2. Prepare Product Data

Ensure your products match the `Product` type from `@/types`:

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

### 3. Set Up State Management

```tsx
const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

const handleWishlistToggle = (productId: string) => {
  setWishlistedProducts(prev =>
    prev.includes(productId)
      ? prev.filter(id => id !== productId)
      : [...prev, productId]
  );
};

const handleAddToCart = (product: Product) => {
  // Add to cart logic
  cartStore.addItem(product);
};
```

### 4. Render Components

```tsx
<div className="container mx-auto px-4 py-8">
  <FeaturedProductsGrid
    products={products}
    onWishlistToggle={handleWishlistToggle}
    onAddToCart={handleAddToCart}
    wishlistedProducts={wishlistedProducts}
  />
</div>
```

---

## Performance Optimization

### Image Lazy Loading

All product images use lazy loading with blur placeholders:
```tsx
<img loading="lazy" />
```

### Animation Optimization

- Uses `will-change` CSS for smoother animations
- Framer Motion optimizes rendering
- Stagger animations prevent layout thrashing

### Responsive Images

Consider using responsive image sizes:
```tsx
// Example with srcset
<img
  src={product.images[0]}
  srcSet={`
    ${product.images[0]}?w=300 300w,
    ${product.images[0]}?w=600 600w,
    ${product.images[0]}?w=900 900w
  `}
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
/>
```

---

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels for interactive elements
- Focus visible states
- Alt text for images

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Examples

See `ProductComponents.example.tsx` for comprehensive usage examples including:
- Standard product cards
- Flash sale implementations
- Grid layouts with filters
- Complete page layouts
- Custom configurations

---

## Tips & Best Practices

1. **Wishlist State**: Store wishlisted product IDs in global state (Zustand, Redux, etc.)
2. **Cart Integration**: Connect `onAddToCart` to your cart management system
3. **Product Navigation**: Use `onClick` to navigate to product detail pages
4. **Filter Performance**: For large product lists, implement server-side filtering
5. **Flash Sales**: Update countdown timers with real-time data
6. **Image Optimization**: Use CDN and proper image formats (WebP, AVIF)
7. **Loading States**: Show skeleton loaders while fetching products

---

## Future Enhancements

- [ ] Virtual scrolling for large product lists
- [ ] Comparison mode to compare multiple products
- [ ] Product quick view modal
- [ ] Advanced filtering (price range, size, color)
- [ ] Sort options (price, rating, newest)
- [ ] Infinite scroll pagination
- [ ] AR preview integration
- [ ] Social sharing functionality

---

## Support

For issues or questions, contact the Fluxez development team.

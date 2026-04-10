# Quick Start Guide - Fluxez Product Components

Get up and running with ProductCard and ProductGrid in 5 minutes!

## Installation

These components are already integrated into your Fluxez project. All dependencies are installed.

## Basic Usage

### 1. Import the Components

```typescript
import { ProductCard, ProductGrid } from '@/components/products';
import type { Product } from '@/types';
```

### 2. Prepare Your Product Data

```typescript
const products: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    brand: 'FLUXEZ',
    price: 29.99,
    salePrice: 19.99,
    discountPercent: 33,
    images: ['/images/products/tshirt-white.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    category: 'T-SHIRT',
    colors: ['#FFFFFF', '#000000', '#3B82F6'],
  },
  // ... more products
];
```

### 3. Create a Simple Product Grid

```tsx
import { FeaturedProductsGrid } from '@/components/products';

export function ProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FeaturedProductsGrid
        products={products}
        showSeeAll={true}
        onSeeAllClick={() => navigate('/all-products')}
      />
    </div>
  );
}
```

That's it! You now have a fully functional product grid with filters.

## Add Interactivity

### Handle Wishlist

```tsx
import { useState } from 'react';
import { FeaturedProductsGrid } from '@/components/products';

export function ProductPage() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const handleWishlistToggle = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <FeaturedProductsGrid
      products={products}
      wishlistedProducts={wishlist}
      onWishlistToggle={handleWishlistToggle}
    />
  );
}
```

### Handle Add to Cart

```tsx
import { useCartStore } from '@/stores/cart'; // Your cart store

export function ProductPage() {
  const addToCart = useCartStore(state => state.addItem);

  const handleAddToCart = (product: Product) => {
    addToCart({
      product,
      size: 'M', // Default or show size selector
      quantity: 1,
    });
  };

  return (
    <FeaturedProductsGrid
      products={products}
      onAddToCart={handleAddToCart}
    />
  );
}
```

### Handle Product Click (Navigation)

```tsx
import { useNavigate } from 'react-router-dom';

export function ProductPage() {
  const navigate = useNavigate();

  const handleProductClick = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <FeaturedProductsGrid
      products={products}
      onProductClick={handleProductClick}
    />
  );
}
```

## Common Layouts

### Home Page with Multiple Sections

```tsx
export function HomePage() {
  return (
    <div className="space-y-12">
      {/* Flash Sale */}
      <FlashSaleGrid
        products={flashSaleProducts}
        flashSaleConfig={{
          endTime: new Date('2025-10-27T00:00:00'),
          getSoldCount: (id) => 9,
          getTotalStock: (id) => 10,
        }}
      />

      {/* Featured Products with Filters */}
      <FeaturedProductsGrid
        products={featuredProducts}
      />

      {/* Popular Products */}
      <PopularProductsGrid
        products={popularProducts}
      />

      {/* Personalized Recommendations */}
      <TodaysForYouGrid
        products={recommendedProducts}
      />
    </div>
  );
}
```

### Category Page with Custom Filters

```tsx
export function CategoryPage() {
  const customFilters = ['ALL', 'NEW ARRIVALS', 'BESTSELLERS', 'ON SALE'];

  const handleFilterChange = (filter: string) => {
    // Filter products
    console.log('Filter:', filter);
  };

  return (
    <ProductGrid
      products={products}
      title="Women's Collection"
      showFilters={true}
      filters={customFilters}
      onFilterChange={handleFilterChange}
      columns={4}
    />
  );
}
```

### Mobile-Optimized Layout

```tsx
export function MobileProductGrid() {
  return (
    <ProductGrid
      products={products}
      title="Browse Products"
      columns={2}
      variant="compact"
      showQuickAdd={false} // Disable on mobile
      showRating={true}
    />
  );
}
```

## Customization

### Change Number of Columns

```tsx
<ProductGrid
  products={products}
  columns={3} // 2, 3, 4, or 5
/>
```

### Disable Features

```tsx
<ProductGrid
  products={products}
  showQuickAdd={false}    // No "Add to Cart" button
  showRating={false}      // No star ratings
  showBadges={false}      // No discount badges
  showFilters={false}     // No filter tabs
  showSeeAll={false}      // No "See All" link
/>
```

### Custom Title and Actions

```tsx
<ProductGrid
  products={products}
  title="Custom Collection"
  showSeeAll={true}
  onSeeAllClick={() => alert('See all clicked!')}
/>
```

## Individual Product Card

If you need a single product card:

```tsx
import { ProductCard } from '@/components/products';

export function SingleCard() {
  return (
    <div className="max-w-sm">
      <ProductCard
        product={product}
        variant="standard"
        showQuickAdd={true}
        showRating={true}
        onAddToCart={(p) => console.log('Add to cart:', p)}
      />
    </div>
  );
}
```

## Flash Sale Product

```tsx
<ProductCard
  product={product}
  variant="flash-sale"
  flashSale={{
    endTime: new Date('2025-10-27T00:00:00'),
    soldCount: 9,
    totalStock: 10,
  }}
/>
```

## Styling

### Custom Wrapper Styling

```tsx
<ProductGrid
  products={products}
  className="bg-gray-50 p-8 rounded-lg"
/>
```

### Tailwind Classes Work

```tsx
<div className="container mx-auto">
  <ProductGrid products={products} />
</div>
```

## TypeScript Support

Full type safety is built-in:

```typescript
import type {
  Product,
  ProductCardProps,
  ProductGridProps,
  FlashSaleConfig,
  GridColumns,
} from '@/components/products';

const config: FlashSaleConfig = {
  endTime: new Date(),
  soldCount: 5,
  totalStock: 10,
};
```

## Preset Grids

Use these pre-configured grids for common scenarios:

```tsx
import {
  PopularProductsGrid,    // Popular products (4 col, no filters)
  FeaturedProductsGrid,   // Featured products (4 col, with filters)
  TodaysForYouGrid,       // Recommendations (5 col)
  FlashSaleGrid,          // Flash sales (4 col, flash variant)
} from '@/components/products';
```

## Next Steps

1. See `ProductComponents.example.tsx` for comprehensive examples
2. Read `README.md` for detailed API documentation
3. Check `SHOWCASE.md` for visual reference
4. Explore `types.ts` for all available types

## Troubleshooting

**Products not showing?**
- Check that `products` array has data
- Verify images paths are correct
- Check console for errors

**Filters not working?**
- Implement `onFilterChange` handler
- Filter products based on `filter` value
- Update products state

**Animations not smooth?**
- Ensure Framer Motion is installed
- Check browser compatibility
- Reduce motion in accessibility settings may disable animations

**Images not loading?**
- Verify image URLs are accessible
- Check CORS settings if loading from external source
- Use placeholder images for development

## Support

Need help? Check out:
- `README.md` - Full documentation
- `ProductComponents.example.tsx` - Working examples
- Type definitions in `types.ts`

Happy coding! 🚀

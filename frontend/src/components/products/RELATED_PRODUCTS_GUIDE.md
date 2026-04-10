# RelatedProducts Component - Quick Start Guide

## Overview

The `RelatedProducts` component is a comprehensive, production-ready solution for displaying related products with multiple recommendation types and advanced interactive features.

## Quick Start

### 1. Basic Implementation (Minimal)

```tsx
import { RelatedProducts } from '@/components/products';

function ProductPage() {
  return (
    <RelatedProducts
      products={relatedProductsArray}
    />
  );
}
```

### 2. Standard Implementation

```tsx
import { RelatedProducts } from '@/components/products';
import { useState } from 'react';

function ProductPage() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  return (
    <RelatedProducts
      products={relatedProducts}
      onWishlistToggle={(id) => {
        const newWishlist = new Set(wishlist);
        if (newWishlist.has(id)) {
          newWishlist.delete(id);
        } else {
          newWishlist.add(id);
        }
        setWishlist(newWishlist);
      }}
      onAddToCart={(product) => {
        // Add to cart logic
        console.log('Adding to cart:', product);
      }}
      wishlistedProducts={wishlist}
    />
  );
}
```

### 3. Complete Product Page Example

```tsx
import { RelatedProducts } from '@/components/products';
import { useState } from 'react';
import type { Product } from '@/types';

export default function ProductDetailPage({ product }: { product: Product }) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Get related products based on current product
  const relatedProducts = getRelatedProducts(product);

  const handleWishlistToggle = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    // Your cart logic
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
  };

  return (
    <div>
      {/* Product details */}
      <ProductImageGallery images={product.images} />
      <ProductInfo product={product} />

      {/* Related Products Sections */}

      {/* 1. Frequently Bought Together */}
      <RelatedProducts
        variant="frequently-bought"
        currentProduct={product}
        products={getFrequentlyBought(product.id)}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        wishlistedProducts={wishlist}
      />

      {/* 2. You Might Also Like */}
      <RelatedProducts
        variant="you-might-like"
        products={getSimilarProducts(product)}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        onQuickView={handleQuickView}
        wishlistedProducts={wishlist}
        enableQuickAdd={true}
        enableColorSelector={true}
        enableSizeSelector={true}
      />

      {/* 3. Complete the Look */}
      <RelatedProducts
        variant="complete-look"
        products={getCompleteTheLook(product)}
        onWishlistToggle={handleWishlistToggle}
        onAddToCart={handleAddToCart}
        wishlistedProducts={wishlist}
      />

      {/* Quick View Modal */}
      {showQuickView && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
}

// Helper functions for recommendations
function getRelatedProducts(currentProduct: Product): Product[] {
  // Filter products by same category
  return allProducts
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 8);
}

function getFrequentlyBought(productId: string): Product[] {
  // Get products frequently bought with this one
  // This would typically come from your backend API
  return bundleProducts[productId] || [];
}

function getSimilarProducts(product: Product): Product[] {
  const currentPrice = product.salePrice || product.price;

  return allProducts
    .filter(p => {
      if (p.id === product.id) return false;
      const price = p.salePrice || p.price;
      return Math.abs(price - currentPrice) <= currentPrice * 0.2;
    })
    .slice(0, 8);
}

function getCompleteTheLook(product: Product): Product[] {
  const complementary: Record<string, string[]> = {
    'T-Shirts': ['Jeans', 'Pants', 'Shoes'],
    'Jackets': ['T-Shirts', 'Jeans', 'Shoes'],
    'Pants': ['T-Shirts', 'Shirts', 'Shoes'],
  };

  const categories = complementary[product.category] || [];

  return allProducts
    .filter(p => categories.includes(p.category))
    .slice(0, 4);
}
```

## All Available Variants

### 1. You Might Also Like (Default)

```tsx
<RelatedProducts
  variant="you-might-like"
  products={similarProducts}
  // ... handlers
/>
```

**Use Case:** Similar products based on category, price, or attributes
**Layout:** 4 products per row, carousel controls enabled

### 2. Frequently Bought Together

```tsx
<RelatedProducts
  variant="frequently-bought"
  currentProduct={mainProduct}
  products={bundleProducts}
  // ... handlers
/>
```

**Use Case:** Bundle section where customers can select multiple products
**Layout:** Checkbox selection with bundle summary
**Special:** Shows total price and savings

### 3. Recently Viewed

```tsx
<RelatedProducts
  variant="recently-viewed"
  products={recentlyViewedProducts}
  // ... handlers
/>
```

**Use Case:** Products the user has viewed in this session
**Layout:** 4 products per row, chronological order

### 4. Complete the Look

```tsx
<RelatedProducts
  variant="complete-look"
  products={outfitSuggestions}
  // ... handlers
/>
```

**Use Case:** Complementary items to create a full outfit
**Layout:** 4 products per row, emphasizes cross-category items

### 5. Customers Also Viewed

```tsx
<RelatedProducts
  variant="customers-viewed"
  products={alternativeProducts}
  // ... handlers
/>
```

**Use Case:** Products other customers looked at
**Layout:** 4 products per row, based on browsing patterns

## Feature Flags

Enable/disable features based on your needs:

```tsx
<RelatedProducts
  // Core features
  enableQuickAdd={true}           // Show "Add to Cart" on hover
  enableColorSelector={true}      // Show color options on hover
  enableSizeSelector={true}       // Show size options on hover
  showCarouselControls={true}     // Show prev/next arrows

  // Handlers
  onWishlistToggle={handleWishlist}
  onAddToCart={handleCart}
  onQuickView={handleQuickView}
  onProductClick={handleClick}
/>
```

## Responsive Behavior

The component automatically adapts:

- **Desktop (lg+):** 4 products per row
- **Tablet (md):** 3 products per row
- **Mobile (sm):** 2 products per row with horizontal scroll

## Styling

### Custom Styling

```tsx
<RelatedProducts
  className="my-8 bg-gray-50"
  products={products}
/>
```

### Theming

The component uses your Tailwind theme. Key colors:
- `primary-lime` - Primary buttons
- `card-black` - Secondary buttons
- `badge-sale` - Discount badges
- `text-primary` - Main text
- `text-secondary` - Secondary text

## Performance Tips

1. **Limit products:** Show 4-8 products for best performance
2. **Lazy loading:** Images use lazy loading by default
3. **Memoize data:** Use `useMemo` for recommendation logic
4. **Optimize images:** Ensure product images are optimized

```tsx
const relatedProducts = useMemo(() =>
  getRelatedProducts(currentProduct),
  [currentProduct]
);
```

## Common Patterns

### With React Router

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<RelatedProducts
  onProductClick={(product) => {
    navigate(`/products/${product.id}`);
  }}
/>
```

### With State Management (Zustand)

```tsx
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';

const addToCart = useCartStore(state => state.addItem);
const toggleWishlist = useWishlistStore(state => state.toggle);
const wishlist = useWishlistStore(state => state.items);

<RelatedProducts
  onAddToCart={addToCart}
  onWishlistToggle={toggleWishlist}
  wishlistedProducts={wishlist}
/>
```

### With Analytics

```tsx
<RelatedProducts
  onProductClick={(product) => {
    analytics.track('Related Product Clicked', {
      productId: product.id,
      source: 'you-might-like'
    });
    navigate(`/products/${product.id}`);
  }}
  onAddToCart={(product) => {
    analytics.track('Added to Cart', {
      productId: product.id,
      source: 'related-products'
    });
    addToCart(product);
  }}
/>
```

## Troubleshooting

### Products not showing

```tsx
// Make sure products array is not empty
console.log('Products:', products);

// Check that products match the Product type
// Required fields: id, name, brand, price, images, sizes, rating, category
```

### Carousel not scrolling

```tsx
// Ensure showCarouselControls is true
<RelatedProducts
  showCarouselControls={true}
  products={products}
/>

// Check that you have enough products to scroll (more than fits on screen)
```

### Images not loading

```tsx
// Verify image paths are correct
console.log('Image URL:', products[0].images[0]);

// Images should be absolute URLs or valid relative paths
```

## See Also

- `RelatedProducts.tsx` - Main component source
- `RelatedProducts.example.tsx` - Full examples with all variants
- `RelatedProducts.md` - Complete documentation
- `ProductCard.tsx` - Individual product card component

## Support

For issues or questions about the RelatedProducts component, check the example file or documentation.

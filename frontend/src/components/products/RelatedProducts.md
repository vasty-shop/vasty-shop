# RelatedProducts Component

A comprehensive, feature-rich related products section with multiple recommendation types and advanced interactive features.

## Features

### Section Types

1. **You Might Also Like** - Similar products based on category, price, or attributes
2. **Frequently Bought Together** - Bundle section with checkboxes for multi-product purchase
3. **Recently Viewed** - Products the user has previously viewed
4. **Complete the Look** - Outfit suggestions and complementary items
5. **Customers Also Viewed** - Alternative recommendations based on browsing patterns

### Interactive Elements

- **Quick Add to Cart** - Add products without leaving the page
- **Wishlist Toggle** - Heart icon to save products
- **Quick View** - Preview product details in a modal
- **Color Selector** - Choose color variants on hover
- **Size Selector** - Select size on hover
- **Carousel Controls** - Navigate through products with arrows
- **Touch/Swipe Support** - Mobile-friendly horizontal scrolling
- **Hover Effects** - Smooth scale and shadow animations
- **Loading Skeletons** - Graceful loading states

## Usage

### Basic Implementation

```tsx
import { RelatedProducts } from '@/components/products';

function ProductPage() {
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (productId: string) => {
    setWishlistedProducts(prev => {
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
    console.log('Adding to cart:', product);
  };

  return (
    <RelatedProducts
      products={relatedProducts}
      onWishlistToggle={handleWishlistToggle}
      onAddToCart={handleAddToCart}
      wishlistedProducts={wishlistedProducts}
    />
  );
}
```

### Advanced Implementation with All Features

```tsx
<RelatedProducts
  variant="you-might-like"
  currentProduct={currentProduct}
  products={relatedProducts}
  onWishlistToggle={handleWishlistToggle}
  onAddToCart={handleAddToCart}
  onQuickView={handleQuickView}
  onProductClick={handleProductClick}
  wishlistedProducts={wishlistedProducts}
  enableQuickAdd={true}
  enableColorSelector={true}
  enableSizeSelector={true}
  showCarouselControls={true}
  className="my-custom-class"
/>
```

### Frequently Bought Together

```tsx
<RelatedProducts
  variant="frequently-bought"
  currentProduct={mainProduct}
  products={bundleProducts}
  onWishlistToggle={handleWishlistToggle}
  onAddToCart={handleAddToCart}
  wishlistedProducts={wishlistedProducts}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentProduct` | `Product` | - | The main product (required for `frequently-bought` variant) |
| `products` | `Product[]` | `[]` | Array of related products to display |
| `onWishlistToggle` | `(productId: string) => void` | - | Callback when wishlist is toggled |
| `onAddToCart` | `(product: Product) => void` | - | Callback when product is added to cart |
| `onQuickView` | `(product: Product) => void` | - | Callback for quick view modal |
| `onProductClick` | `(product: Product) => void` | - | Callback when product card is clicked |
| `wishlistedProducts` | `Set<string>` | `new Set()` | Set of wishlisted product IDs |
| `className` | `string` | - | Additional CSS classes |
| `variant` | `'you-might-like' \| 'frequently-bought' \| 'recently-viewed' \| 'complete-look' \| 'customers-viewed'` | `'you-might-like'` | Section type |
| `showCarouselControls` | `boolean` | `true` | Show/hide carousel navigation arrows |
| `enableQuickAdd` | `boolean` | `true` | Enable quick add to cart button |
| `enableColorSelector` | `boolean` | `false` | Show color selector on hover |
| `enableSizeSelector` | `boolean` | `false` | Show size selector on hover |

## Implementing Smart Recommendations

### 1. Same Category Recommendations

```tsx
const getSameCategoryProducts = (currentProduct: Product, allProducts: Product[]) => {
  return allProducts
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 8);
};
```

### 2. Similar Price Range

```tsx
const getSimilarPriceProducts = (currentProduct: Product, allProducts: Product[]) => {
  const currentPrice = currentProduct.salePrice || currentProduct.price;
  const priceRange = currentPrice * 0.2; // ±20%

  return allProducts
    .filter(p => {
      const price = p.salePrice || p.price;
      return Math.abs(price - currentPrice) <= priceRange && p.id !== currentProduct.id;
    })
    .slice(0, 8);
};
```

### 3. Frequently Bought Together

```tsx
// Backend API example
const getFrequentlyBoughtTogether = async (productId: string) => {
  const response = await fetch(`/api/products/${productId}/frequently-bought-together`);
  return response.json();
};

// Algorithm: Analyze purchase history
// SELECT product_b, COUNT(*) as frequency
// FROM orders
// WHERE order_id IN (
//   SELECT order_id FROM order_items WHERE product_id = ?
// )
// AND product_b != ?
// GROUP BY product_b
// ORDER BY frequency DESC
// LIMIT 5
```

### 4. Recently Viewed (LocalStorage)

```tsx
const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const MAX_RECENTLY_VIEWED = 20;

export const addToRecentlyViewed = (product: Product) => {
  const existing = getRecentlyViewed();
  const filtered = existing.filter(p => p.id !== product.id);
  const updated = [product, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
};

export const getRecentlyViewed = (): Product[] => {
  const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Usage in component
useEffect(() => {
  if (currentProduct) {
    addToRecentlyViewed(currentProduct);
  }
}, [currentProduct]);
```

### 5. Trending in Category

```tsx
const getTrendingProducts = (category: string, allProducts: Product[]) => {
  return allProducts
    .filter(p => p.category === category)
    .sort((a, b) => {
      // Combine view count and sales for trending score
      const scoreA = (a.viewCount || 0) * 0.3 + (a.salesCount || 0) * 0.7;
      const scoreB = (b.viewCount || 0) * 0.3 + (b.salesCount || 0) * 0.7;
      return scoreB - scoreA;
    })
    .slice(0, 8);
};
```

### 6. Complete the Look (Outfit Recommendations)

```tsx
// Define complementary categories
const complementaryCategories: Record<string, string[]> = {
  'T-Shirts': ['Jeans', 'Pants', 'Shorts', 'Shoes', 'Accessories'],
  'Jackets': ['T-Shirts', 'Shirts', 'Jeans', 'Shoes'],
  'Pants': ['T-Shirts', 'Shirts', 'Shoes', 'Belts'],
  'Shoes': ['Pants', 'Jeans', 'Shorts', 'Socks'],
};

const getCompleteTheLook = (currentProduct: Product, allProducts: Product[]) => {
  const complementary = complementaryCategories[currentProduct.category] || [];

  return allProducts
    .filter(p => complementary.includes(p.category))
    .slice(0, 4);
};
```

### 7. Collaborative Filtering

```tsx
// Backend implementation
// Find users who viewed/bought this product
// Find what else those users viewed/bought
// Rank by frequency and relevance

const getCollaborativeRecommendations = async (productId: string) => {
  const response = await fetch(`/api/recommendations/collaborative/${productId}`);
  return response.json();
};
```

## Responsive Design

The component automatically adapts to different screen sizes:

- **Desktop (lg+):** 4 products per row with carousel controls
- **Tablet (md):** 3 products per row
- **Mobile (sm):** 2 products per row with horizontal scroll and snap scrolling

## Accessibility

- All interactive elements are keyboard accessible
- Proper ARIA labels for screen readers
- Focus states for keyboard navigation
- Touch-friendly tap targets (minimum 44x44px)

## Performance Optimization

### Lazy Loading

```tsx
// Images use lazy loading by default
<img loading="lazy" src={product.images[0]} alt={product.name} />
```

### Virtualization for Large Lists

```tsx
// For lists with 50+ products, consider using react-window
import { FixedSizeList } from 'react-window';

const VirtualizedRelatedProducts = ({ products }) => {
  return (
    <FixedSizeList
      height={500}
      itemCount={products.length}
      itemSize={300}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ProductCardInteractive product={products[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

### Memoization

```tsx
const relatedProducts = useMemo(() => {
  return getSameCategoryProducts(currentProduct, allProducts);
}, [currentProduct, allProducts]);
```

## Integration with State Management

### Zustand Store Example

```tsx
// stores/useCartStore.ts
import create from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) => set((state) => ({
    items: [...state.items, { product, quantity: 1 }]
  })),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.product.id !== productId)
  })),
}));

// In component
const addItem = useCartStore((state) => state.addItem);

<RelatedProducts
  onAddToCart={(product) => addItem(product)}
  // ... other props
/>
```

### Wishlist Store Example

```tsx
// stores/useWishlistStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: Set<string>;
  toggle: (productId: string) => void;
}

export const useWishlistStore = create(
  persist<WishlistStore>(
    (set) => ({
      items: new Set(),
      toggle: (productId) => set((state) => {
        const newItems = new Set(state.items);
        if (newItems.has(productId)) {
          newItems.delete(productId);
        } else {
          newItems.add(productId);
        }
        return { items: newItems };
      }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
```

## Analytics Integration

```tsx
const handleProductClick = (product: Product) => {
  // Track click event
  analytics.track('Related Product Clicked', {
    productId: product.id,
    productName: product.name,
    recommendationType: variant,
    position: index,
  });

  // Navigate to product page
  navigate(`/products/${product.id}`);
};

const handleAddToCart = (product: Product) => {
  // Track add to cart from related products
  analytics.track('Product Added to Cart', {
    productId: product.id,
    source: 'related-products',
    recommendationType: variant,
  });

  // Add to cart logic
  addItem(product);
};
```

## Best Practices

1. **Limit the number of products** - Show 4-8 products for optimal performance and UX
2. **Use relevant recommendations** - Match products by category, price, or style
3. **Update frequently** - Refresh recommendations based on user behavior
4. **Test different variants** - A/B test different recommendation types
5. **Personalize when possible** - Use user history and preferences
6. **Mobile-first approach** - Ensure smooth scrolling on mobile devices
7. **Monitor performance** - Track conversion rates from related products

## Examples

See `RelatedProducts.example.tsx` for complete implementation examples of all variants.

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: iOS 13+
- Chrome Android: Latest version

## Dependencies

- `framer-motion` - Animations and gestures
- `lucide-react` - Icons
- `@radix-ui` - UI primitives (via Button and Badge components)
- `tailwindcss` - Styling

## License

Part of the Fluxez e-commerce platform.

# FeaturedProductsCarousel Component

A beautiful, interactive carousel component for displaying featured products with smooth animations, hover effects, and navigation controls.

## Features

- **Horizontal Scrollable Carousel**: Smooth horizontal scrolling with navigation arrows
- **Product Cards**: Clean, modern product cards with:
  - Product image with hover zoom effect
  - Category and product name
  - Price display in red (#ef4444)
  - Wishlist heart icon (top right, toggleable)
  - Eye icon for quick view (below heart)
  - "Add to cart" button (appears on hover with shopping bag icon)
- **Navigation**:
  - Left/Right arrow buttons (appear on carousel hover)
  - Smooth scroll behavior
  - Auto-hide when scroll limits reached
- **Animations**:
  - Framer Motion animations for all interactions
  - Staggered entrance animations
  - Hover scale effects
  - Button animations
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessibility**: Keyboard navigation support

## Usage

### Basic Usage

```tsx
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';

function HomePage() {
  return (
    <FeaturedProductsCarousel />
  );
}
```

### With Event Handlers

```tsx
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
import { useState } from 'react';

function HomePage() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

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

  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    // Your cart logic here
  };

  const handleQuickView = (product) => {
    console.log('Quick view:', product);
    // Open quick view modal
  };

  const handleSeeAll = () => {
    console.log('See all products');
    // Navigate to products page
  };

  return (
    <FeaturedProductsCarousel
      wishlistedProducts={wishlist}
      onWishlistToggle={handleWishlistToggle}
      onAddToCart={handleAddToCart}
      onQuickView={handleQuickView}
      onSeeAll={handleSeeAll}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onWishlistToggle` | `(productId: string) => void` | `undefined` | Callback when wishlist button is clicked |
| `onAddToCart` | `(product: Product) => void` | `undefined` | Callback when "Add to cart" button is clicked |
| `onQuickView` | `(product: Product) => void` | `undefined` | Callback when quick view (eye) icon is clicked |
| `onSeeAll` | `() => void` | `undefined` | Callback when "See All" link is clicked |
| `wishlistedProducts` | `Set<string>` | `new Set()` | Set of product IDs that are wishlisted |
| `className` | `string` | `undefined` | Additional CSS classes for the container |

## Featured Products Data

The component currently displays 4 featured products:

1. **Airpod** - Wireless Earbuds - $20.00
2. **Sunglass** - Brown Gradient - $20.00
3. **Cap** - Baseball Cap - $20.00
4. **Stone Ring** - Diamond Ring - $20.00

### Customizing Products

To customize the products, you can modify the `featuredProducts` array in the component:

```tsx
const featuredProducts: FeaturedProduct[] = [
  {
    id: 'your-product-id',
    name: 'Product Name',
    category: 'Product Category',
    price: 99.99,
    image: '/path/to/image.png',
  },
  // ... more products
];
```

Or, for a production app, you can pass products as a prop. Modify the component to accept a `products` prop:

```tsx
export interface FeaturedProductsCarouselProps {
  products?: FeaturedProduct[];
  // ... other props
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  products,
  // ... other props
}) => {
  const featuredProducts = products || defaultProducts;
  // ... rest of component
};
```

## Styling

The component uses Tailwind CSS for styling with the following key colors:

- **Price**: `text-red-500` (#ef4444)
- **Background**: White cards on white section
- **Shadows**: `hover:shadow-xl` on cards
- **Rounded Corners**: `rounded-2xl` for cards, `rounded-full` for buttons

### Custom Styling

You can override styles using the `className` prop:

```tsx
<FeaturedProductsCarousel
  className="bg-gray-50 py-16"
/>
```

## Animations

The component uses Framer Motion for animations:

- **Card entrance**: Fade in + slide up with stagger effect
- **Card hover**: Scale up + shadow increase
- **Image hover**: Scale up (1.1x)
- **Buttons**: Scale animations on hover/tap
- **Navigation arrows**: Fade in/out based on scroll position
- **Add to cart button**: Slide up from bottom on hover

## Carousel Navigation

- **Arrow buttons**: Appear on hover over the carousel area
- **Scroll amount**: 300px per click
- **Smooth scrolling**: CSS `scroll-behavior: smooth`
- **Auto-hide**: Arrows hide when reaching scroll limits

## Responsive Behavior

- **Mobile**: 250px card width, smaller padding
- **Tablet/Desktop**: 280px card width, larger padding
- **Navigation arrows**: Smaller on mobile (20px), larger on desktop (24px)

## Integration with State Management

### With Zustand

```tsx
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

function HomePage() {
  const addToCart = useCartStore(state => state.addItem);
  const { wishlist, toggleWishlist } = useWishlistStore();

  return (
    <FeaturedProductsCarousel
      wishlistedProducts={new Set(wishlist.map(item => item.id))}
      onWishlistToggle={toggleWishlist}
      onAddToCart={addToCart}
    />
  );
}
```

### With React Context

```tsx
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

function HomePage() {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <FeaturedProductsCarousel
      wishlistedProducts={wishlist}
      onWishlistToggle={toggleWishlist}
      onAddToCart={addToCart}
    />
  );
}
```

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Semantic HTML with proper ARIA labels
- **Focus States**: Visible focus indicators on interactive elements
- **Alt Text**: Add alt text to product images for better accessibility

## Performance

- **Lazy Loading**: Product images can be lazy loaded
- **Smooth Scrolling**: CSS-based smooth scrolling
- **Optimized Re-renders**: Uses React.useCallback for scroll handler
- **Event Cleanup**: Proper cleanup of event listeners

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS scroll-snap support
- Framer Motion support (React 16.8+)

## Dependencies

- `react` (^19.1.1)
- `framer-motion` (^12.23.12)
- `lucide-react` (^0.542.0)
- `@/components/ui/button`
- `@/lib/utils` (cn function)
- `@/types` (Product type)

## Examples

### Example 1: Landing Page Integration

```tsx
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Other sections */}

      <FeaturedProductsCarousel
        onSeeAll={() => navigate('/products/featured')}
        onQuickView={(product) => {
          // Open quick view modal
        }}
      />

      {/* Other sections */}
    </div>
  );
}
```

### Example 2: With Toast Notifications

```tsx
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
import { toast } from 'sonner';

function HomePage() {
  const handleAddToCart = (product) => {
    // Add to cart logic
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (productId) => {
    // Toggle wishlist logic
    const isAdded = true; // Check if added or removed
    toast.success(
      isAdded ? 'Added to wishlist!' : 'Removed from wishlist!'
    );
  };

  return (
    <FeaturedProductsCarousel
      onAddToCart={handleAddToCart}
      onWishlistToggle={handleWishlistToggle}
    />
  );
}
```

## Troubleshooting

### Navigation arrows not showing
- Ensure the carousel container has enough products to scroll
- Check that the scroll container is properly initialized
- Verify that the hover state is working on the carousel

### Images not loading
- Check that image paths are correct
- Ensure images are in the public folder
- Verify image file extensions

### Animations not working
- Ensure Framer Motion is properly installed
- Check that React version is 16.8+
- Verify that motion components are not wrapped in fragments

## Future Enhancements

Potential improvements for future versions:

1. **Dynamic Products**: Accept products array as prop
2. **Infinite Scroll**: Auto-scroll carousel
3. **Touch Gestures**: Swipe support for mobile
4. **Skeleton Loading**: Loading state while fetching products
5. **Pagination Dots**: Visual indicator of scroll position
6. **Auto-play**: Auto-scroll with pause on hover
7. **Product Variants**: Color/size selection in card
8. **Rating Display**: Show product ratings
9. **Discount Badges**: Sale/discount indicators
10. **Virtual Scrolling**: For large product lists

## License

Part of the Fluxez Shop project.

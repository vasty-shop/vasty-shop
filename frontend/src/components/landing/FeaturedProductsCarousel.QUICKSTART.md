# FeaturedProductsCarousel - Quick Start Guide

## Quick Integration (60 seconds)

### Step 1: Import the Component

```tsx
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
```

### Step 2: Add to Your Page

```tsx
function HomePage() {
  return (
    <div>
      {/* Your other components */}
      <FeaturedProductsCarousel />
      {/* More components */}
    </div>
  );
}
```

That's it! The carousel is now live with default functionality.

---

## Add Wishlist Support (2 minutes)

```tsx
import { useState } from 'react';
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';

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

  return (
    <FeaturedProductsCarousel
      wishlistedProducts={wishlist}
      onWishlistToggle={handleWishlistToggle}
    />
  );
}
```

---

## Add Cart + Notifications (3 minutes)

```tsx
import { useState } from 'react';
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
import { toast } from 'sonner';

function HomePage() {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      const isAdding = !newSet.has(productId);

      if (isAdding) {
        newSet.add(productId);
        toast.success('Added to wishlist!');
      } else {
        newSet.delete(productId);
        toast.success('Removed from wishlist!');
      }

      return newSet;
    });
  };

  const handleAddToCart = (product) => {
    // Your cart logic here
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <FeaturedProductsCarousel
      wishlistedProducts={wishlist}
      onWishlistToggle={handleWishlistToggle}
      onAddToCart={handleAddToCart}
    />
  );
}
```

---

## Full Implementation with Navigation (5 minutes)

```tsx
import { useState } from 'react';
import { FeaturedProductsCarousel } from '@/components/landing/FeaturedProductsCarousel';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function HomePage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const handleWishlistToggle = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      const isAdding = !newSet.has(productId);

      if (isAdding) {
        newSet.add(productId);
        toast.success('Added to wishlist!');
      } else {
        newSet.delete(productId);
        toast.success('Removed from wishlist!');
      }

      return newSet;
    });
  };

  const handleAddToCart = (product) => {
    // Your cart logic
    toast.success(`${product.name} added to cart!`, {
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      },
    });
  };

  const handleQuickView = (product) => {
    // Open quick view modal or navigate to product page
    navigate(`/products/${product.id}`);
  };

  const handleSeeAll = () => {
    navigate('/products/featured');
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

---

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `wishlistedProducts` | `Set<string>` | No | Set of wishlisted product IDs |
| `onWishlistToggle` | `(id: string) => void` | No | Wishlist button click handler |
| `onAddToCart` | `(product) => void` | No | Add to cart button click handler |
| `onQuickView` | `(product) => void` | No | Quick view (eye icon) click handler |
| `onSeeAll` | `() => void` | No | "See All" link click handler |
| `className` | `string` | No | Additional CSS classes |

---

## Styling Tips

### Change Background
```tsx
<FeaturedProductsCarousel className="bg-gray-50" />
```

### Add Spacing
```tsx
<FeaturedProductsCarousel className="py-16 my-8" />
```

### Full Width
```tsx
<FeaturedProductsCarousel className="w-full" />
```

---

## Common Use Cases

### 1. Homepage Hero
```tsx
<div className="min-h-screen">
  <HeroSection />
  <FeaturedProductsCarousel />
  <FlashSaleSection />
</div>
```

### 2. Category Page
```tsx
<div>
  <CategoryHeader />
  <FeaturedProductsCarousel onSeeAll={() => navigate('/category/featured')} />
  <ProductGrid />
</div>
```

### 3. Landing Page
```tsx
<div>
  <Navigation />
  <HeroSection />
  <FeaturedProductsCarousel />
  <BestSellersSection />
  <Footer />
</div>
```

---

## Next Steps

1. **Customize Products**: Edit the `featuredProducts` array in the component
2. **Add Real Images**: Replace placeholder images with actual product images
3. **Connect to API**: Fetch products from your backend
4. **Add Analytics**: Track product clicks and cart additions
5. **Implement Quick View**: Create a modal for product quick view

---

## Need Help?

- See `FeaturedProductsCarousel.README.md` for detailed documentation
- Check `FeaturedProductsCarousel.example.tsx` for more examples
- Review the component source code for customization options

---

## Feature Checklist

- [x] Horizontal scrollable carousel
- [x] Navigation arrows (appear on hover)
- [x] Wishlist toggle (heart icon)
- [x] Quick view (eye icon)
- [x] Add to cart button (shows on hover)
- [x] "See All" link
- [x] Smooth animations
- [x] Responsive design
- [x] Hover effects
- [x] Price display in red

---

## Browser Testing

✅ Chrome
✅ Firefox
✅ Safari
✅ Edge
✅ Mobile Safari
✅ Mobile Chrome

---

## Performance Notes

- Carousel uses CSS smooth scrolling (no JS animation overhead)
- Images should be optimized (WebP recommended)
- Lazy loading is supported
- Component is fully responsive

---

Made with ❤️ for Fluxez Shop

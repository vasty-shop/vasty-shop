# Landing Page Documentation

## Overview

The `LandingPage.tsx` is a comprehensive, production-ready landing page that showcases all major e-commerce features. It assembles 13 distinct sections in a carefully orchestrated order to provide an optimal user experience.

## File Locations

- **Main Component**: `/frontend/src/features/home/LandingPage.tsx`
- **Mock Data**: `/shared/data/landingData.ts`

## Section Order

The landing page consists of the following sections in order:

### 1. Header
- **Component**: `@/components/layout/Header`
- **Description**: Sticky navigation bar with logo, search, cart, and user menu
- **Position**: Top of page, fixed/sticky

### 2. Hero Section
- **Component**: `@/components/landing/HeroSection`
- **Description**: Main banner with category sidebar and featured collections
- **Features**:
  - Left sidebar with 8 product categories
  - Center main banner (Sunglass Collection)
  - Right sidebar with two mini collections (Trendy & Watch)
  - Service features section (Free Shipping, 24/7 Support, Returns, Secure Payment)

### 3. Category Browse Section
- **Component**: `@/components/landing/CategoryBrowseSection`
- **Description**: Large visual category cards with filters
- **Features**:
  - Filter tabs (ALL, WOMAN, CHILDREN)
  - 4 category cards with images
  - Hover animations

### 4. Popular Products Grid
- **Component**: `@/components/products/ProductGrid` (PopularProductsGrid preset)
- **Description**: 4-column grid of popular products
- **Features**:
  - Product cards with ratings
  - Add to cart functionality
  - Wishlist toggle
  - "See All" button

### 5. Featured Products Carousel
- **Component**: `@/components/landing/FeaturedProductsCarousel`
- **Description**: Horizontal scrolling carousel of featured products
- **Features**:
  - Smooth scroll navigation
  - Wishlist toggle
  - Quick view button
  - Add to cart on hover

### 6. Horizontal Promo Banners
- **Component**: `HorizontalPromoBanners` from `@/components/landing/PromoBanners`
- **Description**: Three promotional cards in a row
- **Content**:
  - Premium Watch (NEW RELEASE)
  - Luxury Jewelry (30% OFF)
  - Premium Perfume (SPECIAL OFFER - Buy 2 Get 1)

### 7. Flash Sale Section
- **Component**: `@/components/landing/FlashSaleSection`
- **Description**: Time-limited deals with countdown timer
- **Features**:
  - Live countdown timer (days, hours, minutes)
  - Progress bars showing sold/remaining stock
  - Discount badges
  - Horizontal scrolling product carousel

### 8. Large Feature Banners
- **Component**: `LargeFeatureBanners` from `@/components/landing/PromoBanners`
- **Description**: Large promotional sections
- **Layout**:
  - Left: Winter Collection (COMING SOON)
  - Right Top: Fashion Forward
  - Right Bottom: 50% OFF Mega Sale

### 9. Best Sellers Section
- **Component**: `@/components/landing/BestSellersSection`
- **Description**: Showcase of best-selling stores
- **Layout**:
  - Left: Featured store (BeliBeli Mall)
  - Right: 4 mini store cards with 3 products each
  - Verified badges for authentic stores

### 10. Category Icons Row
- **Component**: `CategoryIconsRow` from `@/components/landing/PromoBanners`
- **Description**: Quick category navigation with icons
- **Features**:
  - 9 category icons (T-Shirt, Jacket, Shirt, Jeans, Bag, Shoes, Watches, Cap, All)
  - Horizontal scrolling on mobile
  - Animated icons on hover

### 11. Today's For You Grid
- **Component**: `@/components/products/ProductGrid` (TodaysForYouGrid preset)
- **Description**: Personalized product recommendations
- **Features**:
  - 5-column grid layout
  - Product filtering
  - Same features as Popular Products

### 12. Blog Section
- **Component**: `@/components/landing/BlogSection`
- **Description**: Latest blog posts
- **Features**:
  - 4 blog cards with images
  - Category badges
  - Date stamps
  - Read more on hover
  - Smooth animations

### 13. Footer
- **Component**: `@/components/layout/Footer`
- **Description**: Site footer with links and information
- **Position**: Bottom of page

## Additional Features

### Scroll to Top Button
- **Visibility**: Appears after scrolling 400px down
- **Animation**: Smooth fade-in/fade-out
- **Design**: Circular button with arrow icon
- **Colors**: Primary lime green with hover effects
- **Position**: Fixed bottom-right corner

### Smooth Scrolling
- Enabled globally via CSS
- Smooth transitions between sections

## State Management

### Wishlist State
```typescript
const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());
```
- Tracks which products are wishlisted
- Synchronized across all sections

### Product Data
```typescript
const [popularProducts] = useState<Product[]>(getPopularProducts());
const [featuredProducts] = useState<Product[]>(getFeaturedProducts());
const [todaysForYouProducts] = useState<Product[]>(getTodaysForYouProducts());
```
- Loaded from `/shared/data/landingData.ts`
- Static data for now (can be replaced with API calls)

## Event Handlers

### `handleWishlistToggle(productId: string)`
Adds/removes products from wishlist

### `handleAddToCart(product: Product)`
Adds product to shopping cart (TODO: implement)

### `handleProductClick(product: Product)`
Navigates to product detail page (TODO: implement)

### `handleQuickView(product: Product)`
Opens quick view modal (TODO: implement)

### `handleSeeAll(section: string)`
Navigates to category/collection page (TODO: implement)

## Spacing & Layout

- **Section Spacing**: `py-8 md:py-12` (standard)
- **Large Section Spacing**: `py-8 md:py-16` (Flash Sale, Best Sellers, Blog)
- **Container**: `max-w-7xl mx-auto` for content sections
- **Padding**: `px-4 md:px-6` for horizontal spacing

## Responsive Design

All sections are fully responsive:
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grids where appropriate
- **Desktop**: Multi-column layouts (3-5 columns)

## Animation Strategy

- **Scroll Animations**: `whileInView` with `once: true`
- **Viewport Margin**: `-100px` for earlier animation triggers
- **Stagger**: Sequential animations in grids and carousels
- **Hover Effects**: Scale, translate, shadow changes
- **Smooth Transitions**: 0.2-0.6s duration

## TypeScript Types

```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: string[];
  sizes: Size[];
  rating: number;
  category: string;
  description?: string;
  colors?: string[];
}
```

## Usage

```tsx
import LandingPage from '@/features/home/LandingPage';

// In your app router or page component
export default function HomePage() {
  return <LandingPage />;
}
```

## Customization

### Adding New Sections
1. Import the new component
2. Add it to the main content area
3. Wrap in a `<section>` tag with appropriate spacing
4. Add scroll animations if needed

### Modifying Product Data
Edit `/shared/data/landingData.ts`:
- `landingProducts`: Array of 25 products
- Helper functions: `getPopularProducts()`, `getFeaturedProducts()`, etc.
- `blogPosts`: Array of blog post data

### Changing Colors
All colors use Tailwind classes defined in the design system:
- Primary: `primary-lime`, `primary-lime-dark`
- Accent: `accent-blue`
- Badges: `badge-sale`
- Text: `text-primary`, `text-secondary`

## Performance Considerations

- Lazy loading images recommended
- Consider virtualization for long product lists
- Optimize animations for mobile devices
- Use `React.memo` for product cards if needed

## Future Enhancements

1. Connect to real API endpoints
2. Implement cart functionality
3. Add product detail modals/pages
4. Integrate authentication
5. Add analytics tracking
6. Implement actual filtering/sorting
7. Add pagination for product grids
8. Create skeleton loading states
9. Add error boundaries
10. Implement search functionality

## Dependencies

- `react` - Core library
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/components/*` - Internal components
- `@shared/data/landingData` - Mock data

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- CSS Grid and Flexbox support required

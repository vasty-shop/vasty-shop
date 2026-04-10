# Product Components - File Structure & Architecture

## Directory Structure

```
/frontend/src/components/products/
├── ProductCard.tsx                 # Main product card component (307 lines)
├── ProductGrid.tsx                 # Grid layout component (261 lines)
├── ProductComponents.example.tsx   # Usage examples (418 lines)
├── types.ts                        # TypeScript type definitions (239 lines)
├── index.ts                        # Public exports (14 lines)
├── README.md                       # Complete documentation (417 lines)
├── QUICKSTART.md                   # Quick start guide (371 lines)
├── SHOWCASE.md                     # Visual showcase (398 lines)
└── COMPONENT_STRUCTURE.md          # This file
```

**Total Lines of Code:** 2,425 lines

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Product Components                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ProductGrid                              │  │
│  │  (Container & Layout Management)                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  • Header (Title + "See All")                       │  │
│  │  • Filter Tabs (Optional)                           │  │
│  │  • Grid Container                                   │  │
│  │    └─> Multiple ProductCards                        │  │
│  │  • Empty State                                      │  │
│  │                                                       │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │                                           │
│                  │ Renders multiple instances                │
│                  ▼                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ProductCard                              │  │
│  │  (Individual Product Display)                        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  • Image Container                                   │  │
│  │    ├─> Product Image (lazy loaded)                  │  │
│  │    ├─> Badges (sale, new, hot)                      │  │
│  │    ├─> Wishlist Button                              │  │
│  │    ├─> Quick Add Button (hover)                     │  │
│  │    └─> Flash Sale Bar (if applicable)               │  │
│  │                                                       │  │
│  │  • Info Container                                    │  │
│  │    ├─> Brand Name                                    │  │
│  │    ├─> Product Name                                  │  │
│  │    ├─> Rating & Sold Count                          │  │
│  │    ├─> Price Display                                │  │
│  │    └─> Color Swatches                               │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### ProductGrid Component

```typescript
ProductGrid
│
├─ Props
│  ├─ products: Product[]
│  ├─ title: string
│  ├─ showSeeAll: boolean
│  ├─ showFilters: boolean
│  ├─ filters: string[]
│  ├─ columns: 2 | 3 | 4 | 5
│  ├─ variant: 'standard' | 'flash-sale' | 'compact'
│  ├─ Event Handlers (onFilterChange, onSeeAllClick, etc.)
│  └─ Flash Sale Config (optional)
│
├─ State
│  └─ activeFilter: string
│
├─ Rendered Elements
│  ├─ Header Section
│  │  ├─ Title
│  │  └─ See All Link (conditional)
│  │
│  ├─ Filter Tabs (conditional)
│  │  └─ Radix UI Tabs
│  │     └─ Animated Underline (Framer Motion)
│  │
│  ├─ Grid Container
│  │  └─ Map over products
│  │     └─ ProductCard (with motion.div wrapper)
│  │
│  └─ Empty State (conditional)
│
└─ Preset Variants
   ├─ PopularProductsGrid
   ├─ FeaturedProductsGrid
   ├─ TodaysForYouGrid
   └─ FlashSaleGrid
```

### ProductCard Component

```typescript
ProductCard
│
├─ Props
│  ├─ product: Product
│  ├─ variant: 'standard' | 'flash-sale' | 'compact'
│  ├─ showQuickAdd: boolean
│  ├─ showRating: boolean
│  ├─ showBadges: boolean
│  ├─ isWishlisted: boolean
│  ├─ flashSale: FlashSaleConfig (optional)
│  └─ Event Handlers (onClick, onWishlistToggle, onAddToCart)
│
├─ State
│  ├─ imageLoaded: boolean
│  └─ isHovered: boolean
│
├─ Sub-Components
│  └─ CountdownTimer
│     ├─ Props: endTime
│     ├─ State: timeLeft (hours, minutes, seconds)
│     └─ Effect: setInterval for countdown
│
└─ Rendered Elements
   ├─ Motion Wrapper (group hover effects)
   │
   ├─ Image Container
   │  ├─ Product Image
   │  │  ├─ Lazy Loading
   │  │  ├─ Blur Placeholder
   │  │  └─ Hover Scale Effect
   │  │
   │  ├─ Badge Overlay (top-left)
   │  │  └─ Discount/Sale/New Badge
   │  │
   │  ├─ Wishlist Button (top-right)
   │  │  ├─ Heart Icon
   │  │  └─ Click Handler
   │  │
   │  ├─ Quick Add Button (bottom, hover reveal)
   │  │  ├─ Shopping Cart Icon
   │  │  └─ "Add to Cart" Text
   │  │
   │  └─ Flash Sale Bar (bottom, if flash sale)
   │     ├─ Sold Count
   │     ├─ Countdown Timer
   │     └─ Progress Bar
   │
   └─ Info Container
      ├─ Brand (uppercase)
      ├─ Product Name (2-line clamp)
      ├─ Rating Display
      │  ├─ Star Icon
      │  ├─ Rating Number
      │  └─ Sold Count
      ├─ Price Display
      │  ├─ Sale Price (red, bold)
      │  └─ Original Price (strikethrough, gray)
      └─ Color Swatches
         ├─ Color Circles (max 4)
         └─ "+N more" indicator
```

---

## Data Flow

```
┌─────────────────┐
│   Parent Page   │
│  (e.g., Home)   │
└────────┬────────┘
         │
         │ 1. Passes products array
         │ 2. Provides event handlers
         │ 3. Manages global state (wishlist, cart)
         │
         ▼
┌────────────────────────────────────┐
│         ProductGrid                │
├────────────────────────────────────┤
│ • Manages filter state             │
│ • Handles layout (columns, gap)    │
│ • Coordinates animations           │
└────────┬───────────────────────────┘
         │
         │ For each product:
         │ • Passes product data
         │ • Forwards event handlers
         │ • Adds wishlist state
         │ • Includes flash sale config
         │
         ▼
┌────────────────────────────────────┐
│         ProductCard                │
├────────────────────────────────────┤
│ • Manages hover state              │
│ • Handles image loading            │
│ • Renders countdown timer          │
│ • Displays product info            │
└────────┬───────────────────────────┘
         │
         │ User Interactions:
         │
         ├─> Click Card → onProductClick(product)
         ├─> Click Heart → onWishlistToggle(productId)
         └─> Click "Add to Cart" → onAddToCart(product)
         │
         ▼
┌────────────────────────────────────┐
│    Parent Page Handlers            │
├────────────────────────────────────┤
│ • Update wishlist state            │
│ • Add item to cart                 │
│ • Navigate to product detail       │
│ • Track analytics                  │
└────────────────────────────────────┘
```

---

## State Management

### Component-Level State

```typescript
// ProductCard
const [imageLoaded, setImageLoaded] = useState(false);
const [isHovered, setIsHovered] = useState(false);

// ProductGrid
const [activeFilter, setActiveFilter] = useState('ALL');

// CountdownTimer (in ProductCard)
const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
```

### Parent-Level State (Recommended)

```typescript
// Wishlist (should be global - Zustand/Redux/Context)
const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

// Cart (should be global)
const cartStore = useCartStore();

// Products (from API/database)
const [products, setProducts] = useState<Product[]>([]);

// Filtered products (local to page)
const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
```

---

## Event Flow

```
User Action → Component Event → Parent Handler → State Update → Re-render

Example: Add to Cart
┌──────────────────┐
│ User clicks      │
│ "Add to Cart"    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ ProductCard.handleAddToCart  │
│ • Stops event propagation    │
│ • Calls props.onAddToCart    │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Parent Page Handler          │
│ • cartStore.addItem(product) │
│ • Show toast notification    │
│ • Track analytics            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ State Update                 │
│ • Cart count increases       │
│ • UI updates (cart badge)    │
└──────────────────────────────┘
```

---

## Animation System

### Framer Motion Variants

```typescript
// Grid Container Animation
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Individual Card Animation
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Card Hover Animation
whileHover={{
  y: -4,
  scale: 1.02
}}

// Quick Add Button
animate={{
  opacity: isHovered ? 1 : 0,
  y: isHovered ? 0 : 20
}}
```

### Animation Timeline

```
Grid Load:
0ms    → Container fades in
100ms  → Card 1 appears
200ms  → Card 2 appears
300ms  → Card 3 appears
...

Card Hover:
0ms    → Scale starts (1.0 → 1.02)
0ms    → Translate Y (-4px)
0ms    → Shadow increases
0ms    → Quick Add button slides up
200ms  → All animations complete

Filter Change:
0ms    → Underline starts moving
~150ms → Underline reaches new position (spring animation)
```

---

## Type System

```typescript
// Core Types
Product               // From @/types
ProductCardProps      // Card configuration
ProductGridProps      // Grid configuration

// Extended Types
FlashSaleConfig       // Flash sale data
FlashSaleGridConfig   // Grid-level flash sale
GridColumns           // 2 | 3 | 4 | 5
ProductFilter         // Category filters
ProductCardVariant    // 'standard' | 'flash-sale' | 'compact'

// Handler Types
ProductCardHandlers   // Event handler signatures
ProductGridHandlers   // Grid event handlers

// Display Types
DisplayProduct        // Product with metadata
ProductWithMetadata   // Enhanced product data
```

---

## Styling System

### Tailwind Classes

```css
/* Card Base */
bg-white rounded-2xl shadow-card

/* Card Hover */
hover:shadow-lg hover:scale-102

/* Price Colors */
text-badge-sale       /* #ef4444 - Sale price */
text-text-secondary   /* #64748b - Original price */

/* Button Colors */
bg-primary-lime       /* #84cc16 - Primary button */
bg-card-black         /* #0f172a - Secondary button */

/* Badges */
bg-badge-sale         /* #ef4444 - Sale/discount */
bg-primary-lime       /* #84cc16 - New/hot */
```

### Responsive Grid

```css
/* Mobile (default) */
grid-cols-2

/* Tablet (sm: 640px+) */
sm:grid-cols-2
sm:grid-cols-3

/* Desktop (md: 768px+) */
md:grid-cols-3
md:grid-cols-4

/* Large (lg: 1024px+) */
lg:grid-cols-3
lg:grid-cols-4
lg:grid-cols-5
```

---

## Dependencies

### Required
- **React**: ^19.1.1
- **Framer Motion**: ^12.23.12
- **Lucide React**: ^0.542.0
- **Radix UI (Tabs)**: ^1.1.13
- **TailwindCSS**: ^3.4.17

### Utilities
- **clsx**: ^2.1.1
- **tailwind-merge**: ^3.3.1
- **class-variance-authority**: ^0.7.1

---

## File Purposes

| File | Purpose | Lines |
|------|---------|-------|
| `ProductCard.tsx` | Main product card component with all variants | 307 |
| `ProductGrid.tsx` | Grid layout with filters and presets | 261 |
| `types.ts` | Complete TypeScript type definitions | 239 |
| `ProductComponents.example.tsx` | 9 comprehensive usage examples | 418 |
| `index.ts` | Public API exports | 14 |
| `README.md` | Complete API documentation | 417 |
| `QUICKSTART.md` | 5-minute quick start guide | 371 |
| `SHOWCASE.md` | Visual reference guide | 398 |
| `COMPONENT_STRUCTURE.md` | Architecture documentation (this file) | - |

---

## Usage Patterns

### Pattern 1: Simple Grid
```tsx
<ProductGrid products={products} />
```

### Pattern 2: Grid with Filters
```tsx
<FeaturedProductsGrid
  products={products}
  onFilterChange={handleFilter}
/>
```

### Pattern 3: Flash Sale
```tsx
<FlashSaleGrid
  products={saleProducts}
  flashSaleConfig={config}
/>
```

### Pattern 4: Single Card
```tsx
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
/>
```

### Pattern 5: Complete Integration
```tsx
<ProductGrid
  products={products}
  wishlistedProducts={wishlist}
  onWishlistToggle={toggleWishlist}
  onAddToCart={addToCart}
  onProductClick={navigate}
  onFilterChange={filter}
/>
```

---

## Performance Optimizations

1. **Lazy Image Loading**: `loading="lazy"` on all images
2. **Blur Placeholders**: Smooth image loading experience
3. **Stagger Animations**: Prevent layout thrashing
4. **Memoization Ready**: Can wrap in `React.memo()`
5. **Optimistic Updates**: Immediate UI feedback
6. **Virtual Scrolling Ready**: Can integrate with react-window
7. **Efficient Re-renders**: Minimal state updates

---

## Testing Strategy

### Unit Tests
- Individual component rendering
- Event handler callbacks
- Conditional rendering
- Type checking

### Integration Tests
- Parent-child data flow
- State management
- Animation sequences
- Responsive layouts

### E2E Tests
- Add to cart flow
- Wishlist toggle
- Filter interactions
- Navigation

---

## Future Enhancements

- [ ] Virtual scrolling for 1000+ products
- [ ] Quick view modal
- [ ] Comparison mode
- [ ] Advanced sorting
- [ ] Infinite scroll
- [ ] AR preview integration
- [ ] Social sharing
- [ ] Product variations selector
- [ ] Size guide integration
- [ ] Recently viewed tracking

---

## Support & Resources

- **Examples**: `ProductComponents.example.tsx`
- **Documentation**: `README.md`
- **Quick Start**: `QUICKSTART.md`
- **Visual Guide**: `SHOWCASE.md`
- **Types**: `types.ts`
- **Architecture**: This file

---

**Version**: 1.0.0
**Last Updated**: October 26, 2025
**Author**: Fluxez Development Team

# Fluxez Product Components - Visual Showcase

## ProductCard Variants

### 1. Standard Product Card
```
┌────────────────────────────────┐
│  ╔════╗            ♡           │
│  ║-33%║                        │
│  ╚════╝                        │
│                                │
│      [Product Image]           │
│                                │
│   ═══ ADD TO CART ═══          │ (on hover)
│                                │
├────────────────────────────────┤
│ FLUXEZ                         │
│ Classic Cotton T-Shirt         │
│ ★ 4.8 • 1K+ Sold              │
│ $19.99  $29.99                │
│ ○ ○ ○ ○ +2                    │
└────────────────────────────────┘
```

**Features:**
- Discount badge (-33%)
- Wishlist heart icon (top right)
- Product image with lazy loading
- Hover reveals "Add to Cart" button
- Brand name (uppercase)
- Product name (2-line max)
- Star rating + sold count
- Price (sale price in red, original strikethrough)
- Color swatches

---

### 2. Flash Sale Product Card
```
┌────────────────────────────────┐
│  ╔════════════╗      ♥         │
│  ║ FLASH SALE ║                │
│  ╚════════════╝                │
│                                │
│      [Product Image]           │
│                                │
├────────────────────────────────┤
│ 9/10 Sold      [02]:[15]:[30] │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░          │
└────────────────────────────────┘
│ NIKE                           │
│ Limited Edition Sneakers       │
│ ★ 4.9 • 16K+ Sold             │
│ $99.99  $159.99               │
└────────────────────────────────┘
```

**Features:**
- Flash sale badge (red)
- Wishlisted indicator (filled heart)
- Countdown timer (HH:MM:SS)
- Progress bar (90% sold)
- Sold count display
- Sale price highlighted in red

---

### 3. Compact Product Card
```
┌──────────────────┐
│  ╔════╗    ♡     │
│  ║NEW ║          │
│  ╚════╝          │
│                  │
│ [Product Image]  │
│                  │
├──────────────────┤
│ ZARA             │
│ Summer Dress     │
│ ★ 4.7            │
│ $69.99  $89.99   │
└──────────────────┘
```

**Features:**
- Smaller card size
- NEW badge
- Minimal info
- Perfect for mobile

---

## ProductGrid Layouts

### 4-Column Grid with Filters (Desktop)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Featured Products                                         See All →   │
├────────────────────────────────────────────────────────────────────────┤
│  ALL   WOMAN   CHILDREN   SHORTS   JACKETS   SHOES   T-SHIRT          │
│  ═══                                                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                              │
│  │ Card │  │ Card │  │ Card │  │ Card │                              │
│  │  1   │  │  2   │  │  3   │  │  4   │                              │
│  └──────┘  └──────┘  └──────┘  └──────┘                              │
│                                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                              │
│  │ Card │  │ Card │  │ Card │  │ Card │                              │
│  │  5   │  │  6   │  │  7   │  │  8   │                              │
│  └──────┘  └──────┘  └──────┘  └──────┘                              │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Section title with "See All" link
- Horizontal filter tabs with animated underline
- 4-column responsive grid
- Stagger animation on load

---

### 5-Column Grid (Today's For You)
```
┌────────────────────────────────────────────────────────────────────────┐
│  Today's For You!                                      See All →       │
├────────────────────────────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                         │
│  │Card │  │Card │  │Card │  │Card │  │Card │                         │
│  │  1  │  │  2  │  │  3  │  │  4  │  │  5  │                         │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                         │
│                                                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                         │
│  │Card │  │Card │  │Card │  │Card │  │Card │                         │
│  │  6  │  │  7  │  │  8  │  │  9  │  │ 10  │                         │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                         │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- More compact 5-column layout
- No filters
- Great for personalized recommendations

---

### 2-Column Grid (Mobile)
```
┌──────────────────────────────┐
│  Popular Products            │
│                  See All →   │
├──────────────────────────────┤
│  ┌──────┐     ┌──────┐      │
│  │      │     │      │      │
│  │Card 1│     │Card 2│      │
│  │      │     │      │      │
│  └──────┘     └──────┘      │
│                              │
│  ┌──────┐     ┌──────┐      │
│  │      │     │      │      │
│  │Card 3│     │Card 4│      │
│  │      │     │      │      │
│  └──────┘     └──────┘      │
│                              │
└──────────────────────────────┘
```

**Features:**
- Mobile-optimized 2-column layout
- Full-width on extra small screens
- Touch-friendly spacing

---

## Animation Effects

### Card Hover Animation
```
Before Hover:          On Hover:
┌────────┐            ╔════════╗  ← Elevated
│        │            ║        ║
│  Card  │    →       ║  Card  ║  ← Scaled (102%)
│        │            ║        ║  ← Shadow increased
└────────┘            ║[+ CART]║  ← Button appears
                      ╚════════╝
```

### Stagger Animation (Grid Load)
```
Time: 0ms      100ms     200ms     300ms
      ↓         ↓         ↓         ↓
    Card 1 → Card 2 → Card 3 → Card 4
     fade      fade      fade      fade
      in        in        in        in
```

### Filter Tab Animation
```
ALL     WOMAN     CHILDREN
═══
  └─ Animated underline moves when tab changes

ALL     WOMAN     CHILDREN
        ═════
          └─ Smooth spring animation
```

---

## Responsive Breakpoints

### Desktop (lg: 1024px+)
```
5-column grid:  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
4-column grid:  ┌────┐ ┌────┐ ┌────┐ ┌────┐
3-column grid:  ┌──────┐ ┌──────┐ ┌──────┐
```

### Tablet (md: 768px+)
```
4-column → 3-column:  ┌────┐ ┌────┐ ┌────┐
3-column → 2-column:  ┌──────┐ ┌──────┐
```

### Mobile (sm: 640px+)
```
All grids → 2-column:  ┌──────┐ ┌──────┐
```

### Extra Small (< 640px)
```
5-column → 2-column:  ┌──────┐ ┌──────┐
2-column → 2-column:  ┌──────┐ ┌──────┐
```

---

## Color Palette

### Badges
```
SALE / FLASH SALE:  🔴 #ef4444 (badge-sale)
NEW:                🟢 Custom green
HOT:                🟠 Custom orange
-XX%:               🔴 #ef4444 (badge-sale)
```

### Prices
```
Sale Price:         🔴 #ef4444 (badge-sale)
Original Price:     ⚫ #64748b (text-secondary) strikethrough
Regular Price:      ⚫ #0f172a (text-primary)
```

### Interactive Elements
```
Primary Button:     🟢 #84cc16 (primary-lime)
Button Hover:       🟢 #65a30d (primary-lime-dark)
Card Background:    ⚪ #ffffff (card-white)
Card Shadow:        ⚫ rgba(0,0,0,0.08)
```

### Text
```
Primary Text:       ⚫ #0f172a (text-primary)
Secondary Text:     ⚫ #64748b (text-secondary)
Rating Star:        ⭐ #fbbf24 (yellow-400)
```

---

## Component Hierarchy

```
ProductGrid
  ├── Header
  │   ├── Title + See All Link
  │   └── Filter Tabs (optional)
  │       └── Animated Underline
  ├── Grid Container
  │   └── ProductCard (multiple)
  │       ├── Image Container
  │       │   ├── Product Image (lazy loaded)
  │       │   ├── Badges (top-left)
  │       │   ├── Wishlist Button (top-right)
  │       │   ├── Quick Add Button (bottom, on hover)
  │       │   └── Flash Sale Bar (bottom, if flash sale)
  │       │       ├── Sold Count
  │       │       ├── Countdown Timer
  │       │       └── Progress Bar
  │       └── Info Container
  │           ├── Brand
  │           ├── Product Name
  │           ├── Rating + Sold Count
  │           ├── Price (sale + original)
  │           └── Color Swatches
  └── Empty State (if no products)
```

---

## State Management

### Wishlist State
```typescript
// Global state (recommended)
const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

// Persisted to localStorage
useEffect(() => {
  localStorage.setItem('wishlist', JSON.stringify(wishlistedProducts));
}, [wishlistedProducts]);
```

### Filter State
```typescript
const [activeFilter, setActiveFilter] = useState('ALL');
const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

useEffect(() => {
  if (activeFilter === 'ALL') {
    setFilteredProducts(products);
  } else {
    setFilteredProducts(
      products.filter(p => p.category === activeFilter)
    );
  }
}, [activeFilter, products]);
```

---

## Performance Tips

1. **Image Optimization**
   - Use lazy loading: `loading="lazy"`
   - Blur placeholder during load
   - Consider using WebP/AVIF formats
   - Implement responsive images with srcset

2. **Animation Performance**
   - Framer Motion optimizes animations
   - Uses GPU acceleration
   - Animations run at 60fps

3. **Large Product Lists**
   - Consider implementing virtual scrolling
   - Paginate or use infinite scroll
   - Lazy load images

4. **Memoization**
   ```typescript
   const MemoizedProductCard = React.memo(ProductCard);
   ```

---

## Accessibility

- Semantic HTML (`<button>`, `<img>`, etc.)
- Alt text for all images
- Keyboard navigation support
- Focus visible states
- ARIA labels where needed
- Color contrast compliant

---

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ iOS Safari 14+
✅ Chrome Mobile 90+

---

## Quick Start

```bash
# Import components
import { ProductGrid, ProductCard } from '@/components/products';

# Use preset grids
import {
  PopularProductsGrid,
  FeaturedProductsGrid,
  TodaysForYouGrid,
  FlashSaleGrid,
} from '@/components/products';
```

See `ProductComponents.example.tsx` for complete working examples!

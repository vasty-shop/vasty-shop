# FeaturedProductsCarousel - Component Overview

## 📦 What's Included

```
FeaturedProductsCarousel/
├── FeaturedProductsCarousel.tsx           # Main component (355 lines)
├── FeaturedProductsCarousel.types.ts      # TypeScript types (217 lines)
├── FeaturedProductsCarousel.example.tsx   # Usage examples (412 lines)
├── FeaturedProductsCarousel.README.md     # Full documentation (348 lines)
├── FeaturedProductsCarousel.QUICKSTART.md # Quick start guide (141 lines)
├── FeaturedProductsCarousel.OVERVIEW.md   # This file
└── FeaturedProductsCarousel.index.ts      # Barrel exports
```

## 🎯 Component Structure

```
┌─────────────────────────────────────────────────────┐
│  Featured Products                      See All →   │  ← Header
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ ♥  👁  │  │ ♥  👁  │  │ ♥  👁  │  │ ♥  👁  │  ←──── Action Icons
│  │       │  │       │  │       │  │       │       │
│  │ IMAGE │  │ IMAGE │  │ IMAGE │  │ IMAGE │       │
│  │       │  │       │  │       │  │       │       │
│  │[Cart] │  │[Cart] │  │[Cart] │  │[Cart] │  ←──── Hover Button
│  ├───────┤  ├───────┤  ├───────┤  ├───────┤       │
│  │Airpod │  │Glass  │  │Cap    │  │Ring   │  ←──── Product Info
│  │$20.00 │  │$20.00 │  │$20.00 │  │$20.00 │       │
│  └───────┘  └───────┘  └───────┘  └───────┘       │
│                                                     │
│  ◄ ──────────────────────────────────────────── ►  │  ← Navigation
└─────────────────────────────────────────────────────┘
```

## 🎨 Visual Features

### Product Card Anatomy
```
┌──────────────────────┐
│  ♥ ← Wishlist        │
│  👁 ← Quick View      │
│                      │
│   [Product Image]    │  ← Hover: Zoom 1.1x
│                      │
│  [Add to cart 🛍️]    │  ← Shows on hover
├──────────────────────┤
│ Airpod               │  ← Name (bold)
│ Wireless Earbuds     │  ← Category (gray)
│ $20.00               │  ← Price (red)
└──────────────────────┘
```

### Interaction States

| Element | Default | Hover | Active |
|---------|---------|-------|--------|
| Card | White bg, subtle shadow | Shadow increases, lifts 4px | - |
| Image | Static | Scale 1.1x | - |
| Wishlist | Gray heart | Red heart (if active) | Scale 0.9x |
| Quick View | Gray eye | Gray eye on white | Scale 0.9x |
| Add to Cart | Hidden | Visible, slides up | Gray background |
| Nav Arrow | Hidden | Visible, white bg | Scale 0.95x |

## 🔄 User Flow

### Adding to Cart
```
1. User hovers over product card
   └─> Card lifts up
   └─> Image zooms in
   └─> "Add to cart" button slides up from bottom

2. User clicks "Add to cart"
   └─> onAddToCart callback fires
   └─> Button scales down (0.9x) on click
   └─> (Your app shows toast notification)

3. Product added to cart
   └─> Card returns to normal state
```

### Adding to Wishlist
```
1. User clicks heart icon
   └─> Heart fills with red color
   └─> onWishlistToggle callback fires
   └─> Icon scales down then up (animation)

2. User clicks again (already wishlisted)
   └─> Heart returns to gray outline
   └─> onWishlistToggle callback fires again
   └─> Icon animates
```

### Carousel Navigation
```
1. User hovers over carousel
   └─> Navigation arrows fade in (if scrollable)

2. User clicks right arrow
   └─> Carousel scrolls 300px to the right
   └─> Arrow scales down on click
   └─> Smooth scroll animation

3. Reaches end
   └─> Right arrow fades out
   └─> Left arrow remains visible
```

## 🎬 Animations

### Entrance Animations
```typescript
Card Entrance:
- Initial: opacity: 0, y: 20
- Animate: opacity: 1, y: 0
- Duration: 0.5s
- Stagger: 0.1s delay between cards
```

### Hover Animations
```typescript
Card Hover:
- Scale: 1.02x
- Translate Y: -4px
- Shadow: Increases
- Duration: 0.3s

Image Hover:
- Scale: 1.1x
- Duration: 0.3s

Button Hover:
- Scale: 1.1x
- Background: Changes
- Duration: 0.2s
```

### Click Animations
```typescript
Button Click:
- Scale: 0.9x
- Duration: 0.1s
```

## 💡 Key Features

### ✅ Implemented
- [x] Horizontal scrollable carousel
- [x] Smooth CSS-based scrolling
- [x] Navigation arrows (left/right)
- [x] Auto-hide arrows at scroll limits
- [x] Wishlist toggle with heart icon
- [x] Quick view with eye icon
- [x] Add to cart button (hover trigger)
- [x] Product card hover effects
- [x] Image zoom on hover
- [x] Responsive design (mobile/tablet/desktop)
- [x] Framer Motion animations
- [x] Entrance stagger animations
- [x] Section header with "See All" link
- [x] Price display in red
- [x] TypeScript types
- [x] Event handlers for all actions

### 🔮 Future Enhancements
- [ ] Touch/swipe gestures for mobile
- [ ] Infinite scroll
- [ ] Auto-play carousel
- [ ] Pagination dots
- [ ] Skeleton loading states
- [ ] Image lazy loading
- [ ] Keyboard navigation
- [ ] ARIA labels for accessibility
- [ ] Product variants (colors/sizes)
- [ ] Dynamic products from API
- [ ] Virtual scrolling for performance

## 📊 Component Props

```typescript
interface FeaturedProductsCarouselProps {
  // State
  wishlistedProducts?: Set<string>;

  // Event Handlers
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onSeeAll?: () => void;

  // Styling
  className?: string;
}
```

## 🎯 Default Products

The component comes with 4 featured products:

1. **Airpod** - Wireless Earbuds - $20.00
2. **Sunglass** - Brown Gradient - $20.00
3. **Cap** - Baseball Cap - $20.00
4. **Stone Ring** - Diamond Ring - $20.00

## 📱 Responsive Breakpoints

| Breakpoint | Card Width | Gap | Nav Arrows |
|------------|-----------|-----|------------|
| Mobile (<768px) | 250px | 16px | 20px |
| Tablet (768-1023px) | 280px | 24px | 24px |
| Desktop (≥1024px) | 280px | 24px | 24px |

## 🎨 Color Palette

```css
/* Used Colors */
--price-color: #ef4444;        /* Red 500 */
--card-bg: #ffffff;            /* White */
--section-bg: #ffffff;         /* White */
--text-primary: #111827;       /* Gray 900 */
--text-secondary: #6b7280;     /* Gray 500 */
--button-bg: #ffffff;          /* White */
--button-hover: #f9fafb;       /* Gray 50 */
--shadow: rgba(0, 0, 0, 0.1);  /* Shadow */
--wishlist-active: #ef4444;    /* Red 500 */
--icon-default: #4b5563;       /* Gray 600 */
```

## 🔧 Technology Stack

- **React** 19.1.1 - Component framework
- **TypeScript** 5.8.3 - Type safety
- **Framer Motion** 12.23.12 - Animations
- **Lucide React** 0.542.0 - Icons
- **Tailwind CSS** 3.4.17 - Styling
- **Radix UI** - Button component

## 📐 Dimensions

```
Section Padding:
- Mobile: py-8 (2rem)
- Desktop: py-12 (3rem)

Container:
- Max Width: container (1280px)
- Padding X: px-4 (1rem) mobile, px-6 (1.5rem) desktop

Product Card:
- Width: 250px (mobile), 280px (desktop)
- Aspect Ratio: 1:1 (square image)
- Border Radius: 1rem (16px)
- Padding: 1rem (16px)

Navigation Arrows:
- Size: 40px x 40px (mobile), 48px x 48px (desktop)
- Icon: 20px (mobile), 24px (desktop)
- Position: Absolute, centered vertically

Action Icons:
- Container: 40px x 40px
- Icon: 20px x 20px
- Gap: 0.5rem (8px)
```

## 🚀 Performance

### Optimization Techniques
- CSS-based smooth scrolling (no JS animation)
- Framer Motion lazy loading
- Component memoization ready
- Event handler optimization with useCallback
- Proper cleanup of scroll listeners

### Bundle Impact
- Component: ~13KB
- Types: ~7KB
- Total: ~20KB (unminified, ungzipped)

### Runtime Performance
- 60fps animations
- No layout thrashing
- Optimized re-renders
- Efficient event handling

## 🧪 Testing Checklist

### Visual Tests
- [ ] Cards display correctly
- [ ] Images load and zoom on hover
- [ ] Navigation arrows appear/disappear correctly
- [ ] Animations are smooth
- [ ] Responsive layout works on all breakpoints

### Interaction Tests
- [ ] Clicking wishlist toggles heart icon
- [ ] Clicking "Add to cart" triggers callback
- [ ] Clicking eye icon triggers quick view
- [ ] Clicking "See All" triggers callback
- [ ] Arrow buttons scroll carousel
- [ ] Hover shows/hides add to cart button

### Edge Cases
- [ ] Empty products array
- [ ] Single product
- [ ] Many products (>10)
- [ ] Long product names
- [ ] Missing images
- [ ] No event handlers provided

## 📚 Documentation Files

1. **FeaturedProductsCarousel.tsx** - Main component implementation
2. **FeaturedProductsCarousel.types.ts** - TypeScript type definitions
3. **FeaturedProductsCarousel.example.tsx** - Usage examples and demos
4. **FeaturedProductsCarousel.README.md** - Comprehensive documentation
5. **FeaturedProductsCarousel.QUICKSTART.md** - Quick start guide
6. **FeaturedProductsCarousel.OVERVIEW.md** - This visual overview
7. **FeaturedProductsCarousel.index.ts** - Barrel exports

## 🎓 Learning Resources

### Key Concepts
- Horizontal scrolling with CSS
- Framer Motion animations
- React event handling
- TypeScript generic types
- Responsive design patterns

### Related Components
- ProductCard (individual product cards)
- ProductGrid (grid layout)
- BestSellersSection (similar carousel)
- FlashSaleSection (timed carousel)

## 🐛 Troubleshooting

### Common Issues

**Navigation arrows not showing**
- Check if carousel has enough content to scroll
- Verify hover state is working
- Check CSS z-index

**Images not loading**
- Verify image paths are correct
- Check public folder structure
- Use absolute paths for images

**Animations not smooth**
- Ensure Framer Motion is installed
- Check for performance issues
- Reduce animation complexity

**Wishlist not toggling**
- Ensure Set is properly managed
- Check callback is provided
- Verify state updates

## 📞 Support

For questions or issues:
1. Check the README.md for detailed documentation
2. Review the example.tsx for usage patterns
3. Read the QUICKSTART.md for quick setup
4. Examine the component source code

## 📄 License

Part of the Fluxez Shop project.

---

**Created**: October 26, 2025
**Last Updated**: October 26, 2025
**Version**: 1.0.0

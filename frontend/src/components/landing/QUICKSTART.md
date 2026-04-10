# PromoBanners - Quick Start Guide

## Fast Integration (5 Minutes)

### Step 1: Import the Component

```tsx
// In your landing page or homepage
import PromoBanners from '@/components/landing/PromoBanners'
```

### Step 2: Add to Your Page

```tsx
function HomePage() {
  return (
    <div>
      {/* Your hero section */}
      <HeroSection />

      {/* Add all promo banners */}
      <PromoBanners />

      {/* Your popular products section */}
      <PopularProducts />
    </div>
  )
}
```

### Step 3: Done!

That's it! The component is fully styled and animated.

---

## Selective Usage

### Use Only Specific Banners

```tsx
import {
  HorizontalPromoBanners,
  CategoryIconsRow,
  LargeFeatureBanners
} from '@/components/landing/PromoBanners'

function CustomLayout() {
  return (
    <div>
      {/* Just the 3-card row */}
      <HorizontalPromoBanners />

      {/* Your content */}

      {/* Just the categories */}
      <CategoryIconsRow />

      {/* Your content */}

      {/* Just the large banners */}
      <LargeFeatureBanners />
    </div>
  )
}
```

---

## Add Click Tracking

### Basic Analytics Integration

```tsx
import { PromoBanners } from '@/components/landing/PromoBanners'

function HomePage() {
  // Track banner clicks
  const handleBannerClick = (bannerId: string) => {
    // Your analytics service
    analytics.track('Banner Clicked', {
      bannerId,
      timestamp: Date.now(),
    })

    // Navigate
    router.push(`/promo/${bannerId}`)
  }

  return <PromoBanners />
}
```

---

## Customize Colors

### Quick Color Changes

Find the banner you want to modify in `/components/landing/PromoBanners.tsx`:

```tsx
// Change from:
className="bg-gradient-to-br from-orange-100 via-peach-100 to-pink-100"

// To your colors:
className="bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100"
```

### Change Button Colors

```tsx
// Change from:
<Button variant="default">Buy Now</Button>

// To custom color:
<Button
  variant="default"
  className="bg-purple-500 hover:bg-purple-600"
>
  Buy Now
</Button>
```

---

## Add Background Images

### Replace Gradient with Image

```tsx
<motion.div
  className="relative overflow-hidden rounded-2xl"
  style={{
    backgroundImage: "url('/images/promo/watch-banner.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Add dark overlay for text readability */}
  <div className="absolute inset-0 bg-black/50" />

  {/* Your content (now with z-10) */}
  <div className="relative z-10 p-8">
    <h3 className="text-white">Premium Watch</h3>
  </div>
</motion.div>
```

---

## Modify Text Content

### Update Titles and Descriptions

```tsx
// Find in PromoBanners.tsx:
<h3 className="text-2xl md:text-3xl font-bold text-card-black mb-2">
  Premium
  <br />
  Watch
</h3>
<p className="text-text-secondary text-sm mb-6">
  Timeless elegance meets modern design
</p>

// Change to your text:
<h3 className="text-2xl md:text-3xl font-bold text-card-black mb-2">
  Your
  <br />
  Product
</h3>
<p className="text-text-secondary text-sm mb-6">
  Your custom description here
</p>
```

---

## Add New Categories

### Extend Category List

```tsx
// In PromoBanners.tsx, find the categories array:
const categories: CategoryItem[] = [
  // Add your new category:
  {
    id: 'accessories',
    label: 'Accessories',
    icon: <Star className="w-6 h-6" />,
    color: 'from-yellow-400 to-yellow-500',
  },
  // ... existing categories
]
```

---

## Common Customizations

### 1. Change Animation Speed

```tsx
// In containerVariants:
staggerChildren: 0.2, // Slower (default: 0.1)

// In itemVariants:
transition: { duration: 0.8 } // Slower (default: 0.5)
```

### 2. Disable Animations

```tsx
// Remove or comment out:
// variants={containerVariants}
// initial="hidden"
// whileInView="visible"
```

### 3. Change Hover Effect

```tsx
// Modify hoverScale:
const hoverScale = {
  scale: 1.05,        // More zoom (default: 1.02)
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)', // Bigger shadow
  transition: { duration: 0.2 }  // Faster (default: 0.3)
}
```

### 4. Change Border Radius

```tsx
// Change from:
className="rounded-2xl"

// To:
className="rounded-3xl"  // More rounded
className="rounded-xl"   // Less rounded
className="rounded-lg"   // Even less rounded
```

---

## Mobile Optimization

### All components are mobile-responsive by default:

- **Horizontal Banners**: Stack vertically on mobile
- **Category Icons**: Horizontal scroll on all sizes
- **Large Banners**: Stack vertically on mobile, side-by-side on desktop

### Test responsive behavior:

```bash
# In your browser DevTools
# Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
# Test at: 375px (mobile), 768px (tablet), 1024px (desktop)
```

---

## Performance Tips

### 1. Lazy Load Background Images

```tsx
<motion.div
  style={{
    backgroundImage: `url('${imageSrc}')`,
  }}
  loading="lazy"
>
```

### 2. Use WebP Images

```tsx
backgroundImage: "url('/images/banner.webp')"
```

### 3. Optimize Animation Performance

```tsx
// Use transform instead of width/height
// Use opacity instead of display
whileHover={{
  scale: 1.02,        // ✅ Good - uses transform
  opacity: 0.8,       // ✅ Good
  width: '110%',      // ❌ Avoid - causes reflow
}}
```

---

## Troubleshooting

### Banners not showing?

```tsx
// Check parent container:
<div className="w-full"> {/* ✅ Good */}
  <PromoBanners />
</div>

<div className="w-0"> {/* ❌ Bad - container too small */}
  <PromoBanners />
</div>
```

### Animations not working?

```bash
# Ensure framer-motion is installed:
npm install framer-motion

# Or:
yarn add framer-motion
```

### Icons not showing?

```bash
# Ensure lucide-react is installed:
npm install lucide-react
```

### Gradients not rendering?

```tsx
// Check Tailwind config includes gradient utilities
// Ensure you're using correct syntax:
className="bg-gradient-to-br from-blue-100 to-pink-100" // ✅ Good
className="bg-gradient blue-100 pink-100" // ❌ Wrong
```

---

## Next Steps

1. **Read Full Documentation**: See `PromoBanners.README.md`
2. **Check Examples**: See `PromoBanners.example.tsx`
3. **Review Types**: See `PromoBanners.types.ts`
4. **Customize**: Modify colors, text, and images to match your brand

---

## Support

For issues or questions:
1. Check the README.md file
2. Review the example file
3. Inspect browser console for errors
4. Verify all dependencies are installed

---

## File Locations

```
/frontend/src/components/landing/
├── PromoBanners.tsx           # Main component
├── PromoBanners.types.ts      # TypeScript types
├── PromoBanners.example.tsx   # Usage examples
├── PromoBanners.README.md     # Full documentation
└── QUICKSTART.md              # This file
```

---

Happy building! 🚀

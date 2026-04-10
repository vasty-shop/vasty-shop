# PromoBanners Component Documentation

## Overview

The PromoBanners component system provides three distinct promotional banner layouts for the Fluxez e-commerce platform. All components feature responsive design, smooth animations, and follow the Fluxez brand guidelines.

## File Location

`/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/PromoBanners.tsx`

## Component Architecture

### Main Components

1. **HorizontalPromoBanners** - Three-card promotional row
2. **LargeFeatureBanners** - Hero-style feature banners
3. **CategoryIconsRow** - Scrollable category navigation
4. **PromoBanners** - Combined layout (all three above)

---

## 1. HorizontalPromoBanners

### Description
A horizontal row of three promotional cards, perfect for displaying above "Popular Products" sections.

### Features
- **Card 1**: Peach gradient background with "New Release" watch promotion
- **Card 2**: Light blue gradient with "30% Sale" jewelry offer
- **Card 3**: Pink gradient with "Buy 2 Get 1" perfume deal

### Design Elements
- Rounded corners (rounded-2xl)
- Gradient backgrounds with hover overlay effects
- Badge labels (NEW RELEASE, 30% OFF, SPECIAL OFFER)
- Icon integration (Watch, Sparkles, Droplets)
- Responsive buttons with brand colors
- Hover animations (scale + shadow)

### Usage
```tsx
import { HorizontalPromoBanners } from '@/components/landing/PromoBanners'

function HomePage() {
  return (
    <div>
      <HorizontalPromoBanners />
    </div>
  )
}
```

### Responsive Behavior
- **Mobile**: Stacked vertically (1 column)
- **Tablet+**: 3 columns side-by-side
- Min height: 280px per card

---

## 2. LargeFeatureBanners

### Description
Large promotional banners displayed in a 2-column layout with asymmetric design.

### Layout Structure

#### Left Panel (Full Height)
- **Theme**: Dark background (Coming Soon - Winter Collection)
- **Content**:
  - "COMING SOON" badge
  - Large title text
  - Descriptive copy
  - "Pre-Sale Now" CTA button
  - Decorative glow effects
- **Min Height**: 400px (mobile), 500px (desktop)

#### Right Panel (Split Top/Bottom)

**Top Half** - Fashion Forward
- Peach/orange gradient
- Fashion icon in circular badge
- Animated sparkle indicator
- "Explore" button

**Bottom Half** - 50% Discount
- Sky blue gradient
- "MEGA SALE" badge
- Large discount percentage
- "Shop Now" button
- Shopping bag icon

### Design Elements
- Gradient overlays on hover
- Animated decorative elements
- Glowing background orbs
- Shadow and scale effects
- Responsive text sizing

### Usage
```tsx
import { LargeFeatureBanners } from '@/components/landing/PromoBanners'

function HomePage() {
  return (
    <div>
      <LargeFeatureBanners />
    </div>
  )
}
```

### Responsive Behavior
- **Mobile**: Stacked vertically
- **Desktop**: 2 columns (1 large + 1 split)
- Right panel splits into 2 equal rows

---

## 3. CategoryIconsRow

### Description
Horizontal scrollable row of category icons with labels for quick navigation.

### Categories Included
1. T-Shirt (Blue gradient)
2. Jacket (Purple gradient)
3. Shirt (Pink gradient)
4. Jeans (Indigo gradient)
5. Bag (Orange gradient)
6. Shoes (Teal gradient)
7. Watches (Amber gradient)
8. Cap (Rose gradient)
9. All Category (Primary lime gradient)

### Features
- Horizontal scroll with snap points
- Hidden scrollbar for clean appearance
- Gradient fade effect on right edge
- Individual icon animations on hover
- Staggered entrance animations
- Color-coded category badges

### Design Elements
- 16x16 icon containers with gradients
- Rounded corners (rounded-2xl)
- Hover scale and rotation effects
- Text color change on hover
- Mobile-optimized touch scrolling

### Usage
```tsx
import { CategoryIconsRow } from '@/components/landing/PromoBanners'

function HomePage() {
  return (
    <div>
      <CategoryIconsRow />
    </div>
  )
}
```

### Responsive Behavior
- All screen sizes: Horizontal scroll
- Icon size: 64px (mobile), 72px (desktop)
- Gradient fade overlay on right edge

---

## Combined PromoBanners Component

### Description
Pre-configured layout with all three banner types in recommended order.

### Layout Order
1. HorizontalPromoBanners
2. CategoryIconsRow
3. LargeFeatureBanners

### Usage
```tsx
import PromoBanners from '@/components/landing/PromoBanners'

function HomePage() {
  return (
    <div>
      <PromoBanners />
    </div>
  )
}
```

---

## Animation System

### Framer Motion Integration

#### Container Animations
```tsx
containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

#### Item Animations
```tsx
itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}
```

#### Hover Effects
```tsx
hoverScale = {
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
  transition: { duration: 0.3 }
}
```

### Viewport Triggers
- Animations trigger when component is ~50px from viewport
- `once: true` ensures animations run only on first view
- Prevents re-animation on scroll

---

## Color Palette

### Gradients Used

#### Horizontal Banners
- **Peach**: `from-orange-100 via-peach-100 to-pink-100`
- **Sky Blue**: `from-sky-100 via-blue-50 to-cyan-100`
- **Pink**: `from-pink-100 via-rose-50 to-fuchsia-100`

#### Large Banners
- **Dark**: `from-slate-800 via-slate-700 to-slate-900`
- **Peach**: `from-orange-200 via-peach-200 to-pink-200`
- **Sky**: `from-sky-200 via-blue-100 to-cyan-200`

#### Category Icons
- Individual gradients: `from-{color}-400 to-{color}-500`

### Brand Colors (from tailwind.config)
- **Primary Lime**: `#84cc16`
- **Primary Lime Dark**: `#65a30d`
- **Accent Blue**: `#3b82f6`
- **Badge Sale**: `#ef4444`
- **Card Black**: `#0f172a`
- **Card Dark**: `#1f2937`

---

## Customization Guide

### Changing Card Content

```tsx
// Find the card section you want to modify
<motion.div className="...">
  <div className="relative z-10">
    {/* Change badge text */}
    <span>YOUR BADGE TEXT</span>

    {/* Change title */}
    <h3>Your Title</h3>

    {/* Change description */}
    <p>Your description text</p>

    {/* Change button */}
    <Button>Your CTA</Button>
  </div>
</motion.div>
```

### Adding Background Images

```tsx
<motion.div
  className="relative overflow-hidden rounded-2xl bg-cover bg-center"
  style={{ backgroundImage: "url('/path/to/image.jpg')" }}
>
  {/* Add overlay for text readability */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Your content */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</motion.div>
```

### Modifying Colors

```tsx
// Change gradient
className="bg-gradient-to-br from-purple-100 to-blue-100"

// Change button color
<Button
  variant="default"
  className="bg-purple-500 hover:bg-purple-600"
>
```

### Adding Click Handlers

```tsx
<motion.div
  onClick={() => handleBannerClick('banner-id')}
  className="cursor-pointer"
>
  {/* ... */}
</motion.div>
```

### Customizing Categories

```tsx
const categories: CategoryItem[] = [
  {
    id: 'new-category',
    label: 'New Item',
    icon: <YourIcon className="w-6 h-6" />,
    color: 'from-emerald-400 to-emerald-500',
  },
  // ... more categories
]
```

---

## Dependencies

### Required Packages
- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `@radix-ui/react-slot` - Button component primitive
- `class-variance-authority` - Button variants
- `tailwindcss` - Styling framework

### Internal Dependencies
- `@/components/ui/button` - Fluxez button component
- `@/lib/utils` - Utility functions (cn)

---

## Accessibility

### Features Implemented
- Semantic HTML structure
- Keyboard navigation support (buttons)
- ARIA-compliant button elements
- Sufficient color contrast ratios
- Responsive touch targets (min 44x44px)

### Recommendations
- Add `aria-label` to icon-only buttons
- Include `alt` text if adding images
- Test with screen readers
- Ensure keyboard focus indicators are visible

---

## Performance Considerations

### Optimizations
- Lazy animation triggers (viewport-based)
- CSS transforms for animations (GPU-accelerated)
- Minimal re-renders with Framer Motion
- Efficient gradient rendering
- Scrollbar hiding via CSS (not JS)

### Best Practices
- Use `viewport={{ once: true }}` to prevent re-animation
- Leverage CSS gradients over images where possible
- Implement lazy loading for background images
- Use WebP format for images

---

## Browser Support

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallbacks
- CSS gradients supported in all modern browsers
- Framer Motion animations degrade gracefully
- Grid layout with Flexbox fallback

---

## Responsive Breakpoints

### Tailwind Breakpoints Used
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px

### Component Breakpoints
- **Mobile**: < 768px (stacked layout)
- **Tablet**: 768px - 1024px (hybrid layout)
- **Desktop**: > 1024px (full grid layout)

---

## Examples

See `PromoBanners.example.tsx` for:
- Integration examples
- Routing implementation
- Custom layout patterns
- Analytics tracking
- Event handling

---

## Troubleshooting

### Common Issues

**Animations not working**
- Ensure `framer-motion` is installed
- Check that viewport is configured correctly
- Verify parent container isn't hidden

**Gradients not displaying**
- Check Tailwind config includes gradient utilities
- Ensure color values are defined in theme
- Verify `bg-gradient-to-br` syntax

**Icons not showing**
- Confirm `lucide-react` is installed
- Check icon imports at top of file
- Verify icon names are correct

**Layout breaking on mobile**
- Test responsive classes (md:, lg:, etc.)
- Check container padding/margins
- Verify grid columns are correct

---

## Future Enhancements

### Potential Additions
- [ ] Add real product images
- [ ] Implement click tracking analytics
- [ ] Add A/B testing variants
- [ ] Create admin customization panel
- [ ] Add video backgrounds support
- [ ] Implement countdown timers for sales
- [ ] Add skeleton loading states
- [ ] Create Storybook documentation

---

## License

Part of the Fluxez e-commerce platform.

## Author

Created for Fluxez - AR Fashion E-Commerce Platform

## Version

1.0.0 - Initial Release

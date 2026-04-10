# FilterSidebar - Component Structure

## File Tree
```
frontend/src/components/
├── products/
│   ├── FilterSidebar.tsx              # Main component (16KB)
│   ├── FilterSidebar.example.tsx      # Working examples (12KB)
│   ├── FilterSidebar.README.md        # Documentation (9.1KB)
│   ├── FilterSidebar.QUICKSTART.md    # Quick start (8.3KB)
│   ├── FilterSidebar.SHOWCASE.md      # Visual guide (11KB)
│   ├── FilterSidebar.SUMMARY.md       # Summary (9.8KB)
│   └── FilterSidebar.STRUCTURE.md     # This file
└── ui/
    └── checkbox.tsx                   # Checkbox component (1.1KB)
```

## Component Architecture

```
FilterSidebar (Root Component)
│
├── Header Section
│   ├── Title: "Filters"
│   └── Clear All Button (w/ count badge)
│
├── Accordion Container (Radix UI)
│   │
│   ├── Categories Section
│   │   ├── AccordionTrigger: "Categories"
│   │   └── AccordionContent
│   │       └── Checkbox List (7 items)
│   │           ├── Men's Fashion + count
│   │           ├── Women's Fashion + count
│   │           ├── Electronics + count
│   │           ├── Home & Living + count
│   │           ├── Sports + count
│   │           ├── Beauty + count
│   │           └── Books + count
│   │
│   ├── Price Range Section
│   │   ├── AccordionTrigger: "Price Range"
│   │   └── AccordionContent
│   │       ├── Preset Checkboxes (5 items)
│   │       │   ├── Under $25
│   │       │   ├── $25 - $50
│   │       │   ├── $50 - $100
│   │       │   ├── $100 - $200
│   │       │   └── $200+
│   │       └── Custom Range
│   │           ├── Label: "Custom Range"
│   │           ├── Slider (dual-handle, 0-1000)
│   │           └── Value Display ($min - $max)
│   │
│   ├── Size Section (Conditional)
│   │   ├── AccordionTrigger: "Size"
│   │   └── AccordionContent
│   │       └── Button Grid (3 cols)
│   │           ├── XS  ├── S   ├── M
│   │           ├── L   ├── XL  └── XXL
│   │
│   ├── Color Section
│   │   ├── AccordionTrigger: "Color"
│   │   └── AccordionContent
│   │       └── Color Swatch Grid (6 cols)
│   │           ├── Black  ├── White   ├── Gray
│   │           ├── Navy   ├── Red     ├── Pink
│   │           ├── Green  ├── Blue    ├── Yellow
│   │           ├── Purple ├── Brown   └── Beige
│   │
│   ├── Brand Section
│   │   ├── AccordionTrigger: "Brands"
│   │   └── AccordionContent
│   │       ├── Search Input (w/ icon + clear)
│   │       └── Scrollable Checkbox List
│   │           ├── Nike
│   │           ├── Adidas
│   │           ├── Zara
│   │           ├── H&M
│   │           ├── ... (filtered by search)
│   │           └── (15+ total brands)
│   │
│   └── Rating Section
│       ├── AccordionTrigger: "Customer Rating"
│       └── AccordionContent
│           └── Button List (single select)
│               ├── ★★★★★ 4+ Stars
│               ├── ★★★★☆ 3+ Stars
│               ├── ★★★☆☆ 2+ Stars
│               └── ★★☆☆☆ 1+ Stars
```

## Data Flow

```
Parent Component State
         ↓
    FilterSidebar Props
         ↓
┌────────────────────────┐
│   FilterSidebar        │
│                        │
│  User Interaction      │
│  (click, type, slide)  │
│         ↓              │
│  Event Handler         │
│  (toggleCategory, etc) │
│         ↓              │
│  Callback Prop         │
│  (onCategoryChange)    │
└────────────────────────┘
         ↓
  Parent Updates State
         ↓
    FilterSidebar Re-renders
         ↓
  Updated UI Reflects State
```

## State Management

### Parent Component State
```typescript
{
  selectedCategories: string[]        // e.g., ['mens-fashion', 'sports']
  selectedPriceRange: [number, number] // e.g., [25, 150]
  selectedSizes: string[]             // e.g., ['M', 'L', 'XL']
  selectedColors: string[]            // e.g., ['black', 'blue']
  selectedBrands: string[]            // e.g., ['Nike', 'Adidas']
  minRating: number                   // e.g., 4 (for 4+ stars)
}
```

### Internal Component State
```typescript
{
  brandSearchQuery: string  // Search input for brands
}
```

## Props Interface

```typescript
interface FilterSidebarProps {
  // Current filter values (controlled)
  selectedCategories: string[]
  selectedPriceRange: [number, number]
  selectedSizes: string[]
  selectedColors: string[]
  selectedBrands: string[]
  minRating: number

  // Change handlers (callbacks to parent)
  onCategoryChange: (categories: string[]) => void
  onPriceRangeChange: (range: [number, number]) => void
  onSizeChange: (sizes: string[]) => void
  onColorChange: (colors: string[]) => void
  onBrandChange: (brands: string[]) => void
  onRatingChange: (rating: number) => void
  onClearAll: () => void

  // Optional configuration
  categoryProductCounts?: Record<string, number>
  isMobile?: boolean
  className?: string
}
```

## Helper Functions

### Internal Functions
```typescript
toggleCategory(categoryId: string)    // Toggle category selection
toggleSize(size: string)              // Toggle size selection
toggleColor(colorId: string)          // Toggle color selection
toggleBrand(brand: string)            // Toggle brand selection
handlePricePreset(min, max)          // Set price range from preset
isPricePresetSelected(min, max)      // Check if preset is active
```

### Computed Values
```typescript
showSizeFilter                        // Boolean - show size filter?
filteredBrands                        // Array - brands matching search
activeFiltersCount                    // Number - total active filters
```

## Constants

### Categories
```typescript
CATEGORIES = [
  { id: 'mens-fashion', name: "Men's Fashion" },
  { id: 'womens-fashion', name: "Women's Fashion" },
  { id: 'electronics', name: 'Electronics' },
  { id: 'home-living', name: 'Home & Living' },
  { id: 'sports', name: 'Sports' },
  { id: 'beauty', name: 'Beauty' },
  { id: 'books', name: 'Books' },
]
```

### Price Presets
```typescript
PRICE_PRESETS = [
  { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { id: '200-plus', label: '$200+', min: 200, max: 1000 },
]
```

### Sizes
```typescript
SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
```

### Colors
```typescript
COLORS = [
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  // ... 10 more colors
]
```

### Brands
```typescript
BRANDS = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo',
  'Puma', "Levi's", 'Gap', 'Forever 21', 'Mango',
  'Tommy Hilfiger', 'Calvin Klein', 'Under Armour',
  'New Balance', 'Reebok'
]
```

### Ratings
```typescript
RATINGS = [
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
]
```

## Dependencies

### External Libraries
```typescript
import React, { useState } from 'react'
import { Search, X, Star } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
```

### Radix UI Packages
- @radix-ui/react-accordion
- @radix-ui/react-checkbox
- @radix-ui/react-slider

### Icons
- lucide-react: Search, X, Star

## CSS Classes Structure

### Container
```css
.bg-white                   /* White background */
.rounded-card               /* 24px border radius */
.shadow-card                /* Soft shadow */
.w-full lg:w-80            /* Responsive width */
```

### Header
```css
.p-6                        /* 24px padding */
.border-b border-gray-200  /* Bottom border */
.flex items-center justify-between
```

### Filters Container
```css
.p-6                        /* 24px padding */
.space-y-6                  /* 24px vertical gap */
.max-h-[calc(100vh-200px)] /* Max height */
.overflow-y-auto            /* Scrollable */
```

### Checkbox
```css
.h-5 w-5                                    /* 20px × 20px */
.border-2 border-gray-300                   /* Gray border */
.data-[state=checked]:bg-primary-lime       /* Green when checked */
.data-[state=checked]:border-primary-lime   /* Green border */
```

### Size Button
```css
.h-10                       /* 40px height */
.rounded-button             /* 16px radius */
.border-2                   /* 2px border */
.bg-primary-lime            /* Green when selected */
.text-white                 /* White text when selected */
```

### Color Swatch
```css
.w-10 h-10                  /* 40px × 40px */
.rounded-full               /* Circular */
.border-2                   /* 2px border */
.border-primary-lime        /* Green when selected */
.scale-110                  /* Slightly larger when selected */
```

## Accessibility Features

### ARIA Attributes
- `aria-label` on color swatches
- `role` on interactive elements
- `aria-checked` on checkboxes
- `aria-expanded` on accordion triggers

### Keyboard Navigation
- Tab: Move between filters
- Space/Enter: Toggle selections
- Arrow keys: Navigate within sections
- Escape: Close mobile modal

### Screen Reader Support
- Semantic HTML elements
- Descriptive labels
- State announcements
- Focus management

## Responsive Breakpoints

### Desktop (lg: 1024px+)
- Fixed width: 280px
- Sticky positioning
- Full features visible

### Tablet (md: 768px - 1023px)
- Full width
- Normal flow
- Collapsible sections

### Mobile (< 768px)
- Modal/drawer layout
- Touch-optimized controls
- Bottom action button
- Reduced spacing

## Performance Optimizations

1. **Conditional Rendering**
   - Size filter only shows for clothing categories
   - Brand list filters on search

2. **Event Handling**
   - Minimal re-renders
   - Efficient state updates
   - Debounced search (if needed)

3. **Accordion**
   - Lazy content rendering
   - Smooth animations
   - Optimized transitions

## Browser Compatibility

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- iOS Safari: 14+
- Android Chrome: 90+

## Testing Checklist

- [ ] All filters toggle correctly
- [ ] Clear all resets state
- [ ] Size filter conditional display
- [ ] Price slider updates values
- [ ] Brand search filters list
- [ ] Rating single select
- [ ] Active filter count
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Mobile modal works
- [ ] Responsive at all breakpoints

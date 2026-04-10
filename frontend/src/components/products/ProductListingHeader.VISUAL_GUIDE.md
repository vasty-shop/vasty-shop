# ProductListingHeader - Visual Guide

## Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Product Listing Header                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Showing 1-24 of 156 products    │  [Sort: Featured ▼]  │  [≡][≡≡][≡]   │
│                                    │                       │              │
│  ← Results Count                  │  ← Sort Dropdown      │  ← View      │
│                                    │                       │    Toggles   │
└─────────────────────────────────────────────────────────────────────────┘
│  Active Filters:  [Category: Electronics ✕]  [Price: $50-$100 ✕]  [Clear All]
└─────────────────────────────────────────────────────────────────────────┘
```

## Tablet Layout (640px - 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│                  Product Listing Header                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Showing 1-24 of 156    │  [Sort: Featured ▼]  │            │
│                          │                       │            │
│  ← Results Count        │  ← Sort Dropdown      │            │
│                          │                       │            │
└──────────────────────────────────────────────────────────────┘
│  Active Filters:  [Category: Electronics ✕]  [Price: $50-$100 ✕]
└──────────────────────────────────────────────────────────────┘
```

## Mobile Layout (< 640px)

```
┌───────────────────────────────────────────────┐
│        Product Listing Header                 │
├───────────────────────────────────────────────┤
│                                               │
│  Showing 1-24 of 156    │  [Filters (2)]  [↕]│
│                          │                    │
│  ← Results Count        │  ← Filter  ← Sort  │
│                          │    Button   Icon   │
└───────────────────────────────────────────────┘
│  Active Filters:                              │
│  [Category: Electronics ✕]                    │
│  [Price: $50-$100 ✕]                          │
│  [Color: Black ✕]  [Clear All]                │
└───────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Results Count (Left Section)

```
Showing 1-24 of 156 products
        ──┬─    ──┬──
          │       └── Total products
          └── Current range (start-end)
```

- **Font**: Small, medium weight
- **Color**: Secondary text with bold numbers
- **Always visible**: On all screen sizes

### 2. Sort Dropdown (Center Section)

#### Desktop/Tablet View

```
┌─────────────────────────────────┐
│  ↕  Featured              ▼    │
│  └── Icon   └── Label      └── Chevron
└─────────────────────────────────┘

When clicked:
┌─────────────────────────────────┐
│  ✓  Featured                    │ ← Selected (lime green)
│  ✨  Sparkles icon              │
├─────────────────────────────────┤
│  $  Price: Low to High          │
├─────────────────────────────────┤
│  $  Price: High to Low          │
├─────────────────────────────────┤
│  🕐  Newest Arrivals            │
├─────────────────────────────────┤
│  📈  Best Selling               │
├─────────────────────────────────┤
│  ⭐  Customer Rating            │
└─────────────────────────────────┘
```

#### Mobile View

```
┌──────┐
│  ↕  │  ← Icon only button
└──────┘
```

### 3. View Toggle Buttons (Right Section - Desktop Only)

```
┌───────────────────┐
│ [≡] [≡≡] [≡]     │  ← Toggle group with background
│  │   │    │       │
│  │   │    └── List view
│  │   └── Grid 4 columns (active = lime green bg)
│  └── Grid 3 columns
└───────────────────┘
```

**States**:
- Inactive: Gray icon, transparent background
- Active: Lime green icon, white background with shadow
- Hover: Semi-transparent white background

### 4. Filter Button (Mobile Only)

```
┌──────────────────┐
│ 🎚  Filters  (2) │  ← Button with icon and badge
│  │     │      │   │
│  │     │      └── Badge count
│  │     └── Label
│  └── Icon
└──────────────────┘
```

**Badge**:
- Red background when filters active
- Shows number of active filters
- Small, rounded pill shape

### 5. Active Filters Section

```
┌────────────────────────────────────────────────────────────┐
│  ACTIVE FILTERS:  [Category: Electronics ✕]  [Price: $50-$100 ✕]  Clear All
│                    │                  │                        │
│                    └── Filter pill ───┘                        │
│                                                                 │
│                                                   ← Remove all link
└────────────────────────────────────────────────────────────────┘
```

**Filter Pills**:
```
┌──────────────────────────┐
│  Category: Electronics ✕ │
│  ────┬────   ────┬──── │ │
│      │          │      │ │
│      │          │      └── Remove button
│      │          └── Filter value
│      └── Filter label
└──────────────────────────┘
```

- **Background**: Light gray (gray-50)
- **Border**: Gray-300
- **Text**: Label in secondary color, value in primary
- **Remove button**: X icon that darkens on hover
- **Animation**: Scales in/out when added/removed

## Color Palette

### Primary Colors
- **Lime Green**: `#84cc16` (active states, selected items)
- **Dark Lime**: `#65a30d` (hover states)

### Neutral Colors
- **White**: `#ffffff` (backgrounds)
- **Gray 50**: `#f9fafb` (badge backgrounds)
- **Gray 100**: `#f3f4f6` (toggle group background)
- **Gray 200**: `#e5e7eb` (borders)
- **Gray 300**: `#d1d5db` (filter borders)

### Text Colors
- **Primary**: `#0f172a` (main text)
- **Secondary**: `#64748b` (labels, less important text)

### Accent Colors
- **Sale Red**: `#ef4444` (filter badge, clear all link)

## Spacing & Sizing

### Container
- **Padding**:
  - Mobile: 16px (px-4)
  - Desktop: 24px (px-6)
- **Vertical**: 16px (py-4)

### Elements
- **Sort dropdown height**: 40px (h-10)
- **View toggle buttons**: 40px × 40px
- **Filter button height**: 40px (h-10)
- **Badge size**: 20px (h-5)
- **Filter pills**: Auto height with 6px vertical padding

### Gaps
- **Between sections**: 16px (gap-4)
- **Filter pills**: 8px (gap-2)
- **Icon + text**: 8px (gap-2)

## Interactive States

### Buttons

**Default State**:
```
Background: Transparent/White
Border: Gray-200
Text: Gray-600
```

**Hover State**:
```
Background: Gray-100 / White
Border: Gray-300
Scale: Slightly larger (1.02)
```

**Active State**:
```
Background: White (with shadow)
Text/Icon: Lime Green
Scale: Normal
```

**Pressed State**:
```
Scale: 0.95 (tap feedback)
```

### Animations

**Filter Pills**:
- **Enter**: Scale from 0.8 to 1, opacity 0 to 1 (150ms)
- **Exit**: Scale from 1 to 0.8, opacity 1 to 0 (150ms)

**Active Filters Section**:
- **Expand**: Height auto, opacity 0 to 1 (200ms)
- **Collapse**: Height 0, opacity 1 to 0 (200ms)

**View Toggle**:
- **Tap**: Scale to 0.95 (immediate)
- **Release**: Scale back to 1 (spring animation)

## Responsive Behavior

### Breakpoint: 640px (sm)

**Hide**:
- Full sort dropdown text

**Show**:
- Icon-only sort button

### Breakpoint: 1024px (lg)

**Hide**:
- Filter button
- View toggle buttons

**Show**:
- Full sort dropdown
- View mode toggles
- Desktop layout spacing

## Z-Index Layers

```
Layer 50: Dropdown menu
Layer 40: Sticky header
Layer 10: View toggle active buttons
Layer 1:  Other UI elements
```

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys to navigate dropdown
- Escape to close dropdown

### Screen Reader Support
- Proper ARIA labels on all buttons
- Descriptive text for icon-only buttons
- Live region for filter changes
- Semantic HTML structure

### Focus States
- Clear 2px lime green ring on focus
- High contrast for visibility
- Skip visible on keyboard focus

## Usage in Different Contexts

### E-commerce Product Listing
```tsx
<ProductListingHeader
  totalProducts={1247}
  currentStart={1}
  currentEnd={24}
  sortBy="best-selling"
  viewMode="grid-4"
  activeFilters={[
    { type: 'category', label: 'Category', value: 'Electronics' },
    { type: 'brand', label: 'Brand', value: 'Apple' }
  ]}
  {...handlers}
/>
```

### Search Results
```tsx
<ProductListingHeader
  totalProducts={89}
  currentStart={1}
  currentEnd={20}
  sortBy="rating"
  viewMode="list"
  activeFilters={[
    { type: 'search', label: 'Search', value: 'laptop' }
  ]}
  {...handlers}
/>
```

### Category Page
```tsx
<ProductListingHeader
  totalProducts={543}
  currentStart={25}
  currentEnd={48}
  sortBy="featured"
  viewMode="grid-3"
  activeFilters={[]}
  {...handlers}
/>
```

## Performance Considerations

- Animations use `transform` and `opacity` for GPU acceleration
- No layout thrashing from re-renders
- Icons are tree-shaken from lucide-react
- Minimal re-renders with proper memoization
- Conditional rendering for mobile/desktop elements

## Testing Checklist

- [ ] Results count updates correctly
- [ ] All sort options selectable
- [ ] View mode toggles work
- [ ] Filter removal works individually
- [ ] Clear all removes all filters
- [ ] Mobile filter button opens drawer
- [ ] Responsive layout switches correctly
- [ ] Animations smooth on all devices
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Touch targets adequate on mobile (min 44px)

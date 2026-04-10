# ProductInfo Component - Visual Guide

This guide provides a visual reference for the ProductInfo component layout and features.

## Component Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Home / Product details                  [Breadcrumb] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [Men Fashion]                          [Category Badge] │
│                                                           │
│  Loose Fit Hoodie                           [Title H1]  │
│                                                           │
│  $24.99  $49.99 [-50%]                  [Price + Sale]  │
│                                                           │
│  ★ 4.5 (80 reviews)                     [Rating + Count]│
│                                                           │
│  In Stock / Low Stock / Out of Stock  [Stock Status]    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  🕐 Order in 03:20:25 to get next day delivery          │
│                                          [Delivery Timer]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Select Size                              [Size Guide]   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                         │
│  │ S │ │ M │ │ L │ │XL │ │XXL│          [Size Pills]   │
│  └───┘ └───┘ └───┘ └───┘ └───┘                         │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Select Color: Black                                     │
│  ○  ●  ○  ○                            [Color Swatches] │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Quantity                                                 │
│  ┌───┬────┬───┐                                          │
│  │ - │ 1  │ + │                      [Quantity Selector] │
│  └───┴────┴───┘                                          │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐ ┌────┐ ┌────┐                     │
│  │  Add to Cart     │ │ ♡  │ │ ⤴  │   [Action Buttons]  │
│  └──────────────────┘ └────┘ └────┘                     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ▼ Description & Fit                    [Accordion 1]   │
│  ─────────────────────────────────────────────────────  │
│  ▼ Shipping                              [Accordion 2]   │
│  ─────────────────────────────────────────────────────  │
│  ▼ Material & Care                       [Accordion 3]   │
│  ─────────────────────────────────────────────────────  │
│  ▼ Size & Fit                            [Accordion 4]   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Component Sections

### 1. Breadcrumb Navigation
```
← Home / Product details
```
- Back arrow for navigation
- Shows current location
- Clickable to go back

### 2. Product Header
```
[Men Fashion]                    ← Category badge (pill style)

Loose Fit Hoodie                 ← Product title (large, bold)

$24.99  $49.99  [-50%]          ← Sale price, original price, discount
      ↑       ↑        ↑
   Current  Original  Badge

★ 4.5 (80 reviews)              ← Rating with star icon

In Stock                         ← Stock status
  ↑
Green for in stock
Orange for low stock
Red for out of stock
```

### 3. Delivery Timer
```
┌──────────────────────────────────────────────┐
│ 🕐 Order in 03:20:25 to get next day delivery│
│             └─ Real-time countdown            │
└──────────────────────────────────────────────┘

States:
- Blue background when > 1 hour remaining
- Orange background when < 1 hour (urgent)
- Updates every second
- Not shown when out of stock
```

### 4. Size Selector
```
Select Size                         Size Guide →

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│  S  │ │  M  │ │  L  │ │ XL  │ │ XXL │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   ↑       ↑       ↑       ↑       ↑
Available  Selected  Available  Available  Out of Stock
(white)   (black)    (white)    (white)    (gray)

- Selected: Black background, white text
- Available: White background, hover effect
- Out of stock: Gray background, disabled
- Shows stock count on hover
```

### 5. Color Selector
```
Select Color: Black
     ↑
  Shows selected color name

●    ○    ○    ○
↑    ↑    ↑    ↑
Selected  Available  Available  Unavailable

- Selected: Bold border + ring
- Available: Thin border
- Unavailable: Faded opacity
- Hover to see color name
```

### 6. Quantity Selector
```
Quantity

┌─────┬──────┬─────┐
│  -  │  1   │  +  │
└─────┴──────┴─────┘
  ↑      ↑      ↑
Decrease Current Increase

- Min: 1
- Max: Stock count
- Number input in center
- Buttons disabled at limits
```

### 7. Action Buttons
```
┌────────────────────────┐  ┌──────┐  ┌──────┐
│    Add to Cart         │  │  ♡   │  │  ⤴   │
└────────────────────────┘  └──────┘  └──────┘
        ↑                      ↑         ↑
    Primary CTA            Wishlist    Share
    (Black button)         (Outline)  (Optional)

States:
- Add to Cart: Disabled if no size selected or out of stock
- Wishlist: Red fill when wishlisted
- Share: Optional, shows share icon
```

### 8. Product Accordions

#### Description & Fit
```
▼ ℹ️  Description & Fit

  This loose fit hoodie is designed for maximum comfort...

  Fit Information:
  • Fit: Loose Fit
  • Model Height: 6'1" / 185 cm
  • Model is wearing size: M
```

#### Shipping
```
▼ 🚚 Shipping

  📅 Delivery Date
     Deliver by 10 October 2024 - 12 October 2024

  📦 Package Type
     Regular Package

  🚛 Delivery Time
     3-4 Working Days
```

#### Material & Care
```
▼ 👕 Material & Care

  Fabric:
  Premium Cotton Blend

  Composition:
  • 80% Cotton
  • 20% Polyester

  Care Instructions:
  • Machine wash cold
  • Do not bleach
  • Tumble dry low
  • Iron on low heat if needed
  • Do not dry clean
```

#### Size & Fit
```
▼ 📏 Size & Fit

  Fit Type: Loose Fit

  Model Measurements:
  • Height: 6'1" / 185 cm
  • Wearing Size: M

  View Full Size Guide →
```

## Color Palette

### Brand Colors (Fluxez)
- **Primary Lime**: `#84cc16` - Used for icons, accents
- **Lime Dark**: `#65a30d` - Hover states
- **Card Black**: `#0f172a` - Selected states, primary buttons
- **Card Dark**: `#1f2937` - Hover on black buttons

### Text Colors
- **Primary**: `#0f172a` - Headings, important text
- **Secondary**: `#64748b` - Body text, descriptions

### Status Colors
- **In Stock**: `text-green-600` (#16a34a)
- **Low Stock**: `text-orange-600` (#ea580c)
- **Out of Stock**: `text-red-600` (#dc2626)
- **Sale Badge**: `#ef4444` (Red)

### Timer States
- **Normal** (>1hr): Blue background (`bg-blue-50`, `border-blue-200`)
- **Urgent** (<1hr): Orange background (`bg-orange-50`, `border-orange-200`)

## Typography

```
Product Title:      32px, Bold (text-3xl font-bold)
Price:              32px, Bold (text-3xl font-bold)
Original Price:     20px, Line-through (text-xl line-through)
Section Labels:     14px, Semibold (text-sm font-semibold)
Body Text:          16px, Regular (text-base)
Buttons:            14px, Medium (text-sm font-medium)
Size Pills:         14px, Medium (text-sm font-medium)
Breadcrumb:         14px, Regular (text-sm)
```

## Spacing

```
Component Container:     space-y-6 (24px between sections)
Section Internal:        space-y-3 (12px within sections)
Button Padding:          px-6 py-3 (24px x 12px)
Size Pills Padding:      px-4 py-2.5 (16px x 10px)
Accordion Padding:       py-4 (16px vertical)
```

## Interactive States

### Size Pills
```
Default:    white bg, gray-200 border
Hover:      gray-400 border, scale-105
Active:     scale-95
Selected:   black bg, white text
Disabled:   gray-100 bg, opacity-50, cursor-not-allowed
```

### Color Swatches
```
Default:    gray-300 border
Hover:      gray-500 border, scale-110
Active:     scale-95
Selected:   black border, ring-2 ring-offset-2
Disabled:   opacity-40, cursor-not-allowed
```

### Buttons
```
Primary (Add to Cart):
  Default:   bg-card-black, white text
  Hover:     bg-card-dark
  Disabled:  opacity-50, pointer-events-none

Outline (Wishlist/Share):
  Default:   white bg, border, gray text
  Hover:     gray-100 bg
  Wishlisted: red-50 bg, red-200 border, red-500 icon
```

## Responsive Behavior

### Mobile (<640px)
- Stack all elements vertically
- Full-width buttons
- Smaller size pills (wrap to multiple rows)
- Reduced padding and spacing
- Compact accordion headers

### Tablet (640px-1024px)
- Same vertical layout
- Slightly larger interactive elements
- More comfortable spacing

### Desktop (>1024px)
- Maximum width container (max-w-2xl)
- Optimal spacing for readability
- Larger touch targets
- Side-by-side layout possible when paired with image gallery

## Animation & Transitions

```css
Hover Scale:        transform: scale(1.05)
Active Scale:       transform: scale(0.95)
Color Transitions:  transition-colors
All Transitions:    transition-all
Accordion:          animate-accordion-down/up
Timer Update:       Real-time (1s interval)
```

## Accessibility Features

- Semantic HTML (`<button>`, `<label>`, etc.)
- Disabled states properly communicated
- Focus visible styles
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly text
- Color contrast ratios meet WCAG standards

## Usage Context

This component is typically used on:
- Product Detail Pages (PDP)
- Quick View modals
- Product comparison views

It pairs well with:
- ProductImageGallery (left side)
- ReviewsSection (below)
- RelatedProducts (below)
- ProductTabs (alternative layout)

## File Location

```
/src/components/products/ProductInfo.tsx
/src/components/products/ProductInfo.example.tsx
/src/components/products/ProductInfo.README.md
```

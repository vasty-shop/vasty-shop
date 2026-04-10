# BreadcrumbNavigation Component

A reusable, accessible breadcrumb navigation component for the Fluxez e-commerce platform.

## Overview

The `BreadcrumbNavigation` component provides a clean, semantic way to display hierarchical page location to users. It's built with accessibility in mind, using proper ARIA attributes and semantic HTML.

## Features

- ✅ **Semantic HTML**: Uses `<nav>`, `<ol>`, and `<li>` elements
- ✅ **Fully Accessible**: ARIA labels, keyboard navigation, focus indicators
- ✅ **Responsive Design**: Auto-truncates on mobile, horizontal scroll support
- ✅ **Customizable**: Custom icons, separators, and styling options
- ✅ **TypeScript**: Fully typed with exported interfaces
- ✅ **Fluxez Branding**: Matches brand colors (primary-lime, text-secondary)
- ✅ **Production Ready**: Error handling, edge cases covered

## Installation

The component is located at:
```
/frontend/src/components/layout/BreadcrumbNavigation.tsx
```

## Basic Usage

```tsx
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';

function ProductPage() {
  return (
    <BreadcrumbNavigation
      items={[
        { label: 'Products', href: '/products' },
        { label: "Men's Fashion", href: '/products/mens' },
        { label: 'Premium Wool Overcoat' }
      ]}
    />
  );
}
```

## Props

### BreadcrumbNavigationProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | **Required** | Array of breadcrumb items to display |
| `className` | `string` | `undefined` | Optional CSS classes for custom styling |
| `showHomeIcon` | `boolean` | `true` | Show/hide the home icon |
| `homePath` | `string` | `'/'` | Custom home page path |
| `separator` | `React.ReactNode` | `<ChevronRight />` | Custom separator between items |

### BreadcrumbItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **Required** | Display text for the breadcrumb |
| `href` | `string` | `undefined` | Optional URL - if not provided, item is not clickable |
| `icon` | `React.ReactNode` | `undefined` | Optional icon to display alongside the label |

## Examples

### 1. Basic Product Navigation
```tsx
<BreadcrumbNavigation
  items={[
    { label: 'Products', href: '/products' },
    { label: "Men's Fashion", href: '/products/mens' },
    { label: 'Premium Wool Overcoat' }
  ]}
/>
```
**Result**: `Home / Products / Men's Fashion / Premium Wool Overcoat`

### 2. Multi-level Categories
```tsx
<BreadcrumbNavigation
  items={[
    { label: 'Categories', href: '/categories' },
    { label: 'Electronics', href: '/categories/electronics' },
    { label: 'Laptops', href: '/categories/electronics/laptops' },
    { label: 'Gaming Laptops' }
  ]}
/>
```
**Result**: `Home / Categories / Electronics / Laptops / Gaming Laptops`

### 3. With Custom Icons
```tsx
import { ShoppingBag, Shirt, Package } from 'lucide-react';

<BreadcrumbNavigation
  items={[
    {
      label: 'Products',
      href: '/products',
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      label: 'Clothing',
      href: '/products/clothing',
      icon: <Shirt className="w-4 h-4" />
    },
    {
      label: 'Winter Collection 2024',
      icon: <Package className="w-4 h-4" />
    }
  ]}
/>
```

### 4. Without Home Icon
```tsx
<BreadcrumbNavigation
  showHomeIcon={false}
  items={[
    { label: 'Blog', href: '/blog' },
    { label: 'Fashion Tips', href: '/blog/fashion-tips' },
    { label: 'How to Style Your Winter Wardrobe' }
  ]}
/>
```
**Result**: `Home / Blog / Fashion Tips / How to Style Your Winter Wardrobe`

### 5. Custom Home Path
```tsx
<BreadcrumbNavigation
  homePath="/shop"
  items={[
    { label: 'New Arrivals', href: '/shop/new' },
    { label: 'Designer Collection' }
  ]}
/>
```

### 6. Custom Separator
```tsx
<BreadcrumbNavigation
  separator={<span className="text-gray-400">&gt;</span>}
  items={[
    { label: 'Products', href: '/products' },
    { label: 'Sale Items' }
  ]}
/>
```

## Styling

### Default Styles
- **Home Link**: Gray text, lime green on hover
- **Breadcrumb Links**: Gray text, lime green on hover
- **Current Page**: Bold, dark text (not clickable)
- **Separators**: Light gray chevron icons

### Responsive Behavior
- **Desktop**: Full breadcrumb trail visible
- **Tablet**: Text truncates if necessary
- **Mobile**:
  - Home text hidden (icon only)
  - Long labels truncate to max-width
  - Horizontal scroll enabled if too long

### Custom Styling
You can pass custom classes via the `className` prop:

```tsx
<BreadcrumbNavigation
  className="bg-gray-100 rounded-lg"
  items={items}
/>
```

## Accessibility

The component follows web accessibility best practices:

1. **Semantic HTML**: Uses `<nav>`, `<ol>`, `<li>` elements
2. **ARIA Labels**:
   - `aria-label="Breadcrumb"` on nav element
   - `aria-current="page"` on current page
   - `aria-hidden="true"` on separators
3. **Keyboard Navigation**:
   - All links are focusable
   - Visible focus indicators with ring-2
   - Tab navigation works properly
4. **Screen Reader Support**: Properly announced navigation structure

## Integration with React Router

The component uses React Router's `Link` component for navigation:

```tsx
import { Link } from 'react-router-dom';
```

Make sure your app is wrapped with a Router:

```tsx
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter>
  <App />
</BrowserRouter>
```

## TypeScript Support

The component is fully typed. Import the interfaces if needed:

```tsx
import {
  BreadcrumbNavigation,
  BreadcrumbItem,
  BreadcrumbNavigationProps
} from '@/components/layout/BreadcrumbNavigation';

const items: BreadcrumbItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'New Arrivals' }
];
```

## Common Use Cases

### Product Detail Page
```tsx
<BreadcrumbNavigation
  items={[
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/products/${product.category}` },
    { label: product.name }
  ]}
/>
```

### Category Page
```tsx
<BreadcrumbNavigation
  items={[
    { label: 'Categories', href: '/categories' },
    { label: categoryName }
  ]}
/>
```

### Search Results
```tsx
<BreadcrumbNavigation
  items={[
    { label: 'Search Results', href: '/search' },
    { label: `"${searchQuery}"` }
  ]}
/>
```

### User Account
```tsx
<BreadcrumbNavigation
  items={[
    { label: 'Account', href: '/account' },
    { label: 'Orders', href: '/account/orders' },
    { label: `Order #${orderId}` }
  ]}
/>
```

## Best Practices

1. **Keep it Simple**: Don't include more than 5-6 levels
2. **Last Item Non-Clickable**: The current page should not have an `href`
3. **Consistent Naming**: Use consistent labels across the site
4. **Mobile First**: Test on mobile to ensure truncation works
5. **Meaningful Labels**: Use clear, descriptive text for each level

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Related Components

- `Header` - Main navigation header
- `Footer` - Site footer
- `BottomNav` - Mobile bottom navigation

## License

Part of the Fluxez e-commerce platform.

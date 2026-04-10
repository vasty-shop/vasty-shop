# ProductInfo Component

A comprehensive, feature-rich product information and selector component for e-commerce applications. Designed for the Fluxez shop with focus on user experience, accessibility, and mobile responsiveness.

## Features

### Core Features
- **Product Header** - Category badge, title, price display with sale pricing, star ratings, and stock status
- **Breadcrumb Navigation** - Easy navigation back to previous pages
- **Real-time Delivery Timer** - Countdown timer with urgency indicators for next-day delivery
- **Size Selector** - Interactive size pills with availability status and stock counts
- **Color Selector** - Visual color swatches with selection states
- **Quantity Selector** - Input with increment/decrement controls
- **Action Buttons** - Add to cart, wishlist, and share functionality
- **Expandable Accordions** - Detailed product information sections

### UI/UX Features
- Clean, organized layout with Fluxez brand colors (lime green accents)
- Smooth animations and transitions
- Hover effects on interactive elements
- Mobile responsive design
- Disabled states for out-of-stock items
- Visual feedback for user interactions
- Trust badges and informative icons

## Installation

The component is part of the Fluxez product components system. Import from the products index:

```tsx
import { ProductInfo } from '@/components/products';
import type { ProductInfoData } from '@/components/products';
```

## Basic Usage

```tsx
import { ProductInfo } from '@/components/products';
import type { ProductInfoData } from '@/components/products';

function ProductPage() {
  const [selectedSize, setSelectedSize] = React.useState<Size>();
  const [selectedColor, setSelectedColor] = React.useState<string>();
  const [quantity, setQuantity] = React.useState(1);

  const productData: ProductInfoData = {
    product: {
      id: '1',
      name: 'Loose Fit Hoodie',
      brand: 'Urban Style',
      price: 49.99,
      salePrice: 24.99,
      discountPercent: 50,
      images: ['/images/hoodie-1.jpg'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      rating: 4.5,
      category: 'Men Fashion',
    },
    stockStatus: 'in_stock',
    stockCount: 15,
    reviewCount: 80,
    deliveryInfo: {
      cutoffTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      estimatedDeliveryStart: '10 October 2024',
      estimatedDeliveryEnd: '12 October 2024',
      deliveryDays: '3-4 Working Days',
      packageType: 'Regular Package',
    },
    sizeAvailability: [
      { size: 'S', available: true, stockCount: 5 },
      { size: 'M', available: true, stockCount: 8 },
      { size: 'L', available: true, stockCount: 12 },
      { size: 'XL', available: true, stockCount: 7 },
      { size: 'XXL', available: false },
    ],
  };

  return (
    <ProductInfo
      data={productData}
      selectedSize={selectedSize}
      selectedColor={selectedColor}
      quantity={quantity}
      onSizeSelect={setSelectedSize}
      onColorSelect={setSelectedColor}
      onQuantityChange={setQuantity}
      onAddToCart={() => console.log('Add to cart')}
    />
  );
}
```

## Props API

### ProductInfoProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `ProductInfoData` | Yes | Complete product information object |
| `selectedSize` | `Size` | No | Currently selected size |
| `selectedColor` | `string` | No | Currently selected color name |
| `quantity` | `number` | No | Current quantity (default: 1) |
| `isWishlisted` | `boolean` | No | Whether product is in wishlist |
| `onSizeSelect` | `(size: Size) => void` | No | Size selection callback |
| `onColorSelect` | `(color: string) => void` | No | Color selection callback |
| `onQuantityChange` | `(quantity: number) => void` | No | Quantity change callback |
| `onAddToCart` | `() => void` | No | Add to cart callback |
| `onWishlistToggle` | `() => void` | No | Wishlist toggle callback |
| `onShare` | `() => void` | No | Share button callback |
| `onBack` | `() => void` | No | Breadcrumb back navigation callback |
| `className` | `string` | No | Additional CSS classes |

### ProductInfoData

```typescript
interface ProductInfoData {
  product: Product;
  stockStatus: StockStatus;
  stockCount?: number;
  reviewCount: number;
  deliveryInfo: DeliveryInfo;
  colors?: ColorOption[];
  sizeAvailability: SizeAvailability[];
  materialInfo?: MaterialInfo;
  fitInfo?: FitInfo;
  description?: string;
}
```

### Supporting Types

```typescript
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface DeliveryInfo {
  cutoffTime: Date;
  estimatedDeliveryStart: string;
  estimatedDeliveryEnd: string;
  deliveryDays: string;
  packageType: string;
}

interface ColorOption {
  name: string;
  hexCode: string;
  available: boolean;
}

interface SizeAvailability {
  size: Size;
  available: boolean;
  stockCount?: number;
}

interface MaterialInfo {
  fabric: string;
  composition: string[];
  careInstructions: string[];
}

interface FitInfo {
  fit: string;
  modelHeight: string;
  modelSize: string;
  sizeGuideUrl?: string;
}
```

## Sub-Components

The ProductInfo component is composed of several sub-components that can be used independently:

### Breadcrumb
```tsx
import { Breadcrumb } from '@/components/products';

<Breadcrumb onBack={() => navigate(-1)} />
```

### ProductHeader
```tsx
import { ProductHeader } from '@/components/products';

<ProductHeader
  product={product}
  category="Men Fashion"
  reviewCount={80}
  stockStatus="in_stock"
  stockCount={15}
/>
```

### DeliveryTimer
```tsx
import { DeliveryTimer } from '@/components/products';

<DeliveryTimer deliveryInfo={deliveryInfo} />
```

### SizeSelector
```tsx
import { SizeSelector } from '@/components/products';

<SizeSelector
  sizes={sizeAvailability}
  selectedSize={selectedSize}
  onSizeSelect={setSelectedSize}
/>
```

### ColorSelector
```tsx
import { ColorSelector } from '@/components/products';

<ColorSelector
  colors={colors}
  selectedColor={selectedColor}
  onColorSelect={setSelectedColor}
/>
```

### QuantitySelector
```tsx
import { QuantitySelector } from '@/components/products';

<QuantitySelector
  value={quantity}
  min={1}
  max={stockCount}
  onChange={setQuantity}
/>
```

### ActionButtons
```tsx
import { ActionButtons } from '@/components/products';

<ActionButtons
  isWishlisted={isWishlisted}
  onAddToCart={handleAddToCart}
  onWishlistToggle={handleWishlistToggle}
  onShare={handleShare}
/>
```

### ProductAccordions
```tsx
import { ProductAccordions } from '@/components/products';

<ProductAccordions
  description={description}
  deliveryInfo={deliveryInfo}
  materialInfo={materialInfo}
  fitInfo={fitInfo}
/>
```

## Advanced Examples

### With React Router Integration

```tsx
import { useNavigate, useParams } from 'react-router-dom';
import { ProductInfo } from '@/components/products';

function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [selectedSize, setSelectedSize] = React.useState<Size>();

  // Fetch product data
  const { data, loading } = useProductQuery(productId);

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: data.product,
      size: selectedSize,
      quantity,
    }));
    navigate('/cart');
  };

  return (
    <ProductInfo
      data={data}
      selectedSize={selectedSize}
      onSizeSelect={setSelectedSize}
      onAddToCart={handleAddToCart}
      onBack={() => navigate(-1)}
    />
  );
}
```

### With State Management (Zustand)

```tsx
import { ProductInfo } from '@/components/products';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

function ProductPage({ productData }: { productData: ProductInfoData }) {
  const addToCart = useCartStore((state) => state.addItem);
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const [selectedSize, setSelectedSize] = React.useState<Size>();
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = () => {
    addToCart({
      product: productData.product,
      size: selectedSize!,
      quantity,
    });
  };

  return (
    <ProductInfo
      data={productData}
      selectedSize={selectedSize}
      quantity={quantity}
      isWishlisted={isWishlisted(productData.product.id)}
      onSizeSelect={setSelectedSize}
      onQuantityChange={setQuantity}
      onAddToCart={handleAddToCart}
      onWishlistToggle={() => toggleWishlist(productData.product.id)}
    />
  );
}
```

### Low Stock Urgency

```tsx
const productData: ProductInfoData = {
  // ... other fields
  stockStatus: 'low_stock',
  stockCount: 3,
  deliveryInfo: {
    cutoffTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
    // ... other delivery info
  },
};

// Timer will show in orange when < 1 hour
// Stock status will show "Only 3 left in stock"
```

### Out of Stock Handling

```tsx
const productData: ProductInfoData = {
  // ... other fields
  stockStatus: 'out_of_stock',
  sizeAvailability: [
    { size: 'S', available: false },
    { size: 'M', available: false },
    // ... all sizes unavailable
  ],
};

// Add to cart button will be disabled
// Delivery timer won't be shown
// Size buttons will be grayed out
```

## Styling

The component uses Tailwind CSS with custom Fluxez brand colors:

- **Primary Accent**: Lime green (`#84cc16`)
- **Text Colors**: Dark slate for primary, gray for secondary
- **Interactive States**: Hover, active, and disabled states
- **Responsive**: Mobile-first design

### Custom Styling

```tsx
<ProductInfo
  className="bg-gray-50 p-6 rounded-2xl"
  data={productData}
  // ... other props
/>
```

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus states on interactive elements
- Disabled states properly communicated
- Screen reader friendly

## Performance

- Real-time countdown timer optimized with cleanup
- Conditional rendering for optional sections
- Memoization opportunities for callbacks
- Lazy loading compatible

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

## Dependencies

- `react` - React library
- `lucide-react` - Icon library
- `@radix-ui/react-accordion` - Accordion primitive
- `@/components/ui/button` - Button component
- `@/components/ui/badge` - Badge component
- `@/lib/utils` - Utility functions (cn, formatPrice)

## Related Components

- **ProductCard** - Grid/list product cards
- **ProductGrid** - Product grid layouts
- **ProductImageGallery** - Product image viewer
- **ReviewsSection** - Customer reviews
- **RelatedProducts** - Product recommendations

## Examples

See `ProductInfo.example.tsx` for complete working examples including:
- Basic usage
- Low stock scenarios
- Out of stock handling
- Products without color options
- Router integration
- All examples showcase

## Contributing

When extending this component:
1. Maintain TypeScript type safety
2. Follow existing naming conventions
3. Update types as needed
4. Test all interactive states
5. Ensure mobile responsiveness
6. Update documentation

## License

Part of the Fluxez shop frontend application.

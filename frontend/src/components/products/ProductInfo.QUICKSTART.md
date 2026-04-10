# ProductInfo Component - Quick Start Guide

Get started with the ProductInfo component in 5 minutes.

## Step 1: Import the Component

```tsx
import { ProductInfo } from '@/components/products';
import type { ProductInfoData } from '@/components/products';
```

## Step 2: Set Up State

```tsx
import { useState } from 'react';
import type { Size } from '@/types/product';

function ProductPage() {
  const [selectedSize, setSelectedSize] = useState<Size>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ... rest of component
}
```

## Step 3: Prepare Product Data

```tsx
const productData: ProductInfoData = {
  // Basic product info (from your API/database)
  product: {
    id: '1',
    name: 'Loose Fit Hoodie',
    brand: 'Urban Style',
    price: 49.99,
    salePrice: 24.99,        // Optional
    discountPercent: 50,      // Optional
    images: ['/images/hoodie-1.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.5,
    category: 'Men Fashion',
  },

  // Stock information
  stockStatus: 'in_stock',   // 'in_stock' | 'low_stock' | 'out_of_stock'
  stockCount: 15,            // Optional - shown for low stock
  reviewCount: 80,

  // Delivery information
  deliveryInfo: {
    cutoffTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    estimatedDeliveryStart: '10 October 2024',
    estimatedDeliveryEnd: '12 October 2024',
    deliveryDays: '3-4 Working Days',
    packageType: 'Regular Package',
  },

  // Size availability (required)
  sizeAvailability: [
    { size: 'S', available: true, stockCount: 5 },
    { size: 'M', available: true, stockCount: 8 },
    { size: 'L', available: true, stockCount: 12 },
    { size: 'XL', available: true, stockCount: 7 },
    { size: 'XXL', available: false },
  ],

  // Optional: Colors
  colors: [
    { name: 'Black', hexCode: '#000000', available: true },
    { name: 'Navy', hexCode: '#1e3a8a', available: true },
    { name: 'Gray', hexCode: '#6b7280', available: true },
  ],

  // Optional: Material info
  materialInfo: {
    fabric: 'Premium Cotton Blend',
    composition: ['80% Cotton', '20% Polyester'],
    careInstructions: [
      'Machine wash cold',
      'Do not bleach',
      'Tumble dry low',
    ],
  },

  // Optional: Fit info
  fitInfo: {
    fit: 'Loose Fit',
    modelHeight: '6\'1" / 185 cm',
    modelSize: 'M',
  },

  // Optional: Description
  description: 'This loose fit hoodie is designed for maximum comfort...',
};
```

## Step 4: Add Event Handlers

```tsx
const handleAddToCart = () => {
  // Your cart logic here
  console.log('Adding to cart:', {
    product: productData.product,
    size: selectedSize,
    color: selectedColor,
    quantity,
  });

  // Example: dispatch to state management
  // dispatch(addToCart({ product, size, color, quantity }));

  // Example: navigate to cart
  // navigate('/cart');
};

const handleWishlistToggle = () => {
  setIsWishlisted(!isWishlisted);

  // Your wishlist logic here
  // dispatch(toggleWishlist(productData.product.id));
};

const handleShare = () => {
  // Native share API or custom share logic
  if (navigator.share) {
    navigator.share({
      title: productData.product.name,
      url: window.location.href,
    });
  }
};

const handleBack = () => {
  // Navigation logic
  // navigate(-1);
  // or navigate('/products');
};
```

## Step 5: Render the Component

```tsx
return (
  <div className="max-w-2xl mx-auto p-6">
    <ProductInfo
      data={productData}
      selectedSize={selectedSize}
      selectedColor={selectedColor}
      quantity={quantity}
      isWishlisted={isWishlisted}
      onSizeSelect={setSelectedSize}
      onColorSelect={setSelectedColor}
      onQuantityChange={setQuantity}
      onAddToCart={handleAddToCart}
      onWishlistToggle={handleWishlistToggle}
      onShare={handleShare}
      onBack={handleBack}
    />
  </div>
);
```

## Complete Example

```tsx
import { useState } from 'react';
import { ProductInfo } from '@/components/products';
import type { ProductInfoData } from '@/components/products';
import type { Size } from '@/types/product';

export function ProductDetailPage() {
  // State
  const [selectedSize, setSelectedSize] = useState<Size>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Data (in real app, this would come from API)
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

  // Handlers
  const handleAddToCart = () => {
    alert(`Added ${quantity} ${selectedSize} to cart!`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ProductInfo
        data={productData}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
        isWishlisted={isWishlisted}
        onSizeSelect={setSelectedSize}
        onColorSelect={setSelectedColor}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
      />
    </div>
  );
}
```

## Common Patterns

### With Loading State
```tsx
function ProductPage({ productId }: { productId: string }) {
  const { data, loading } = useProduct(productId);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Product not found</div>;

  return <ProductInfo data={data} {...handlers} />;
}
```

### With Error Handling
```tsx
function ProductPage({ productId }: { productId: string }) {
  const { data, loading, error } = useProduct(productId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NotFound />;

  return <ProductInfo data={data} {...handlers} />;
}
```

### With React Router
```tsx
import { useNavigate } from 'react-router-dom';

function ProductPage() {
  const navigate = useNavigate();

  return (
    <ProductInfo
      data={productData}
      onBack={() => navigate(-1)}
      onAddToCart={() => {
        addToCart();
        navigate('/cart');
      }}
    />
  );
}
```

### With State Management (Zustand)
```tsx
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

function ProductPage({ productData }: { productData: ProductInfoData }) {
  const addToCart = useCartStore(s => s.addItem);
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  return (
    <ProductInfo
      data={productData}
      isWishlisted={isWishlisted(productData.product.id)}
      onAddToCart={() => addToCart({
        product: productData.product,
        size: selectedSize,
        quantity,
      })}
      onWishlistToggle={() => toggleWishlist(productData.product.id)}
    />
  );
}
```

## Tips & Best Practices

### 1. Always Validate Size Selection
```tsx
const handleAddToCart = () => {
  if (!selectedSize) {
    alert('Please select a size');
    return;
  }
  // Add to cart logic
};
```

### 2. Calculate Delivery Cutoff Time
```tsx
// Set cutoff to today at 6 PM
const cutoffTime = new Date();
cutoffTime.setHours(18, 0, 0, 0);

// If past 6 PM, set to tomorrow 6 PM
if (new Date() > cutoffTime) {
  cutoffTime.setDate(cutoffTime.getDate() + 1);
}
```

### 3. Handle Out of Stock
```tsx
const productData: ProductInfoData = {
  // ...
  stockStatus: 'out_of_stock',
  sizeAvailability: sizes.map(size => ({
    size,
    available: false,
  })),
};
```

### 4. Simplify for Products Without Colors
```tsx
const productData: ProductInfoData = {
  // ...
  // Just don't include the colors field
  // colors: undefined,  // or omit entirely
};
```

### 5. Show Low Stock Urgency
```tsx
const productData: ProductInfoData = {
  // ...
  stockStatus: 'low_stock',
  stockCount: 3,  // Will show "Only 3 left in stock"
  deliveryInfo: {
    cutoffTime: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
    // ... (timer will show in orange)
  },
};
```

## Troubleshooting

### Issue: TypeScript errors on import
**Solution**: Ensure you're importing from the correct path:
```tsx
import { ProductInfo } from '@/components/products';
```

### Issue: Component doesn't render
**Solution**: Check that all required data is provided:
- `product` object is complete
- `sizeAvailability` array exists
- `deliveryInfo` object is complete

### Issue: Add to Cart button is disabled
**Solution**: Make sure:
- `selectedSize` is set
- `stockStatus` is not `'out_of_stock'`
- `onAddToCart` handler is provided

### Issue: Timer doesn't update
**Solution**: Ensure `deliveryInfo.cutoffTime` is a valid Date object:
```tsx
cutoffTime: new Date(Date.now() + 3 * 60 * 60 * 1000) // ✅ Good
cutoffTime: '2024-10-26T18:00:00' // ❌ Bad (string, not Date)
```

## Next Steps

1. **See full examples**: Check `ProductInfo.example.tsx`
2. **Read documentation**: See `ProductInfo.README.md`
3. **View visual guide**: See `ProductInfo.VISUAL_GUIDE.md`
4. **Customize styling**: Modify Tailwind classes
5. **Add features**: Extend component as needed

## Need Help?

- **Full API Reference**: See `ProductInfo.README.md`
- **Visual Reference**: See `ProductInfo.VISUAL_GUIDE.md`
- **Examples**: See `ProductInfo.example.tsx`
- **Types**: See inline TypeScript definitions

Happy coding! 🚀

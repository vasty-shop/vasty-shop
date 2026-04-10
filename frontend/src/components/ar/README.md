# ARTryOnModal Component

A professional, full-screen AR try-on modal component for the Fluxez e-commerce platform. This component provides an immersive augmented reality experience for trying on products virtually.

## Location

`/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/ar/ARTryOnModal.tsx`

## Features

### Core Functionality
- **Full-screen AR Experience**: Immersive modal that takes over the entire viewport
- **Camera Placeholder**: Pre-built UI for camera access (ready for AR integration)
- **Product Visualization**: Display product overlay on camera feed
- **Size & Color Selection**: Interactive controls for product variants
- **Add to Cart**: Direct purchase from AR experience
- **Photo Capture**: Take snapshots of the AR try-on
- **Social Sharing**: Share AR try-on experience

### UX Features
- **Auto-hiding Instructions**: 3-second instructional overlay for first-time users
- **Keyboard Navigation**: ESC key to close modal
- **Click Outside to Close**: Intuitive modal dismissal
- **Smooth Animations**: Framer Motion powered transitions
- **Glassmorphism Design**: Modern, professional UI with backdrop blur effects
- **Touch/Gesture Support**: Mobile-optimized interactions

### Accessibility
- **ARIA Labels**: Proper accessibility labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus trapping when modal is open
- **High Contrast**: Clear visual hierarchy and readable text

## Props

```typescript
interface ARTryOnModalProps {
  isOpen: boolean;              // Controls modal visibility
  product: Product;             // Product data to display
  onClose: () => void;          // Callback when modal closes
  onAddToCart: (size: Size, color?: string) => void;  // Callback for add to cart
}
```

### Product Type
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: string[];
  model3d?: string;
  sizes: Size[];
  rating: number;
  category: string;
  description?: string;
  characteristics?: Record<string, string>;
  colors?: string[];
}

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
```

## Usage

### Basic Example

```typescript
import { useState } from 'react';
import { ARTryOnModal } from '@/components/ar/ARTryOnModal';
import { Product, Size } from '@/types';

function ProductPage() {
  const [isAROpen, setIsAROpen] = useState(false);

  const product: Product = {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    brand: 'Fluxez',
    price: 49.99,
    salePrice: 39.99,
    images: ['https://example.com/image.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#FFFFFF', '#3B82F6'],
    rating: 4.5,
    category: 'T-Shirts',
  };

  const handleAddToCart = (size: Size, color?: string) => {
    console.log('Adding to cart:', { size, color });
    // Add to cart logic
  };

  return (
    <>
      <button onClick={() => setIsAROpen(true)}>
        Try On with AR
      </button>

      <ARTryOnModal
        isOpen={isAROpen}
        product={product}
        onClose={() => setIsAROpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
```

### Integration with Product Detail Page

```typescript
import { ARTryOnModal } from '@/components/ar/ARTryOnModal';
import { useCartStore } from '@/stores/useCartStore';

function ProductDetailPage() {
  const [showAR, setShowAR] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleARAddToCart = (size: Size, color?: string) => {
    addItem({
      product,
      size,
      color,
      quantity: 1,
    });
    toast.success('Added to cart!');
    setShowAR(false);
  };

  return (
    <>
      <Button onClick={() => setShowAR(true)}>
        <Camera className="mr-2" />
        Try On with AR
      </Button>

      <ARTryOnModal
        isOpen={showAR}
        product={product}
        onClose={() => setShowAR(false)}
        onAddToCart={handleARAddToCart}
      />
    </>
  );
}
```

## Component Structure

### Header Section
- **Logo**: Fluxez branding with glassmorphism effect
- **Product Name**: Current product being tried on
- **Close Button**: X icon to dismiss modal

### Camera Feed Section
- **Placeholder State**: Pre-camera access UI
  - Pulsing camera icon animation
  - "Enable Camera" CTA button
  - Informative messaging
- **Active State**: Camera feed simulation
  - Product image overlay
  - AR grid effects
  - Zoom controls
  - Demo message banner

### Instructions Overlay
- Numbered step-by-step guide
- Auto-hides after 3 seconds
- Tap to dismiss early
- Glassmorphism panel design

### Bottom Controls Panel
- **Product Thumbnail**: Visual reference
- **Product Info**: Name, price, sale price
- **Size Selector**: Interactive size buttons
- **Color Selector**: Color swatches
- **Action Buttons**:
  - Capture Photo (camera icon)
  - Share (share icon)
  - Add to Cart (primary CTA)

## Styling

### Design System
The component uses the Fluxez design system:

```css
/* Brand Colors */
--primary-lime: #84cc16
--primary-lime-dark: #65a30d
--accent-blue: #3b82f6
--accent-blue-dark: #2563eb
--badge-sale: #ef4444

/* Glassmorphism */
.glass-morphism {
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Border Radius */
--radius-card: 24px
--radius-button: 16px
--radius-pill: 9999px

/* Shadows */
--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.08)
--shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.15)
```

## Animations

### Entry/Exit
```typescript
// Modal backdrop fade
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}

// Modal content scale
initial={{ scale: 0.95, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.95, opacity: 0 }}
```

### Camera Icon Pulse
```typescript
animate={{
  scale: [1, 1.1, 1],
  opacity: [0.5, 1, 0.5],
}}
transition={{
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut",
}}
```

### Capture Flash
```typescript
animate={{ opacity: [0, 1, 0] }}
transition={{ duration: 0.2 }}
```

## State Management

The component manages the following internal states:

```typescript
const [selectedSize, setSelectedSize] = useState<Size | null>(product.sizes[0]);
const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]);
const [showInstructions, setShowInstructions] = useState(true);
const [cameraEnabled, setCameraEnabled] = useState(false);
const [isCapturing, setIsCapturing] = useState(false);
```

## Event Handlers

### Keyboard Events
- **ESC**: Close modal
- Automatically added/removed on mount/unmount

### Modal Interactions
- **Click Backdrop**: Close modal
- **Click Content**: Stop propagation (prevent close)

### User Actions
- **Enable Camera**: Transitions from placeholder to camera view
- **Capture Photo**: Flash effect animation
- **Share**: Native Web Share API (with fallback)
- **Add to Cart**: Validates size selection before callback

## Future AR Integration

The component is designed to easily integrate with AR SDKs:

### Recommended Libraries
1. **MediaPipe** - Google's ML/AR framework
2. **AR.js** - Lightweight AR for web
3. **8th Wall** - Enterprise AR solution
4. **Three.js + AR** - Custom 3D implementation

### Integration Points
```typescript
// Replace placeholder camera feed
const handleEnableCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Initialize AR SDK
  // setCameraEnabled(true);
};

// Add AR overlay rendering
// Use product.model3d for 3D asset
// Implement body/face tracking
// Add gesture recognition
```

## Accessibility Considerations

- All interactive elements have appropriate ARIA labels
- Keyboard navigation fully supported
- High contrast text and controls
- Large touch targets (min 44x44px)
- Clear visual feedback for all interactions
- Screen reader announcements for state changes

## Performance Optimizations

- Lazy loading of camera stream
- Debounced size/color selection
- Optimized animations (GPU-accelerated)
- Memoized callbacks
- Cleanup of timers and event listeners
- AnimatePresence for smooth unmounting

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**:
  - Framer Motion animations
  - Backdrop blur (with fallbacks)
  - Web Share API (progressive enhancement)
  - Future: Camera API, WebGL, WebXR

## Testing

### Manual Testing Checklist
- [ ] Modal opens and closes smoothly
- [ ] ESC key closes modal
- [ ] Click outside closes modal
- [ ] Instructions auto-hide after 3 seconds
- [ ] Camera enable button works
- [ ] Size selection updates state
- [ ] Color selection updates state
- [ ] Add to cart requires size selection
- [ ] Capture photo shows flash effect
- [ ] Share button triggers share API
- [ ] Responsive on mobile devices
- [ ] Accessible via keyboard

## Example Files

- **Component**: `ARTryOnModal.tsx`
- **Example**: `ARTryOnModal.example.tsx`
- **Documentation**: `README.md`

## Dependencies

```json
{
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.542.0",
  "react": "^19.1.1"
}
```

## Related Components

- `/components/ui/button.tsx` - Button component
- `/components/ui/dialog.tsx` - Dialog primitives
- `/types/product.ts` - Product type definitions

## Support

For questions or issues:
1. Check existing product modal implementations
2. Review Framer Motion documentation
3. Test in example file first
4. Consider AR SDK documentation for future integration

---

**Last Updated**: October 26, 2025
**Component Version**: 1.0.0
**Status**: Production Ready (Placeholder AR)

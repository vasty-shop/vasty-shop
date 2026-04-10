# ProductImageGallery Component

A comprehensive, production-ready product image gallery component built with React, TypeScript, and Framer Motion. Designed for e-commerce applications with a focus on user experience and mobile optimization.

## Features

### Core Features

- **Large Main Image Display** - Full-featured primary image viewer at 60% width
- **Smart Zoom System** - Click-to-zoom with mouse position tracking
- **Lightbox Mode** - Full-screen image viewing experience
- **Thumbnail Navigation** - Scrollable thumbnail strip with active highlighting
- **Multi-Media Support** - Images, videos, and 360° views
- **Touch Gestures** - Swipe navigation and pinch-to-zoom for mobile
- **Keyboard Navigation** - Arrow keys and ESC support
- **Lazy Loading** - Optimized image loading with skeleton states

### UI/UX Features

- **Smooth Animations** - Framer Motion transitions throughout
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Image Counter** - "X/Y" display for current position
- **Navigation Arrows** - Previous/next buttons on main image
- **Zoom Controls** - Dedicated zoom in/out buttons
- **Loading States** - Beautiful skeleton loaders
- **Active Indicators** - Clear visual feedback for current selection

## Installation

The component is already integrated into the Fluxez design system. Import it like this:

```tsx
import { ProductImageGallery } from '@/components/products';
```

## Basic Usage

```tsx
import { ProductImageGallery, type GalleryMedia } from '@/components/products';

const MyProductPage = () => {
  const media: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: '/images/product-front.jpg',
      thumbnail: '/images/product-front-thumb.jpg',
      alt: 'Product Front View',
    },
    {
      id: '2',
      type: 'image',
      url: '/images/product-back.jpg',
      thumbnail: '/images/product-back-thumb.jpg',
      alt: 'Product Back View',
    },
    {
      id: '3',
      type: 'video',
      url: '/videos/product-demo.mp4',
      thumbnail: '/images/video-thumb.jpg',
      alt: 'Product Demo Video',
    },
  ];

  return (
    <ProductImageGallery
      media={media}
      productName="Premium Leather Jacket"
    />
  );
};
```

## Advanced Usage

### With All Features Enabled

```tsx
<ProductImageGallery
  media={media}
  productName="Designer Sneakers"
  initialIndex={0}
  enableZoom={true}
  enableLightbox={true}
  thumbnailPosition="horizontal"
  visibleThumbnails={4}
  onMediaChange={(index) => console.log('Changed to:', index)}
  onZoomChange={(isZoomed) => console.log('Zoom:', isZoomed)}
/>
```

### Vertical Thumbnail Layout

```tsx
<ProductImageGallery
  media={media}
  productName="Fashion Collection"
  thumbnailPosition="vertical"
  visibleThumbnails={5}
/>
```

### With State Management

```tsx
const [currentIndex, setCurrentIndex] = useState(0);
const [isZoomed, setIsZoomed] = useState(false);

<ProductImageGallery
  media={media}
  productName="Product Name"
  initialIndex={currentIndex}
  onMediaChange={setCurrentIndex}
  onZoomChange={setIsZoomed}
/>

// Show current state
<div>
  Current image: {currentIndex + 1} of {media.length}
  {isZoomed && <span> (Zoomed)</span>}
</div>
```

## Props

### ProductImageGalleryProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `media` | `GalleryMedia[]` | **Required** | Array of media items to display |
| `productName` | `string` | **Required** | Product name for accessibility |
| `className` | `string` | `undefined` | Additional CSS classes |
| `initialIndex` | `number` | `0` | Initial selected media index |
| `enableZoom` | `boolean` | `true` | Enable/disable zoom functionality |
| `enableLightbox` | `boolean` | `true` | Enable/disable lightbox mode |
| `thumbnailPosition` | `'horizontal' \| 'vertical'` | `'horizontal'` | Thumbnail strip position |
| `visibleThumbnails` | `number` | `4` | Number of visible thumbnails |
| `onMediaChange` | `(index: number) => void` | `undefined` | Callback when media changes |
| `onZoomChange` | `(isZoomed: boolean) => void` | `undefined` | Callback when zoom state changes |

### GalleryMedia

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✓ | Unique identifier for the media item |
| `type` | `'image' \| 'video' \| '360'` | ✓ | Type of media |
| `url` | `string` | ✓ | Full-size media URL |
| `thumbnail` | `string` | | Thumbnail URL (uses `url` if not provided) |
| `alt` | `string` | | Alt text for accessibility |

## Media Types

### Image

Standard image display with zoom support.

```tsx
{
  id: '1',
  type: 'image',
  url: '/images/product.jpg',
  thumbnail: '/images/product-thumb.jpg',
  alt: 'Product Name',
}
```

### Video

Video playback with play button overlay.

```tsx
{
  id: '2',
  type: 'video',
  url: '/videos/product-demo.mp4',
  thumbnail: '/images/video-cover.jpg',
  alt: 'Product Demo',
}
```

### 360° View

Interactive 360-degree product view (drag to rotate).

```tsx
{
  id: '3',
  type: '360',
  url: '/images/360-view.jpg',
  thumbnail: '/images/360-thumb.jpg',
  alt: '360° Product View',
}
```

## User Interactions

### Desktop

- **Click Main Image** - Toggle zoom on/off
- **Hover + Move Mouse** - Pan around when zoomed
- **Click Thumbnail** - Change to that image
- **Click Arrows** - Navigate previous/next
- **Click Zoom Buttons** - Fine-tune zoom level
- **Click Fullscreen** - Open lightbox mode
- **Press Arrow Keys** - Navigate images (in lightbox)
- **Press ESC** - Close lightbox

### Mobile

- **Tap Main Image** - Open lightbox
- **Swipe Left/Right** - Navigate images
- **Pinch** - Zoom in/out
- **Tap Thumbnail** - Change to that image
- **Tap Video** - Play/pause

## Styling

The component uses Tailwind CSS and follows the Fluxez design system:

- **Rounded Corners** - `rounded-2xl` for modern look
- **Shadows** - `shadow-card` for depth
- **Colors** - Primary lime accent, white backgrounds
- **Animations** - Smooth Framer Motion transitions
- **Responsive** - Mobile-first with breakpoints

### Customization

```tsx
<ProductImageGallery
  media={media}
  productName="Product"
  className="custom-gallery-class"
/>
```

## Performance Optimizations

1. **Lazy Loading** - Images load only when needed
2. **Skeleton States** - Beautiful loading placeholders
3. **Optimized Re-renders** - React.memo and useCallback
4. **Smooth Animations** - GPU-accelerated transforms
5. **Efficient State** - Minimal state updates

## Accessibility

- **Alt Text** - Proper image descriptions
- **Keyboard Navigation** - Full keyboard support
- **Focus States** - Clear focus indicators
- **ARIA Labels** - Screen reader friendly
- **Touch Targets** - Minimum 44px touch areas

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- iOS Safari (latest)
- Android Chrome (latest)

## Mobile Considerations

The component is fully optimized for mobile:

- **Touch Gestures** - Swipe and pinch work seamlessly
- **Full Width** - Responsive to container width
- **Thumb Strip** - Horizontal scroll with fade indicators
- **Performance** - Optimized for mobile browsers
- **Viewport** - Respects safe areas

## Common Patterns

### From Product Data

```tsx
const product = {
  name: 'Product Name',
  images: ['/img1.jpg', '/img2.jpg', '/img3.jpg'],
};

const media: GalleryMedia[] = product.images.map((url, i) => ({
  id: `image-${i}`,
  type: 'image',
  url,
  alt: `${product.name} - View ${i + 1}`,
}));

<ProductImageGallery media={media} productName={product.name} />
```

### With Dynamic Loading

```tsx
const [media, setMedia] = useState<GalleryMedia[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchProductImages(productId).then((images) => {
    setMedia(images);
    setLoading(false);
  });
}, [productId]);

if (loading) return <GallerySkeleton />;

return <ProductImageGallery media={media} productName={product.name} />;
```

### Integration with Product Page

```tsx
const ProductDetailPage = ({ product }) => {
  const media: GalleryMedia[] = [
    ...product.images.map((url, i) => ({
      id: `img-${i}`,
      type: 'image' as const,
      url,
      alt: `${product.name} - ${i + 1}`,
    })),
    ...(product.video ? [{
      id: 'video',
      type: 'video' as const,
      url: product.video,
      alt: 'Product Video',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ProductImageGallery media={media} productName={product.name} />
      <ProductInfo product={product} />
    </div>
  );
};
```

## Troubleshooting

### Images Not Loading

- Check image URLs are accessible
- Verify CORS settings for external images
- Ensure thumbnail URLs are provided or fallback to main URL

### Zoom Not Working

- Verify `enableZoom={true}` is set
- Check that media type is `'image'` (not video/360)
- Ensure click handlers aren't being intercepted

### Touch Gestures Not Working

- Make sure you're testing on actual device (not desktop)
- Check that browser supports touch events
- Verify no parent elements are preventing touch

### Thumbnails Not Scrolling

- Ensure container has enough space
- Check that `visibleThumbnails` is less than total media count
- Verify CSS overflow properties aren't overridden

## Examples

See `ProductImageGallery.example.tsx` for comprehensive examples including:

- Basic image gallery
- Gallery with video
- Vertical thumbnail layout
- Event callbacks
- Mobile optimization
- Large galleries (10+ images)

## Dependencies

- `react` - Core library
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/components/ui/button` - Button component
- `@/lib/utils` - Utility functions (cn)

## License

Part of the Fluxez e-commerce platform. All rights reserved.

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Author:** Fluxez Development Team

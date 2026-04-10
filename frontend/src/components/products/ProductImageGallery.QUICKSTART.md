# ProductImageGallery - Quick Start Guide

Get started with the ProductImageGallery component in under 5 minutes!

## Installation

Already included in your Fluxez project. No additional installation needed.

## Basic Setup

### 1. Import the Component

```tsx
import { ProductImageGallery, type GalleryMedia } from '@/components/products';
```

### 2. Prepare Your Media Data

```tsx
const media: GalleryMedia[] = [
  {
    id: '1',
    type: 'image',
    url: '/images/product-1.jpg',
    alt: 'Product Front View',
  },
  {
    id: '2',
    type: 'image',
    url: '/images/product-2.jpg',
    alt: 'Product Side View',
  },
  {
    id: '3',
    type: 'image',
    url: '/images/product-3.jpg',
    alt: 'Product Back View',
  },
];
```

### 3. Use the Component

```tsx
<ProductImageGallery
  media={media}
  productName="My Awesome Product"
/>
```

That's it! You now have a fully functional image gallery.

## Convert Product Images to Gallery Format

If you have a product object with an images array:

```tsx
const product = {
  id: 'prod-123',
  name: 'Designer T-Shirt',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ],
};

// Convert to gallery format
const media: GalleryMedia[] = product.images.map((url, index) => ({
  id: `${product.id}-${index}`,
  type: 'image',
  url: url,
  alt: `${product.name} - View ${index + 1}`,
}));

// Use in gallery
<ProductImageGallery media={media} productName={product.name} />
```

## Common Use Cases

### 1. Product Detail Page

```tsx
const ProductPage = ({ product }) => {
  const media = product.images.map((url, i) => ({
    id: `img-${i}`,
    type: 'image',
    url,
    alt: `${product.name} - ${i + 1}`,
  }));

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <ProductImageGallery
        media={media}
        productName={product.name}
      />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        {/* Rest of product info */}
      </div>
    </div>
  );
};
```

### 2. With Video

```tsx
const media: GalleryMedia[] = [
  {
    id: '1',
    type: 'image',
    url: '/images/product-hero.jpg',
  },
  {
    id: '2',
    type: 'video',
    url: '/videos/product-demo.mp4',
    thumbnail: '/images/video-thumb.jpg', // Optional
  },
  {
    id: '3',
    type: 'image',
    url: '/images/product-detail.jpg',
  },
];
```

### 3. With Custom Thumbnails

For faster loading, provide smaller thumbnail images:

```tsx
const media: GalleryMedia[] = [
  {
    id: '1',
    type: 'image',
    url: '/images/product-full.jpg',     // High res
    thumbnail: '/images/product-thumb.jpg', // Low res
  },
];
```

### 4. Track User Interactions

```tsx
const [currentImage, setCurrentImage] = useState(0);

<ProductImageGallery
  media={media}
  productName="Product"
  onMediaChange={(index) => {
    setCurrentImage(index);
    // Analytics, etc.
  }}
/>
```

## Props Quick Reference

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `media` | `GalleryMedia[]` | - | Yes |
| `productName` | `string` | - | Yes |
| `enableZoom` | `boolean` | `true` | No |
| `enableLightbox` | `boolean` | `true` | No |
| `thumbnailPosition` | `'horizontal' \| 'vertical'` | `'horizontal'` | No |

## Tips

1. **Image Optimization**: Use optimized images (WebP format, appropriate sizes)
2. **Alt Text**: Always provide descriptive alt text for accessibility
3. **Thumbnails**: Provide separate thumbnail images for faster loading
4. **Mobile**: Component is fully responsive - works great on mobile out of the box

## What's Included?

- ✓ Zoom functionality (click to zoom, mouse tracking)
- ✓ Full-screen lightbox
- ✓ Thumbnail navigation
- ✓ Keyboard controls (arrows, ESC)
- ✓ Touch gestures (swipe, pinch-to-zoom)
- ✓ Video support
- ✓ Loading states
- ✓ Smooth animations

## Need More?

See the full README for advanced features:
- 360° product views
- Event callbacks
- Vertical thumbnails
- Mobile optimizations
- And more!

## Example Template

Copy and paste this template to get started:

```tsx
import { ProductImageGallery, type GalleryMedia } from '@/components/products';

const MyComponent = () => {
  // Replace with your actual images
  const media: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'YOUR_IMAGE_URL_1',
      alt: 'Product description 1',
    },
    {
      id: '2',
      type: 'image',
      url: 'YOUR_IMAGE_URL_2',
      alt: 'Product description 2',
    },
  ];

  return (
    <ProductImageGallery
      media={media}
      productName="Your Product Name"
    />
  );
};
```

---

**Ready to go!** Start using ProductImageGallery in your product pages now.

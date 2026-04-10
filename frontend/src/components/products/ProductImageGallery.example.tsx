import * as React from 'react';
import { ProductImageGallery, type GalleryMedia } from './ProductImageGallery';

/**
 * Example usage of ProductImageGallery component
 */

// Example 1: Basic Image Gallery
export const BasicGalleryExample = () => {
  const imageMedia: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100',
      alt: 'Black Leather Jacket - Front View',
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100',
      alt: 'Black Leather Jacket - Side View',
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100',
      alt: 'Black Leather Jacket - Back View',
    },
    {
      id: '4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1520975867597-0af37a22e31e?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1520975867597-0af37a22e31e?w=100',
      alt: 'Black Leather Jacket - Detail View',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Basic Image Gallery</h2>
      <ProductImageGallery
        media={imageMedia}
        productName="Premium Black Leather Jacket"
      />
    </div>
  );
};

// Example 2: Gallery with Video
export const GalleryWithVideoExample = () => {
  const mixedMedia: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      alt: 'Red Nike Sneakers - Hero Shot',
    },
    {
      id: '2',
      type: 'video',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100',
      alt: 'Product Video',
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100',
      alt: 'Red Nike Sneakers - Side View',
    },
    {
      id: '4',
      type: '360',
      url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100',
      alt: '360 Degree View',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Gallery with Mixed Media</h2>
      <ProductImageGallery
        media={mixedMedia}
        productName="Nike Air Max Sneakers"
        enableZoom={true}
        enableLightbox={true}
      />
    </div>
  );
};

// Example 3: Vertical Thumbnail Layout
export const VerticalThumbnailExample = () => {
  const imageMedia: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100',
      alt: 'Fashion Model 1',
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=100',
      alt: 'Fashion Model 2',
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=100',
      alt: 'Fashion Model 3',
    },
    {
      id: '4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100',
      alt: 'Fashion Model 4',
    },
    {
      id: '5',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100',
      alt: 'Fashion Model 5',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Vertical Thumbnail Layout</h2>
      <ProductImageGallery
        media={imageMedia}
        productName="Designer Collection"
        thumbnailPosition="vertical"
      />
    </div>
  );
};

// Example 4: With Callbacks and Event Handling
export const GalleryWithCallbacksExample = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);

  const imageMedia: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100',
      alt: 'Casual Dress - Front',
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100',
      alt: 'Casual Dress - Back',
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100',
      alt: 'Casual Dress - Side',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Gallery with Event Callbacks</h2>

      {/* Status Display */}
      <div className="mb-4 p-4 bg-gray-100 rounded-xl">
        <div className="flex gap-4 text-sm">
          <div>
            <span className="font-semibold">Current Image:</span> {currentMediaIndex + 1}
          </div>
          <div>
            <span className="font-semibold">Zoom Status:</span> {isZoomed ? 'Zoomed In' : 'Normal'}
          </div>
        </div>
      </div>

      <ProductImageGallery
        media={imageMedia}
        productName="Summer Casual Dress"
        initialIndex={0}
        onMediaChange={(index) => {
          setCurrentMediaIndex(index);
          console.log('Media changed to index:', index);
        }}
        onZoomChange={(zoomed) => {
          setIsZoomed(zoomed);
          console.log('Zoom state:', zoomed);
        }}
      />
    </div>
  );
};

// Example 5: Mobile-Optimized Gallery
export const MobileGalleryExample = () => {
  const imageMedia: GalleryMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1523380677598-64d85d015339?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1523380677598-64d85d015339?w=100',
      alt: 'Product Image 1',
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100',
      alt: 'Product Image 2',
    },
    {
      id: '3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=100',
      alt: 'Product Image 3',
    },
  ];

  return (
    <div className="w-full p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Mobile-Optimized Gallery</h2>
      <p className="text-sm text-gray-600 mb-4">
        Try swiping left/right on mobile, or pinch to zoom!
      </p>
      <ProductImageGallery
        media={imageMedia}
        productName="Trendy Watch Collection"
        enableZoom={true}
        enableLightbox={true}
        className="w-full"
      />
    </div>
  );
};

// Example 6: Large Gallery (Many Images)
export const LargeGalleryExample = () => {
  const generateImages = (count: number): GalleryMedia[] => {
    const imageIds = [
      'photo-1523275335684-37898b6baf30',
      'photo-1572635196237-14b3f281503f',
      'photo-1505740420928-5e560c06d30e',
      'photo-1526170375885-4d8ecf77b99f',
      'photo-1560769629-975ec94e6a86',
      'photo-1542291026-7eec264c27ff',
      'photo-1491553895911-0055eca6402d',
      'photo-1606107557195-0e29a4b5b4aa',
    ];

    return Array.from({ length: count }, (_, i) => {
      const imageId = imageIds[i % imageIds.length];
      return {
        id: `image-${i + 1}`,
        type: 'image' as const,
        url: `https://images.unsplash.com/${imageId}?w=800&q=80&auto=format&fit=crop`,
        thumbnail: `https://images.unsplash.com/${imageId}?w=100&q=80&auto=format&fit=crop`,
        alt: `Product Image ${i + 1}`,
      };
    });
  };

  const imageMedia = generateImages(12);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Large Gallery (12 Images)</h2>
      <ProductImageGallery
        media={imageMedia}
        productName="Complete Product Collection"
        visibleThumbnails={5}
      />
    </div>
  );
};

// Combined Demo Page
export const ProductImageGalleryDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Image Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive image gallery component with zoom, lightbox, video support,
            and touch gestures for mobile devices.
          </p>
        </div>

        <div className="space-y-16">
          <BasicGalleryExample />
          <GalleryWithVideoExample />
          <VerticalThumbnailExample />
          <GalleryWithCallbacksExample />
          <MobileGalleryExample />
          <LargeGalleryExample />
        </div>

        {/* Features List */}
        <div className="bg-white rounded-2xl p-8 shadow-card">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Main Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Click to zoom with mouse position tracking</li>
                <li>✓ Smooth zoom in/out controls</li>
                <li>✓ Full-screen lightbox mode</li>
                <li>✓ Keyboard navigation (arrows, ESC)</li>
                <li>✓ Touch gestures (swipe, pinch-to-zoom)</li>
                <li>✓ Video playback support</li>
                <li>✓ 360° view support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">UI/UX Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Thumbnail navigation strip</li>
                <li>✓ Horizontal or vertical thumbnails</li>
                <li>✓ Active thumbnail highlighting</li>
                <li>✓ Image counter display</li>
                <li>✓ Lazy loading with skeleton states</li>
                <li>✓ Smooth Framer Motion animations</li>
                <li>✓ Responsive mobile-first design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGalleryDemo;

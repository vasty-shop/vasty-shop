# ImageUpload Component

A professional, feature-rich image upload component designed for the Fluxez vendor panel. Built with React, TypeScript, react-dropzone, and framer-motion.

## Features

### 1. Multiple File Upload
- **Drag-and-drop zone** with visual feedback
- **Click to browse** file system
- **Multiple files at once** support
- **Supported formats**: JPG, JPEG, PNG, WebP
- **File size validation** with customizable limits
- **Maximum file count** enforcement

### 2. Preview Grid
- **Thumbnail previews** in a responsive grid layout
- **Delete button** (X) on each image
- **Set as primary** image indicator (star icon)
- **Drag-and-drop reordering** with visual feedback
- **Smooth animations** using framer-motion

### 3. Upload Progress
- **Progress bar** for each uploading image (0-100%)
- **Visual loading indicator** during upload
- **Cancel upload** option (via abort controller)
- **Retry failed uploads** button

### 4. Validation
- **File type validation** (JPG, PNG, WebP)
- **File size validation** (default: 5MB, customizable)
- **Maximum number of images** (default: 10, customizable)
- **Image dimension recommendations** display
- **Real-time error messages** with auto-dismiss

### 5. State Management
- **Controlled component** with onChange callback
- **Primary image** tracking
- **Upload progress** per image
- **Error state** per image
- **Reordering** support

## Installation

The component uses the following dependencies (already installed):

```bash
npm install react-dropzone framer-motion lucide-react
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { ImageUpload, UploadedImage } from '@/features/vendor/components/ImageUpload';

function MyComponent() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  return (
    <ImageUpload
      images={images}
      onChange={setImages}
    />
  );
}
```

## Props API

### `ImageUploadProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `UploadedImage[]` | `[]` | Array of uploaded images |
| `onChange` | `(images: UploadedImage[]) => void` | - | Callback when images change |
| `maxFiles` | `number` | `10` | Maximum number of images allowed |
| `maxFileSize` | `number` | `5242880` | Maximum file size in bytes (default: 5MB) |
| `acceptedFormats` | `string[]` | `['.jpg', '.jpeg', '.png', '.webp']` | Accepted file formats |
| `onUpload` | `(file: File) => Promise<{url: string, thumbnailUrl?: string}>` | - | Custom upload handler |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `showDimensions` | `boolean` | `true` | Show recommended dimensions |
| `recommendedDimensions` | `{width: number, height: number}` | `{width: 1200, height: 1200}` | Recommended image dimensions |

## Type Definitions

### `UploadedImage`

```typescript
interface UploadedImage {
  id: string;              // Unique identifier
  url: string;             // Full image URL
  thumbnailUrl?: string;   // Thumbnail URL (optional)
  fileName: string;        // Original file name
  fileSize: number;        // File size in bytes
  isPrimary: boolean;      // Is this the primary image?
  order: number;           // Display order
  file?: File;            // Original File object (for retries)
}
```

### `ImageUploadState`

```typescript
interface ImageUploadState {
  images: UploadedImage[];           // Current images
  uploading: boolean;                // Is any upload in progress?
  progress: Record<string, number>;  // Upload progress per image ID
  errors: Record<string, string>;    // Error messages per image ID
}
```

## Advanced Usage

### Custom Upload Handler

Integrate with your backend API:

```tsx
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/vendor/products/images/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  return {
    url: data.url,
    thumbnailUrl: data.thumbnailUrl
  };
};

<ImageUpload
  images={images}
  onChange={setImages}
  onUpload={handleUpload}
/>
```

### Pre-loaded Images (Edit Mode)

```tsx
const [images, setImages] = useState<UploadedImage[]>([
  {
    id: 'existing_1',
    url: 'https://cdn.example.com/image1.jpg',
    thumbnailUrl: 'https://cdn.example.com/image1-thumb.jpg',
    fileName: 'product-image-1.jpg',
    fileSize: 245678,
    isPrimary: true,
    order: 0
  },
  // ... more images
]);

<ImageUpload
  images={images}
  onChange={setImages}
/>
```

### Custom Validation

```tsx
const handleImageChange = (newImages: UploadedImage[]) => {
  // Custom validation logic
  if (newImages.length === 0) {
    setError('At least one image is required');
    return;
  }

  if (!newImages.some(img => img.isPrimary)) {
    setError('Please select a primary image');
    return;
  }

  setError('');
  setImages(newImages);
};

<ImageUpload
  images={images}
  onChange={handleImageChange}
/>
```

### Custom Limits

```tsx
<ImageUpload
  images={images}
  onChange={setImages}
  maxFiles={8}
  maxFileSize={10 * 1024 * 1024} // 10MB
  acceptedFormats={['.jpg', '.jpeg', '.png']} // Only JPG and PNG
  recommendedDimensions={{ width: 1600, height: 1600 }}
/>
```

### Disabled State (View Only)

```tsx
<ImageUpload
  images={existingImages}
  disabled={true}
/>
```

## Features in Detail

### Drag and Drop

The component uses `react-dropzone` for robust drag-and-drop functionality:
- Visual feedback when dragging over the drop zone
- Animated scale and color changes
- Support for multiple files dropped at once
- Validation before accepting files

### Image Reordering

Images can be reordered using drag-and-drop:
- Powered by framer-motion's `Reorder` component
- Smooth animations during reordering
- Disabled during upload
- Visual grip handle indicator

### Primary Image Selection

- First uploaded image is automatically marked as primary
- Click the star icon to change the primary image
- Primary image is highlighted with a gold star badge
- Only one image can be primary at a time

### Upload Progress

Each image shows its upload progress:
- 0-100% progress bar with gradient animation
- Loading spinner during upload
- Auto-remove progress bar after completion
- Smooth transitions

### Error Handling

Comprehensive error handling:
- File size validation
- File format validation
- Maximum file count validation
- Upload failure detection
- Retry button for failed uploads
- Auto-dismissing error messages (5 seconds)

### Retry Failed Uploads

If an upload fails:
1. Image shows in error state
2. Error message is displayed
3. Retry button appears
4. Click retry to attempt upload again
5. Original file is preserved for retry

### Cancel Uploads

Uploads can be cancelled:
- Each upload has an AbortController
- Removing an image cancels its upload
- No memory leaks from cancelled uploads

## Styling

The component uses the vendor panel's glassmorphism design system:

- `.glass-solid` - Solid glass card background
- `.glass-hover` - Interactive hover states
- Gradient accents (purple to pink)
- Smooth transitions and animations
- Consistent with vendor panel aesthetic

### Customization

All styles use Tailwind CSS classes and can be customized via:
1. Tailwind configuration
2. Custom CSS classes
3. Inline style props (if needed)

## Accessibility

- **Keyboard navigation**: Full keyboard support for all interactions
- **ARIA labels**: Proper ARIA attributes for screen readers
- **Focus states**: Clear focus indicators
- **Color contrast**: WCAG AA compliant colors
- **Alt text**: Images use fileName as alt text

## Performance

### Optimizations

1. **Memoized callbacks**: All handlers use `useCallback`
2. **Lazy loading**: Images load progressively
3. **Abort controllers**: Prevent memory leaks
4. **Efficient re-renders**: Only affected components re-render
5. **File size limits**: Prevent oversized uploads
6. **Thumbnail URLs**: Support for optimized thumbnails

### Best Practices

1. Always provide `thumbnailUrl` for better performance
2. Use image CDN URLs when possible
3. Implement server-side image optimization
4. Set appropriate `maxFileSize` limits
5. Use WebP format for smaller file sizes

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (touch-friendly)

## Examples

See `ImageUpload.example.tsx` for comprehensive usage examples:

1. **Basic Usage** - Simple implementation
2. **Custom Upload** - Backend integration
3. **Product Form** - Complete form example
4. **Edit Mode** - Pre-loaded images
5. **Custom Validation** - Additional validation logic
6. **Disabled State** - View-only mode

## Troubleshooting

### Images not uploading

1. Check `onUpload` handler is implemented correctly
2. Verify backend endpoint is accessible
3. Check file size is within limits
4. Confirm file format is accepted

### Drag and drop not working

1. Ensure browser supports File API
2. Check for conflicting drag handlers
3. Verify component is not disabled

### Progress bar stuck

1. Check `onUpload` promise resolves/rejects
2. Verify network connectivity
3. Check for JavaScript errors in console

### Images not reordering

1. Ensure `onChange` callback is implemented
2. Check images aren't disabled
3. Verify no upload is in progress

## License

MIT License - Part of the Fluxez platform

## Support

For issues, questions, or contributions:
- Create an issue in the project repository
- Contact the development team
- Refer to the main project documentation

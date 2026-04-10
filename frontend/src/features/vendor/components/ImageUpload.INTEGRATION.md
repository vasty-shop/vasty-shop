# ImageUpload Component - Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import { ImageUpload, UploadedImage } from '@/features/vendor/components/ImageUpload';
```

### 2. Add to Your Component

```tsx
const [images, setImages] = useState<UploadedImage[]>([]);

<ImageUpload
  images={images}
  onChange={setImages}
/>
```

### 3. Done!

The component is fully functional with default settings.

---

## Adding the Test Page to Router

To access the interactive test page, add this route to your router configuration:

### Option A: React Router v6+

```tsx
// In your router configuration file (e.g., App.tsx or routes.tsx)

import { ImageUploadTestPage } from '@/features/vendor/pages/ImageUploadTestPage';

// Add to your routes
<Route path="/vendor/test/image-upload" element={<ImageUploadTestPage />} />
```

### Option B: Full Router Example

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VendorLayout } from '@/features/vendor/layout/VendorLayout';
import { ImageUploadTestPage } from '@/features/vendor/pages/ImageUploadTestPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/vendor" element={<VendorLayout />}>
          {/* Your existing routes */}
          <Route path="dashboard" element={<VendorDashboardPage />} />
          <Route path="products" element={<ProductsListPage />} />

          {/* Add the test page */}
          <Route path="test/image-upload" element={<ImageUploadTestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Then access it at: `http://localhost:5173/vendor/test/image-upload`

---

## Using in Product Forms

### Example: Add Product Form

```tsx
import React, { useState } from 'react';
import { ImageUpload, UploadedImage } from '@/features/vendor/components/ImageUpload';

interface ProductFormData {
  name: string;
  price: number;
  images: UploadedImage[];
}

export const AddProductPage: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    images: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate images
    if (formData.images.length === 0) {
      alert('Please add at least one product image');
      return;
    }

    // Submit to backend
    const response = await fetch('/api/vendor/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Product created!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div className="glass-solid rounded-2xl p-6">
        <label className="block text-white font-medium mb-2">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          required
        />
      </div>

      {/* Product Images */}
      <div className="glass-solid rounded-2xl p-6">
        <label className="block text-white font-medium mb-4">Product Images</label>
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
          maxFiles={10}
          maxFileSize={5 * 1024 * 1024} // 5MB
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium"
      >
        Create Product
      </button>
    </form>
  );
};
```

---

## Backend Integration

### Upload Handler with API

```tsx
const handleUpload = async (file: File): Promise<{ url: string; thumbnailUrl?: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/vendor/products/images/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('vendor_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

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

### Backend API Example (Node.js/Express)

```javascript
// POST /api/vendor/products/images/upload
router.post('/images/upload', auth, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    // Upload to your storage (S3, Cloudinary, etc.)
    const imageUrl = await uploadToStorage(file);
    const thumbnailUrl = await createThumbnail(file);

    res.json({
      url: imageUrl,
      thumbnailUrl: thumbnailUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

---

## Edit Mode (Pre-loaded Images)

When editing existing products:

```tsx
// Load product data
useEffect(() => {
  const loadProduct = async () => {
    const response = await fetch(`/api/vendor/products/${productId}`);
    const product = await response.json();

    // Convert backend format to UploadedImage format
    const loadedImages: UploadedImage[] = product.images.map((img, index) => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      fileName: img.fileName || `image-${index + 1}.jpg`,
      fileSize: img.fileSize || 0,
      isPrimary: img.isPrimary,
      order: img.order
    }));

    setImages(loadedImages);
  };

  loadProduct();
}, [productId]);

<ImageUpload
  images={images}
  onChange={setImages}
/>
```

---

## Navigation Menu Integration

Add a link to the test page in your sidebar:

```tsx
// VendorSidebar.tsx or similar

import { ImageIcon } from 'lucide-react';

const menuItems = [
  // ... your existing menu items
  {
    label: 'Image Upload Test',
    icon: <ImageIcon />,
    path: '/vendor/test/image-upload',
    badge: 'TEST'
  }
];
```

---

## Environment-specific Configuration

### Development

```tsx
<ImageUpload
  images={images}
  onChange={setImages}
  maxFiles={20}
  maxFileSize={20 * 1024 * 1024} // 20MB for testing
  onUpload={async (file) => {
    // Use mock upload in development
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { url: URL.createObjectURL(file) };
  }}
/>
```

### Production

```tsx
<ImageUpload
  images={images}
  onChange={setImages}
  maxFiles={10}
  maxFileSize={5 * 1024 * 1024} // 5MB
  onUpload={uploadToS3} // Real upload handler
/>
```

---

## Common Integration Patterns

### 1. With Form Validation

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const validateImages = (images: UploadedImage[]) => {
  const newErrors: Record<string, string> = {};

  if (images.length === 0) {
    newErrors.images = 'At least one image is required';
  }

  if (images.length > 0 && !images.some(img => img.isPrimary)) {
    newErrors.images = 'Please select a primary image';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 2. With Loading States

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

<ImageUpload
  images={images}
  onChange={setImages}
  disabled={isSubmitting}
/>
```

### 3. With Confirmation Dialog

```tsx
const handleRemoveImage = (imageId: string) => {
  if (confirm('Are you sure you want to remove this image?')) {
    setImages(images.filter(img => img.id !== imageId));
  }
};
```

---

## TypeScript Types

Import and use the provided types:

```tsx
import type {
  UploadedImage,
  ImageUploadProps,
  ImageUploadState
} from '@/features/vendor/components/ImageUpload';

// Use in your component
interface MyFormState {
  images: UploadedImage[];
  // ... other fields
}
```

---

## Troubleshooting

### Issue: Images not showing

**Solution**: Ensure image URLs are accessible and not blocked by CORS

```tsx
// Add crossorigin attribute if needed
<img src={image.url} crossOrigin="anonymous" />
```

### Issue: Upload fails silently

**Solution**: Add error handling to your upload handler

```tsx
const handleUpload = async (file: File) => {
  try {
    const result = await uploadToBackend(file);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Upload failed: ' + error.message);
  }
};
```

### Issue: Large file uploads timeout

**Solution**: Increase timeout and show progress

```tsx
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(60000) // 60 second timeout
  });

  return response.json();
};
```

---

## Best Practices

1. **Always validate images** before submitting forms
2. **Use thumbnails** when available for better performance
3. **Implement proper error handling** in upload handlers
4. **Show upload progress** for large files
5. **Compress images** on the backend before storage
6. **Use CDN URLs** for better performance
7. **Implement image optimization** (WebP conversion, etc.)
8. **Add loading states** during uploads
9. **Validate file types** on both frontend and backend
10. **Set reasonable file size limits** (5-10MB recommended)

---

## Performance Tips

1. **Lazy load images** in the preview grid
2. **Use IntersectionObserver** for visibility tracking
3. **Implement virtual scrolling** for large image lists
4. **Compress images** before upload
5. **Use WebP format** when possible
6. **Cache uploaded images** locally
7. **Debounce onChange** callbacks if needed

---

## Security Considerations

1. **Validate file types** on backend
2. **Scan uploaded files** for malware
3. **Use signed URLs** for private images
4. **Implement rate limiting** on upload endpoints
5. **Sanitize file names** before storage
6. **Check file dimensions** to prevent bombs
7. **Use HTTPS** for all uploads

---

## Support

- Check `ImageUpload.README.md` for detailed documentation
- See `ImageUpload.example.tsx` for usage examples
- Visit test page at `/vendor/test/image-upload` for live demo
- Refer to TypeScript types for API reference

---

## Quick Links

- **Component**: `/src/features/vendor/components/ImageUpload.tsx`
- **Examples**: `/src/features/vendor/components/ImageUpload.example.tsx`
- **Test Page**: `/src/features/vendor/pages/ImageUploadTestPage.tsx`
- **Documentation**: `/src/features/vendor/components/ImageUpload.README.md`

# ImageUpload - Quick Reference Card

## Import

```tsx
import { ImageUpload, UploadedImage } from '@/features/vendor/components/ImageUpload';
```

## Basic Usage

```tsx
const [images, setImages] = useState<UploadedImage[]>([]);

<ImageUpload images={images} onChange={setImages} />
```

## Props

| Prop | Type | Default |
|------|------|---------|
| `images` | `UploadedImage[]` | `[]` |
| `onChange` | `(images: UploadedImage[]) => void` | - |
| `maxFiles` | `number` | `10` |
| `maxFileSize` | `number` | `5242880` (5MB) |
| `acceptedFormats` | `string[]` | `['.jpg', '.jpeg', '.png', '.webp']` |
| `onUpload` | `(file: File) => Promise<{url: string, thumbnailUrl?: string}>` | - |
| `disabled` | `boolean` | `false` |
| `showDimensions` | `boolean` | `true` |
| `recommendedDimensions` | `{width: number, height: number}` | `{width: 1200, height: 1200}` |

## UploadedImage Interface

```tsx
interface UploadedImage {
  id: string;              // Unique identifier
  url: string;             // Full image URL
  thumbnailUrl?: string;   // Optional thumbnail
  fileName: string;        // File name
  fileSize: number;        // Size in bytes
  isPrimary: boolean;      // Is primary image?
  order: number;           // Display order
  file?: File;            // Original File object
}
```

## Custom Upload Handler

```tsx
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return { url: data.url, thumbnailUrl: data.thumbnailUrl };
};

<ImageUpload images={images} onChange={setImages} onUpload={handleUpload} />
```

## Features

- ✅ Drag-and-drop upload
- ✅ Click to browse files
- ✅ Multiple file selection
- ✅ Progress bars (0-100%)
- ✅ Error handling with retry
- ✅ Primary image selection (star icon)
- ✅ Reorder via drag-and-drop
- ✅ Delete images (X button)
- ✅ File validation (size, format)
- ✅ Glassmorphism design
- ✅ Fully accessible
- ✅ TypeScript types

## Common Patterns

### In Product Form

```tsx
const [formData, setFormData] = useState({
  name: '',
  price: 0,
  images: []
});

<ImageUpload
  images={formData.images}
  onChange={(images) => setFormData({ ...formData, images })}
/>
```

### With Validation

```tsx
const handleImageChange = (images: UploadedImage[]) => {
  if (images.length === 0) {
    setError('At least one image required');
    return;
  }
  setImages(images);
};
```

### Edit Mode

```tsx
// Load existing images
useEffect(() => {
  const loadedImages = product.images.map(img => ({
    id: img.id,
    url: img.url,
    thumbnailUrl: img.thumbnailUrl,
    fileName: img.fileName,
    fileSize: img.fileSize,
    isPrimary: img.isPrimary,
    order: img.order
  }));
  setImages(loadedImages);
}, [product]);
```

### Custom Limits

```tsx
<ImageUpload
  images={images}
  onChange={setImages}
  maxFiles={8}
  maxFileSize={10 * 1024 * 1024} // 10MB
  acceptedFormats={['.jpg', '.jpeg', '.png']}
/>
```

## Test Page Route

```tsx
import { ImageUploadTestPage } from '@/features/vendor/pages/ImageUploadTestPage';

<Route path="/vendor/test/image-upload" element={<ImageUploadTestPage />} />
```

Visit: `http://localhost:5173/vendor/test/image-upload`

## File Locations

- **Component**: `/src/features/vendor/components/ImageUpload.tsx`
- **Examples**: `/src/features/vendor/components/ImageUpload.example.tsx`
- **Test Page**: `/src/features/vendor/pages/ImageUploadTestPage.tsx`
- **Full Docs**: `/src/features/vendor/components/ImageUpload.README.md`
- **Integration**: `/src/features/vendor/components/ImageUpload.INTEGRATION.md`

## Keyboard Shortcuts

- **Tab** - Navigate between images
- **Enter/Space** - Activate buttons
- **Escape** - Cancel drag operation

## Accessibility

- Full keyboard navigation
- ARIA labels
- Screen reader support
- Focus indicators
- WCAG AA compliant

## Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile ✅

## Performance Tips

1. Use `thumbnailUrl` for faster loading
2. Implement backend image compression
3. Set reasonable `maxFileSize` limits
4. Use CDN for image hosting
5. Enable lazy loading

## Security

1. Validate file types on backend
2. Scan for malware
3. Use signed URLs
4. Implement rate limiting
5. Sanitize file names

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images not uploading | Implement `onUpload` handler |
| Drag-and-drop not working | Check browser File API support |
| Progress bar stuck | Ensure `onUpload` resolves/rejects |
| Images not reordering | Verify `onChange` is implemented |
| CORS errors | Configure backend CORS headers |

## Support

- 📖 Read `ImageUpload.README.md` for full docs
- 🔍 See `ImageUpload.example.tsx` for examples
- 🧪 Try `/vendor/test/image-upload` for live demo
- 💬 Contact dev team for help

---

**Version**: 1.0.0 | **Status**: Production Ready ✅

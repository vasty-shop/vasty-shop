# ProductAddPage Integration Guide

## Quick Start

### 1. Add Route to Router

Add the ProductAddPage route to your vendor routes configuration:

```tsx
// In your router configuration (e.g., App.tsx or routes.tsx)
import { ProductAddPage } from '@/features/vendor/pages/ProductAddPage';

<Route path="/shop/:shopId/vendor/products/add" element={<ProductAddPage />} />
```

### 2. Navigation from ProductsListPage

The ProductsListPage already has the "Add Product" button configured:

```tsx
// Already implemented in ProductsListPage.tsx (line 68-72)
const handleAddProduct = () => {
  if (shopId) {
    navigate(`/shop/${shopId}/vendor/products/add`);
  }
};
```

### 3. Required Store Setup

Ensure the VendorAuthStore is properly configured:

```tsx
// stores/useVendorAuthStore.ts should have:
interface VendorAuthStore {
  shop: {
    id: string;
    name: string;
    // ... other shop properties
  } | null;
  // ... other store properties
}
```

### 4. API Integration

Ensure these API methods are available:

```typescript
// lib/api.ts
class API {
  async createProduct(data: any): Promise<any>
  async getVendorCategories(shopId: string): Promise<any[]>
  async getVendorCampaigns(shopId: string, params?: any): Promise<any>
  async getVendorOffers(shopId: string, params?: any): Promise<any>
}
```

## Testing the Integration

### 1. Basic Flow Test

```bash
# Navigate to products list
/shop/{shopId}/vendor/products

# Click "Add Product" button
# Should navigate to: /shop/{shopId}/vendor/products/add

# Fill in required fields:
- Product Name
- Price

# Click "Save Product"
# Should redirect back to products list
```

### 2. Auto-Save Test

```bash
# Start filling out form
# Wait 1 second
# Check localStorage for 'product_draft' key
# Refresh page
# Should see "Draft restored" toast
```

### 3. Validation Test

```bash
# Click "Save Product" without filling form
# Should see validation errors for:
  - Product name is required
  - Price must be greater than 0
  - URL slug is required
```

## Custom Scrollbar Styles

Add these to your global CSS if not already present:

```css
/* Custom scrollbar for dropdowns and long content */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(147, 51, 234, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(147, 51, 234, 0.8);
}
```

## Optional: ImageUpload Component Integration

If you want to use a dedicated ImageUpload component instead of the built-in functionality:

```tsx
// Replace the Images Tab with:
import { ImageUpload } from '@/components/ImageUpload';

{activeTab === 'images' && (
  <GlassCard hover={false}>
    <h3 className="text-lg font-semibold text-white mb-4">
      Product Images
    </h3>
    <ImageUpload
      images={images}
      onUpload={handleImageUpload}
      onRemove={handleRemoveImage}
      onSetPrimary={handleSetPrimaryImage}
      onReorder={handleReorderImages}
      maxImages={10}
      maxSizeMB={5}
    />
  </GlassCard>
)}
```

## Environment Variables

No additional environment variables required. The component uses existing API configuration.

## Troubleshooting

### Issue: "Shop context not found"

**Solution:** Ensure user is logged in and shop is set in VendorAuthStore:

```tsx
const { shop } = useVendorAuthStore();
console.log('Current shop:', shop);
```

### Issue: Categories not loading

**Solution:** Check API endpoint and shop ID:

```tsx
const loadCategories = async () => {
  try {
    const data = await api.getVendorCategories(shop.id);
    console.log('Loaded categories:', data);
  } catch (err) {
    console.error('Category load error:', err);
  }
};
```

### Issue: Form validation not working

**Solution:** Check formData state and error messages:

```tsx
console.log('Form data:', formData);
console.log('Validation errors:', errors);
```

### Issue: Auto-save not working

**Solution:** Check localStorage permissions and quota:

```tsx
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (e) {
  console.error('localStorage not available:', e);
}
```

## Performance Optimization Tips

### 1. Debounce Category Search

```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Search logic
  }, 300),
  []
);
```

### 2. Lazy Load Heavy Components

```tsx
const RichTextEditor = lazy(() => import('./RichTextEditor'));

// In render:
<Suspense fallback={<div>Loading editor...</div>}>
  <RichTextEditor />
</Suspense>
```

### 3. Optimize Image Uploads

```tsx
const compressImage = async (file: File): Promise<File> => {
  // Use canvas to compress image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // ... compression logic
  return compressedFile;
};
```

## Security Considerations

### 1. Validate File Types

```tsx
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  Array.from(files).forEach(file => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Only images are allowed'
      });
      return;
    }
    // Process file...
  });
};
```

### 2. Sanitize User Input

```tsx
const sanitizeHTML = (html: string): string => {
  // Remove script tags and dangerous content
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

### 3. Validate Price Inputs

```tsx
const validatePrice = (price: number): boolean => {
  return price > 0 && price <= 999999.99 && /^\d+(\.\d{1,2})?$/.test(price.toString());
};
```

## Monitoring & Analytics

### Track Form Completion

```tsx
useEffect(() => {
  // Track time spent on each tab
  const startTime = Date.now();

  return () => {
    const timeSpent = Date.now() - startTime;
    // Send analytics
    analytics.track('tab_view', {
      tab: activeTab,
      duration: timeSpent
    });
  };
}, [activeTab]);
```

### Track Form Abandonment

```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (formData.name || formData.description) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [formData]);
```

## Accessibility Enhancements

### Add ARIA Labels

```tsx
<input
  type="text"
  value={formData.name}
  onChange={(e) => handleInputChange('name', e.target.value)}
  aria-label="Product name"
  aria-required="true"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? 'name-error' : undefined}
/>
{errors.name && (
  <p id="name-error" role="alert" className="text-red-400 text-sm">
    {errors.name}
  </p>
)}
```

### Keyboard Navigation

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSubmit(e as any);
  }

  // Esc to cancel
  if (e.key === 'Escape') {
    handleCancel();
  }
};

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## Next Steps

1. Test the component thoroughly in development
2. Verify all API integrations work correctly
3. Test auto-save and recovery functionality
4. Validate form submissions
5. Check mobile responsiveness
6. Test with different shop configurations
7. Verify permission handling
8. Test with slow network conditions
9. Validate error handling
10. Perform accessibility audit

## Support Resources

- [React Router Documentation](https://reactrouter.com/)
- [Framer Motion API](https://www.framer.com/motion/)
- [Zustand Store Guide](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev/)
- [Sonner Toast Library](https://sonner.emilkowal.ski/)

## Component Checklist

- [x] All 7 tabs implemented
- [x] Form validation
- [x] Auto-save functionality
- [x] Image upload handling
- [x] Category selection
- [x] Campaign/Offer linking
- [x] SEO optimization
- [x] Sidebar controls
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] Glassmorphism styling
- [x] Accessibility features
- [x] API integration
- [x] LocalStorage backup

The ProductAddPage is now ready for integration and use!

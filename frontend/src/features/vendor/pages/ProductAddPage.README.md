# ProductAddPage Component

## Overview

A comprehensive product creation page for vendors with multiple tabs covering all aspects of product management, from basic information to SEO optimization.

## File Location

```
/src/features/vendor/pages/ProductAddPage.tsx
```

## Features

### 1. Basic Info Tab
- **Product Name** (required) - Main product identifier
- **Description** - Rich textarea for detailed product information
- **SKU** - Stock Keeping Unit with auto-generate functionality
- **Barcode** - Product barcode/UPC

### 2. Images Tab
- **Drag & Drop Upload** - Support for multiple image uploads
- **Set Primary Image** - Mark one image as the main product image
- **Image Management** - Remove unwanted images
- **Reorder Images** - Change image display order
- **Image Preview** - Visual preview of uploaded images

### 3. Pricing Tab
- **Regular Price** (required) - Base selling price
- **Compare-at Price** - Original price for showing discounts
- **Cost per Item** - Product cost for profit calculations
- **Tax Settings** - Enable/disable tax with custom rate
- **Profit Margin Calculator** - Real-time profit and margin display

### 4. Inventory Tab
- **Track Inventory** - Toggle inventory tracking
- **Stock Quantity** - Current available stock
- **Low Stock Alert** - Threshold for low stock warnings
- **Allow Backorders** - Enable purchases when out of stock
- **Stock Status** - Manual status override (in stock, low stock, out of stock)

### 5. Categories Tab
- **Hierarchical Category Selector** - Choose from existing categories
- **Autocomplete Search** - Quick category finding
- **Create Inline** - Add new categories without leaving the page
- **Tags Input** - Multiple tag support with easy add/remove

### 6. Campaigns/Offers Tab
- **Link to Campaigns** - Connect product to active campaigns
- **Link to Offers** - Associate with promotional offers
- **Flash Sale Toggle** - Enable time-limited flash sales
- **Flash Sale Price** - Special discounted price
- **Flash Sale End Date** - Automatic expiry datetime

### 7. SEO Tab
- **Meta Title** - SEO-optimized title (60 char limit)
- **Meta Description** - Search result snippet (160 char limit)
- **URL Slug** - Auto-generated from product name, editable
- **Preview Snippet** - Real-time search result preview

## Sidebar Features

### Status
- **Publication Status** - Draft or Published
- **Schedule Publishing** - Set future publish date/time

### Visibility
- **Public** - Visible to everyone
- **Private** - Only visible to shop owners
- **Password Protected** - Require password to view

### Quick Actions
- **Featured Toggle** - Mark as featured product
- **Preview** - View product preview in new tab
- **Save Draft** - Manual draft save

## Auto-Save & Recovery

The component automatically saves form data to localStorage every second, allowing recovery if the page is accidentally closed.

```typescript
// Auto-save trigger
useEffect(() => {
  const timer = setTimeout(() => {
    saveToLocalStorage();
  }, 1000);
  return () => clearTimeout(timer);
}, [formData, images]);
```

## Form Validation

Comprehensive validation ensures data integrity:

```typescript
const validateForm = (): boolean => {
  const newErrors = {};

  // Product name required
  if (!formData.name.trim()) {
    newErrors.name = 'Product name is required';
  }

  // Price must be positive
  if (!formData.price || formData.price <= 0) {
    newErrors.price = 'Price must be greater than 0';
  }

  // Inventory validation
  if (formData.trackInventory && formData.quantity < 0) {
    newErrors.quantity = 'Quantity cannot be negative';
  }

  // URL slug required
  if (!formData.slug.trim()) {
    newErrors.slug = 'URL slug is required';
  }

  return Object.keys(newErrors).length === 0;
};
```

## Smart Features

### Auto-Generate SKU
Automatically generates SKU based on shop name prefix:
```typescript
const generateSKU = () => {
  const prefix = shop?.name?.substring(0, 3).toUpperCase() || 'PRD';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`; // e.g., "FLX-A3B9C2"
};
```

### Auto-Generate Slug
Creates URL-friendly slug from product name:
```typescript
useEffect(() => {
  if (formData.name && !formData.slug) {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  }
}, [formData.name]);
```

### Profit Margin Calculator
Real-time profit calculations:
```typescript
const calculateProfitMargin = () => {
  if (formData.price && formData.costPerItem) {
    const margin = ((formData.price - formData.costPerItem) / formData.price) * 100;
    return margin.toFixed(2);
  }
  return '0.00';
};

const calculateProfit = () => {
  if (formData.price && formData.costPerItem) {
    return (formData.price - formData.costPerItem).toFixed(2);
  }
  return '0.00';
};
```

## Usage

```tsx
import { ProductAddPage } from '@/features/vendor/pages/ProductAddPage';

// In your router
<Route path="/shop/:shopId/vendor/products/add" element={<ProductAddPage />} />
```

## API Integration

The component integrates with the following API endpoints:

- `api.createProduct(data)` - Create new product
- `api.getVendorCategories(shopId)` - Load categories
- `api.getVendorCampaigns(shopId, params)` - Load campaigns
- `api.getVendorOffers(shopId, params)` - Load offers

## Data Structure

```typescript
interface FormData {
  // Basic Info
  name: string;
  description: string;
  sku: string;
  barcode: string;

  // Pricing
  price: number;
  compareAtPrice: number;
  costPerItem: number;
  taxable: boolean;
  taxRate: number;

  // Inventory
  trackInventory: boolean;
  quantity: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock';

  // Categories
  categoryId: string;
  tags: string[];

  // Campaigns/Offers
  campaignIds: string[];
  offerIds: string[];
  isFlashSale: boolean;
  flashSalePrice: number;
  flashSaleEndDate: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
  slug: string;

  // Sidebar
  status: 'draft' | 'published';
  scheduledPublishDate: string;
  isFeatured: boolean;
  visibility: 'public' | 'private' | 'password';
  password: string;
}
```

## Styling

Follows the glassmorphism design system:
- `GlassCard` components for sections
- Gradient buttons for primary actions
- Smooth animations with Framer Motion
- Responsive grid layout
- Custom scrollbars
- Purple/Pink gradient accents

## Error Handling

Comprehensive error handling with user feedback:
```typescript
try {
  await api.createProduct(productData);
  toast.success('Product created successfully');
  clearLocalStorage();
  navigate(`/shop/${shopId}/vendor/products`);
} catch (err: any) {
  toast.error('Failed to create product', {
    description: err?.response?.data?.message || 'An error occurred'
  });
}
```

## Accessibility

- Semantic HTML elements
- Proper label associations
- Keyboard navigation support
- Focus management
- Error announcements
- Required field indicators

## Performance Optimizations

1. **Debounced Auto-Save** - Prevents excessive localStorage writes
2. **Lazy Loading** - Categories, campaigns, and offers loaded on demand
3. **Optimized Re-renders** - Proper use of useEffect dependencies
4. **Image Optimization** - Client-side image preview with FileReader

## Future Enhancements

- [ ] Rich text editor for description
- [ ] Bulk image upload with progress
- [ ] Image cropping/editing tools
- [ ] Variant management (sizes, colors)
- [ ] Custom fields support
- [ ] Product duplication
- [ ] Import from CSV
- [ ] Multi-language support
- [ ] AI-generated descriptions
- [ ] Image URL import

## Dependencies

```json
{
  "react": "^19.1.1",
  "react-router-dom": "^7.8.2",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.542.0",
  "sonner": "^2.0.7",
  "zustand": "^5.0.2"
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Requires vendor authentication and shop context
- All data is validated before submission
- Auto-save provides data persistence
- Responsive design works on all screen sizes
- Integrates seamlessly with existing vendor dashboard

## Related Components

- `ProductsListPage` - Product listing and management
- `GlassCard` - Glassmorphism card component
- `VendorTopBar` - Navigation and context
- `VendorSidebar` - Main navigation menu

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

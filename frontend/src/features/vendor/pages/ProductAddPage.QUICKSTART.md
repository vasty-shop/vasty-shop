# ProductAddPage - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Add Route (30 seconds)

```tsx
// In your router (e.g., App.tsx)
import { ProductAddPage } from '@/features/vendor/pages/ProductAddPage';

<Route
  path="/shop/:shopId/vendor/products/add"
  element={<ProductAddPage />}
/>
```

### 2. Verify Dependencies (1 minute)

Check your `package.json` has these packages:
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

If missing, run:
```bash
npm install framer-motion lucide-react sonner zustand
```

### 3. Test Navigation (30 seconds)

From ProductsListPage, click "Add Product" button.
Should navigate to: `/shop/{shopId}/vendor/products/add`

### 4. Test Basic Functionality (2 minutes)

1. **Enter product name** → "Test Product"
2. **Set price** → "99.99"
3. **Click "Save Product"**
4. Should redirect to products list

### 5. Test Auto-Save (1 minute)

1. Fill in some fields
2. Wait 2 seconds
3. Refresh page
4. Should see "Draft restored" toast
5. Data should be preserved

## ✅ You're Done!

The component is fully functional and ready to use.

## 📋 Quick Feature Checklist

### All Tabs Working?
- [ ] Basic Info - Name, Description, SKU, Barcode
- [ ] Images - Upload, Preview, Set Primary
- [ ] Pricing - Price, Costs, Profit Calculator
- [ ] Inventory - Stock, Alerts, Backorders
- [ ] Categories - Select, Tags
- [ ] Campaigns - Link Campaigns/Offers, Flash Sale
- [ ] SEO - Meta Title, Description, Slug, Preview

### Sidebar Working?
- [ ] Status selector (Draft/Published)
- [ ] Schedule publishing
- [ ] Visibility settings
- [ ] Featured toggle
- [ ] Quick actions (Preview, Save Draft)

### Smart Features Working?
- [ ] Auto-generate SKU button
- [ ] Auto-generate slug from name
- [ ] Profit margin calculator
- [ ] Auto-save to localStorage
- [ ] Draft restoration
- [ ] Form validation

## 🎯 Common Tasks

### How to customize validation?
```tsx
// In ProductAddPage.tsx, find validateForm():
const validateForm = (): boolean => {
  const newErrors: Partial<Record<keyof FormData, string>> = {};

  // Add your custom validation:
  if (!formData.name.trim()) {
    newErrors.name = 'Product name is required';
  }

  // More validation...

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### How to add a new field?
```tsx
// 1. Add to FormData interface:
interface FormData {
  // ... existing fields
  myNewField: string;
}

// 2. Add to initial state:
const [formData, setFormData] = useState<FormData>({
  // ... existing fields
  myNewField: ''
});

// 3. Add input in render:
<input
  value={formData.myNewField}
  onChange={(e) => handleInputChange('myNewField', e.target.value)}
/>
```

### How to change default values?
```tsx
// Find the initial state in useState:
const [formData, setFormData] = useState<FormData>({
  name: '',
  description: '',
  price: 0,
  lowStockThreshold: 10,  // Change this
  taxRate: 0,             // Or this
  // ...
});
```

### How to add a new tab?
```tsx
// 1. Add to TabType:
type TabType = 'basic' | 'images' | 'pricing' | 'inventory' | 'categories' | 'campaigns' | 'seo' | 'shipping';

// 2. Add to tabs array:
const tabs = [
  // ... existing tabs
  { id: 'shipping' as TabType, label: 'Shipping', icon: Truck }
];

// 3. Add tab content:
{activeTab === 'shipping' && (
  <GlassCard hover={false}>
    <h3>Shipping Settings</h3>
    {/* Your content here */}
  </GlassCard>
)}
```

## 🐛 Troubleshooting

### Problem: Shop context not found
**Solution:** User must be logged in with vendor account and have shop set.
```tsx
const { shop } = useVendorAuthStore();
console.log('Shop:', shop); // Check if shop exists
```

### Problem: Auto-save not working
**Solution:** Check localStorage permissions
```tsx
// Test localStorage
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage works');
} catch (e) {
  console.error('❌ localStorage blocked:', e);
}
```

### Problem: Images not uploading
**Solution:** Check file size (max 5MB) and type (JPG, PNG, GIF)
```tsx
// Check in handleImageUpload function
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

### Problem: Categories not loading
**Solution:** Check API endpoint and shop ID
```tsx
// In loadCategories function
console.log('Loading categories for shop:', shop.id);
const data = await api.getVendorCategories(shop.id);
console.log('Categories loaded:', data);
```

## 📞 Need More Help?

- 📖 **Full Documentation:** See `ProductAddPage.README.md`
- 🔧 **Integration Guide:** See `ProductAddPage.INTEGRATION.md`
- 🎨 **Visual Guide:** See `ProductAddPage.VISUAL_GUIDE.md`
- 📊 **Summary:** See `ProductAddPage.SUMMARY.md`

## 🎉 Success Indicators

You know it's working when you see:
- ✅ All tabs are clickable and switch smoothly
- ✅ Form validation shows errors for required fields
- ✅ SKU auto-generate button creates unique SKUs
- ✅ Profit calculator updates when price/cost changes
- ✅ Auto-save updates "Last saved" timestamp
- ✅ Draft restoration works after page refresh
- ✅ Success toast appears after saving
- ✅ Redirects to products list after save

## ⚡ Performance Tips

- Images load instantly (no upload delay in UI)
- Auto-save is debounced (1 second)
- Validation runs immediately
- Tab switches are smooth (200ms animation)
- No unnecessary re-renders

## 🔒 Security Checklist

- [x] Shop ID validation
- [x] User authentication check
- [x] Input sanitization (via API)
- [x] File type validation
- [x] File size limits
- [x] XSS protection (React default)

## 📈 Next Steps

After basic setup:
1. Test all form fields
2. Verify API integration
3. Test on mobile devices
4. Run accessibility audit
5. Gather user feedback
6. Monitor error rates
7. Optimize based on usage

---

**Time to Productivity:** ~5 minutes
**Difficulty Level:** ⭐⭐ (Easy)
**Dependencies:** All included
**Status:** ✅ Production Ready

Happy coding! 🚀

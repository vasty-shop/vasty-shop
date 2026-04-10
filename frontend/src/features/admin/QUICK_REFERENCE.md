# Global Settings Page - Quick Reference Card

## 🚀 Quick Start

```typescript
// 1. Import
import { GlobalSettingsPage } from '@/features/admin/pages';

// 2. Add to Router
<Route path="/admin/settings" element={<GlobalSettingsPage />} />

// 3. Backend needs these endpoints:
// GET    /admin/settings       - Load all settings
// PATCH  /admin/settings       - Update settings
// POST   /admin/settings/logo  - Upload logo
```

## 📋 Tab Overview

| Tab | Icon | Fields | Purpose |
|-----|------|--------|---------|
| General | ⚙️ | Name, Logo, Email, Currency, Language | Basic platform info |
| Commission | 💲 | Rate, Min Order, Free Shipping | Revenue settings |
| Shops | 🏪 | Auto-approve, Docs, Product Limit | Shop policies |
| Payment | 💳 | Stripe, PayPal, COD toggles | Payment methods |
| Notifications | 🔔 | Email, Push, SMS toggles | Alert channels |
| Maintenance | ⚠️ | Mode toggle, Message | Downtime management |
| API | 🌐 | Version, Rate Limit, Webhook | Integration config |

## 🔑 Key Features

### Form Validation ✅
- **Zod schemas** for type-safe validation
- **Real-time feedback** on input change
- **Error messages** below invalid fields
- **Prevent save** when validation fails

### File Upload 📁
- **Image only** (file type check)
- **5MB max** (size validation)
- **Preview display** with remove button
- **Upload progress** indicator

### Change Tracking 💾
- **Unsaved changes** detection
- **Browser warning** on navigation
- **Save/Cancel buttons** appear when dirty
- **Auto-reload** after successful save

### Responsive Design 📱
- **Mobile**: 2-col tabs, 1-col forms
- **Tablet**: 4-col tabs, 2-col forms
- **Desktop**: 7-col tabs, 2-3-col forms

## 🎨 Styling Classes

```css
/* Core Components */
.glass-solid              /* Main container background */
.glass                    /* Secondary elements */

/* Gradients */
.from-purple-500.to-pink-500  /* Primary gradient */
.from-purple-400.to-pink-400  /* Text gradient */

/* States */
.border-red-500/50        /* Error state */
.border-purple-500/30     /* Active tab */
.bg-green-500/20          /* Success indicator */
```

## 📊 State Management

```typescript
// Form Data
generalSettings       // Platform info
commissionSettings    // Revenue config
shopSettings          // Shop policies
paymentSettings       // Payment methods
notificationSettings  // Alert preferences
maintenanceSettings   // Downtime config
apiSettings          // Integration setup

// UI State
activeTab            // Current tab ID
hasUnsavedChanges    // Dirty flag
isLoading            // Initial load
isSaving             // Save in progress
validationErrors     // Form errors
uploadingLogo        // Logo upload state
```

## 🔧 API Methods

```typescript
// Extended in lib/api.ts
api.getGlobalSettings()          // Load all
api.updateGlobalSettings(data)   // Save changes
api.uploadPlatformLogo(file)     // Upload image

// Generic helpers
api.get(url, config)
api.post(url, data, config)
api.patch(url, data, config)
api.delete(url, config)
```

## 📝 Example Response

```json
{
  "general": {
    "platformName": "FluxEZ Shop",
    "platformLogo": "https://cdn.../logo.png",
    "supportEmail": "support@fluxez.com",
    "defaultCurrency": "USD",
    "defaultLanguage": "en"
  },
  "commission": {
    "platformCommissionRate": 10,
    "minimumOrderAmount": 5,
    "freeShippingThreshold": 50
  },
  "shops": {
    "autoApproveShops": false,
    "requiredDocuments": ["business_license", "tax_id"],
    "maxProductsPerShop": 1000
  },
  "payment": {
    "stripe": { "enabled": true, "status": "active" },
    "paypal": { "enabled": false, "status": "inactive" },
    "cod": { "enabled": true, "status": "active" }
  },
  "notifications": {
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false
  },
  "maintenance": {
    "maintenanceMode": false,
    "maintenanceMessage": "We are performing maintenance..."
  },
  "api": {
    "webhookUrl": "https://example.com/webhook",
    "apiKey": "••••••••",
    "apiVersion": "v1",
    "rateLimitPerMinute": 60
  }
}
```

## ⚡ Common Tasks

### Add a New Field
```typescript
// 1. Add to state
const [generalSettings, setGeneralSettings] = useState({
  platformName: '',
  platformLogo: '',
  newField: ''  // ← Add here
});

// 2. Add to schema (if validating)
const generalSettingsSchema = z.object({
  platformName: z.string().min(1),
  newField: z.string().optional()  // ← Add here
});

// 3. Add input in JSX
<input
  value={generalSettings.newField}
  onChange={(e) => {
    setGeneralSettings({ ...generalSettings, newField: e.target.value });
    setHasUnsavedChanges(true);
  }}
/>
```

### Add a New Tab
```typescript
// 1. Add to tabs array
const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'newtab', label: 'New Tab', icon: Icon }  // ← Add
];

// 2. Add state
const [newTabSettings, setNewTabSettings] = useState({
  field1: '',
  field2: false
});

// 3. Add tab content in JSX
{activeTab === 'newtab' && (
  <div className="space-y-6">
    {/* Tab content */}
  </div>
)}

// 4. Include in save handler
if (activeTab === 'newtab') {
  updateData.newtab = newTabSettings;
}
```

### Customize Validation
```typescript
const customSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .refine(val => val.endsWith('@company.com'), 
      'Must be company email'),
  
  rate: z.number()
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot exceed 100')
    .multipleOf(0.1, 'Must be one decimal place')
});
```

## 🐛 Common Issues

### Issue: Changes not saving
```typescript
// Check: Is activeTab condition correct?
if (activeTab === 'general') {  // ← Must match tab id
  updateData.general = generalSettings;
}

// Check: Is API endpoint correct?
await api.patch('/admin/settings', updateData);  // ← Correct path
```

### Issue: Validation not showing
```typescript
// Check: Error cleared on change?
onChange={(e) => {
  setGeneralSettings({ ...generalSettings, field: e.target.value });
  if (validationErrors.field) {  // ← Must clear error
    setValidationErrors({ ...validationErrors, field: '' });
  }
}}
```

### Issue: Unsaved warning not appearing
```typescript
// Check: Setting dirty flag?
onChange={(e) => {
  setSettings({ ...settings, field: e.target.value });
  setHasUnsavedChanges(true);  // ← Must set to true
}}
```

## 🎯 Best Practices

1. **Always validate** before API calls
2. **Clear errors** on input change
3. **Set dirty flag** on every change
4. **Show loading states** during operations
5. **Use toast notifications** for feedback
6. **Handle all error cases** with try-catch
7. **Reload data** after successful save
8. **Mask sensitive data** in UI

## 📚 Related Files

```
frontend/
├── src/features/admin/
│   ├── pages/
│   │   ├── GlobalSettingsPage.tsx     ← Main component
│   │   └── index.ts                   ← Export
│   ├── GLOBAL_SETTINGS_README.md      ← Full docs
│   ├── COMPONENT_STRUCTURE.md         ← Visual guide
│   └── QUICK_REFERENCE.md             ← This file
│
└── src/lib/
    └── api.ts                         ← Extended with admin methods
```

## 🔗 Dependencies

```json
{
  "framer-motion": "Animations",
  "lucide-react": "Icons",
  "sonner": "Toast notifications",
  "zod": "Schema validation"
}
```

## ✨ Pro Tips

- Use `Cmd/Ctrl + F` to find fields quickly
- Tab key navigates between form fields
- Form auto-saves validation state
- Logo upload supports drag & drop
- All currency fields use 2 decimals
- Percentage fields use 1 decimal
- Status badges update automatically
- Maintenance mode is reversible

---

**Quick Links:**
- [Full Documentation](./GLOBAL_SETTINGS_README.md)
- [Component Structure](./COMPONENT_STRUCTURE.md)
- [API Docs](../../../lib/api.ts)

Last Updated: December 2025

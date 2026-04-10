# Global Settings Page - Admin Panel

## Overview
The Global Settings page allows administrators to configure platform-wide settings including general information, commission rates, shop policies, payment methods, notifications, maintenance mode, and API integration.

## File Location
`/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/features/admin/pages/GlobalSettingsPage.tsx`

## Features

### 1. General Settings
- **Platform Name**: Configure the name of your e-commerce platform
- **Platform Logo**: Upload and manage the platform logo (200x200px recommended, max 5MB)
- **Support Email**: Set the primary support contact email
- **Default Currency**: Choose from USD, EUR, GBP, JPY, AUD, CAD
- **Default Language**: Select from English, Spanish, French, German, Chinese, Japanese

### 2. Commission Settings
- **Platform Commission Rate**: Set the percentage commission taken from each sale (0-100%)
- **Minimum Order Amount**: Configure the minimum order value required
- **Free Shipping Threshold**: Set the order value that qualifies for free shipping

### 3. Shop Settings
- **Auto-approve New Shops**: Toggle automatic approval of shop registrations
- **Required Documents**: Select which documents are mandatory for shop verification:
  - Business License
  - Tax ID / EIN
  - Bank Account Verification
  - Identity Verification
  - Address Proof
- **Maximum Products Per Shop**: Limit the number of products each shop can create

### 4. Payment Settings
Enable/disable payment methods with status indicators:
- **Stripe**: Credit card and digital wallet payments
- **PayPal**: PayPal digital payments
- **Cash on Delivery (COD)**: Pay with cash upon delivery

Each payment method shows real-time status:
- Active (green)
- Inactive (gray)
- Error (red)

### 5. Notification Settings
Configure notification channels:
- **Email Notifications**: Send notifications via email
- **Push Notifications**: Browser push notifications
- **SMS Notifications**: Send notifications via SMS

### 6. Maintenance Mode
- **Enable Maintenance Mode**: Temporarily disable platform access for all users except administrators
- **Maintenance Message**: Customize the message displayed to users during maintenance
- **Warning Alert**: Visual indicator warning about the impact of enabling maintenance mode

### 7. API Integration
- **API Version**: Display current API version (read-only)
- **Rate Limit**: Configure API rate limit per minute
- **Webhook URL**: Set up webhook endpoint for real-time event notifications
- **API Key**: View (masked) and manage API key
- **Security Notice**: Information about API security best practices

## Technical Implementation

### State Management
The component uses React hooks for local state management:
- `useState` for form data and UI state
- `useEffect` for loading settings and handling unsaved changes warning
- `useRef` for file input references

### Validation
Form validation is implemented using Zod schemas:
```typescript
const generalSettingsSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required'),
  supportEmail: z.string().email('Invalid email address'),
  defaultCurrency: z.string().min(1, 'Currency is required'),
  defaultLanguage: z.string().min(1, 'Language is required')
});

const commissionSettingsSchema = z.object({
  platformCommissionRate: z.number().min(0).max(100),
  minimumOrderAmount: z.number().min(0),
  freeShippingThreshold: z.number().min(0)
});
```

### API Integration
The page uses the centralized API service from `@/lib/api`:

```typescript
// Load settings
const response = await api.get('/admin/settings');

// Update settings
await api.patch('/admin/settings', updateData);

// Upload logo
const formData = new FormData();
formData.append('file', file);
await api.post('/admin/settings/logo', formData);
```

### API Endpoints

#### GET `/admin/settings`
Retrieve all global settings.

**Response Structure:**
```json
{
  "general": {
    "platformName": "Vasty",
    "platformLogo": "https://...",
    "supportEmail": "support@vasty.shop",
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
    "maxProductsPerShop": 1000,
    "allowedCategories": []
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
    "webhookUrl": "",
    "apiKey": "••••••••",
    "apiVersion": "v1",
    "rateLimitPerMinute": 60
  }
}
```

#### PATCH `/admin/settings`
Update specific settings sections.

**Request Body:**
```json
{
  "general": { ... },
  "commission": { ... },
  // Only include sections being updated
}
```

#### POST `/admin/settings/logo`
Upload platform logo image.

**Request:** FormData with 'file' field
**Response:**
```json
{
  "url": "https://storage.example.com/logo.png"
}
```

## UI/UX Features

### Tabbed Interface
- 7 distinct tabs for different settings categories
- Active tab highlighting with gradient border
- Responsive grid layout (2 cols mobile → 4 cols tablet → 7 cols desktop)

### Visual Feedback
- Loading state with spinner during initial data fetch
- Save/Cancel buttons appear only when changes are made
- Unsaved changes warning before page navigation
- Success/error toast notifications
- Real-time validation error display
- Upload progress indicators

### Animations
All powered by Framer Motion:
- Page fade-in on load
- Bottom save button slide-up animation
- Smooth tab transitions

### Dark Theme Styling
- Glass morphism design with `glass-solid` class
- Gradient accents (purple-to-pink theme)
- Semi-transparent backgrounds
- High contrast text for readability
- Status indicators with color coding

## Usage Example

### Import and Add to Router
```typescript
import { GlobalSettingsPage } from '@/features/admin/pages';

// In your admin routes
<Route path="/admin/settings" element={<GlobalSettingsPage />} />
```

### Required Permissions
This page should only be accessible to users with admin role. Implement route protection:

```typescript
<Route 
  path="/admin/settings" 
  element={
    <ProtectedRoute requiredRole="admin">
      <GlobalSettingsPage />
    </ProtectedRoute>
  } 
/>
```

## Styling

### Required CSS Classes
The component uses these Tailwind CSS utility classes:
- `glass-solid`: Glass morphism background effect
- `glass`: Secondary glass effect
- Standard Tailwind utilities for spacing, colors, layout

### Custom Toggle Switch
The component includes a custom-styled toggle switch component:
```css
.w-11.h-6.bg-white/10.rounded-full.peer
  peer-checked:after:translate-x-full
  peer-checked:bg-gradient-to-r
  peer-checked:from-purple-500
  peer-checked:to-pink-500
```

## Error Handling

### Form Validation Errors
- Real-time validation on input change
- Error messages display below invalid fields
- Alert icon with red border on error state

### API Error Handling
```typescript
try {
  await api.patch('/admin/settings', updateData);
  toast.success('Settings saved successfully');
} catch (error: any) {
  console.error('Failed to save settings:', error);
  toast.error('Failed to save settings', {
    description: error.response?.data?.message || 'Please try again'
  });
}
```

## Security Considerations

1. **Admin-Only Access**: Always verify user role on both frontend and backend
2. **API Key Protection**: API keys are masked in the UI
3. **File Upload Validation**: 
   - File type checking (images only)
   - Size limit enforcement (5MB)
4. **Maintenance Mode Warning**: Clear warning before enabling

## Best Practices

1. **Single Source of Truth**: All settings loaded from API on mount
2. **Optimistic UI Updates**: Immediate visual feedback before API confirmation
3. **Graceful Degradation**: Error states handled with user-friendly messages
4. **Accessibility**: Semantic HTML, proper labels, keyboard navigation
5. **Performance**: Tab content conditionally rendered

## Future Enhancements

Potential additions for future versions:
- Bulk settings import/export
- Settings history and rollback
- Email template customization
- Advanced API analytics
- Multi-language support for settings labels
- Scheduled maintenance mode
- Settings backup and restore

## Dependencies

```json
{
  "react": "^18.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x",
  "sonner": "^1.x",
  "zod": "^3.x"
}
```

## Support

For issues or questions about the Global Settings page:
1. Check the API endpoint documentation
2. Verify backend implementation matches expected response structure
3. Ensure proper admin authentication
4. Review browser console for errors
5. Check network tab for failed API calls

---

**Created**: December 2025
**Last Updated**: December 2025
**Maintained by**: FluxEZ Shop Development Team

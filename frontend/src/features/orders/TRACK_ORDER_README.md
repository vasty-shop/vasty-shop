# Track Order Page - Fluxez E-Commerce Platform

## Overview

The Track Order Page is a comprehensive order tracking solution for Fluxez, providing customers with real-time updates on their order status, delivery progress, and detailed shipping information. This implementation is based on research and best practices from leading e-commerce and logistics platforms including Amazon, FedEx, UPS, DHL, and Shopify stores.

## Location

- **File Path**: `/frontend/src/features/orders/TrackOrderPage.tsx`
- **Route**: `/track-order`
- **Access**: Available from Header navigation and Footer links

## Features

### 1. Hero Section with Search
- **Eye-catching Hero**: Gradient background with "Track Your Order" heading
- **Search Bar**: Large, prominent search input for order numbers or tracking IDs
- **Search Button**: Clear call-to-action button with loading state
- **Example Text**: Helpful example showing order number format (e.g., "FL-2024-12345")
- **Guest Tracking**: No login required - accessible to all customers

### 2. Progress Timeline (5 Stages)
The order tracking displays a visual timeline with 5 distinct stages:

1. **Order Placed** ✓ (green checkmark when completed)
2. **Processing** ✓ (green checkmark when completed)
3. **Shipped** ← (current stage, lime green, pulsing animation)
4. **Out for Delivery** (gray, upcoming)
5. **Delivered** (gray, upcoming)

**Features**:
- Animated progress line showing completion percentage
- Pulsing animation on current stage
- Responsive design (horizontal on desktop, vertical on mobile)
- Color-coded stages (completed = green, current = lime with pulse, upcoming = gray)
- Smooth transitions and animations

### 3. Order Details Card

**Information Displayed**:
- **Order Number**: Full order reference (e.g., FL-2024-12345)
- **Order Date**: When the order was placed
- **Estimated Delivery Date**: Large, bold, prominently displayed
- **Carrier**: Shipping carrier name (FedEx/UPS/USPS/DHL)
- **Shipping Method**: Type of shipping selected
- **Tracking Number**:
  - Displayed in monospace font for easy reading
  - One-click copy to clipboard functionality
  - Direct link to carrier website for detailed tracking
  - External link indicator icon

**Quick Actions**:
- Share tracking link (uses native share API when available)
- Enable/disable email and SMS notifications
- Visual feedback for all interactions (toast notifications)

### 4. Shipping Address

**Display**:
- Recipient name
- Complete delivery address
- City, state, and ZIP code
- Country
- Map integration placeholder (ready for Google Maps/Mapbox integration)

### 5. Items in Order

**Product Display**:
- Product images (80x80px thumbnails)
- Product names
- Quantities
- Individual prices
- Size and color variants
- Hover effects for better UX
- Order total prominently displayed at bottom

### 6. Delivery Updates Timeline

**Chronological History**:
- Date and time stamps for each update
- Status descriptions
- Location information with map pin icons
- Detailed descriptions of each tracking event
- Visual timeline with connecting lines
- Most recent update highlighted at top
- Reverse chronological order (newest first)

**Example Updates**:
```
Feb 15, 2:30 PM - Out for delivery
📍 New York, NY
Package is out for delivery and will arrive today

Feb 15, 9:00 AM - Arrived at local facility
📍 New York Distribution Center
Package has arrived at the local facility

Feb 14, 6:45 PM - In transit
📍 Philadelphia, PA
Package is in transit to next facility
```

### 7. Contact Support Section

**Features**:
- "Need help with your order?" heading
- Contact customer service button (links to /contact page)
- Direct call button (tel: link)
- Email button (mailto: link)
- Link to FAQ page
- Gradient background to stand out
- Quick action buttons for common tasks

### 8. Quick Actions Sidebar

**Available Actions**:
- **Download Shipping Label**: PDF download (ready to implement)
- **Report an Issue**: Direct link to support
- **Track on Carrier**: External link to carrier tracking page

### 9. Additional Features

**Guest Tracking**:
- No login required
- Accessible to anyone with order number or tracking ID
- Secure without exposing sensitive information

**Email/SMS Notifications**:
- Toggle to enable/disable notifications
- Visual indicator showing current state (bell icon)
- Toast confirmation messages
- Persistent state (ready for backend integration)

**Share Tracking Link**:
- Uses native Web Share API when available
- Fallback to clipboard copy for unsupported browsers
- Share order details with family/friends

**Copy Tracking Number**:
- One-click copy functionality
- Visual feedback with checkmark
- Auto-reset after 2 seconds

**Carrier Integration**:
- Direct links to FedEx, UPS, USPS, DHL tracking pages
- External link indicator icon
- Opens in new tab with security attributes

## Technical Implementation

### Technologies Used
- **React 18** with TypeScript
- **Framer Motion** for animations and transitions
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Sonner** for toast notifications
- **Web Share API** for native sharing

### Type Definitions

```typescript
interface TrackingUpdate {
  date: string;
  time: string;
  status: string;
  location?: string;
  description: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface OrderData {
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  carrierUrl: string;
  currentStatus: number; // 0-4 representing the 5 stages
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  trackingHistory: TrackingUpdate[];
  totalAmount: number;
  shippingMethod: string;
}
```

### Animation Features

1. **Hero Section**:
   - Fade in with slide up animation (duration: 0.6s)
   - Decorative background elements with blur

2. **Search Results**:
   - Smooth appearance with fade and slide (duration: 0.5s)
   - Exit animation when clearing results
   - AnimatePresence for smooth transitions

3. **Progress Timeline**:
   - Staggered animation for each stage (0.1s delay between)
   - Animated progress line (1s duration)
   - Pulsing current stage indicator
   - Scale animation on completion checkmarks

4. **Cards and Updates**:
   - Smooth transitions on hover
   - Staggered appearance of tracking updates
   - Slide-in animations from left

### State Management

```typescript
// Search and display state
const [searchQuery, setSearchQuery] = useState('');
const [isSearching, setIsSearching] = useState(false);
const [orderData, setOrderData] = useState<OrderData | null>(null);

// Feature toggles
const [notificationsEnabled, setNotificationsEnabled] = useState(false);
const [copied, setCopied] = useState(false);
```

### Responsive Breakpoints

```css
/* Mobile-first approach */
Mobile: < 768px   - Vertical timeline, stacked cards
Tablet: 768-1023px - 2-column layout
Desktop: ≥ 1024px  - 3-column grid, horizontal timeline
```

## Usage

### Basic Usage

```tsx
import { TrackOrderPage } from '@/features/orders';

// In your router
<Route path="/track-order" element={<TrackOrderPage />} />
```

### Navigation Links

The page is accessible from:
- Header navigation ("Track Order" link)
- Footer ("Order Tracking" link in Customer Service section)
- Direct URL: `/track-order`
- Account dropdown menu

## Mock Data

The current implementation uses mock data for demonstration:

```typescript
const MOCK_ORDER_DATA: OrderData = {
  orderNumber: 'FL-2024-12345',
  currentStatus: 2, // Currently at "Shipped" stage
  carrier: 'FedEx',
  trackingNumber: '1234567890123',
  // ... full order details
};
```

### Integration with Real API

To connect to a real backend:

1. **Replace the mock data simulation in `handleSearch()`**:

```typescript
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!searchQuery.trim()) {
    toast.error('Please enter an order number or tracking ID');
    return;
  }

  setIsSearching(true);

  try {
    const response = await fetch(`/api/orders/track?query=${searchQuery}`);

    if (!response.ok) {
      throw new Error('Order not found');
    }

    const data = await response.json();
    setOrderData(data);
    toast.success('Order found!');
  } catch (error) {
    toast.error('Order not found. Please check your order number.');
    setOrderData(null);
  } finally {
    setIsSearching(false);
  }
};
```

2. **Update the notification toggle**:

```typescript
const handleToggleNotifications = async () => {
  try {
    await fetch('/api/orders/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: orderData?.orderNumber,
        enabled: !notificationsEnabled
      })
    });

    setNotificationsEnabled(!notificationsEnabled);
    toast.success(
      notificationsEnabled
        ? 'Notifications disabled'
        : 'Notifications enabled!'
    );
  } catch (error) {
    toast.error('Failed to update notifications');
  }
};
```

3. **Implement actual download functionality**:

```typescript
const handleDownloadLabel = async () => {
  try {
    const response = await fetch(`/api/orders/${orderData?.orderNumber}/label`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipping-label-${orderData?.orderNumber}.pdf`;
    a.click();
    toast.success('Shipping label downloaded!');
  } catch (error) {
    toast.error('Failed to download label');
  }
};
```

4. **Connect map integration**:

```tsx
// Replace map placeholder with Google Maps
<iframe
  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(addressString)}`}
  width="100%"
  height="160"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
/>
```

## UX Best Practices

Based on research from industry leaders:

### From Amazon:
✓ Clear order number display
✓ Prominent estimated delivery date
✓ Detailed product information with images
✓ Buy again functionality (future enhancement)

### From FedEx/UPS/DHL:
✓ Comprehensive tracking timeline
✓ Location-based updates
✓ Direct carrier tracking integration
✓ Map visualization

### From Shopify Stores:
✓ Clean, modern design
✓ Mobile-first approach
✓ Guest tracking without login
✓ Share functionality

### Fluxez Branding:
✓ Lime green (#84cc16) for primary actions and highlights
✓ Consistent with site-wide design system
✓ Smooth animations and transitions
✓ Card-based layout with shadows
✓ Professional gradients

## Accessibility

- ✓ Semantic HTML structure
- ✓ ARIA labels for interactive elements
- ✓ Keyboard navigation support
- ✓ Screen reader friendly
- ✓ High contrast ratios (WCAG AA compliant)
- ✓ Focus indicators on all interactive elements
- ✓ Accessible forms with proper labels
- ✓ Alternative text for icons

## Performance Optimization

- ✓ Lazy loading for images
- ✓ Optimized animations with GPU acceleration (transform, opacity)
- ✓ Minimal re-renders with proper React patterns
- ✓ Code splitting for route-level optimization
- ✓ Debounced search input (ready to implement)
- ✓ AnimatePresence for smooth mount/unmount
- ✓ CSS containment for animation performance

## Browser Support

- ✓ Chrome/Edge (latest 2 versions)
- ✓ Firefox (latest 2 versions)
- ✓ Safari (latest 2 versions)
- ✓ Mobile browsers (iOS Safari, Chrome Mobile)
- ✓ Progressive enhancement for older browsers

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live tracking
2. **Push Notifications**: Browser notifications for delivery updates
3. **Interactive Map**: Show delivery route and current driver location
4. **Multiple Languages**: i18n support for global customers
5. **Order History**: Save and view past tracking searches (local storage)
6. **Estimated Time Window**: Show estimated delivery time window
7. **Driver Contact**: Direct communication with delivery driver
8. **Delivery Instructions**: Add special delivery instructions
9. **Photo Proof**: Upload delivery photo when package arrives
10. **Analytics**: Track user engagement with tracking features
11. **QR Code**: Generate QR code for easy mobile access
12. **Voice Assistant**: Alexa/Google Assistant integration
13. **Delivery Preferences**: Choose delivery time/location
14. **Package Insurance**: Add insurance during tracking
15. **Subscription Tracking**: Track recurring subscription orders

## Integration Points

- **Orders Page** (`/orders`): Link to order history
- **Contact Page** (`/contact`): Customer support
- **FAQ Page** (`/faq`): Common questions
- **Profile Page** (`/profile`): User account settings
- **Email Notifications**: Link back to tracking page
- **SMS Notifications**: Short link to tracking page

## Error Handling

```typescript
// Order not found
if (!orderData) {
  toast.error('Order not found. Please check your order number.');
}

// Network errors
try {
  // API call
} catch (error) {
  toast.error('Unable to fetch order details. Please try again.');
}

// Invalid input
if (!searchQuery.trim()) {
  toast.error('Please enter an order number or tracking ID');
}
```

## Testing Recommendations

1. **Unit Tests**:
   - Test search functionality
   - Test state updates
   - Test utility functions (copy, share)

2. **Integration Tests**:
   - Test navigation flow
   - Test API integration
   - Test notification toggles

3. **E2E Tests**:
   - Full user journey from search to viewing details
   - Test all action buttons
   - Test responsive layouts

4. **Visual Regression**:
   - Ensure consistent UI across browsers
   - Test animation performance
   - Verify mobile responsiveness

5. **Accessibility Tests**:
   - WCAG 2.1 AA compliance
   - Screen reader testing
   - Keyboard navigation testing

## Dependencies

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x",
  "sonner": "^1.x",
  "tailwindcss": "^3.x"
}
```

## File Structure

```
/features/orders/
├── TrackOrderPage.tsx           # Main track order component
├── OrdersPage.tsx              # Orders list page
├── index.ts                    # Exports
├── README.md                   # Orders page documentation
└── TRACK_ORDER_README.md       # This file
```

## Environment Variables

```env
# API endpoints
VITE_API_BASE_URL=https://api.fluxez.com
VITE_TRACKING_API_URL=https://api.fluxez.com/tracking

# Google Maps (optional)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Feature flags
VITE_ENABLE_REAL_TIME_TRACKING=false
VITE_ENABLE_NOTIFICATIONS=true
```

## Analytics Events

Track these events for business insights:

```typescript
// When user searches for order
analytics.track('Order Tracking Search', {
  orderNumber: searchQuery,
  timestamp: new Date(),
});

// When order is found
analytics.track('Order Tracking View', {
  orderNumber: orderData.orderNumber,
  status: orderData.currentStatus,
});

// When user enables notifications
analytics.track('Tracking Notifications Enabled', {
  orderNumber: orderData.orderNumber,
});

// When user shares tracking
analytics.track('Tracking Link Shared', {
  orderNumber: orderData.orderNumber,
  method: 'native_share' | 'clipboard',
});
```

## Support

For questions or issues:
- **Email**: dev@fluxez.com
- **Slack**: #fluxez-frontend
- **Documentation**: https://docs.fluxez.com
- **Bug Reports**: https://github.com/fluxez/issues

## License

Proprietary - Fluxez E-Commerce Platform

---

**Created**: October 26, 2025
**Version**: 1.0.0
**Author**: Fluxez Development Team
**Based on**: Amazon, FedEx, UPS, DHL, Shopify research

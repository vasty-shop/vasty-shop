# Track Order Page - Quick Start Guide

## Access the Page

Navigate to: `http://localhost:5173/track-order`

Or click "Track Order" in the header navigation.

## Quick Test

1. **Open the page** - You'll see the hero section with search bar
2. **Enter any text** in the search box (e.g., "FL-2024-12345")
3. **Click "Track Order"** button
4. **View the results** - Mock order data will be displayed

## Features Overview

### Hero Section
- Gradient background (lime green to emerald)
- Large search bar
- Example order number shown

### Progress Timeline
- 5 stages: Order Placed → Processing → Shipped → Out for Delivery → Delivered
- Current stage pulses with lime green color
- Completed stages show green checkmarks
- Responsive: Horizontal on desktop, vertical on mobile

### Order Details
- Order number, date, estimated delivery
- Carrier and tracking info
- Copy tracking number (click copy icon)
- Track on carrier website (external link)

### Items Display
- Product images and details
- Size, color, quantity
- Individual prices
- Order total

### Delivery Timeline
- Chronological updates (newest first)
- Date, time, location, description
- Visual timeline with dots and connecting lines

### Shipping Address
- Complete delivery address
- Map placeholder (ready for Google Maps)

### Quick Actions
- Share tracking link
- Enable/disable notifications
- Download shipping label
- Report issue
- Contact support

## Interactive Elements

### 1. Search
```
Input: Any text (e.g., "FL-2024-12345")
Output: Mock order data displayed
Loading: Shows spinner and "Searching..." text
```

### 2. Copy Tracking Number
```
Action: Click copy icon next to tracking number
Result: Number copied to clipboard
Feedback: Icon changes to checkmark, toast notification
```

### 3. Share Tracking
```
Action: Click share icon in order details header
Result: Native share dialog (if supported) or copies link
Feedback: Toast notification
```

### 4. Toggle Notifications
```
Action: Click bell icon
Result: Toggle between enabled/disabled
Feedback: Bell icon changes color, toast notification
```

### 5. External Links
```
- Track on Carrier: Opens carrier website in new tab
- Call Us: Opens phone dialer
- Email: Opens email client
- Contact Support: Navigates to /contact page
- FAQ: Navigates to /faq page
```

## Mobile Experience

On mobile devices:
- Vertical progress timeline
- Stacked cards
- Full-width buttons
- Simplified layout
- Touch-friendly tap targets

## Animations

All animations are smooth and GPU-accelerated:
- Fade in on page load
- Slide in for search results
- Pulse on current tracking stage
- Staggered appearance of timeline events
- Hover effects on cards and buttons

## Testing Checklist

- [ ] Page loads without errors
- [ ] Search bar accepts input
- [ ] Search button works and shows loading state
- [ ] Order details display correctly
- [ ] Progress timeline shows correct stage
- [ ] All buttons are clickable
- [ ] Copy tracking number works
- [ ] Share functionality works
- [ ] Toast notifications appear
- [ ] Mobile layout is responsive
- [ ] All links work correctly
- [ ] Animations are smooth

## Color Reference

- **Primary Lime**: `#84cc16` - Main brand color
- **Lime Dark**: `#65a30d` - Hover states
- **Success Green**: `#22c55e` - Completed stages
- **Text Primary**: `#0f172a` - Main text
- **Text Secondary**: `#64748b` - Secondary text
- **Gray**: `#e5e7eb` - Upcoming stages

## Common Issues

### Search Not Working
- Check if mock data is properly configured
- Verify state management is working
- Check console for errors

### Animations Choppy
- Ensure GPU acceleration is enabled
- Check browser performance
- Reduce motion in accessibility settings if needed

### Layout Broken
- Clear browser cache
- Check Tailwind CSS is compiled
- Verify all dependencies are installed

## Next Steps

1. **Connect to Real API**: Replace mock data with actual API calls
2. **Add Map Integration**: Implement Google Maps or Mapbox
3. **Enable Notifications**: Set up email/SMS notification system
4. **Implement Download**: Add PDF generation for shipping labels
5. **Add Analytics**: Track user interactions

## Additional Resources

- [Full Documentation](./TRACK_ORDER_README.md)
- [Orders Page](./README.md)
- [Contact Page](/contact)
- [FAQ Page](/faq)

---

Need help? Contact the development team or check the full documentation.

# Shop Approvals Page - Implementation Guide

## Overview

The Shop Approvals Page (`ShopApprovalsPage.tsx`) is a comprehensive admin panel component for reviewing and managing shop registration requests in the Fluxez-Shop platform.

## Features Implemented

### 1. Shop List Table
- **Columns:**
  - Shop (with logo/avatar and name)
  - Owner (name and email)
  - Created date
  - Status (pending/approved/rejected)
  - Quick actions

- **Data Display:**
  - Logo/avatar with fallback gradient
  - Shop name and slug
  - Owner details
  - Formatted creation date
  - Color-coded status badges

### 2. Filtering & Search
- **Status Filters:**
  - All
  - Pending
  - Approved
  - Rejected

- **Search:**
  - Search by shop name
  - Search by owner email
  - Search by owner name
  - Real-time client-side filtering

### 3. Pagination
- **Features:**
  - Configurable items per page (default: 10)
  - Page navigation with previous/next
  - Direct page number selection
  - Smart page number display with ellipsis
  - Total pages and current page indicator

### 4. Shop Details Modal
- **Shop Information:**
  - Logo and banner display
  - Shop name and slug
  - Description
  - Status badge
  - Created/Updated timestamps

- **Owner Details:**
  - Full name
  - Email address
  - User ID

- **Business Documents:**
  - List of uploaded documents (if any)
  - Download links
  - Document type indicators

- **Rejection Reason:**
  - Displayed for rejected shops
  - Highlighted in red alert box

### 5. Actions

#### View Shop (Eye Icon)
- Opens detailed modal
- Shows all shop information
- Available for all status types

#### Approve Shop (Green Check)
- Available only for pending shops
- Requires confirmation dialog
- Updates shop status to "approved"
- Shows success toast notification
- Refreshes shop list

#### Reject Shop (Red X)
- Available only for pending shops
- Requires rejection reason
- Requires confirmation dialog
- Updates shop status to "rejected"
- Sends reason to backend
- Shows success toast notification
- Refreshes shop list

### 6. UI/UX Features

#### Loading States
- Skeleton loaders for initial load
- Loading spinner on refresh button
- Disabled state during actions
- Action loading indicators

#### Empty States
- No shops found message
- Clear search button when filtering
- Icon and descriptive text
- Gradient styling

#### Confirmation Dialogs
- Approve confirmation
- Reject confirmation with reason
- Variant styling (danger/info)

#### Toast Notifications
- Success messages
- Error messages with details
- Loading state messages

#### Animations
- Framer Motion for smooth transitions
- Fade-in effects
- Scale animations for modals
- Staggered list item animations

## API Integration

### Endpoints Used

```typescript
// Fetch shops
GET /admin/shops
  Params: { status?, search?, page?, limit? }
  Returns: { data: Shop[], total: number }

// Approve shop
PATCH /admin/shops/:id/approve
  Body: {}
  Returns: { success: boolean }

// Reject shop
PATCH /admin/shops/:id/reject
  Body: { reason: string }
  Returns: { success: boolean }
```

### API Methods Added to `src/lib/api.ts`

```typescript
async getAdminShops(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; total: number }>

async approveShop(shopId: string): Promise<any>

async rejectShop(shopId: string, reason: string): Promise<any>
```

## TypeScript Interfaces

```typescript
interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  businessDocuments?: {
    name: string;
    url: string;
    type: string;
  }[];
  metadata?: any;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
```

## Styling

### Color Scheme
- **Approved:** Green gradient (`bg-green-500/20`, `text-green-400`, `border-green-500/30`)
- **Rejected:** Red gradient (`bg-red-500/20`, `text-red-400`, `border-red-500/30`)
- **Pending:** Yellow gradient (`bg-yellow-500/20`, `text-yellow-400`, `border-yellow-500/30`)
- **Actions:** Purple/Pink gradient for primary actions

### Design System
- Glass morphism effects (`bg-white/5 backdrop-blur-xl`)
- Dark theme optimized
- Border styling with transparency
- Responsive layout
- Custom scrollbar styling

## Usage

### Route Setup (Example)
```typescript
import { ShopApprovalsPage } from '@/features/admin/pages';

// In your router configuration
<Route path="/admin/shops/approvals" element={<ShopApprovalsPage />} />
```

### Integration with Admin Layout
```typescript
// In admin sidebar or navigation
<NavLink to="/admin/shops/approvals">
  <Store className="w-5 h-5" />
  <span>Shop Approvals</span>
</NavLink>
```

## Dependencies

```json
{
  "react": "^18.x",
  "framer-motion": "^10.x",
  "lucide-react": "latest",
  "sonner": "latest"
}
```

## File Structure

```
src/features/admin/
├── pages/
│   ├── ShopApprovalsPage.tsx     # Main component
│   ├── index.ts                   # Export barrel
│   └── SHOP_APPROVALS_README.md  # This file
└── ...
```

## Key Functions

### fetchShops()
Fetches shops from the API with current filters and pagination settings.

### handleApproveShop(shopId)
Approves a shop after confirmation, updates UI and shows notification.

### handleRejectShop(shopId)
Rejects a shop with a reason after confirmation, updates UI and shows notification.

### handleViewShop(shop)
Opens the detailed modal for viewing shop information.

### getStatusBadge(status)
Returns appropriate Tailwind classes for status badge styling.

### formatDate(dateString)
Formats ISO date strings to readable format with date and time.

## Best Practices Followed

1. **API Client Consistency:** Uses `api` from `@/lib/api` - never direct axios
2. **POST Body Safety:** Always passes `{}` for empty bodies
3. **TypeScript:** Properly typed interfaces and props
4. **Error Handling:** Try-catch blocks with user-friendly error messages
5. **Loading States:** Proper loading indicators during async operations
6. **User Confirmation:** Dialogs for destructive actions
7. **Responsive Design:** Mobile-first approach with responsive breakpoints
8. **Accessibility:** Proper button states, disabled attributes, and ARIA-friendly structure

## Future Enhancements

- [ ] Bulk approve/reject actions
- [ ] Export shops to CSV/Excel
- [ ] Advanced filtering (date range, owner type)
- [ ] Shop analytics preview
- [ ] Email notification preview
- [ ] Comment/notes system for rejections
- [ ] Shop verification checklist
- [ ] Approval workflow history

## Troubleshooting

### Issue: Shops not loading
**Solution:** Check API endpoint configuration and authentication headers

### Issue: Approval/Rejection not working
**Solution:** Verify backend endpoints and user permissions

### Issue: Search not working
**Solution:** Ensure search query is properly passed to API or client-side filter

### Issue: Pagination not updating
**Solution:** Check that `fetchShops()` is called when page changes

## Related Files

- `/src/lib/api.ts` - API methods for shop management
- `/src/hooks/useDialog.ts` - Dialog hook for confirmations
- `/src/components/ui/ConfirmDialog.tsx` - Confirmation dialog component
- `/src/components/ui/AlertDialog.tsx` - Alert dialog component

## Author Notes

This component follows the Fluxez-Shop design system with glass morphism, dark theme optimization, and smooth animations. All API calls are properly abstracted through the centralized API layer, and error handling provides meaningful feedback to users.

The component is production-ready and includes all requested features:
✅ Shop list table with filtering
✅ Search functionality
✅ Pagination
✅ Detailed shop modal
✅ Approve/Reject actions
✅ Loading states
✅ Empty states
✅ Toast notifications
✅ Confirmation dialogs
✅ Framer Motion animations
✅ Tailwind CSS dark theme
✅ TypeScript best practices

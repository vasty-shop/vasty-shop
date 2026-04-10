# Shop Approvals Page - Quick Reference

## File Location
```
src/features/admin/pages/ShopApprovalsPage.tsx
```

## Import & Usage
```typescript
import { ShopApprovalsPage } from '@/features/admin/pages';

// In router
<Route path="/admin/shops/approvals" element={<ShopApprovalsPage />} />
```

## API Methods Used
```typescript
// From src/lib/api.ts
api.getAdminShops({ status, search, page, limit })
api.approveShop(shopId)
api.rejectShop(shopId, reason)
```

## Key Features
- 📋 Shop list table with filtering
- 🔍 Real-time search (name, email, owner)
- 🎯 Status filters (All/Pending/Approved/Rejected)
- 📄 Pagination with smart navigation
- 👁️ Detailed shop modal
- ✅ Approve action (pending only)
- ❌ Reject action with reason (pending only)
- 🎨 Loading states & animations
- 🔔 Toast notifications
- ⚠️ Confirmation dialogs

## Status Badge Colors
- **Pending:** Yellow (`text-yellow-400`)
- **Approved:** Green (`text-green-400`)
- **Rejected:** Red (`text-red-400`)

## Actions Available
| Status    | View | Approve | Reject |
|-----------|------|---------|--------|
| Pending   | ✅   | ✅      | ✅     |
| Approved  | ✅   | ❌      | ❌     |
| Rejected  | ✅   | ❌      | ❌     |

## Modal Sections
1. **Header:** Shop logo, name, slug, close button
2. **Status Badge:** Current approval status
3. **Banner:** Shop banner image (if available)
4. **Shop Info:** Description
5. **Owner Details:** Name, email
6. **Business Docs:** Downloadable documents
7. **Rejection Reason:** Shown for rejected shops
8. **Actions:** Approve/Reject with reason input

## Key Props & State
```typescript
// Main state
const [shops, setShops] = useState<Shop[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
const [currentPage, setCurrentPage] = useState(1);
```

## Dependencies
```bash
npm install framer-motion lucide-react sonner
```

## Example Backend Response
```json
{
  "data": [
    {
      "id": "shop_123",
      "name": "Tech Store",
      "slug": "tech-store",
      "description": "Electronics and gadgets",
      "logo": "https://...",
      "banner": "https://...",
      "status": "pending",
      "ownerId": "user_456",
      "ownerEmail": "owner@example.com",
      "ownerName": "John Doe",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 25
}
```

## Common Tasks

### Approve a shop
1. Click eye icon to view details
2. Review shop information
3. Click "Approve Shop" button
4. Confirm in dialog
5. Shop status updates to "approved"

### Reject a shop
1. Click eye icon to view details
2. Enter rejection reason in textarea
3. Click "Reject Shop" button
4. Confirm in dialog
5. Shop status updates to "rejected"

### Search shops
- Type in search box
- Searches: shop name, owner email, owner name
- Updates in real-time

### Filter by status
- Click filter buttons: All, Pending, Approved, Rejected
- Table updates immediately

### Navigate pages
- Use Previous/Next arrows
- Click page numbers directly
- See current page and total pages

## Styling Classes Used
```css
/* Glass morphism */
.bg-white/5 .backdrop-blur-xl .border-white/10

/* Gradients */
.bg-gradient-to-r .from-purple-400 .to-pink-400

/* Status badges */
.bg-green-500/20 .text-green-400 .border-green-500/30
.bg-yellow-500/20 .text-yellow-400 .border-yellow-500/30
.bg-red-500/20 .text-red-400 .border-red-500/30

/* Scrollbar */
.custom-scrollbar
```

## Icons Used (lucide-react)
- Search, Filter, X (Close)
- CheckCircle (Approve), XCircle (Reject)
- Eye (View), Calendar, Mail, User
- Building2, FileText, AlertCircle
- RefreshCw, Download, ChevronLeft, ChevronRight
- Store

## Error Handling
```typescript
try {
  await api.approveShop(shopId);
  toast.success('Shop approved successfully');
} catch (err: any) {
  toast.error('Failed to approve shop', {
    description: err?.response?.data?.message || 'An error occurred'
  });
}
```

## Tips
- Always provide a clear rejection reason
- Use the search feature for quick lookups
- Review all shop details before approving
- Check business documents if available
- Monitor pending shops regularly

# Shop Approvals Page - Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header Section                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Shop Approvals                          [Refresh] [Export]│  │
│  │ Review and manage shop registration requests (X shops)    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Filters & Search                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [🔍 Search...]                [All][Pending][Approved]  │   │
│  │                                        [Rejected]         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Shop List Table                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Shop         │ Owner         │ Created    │ Status │ Actions││
│  ├─────────────────────────────────────────────────────────┤   │
│  │ [Logo] Name  │ email@.com    │ Jan 1      │ Pending│ [👁️][✓]││
│  │ [Logo] Name  │ email@.com    │ Jan 2      │ Approved│ [👁️]  ││
│  │ [Logo] Name  │ email@.com    │ Jan 3      │ Rejected│ [👁️]  ││
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Pagination                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Page 1 of 5           [◀] [1] [2] [3] ... [5] [▶]      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Shop Details Modal

```
┌─────────────────────────────────────────────────────┐
│ [Logo]  Shop Name                            [✕]   │
│         @shop-slug                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Status Badge: Pending]      Created: Jan 1, 2024   │
│                              Updated: Jan 1, 2024   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ [Banner Image]                               │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌─ Shop Information ───────────────────────────┐   │
│ │ [🏢] Description: ...                         │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌─ Owner Details ──────────────────────────────┐   │
│ │ [👤] Name: John Doe                           │   │
│ │ [📧] Email: john@example.com                  │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌─ Business Documents ─────────────────────────┐   │
│ │ [📄] Document.pdf                      [⬇]    │   │
│ │ [📄] License.pdf                       [⬇]    │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌─ Take Action (Pending Only) ─────────────────┐   │
│ │ Rejection Reason (optional):                  │   │
│ │ [________________________________]            │   │
│ │                                                │   │
│ │ [✓ Approve Shop]  [✕ Reject Shop]            │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
ShopApprovalsPage
├── Header
│   ├── Title & Description
│   └── Actions
│       ├── Refresh Button
│       └── Export Button
│
├── Filters & Search Section
│   ├── Search Input
│   └── Status Filters
│       ├── All
│       ├── Pending
│       ├── Approved
│       └── Rejected
│
├── Table Section
│   ├── Table Header
│   └── Table Body
│       └── Shop Row (repeated)
│           ├── Shop Info (Logo, Name, Slug)
│           ├── Owner Info (Name, Email)
│           ├── Created Date
│           ├── Status Badge
│           └── Actions
│               ├── View (Eye Icon)
│               ├── Approve (Check Icon) - Pending only
│               └── Reject (X Icon) - Pending only
│
├── Pagination
│   ├── Page Info
│   ├── Previous Button
│   ├── Page Numbers
│   └── Next Button
│
├── Shop Details Modal (Conditional)
│   ├── Modal Header
│   │   ├── Shop Logo
│   │   ├── Shop Name & Slug
│   │   └── Close Button
│   │
│   ├── Status & Dates
│   │   ├── Status Badge
│   │   └── Timestamps
│   │
│   ├── Banner Image (if available)
│   │
│   ├── Shop Information Section
│   │   └── Description
│   │
│   ├── Owner Details Section
│   │   ├── Name
│   │   └── Email
│   │
│   ├── Business Documents Section (if available)
│   │   └── Document List
│   │       └── Document Item (repeated)
│   │           ├── Name
│   │           └── Download Link
│   │
│   ├── Rejection Reason (if rejected)
│   │
│   └── Actions Section (if pending)
│       ├── Rejection Reason Input
│       └── Action Buttons
│           ├── Approve Button
│           └── Reject Button
│
├── ConfirmDialog Component
│   └── Used for approve/reject confirmations
│
└── AlertDialog Component
    └── Used for alerts/notifications
```

## State Management

```typescript
Component State:
┌─────────────────────────────────────────┐
│ shops: Shop[]                           │
│ loading: boolean                        │
│ searchQuery: string                     │
│ statusFilter: StatusFilter              │
│ selectedShop: Shop | null               │
│ showDetailsModal: boolean               │
│ rejectionReason: string                 │
│ actionLoading: boolean                  │
│ currentPage: number                     │
│ totalPages: number                      │
└─────────────────────────────────────────┘
```

## Data Flow

```
User Actions → Component Logic → API Calls → Backend
     ↓              ↓                ↓           ↓
   Events      State Updates     Requests    Database
     ↑              ↑                ↑           ↑
UI Updates ← State Changes ← Response ← Query/Update
```

## Key User Flows

### 1. View Shop Details
```
User clicks Eye icon
  ↓
handleViewShop() called
  ↓
setSelectedShop(shop)
setShowDetailsModal(true)
  ↓
Modal opens with shop details
```

### 2. Approve Shop
```
User opens shop details
  ↓
Clicks "Approve Shop"
  ↓
Confirmation dialog shown
  ↓
User confirms
  ↓
api.approveShop(shopId)
  ↓
Success toast shown
  ↓
Modal closed
  ↓
fetchShops() refreshes list
```

### 3. Reject Shop
```
User opens shop details
  ↓
Enters rejection reason
  ↓
Clicks "Reject Shop"
  ↓
Validation checks reason
  ↓
Confirmation dialog shown
  ↓
User confirms
  ↓
api.rejectShop(shopId, reason)
  ↓
Success toast shown
  ↓
Modal closed
  ↓
fetchShops() refreshes list
```

### 4. Search & Filter
```
User types in search
  ↓
searchQuery state updates
  ↓
filteredShops computed
  ↓
Table re-renders with filtered results

OR

User clicks status filter
  ↓
statusFilter state updates
  ↓
fetchShops() called with filter
  ↓
API returns filtered data
  ↓
shops state updated
  ↓
Table re-renders
```

## Styling Approach

```
Global Theme:
├── Dark background (gray-900)
├── Glass morphism (bg-white/5, backdrop-blur)
├── Purple/Pink gradients for accents
└── Border: white/10 for subtle outlines

Status Colors:
├── Pending:  Yellow (yellow-400)
├── Approved: Green (green-400)
└── Rejected: Red (red-400)

Interactive Elements:
├── Hover: brightness increase
├── Active: scale down
├── Disabled: opacity-50
└── Focus: ring with purple-500
```

## Animation Timeline

```
Page Load:
  0ms    → Fade in (opacity 0 → 1)

Table Rows:
  0ms    → First row animates
  50ms   → Second row animates
  100ms  → Third row animates
  ...

Modal:
  0ms    → Backdrop fade in
  0ms    → Modal scale up (0.9 → 1)
  300ms  → Animation complete

Button Actions:
  0ms    → Click
  150ms  → Scale down
  300ms  → Scale return + action
```

## File Organization

```
frontend/src/features/admin/pages/
│
├── ShopApprovalsPage.tsx         # Main component (703 lines)
├── index.ts                       # Exports
├── SHOP_APPROVALS_README.md      # Full documentation
├── SHOP_APPROVALS_QUICKREF.md    # Quick reference
└── SHOP_APPROVALS_STRUCTURE.md   # This file
```

## Import Dependencies

```typescript
// React & Router
import React, { useState, useEffect } from 'react';

// Animations
import { motion, AnimatePresence } from 'framer-motion';

// Icons (lucide-react)
import {
  Search, Filter, X, CheckCircle, XCircle, Eye,
  Calendar, Mail, User, Building2, FileText,
  AlertCircle, RefreshCw, Download,
  ChevronLeft, ChevronRight, Store
} from 'lucide-react';

// API & Utils
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Hooks & Components
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
```

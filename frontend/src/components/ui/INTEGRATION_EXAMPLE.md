# Integration Example - Replace window.confirm() in ProductsListPage

This guide shows how to replace the native browser `confirm()` dialogs in `ProductsListPage.tsx` with our beautiful custom dialogs.

## Current Code (Before)

```tsx
// ProductsListPage.tsx
import { toast } from 'sonner';

const handleDeleteProduct = async (productId: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await api.deleteProduct(productId);
    toast.success('Product deleted successfully');
    fetchProducts();
  } catch (err: any) {
    toast.error('Failed to delete product', {
      description: err?.response?.data?.message || 'An error occurred'
    });
  }
};

const handleBulkDelete = async () => {
  if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) return;

  try {
    await Promise.all(selectedProducts.map(id => api.deleteProduct(id)));
    toast.success(`Successfully deleted ${selectedProducts.length} product(s)`);
    setSelectedProducts([]);
    fetchProducts();
  } catch (err: any) {
    toast.error('Failed to delete products', {
      description: err?.response?.data?.message || 'An error occurred'
    });
  }
};
```

## New Code (After)

### Step 1: Add imports at the top

```tsx
// Add these imports
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';
```

### Step 2: Initialize the hook in component

```tsx
export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { shopId } = extractRouteContext(params);

  // Add this line
  const dialog = useDialog();

  // ... rest of your state
  const [searchQuery, setSearchQuery] = useState('');
  // ... etc
```

### Step 3: Update handleDeleteProduct function

```tsx
const handleDeleteProduct = async (productId: string) => {
  // Replace window.confirm with dialog.showConfirm
  const confirmed = await dialog.showConfirm({
    title: 'Delete Product',
    message: 'Are you sure you want to delete this product? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger'
  });

  if (!confirmed) return;

  try {
    await api.deleteProduct(productId);

    // Show success dialog instead of toast (optional - you can keep toast if you prefer)
    await dialog.showSuccess(
      'Deleted!',
      'Product has been deleted successfully.'
    );

    fetchProducts();
  } catch (err: any) {
    // Show error dialog
    await dialog.showError(
      'Delete Failed',
      err?.response?.data?.message || 'Failed to delete product. Please try again.'
    );
  }
};
```

### Step 4: Update handleBulkDelete function

```tsx
const handleBulkDelete = async () => {
  // Replace window.confirm with dialog.showConfirm
  const confirmed = await dialog.showConfirm({
    title: 'Delete Products',
    message: `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`,
    confirmText: `Delete ${selectedProducts.length} Products`,
    cancelText: 'Cancel',
    variant: 'danger'
  });

  if (!confirmed) return;

  try {
    await Promise.all(selectedProducts.map(id => api.deleteProduct(id)));

    await dialog.showSuccess(
      'Deleted!',
      `Successfully deleted ${selectedProducts.length} product(s).`
    );

    setSelectedProducts([]);
    fetchProducts();
  } catch (err: any) {
    await dialog.showError(
      'Delete Failed',
      err?.response?.data?.message || 'Failed to delete some products. Please try again.'
    );
  }
};
```

### Step 5: Add dialog components to JSX (at the bottom of return statement)

```tsx
export const ProductsListPage: React.FC = () => {
  // ... all your component logic

  return (
    <div className="min-h-screen vendor-scrollbar">
      {/* All your existing JSX */}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* ... */}
      </div>

      {/* Products Grid/List */}
      {/* ... */}

      {/* ADD THESE AT THE VERY END, BEFORE CLOSING </div> */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
};
```

## Complete Modified Section

Here's what the complete modified section looks like:

```tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Package,
  Grid3x3,
  List,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { LoadingState, ProductCardSkeleton } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import { useVendorAuthStore } from '../../../stores/useVendorAuthStore';
import { extractRouteContext } from '../../../lib/navigation-utils';

// NEW IMPORTS
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';

// ... interfaces ...

export const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { shopId } = extractRouteContext(params);

  // NEW: Initialize dialog hook
  const dialog = useDialog();

  // ... all your existing state ...

  // UPDATED: handleDeleteProduct
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await api.deleteProduct(productId);
      await dialog.showSuccess('Deleted!', 'Product has been deleted successfully.');
      fetchProducts();
    } catch (err: any) {
      await dialog.showError(
        'Delete Failed',
        err?.response?.data?.message || 'Failed to delete product. Please try again.'
      );
    }
  };

  // UPDATED: handleBulkDelete
  const handleBulkDelete = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Products',
      message: `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`,
      confirmText: `Delete ${selectedProducts.length} Products`,
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await Promise.all(selectedProducts.map(id => api.deleteProduct(id)));
      await dialog.showSuccess(
        'Deleted!',
        `Successfully deleted ${selectedProducts.length} product(s).`
      );
      setSelectedProducts([]);
      fetchProducts();
    } catch (err: any) {
      await dialog.showError(
        'Delete Failed',
        err?.response?.data?.message || 'Failed to delete some products.'
      );
    }
  };

  // ... rest of your component logic ...

  return (
    <div className="min-h-screen vendor-scrollbar">
      {/* All your existing JSX */}

      {/* NEW: Add dialog components at the end */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
};
```

## Benefits of This Change

1. **Better UX**: Beautiful glassmorphic design matching your vendor panel
2. **Consistent Branding**: Matches the teal/purple gradient theme
3. **More Informative**: Can show detailed messages and custom button text
4. **Better Animations**: Smooth transitions and hover effects
5. **More Control**: Can customize appearance per use case
6. **Professional**: No more ugly browser dialogs

## Mixing with Toast Notifications

You can use both dialogs and toasts together:

```tsx
const handleDeleteProduct = async (productId: string) => {
  // Use dialog for confirmation
  const confirmed = await dialog.showConfirm({
    title: 'Delete Product',
    message: 'Are you sure you want to delete this product?',
    variant: 'danger'
  });

  if (!confirmed) return;

  try {
    await api.deleteProduct(productId);

    // Use toast for quick success notification
    toast.success('Product deleted successfully');
    // OR use dialog for more prominent notification
    // await dialog.showSuccess('Deleted!', 'Product deleted successfully.');

    fetchProducts();
  } catch (err: any) {
    // Use dialog for errors that need user attention
    await dialog.showError('Delete Failed', err?.response?.data?.message);
  }
};
```

**Guideline:**
- Use **dialogs** for: confirmations, errors that need attention, important success messages
- Use **toasts** for: quick notifications, background operations, non-critical updates

## Other Places to Replace confirm()

Search for `confirm(` in your codebase to find all instances:

```bash
grep -r "confirm(" src/features/vendor/pages/
```

Common patterns to replace:
- Delete confirmations
- Status change confirmations
- Publish/unpublish confirmations
- Export/import confirmations
- Any destructive action confirmations

## Testing

After integration, test:
1. Delete single product - should show danger variant
2. Bulk delete products - should show count in message
3. Click outside dialog - should close and cancel
4. Click cancel button - should cancel action
5. Click confirm button - should proceed with action
6. Error handling - should show error dialog
7. Success - should show success dialog

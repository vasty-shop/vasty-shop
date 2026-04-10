# Quick Usage Guide - Dialog Components

Replace all `window.confirm()` and `window.alert()` with these beautiful dialog components!

## Installation (Already Done)

All files are already created:
- `/src/components/ui/ConfirmDialog.tsx`
- `/src/components/ui/AlertDialog.tsx`
- `/src/hooks/useDialog.ts`

## Basic Setup (3 Steps)

### Step 1: Import

```tsx
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
```

### Step 2: Use Hook

```tsx
function YourComponent() {
  const dialog = useDialog();

  // Your component code...
}
```

### Step 3: Add Components to JSX

```tsx
function YourComponent() {
  const dialog = useDialog();

  return (
    <div>
      {/* Your component JSX */}

      {/* Add these at the bottom */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
}
```

## Common Use Cases

### 1. Delete Confirmation (Most Common)

**Before:**
```tsx
const handleDelete = () => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    deleteProduct();
  }
};
```

**After:**
```tsx
const handleDelete = async () => {
  const confirmed = await dialog.showConfirm({
    title: 'Delete Product',
    message: 'Are you sure you want to delete this product? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger'
  });

  if (confirmed) {
    deleteProduct();
  }
};
```

### 2. Success Alert

**Before:**
```tsx
alert('Product created successfully!');
```

**After:**
```tsx
await dialog.showSuccess(
  'Product Created!',
  'Your product has been created successfully.'
);
```

### 3. Error Alert

**Before:**
```tsx
alert('Error: Failed to upload image');
```

**After:**
```tsx
await dialog.showError(
  'Upload Failed',
  'Failed to upload image. Please try again.'
);
```

### 4. Warning Alert

```tsx
await dialog.showWarning(
  'Warning',
  'Your session is about to expire. Please save your work.'
);
```

### 5. Info Alert

```tsx
await dialog.showInfo(
  'Information',
  'This feature is currently in beta.'
);
```

## Variants

### ConfirmDialog Variants

```tsx
// Danger (Red) - for destructive actions
variant: 'danger'

// Warning (Orange) - for important warnings
variant: 'warning'

// Info (Cyan) - for informational confirmations
variant: 'info'
```

### AlertDialog Types

```tsx
// Success (Green)
dialog.showSuccess('Title', 'Message')
// or
dialog.showAlert({ title: 'Title', message: 'Message', type: 'success' })

// Error (Red)
dialog.showError('Title', 'Message')

// Warning (Orange)
dialog.showWarning('Title', 'Message')

// Info (Cyan)
dialog.showInfo('Title', 'Message')
```

## Complete Component Example

```tsx
import React from 'react';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

function ProductManagement() {
  const dialog = useDialog();
  const [products, setProducts] = React.useState([]);

  const handleDelete = async (productId: string) => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await api.delete(`/products/${productId}`);
        await dialog.showSuccess(
          'Deleted!',
          'Product has been deleted successfully.'
        );
        // Refresh products list
        fetchProducts();
      } catch (error) {
        await dialog.showError(
          'Error',
          'Failed to delete product. Please try again.'
        );
      }
    }
  };

  const handlePublish = async (productId: string) => {
    const confirmed = await dialog.showConfirm({
      title: 'Publish Product',
      message: 'This product will be visible to all customers.',
      confirmText: 'Publish',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (confirmed) {
      try {
        await api.post(`/products/${productId}/publish`);
        await dialog.showSuccess(
          'Published!',
          'Product is now live.'
        );
        fetchProducts();
      } catch (error) {
        await dialog.showError(
          'Error',
          'Failed to publish product.'
        );
      }
    }
  };

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <button onClick={() => handlePublish(product.id)}>
            Publish
          </button>
          <button onClick={() => handleDelete(product.id)}>
            Delete
          </button>
        </div>
      ))}

      {/* Required: Add dialog components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
}
```

## API Reference

### useDialog Hook

```tsx
const dialog = useDialog();
```

**Returns:**
- `showConfirm(options)` - Promise<boolean>
- `showAlert(options)` - Promise<void>
- `showSuccess(title, message, buttonText?)` - Promise<void>
- `showError(title, message, buttonText?)` - Promise<void>
- `showWarning(title, message, buttonText?)` - Promise<void>
- `showInfo(title, message, buttonText?)` - Promise<void>
- `confirmDialog` - Props for ConfirmDialog
- `alertDialog` - Props for AlertDialog

### showConfirm Options

```tsx
{
  title: string;              // Dialog title
  message: string;            // Dialog message
  confirmText?: string;       // Button text (default: "Confirm")
  cancelText?: string;        // Button text (default: "Cancel")
  variant?: 'danger' | 'warning' | 'info';  // Style variant
}
```

### showAlert Options

```tsx
{
  title: string;              // Dialog title
  message: string;            // Dialog message
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;        // Button text (default: "OK")
}
```

## Tips

1. Always use `async/await` with dialog methods
2. Choose appropriate variant/type for the action
3. Keep titles short (1-3 words)
4. Keep messages concise but descriptive
5. Use action-specific button text ("Delete" instead of "Yes")

## Common Patterns

### With Try-Catch

```tsx
const handleAction = async () => {
  const confirmed = await dialog.showConfirm({
    title: 'Confirm Action',
    message: 'Are you sure?',
    variant: 'warning'
  });

  if (!confirmed) return;

  try {
    await performAction();
    await dialog.showSuccess('Success!', 'Action completed.');
  } catch (error) {
    await dialog.showError('Error', error.message);
  }
};
```

### Sequential Dialogs

```tsx
const handleComplexAction = async () => {
  // Step 1: Initial confirmation
  const proceed = await dialog.showConfirm({
    title: 'Start Process',
    message: 'Do you want to continue?',
    variant: 'info'
  });

  if (!proceed) return;

  // Step 2: Process
  try {
    await longRunningProcess();

    // Step 3: Success
    await dialog.showSuccess(
      'Complete!',
      'Process finished successfully.'
    );
  } catch (error) {
    await dialog.showError('Failed', error.message);
  }
};
```

### Conditional Logic

```tsx
const handleSave = async () => {
  if (hasUnsavedChanges) {
    const save = await dialog.showConfirm({
      title: 'Unsaved Changes',
      message: 'Do you want to save your changes?',
      confirmText: 'Save',
      cancelText: 'Discard',
      variant: 'warning'
    });

    if (save) {
      await saveChanges();
      await dialog.showSuccess('Saved!', 'Changes saved successfully.');
    }
  }

  navigate('/products');
};
```

## Troubleshooting

**Dialogs not appearing?**
- Make sure you've added `<ConfirmDialog {...dialog.confirmDialog} />` and `<AlertDialog {...dialog.alertDialog} />` to your JSX

**TypeScript errors?**
- Ensure `@/` path alias is configured in tsconfig.json

**Multiple dialogs appearing?**
- The hook manages state per component instance. Each component that uses `useDialog()` has its own dialog instances.

**Need global dialogs?**
- See `DIALOG_COMPONENTS_README.md` for DialogProvider pattern

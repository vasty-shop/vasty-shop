# Dialog Components - Quick Reference Card

## Setup (Copy & Paste)

```tsx
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

function MyComponent() {
  const dialog = useDialog();

  return (
    <div>
      {/* Your content */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
}
```

## Usage Examples

### Delete Confirmation (Danger)
```tsx
const confirmed = await dialog.showConfirm({
  title: 'Delete Product',
  message: 'Are you sure? This cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger'
});

if (confirmed) {
  // Delete action
}
```

### Warning Confirmation
```tsx
const confirmed = await dialog.showConfirm({
  title: 'Publish Product',
  message: 'This will be visible to all customers.',
  confirmText: 'Publish',
  cancelText: 'Cancel',
  variant: 'warning'
});
```

### Info Confirmation
```tsx
const confirmed = await dialog.showConfirm({
  title: 'Save Changes',
  message: 'Do you want to save?',
  confirmText: 'Save',
  cancelText: 'Discard',
  variant: 'info'
});
```

### Success Alert
```tsx
await dialog.showSuccess(
  'Success!',
  'Product created successfully.'
);
```

### Error Alert
```tsx
await dialog.showError(
  'Upload Failed',
  'Please try again.'
);
```

### Warning Alert
```tsx
await dialog.showWarning(
  'Session Expiring',
  'Please save your work.'
);
```

### Info Alert
```tsx
await dialog.showInfo(
  'Beta Feature',
  'Some functionality may change.'
);
```

## Variants & Types

| Component | Variant/Type | Color | Use Case |
|-----------|-------------|-------|----------|
| ConfirmDialog | `danger` | Red/Pink | Delete, destructive actions |
| ConfirmDialog | `warning` | Amber/Orange | Important confirmations |
| ConfirmDialog | `info` | Cyan/Blue | General confirmations |
| AlertDialog | `success` | Green | Success messages |
| AlertDialog | `error` | Red | Error messages |
| AlertDialog | `warning` | Orange | Warnings |
| AlertDialog | `info` | Cyan | Information |

## API Reference

### showConfirm(options)
Returns: `Promise<boolean>`

```tsx
{
  title: string;
  message: string;
  confirmText?: string;      // Default: "Confirm"
  cancelText?: string;       // Default: "Cancel"
  variant?: 'danger' | 'warning' | 'info';
}
```

### showAlert(options)
Returns: `Promise<void>`

```tsx
{
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;       // Default: "OK"
}
```

### Convenience Methods
```tsx
dialog.showSuccess(title, message, buttonText?)  // Promise<void>
dialog.showError(title, message, buttonText?)    // Promise<void>
dialog.showWarning(title, message, buttonText?)  // Promise<void>
dialog.showInfo(title, message, buttonText?)     // Promise<void>
```

## Common Patterns

### Try-Catch with Error Dialog
```tsx
try {
  await api.deleteProduct(id);
  await dialog.showSuccess('Deleted!', 'Product removed.');
  fetchProducts();
} catch (error) {
  await dialog.showError('Failed', error.message);
}
```

### Unsaved Changes Warning
```tsx
if (hasUnsavedChanges) {
  const save = await dialog.showConfirm({
    title: 'Unsaved Changes',
    message: 'Save before leaving?',
    confirmText: 'Save',
    cancelText: 'Discard',
    variant: 'warning'
  });

  if (save) {
    await saveChanges();
  }
}
navigate('/products');
```

### Bulk Delete
```tsx
const confirmed = await dialog.showConfirm({
  title: 'Delete Products',
  message: `Delete ${count} products? Cannot be undone.`,
  confirmText: `Delete ${count} Products`,
  cancelText: 'Cancel',
  variant: 'danger'
});

if (confirmed) {
  await bulkDelete();
  await dialog.showSuccess('Deleted!', `${count} products removed.`);
}
```

## Migration Guide

### Replace window.confirm()
**Before:**
```tsx
if (confirm('Are you sure?')) {
  deleteItem();
}
```

**After:**
```tsx
const confirmed = await dialog.showConfirm({
  title: 'Delete Item',
  message: 'Are you sure?',
  variant: 'danger'
});

if (confirmed) {
  deleteItem();
}
```

### Replace window.alert()
**Before:**
```tsx
alert('Product created!');
```

**After:**
```tsx
await dialog.showSuccess('Success!', 'Product created!');
```

## Files Created

### Core Components
- `/src/components/ui/ConfirmDialog.tsx` - Confirmation dialog
- `/src/components/ui/AlertDialog.tsx` - Alert dialog
- `/src/hooks/useDialog.ts` - Hook for state management

### Helper Files
- `/src/components/ui/dialogs.ts` - Convenient exports
- `/src/components/ui/DialogShowcase.tsx` - Visual demo

### Documentation
- `/src/components/ui/DIALOG_COMPONENTS_README.md` - Complete docs
- `/src/components/ui/DIALOG_USAGE.md` - Quick guide
- `/src/components/ui/INTEGRATION_EXAMPLE.md` - Integration steps
- `/frontend/DIALOG_COMPONENTS_SUMMARY.md` - Overview

## Tips

✅ Always `await` dialog methods
✅ Use descriptive titles (1-3 words)
✅ Keep messages concise but clear
✅ Choose appropriate variant/type
✅ Use action verbs for buttons ("Delete" not "Yes")
✅ Test on mobile devices
✅ Handle both confirm and cancel cases

## Features

- ✨ Glassmorphic design
- 🎨 Beautiful gradients
- 📱 Mobile responsive
- ⌨️ Keyboard accessible
- 🎭 Multiple variants
- 🔄 Promise-based
- 🎯 Click outside to dismiss
- ⚡ Smooth animations
- 🔒 TypeScript support

## Troubleshooting

**Dialog not appearing?**
→ Add `<ConfirmDialog {...dialog.confirmDialog} />` to JSX

**TypeScript errors?**
→ Check `@/` path alias in tsconfig.json

**Multiple instances?**
→ Each component has its own hook instance (by design)

## More Info

See full documentation:
- Complete API: `DIALOG_COMPONENTS_README.md`
- Usage examples: `DIALOG_USAGE.md`
- Integration guide: `INTEGRATION_EXAMPLE.md`
- Visual demo: Import `DialogShowcase` component

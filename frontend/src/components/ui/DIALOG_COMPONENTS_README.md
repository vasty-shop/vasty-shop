# Dialog Components Documentation

Beautiful, reusable modal/dialog components with glassmorphic design matching the vendor panel theme.

## Components Overview

### 1. ConfirmDialog
A confirmation dialog with two actions (Confirm/Cancel) that returns a promise.

**Features:**
- Returns Promise<boolean> (true = confirmed, false = cancelled)
- Three variants: `danger`, `warning`, `info`
- Glassmorphic design with animated gradient effects
- Smooth animations on open/close
- Click outside or ESC to dismiss

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;      // Default: "Confirm"
  cancelText?: string;       // Default: "Cancel"
  variant?: 'danger' | 'warning' | 'info';  // Default: "warning"
}
```

### 2. AlertDialog
An alert dialog with a single action button that returns a promise.

**Features:**
- Returns Promise<void> (resolves when dismissed)
- Four types with specific icons and colors:
  - `success` - Green gradient with CheckCircle icon
  - `error` - Red gradient with XCircle icon
  - `warning` - Amber gradient with AlertTriangle icon
  - `info` - Cyan gradient with Info icon
- Beautiful icon animations
- Shimmer effect overlay
- Auto-dismissible with single button

**Props:**
```typescript
interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';  // Default: "info"
  buttonText?: string;       // Default: "OK"
}
```

### 3. useDialog Hook
A custom React hook that manages dialog state and provides easy-to-use methods.

**Methods:**
- `showConfirm(options)` - Shows confirmation dialog, returns Promise<boolean>
- `showAlert(options)` - Shows alert dialog, returns Promise<void>
- `showSuccess(title, message, buttonText?)` - Convenience method for success alerts
- `showError(title, message, buttonText?)` - Convenience method for error alerts
- `showWarning(title, message, buttonText?)` - Convenience method for warning alerts
- `showInfo(title, message, buttonText?)` - Convenience method for info alerts

**Returns:**
- Dialog methods (listed above)
- `confirmDialog` - Props to spread on ConfirmDialog component
- `alertDialog` - Props to spread on AlertDialog component

## Quick Start

### Basic Setup

```tsx
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

function MyComponent() {
  const dialog = useDialog();

  return (
    <div>
      {/* Your component content */}

      {/* Include these at the end of your component */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
}
```

### Usage Examples

#### 1. Confirmation Dialog - Delete Action (Danger)

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
    // User clicked "Delete"
    await deleteProduct();
  } else {
    // User clicked "Cancel" or closed dialog
    console.log('Deletion cancelled');
  }
};
```

#### 2. Confirmation Dialog - Warning

```tsx
const handlePublish = async () => {
  const confirmed = await dialog.showConfirm({
    title: 'Publish Product',
    message: 'This product will be visible to all customers. Continue?',
    confirmText: 'Publish',
    cancelText: 'Cancel',
    variant: 'warning'
  });

  if (confirmed) {
    await publishProduct();
  }
};
```

#### 3. Success Alert

```tsx
const handleSubmit = async () => {
  try {
    await createProduct(data);

    await dialog.showSuccess(
      'Success!',
      'Your product has been created successfully.',
      'Great!'
    );

    // Code here executes after user dismisses the alert
    navigate('/products');
  } catch (error) {
    // Handle error
  }
};
```

#### 4. Error Alert

```tsx
const handleUpload = async () => {
  try {
    await uploadImage(file);
  } catch (error) {
    await dialog.showError(
      'Upload Failed',
      'Failed to upload image. Please try again.',
      'OK'
    );
  }
};
```

#### 5. Warning Alert

```tsx
const handleSessionWarning = async () => {
  await dialog.showWarning(
    'Session Expiring',
    'Your session is about to expire. Please save your work.',
    'Got it'
  );
};
```

#### 6. Info Alert

```tsx
const handleInfo = async () => {
  await dialog.showInfo(
    'Beta Feature',
    'This feature is currently in beta. Some functionality may change.',
    'Understood'
  );
};
```

#### 7. Sequential Dialogs

```tsx
const handleMultiStepProcess = async () => {
  // Step 1: Confirm
  const proceed = await dialog.showConfirm({
    title: 'Start Process',
    message: 'Do you want to continue?',
    variant: 'info'
  });

  if (!proceed) return;

  // Step 2: Success notification
  await dialog.showSuccess(
    'Step Complete',
    'Moving to next step...'
  );

  // Step 3: Final confirmation
  const finalConfirm = await dialog.showConfirm({
    title: 'Final Step',
    message: 'Are you sure you want to complete?',
    variant: 'warning'
  });

  if (finalConfirm) {
    await processData();
    await dialog.showSuccess('All Done!', 'Process completed successfully.');
  }
};
```

#### 8. Replace Browser Confirm

**Before:**
```tsx
const handleDelete = () => {
  if (confirm('Are you sure you want to delete this?')) {
    deleteItem();
  }
};
```

**After:**
```tsx
const handleDelete = async () => {
  const confirmed = await dialog.showConfirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this?',
    variant: 'danger'
  });

  if (confirmed) {
    deleteItem();
  }
};
```

#### 9. Replace Browser Alert

**Before:**
```tsx
const handleSuccess = () => {
  alert('Product created successfully!');
  navigate('/products');
};
```

**After:**
```tsx
const handleSuccess = async () => {
  await dialog.showSuccess(
    'Success!',
    'Product created successfully!'
  );
  navigate('/products');
};
```

## Design Features

### Glassmorphic Design
- Backdrop blur with transparency
- Subtle gradients and borders
- Animated glow effects
- Floating animated orbs

### Animations
- Smooth scale and fade transitions
- Spring-based animations for natural feel
- Staggered animations for dialog elements
- Shimmer effect on AlertDialog
- Pulse animations on icons

### Variants & Types

**ConfirmDialog Variants:**
- `danger` - Red/Pink gradient (for destructive actions)
- `warning` - Amber/Orange gradient (for important warnings)
- `info` - Cyan/Blue gradient (for informational confirmations)

**AlertDialog Types:**
- `success` - Emerald/Green with CheckCircle icon
- `error` - Red/Pink with XCircle icon
- `warning` - Amber/Orange with AlertTriangle icon
- `info` - Cyan/Blue with Info icon

### Accessibility
- Click outside to dismiss
- Close button in top-right
- ESC key support (via browser default)
- Focus management
- ARIA labels (can be enhanced)

## Advanced Usage

### Global Dialog Provider (Optional)

For app-wide dialog access, you can create a provider:

```tsx
// DialogProvider.tsx
import React, { createContext, useContext } from 'react';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

const DialogContext = createContext<ReturnType<typeof useDialog> | null>(null);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dialog = useDialog();

  return (
    <DialogContext.Provider value={dialog}>
      {children}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </DialogContext.Provider>
  );
};

export const useGlobalDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useGlobalDialog must be used within DialogProvider');
  return context;
};
```

Then wrap your app:

```tsx
// App.tsx
import { DialogProvider } from './DialogProvider';

function App() {
  return (
    <DialogProvider>
      {/* Your app content */}
    </DialogProvider>
  );
}
```

And use anywhere:

```tsx
import { useGlobalDialog } from './DialogProvider';

function AnyComponent() {
  const dialog = useGlobalDialog();

  const handleDelete = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete',
      message: 'Are you sure?',
      variant: 'danger'
    });

    if (confirmed) {
      // Delete
    }
  };
}
```

## Styling Customization

Both components use Tailwind CSS classes and can be customized by modifying the component files directly. Key styling areas:

1. **Backdrop**: `bg-black/60 backdrop-blur-md`
2. **Dialog Container**: `bg-slate-900/95 border-white/10`
3. **Buttons**: Gradient classes for each variant/type
4. **Animations**: Framer Motion configuration objects

## Dependencies

- `react`
- `framer-motion` - For animations
- `lucide-react` - For icons
- `tailwindcss` - For styling

## File Locations

- `/src/components/ui/ConfirmDialog.tsx` - Confirmation dialog component
- `/src/components/ui/AlertDialog.tsx` - Alert dialog component
- `/src/hooks/useDialog.ts` - Dialog management hook
- `/src/components/ui/DialogExample.tsx` - Usage examples

## Tips & Best Practices

1. **Always await dialog calls** when you need to wait for user response
2. **Use appropriate variants/types** to match the action severity
3. **Keep messages concise** but descriptive
4. **Test on mobile** to ensure touch interactions work well
5. **Consider loading states** - disable buttons during async operations
6. **Use sequential dialogs sparingly** - too many can frustrate users
7. **Provide clear action button text** - "Delete" is better than "Yes"

## Browser Support

Works on all modern browsers that support:
- ES6+
- Framer Motion
- CSS backdrop-filter (fallback gracefully degrades)

## Future Enhancements

Potential improvements:
- [ ] Keyboard navigation (Tab, Enter, ESC)
- [ ] Custom icons support
- [ ] Animation presets
- [ ] Size variants (sm, md, lg)
- [ ] Auto-dismiss timer for alerts
- [ ] Queue system for multiple dialogs
- [ ] Toast notifications variant
- [ ] Form integration examples
- [ ] Accessibility improvements (ARIA)
- [ ] RTL support

## Troubleshooting

**Dialog doesn't appear:**
- Ensure `<ConfirmDialog {...dialog.confirmDialog} />` is in your JSX
- Check z-index conflicts (dialogs use z-9998 and z-9999)

**Backdrop blur not working:**
- Some browsers require vendor prefixes for backdrop-filter
- Check browser compatibility
- CSS fallback is included

**TypeScript errors:**
- Ensure `@/` path alias is configured in tsconfig.json
- Install type definitions: `@types/react`, `@types/node`

**Animations not smooth:**
- Check if `framer-motion` is properly installed
- Ensure no CSS conflicts with animation properties

## License

Part of the Fluxez Shop project.

/**
 * Dialog Components Usage Examples
 *
 * This file demonstrates how to use the ConfirmDialog, AlertDialog, and useDialog hook
 * in your React components.
 */

import React from 'react';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { AlertDialog } from './AlertDialog';

export const DialogExamples: React.FC = () => {
  const dialog = useDialog();

  // Example 1: Simple confirmation dialog
  const handleDelete = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      console.log('Product deleted!');
      // Perform delete action
    }
  };

  // Example 2: Warning confirmation
  const handlePublish = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Publish Product',
      message: 'This product will be visible to all customers. Continue?',
      confirmText: 'Publish',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (confirmed) {
      console.log('Product published!');
    }
  };

  // Example 3: Info confirmation
  const handleSave = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      confirmText: 'Save',
      cancelText: 'Discard',
      variant: 'info'
    });

    if (confirmed) {
      console.log('Changes saved!');
    }
  };

  // Example 4: Success alert
  const handleSuccess = async () => {
    await dialog.showSuccess(
      'Success!',
      'Your product has been created successfully.',
      'Great!'
    );
    console.log('Success alert dismissed');
  };

  // Example 5: Error alert
  const handleError = async () => {
    await dialog.showError(
      'Error',
      'Failed to upload image. Please try again.',
      'OK'
    );
    console.log('Error alert dismissed');
  };

  // Example 6: Warning alert
  const handleWarning = async () => {
    await dialog.showWarning(
      'Warning',
      'Your session is about to expire. Please save your work.',
      'Got it'
    );
    console.log('Warning alert dismissed');
  };

  // Example 7: Info alert
  const handleInfo = async () => {
    await dialog.showInfo(
      'Information',
      'This feature is currently in beta. Some functionality may change.',
      'Understood'
    );
    console.log('Info alert dismissed');
  };

  // Example 8: Custom alert with generic showAlert
  const handleCustomAlert = async () => {
    await dialog.showAlert({
      title: 'Custom Alert',
      message: 'This is a custom alert message.',
      type: 'info',
      buttonText: 'Close'
    });
  };

  // Example 9: Sequential dialogs
  const handleSequentialDialogs = async () => {
    const proceed = await dialog.showConfirm({
      title: 'Step 1',
      message: 'Do you want to continue to the next step?',
      variant: 'info'
    });

    if (proceed) {
      await dialog.showSuccess(
        'Step 1 Complete',
        'Moving to step 2...'
      );

      const finalConfirm = await dialog.showConfirm({
        title: 'Final Step',
        message: 'Are you sure you want to complete this process?',
        variant: 'warning'
      });

      if (finalConfirm) {
        await dialog.showSuccess(
          'All Done!',
          'Process completed successfully.'
        );
      }
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-white mb-6">Dialog Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Confirmation Dialogs */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white mb-3">Confirmation Dialogs</h2>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Delete (Danger)
          </button>
          <button
            onClick={handlePublish}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Publish (Warning)
          </button>
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Save (Info)
          </button>
        </div>

        {/* Alert Dialogs */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white mb-3">Alert Dialogs</h2>
          <button
            onClick={handleSuccess}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Success Alert
          </button>
          <button
            onClick={handleError}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Error Alert
          </button>
          <button
            onClick={handleWarning}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Warning Alert
          </button>
          <button
            onClick={handleInfo}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Info Alert
          </button>
        </div>

        {/* Advanced Examples */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white mb-3">Advanced</h2>
          <button
            onClick={handleCustomAlert}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Custom Alert
          </button>
          <button
            onClick={handleSequentialDialogs}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-medium shadow-lg hover:scale-105 transition-transform"
          >
            Sequential Dialogs
          </button>
        </div>
      </div>

      {/* Dialog Components - These must be included in your component */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
};

/**
 * USAGE IN YOUR COMPONENTS:
 *
 * 1. Import the hook and components:
 *    import { useDialog } from '@/hooks/useDialog';
 *    import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
 *    import { AlertDialog } from '@/components/ui/AlertDialog';
 *
 * 2. Use the hook in your component:
 *    const dialog = useDialog();
 *
 * 3. Include the dialog components in your JSX:
 *    <ConfirmDialog {...dialog.confirmDialog} />
 *    <AlertDialog {...dialog.alertDialog} />
 *
 * 4. Show dialogs in your event handlers:
 *    const confirmed = await dialog.showConfirm({
 *      title: 'Confirm Action',
 *      message: 'Are you sure?',
 *      variant: 'danger'
 *    });
 *
 *    if (confirmed) {
 *      // User clicked confirm
 *    } else {
 *      // User clicked cancel
 *    }
 *
 * 5. Show alerts:
 *    await dialog.showSuccess('Success!', 'Operation completed.');
 *    await dialog.showError('Error!', 'Something went wrong.');
 *    await dialog.showWarning('Warning!', 'Please be careful.');
 *    await dialog.showInfo('Info', 'Here is some information.');
 */

export default DialogExamples;

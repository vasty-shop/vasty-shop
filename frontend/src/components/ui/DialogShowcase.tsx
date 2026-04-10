/**
 * Dialog Components Showcase
 *
 * Visual demonstration of all dialog variants and types.
 * Add this to your route temporarily to see all dialogs in action.
 *
 * Route example:
 * <Route path="/dialog-showcase" element={<DialogShowcase />} />
 */

import React from 'react';
import { useDialog, ConfirmDialog, AlertDialog } from './dialogs';
import { motion } from 'framer-motion';

export const DialogShowcase: React.FC = () => {
  const dialog = useDialog();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Dialog Components Showcase
          </h1>
          <p className="text-white/60 text-lg">
            Beautiful, reusable modal/dialog components with glassmorphic design
          </p>
        </motion.div>

        {/* Confirmation Dialogs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></span>
            Confirmation Dialogs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Danger Variant */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showConfirm({
                  title: 'Delete Product',
                  message: 'Are you sure you want to delete this product? This action cannot be undone.',
                  confirmText: 'Delete',
                  cancelText: 'Cancel',
                  variant: 'danger'
                })
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Danger Variant</h3>
              <p className="text-white/60 text-sm mb-4">
                For destructive actions like deleting items
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>

            {/* Warning Variant */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showConfirm({
                  title: 'Publish Product',
                  message: 'This product will be visible to all customers. Continue?',
                  confirmText: 'Publish',
                  cancelText: 'Cancel',
                  variant: 'warning'
                })
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Warning Variant</h3>
              <p className="text-white/60 text-sm mb-4">
                For important warnings and confirmations
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>

            {/* Info Variant */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showConfirm({
                  title: 'Save Changes',
                  message: 'Do you want to save your changes before leaving?',
                  confirmText: 'Save',
                  cancelText: 'Discard',
                  variant: 'info'
                })
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">ℹ️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Info Variant</h3>
              <p className="text-white/60 text-sm mb-4">
                For informational confirmations
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Alert Dialogs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></span>
            Alert Dialogs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Success Alert */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showSuccess(
                  'Success!',
                  'Your product has been created successfully.',
                  'Great!'
                )
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Success</h3>
              <p className="text-white/60 text-sm mb-4">
                Positive confirmations and completions
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>

            {/* Error Alert */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showError(
                  'Upload Failed',
                  'Failed to upload image. Please try again.',
                  'OK'
                )
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Error</h3>
              <p className="text-white/60 text-sm mb-4">
                Error messages that need attention
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>

            {/* Warning Alert */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showWarning(
                  'Session Expiring',
                  'Your session is about to expire. Please save your work.',
                  'Got it'
                )
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Warning</h3>
              <p className="text-white/60 text-sm mb-4">
                Important notifications and warnings
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>

            {/* Info Alert */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showInfo(
                  'Beta Feature',
                  'This feature is currently in beta. Some functionality may change.',
                  'Understood'
                )
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Info</h3>
              <p className="text-white/60 text-sm mb-4">
                Informational messages and tips
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Sequential Dialog Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
            Advanced Examples
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sequential Dialogs */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={async () => {
                const proceed = await dialog.showConfirm({
                  title: 'Step 1',
                  message: 'Do you want to continue to the next step?',
                  variant: 'info'
                });

                if (proceed) {
                  await dialog.showSuccess('Step 1 Complete', 'Moving to step 2...');

                  const finalConfirm = await dialog.showConfirm({
                    title: 'Final Step',
                    message: 'Are you sure you want to complete this process?',
                    variant: 'warning'
                  });

                  if (finalConfirm) {
                    await dialog.showSuccess('All Done!', 'Process completed successfully.');
                  }
                }
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Sequential Dialogs</h3>
              <p className="text-white/60 text-sm mb-4">
                Multiple dialogs in sequence for multi-step processes
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>

            {/* Custom Content */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-solid rounded-2xl p-6 cursor-pointer"
              onClick={() =>
                dialog.showAlert({
                  title: 'Custom Dialog',
                  message: 'You can customize all aspects: title, message, button text, and type.',
                  type: 'info',
                  buttonText: 'I understand'
                })
              }
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Custom Content</h3>
              <p className="text-white/60 text-sm mb-4">
                Fully customizable dialogs with any content you need
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium">
                Click to preview
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 glass-solid rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              '✨ Glassmorphic design matching vendor panel',
              '🎨 Beautiful gradient colors and animations',
              '📱 Fully responsive and mobile-friendly',
              '⌨️ Keyboard accessible (ESC to close)',
              '🎭 Multiple variants and types',
              '🔄 Promise-based API for easy async handling',
              '🎯 Click outside to dismiss',
              '⚡ Smooth animations with Framer Motion',
              '🎨 Customizable button text',
              '🔒 Type-safe with TypeScript',
              '♻️ Reusable across entire application',
              '🚀 Easy to integrate with existing code'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/80">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Documentation Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-white/60"
        >
          <p>
            See <code className="px-2 py-1 rounded bg-white/10">DIALOG_COMPONENTS_README.md</code> for full documentation
          </p>
        </motion.div>
      </div>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </div>
  );
};

export default DialogShowcase;

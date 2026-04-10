import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const variantStyles = {
    danger: {
      icon: 'text-white',
      iconBg: 'bg-red-500',
      button: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: 'text-white',
      iconBg: 'bg-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      icon: 'text-white',
      iconBg: 'bg-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
    }
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              className="
                relative w-full max-w-md
                bg-white
                border border-gray-200
                rounded-2xl
                shadow-xl
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`
                    w-14 h-14 rounded-full
                    ${styles.iconBg}
                    flex items-center justify-center
                    shadow-lg
                  `}>
                    <AlertTriangle className={`w-7 h-7 ${styles.icon}`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
                  {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="
                      flex-1 px-4 py-2.5 rounded-xl
                      bg-gray-100 hover:bg-gray-200
                      text-gray-700 font-medium
                      transition-all duration-200
                    "
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`
                      flex-1 px-4 py-2.5 rounded-xl
                      ${styles.button}
                      text-white font-medium
                      transition-all duration-200
                    `}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

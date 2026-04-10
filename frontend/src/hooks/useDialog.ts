import { useState, useCallback } from 'react';
import { AlertType } from '@/components/ui/AlertDialog';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  resolver?: (value: boolean) => void;
}

interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  resolver?: () => void;
}

export const useDialog = () => {
  const [confirmState, setConfirmState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [alertState, setAlertState] = useState<AlertDialogState>({
    isOpen: false,
    title: '',
    message: ''
  });

  /**
   * Show a confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  const showConfirm = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        variant: options.variant,
        resolver: resolve
      });
    });
  }, []);

  /**
   * Show an alert dialog
   * @returns Promise that resolves when the alert is dismissed
   */
  const showAlert = useCallback((options: {
    title: string;
    message: string;
    type?: AlertType;
    buttonText?: string;
  }): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: options.type,
        buttonText: options.buttonText,
        resolver: resolve
      });
    });
  }, []);

  /**
   * Show a success alert (convenience method)
   */
  const showSuccess = useCallback((title: string, message: string, buttonText?: string) => {
    return showAlert({ title, message, type: 'success', buttonText });
  }, [showAlert]);

  /**
   * Show an error alert (convenience method)
   */
  const showError = useCallback((title: string, message: string, buttonText?: string) => {
    return showAlert({ title, message, type: 'error', buttonText });
  }, [showAlert]);

  /**
   * Show a warning alert (convenience method)
   */
  const showWarning = useCallback((title: string, message: string, buttonText?: string) => {
    return showAlert({ title, message, type: 'warning', buttonText });
  }, [showAlert]);

  /**
   * Show an info alert (convenience method)
   */
  const showInfo = useCallback((title: string, message: string, buttonText?: string) => {
    return showAlert({ title, message, type: 'info', buttonText });
  }, [showAlert]);

  const handleConfirm = useCallback(() => {
    confirmState.resolver?.(true);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState.resolver]);

  const handleCancel = useCallback(() => {
    confirmState.resolver?.(false);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState.resolver]);

  const handleAlertClose = useCallback(() => {
    alertState.resolver?.();
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, [alertState.resolver]);

  return {
    // Methods to show dialogs
    showConfirm,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // State and handlers for ConfirmDialog
    confirmDialog: {
      isOpen: confirmState.isOpen,
      title: confirmState.title,
      message: confirmState.message,
      confirmText: confirmState.confirmText,
      cancelText: confirmState.cancelText,
      variant: confirmState.variant,
      onConfirm: handleConfirm,
      onClose: handleCancel
    },

    // State and handlers for AlertDialog
    alertDialog: {
      isOpen: alertState.isOpen,
      title: alertState.title,
      message: alertState.message,
      type: alertState.type,
      buttonText: alertState.buttonText,
      onClose: handleAlertClose
    }
  };
};

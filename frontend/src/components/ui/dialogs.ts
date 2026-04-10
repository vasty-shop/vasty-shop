/**
 * Dialog Components Export
 *
 * Convenient single import point for all dialog-related components and hooks.
 *
 * Usage:
 * import { useDialog, ConfirmDialog, AlertDialog } from '@/components/ui/dialogs';
 */

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { AlertDialog } from './AlertDialog';
export type { AlertDialogProps, AlertType } from './AlertDialog';

export { useDialog } from '../../hooks/useDialog';

/**
 * AR Try-On Component Types
 */

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
  thumbnail: string;
}

export type CameraFacing = 'user' | 'environment';

export type ARStatus = 'idle' | 'initializing' | 'ready' | 'error';

export interface ARError {
  type: 'camera' | 'model' | 'browser' | 'network';
  message: string;
}

export interface CapturedPhoto {
  dataUrl: string;
  timestamp: Date;
  productId: string;
  variantId?: string;
}

export interface ARTryOnViewProps {
  productId: string;
  onClose: () => void;
}

export interface ARControlsProps {
  onCameraFlip: () => void;
  onCapture: () => void;
  onSizeChange: (size: number) => void;
  onReset: () => void;
  onClose: () => void;
  onShare: () => void;
  isCapturing?: boolean;
  currentSize?: number;
}

export interface ARProductSelectorProps {
  product: Product;
  selectedVariant?: ProductVariant;
  onVariantChange: (variant: ProductVariant) => void;
}

export interface ARInstructionsProps {
  onDismiss: () => void;
  showAgain?: boolean;
}

export interface ARModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

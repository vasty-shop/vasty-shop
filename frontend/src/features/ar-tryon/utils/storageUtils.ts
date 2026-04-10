// AR Try-On Storage Utilities

const STORAGE_KEYS = {
  AR_INSTRUCTIONS_DISMISSED: 'ar_instructions_dismissed',
  AR_PREFERRED_CAMERA: 'ar_preferred_camera',
  AR_CAPTURES: 'ar_captures',
};

/**
 * Check if AR instructions have been dismissed
 */
export const hasSeenARInstructions = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AR_INSTRUCTIONS_DISMISSED) === 'true';
  } catch {
    return false;
  }
};

/**
 * Mark AR instructions as dismissed
 */
export const dismissARInstructions = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AR_INSTRUCTIONS_DISMISSED, 'true');
  } catch {
    console.warn('Failed to save AR instructions preference');
  }
};

/**
 * Reset AR instructions (show again)
 */
export const resetARInstructions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AR_INSTRUCTIONS_DISMISSED);
  } catch {
    console.warn('Failed to reset AR instructions preference');
  }
};

/**
 * Get preferred camera facing mode
 */
export const getPreferredCamera = (): 'user' | 'environment' => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AR_PREFERRED_CAMERA);
    return stored === 'environment' ? 'environment' : 'user';
  } catch {
    return 'user';
  }
};

/**
 * Save preferred camera facing mode
 */
export const setPreferredCamera = (facingMode: 'user' | 'environment'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AR_PREFERRED_CAMERA, facingMode);
  } catch {
    console.warn('Failed to save camera preference');
  }
};

interface ARCapture {
  id: string;
  dataUrl: string;
  productId: string;
  productName: string;
  timestamp: number;
}

/**
 * Save AR capture to local storage
 */
export const saveARCapture = (capture: Omit<ARCapture, 'id' | 'timestamp'>): ARCapture => {
  const newCapture: ARCapture = {
    ...capture,
    id: `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = getARCaptures();
    // Keep only last 10 captures
    const updated = [newCapture, ...existing].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.AR_CAPTURES, JSON.stringify(updated));
  } catch {
    console.warn('Failed to save AR capture');
  }

  return newCapture;
};

/**
 * Get all AR captures
 */
export const getARCaptures = (): ARCapture[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AR_CAPTURES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Delete AR capture by ID
 */
export const deleteARCapture = (captureId: string): void => {
  try {
    const existing = getARCaptures();
    const updated = existing.filter((c) => c.id !== captureId);
    localStorage.setItem(STORAGE_KEYS.AR_CAPTURES, JSON.stringify(updated));
  } catch {
    console.warn('Failed to delete AR capture');
  }
};

/**
 * Clear all AR captures
 */
export const clearARCaptures = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AR_CAPTURES);
  } catch {
    console.warn('Failed to clear AR captures');
  }
};

/**
 * Download AR capture as image file
 */
export const downloadARCapture = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename || `ar-tryon-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Share AR capture using Web Share API
 */
export const shareARCapture = async (
  dataUrl: string,
  title: string,
  text: string
): Promise<boolean> => {
  // Check if Web Share API is supported
  if (!navigator.share) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'ar-tryon.png', { type: 'image/png' });

    await navigator.share({
      title,
      text,
      files: [file],
    });

    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to share:', error);
    }
    return false;
  }
};

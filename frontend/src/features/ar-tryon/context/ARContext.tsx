import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ARState {
  isARActive: boolean;
  isModelLoading: boolean;
  isCameraReady: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  showSkeleton: boolean;
  clothingScale: number;
  selectedVariantId: string | null;
}

interface ARContextValue extends ARState {
  startAR: () => void;
  stopAR: () => void;
  toggleCamera: () => void;
  toggleSkeleton: () => void;
  setClothingScale: (scale: number) => void;
  setSelectedVariant: (variantId: string | null) => void;
  setError: (error: string | null) => void;
  setModelLoading: (loading: boolean) => void;
  setCameraReady: (ready: boolean) => void;
  resetAR: () => void;
}

const defaultState: ARState = {
  isARActive: false,
  isModelLoading: false,
  isCameraReady: false,
  error: null,
  facingMode: 'user',
  showSkeleton: false,
  clothingScale: 1.0,
  selectedVariantId: null,
};

const ARContext = createContext<ARContextValue | undefined>(undefined);

export const useARContext = () => {
  const context = useContext(ARContext);
  if (!context) {
    throw new Error('useARContext must be used within an ARProvider');
  }
  return context;
};

interface ARProviderProps {
  children: ReactNode;
}

export const ARProvider: React.FC<ARProviderProps> = ({ children }) => {
  const [state, setState] = useState<ARState>(defaultState);

  const startAR = useCallback(() => {
    setState((prev) => ({ ...prev, isARActive: true, error: null }));
  }, []);

  const stopAR = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isARActive: false,
      isCameraReady: false,
      isModelLoading: false,
    }));
  }, []);

  const toggleCamera = useCallback(() => {
    setState((prev) => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
    }));
  }, []);

  const toggleSkeleton = useCallback(() => {
    setState((prev) => ({ ...prev, showSkeleton: !prev.showSkeleton }));
  }, []);

  const setClothingScale = useCallback((scale: number) => {
    setState((prev) => ({
      ...prev,
      clothingScale: Math.max(0.5, Math.min(1.5, scale)),
    }));
  }, []);

  const setSelectedVariant = useCallback((variantId: string | null) => {
    setState((prev) => ({ ...prev, selectedVariantId: variantId }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setModelLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isModelLoading: loading }));
  }, []);

  const setCameraReady = useCallback((ready: boolean) => {
    setState((prev) => ({ ...prev, isCameraReady: ready }));
  }, []);

  const resetAR = useCallback(() => {
    setState(defaultState);
  }, []);

  const value: ARContextValue = {
    ...state,
    startAR,
    stopAR,
    toggleCamera,
    toggleSkeleton,
    setClothingScale,
    setSelectedVariant,
    setError,
    setModelLoading,
    setCameraReady,
    resetAR,
  };

  return <ARContext.Provider value={value}>{children}</ARContext.Provider>;
};

export default ARContext;

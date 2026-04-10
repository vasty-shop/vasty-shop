/**
 * useCamera Hook
 * Manages webcam access, permissions, and video stream
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import type {
  UseCameraReturn,
  CameraError,
  CameraErrorType,
  CameraFacingMode,
} from './types';

/**
 * Custom hook for camera access and management
 */
export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>('user');

  /**
   * Map native errors to camera error types
   */
  const mapErrorType = (error: Error): CameraErrorType => {
    const errorName = error.name;

    switch (errorName) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'PERMISSION_DENIED' as CameraErrorType;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'NOT_FOUND' as CameraErrorType;
      case 'NotReadableError':
      case 'TrackStartError':
        return 'NOT_READABLE' as CameraErrorType;
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        return 'OVERCONSTRAINED' as CameraErrorType;
      default:
        return 'UNKNOWN' as CameraErrorType;
    }
  };

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (type: CameraErrorType): string => {
    switch (type) {
      case 'PERMISSION_DENIED':
        return 'Camera access denied. Please grant camera permissions in your browser settings.';
      case 'NOT_FOUND':
        return 'No camera found. Please connect a camera device.';
      case 'NOT_READABLE':
        return 'Camera is already in use by another application.';
      case 'OVERCONSTRAINED':
        return 'Could not start camera with the requested settings.';
      default:
        return 'An unknown error occurred while accessing the camera.';
    }
  };

  /**
   * Start camera with specified facing mode
   */
  const startCamera = useCallback(async (): Promise<void> => {
    console.log('[useCamera] Starting camera with facing mode:', facingMode);
    setIsLoading(true);
    setError(null);

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Request camera access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

      console.log('[useCamera] Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            console.log('[useCamera] Video metadata loaded');
            videoRef.current?.play()
              .then(() => {
                console.log('[useCamera] Video playback started');
                resolve();
              })
              .catch(reject);
          };

          videoRef.current.onerror = () => {
            reject(new Error('Video element error'));
          };
        });

        setIsActive(true);
        console.log('[useCamera] Camera started successfully');
      }
    } catch (err) {
      const originalError = err as Error;
      const errorType = mapErrorType(originalError);
      const cameraError: CameraError = {
        type: errorType,
        message: getErrorMessage(errorType),
        originalError,
      };

      console.error('[useCamera] Error starting camera:', cameraError);
      setError(cameraError);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  /**
   * Stop camera and release resources
   */
  const stopCamera = useCallback((): void => {
    console.log('[useCamera] Stopping camera');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('[useCamera] Stopped track:', track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
    console.log('[useCamera] Camera stopped');
  }, []);

  /**
   * Toggle between front and back camera
   */
  const toggleCamera = useCallback(async (): Promise<void> => {
    console.log('[useCamera] Toggling camera');

    const newFacingMode: CameraFacingMode =
      facingMode === 'user' ? 'environment' : 'user';

    setFacingMode(newFacingMode);

    // Restart camera with new facing mode
    if (isActive) {
      stopCamera();
      // Small delay to ensure clean restart
      await new Promise(resolve => setTimeout(resolve, 100));
      await startCamera();
    }
  }, [facingMode, isActive, stopCamera, startCamera]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[useCamera] Cleaning up on unmount');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isLoading,
    error,
    isActive,
    facingMode,
    startCamera,
    stopCamera,
    toggleCamera,
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  onPositionChange?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationError) => void;
}

export interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isWatching: boolean;
  isSupported: boolean;
  permissionStatus: PermissionState | null;
  getCurrentPosition: () => Promise<GeolocationPosition | null>;
  startWatching: () => void;
  stopWatching: () => void;
  requestPermission: () => Promise<boolean>;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
  watchPosition: false,
};

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const mergedOptions = { ...defaultOptions, ...options };

  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Check permission status
  useEffect(() => {
    if (!isSupported) return;

    const checkPermission = async () => {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionStatus(result.state);

          result.onchange = () => {
            setPermissionStatus(result.state);
          };
        }
      } catch (err) {
        // Permission API not supported, will know after requesting
        console.log('Permission API not supported');
      }
    };

    checkPermission();
  }, [isSupported]);

  // Convert GeolocationPosition to our format
  const convertPosition = useCallback((pos: globalThis.GeolocationPosition): GeolocationPosition => {
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      altitudeAccuracy: pos.coords.altitudeAccuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      timestamp: pos.timestamp,
    };
  }, []);

  // Convert GeolocationPositionError to our format
  const convertError = useCallback((err: globalThis.GeolocationPositionError): GeolocationError => {
    const messages: Record<number, string> = {
      1: 'Permission denied. Please allow location access.',
      2: 'Position unavailable. Unable to determine your location.',
      3: 'Request timeout. Location request took too long.',
    };

    return {
      code: err.code,
      message: messages[err.code] || err.message,
    };
  }, []);

  // Get current position once
  const getCurrentPosition = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!isSupported) {
      setError({ code: 0, message: 'Geolocation is not supported by this browser.' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const convertedPos = convertPosition(pos);
          setPosition(convertedPos);
          setIsLoading(false);
          mergedOptions.onPositionChange?.(convertedPos);
          resolve(convertedPos);
        },
        (err) => {
          const convertedErr = convertError(err);
          setError(convertedErr);
          setIsLoading(false);
          mergedOptions.onError?.(convertedErr);
          resolve(null);
        },
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          timeout: mergedOptions.timeout,
          maximumAge: mergedOptions.maximumAge,
        }
      );
    });
  }, [isSupported, convertPosition, convertError, mergedOptions]);

  // Start watching position
  const startWatching = useCallback(() => {
    if (!isSupported) {
      setError({ code: 0, message: 'Geolocation is not supported by this browser.' });
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already watching
    }

    setIsLoading(true);
    setError(null);
    setIsWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const convertedPos = convertPosition(pos);
        setPosition(convertedPos);
        setIsLoading(false);
        mergedOptions.onPositionChange?.(convertedPos);
      },
      (err) => {
        const convertedErr = convertError(err);
        setError(convertedErr);
        setIsLoading(false);
        mergedOptions.onError?.(convertedErr);
      },
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
      }
    );
  }, [isSupported, convertPosition, convertError, mergedOptions]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, []);

  // Request permission (by trying to get current position)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const pos = await getCurrentPosition();
    return pos !== null;
  }, [getCurrentPosition]);

  // Auto-start watching if option is set
  useEffect(() => {
    if (mergedOptions.watchPosition && isSupported) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [mergedOptions.watchPosition, isSupported, startWatching, stopWatching]);

  return {
    position,
    error,
    isLoading,
    isWatching,
    isSupported,
    permissionStatus,
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission,
  };
}

export default useGeolocation;

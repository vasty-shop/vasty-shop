import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocation, GeolocationPosition } from './useGeolocation';
import api from '@/lib/api';

export interface UseDeliveryLocationSenderOptions {
  deliveryManId: string;
  orderId?: string;
  updateInterval?: number; // How often to send location (ms)
  enabled?: boolean;
  onLocationSent?: (location: GeolocationPosition) => void;
  onError?: (error: Error) => void;
}

export interface UseDeliveryLocationSenderReturn {
  isSending: boolean;
  lastSentLocation: GeolocationPosition | null;
  lastSentAt: Date | null;
  error: Error | null;
  startSending: () => void;
  stopSending: () => void;
  sendLocationNow: () => Promise<void>;
}

/**
 * Hook for delivery person to send their live location to backend
 * This should be used in the delivery person's app/dashboard
 */
export function useDeliveryLocationSender(
  options: UseDeliveryLocationSenderOptions
): UseDeliveryLocationSenderReturn {
  const {
    deliveryManId,
    orderId,
    updateInterval = 10000, // Default: send every 10 seconds
    enabled = true,
    onLocationSent,
    onError,
  } = options;

  const [isSending, setIsSending] = useState(false);
  const [lastSentLocation, setLastSentLocation] = useState<GeolocationPosition | null>(null);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

  // Use geolocation hook to get GPS position
  const {
    position,
    error: geoError,
    isWatching,
    startWatching,
    stopWatching,
  } = useGeolocation({
    enableHighAccuracy: true,
    watchPosition: false, // We'll control this manually
  });

  // Send location to backend
  const sendLocationToBackend = useCallback(
    async (location: GeolocationPosition) => {
      if (!deliveryManId) return;

      try {
        await api.patch(`/delivery-man/${deliveryManId}/location`, {
          lat: location.lat,
          lng: location.lng,
          heading: location.heading,
          speed: location.speed ? location.speed * 3.6 : undefined, // Convert m/s to km/h
        });

        console.log('[DeliveryLocationSender] Location sent successfully:', {
          lat: location.lat,
          lng: location.lng,
          deliveryManId,
        });
        setLastSentLocation(location);
        setLastSentAt(new Date());
        setError(null);
        onLocationSent?.(location);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send location');
        console.error('[DeliveryLocationSender] Error:', error.message);
        setError(error);
        onError?.(error);
      }
    },
    [deliveryManId, orderId, onLocationSent, onError]
  );

  // Get current position and send it
  const sendLocationNow = useCallback(async () => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation not supported'));
      return;
    }

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const location: GeolocationPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          };
          await sendLocationToBackend(location);
          resolve();
        },
        (err) => {
          setError(new Error(err.message));
          onError?.(new Error(err.message));
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [sendLocationToBackend, onError]);

  // Start sending location periodically
  const startSending = useCallback(() => {
    if (isActiveRef.current) return;

    console.log('[DeliveryLocationSender] Starting location sending for deliveryManId:', deliveryManId);
    isActiveRef.current = true;
    setIsSending(true);
    setError(null);

    // Start watching position
    startWatching();

    // Send immediately
    sendLocationNow();

    // Set up interval for periodic updates
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
    }
    sendIntervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        sendLocationNow();
      }
    }, updateInterval);
  }, [startWatching, sendLocationNow, updateInterval]);

  // Stop sending location
  const stopSending = useCallback(() => {
    isActiveRef.current = false;
    setIsSending(false);

    stopWatching();

    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }
  }, [stopWatching]);

  // Auto-start if enabled
  useEffect(() => {
    if (enabled && deliveryManId) {
      startSending();
    } else {
      stopSending();
    }

    return () => {
      stopSending();
    };
  }, [enabled, deliveryManId]);

  // Handle geolocation errors
  useEffect(() => {
    if (geoError) {
      setError(new Error(geoError.message));
      onError?.(new Error(geoError.message));
    }
  }, [geoError, onError]);

  return {
    isSending,
    lastSentLocation,
    lastSentAt,
    error,
    startSending,
    stopSending,
    sendLocationNow,
  };
}

export default useDeliveryLocationSender;

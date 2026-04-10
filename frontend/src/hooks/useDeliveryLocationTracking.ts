import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

export interface DeliveryLocation {
  lat: number;
  lng: number;
  timestamp: string;
  address?: string;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface DeliveryLocationUpdate {
  orderId: string;
  deliveryManId: string;
  location: DeliveryLocation;
  eta?: {
    distance: string;
    duration: string;
    distanceValue: number; // meters
    durationValue: number; // seconds
  };
}

export interface DeliveryRoute {
  origin: DeliveryLocation;
  destination: DeliveryLocation;
  waypoints: DeliveryLocation[];
  polyline?: string; // Encoded polyline
}

export interface UseDeliveryLocationTrackingOptions {
  orderId?: string;
  deliveryManId?: string;
  pollInterval?: number; // Polling interval in ms
  onLocationUpdate?: (update: DeliveryLocationUpdate) => void;
  onRouteUpdate?: (route: DeliveryRoute) => void;
  onError?: (error: Error) => void;
}

export interface DeliveryPersonInfo {
  id: string;
  name: string;
  phone?: string;
  vehicleType?: string;
  imageUrl?: string;
}

export interface UseDeliveryLocationTrackingReturn {
  currentLocation: DeliveryLocation | null;
  locationHistory: DeliveryLocation[];
  eta: DeliveryLocationUpdate['eta'] | null;
  route: DeliveryRoute | null;
  deliveryPerson: DeliveryPersonInfo | null;
  isTracking: boolean;
  isConnected: boolean;
  error: Error | null;
  startTracking: () => void;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Format distance for display
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Estimate duration based on distance and speed
function estimateDuration(distanceMeters: number, speedKmh: number = 30): string {
  const durationMinutes = (distanceMeters / 1000 / speedKmh) * 60;
  if (durationMinutes < 1) {
    return '< 1 min';
  }
  if (durationMinutes < 60) {
    return `${Math.round(durationMinutes)} min`;
  }
  const hours = Math.floor(durationMinutes / 60);
  const mins = Math.round(durationMinutes % 60);
  return `${hours}h ${mins}m`;
}

export function useDeliveryLocationTracking(
  options: UseDeliveryLocationTrackingOptions = {}
): UseDeliveryLocationTrackingReturn {
  const { orderId, deliveryManId, pollInterval = 15000, onLocationUpdate, onError } = options;

  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);
  const [eta, setEta] = useState<DeliveryLocationUpdate['eta'] | null>(null);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPersonInfo | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const destinationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Handle location update
  const handleLocationUpdate = useCallback(
    (data: DeliveryLocationUpdate) => {
      const newLocation = data.location;

      setCurrentLocation(newLocation);
      setLocationHistory((prev) => [...prev.slice(-49), newLocation]); // Keep last 50 locations

      // Calculate ETA if we have destination
      if (destinationRef.current && newLocation) {
        const distanceValue = calculateDistance(
          newLocation.lat,
          newLocation.lng,
          destinationRef.current.lat,
          destinationRef.current.lng
        );

        const speed = newLocation.speed || 30; // km/h
        const durationValue = (distanceValue / 1000 / speed) * 3600; // seconds

        const calculatedEta = {
          distance: formatDistance(distanceValue),
          duration: estimateDuration(distanceValue, speed),
          distanceValue,
          durationValue,
        };

        setEta(data.eta || calculatedEta);
      } else if (data.eta) {
        setEta(data.eta);
      }

      onLocationUpdate?.(data);
    },
    [onLocationUpdate]
  );

  // Fetch location from API
  const fetchLocationFromAPI = useCallback(async () => {
    if (!orderId && !deliveryManId) return;

    try {
      // Use order-based endpoint for customers tracking their delivery
      const endpoint = orderId
        ? `/orders/${orderId}/delivery-location`
        : `/delivery-man/${deliveryManId}`;

      console.log('[DeliveryLocationTracking] Fetching location from:', endpoint);

      const response = await api.get(endpoint);
      const data = response.data;
      const responseData = data?.data || data;

      console.log('[DeliveryLocationTracking] Response received:', {
        hasDeliveryMan: !!responseData.deliveryMan,
        hasLocation: !!responseData.location,
        location: responseData.location,
        deliveryManName: responseData.deliveryMan?.name,
      });

      // Extract delivery person info
      if (responseData.deliveryMan) {
        setDeliveryPerson({
          id: responseData.deliveryManId || responseData.deliveryMan.id,
          name: responseData.deliveryMan.name || responseData.deliveryMan.firstName || 'Delivery Person',
          phone: responseData.deliveryMan.phone,
          vehicleType: responseData.deliveryMan.vehicleType,
          imageUrl: responseData.deliveryMan.imageUrl || responseData.deliveryMan.avatar,
        });
      }

      if (responseData.location) {
        const locationData = responseData.location;
        setIsConnected(true);
        handleLocationUpdate({
          orderId: orderId || '',
          deliveryManId: deliveryManId || responseData.deliveryManId,
          location: {
            lat: locationData.lat || locationData.latitude,
            lng: locationData.lng || locationData.longitude,
            timestamp: locationData.timestamp || new Date().toISOString(),
            address: locationData.address,
            speed: locationData.speed,
            heading: locationData.heading,
          },
          eta: responseData.eta,
        });
      }
    } catch (err: any) {
      // If 404, just means no location data yet - not an error
      if (err?.response?.status === 404) {
        console.log('[DeliveryLocationTracking] No location data yet (404)');
        return;
      }
      const error = err instanceof Error ? err : new Error('Failed to fetch location');
      console.error('[DeliveryLocationTracking] Error:', error.message);
      setError(error);
      setIsConnected(false);
      onError?.(error);
    }
  }, [orderId, deliveryManId, handleLocationUpdate, onError]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;

    setIsTracking(true);
    setError(null);

    // Initial fetch
    fetchLocationFromAPI();

    // Set up polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    pollIntervalRef.current = setInterval(fetchLocationFromAPI, pollInterval);
  }, [isTracking, fetchLocationFromAPI, pollInterval]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setIsConnected(false);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Manual refresh
  const refreshLocation = useCallback(async () => {
    await fetchLocationFromAPI();
  }, [fetchLocationFromAPI]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    locationHistory,
    eta,
    route,
    deliveryPerson,
    isTracking,
    isConnected,
    error,
    startTracking,
    stopTracking,
    refreshLocation,
  };
}

export default useDeliveryLocationTracking;

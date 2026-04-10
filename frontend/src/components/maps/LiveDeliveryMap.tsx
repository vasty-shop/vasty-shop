'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { Navigation, MapPin, Clock, Package, Phone } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const deliveryIcon = new L.DivIcon({
  className: 'delivery-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
      border: 3px solid white;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="12 2 19 21 12 17 5 21 12 2"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const destinationIcon = new L.DivIcon({
  className: 'destination-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #10b981, #059669);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
      border: 3px solid white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const pickupIcon = new L.DivIcon({
  className: 'pickup-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #f59e0b, #d97706);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
      border: 3px solid white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp?: string;
  address?: string;
}

export interface DeliveryPersonInfo {
  name: string;
  phone?: string;
  avatar?: string;
  vehicleType?: string;
  vehicleNumber?: string;
}

export interface LiveDeliveryMapProps {
  deliveryLocation?: LocationPoint | null;
  destinationLocation?: LocationPoint | null;
  pickupLocation?: LocationPoint | null;
  deliveryPerson?: DeliveryPersonInfo | null;
  routePath?: LocationPoint[];
  eta?: {
    distance: string;
    duration: string;
  };
  isLive?: boolean;
  showRoute?: boolean;
  height?: string;
  className?: string;
  onCallDelivery?: () => void;
}

// Component to update map view when location changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
}

// Component to fit bounds when multiple markers
function BoundsFitter({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [positions, map]);

  return null;
}

export function LiveDeliveryMap({
  deliveryLocation,
  destinationLocation,
  pickupLocation,
  deliveryPerson,
  routePath = [],
  eta,
  isLive = false,
  showRoute = true,
  height = '400px',
  className = '',
  onCallDelivery,
}: LiveDeliveryMapProps) {
  const { t } = useTranslation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]); // Default: Dhaka
  const [mapZoom, setMapZoom] = useState(13);

  // Calculate center based on available locations
  useEffect(() => {
    if (deliveryLocation) {
      setMapCenter([deliveryLocation.lat, deliveryLocation.lng]);
      setMapZoom(15);
    } else if (destinationLocation) {
      setMapCenter([destinationLocation.lat, destinationLocation.lng]);
      setMapZoom(14);
    } else if (pickupLocation) {
      setMapCenter([pickupLocation.lat, pickupLocation.lng]);
      setMapZoom(14);
    }
  }, [deliveryLocation, destinationLocation, pickupLocation]);

  // Collect all positions for bounds fitting
  const allPositions: [number, number][] = [];
  if (deliveryLocation) allPositions.push([deliveryLocation.lat, deliveryLocation.lng]);
  if (destinationLocation) allPositions.push([destinationLocation.lat, destinationLocation.lng]);
  if (pickupLocation) allPositions.push([pickupLocation.lat, pickupLocation.lng]);

  // Convert route path to polyline format
  const polylinePositions: [number, number][] = routePath.map(p => [p.lat, p.lng]);

  // No location available at all
  if (!deliveryLocation && !destinationLocation && !pickupLocation) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('tracking.locationNotAvailable', { defaultValue: 'Location not available yet' })}</p>
        </div>
      </div>
    );
  }

  // Show waiting message when we have destination but no delivery location yet
  const showWaitingForDelivery = !deliveryLocation && destinationLocation;

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-lg ${className}`} style={{ height }}>
      {/* Live indicator */}
      {isLive && deliveryLocation && (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {t('tracking.live', { defaultValue: 'LIVE' })}
        </div>
      )}

      {/* Waiting for delivery person location */}
      {showWaitingForDelivery && (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {t('tracking.waitingForLocation', { defaultValue: 'Waiting for delivery location...' })}
        </div>
      )}

      {/* ETA Card */}
      {eta && (
        <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-[140px]">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">{t('tracking.eta', { defaultValue: 'ETA' })}</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{eta.duration}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{eta.distance} {t('tracking.away', { defaultValue: 'away' })}</p>
        </div>
      )}

      {/* Delivery Person Card */}
      {deliveryPerson && deliveryLocation && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {deliveryPerson.avatar ? (
                <img src={deliveryPerson.avatar} alt={deliveryPerson.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                deliveryPerson.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">{deliveryPerson.name}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {deliveryPerson.vehicleType && (
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {deliveryPerson.vehicleType}
                  </span>
                )}
                {deliveryPerson.vehicleNumber && (
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {deliveryPerson.vehicleNumber}
                  </span>
                )}
              </div>
            </div>
            {deliveryPerson.phone && onCallDelivery && (
              <button
                onClick={onCallDelivery}
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={mapCenter} zoom={mapZoom} />
        {allPositions.length > 1 && <BoundsFitter positions={allPositions} />}

        {/* Route Polyline */}
        {showRoute && polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Pickup Location Marker */}
        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-center p-2">
                <Package className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                <p className="font-semibold">{t('tracking.pickupPoint', { defaultValue: 'Pickup Point' })}</p>
                {pickupLocation.address && (
                  <p className="text-xs text-gray-500 mt-1">{pickupLocation.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Delivery Person Marker */}
        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
            <Popup>
              <div className="text-center p-2">
                <Navigation className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <p className="font-semibold">
                  {deliveryPerson?.name || t('tracking.deliveryPerson', { defaultValue: 'Delivery Person' })}
                </p>
                {deliveryLocation.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('tracking.lastUpdate', { defaultValue: 'Last update' })}: {new Date(deliveryLocation.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationLocation && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-center p-2">
                <MapPin className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p className="font-semibold">{t('tracking.deliveryAddress', { defaultValue: 'Delivery Address' })}</p>
                {destinationLocation.address && (
                  <p className="text-xs text-gray-500 mt-1">{destinationLocation.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default LiveDeliveryMap;

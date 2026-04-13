/**
 * Common interface that every maps / geocoding provider implements.
 *
 * Pick a provider by setting MAPS_PROVIDER in your .env to one of:
 *
 *   osm-leaflet  - OpenStreetMap tiles + Nominatim geocoding. Zero
 *                  infra, zero API keys. Public Nominatim is rate-
 *                  limited; self-hosting it is trivial for production.
 *                  The default.
 *
 *   google-maps  - Google Maps Geocoding + Tiles. Requires a paid
 *                  billing account on Google Cloud.
 *
 *   mapbox       - Mapbox Geocoding + Tiles. Generous free tier
 *                  (50k requests/month). Beautiful custom styling.
 *
 *   maptiler     - MapTiler Geocoding + Tiles. OSM-based managed
 *                  tiles. Free tier (100k tile requests/month).
 *
 *   none         - Maps features disabled. Every method throws.
 *                  The default if MAPS_PROVIDER is unset.
 *
 * Adding a new provider: implement this interface, register it in
 * providers/index.ts, document the env vars in docs/providers/maps.md.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodeInput {
  /** Free-text address. */
  address: string;
  /** Restrict to a country code (ISO 3166-1 alpha-2, e.g. "BD", "IN"). */
  countryCode?: string;
}

export interface ReverseGeocodeInput {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  /** Best-match coordinates. */
  location: LatLng;
  /** Full formatted display address. */
  formattedAddress: string;
  /** Best-effort structured components. */
  components?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    countryCode?: string;
  };
  /** Provider name that produced the result. */
  provider: string;
  /** Confidence 0-1 if the provider reports it. */
  confidence?: number;
}

/**
 * Frontend-safe bootstrap data. Returned by `getFrontendConfig()` so
 * a single `GET /config/maps` endpoint can drive the `<Map>` component
 * regardless of which provider is active.
 *
 * CRITICAL: don't include any secret keys here. Public keys only
 * (Mapbox public token, Google Maps JS API browser key, MapTiler
 * public key). For providers where the same key covers both server
 * and browser use (osm-leaflet has none at all), return an empty key.
 */
export interface FrontendMapsConfig {
  provider: string;
  /** Tile URL template for Leaflet / MapLibre. Empty for google-maps
   * (which uses its own JS API, not raster tiles). */
  tileUrl?: string;
  /** Attribution HTML to show on the map per the provider's ToS. */
  attribution: string;
  /** Public API key for the browser (if needed). */
  publicKey?: string;
  /** Default zoom. */
  defaultZoom: number;
  /** Default center (falls back to config.DEFAULT_LATLNG if set). */
  defaultCenter: LatLng;
  /** Any extra config the frontend needs. */
  extra?: Record<string, any>;
}

/**
 * Common interface implemented by every maps provider. Methods a
 * provider can't support should throw MapsProviderNotSupportedError —
 * never silently no-op.
 */
export interface MapsProvider {
  /** Stable provider name for logging / clients. */
  readonly name:
    | 'osm-leaflet'
    | 'google-maps'
    | 'mapbox'
    | 'maptiler'
    | 'none';

  /** True if the provider has the credentials it needs. */
  isAvailable(): boolean;

  /** Geocode a free-text address to coordinates. */
  geocode(input: GeocodeInput): Promise<GeocodeResult | null>;

  /** Reverse-geocode coordinates to a human-readable address. */
  reverseGeocode(input: ReverseGeocodeInput): Promise<GeocodeResult | null>;

  /** Frontend-safe config for the `<Map>` component. */
  getFrontendConfig(): FrontendMapsConfig;
}

/**
 * Thrown when a provider is asked to do something it doesn't support.
 */
export class MapsProviderNotSupportedError extends Error {
  constructor(provider: string, operation: string) {
    super(
      `Operation "${operation}" is not supported by the "${provider}" maps provider. See docs/providers/maps.md.`,
    );
    this.name = 'MapsProviderNotSupportedError';
  }
}

/**
 * Thrown when a provider is selected but its credentials are missing.
 */
export class MapsProviderNotConfiguredError extends Error {
  constructor(provider: string, missingVars: string[]) {
    super(
      `Maps provider "${provider}" is selected but the following env vars are missing: ${missingVars.join(', ')}. See docs/providers/maps.md.`,
    );
    this.name = 'MapsProviderNotConfiguredError';
  }
}

/**
 * Point-in-polygon test for delivery-zone containment checks. This is
 * pure geometry — doesn't need a provider at all, so it lives here
 * as a helper function so callers can call it directly:
 *
 *   import { pointInPolygon } from './providers';
 *   if (pointInPolygon({lat, lng}, zone.polygon)) { ... }
 *
 * Uses the ray-casting algorithm. Polygon is a closed ring of
 * { lat, lng } points; the last point may or may not equal the first.
 */
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

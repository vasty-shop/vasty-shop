/**
 * OpenStreetMap + Leaflet maps provider — zero infra, zero keys.
 *
 *   MAPS_PROVIDER=osm-leaflet
 *
 * Optional env vars:
 *   NOMINATIM_URL        - Nominatim base URL for geocoding.
 *                          Defaults to https://nominatim.openstreetmap.org.
 *                          IMPORTANT: the public instance is rate-limited
 *                          to 1 req/sec per IP and requires a User-Agent
 *                          identifying your app. For production traffic,
 *                          self-host Nominatim or use a paid alternative.
 *   NOMINATIM_USER_AGENT - Required by the public Nominatim policy.
 *                          Defaults to "vasty-shop/1.0".
 *   OSM_TILE_URL         - Tile URL template for the frontend.
 *                          Defaults to https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png.
 *                          For production, point at your own tile server
 *                          or a paid tile provider.
 *
 * Zero signup, zero API keys, zero infrastructure to set up. The
 * recommended starting point for dev and small self-hosted deployments.
 *
 * Pure REST via fetch — no SDK dep.
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FrontendMapsConfig,
  GeocodeInput,
  GeocodeResult,
  LatLng,
  MapsProvider,
  ReverseGeocodeInput,
} from './maps-provider.interface';

export class OsmLeafletProvider implements MapsProvider {
  readonly name = 'osm-leaflet' as const;
  private readonly logger = new Logger('OsmLeafletProvider');

  private readonly nominatimUrl: string;
  private readonly userAgent: string;
  private readonly tileUrl: string;
  private readonly defaultCenter: LatLng;
  private readonly defaultZoom: number;

  constructor(config: ConfigService) {
    this.nominatimUrl = (
      config.get<string>('NOMINATIM_URL', 'https://nominatim.openstreetmap.org') ||
      'https://nominatim.openstreetmap.org'
    ).replace(/\/+$/, '');
    this.userAgent = config.get<string>(
      'NOMINATIM_USER_AGENT',
      'vasty-shop/1.0',
    );
    this.tileUrl = config.get<string>(
      'OSM_TILE_URL',
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    );
    this.defaultCenter = {
      lat: parseFloat(config.get<string>('MAPS_DEFAULT_LAT', '23.8103')),
      lng: parseFloat(config.get<string>('MAPS_DEFAULT_LNG', '90.4125')),
    };
    this.defaultZoom = parseInt(config.get<string>('MAPS_DEFAULT_ZOOM', '12'), 10);

    this.logger.log(
      `OSM + Leaflet provider configured (nominatim=${this.nominatimUrl})`,
    );
  }

  isAvailable(): boolean {
    // Always available — the defaults point at public services that
    // require no setup. If the public Nominatim hits a rate limit, the
    // provider surfaces the error instead of silently failing.
    return true;
  }

  async geocode(input: GeocodeInput): Promise<GeocodeResult | null> {
    const params = new URLSearchParams({
      q: input.address,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '1',
    });
    if (input.countryCode) {
      params.set('countrycodes', input.countryCode.toLowerCase());
    }

    const res = await fetch(`${this.nominatimUrl}/search?${params.toString()}`, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim /search failed: ${res.status}`);
    }
    const arr = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      importance?: number;
      address?: {
        road?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
      };
    }>;

    if (arr.length === 0) return null;
    const hit = arr[0];
    return {
      location: { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) },
      formattedAddress: hit.display_name,
      components: {
        street: hit.address?.road,
        city:
          hit.address?.city ??
          hit.address?.town ??
          hit.address?.village,
        state: hit.address?.state,
        postalCode: hit.address?.postcode,
        country: hit.address?.country,
        countryCode: hit.address?.country_code?.toUpperCase(),
      },
      provider: 'osm-leaflet',
      confidence: hit.importance,
    };
  }

  async reverseGeocode(input: ReverseGeocodeInput): Promise<GeocodeResult | null> {
    const params = new URLSearchParams({
      lat: String(input.lat),
      lon: String(input.lng),
      format: 'jsonv2',
      addressdetails: '1',
    });

    const res = await fetch(`${this.nominatimUrl}/reverse?${params.toString()}`, {
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim /reverse failed: ${res.status}`);
    }
    const hit = (await res.json()) as {
      lat: string;
      lon: string;
      display_name?: string;
      error?: string;
      address?: any;
    };

    if (hit.error || !hit.display_name) return null;

    return {
      location: { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) },
      formattedAddress: hit.display_name,
      components: {
        street: hit.address?.road,
        city:
          hit.address?.city ??
          hit.address?.town ??
          hit.address?.village,
        state: hit.address?.state,
        postalCode: hit.address?.postcode,
        country: hit.address?.country,
        countryCode: hit.address?.country_code?.toUpperCase(),
      },
      provider: 'osm-leaflet',
    };
  }

  getFrontendConfig(): FrontendMapsConfig {
    return {
      provider: 'osm-leaflet',
      tileUrl: this.tileUrl,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      defaultZoom: this.defaultZoom,
      defaultCenter: this.defaultCenter,
    };
  }
}

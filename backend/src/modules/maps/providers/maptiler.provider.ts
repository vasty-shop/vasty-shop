/**
 * MapTiler provider.
 *
 *   MAPS_PROVIDER=maptiler
 *   MAPTILER_API_KEY=...
 *
 * Pure REST via fetch. MapTiler serves OSM-based tiles (the raw data
 * is OpenStreetMap) with a polished API and generous free tier
 * (100k tile requests/month, 100k geocoding requests/month). A
 * middle ground between osm-leaflet (raw OSM, no SLA) and Google
 * Maps (paid from day one).
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FrontendMapsConfig,
  GeocodeInput,
  GeocodeResult,
  LatLng,
  MapsProvider,
  MapsProviderNotConfiguredError,
  ReverseGeocodeInput,
} from './maps-provider.interface';

export class MaptilerProvider implements MapsProvider {
  readonly name = 'maptiler' as const;
  private readonly logger = new Logger('MaptilerProvider');

  private readonly apiKey: string;
  private readonly defaultCenter: LatLng;
  private readonly defaultZoom: number;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('MAPTILER_API_KEY', '');
    this.defaultCenter = {
      lat: parseFloat(config.get<string>('MAPS_DEFAULT_LAT', '23.8103')),
      lng: parseFloat(config.get<string>('MAPS_DEFAULT_LNG', '90.4125')),
    };
    this.defaultZoom = parseInt(config.get<string>('MAPS_DEFAULT_ZOOM', '12'), 10);

    if (this.isAvailable()) {
      this.logger.log('MapTiler provider configured');
    } else {
      this.logger.warn('MapTiler provider selected but MAPTILER_API_KEY missing');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async geocode(input: GeocodeInput): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new MapsProviderNotConfiguredError('maptiler', ['MAPTILER_API_KEY']);
    }
    const params = new URLSearchParams({
      key: this.apiKey,
      limit: '1',
    });
    if (input.countryCode) {
      params.set('country', input.countryCode.toLowerCase());
    }
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(input.address)}.json?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MapTiler geocode failed: ${res.status}`);
    const json = (await res.json()) as {
      features: Array<{
        center: [number, number];
        place_name: string;
        context?: Array<{ id: string; text: string }>;
        text?: string;
        relevance?: number;
      }>;
    };
    if (!json.features || json.features.length === 0) return null;
    return this.translateFeature(json.features[0]);
  }

  async reverseGeocode(input: ReverseGeocodeInput): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new MapsProviderNotConfiguredError('maptiler', ['MAPTILER_API_KEY']);
    }
    const url = `https://api.maptiler.com/geocoding/${input.lng},${input.lat}.json?key=${this.apiKey}&limit=1`;
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`MapTiler reverse geocode failed: ${res.status}`);
    const json = (await res.json()) as { features: Array<any> };
    if (!json.features || json.features.length === 0) return null;
    return this.translateFeature(json.features[0]);
  }

  private translateFeature(f: any): GeocodeResult {
    const [lng, lat] = f.center;
    const findContext = (prefix: string) =>
      f.context?.find((c: any) => c.id?.startsWith(prefix));

    const country = findContext('country');
    const region = findContext('region');
    const postcode = findContext('postcode');
    const place = findContext('place');

    return {
      location: { lat, lng },
      formattedAddress: f.place_name,
      components: {
        street: f.text,
        city: place?.text,
        state: region?.text,
        postalCode: postcode?.text,
        country: country?.text,
      },
      provider: 'maptiler',
      confidence: f.relevance,
    };
  }

  getFrontendConfig(): FrontendMapsConfig {
    return {
      provider: 'maptiler',
      tileUrl: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${this.apiKey}`,
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      publicKey: this.apiKey,
      defaultZoom: this.defaultZoom,
      defaultCenter: this.defaultCenter,
    };
  }
}

/**
 * Mapbox provider.
 *
 *   MAPS_PROVIDER=mapbox
 *   MAPBOX_TOKEN=pk....            # public access token (used by both
 *                                   # server geocoding and frontend tiles)
 *   MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12    # optional
 *
 * Pure REST via fetch. Mapbox's geocoding endpoint returns GeoJSON
 * features; the provider translates to our unified shape.
 *
 * Generous free tier (50k geocoding + 50k tile requests/month). Great
 * for beautiful custom styling and production marketplaces.
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

export class MapboxProvider implements MapsProvider {
  readonly name = 'mapbox' as const;
  private readonly logger = new Logger('MapboxProvider');

  private readonly token: string;
  private readonly style: string;
  private readonly defaultCenter: LatLng;
  private readonly defaultZoom: number;

  constructor(config: ConfigService) {
    this.token = config.get<string>('MAPBOX_TOKEN', '');
    this.style = config.get<string>(
      'MAPBOX_STYLE',
      'mapbox://styles/mapbox/streets-v12',
    );
    this.defaultCenter = {
      lat: parseFloat(config.get<string>('MAPS_DEFAULT_LAT', '23.8103')),
      lng: parseFloat(config.get<string>('MAPS_DEFAULT_LNG', '90.4125')),
    };
    this.defaultZoom = parseInt(config.get<string>('MAPS_DEFAULT_ZOOM', '12'), 10);

    if (this.isAvailable()) {
      this.logger.log('Mapbox provider configured');
    } else {
      this.logger.warn('Mapbox provider selected but MAPBOX_TOKEN missing');
    }
  }

  isAvailable(): boolean {
    return !!this.token;
  }

  async geocode(input: GeocodeInput): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new MapsProviderNotConfiguredError('mapbox', ['MAPBOX_TOKEN']);
    }
    const params = new URLSearchParams({
      access_token: this.token,
      limit: '1',
    });
    if (input.countryCode) {
      params.set('country', input.countryCode.toLowerCase());
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input.address)}.json?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox geocode failed: ${res.status}`);
    const json = (await res.json()) as {
      features: Array<{
        center: [number, number];
        place_name: string;
        context?: Array<{ id: string; text: string; short_code?: string }>;
        text?: string;
        relevance?: number;
      }>;
    };
    if (!json.features || json.features.length === 0) return null;
    return this.translateFeature(json.features[0]);
  }

  async reverseGeocode(input: ReverseGeocodeInput): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new MapsProviderNotConfiguredError('mapbox', ['MAPBOX_TOKEN']);
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input.lng},${input.lat}.json?access_token=${this.token}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mapbox reverse geocode failed: ${res.status}`);
    const json = (await res.json()) as { features: Array<any> };
    if (!json.features || json.features.length === 0) return null;
    return this.translateFeature(json.features[0]);
  }

  private translateFeature(f: any): GeocodeResult {
    // Mapbox returns [lng, lat] in GeoJSON convention — flip for us.
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
        countryCode: country?.short_code?.toUpperCase(),
      },
      provider: 'mapbox',
      confidence: f.relevance,
    };
  }

  getFrontendConfig(): FrontendMapsConfig {
    // Mapbox tiles are served via maplibre-gl with the style URL +
    // public token. The frontend should use maplibre-gl or mapbox-gl.
    return {
      provider: 'mapbox',
      // Raster tile URL template as fallback for Leaflet-based UIs:
      tileUrl: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${this.token}`,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      publicKey: this.token,
      defaultZoom: this.defaultZoom,
      defaultCenter: this.defaultCenter,
      extra: {
        style: this.style,
      },
    };
  }
}

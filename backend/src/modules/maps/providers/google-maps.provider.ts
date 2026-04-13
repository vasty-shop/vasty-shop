/**
 * Google Maps provider.
 *
 *   MAPS_PROVIDER=google-maps
 *   GOOGLE_MAPS_API_KEY=...              # server-side geocoding key
 *   GOOGLE_MAPS_BROWSER_KEY=...          # optional; separate restricted key
 *                                        # for the frontend JS API
 *
 * Geocoding via the Geocoding API (pure REST, no SDK). The frontend
 * uses the Maps JS API directly — there's no static tile URL; instead
 * `getFrontendConfig().extra.jsApiUrl` gives the script URL for the
 * `<Map>` component to lazy-load.
 *
 * Requires a paid Google Cloud billing account (the geocoding API is
 * $5/1000 after the free tier).
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

export class GoogleMapsProvider implements MapsProvider {
  readonly name = 'google-maps' as const;
  private readonly logger = new Logger('GoogleMapsProvider');

  private readonly apiKey: string;
  private readonly browserKey: string;
  private readonly defaultCenter: LatLng;
  private readonly defaultZoom: number;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GOOGLE_MAPS_API_KEY', '');
    this.browserKey = config.get<string>(
      'GOOGLE_MAPS_BROWSER_KEY',
      this.apiKey,
    );
    this.defaultCenter = {
      lat: parseFloat(config.get<string>('MAPS_DEFAULT_LAT', '23.8103')),
      lng: parseFloat(config.get<string>('MAPS_DEFAULT_LNG', '90.4125')),
    };
    this.defaultZoom = parseInt(config.get<string>('MAPS_DEFAULT_ZOOM', '12'), 10);

    if (this.isAvailable()) {
      this.logger.log('Google Maps provider configured');
    } else {
      this.logger.warn(
        'Google Maps provider selected but GOOGLE_MAPS_API_KEY missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async geocode(input: GeocodeInput): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new MapsProviderNotConfiguredError('google-maps', [
        'GOOGLE_MAPS_API_KEY',
      ]);
    }
    const params = new URLSearchParams({
      address: input.address,
      key: this.apiKey,
    });
    if (input.countryCode) {
      params.set('components', `country:${input.countryCode.toUpperCase()}`);
    }

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );
    if (!res.ok) throw new Error(`Google Maps geocode failed: ${res.status}`);
    const json = (await res.json()) as {
      status: string;
      results: Array<{
        geometry: { location: { lat: number; lng: number } };
        formatted_address: string;
        address_components: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      }>;
    };

    if (json.status !== 'OK' || json.results.length === 0) return null;
    return this.translateResult(json.results[0]);
  }

  async reverseGeocode(input: ReverseGeocodeInput): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new MapsProviderNotConfiguredError('google-maps', [
        'GOOGLE_MAPS_API_KEY',
      ]);
    }
    const params = new URLSearchParams({
      latlng: `${input.lat},${input.lng}`,
      key: this.apiKey,
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    );
    if (!res.ok)
      throw new Error(`Google Maps reverse geocode failed: ${res.status}`);
    const json = (await res.json()) as {
      status: string;
      results: Array<any>;
    };
    if (json.status !== 'OK' || json.results.length === 0) return null;
    return this.translateResult(json.results[0]);
  }

  private translateResult(r: any): GeocodeResult {
    const getComponent = (types: string[]) =>
      r.address_components.find((c: any) =>
        types.some((t) => c.types.includes(t)),
      );

    const street = getComponent(['route']);
    const streetNumber = getComponent(['street_number']);
    const city = getComponent(['locality', 'sublocality', 'postal_town']);
    const state = getComponent(['administrative_area_level_1']);
    const postal = getComponent(['postal_code']);
    const country = getComponent(['country']);

    return {
      location: r.geometry.location,
      formattedAddress: r.formatted_address,
      components: {
        street: [streetNumber?.long_name, street?.long_name]
          .filter(Boolean)
          .join(' '),
        city: city?.long_name,
        state: state?.long_name,
        postalCode: postal?.long_name,
        country: country?.long_name,
        countryCode: country?.short_name,
      },
      provider: 'google-maps',
    };
  }

  getFrontendConfig(): FrontendMapsConfig {
    return {
      provider: 'google-maps',
      attribution: '&copy; Google',
      publicKey: this.browserKey,
      defaultZoom: this.defaultZoom,
      defaultCenter: this.defaultCenter,
      extra: {
        jsApiUrl: `https://maps.googleapis.com/maps/api/js?key=${this.browserKey}`,
      },
    };
  }
}

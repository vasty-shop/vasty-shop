/**
 * "None" maps provider — maps features disabled.
 *
 * The default if MAPS_PROVIDER is unset. Every method throws
 * MapsProviderNotConfiguredError so calling code fails loudly rather
 * than silently returning null (which would hide real wiring bugs).
 */
import { Logger } from '@nestjs/common';
import {
  FrontendMapsConfig,
  GeocodeInput,
  GeocodeResult,
  MapsProvider,
  MapsProviderNotConfiguredError,
  ReverseGeocodeInput,
} from './maps-provider.interface';

export class NoneMapsProvider implements MapsProvider {
  readonly name = 'none' as const;
  private readonly logger = new Logger('NoneMapsProvider');

  constructor() {
    this.logger.log(
      'Maps are DISABLED (MAPS_PROVIDER not set). To enable, set MAPS_PROVIDER to one of: osm-leaflet, google-maps, mapbox, maptiler. See docs/providers/maps.md.',
    );
  }

  isAvailable(): boolean {
    return false;
  }

  private fail(op: string): never {
    throw new MapsProviderNotConfiguredError('none', [
      `MAPS_PROVIDER (currently unset) - cannot ${op}`,
    ]);
  }

  async geocode(_input: GeocodeInput): Promise<GeocodeResult | null> {
    return this.fail('geocode');
  }

  async reverseGeocode(
    _input: ReverseGeocodeInput,
  ): Promise<GeocodeResult | null> {
    return this.fail('reverseGeocode');
  }

  getFrontendConfig(): FrontendMapsConfig {
    return {
      provider: 'none',
      attribution: '',
      defaultZoom: 2,
      defaultCenter: { lat: 0, lng: 0 },
      extra: { disabled: true },
    };
  }
}

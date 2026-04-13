/**
 * MapsService — the app's maps/geocoding façade.
 *
 * Modules that need geocoding, reverse-geocoding, delivery-zone
 * containment checks, or frontend map config inject this single
 * service. Switching providers is a matter of changing `MAPS_PROVIDER`
 * in .env — no code changes.
 *
 * See `./providers/` and `docs/providers/maps.md`.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createMapsProvider,
  FrontendMapsConfig,
  GeocodeInput,
  GeocodeResult,
  LatLng,
  MapsProvider,
  ReverseGeocodeInput,
  pointInPolygon,
} from './providers';

@Injectable()
export class MapsService implements OnModuleInit {
  private readonly logger = new Logger(MapsService.name);
  private provider!: MapsProvider;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.provider = createMapsProvider(this.config);
    this.logger.log(
      `Maps provider initialized: ${this.provider.name} (available=${this.provider.isAvailable()})`,
    );
  }

  getProviderName(): string {
    return this.provider?.name ?? 'none';
  }

  isAvailable(): boolean {
    return !!this.provider && this.provider.isAvailable();
  }

  async geocode(input: GeocodeInput): Promise<GeocodeResult | null> {
    return this.provider.geocode(input);
  }

  async reverseGeocode(
    input: ReverseGeocodeInput,
  ): Promise<GeocodeResult | null> {
    return this.provider.reverseGeocode(input);
  }

  getFrontendConfig(): FrontendMapsConfig {
    return this.provider.getFrontendConfig();
  }

  /**
   * Ray-casting point-in-polygon test for delivery-zone checks. Pure
   * geometry — no provider API call. Exposed here so callers don't
   * need to import from the provider module directly.
   */
  pointInZone(point: LatLng, polygon: LatLng[]): boolean {
    return pointInPolygon(point, polygon);
  }

  getProvider(): MapsProvider {
    return this.provider;
  }
}

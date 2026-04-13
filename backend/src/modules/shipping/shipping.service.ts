/**
 * ShippingService — the app's shipping façade.
 *
 * Modules that need to quote shipping rates, generate labels, or
 * track parcels should inject this service.
 *
 * Switching providers (manual-zones → shipengine → pathao) is just
 * a matter of changing `SHIPPING_PROVIDER` in .env.
 *
 * See `./providers/` and `docs/providers/shipping.md`.
 *
 * Migration note: the existing `DeliveryService` handles internal
 * driver assignment, delivery addresses, and operational state for
 * Vasty Shop's own last-mile operations. It's orthogonal to this
 * service, which talks to third-party carriers. A future PR can
 * unify the two if needed — for now they coexist.
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createShippingProvider,
  CreateShipmentInput,
  GetRatesInput,
  Shipment,
  ShippingProvider,
  ShippingRate,
  TrackingUpdate,
} from './providers';

@Injectable()
export class ShippingService implements OnModuleInit {
  private readonly logger = new Logger(ShippingService.name);
  private provider!: ShippingProvider;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.provider = createShippingProvider(this.config);
    this.logger.log(
      `Shipping provider initialized: ${this.provider.name} (available=${this.provider.isAvailable()})`,
    );
  }

  getProviderName(): string {
    return this.provider?.name ?? 'manual-zones';
  }

  isAvailable(): boolean {
    return !!this.provider && this.provider.isAvailable();
  }

  async getRates(input: GetRatesInput): Promise<ShippingRate[]> {
    return this.provider.getRates(input);
  }

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    return this.provider.createShipment(input);
  }

  async trackShipment(trackingNumber: string): Promise<TrackingUpdate | null> {
    return this.provider.trackShipment(trackingNumber);
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    return this.provider.cancelShipment(shipmentId);
  }

  getProvider(): ShippingProvider {
    return this.provider;
  }
}

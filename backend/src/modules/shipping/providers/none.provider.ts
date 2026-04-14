/**
 * "None" shipping provider — shipping is disabled.
 *
 * Unusual default behavior: `getRates()` returns an empty array
 * without throwing so the checkout flow can show "No shipping
 * options available" gracefully. The other methods throw loudly
 * so any attempt to actually create a shipment fails fast.
 *
 * If you want working shipping, use `manual-zones` as the default
 * (it has zero infra and still gives you at least a flat-rate
 * quote).
 */
import { Logger } from '@nestjs/common';
import {
  CreateShipmentInput,
  GetRatesInput,
  Shipment,
  ShippingProvider,
  ShippingProviderNotConfiguredError,
  ShippingRate,
  TrackingUpdate,
} from './shipping-provider.interface';

export class NoneShippingProvider implements ShippingProvider {
  readonly name = 'none' as const;
  private readonly logger = new Logger('NoneShippingProvider');

  constructor() {
    this.logger.log(
      'Shipping is DISABLED (SHIPPING_PROVIDER set to none). Checkout will show no shipping options. To enable, set SHIPPING_PROVIDER to one of: manual-zones, shipengine, easypost, shippo, pathao. See docs/providers/shipping.md.',
    );
  }

  isAvailable(): boolean {
    return false;
  }

  private fail(op: string): never {
    throw new ShippingProviderNotConfiguredError('none', [
      `SHIPPING_PROVIDER (currently unset) - cannot ${op}`,
    ]);
  }

  async getRates(_input: GetRatesInput): Promise<ShippingRate[]> {
    // Return empty instead of throwing — the checkout UI can display
    // "no shipping options available" without crashing.
    return [];
  }

  async createShipment(_input: CreateShipmentInput): Promise<Shipment> {
    return this.fail('createShipment');
  }

  async trackShipment(_trackingNumber: string): Promise<TrackingUpdate | null> {
    return null;
  }

  async cancelShipment(_shipmentId: string): Promise<void> {
    return this.fail('cancelShipment');
  }
}

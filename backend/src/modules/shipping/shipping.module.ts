import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';

/**
 * Shipping module — exposes the pluggable ShippingService for
 * third-party carrier quotes, label generation, and tracking.
 *
 * Pick a provider by setting SHIPPING_PROVIDER in your .env. See
 * `docs/providers/shipping.md`.
 *
 * Deliberately has no controller — shipping is an outbound concern
 * that other services (cart / checkout / orders) call into. A
 * future /webhooks/shipping/:provider endpoint for tracking updates
 * can land in a follow-up.
 */
@Module({
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}

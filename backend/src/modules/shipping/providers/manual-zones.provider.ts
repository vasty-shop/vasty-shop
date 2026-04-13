/**
 * Manual zones shipping provider — the default.
 *
 *   SHIPPING_PROVIDER=manual-zones    (default)
 *
 * Returns a flat rate per delivery zone configured in the admin UI.
 * Zone matching rules (in priority order):
 *
 *   1. countryCode + postalCode prefix match (most specific)
 *   2. countryCode + state match
 *   3. countryCode only (fallback)
 *
 * Zero infrastructure, zero external API calls. Perfect for small
 * self-hosted marketplaces that just need "ships to X country, $Y
 * flat". For real-time multi-carrier quotes, graduate to ShipEngine
 * or EasyPost.
 *
 * No label generation, no tracking — this provider is for the
 * cart preview + checkout quote path only. The `createShipment`
 * method returns a placeholder shipment that the app's own delivery
 * module handles operationally (internal driver assignment, etc).
 *
 * The actual zone config is injected via the factory — this provider
 * is stateless. See `MANUAL_ZONES` below for the default seed zones
 * and how to customize.
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateShipmentInput,
  GetRatesInput,
  Shipment,
  ShippingProvider,
  ShippingProviderNotSupportedError,
  ShippingRate,
  TrackingUpdate,
} from './shipping-provider.interface';

export interface ManualZone {
  /** Human-readable zone name, e.g. "Dhaka Metro" or "Europe". */
  name: string;
  /** ISO 3166-1 alpha-2 country code this zone covers. */
  countryCode: string;
  /** Optional: restrict to specific states. */
  states?: string[];
  /** Optional: restrict to specific postal code prefixes. */
  postalPrefixes?: string[];
  /** Flat shipping cost in smallest currency units (cents, paisa, etc). */
  baseAmount: number;
  /** Extra per-kg cost (smallest currency units). */
  perKgAmount?: number;
  /** Currency code. */
  currency: string;
  /** Estimated delivery days. */
  estimatedDays?: number;
  /** Carrier display name shown to the customer. */
  carrier?: string;
  /** Service display name. */
  service?: string;
}

/**
 * Default seed zones. These are just placeholders — operators should
 * override via admin UI (or by editing this array and redeploying).
 * The DeliveryService's existing zone config could be loaded into
 * this array by a future integration PR.
 */
const DEFAULT_ZONES: ManualZone[] = [
  {
    name: 'Bangladesh domestic',
    countryCode: 'BD',
    baseAmount: 6000, // 60 BDT in paisa
    perKgAmount: 2000, // 20 BDT/kg
    currency: 'BDT',
    estimatedDays: 2,
    carrier: 'Manual',
    service: 'Standard',
  },
  {
    name: 'USA domestic',
    countryCode: 'US',
    baseAmount: 800, // $8.00 in cents
    perKgAmount: 200,
    currency: 'USD',
    estimatedDays: 5,
    carrier: 'Manual',
    service: 'Standard',
  },
  {
    name: 'International',
    countryCode: '*',
    baseAmount: 3000,
    perKgAmount: 500,
    currency: 'USD',
    estimatedDays: 14,
    carrier: 'Manual',
    service: 'International',
  },
];

export class ManualZonesProvider implements ShippingProvider {
  readonly name = 'manual-zones' as const;
  private readonly logger = new Logger('ManualZonesProvider');

  private readonly zones: ManualZone[];

  constructor(config: ConfigService) {
    // Zones can be overridden via MANUAL_SHIPPING_ZONES env var as a
    // JSON array. For now, just use defaults — the admin UI loader
    // is future work.
    const zonesJson = config.get<string>('MANUAL_SHIPPING_ZONES');
    if (zonesJson) {
      try {
        this.zones = JSON.parse(zonesJson);
        this.logger.log(
          `Manual zones loaded from env (${this.zones.length} zones)`,
        );
      } catch (e: any) {
        this.logger.warn(
          `Failed to parse MANUAL_SHIPPING_ZONES JSON (${e.message}) — using defaults`,
        );
        this.zones = DEFAULT_ZONES;
      }
    } else {
      this.zones = DEFAULT_ZONES;
      this.logger.log(
        `Manual zones provider: using ${this.zones.length} default zones. Customize via MANUAL_SHIPPING_ZONES env var or admin UI.`,
      );
    }
  }

  isAvailable(): boolean {
    return true;
  }

  /**
   * Find the best-matching zone for a destination address. Priority:
   *   1. country + postal prefix
   *   2. country + state
   *   3. country only
   *   4. wildcard (countryCode === '*')
   */
  private matchZone(
    country: string,
    state: string | undefined,
    postalCode: string,
  ): ManualZone | null {
    const upperCountry = country.toUpperCase();
    const upperState = state?.toUpperCase();

    // 1. exact country + postal prefix
    const postalMatch = this.zones.find(
      (z) =>
        z.countryCode === upperCountry &&
        z.postalPrefixes?.some((prefix) => postalCode.startsWith(prefix)),
    );
    if (postalMatch) return postalMatch;

    // 2. exact country + state
    const stateMatch = this.zones.find(
      (z) =>
        z.countryCode === upperCountry &&
        upperState &&
        z.states?.includes(upperState),
    );
    if (stateMatch) return stateMatch;

    // 3. country only (no postal/state restrictions)
    const countryMatch = this.zones.find(
      (z) =>
        z.countryCode === upperCountry &&
        !z.postalPrefixes?.length &&
        !z.states?.length,
    );
    if (countryMatch) return countryMatch;

    // 4. wildcard
    return this.zones.find((z) => z.countryCode === '*') ?? null;
  }

  async getRates(input: GetRatesInput): Promise<ShippingRate[]> {
    const zone = this.matchZone(
      input.toAddress.country,
      input.toAddress.state,
      input.toAddress.postalCode,
    );
    if (!zone) {
      return [];
    }

    const weightKg = input.parcel.weightGrams / 1000;
    const perKgCost = (zone.perKgAmount ?? 0) * weightKg;
    const amount = Math.round(zone.baseAmount + perKgCost);

    return [
      {
        rateId: `manual-${zone.name.replace(/\s+/g, '-').toLowerCase()}`,
        carrier: zone.carrier ?? 'Manual',
        service: zone.service ?? 'Standard',
        amount,
        currency: zone.currency,
        estimatedDays: zone.estimatedDays,
        provider: 'manual-zones',
      },
    ];
  }

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    // Manual zones don't generate real labels. We return a
    // placeholder shipment so the order flow can continue; the app's
    // own delivery module handles the operational side (driver
    // assignment, parcel collection, etc).
    const rates = await this.getRates({
      fromAddress: input.fromAddress,
      toAddress: input.toAddress,
      parcel: input.parcel,
    });
    const rate = rates[0];
    if (!rate) {
      throw new Error(
        `No manual zone matches destination ${input.toAddress.country} — add a wildcard zone to MANUAL_SHIPPING_ZONES or switch to a real carrier provider.`,
      );
    }
    const trackingNumber = `MANUAL-${Date.now()}-${input.orderReference}`;
    return {
      shipmentId: trackingNumber,
      trackingNumber,
      amount: rate.amount,
      currency: rate.currency,
      provider: 'manual-zones',
      carrier: rate.carrier,
      service: rate.service,
    };
  }

  async trackShipment(_trackingNumber: string): Promise<TrackingUpdate | null> {
    // Manual shipments have no carrier-side tracking — the app's
    // own delivery module owns the status transitions.
    throw new ShippingProviderNotSupportedError(
      'manual-zones',
      'trackShipment (manual shipments are tracked via the internal DeliveryService, not via a carrier API)',
    );
  }

  async cancelShipment(_shipmentId: string): Promise<void> {
    // No-op — there's nothing to cancel on the carrier side. The
    // order module handles cancellation internally.
  }
}

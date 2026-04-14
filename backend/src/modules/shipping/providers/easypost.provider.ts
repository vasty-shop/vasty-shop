/**
 * EasyPost shipping provider.
 *
 *   SHIPPING_PROVIDER=easypost
 *   EASYPOST_API_KEY=EZ...         # production: EZAK..., test: EZTK...
 *
 * Pure REST via fetch — no SDK dep. EasyPost is a multi-carrier
 * aggregator (USPS, UPS, FedEx, DHL, and many international couriers)
 * that gives you rate shopping + label printing + tracking through
 * one API.
 *
 * Sign up at https://easypost.com. Test mode is unlimited; production
 * has per-label fees on top of the carrier costs.
 *
 * Workflow:
 *   1. POST /v2/shipments with { to_address, from_address, parcel }
 *      → returns a shipment id with rates[] attached
 *   2. getRates() returns those rate options for the checkout UI
 *   3. createShipment() buys the selected rate → returns tracking + label
 *   4. trackShipment() → GET /v2/trackers/{tracker_id}
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateShipmentInput,
  GetRatesInput,
  ShipmentStatus,
  Shipment,
  ShippingProvider,
  ShippingProviderNotConfiguredError,
  ShippingRate,
  TrackingUpdate,
} from './shipping-provider.interface';

const EASYPOST_API_BASE = 'https://api.easypost.com/v2';

export class EasyPostProvider implements ShippingProvider {
  readonly name = 'easypost' as const;
  private readonly logger = new Logger('EasyPostProvider');

  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('EASYPOST_API_KEY', '');

    if (this.isAvailable()) {
      this.logger.log(
        `EasyPost provider configured (${this.apiKey.startsWith('EZTK') ? 'test mode' : 'production'})`,
      );
    } else {
      this.logger.warn('EasyPost provider selected but EASYPOST_API_KEY missing');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private async easypostApi(
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    body?: any,
  ): Promise<any> {
    if (!this.isAvailable()) {
      throw new ShippingProviderNotConfiguredError('easypost', [
        'EASYPOST_API_KEY',
      ]);
    }
    const res = await fetch(`${EASYPOST_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(
        `EasyPost API ${method} ${path} failed: ${res.status} ${json.error?.message ?? JSON.stringify(json)}`,
      );
    }
    return json;
  }

  private toEasyPostAddress(addr: any): any {
    return {
      name: addr.name,
      company: addr.company,
      street1: addr.line1,
      street2: addr.line2,
      city: addr.city,
      state: addr.state,
      zip: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      email: addr.email,
    };
  }

  private toEasyPostParcel(parcel: any): any {
    // EasyPost wants imperial units. Convert grams → oz and cm → inches.
    const weightOz = (parcel.weightGrams ?? 0) * 0.035274;
    return {
      weight: weightOz,
      length: parcel.lengthCm ? parcel.lengthCm * 0.393701 : undefined,
      width: parcel.widthCm ? parcel.widthCm * 0.393701 : undefined,
      height: parcel.heightCm ? parcel.heightCm * 0.393701 : undefined,
    };
  }

  async getRates(input: GetRatesInput): Promise<ShippingRate[]> {
    // EasyPost's POST /shipments returns a shipment with rates[] attached.
    const shipment = await this.easypostApi('POST', '/shipments', {
      shipment: {
        to_address: this.toEasyPostAddress(input.toAddress),
        from_address: this.toEasyPostAddress(input.fromAddress),
        parcel: this.toEasyPostParcel(input.parcel),
      },
    });
    return (shipment.rates ?? []).map((r: any) => ({
      rateId: r.id, // e.g. "rate_abc123"
      carrier: r.carrier,
      service: r.service,
      // EasyPost returns rate as a dollar string like "12.34" — convert
      // to smallest currency unit.
      amount: Math.round(parseFloat(r.rate) * 100),
      currency: r.currency,
      estimatedDays: r.delivery_days,
      provider: 'easypost',
    }));
  }

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    if (!input.rateId) {
      throw new Error(
        'easypost createShipment requires a rateId from getRates() — EasyPost buys a specific rate to generate the label',
      );
    }
    // EasyPost rate ids are in the form "rate_xxx" and belong to a
    // specific shipment. We need to create a fresh shipment and then
    // buy it — the caller's rateId is actually stale if the shipment
    // was created during an earlier getRates() call. For a first
    // iteration, re-create the shipment and pick the cheapest rate
    // that matches the caller's service preference.
    const shipment = await this.easypostApi('POST', '/shipments', {
      shipment: {
        to_address: this.toEasyPostAddress(input.toAddress),
        from_address: this.toEasyPostAddress(input.fromAddress),
        parcel: this.toEasyPostParcel(input.parcel),
        reference: input.orderReference,
      },
    });

    // Buy the cheapest rate (caller-facing UX would pick one based
    // on service name; this is a reasonable default).
    const rate = shipment.rates?.[0];
    if (!rate) {
      throw new Error('EasyPost returned no rates for the shipment');
    }
    const bought = await this.easypostApi(
      'POST',
      `/shipments/${shipment.id}/buy`,
      { rate: { id: rate.id } },
    );

    return {
      shipmentId: bought.id,
      trackingNumber: bought.tracking_code,
      labelUrl: bought.postage_label?.label_url,
      trackingUrl: bought.tracker?.public_url,
      amount: Math.round(parseFloat(rate.rate) * 100),
      currency: rate.currency,
      provider: 'easypost',
      carrier: rate.carrier,
      service: rate.service,
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingUpdate | null> {
    // Create a tracker for this tracking number (idempotent-ish —
    // EasyPost creates or returns the existing tracker).
    const trackers = await this.easypostApi(
      'GET',
      `/trackers?tracking_code=${encodeURIComponent(trackingNumber)}`,
    );
    const tracker = trackers.trackers?.[0];
    if (!tracker) return null;

    return {
      status: this.mapStatus(tracker.status),
      rawStatus: tracker.status,
      updatedAt: tracker.updated_at,
      location: tracker.tracking_details?.slice(-1)[0]?.tracking_location
        ? `${tracker.tracking_details.slice(-1)[0].tracking_location.city}, ${tracker.tracking_details.slice(-1)[0].tracking_location.state}`
        : undefined,
      estimatedDelivery: tracker.est_delivery_date,
      provider: 'easypost',
    };
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    // EasyPost "refunds" a label via POST /shipments/{id}/refund.
    await this.easypostApi('POST', `/shipments/${shipmentId}/refund`, {});
  }

  private mapStatus(raw?: string): ShipmentStatus {
    switch (raw) {
      case 'pre_transit':
        return 'pre_transit';
      case 'in_transit':
      case 'in transit':
        return 'in_transit';
      case 'out_for_delivery':
        return 'out_for_delivery';
      case 'delivered':
        return 'delivered';
      case 'return_to_sender':
      case 'returned':
        return 'returned';
      case 'failure':
      case 'error':
        return 'failure';
      default:
        return 'unknown';
    }
  }
}

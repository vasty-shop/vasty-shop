/**
 * ShipEngine shipping provider.
 *
 *   SHIPPING_PROVIDER=shipengine
 *   SHIPENGINE_API_KEY=TEST_...   or PROD_...
 *
 * Pure REST via fetch. ShipEngine is a multi-carrier aggregator
 * focused on US shipping with good international support. Generous
 * free tier via the sandbox (unlimited test labels); production has
 * per-label fees.
 *
 * Workflow is similar to EasyPost but ShipEngine separates rate
 * calculation from shipment creation more cleanly.
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

const SHIPENGINE_API_BASE = 'https://api.shipengine.com/v1';

export class ShipEngineProvider implements ShippingProvider {
  readonly name = 'shipengine' as const;
  private readonly logger = new Logger('ShipEngineProvider');

  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('SHIPENGINE_API_KEY', '');

    if (this.isAvailable()) {
      this.logger.log(
        `ShipEngine provider configured (${this.apiKey.startsWith('TEST_') ? 'sandbox' : 'production'})`,
      );
    } else {
      this.logger.warn(
        'ShipEngine provider selected but SHIPENGINE_API_KEY missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private async shipEngineApi(
    method: 'GET' | 'POST',
    path: string,
    body?: any,
  ): Promise<any> {
    if (!this.isAvailable()) {
      throw new ShippingProviderNotConfiguredError('shipengine', [
        'SHIPENGINE_API_KEY',
      ]);
    }
    const res = await fetch(`${SHIPENGINE_API_BASE}${path}`, {
      method,
      headers: {
        'API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(
        `ShipEngine API ${method} ${path} failed: ${res.status} ${JSON.stringify(json.errors ?? json)}`,
      );
    }
    return json;
  }

  private toShipEngineAddress(addr: any): any {
    return {
      name: addr.name,
      company_name: addr.company,
      address_line1: addr.line1,
      address_line2: addr.line2,
      city_locality: addr.city,
      state_province: addr.state,
      postal_code: addr.postalCode,
      country_code: addr.country,
      phone: addr.phone,
    };
  }

  async getRates(input: GetRatesInput): Promise<ShippingRate[]> {
    const weightOz = (input.parcel.weightGrams ?? 0) * 0.035274;

    const response = await this.shipEngineApi('POST', '/rates', {
      rate_options: {
        // Rate all carriers the account has enabled.
        carrier_ids: [],
      },
      shipment: {
        ship_to: this.toShipEngineAddress(input.toAddress),
        ship_from: this.toShipEngineAddress(input.fromAddress),
        packages: [
          {
            weight: { value: weightOz, unit: 'ounce' },
            dimensions: input.parcel.lengthCm
              ? {
                  length: input.parcel.lengthCm * 0.393701,
                  width: (input.parcel.widthCm ?? 0) * 0.393701,
                  height: (input.parcel.heightCm ?? 0) * 0.393701,
                  unit: 'inch',
                }
              : undefined,
          },
        ],
      },
    });

    return (response.rate_response?.rates ?? []).map((r: any) => ({
      rateId: r.rate_id,
      carrier: r.carrier_friendly_name ?? r.carrier_code,
      service: r.service_type ?? r.service_code,
      amount: Math.round((r.shipping_amount?.amount ?? 0) * 100),
      currency: r.shipping_amount?.currency?.toUpperCase() ?? 'USD',
      estimatedDays: r.delivery_days,
      provider: 'shipengine',
    }));
  }

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    if (!input.rateId) {
      throw new Error(
        'shipengine createShipment requires a rateId from getRates()',
      );
    }
    // ShipEngine buys a label directly from a rate id via
    // POST /labels/rates/{rate_id}.
    const label = await this.shipEngineApi(
      'POST',
      `/labels/rates/${encodeURIComponent(input.rateId)}`,
      { label_format: 'pdf', label_download_type: 'url' },
    );

    return {
      shipmentId: label.label_id,
      trackingNumber: label.tracking_number,
      labelUrl: label.label_download?.pdf ?? label.label_download?.href,
      trackingUrl: label.trackable
        ? `https://www.shipengine.com/track/${label.tracking_number}`
        : undefined,
      amount: Math.round((label.shipment_cost?.amount ?? 0) * 100),
      currency: label.shipment_cost?.currency?.toUpperCase() ?? 'USD',
      provider: 'shipengine',
      carrier: label.carrier_code ?? 'unknown',
      service: label.service_code ?? 'unknown',
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingUpdate | null> {
    // ShipEngine's tracking endpoint also needs the carrier code,
    // which we don't have in hand. Use the tracking number lookup
    // which auto-detects:
    const res = await this.shipEngineApi(
      'GET',
      `/tracking?tracking_number=${encodeURIComponent(trackingNumber)}`,
    );
    if (!res.status_code) return null;

    return {
      status: this.mapStatus(res.status_code),
      rawStatus: res.status_description,
      updatedAt: res.actual_delivery_date ?? res.ship_date ?? new Date().toISOString(),
      estimatedDelivery: res.estimated_delivery_date,
      provider: 'shipengine',
    };
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    await this.shipEngineApi('POST', `/labels/${shipmentId}/void`);
  }

  private mapStatus(raw?: string): ShipmentStatus {
    // ShipEngine uses two-letter codes like "AC" (accepted), "IT"
    // (in transit), "DE" (delivered), "EX" (exception).
    switch (raw) {
      case 'AC':
        return 'pre_transit';
      case 'IT':
        return 'in_transit';
      case 'DE':
        return 'delivered';
      case 'EX':
      case 'UN':
        return 'failure';
      case 'NY':
        return 'pre_transit';
      default:
        return 'unknown';
    }
  }
}

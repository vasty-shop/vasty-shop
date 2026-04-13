/**
 * Shippo shipping provider.
 *
 *   SHIPPING_PROVIDER=shippo
 *   SHIPPO_API_KEY=shippo_test_...   or shippo_live_...
 *
 * Pure REST via fetch. Shippo is a multi-carrier aggregator popular
 * with small merchants. The API has quirky pagination and uses
 * "Authorization: ShippoToken <token>" instead of standard Bearer.
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

const SHIPPO_API_BASE = 'https://api.goshippo.com';

export class ShippoProvider implements ShippingProvider {
  readonly name = 'shippo' as const;
  private readonly logger = new Logger('ShippoProvider');

  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('SHIPPO_API_KEY', '');

    if (this.isAvailable()) {
      this.logger.log(
        `Shippo provider configured (${this.apiKey.startsWith('shippo_test') ? 'test' : 'live'})`,
      );
    } else {
      this.logger.warn('Shippo provider selected but SHIPPO_API_KEY missing');
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  private async shippoApi(
    method: 'GET' | 'POST',
    path: string,
    body?: any,
  ): Promise<any> {
    if (!this.isAvailable()) {
      throw new ShippingProviderNotConfiguredError('shippo', [
        'SHIPPO_API_KEY',
      ]);
    }
    const res = await fetch(`${SHIPPO_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `ShippoToken ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as any;
    if (!res.ok) {
      throw new Error(
        `Shippo API ${method} ${path} failed: ${res.status} ${JSON.stringify(json)}`,
      );
    }
    return json;
  }

  private toShippoAddress(addr: any): any {
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

  async getRates(input: GetRatesInput): Promise<ShippingRate[]> {
    // Shippo's POST /shipments returns a shipment object with rates
    // attached after it's processed async. We use async_rates: false
    // to get them inline.
    const shipment = await this.shippoApi('POST', '/shipments/', {
      address_to: this.toShippoAddress(input.toAddress),
      address_from: this.toShippoAddress(input.fromAddress),
      parcels: [
        {
          weight: input.parcel.weightGrams,
          mass_unit: 'g',
          length: input.parcel.lengthCm ?? 10,
          width: input.parcel.widthCm ?? 10,
          height: input.parcel.heightCm ?? 10,
          distance_unit: 'cm',
        },
      ],
      async: false,
    });

    return (shipment.rates ?? []).map((r: any) => ({
      rateId: r.object_id,
      carrier: r.provider,
      service: r.servicelevel?.name ?? r.servicelevel?.token ?? 'standard',
      amount: Math.round(parseFloat(r.amount) * 100),
      currency: r.currency,
      estimatedDays: r.estimated_days,
      provider: 'shippo',
    }));
  }

  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    if (!input.rateId) {
      throw new Error('shippo createShipment requires a rateId from getRates()');
    }
    const transaction = await this.shippoApi('POST', '/transactions/', {
      rate: input.rateId,
      label_file_type: 'PDF',
      async: false,
      metadata: input.orderReference,
    });

    if (transaction.status !== 'SUCCESS') {
      throw new Error(
        `Shippo label purchase failed: ${transaction.messages?.map((m: any) => m.text).join('; ') ?? 'unknown'}`,
      );
    }

    return {
      shipmentId: transaction.object_id,
      trackingNumber: transaction.tracking_number,
      labelUrl: transaction.label_url,
      trackingUrl: transaction.tracking_url_provider,
      amount: 0, // Shippo doesn't echo the rate amount in the transaction
      currency: 'USD',
      provider: 'shippo',
      carrier: transaction.rate?.provider ?? 'unknown',
      service: transaction.rate?.servicelevel?.name ?? 'unknown',
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingUpdate | null> {
    // Shippo requires a carrier code — we don't have one here. Use
    // the "/tracks/{carrier}/{tracking}" lookup isn't feasible
    // without the carrier. Shippo also has a unified carrier=shippo
    // lookup via /v1/tracks/usps/{tracking} style paths. For the
    // first iteration, throw NotSupported — callers should track
    // via the provider-specific `trackingUrl` returned by
    // createShipment() instead.
    throw new Error(
      `Shippo trackShipment(${trackingNumber}) needs a carrier code — use the trackingUrl returned by createShipment() for now, or fetch the tracking data via a custom webhook integration.`,
    );
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    // Shippo supports label refunds via POST /refunds.
    await this.shippoApi('POST', '/refunds/', { transaction: shipmentId });
  }
}

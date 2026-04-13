/**
 * Common interface that every shipping / logistics provider implements.
 *
 * Pick a provider by setting SHIPPING_PROVIDER in your .env to one of:
 *
 *   manual-zones  - Zone-based flat rates configured in the admin UI
 *                   (the existing DeliveryService). Zero infra, zero
 *                   external API calls. The default and safe starting
 *                   point for any deployment.
 *
 *   shipengine    - ShipEngine (https://shipengine.com). Multi-carrier
 *                   US + global rate shopping via one API.
 *
 *   easypost      - EasyPost (https://easypost.com). Same idea —
 *                   multi-carrier aggregator.
 *
 *   shippo        - Shippo (https://goshippo.com). Another multi-
 *                   carrier aggregator, popular with small merchants.
 *
 *   pathao        - Pathao Courier (https://merchant.pathao.com).
 *                   Bangladesh-specific last-mile delivery.
 *
 *   none          - Shipping features disabled. Every method throws.
 *                   The default if SHIPPING_PROVIDER is unset.
 *
 * Planned follow-ups (tracked in issue #16):
 *   steadfast     — Steadfast Courier (Bangladesh)
 *   redx          — RedX (Bangladesh)
 *   delhivery     — Delhivery (India)
 *   shiprocket    — Shiprocket aggregator (India)
 *   sendcloud     — Sendcloud (EU)
 *
 * Adding a new provider: implement this interface, register it in
 * providers/index.ts, document the env vars in docs/providers/shipping.md.
 */

export interface ShippingAddress {
  name?: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2
  phone?: string;
  email?: string;
}

export interface ParcelDimensions {
  /** Weight in grams. */
  weightGrams: number;
  /** Length in cm. */
  lengthCm?: number;
  /** Width in cm. */
  widthCm?: number;
  /** Height in cm. */
  heightCm?: number;
  /** Declared value of the parcel's contents in the order currency. */
  declaredValue?: number;
  /** Currency code the declared value is in (ISO 4217). */
  currency?: string;
}

export interface GetRatesInput {
  fromAddress: ShippingAddress;
  toAddress: ShippingAddress;
  parcel: ParcelDimensions;
}

export interface ShippingRate {
  /** Provider-specific rate id — pass this back to createShipment. */
  rateId: string;
  /** The carrier (e.g. "USPS", "DHL", "Pathao"). */
  carrier: string;
  /** Service level (e.g. "Priority Mail", "Same Day", "Standard"). */
  service: string;
  /** Amount in the smallest currency unit (cents for USD, paisa for BDT). */
  amount: number;
  /** Currency code (ISO 4217). */
  currency: string;
  /** Estimated delivery days. */
  estimatedDays?: number;
  /** Provider name that produced the quote. */
  provider: string;
}

export interface CreateShipmentInput {
  /** The rateId returned by getRates() — selects which service to use. */
  rateId?: string;
  /** Explicit service override if no rate id is available. */
  service?: string;
  fromAddress: ShippingAddress;
  toAddress: ShippingAddress;
  parcel: ParcelDimensions;
  /** Reference to your order id — stored on the provider side for
   * reconciliation. */
  orderReference: string;
}

export interface Shipment {
  /** Provider-specific shipment id. */
  shipmentId: string;
  /** Carrier tracking number the customer sees. */
  trackingNumber: string;
  /** URL to the printable shipping label (PDF/PNG). */
  labelUrl?: string;
  /** Direct tracking URL for the customer. */
  trackingUrl?: string;
  /** Amount charged in the smallest currency unit. */
  amount: number;
  /** Currency code. */
  currency: string;
  /** Provider name. */
  provider: string;
  /** Carrier (e.g. "USPS", "Pathao"). */
  carrier: string;
  /** Service used. */
  service: string;
}

export type ShipmentStatus =
  | 'pre_transit' // Label created, not yet picked up
  | 'in_transit' // Carrier has the parcel
  | 'out_for_delivery' // Last-mile driver has it
  | 'delivered' // Signed for / dropped off
  | 'returned' // Returned to sender
  | 'failure' // Undeliverable
  | 'unknown';

export interface TrackingUpdate {
  /** Current status bucket. */
  status: ShipmentStatus;
  /** Raw carrier status text (for display / audit). */
  rawStatus?: string;
  /** Most recent movement timestamp. */
  updatedAt: string;
  /** Human-readable location ("San Francisco, CA"). */
  location?: string;
  /** Estimated delivery date from the carrier. */
  estimatedDelivery?: string;
  /** Provider that tracked the shipment. */
  provider: string;
}

/**
 * Common interface implemented by every shipping provider. Methods a
 * provider can't support should throw ShippingProviderNotSupportedError —
 * never silently no-op.
 */
export interface ShippingProvider {
  /** Stable provider name for logging / clients. */
  readonly name:
    | 'manual-zones'
    | 'shipengine'
    | 'easypost'
    | 'shippo'
    | 'pathao'
    | 'none';

  /** True if the provider has the credentials it needs. */
  isAvailable(): boolean;

  /**
   * Get rate quotes for a parcel. Returns one or more options the
   * customer can pick from at checkout.
   */
  getRates(input: GetRatesInput): Promise<ShippingRate[]>;

  /**
   * Create a shipment and generate a shipping label. Called after the
   * customer has picked a rate and placed the order.
   */
  createShipment(input: CreateShipmentInput): Promise<Shipment>;

  /**
   * Look up the current status of a shipment by tracking number.
   */
  trackShipment(trackingNumber: string): Promise<TrackingUpdate | null>;

  /**
   * Cancel a shipment (void the label). Providers that don't support
   * this throw ShippingProviderNotSupportedError.
   */
  cancelShipment(shipmentId: string): Promise<void>;
}

/**
 * Thrown when a provider is asked to do something it doesn't support.
 */
export class ShippingProviderNotSupportedError extends Error {
  constructor(provider: string, operation: string) {
    super(
      `Operation "${operation}" is not supported by the "${provider}" shipping provider. See docs/providers/shipping.md.`,
    );
    this.name = 'ShippingProviderNotSupportedError';
  }
}

/**
 * Thrown when a provider is selected but its credentials are missing.
 */
export class ShippingProviderNotConfiguredError extends Error {
  constructor(provider: string, missingVars: string[]) {
    super(
      `Shipping provider "${provider}" is selected but the following env vars are missing: ${missingVars.join(', ')}. See docs/providers/shipping.md.`,
    );
    this.name = 'ShippingProviderNotConfiguredError';
  }
}

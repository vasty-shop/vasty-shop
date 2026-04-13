/**
 * Shipping provider factory.
 *
 * Reads SHIPPING_PROVIDER from config and returns the matching provider.
 *
 * Shipped in this PR:
 *   manual-zones  — DEFAULT. Zone-based flat rates, no external API
 *   shipengine    — Multi-carrier aggregator (US + global)
 *   easypost      — Multi-carrier aggregator
 *   shippo        — Multi-carrier aggregator
 *   pathao        — Bangladesh last-mile delivery
 *   none          — Shipping disabled
 *
 * Planned follow-ups (tracked in issue #16):
 *   steadfast, redx (Bangladesh)
 *   delhivery, shiprocket (India)
 *   sendcloud (EU)
 *
 * Selecting a planned value logs a warning and falls back to
 * manual-zones (NOT none) because checkout can still show a quote
 * with manual zones while the operator configures a real carrier.
 */
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ShippingProvider } from './shipping-provider.interface';
import { ManualZonesProvider } from './manual-zones.provider';
import { ShipEngineProvider } from './shipengine.provider';
import { EasyPostProvider } from './easypost.provider';
import { ShippoProvider } from './shippo.provider';
import { PathaoProvider } from './pathao.provider';
import { NoneShippingProvider } from './none.provider';

const log = new Logger('ShippingProviderFactory');

export function createShippingProvider(
  config: ConfigService,
): ShippingProvider {
  const choice = (config.get<string>('SHIPPING_PROVIDER') || 'manual-zones')
    .toLowerCase()
    .trim();

  switch (choice) {
    case 'manual-zones':
    case 'manual':
    case 'zones': {
      const p = new ManualZonesProvider(config);
      log.log(
        `Selected shipping provider: manual-zones (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'shipengine': {
      const p = new ShipEngineProvider(config);
      log.log(
        `Selected shipping provider: shipengine (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'easypost': {
      const p = new EasyPostProvider(config);
      log.log(
        `Selected shipping provider: easypost (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'shippo': {
      const p = new ShippoProvider(config);
      log.log(
        `Selected shipping provider: shippo (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'pathao': {
      const p = new PathaoProvider(config);
      log.log(
        `Selected shipping provider: pathao (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'steadfast':
    case 'redx':
    case 'delhivery':
    case 'shiprocket':
    case 'sendcloud': {
      log.warn(
        `SHIPPING_PROVIDER="${choice}" is planned but not yet implemented (see issue #16). Falling back to "manual-zones". Implemented providers: manual-zones, shipengine, easypost, shippo, pathao.`,
      );
      return new ManualZonesProvider(config);
    }
    case 'none':
      return new NoneShippingProvider();
    default:
      log.warn(
        `Unknown SHIPPING_PROVIDER="${choice}". Falling back to "manual-zones". Valid values: manual-zones, shipengine, easypost, shippo, pathao, none.`,
      );
      return new ManualZonesProvider(config);
  }
}

export * from './shipping-provider.interface';
export { ManualZonesProvider } from './manual-zones.provider';
export { ShipEngineProvider } from './shipengine.provider';
export { EasyPostProvider } from './easypost.provider';
export { ShippoProvider } from './shippo.provider';
export { PathaoProvider } from './pathao.provider';
export { NoneShippingProvider } from './none.provider';

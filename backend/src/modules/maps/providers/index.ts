/**
 * Maps provider factory.
 *
 * Reads MAPS_PROVIDER from config and returns the matching provider.
 * Unknown values fall back to 'none' with a warning.
 */
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MapsProvider } from './maps-provider.interface';
import { OsmLeafletProvider } from './osm-leaflet.provider';
import { GoogleMapsProvider } from './google-maps.provider';
import { MapboxProvider } from './mapbox.provider';
import { MaptilerProvider } from './maptiler.provider';
import { NoneMapsProvider } from './none.provider';

const log = new Logger('MapsProviderFactory');

export function createMapsProvider(config: ConfigService): MapsProvider {
  const choice = (config.get<string>('MAPS_PROVIDER') || 'none')
    .toLowerCase()
    .trim();

  switch (choice) {
    case 'osm-leaflet':
    case 'osm':
    case 'openstreetmap':
    case 'leaflet': {
      const p = new OsmLeafletProvider(config);
      log.log(
        `Selected maps provider: osm-leaflet (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'google-maps':
    case 'google':
    case 'gmaps': {
      const p = new GoogleMapsProvider(config);
      log.log(
        `Selected maps provider: google-maps (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'mapbox': {
      const p = new MapboxProvider(config);
      log.log(`Selected maps provider: mapbox (available=${p.isAvailable()})`);
      return p;
    }
    case 'maptiler': {
      const p = new MaptilerProvider(config);
      log.log(
        `Selected maps provider: maptiler (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'none':
    case '':
      return new NoneMapsProvider();
    default:
      log.warn(
        `Unknown MAPS_PROVIDER="${choice}". Falling back to "none". Valid values: osm-leaflet, google-maps, mapbox, maptiler, none.`,
      );
      return new NoneMapsProvider();
  }
}

export * from './maps-provider.interface';
export { OsmLeafletProvider } from './osm-leaflet.provider';
export { GoogleMapsProvider } from './google-maps.provider';
export { MapboxProvider } from './mapbox.provider';
export { MaptilerProvider } from './maptiler.provider';
export { NoneMapsProvider } from './none.provider';

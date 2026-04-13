/**
 * Smoke test for the multi-provider maps factory.
 *
 * Mocks `fetch` so no real calls hit Nominatim / Google / Mapbox /
 * MapTiler. Verifies factory instantiation, URL shape, auth handling,
 * response translation, and the pointInPolygon helper.
 *
 * Run with: npx ts-node scripts/smoke-test-maps-providers.ts
 */
import { ConfigService } from '@nestjs/config';
import {
  createMapsProvider,
  MapsProviderNotConfiguredError,
  pointInPolygon,
} from '../src/modules/maps/providers';

function fakeConfig(env: Record<string, string>): ConfigService {
  return {
    get: <T>(key: string, def?: T) => (env[key] as any) ?? def,
  } as unknown as ConfigService;
}

type FetchCall = {
  url: string;
  method: string;
  headers: Record<string, string>;
};
const fetchCalls: FetchCall[] = [];
const realFetch = global.fetch;
function installMockFetch(status = 200, body: any = {}) {
  global.fetch = (async (url: any, init: any = {}) => {
    const headers: Record<string, string> = {};
    if (init.headers) {
      for (const [k, v] of Object.entries(init.headers)) {
        headers[k] = String(v);
      }
    }
    fetchCalls.push({
      url: String(url),
      method: init.method ?? 'GET',
      headers,
    });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as any;
}
function restoreFetch() {
  global.fetch = realFetch;
}

async function expectThrow(
  label: string,
  fn: () => Promise<unknown>,
  matcher: (e: Error) => boolean,
): Promise<boolean> {
  try {
    await fn();
    console.log(`  ❌ ${label}: expected throw, got success`);
    return false;
  } catch (e) {
    if (matcher(e as Error)) {
      console.log(`  ✅ ${label}: threw as expected`);
      return true;
    }
    console.log(`  ❌ ${label}: wrong error: ${(e as Error).message}`);
    return false;
  }
}

async function main(): Promise<void> {
  let pass = 0;
  let fail = 0;
  const ok = (b: boolean) => (b ? pass++ : fail++);
  console.log('=== Maps provider factory smoke test ===\n');

  // 1. none default
  console.log('1. no MAPS_PROVIDER → none');
  {
    const p = createMapsProvider(fakeConfig({}));
    ok(p.name === 'none');
    ok(p.isAvailable() === false);
    ok(
      await expectThrow(
        'geocode fails loudly',
        () => p.geocode({ address: 'anywhere' }),
        (e) => e instanceof MapsProviderNotConfiguredError,
      ),
    );
    const config = p.getFrontendConfig();
    ok(config.provider === 'none');
    ok((config.extra as any)?.disabled === true);
    console.log(`  ✅ frontend config returns { disabled: true }`);
  }

  // 2. osm-leaflet always available, default tile URL
  console.log('\n2. osm-leaflet defaults');
  {
    const p = createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'osm-leaflet' }));
    ok(p.name === 'osm-leaflet');
    ok(p.isAvailable() === true);
    const config = p.getFrontendConfig();
    ok(config.tileUrl?.includes('tile.openstreetmap.org') === true);
    ok(config.attribution.toLowerCase().includes('openstreetmap'));
    console.log(`  ✅ tileUrl + attribution correct`);
  }

  // 3. osm-leaflet geocode with mocked Nominatim
  console.log('\n3. osm-leaflet geocode (mocked Nominatim)');
  {
    installMockFetch(200, [
      {
        lat: '23.7808',
        lon: '90.4225',
        display_name: 'Gulshan, Dhaka, Bangladesh',
        importance: 0.7,
        address: {
          road: 'Gulshan Avenue',
          city: 'Dhaka',
          state: 'Dhaka Division',
          country: 'Bangladesh',
          country_code: 'bd',
          postcode: '1212',
        },
      },
    ]);
    try {
      const p = createMapsProvider(
        fakeConfig({
          MAPS_PROVIDER: 'osm-leaflet',
          NOMINATIM_USER_AGENT: 'test-app/1.0',
        }),
      );
      const result = await p.geocode({
        address: 'Gulshan Dhaka',
        countryCode: 'BD',
      });
      ok(result !== null);
      ok(result!.location.lat === 23.7808);
      ok(result!.location.lng === 90.4225);
      ok(result!.components?.city === 'Dhaka');
      ok(result!.components?.countryCode === 'BD');
      console.log(`  ✅ parsed Nominatim response correctly`);

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url.includes('nominatim.openstreetmap.org/search'));
      ok(call.url.includes('countrycodes=bd'));
      ok(call.headers['User-Agent'] === 'test-app/1.0');
      console.log(`  ✅ URL + countrycodes filter + User-Agent correct`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 4. osm-leaflet geocode with no results → null
  console.log('\n4. osm-leaflet geocode with no results');
  {
    installMockFetch(200, []);
    try {
      const p = createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'osm-leaflet' }));
      const result = await p.geocode({ address: 'nothing' });
      ok(result === null);
      console.log(`  ✅ null result on empty array`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 5. osm-leaflet reverse-geocode
  console.log('\n5. osm-leaflet reverseGeocode');
  {
    installMockFetch(200, {
      lat: '23.78',
      lon: '90.42',
      display_name: 'Dhaka, Bangladesh',
      address: { city: 'Dhaka', country: 'Bangladesh', country_code: 'bd' },
    });
    try {
      const p = createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'osm-leaflet' }));
      const result = await p.reverseGeocode({ lat: 23.78, lng: 90.42 });
      ok(result !== null);
      ok(result!.components?.countryCode === 'BD');
      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url.includes('/reverse?'));
      ok(call.url.includes('lat=23.78'));
      console.log(`  ✅ reverseGeocode returned ${result!.components?.city}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 6. google-maps without key → unavailable
  console.log('\n6. google-maps without key → unavailable');
  {
    const p = createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'google-maps' }));
    ok(p.name === 'google-maps');
    ok(p.isAvailable() === false);
    ok(
      await expectThrow(
        'geocode throws NotConfigured',
        () => p.geocode({ address: 'x' }),
        (e) => e instanceof MapsProviderNotConfiguredError,
      ),
    );
  }

  // 7. google-maps happy path
  console.log('\n7. google-maps geocode (mocked)');
  {
    installMockFetch(200, {
      status: 'OK',
      results: [
        {
          geometry: { location: { lat: 37.422, lng: -122.084 } },
          formatted_address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
          address_components: [
            { long_name: '1600', short_name: '1600', types: ['street_number'] },
            {
              long_name: 'Amphitheatre Parkway',
              short_name: 'Amphitheatre Pkwy',
              types: ['route'],
            },
            {
              long_name: 'Mountain View',
              short_name: 'Mountain View',
              types: ['locality', 'political'],
            },
            {
              long_name: 'California',
              short_name: 'CA',
              types: ['administrative_area_level_1', 'political'],
            },
            {
              long_name: 'United States',
              short_name: 'US',
              types: ['country', 'political'],
            },
            { long_name: '94043', short_name: '94043', types: ['postal_code'] },
          ],
        },
      ],
    });
    try {
      const p = createMapsProvider(
        fakeConfig({
          MAPS_PROVIDER: 'google-maps',
          GOOGLE_MAPS_API_KEY: 'AIzaFAKE',
        }),
      );
      ok(p.isAvailable() === true);
      const result = await p.geocode({ address: '1600 Amphitheatre' });
      ok(result !== null);
      ok(result!.location.lat === 37.422);
      ok(result!.components?.city === 'Mountain View');
      ok(result!.components?.countryCode === 'US');
      ok(result!.components?.street === '1600 Amphitheatre Parkway');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url.startsWith('https://maps.googleapis.com/maps/api/geocode/json'));
      ok(call.url.includes('key=AIzaFAKE'));
      console.log(`  ✅ google geocode translation + URL correct`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 8. google-maps frontend config exposes jsApiUrl with browser key
  console.log('\n8. google-maps frontend config');
  {
    const p = createMapsProvider(
      fakeConfig({
        MAPS_PROVIDER: 'google-maps',
        GOOGLE_MAPS_API_KEY: 'server-key',
        GOOGLE_MAPS_BROWSER_KEY: 'browser-key',
      }),
    );
    const config = p.getFrontendConfig();
    ok(config.publicKey === 'browser-key');
    ok((config.extra as any)?.jsApiUrl?.includes('key=browser-key'));
    console.log(`  ✅ frontend config uses browser key, not server key`);
  }

  // 9. mapbox
  console.log('\n9. mapbox geocode (mocked)');
  {
    installMockFetch(200, {
      features: [
        {
          center: [90.4125, 23.8103], // [lng, lat]
          place_name: 'Dhaka, Bangladesh',
          text: 'Dhaka',
          relevance: 0.95,
          context: [
            { id: 'place.1', text: 'Dhaka' },
            { id: 'region.1', text: 'Dhaka Division' },
            { id: 'country.1', text: 'Bangladesh', short_code: 'bd' },
          ],
        },
      ],
    });
    try {
      const p = createMapsProvider(
        fakeConfig({ MAPS_PROVIDER: 'mapbox', MAPBOX_TOKEN: 'pk.test' }),
      );
      ok(p.isAvailable() === true);
      const result = await p.geocode({ address: 'Dhaka' });
      ok(result !== null);
      // Mapbox gives [lng, lat] in GeoJSON order; provider should flip
      ok(result!.location.lat === 23.8103);
      ok(result!.location.lng === 90.4125);
      ok(result!.components?.countryCode === 'BD');
      console.log(`  ✅ mapbox [lng,lat]→{lat,lng} flip correct`);

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url.includes('access_token=pk.test'));
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 10. mapbox frontend config
  console.log('\n10. mapbox frontend config');
  {
    const p = createMapsProvider(
      fakeConfig({ MAPS_PROVIDER: 'mapbox', MAPBOX_TOKEN: 'pk.test' }),
    );
    const config = p.getFrontendConfig();
    ok(config.publicKey === 'pk.test');
    ok(config.tileUrl?.includes('access_token=pk.test'));
    console.log(`  ✅ tile URL includes access_token`);
  }

  // 11. maptiler
  console.log('\n11. maptiler geocode (mocked)');
  {
    installMockFetch(200, {
      features: [
        {
          center: [13.404, 52.52], // Berlin [lng,lat]
          place_name: 'Berlin, Germany',
          text: 'Berlin',
          context: [
            { id: 'place.x', text: 'Berlin' },
            { id: 'country.x', text: 'Germany' },
          ],
        },
      ],
    });
    try {
      const p = createMapsProvider(
        fakeConfig({
          MAPS_PROVIDER: 'maptiler',
          MAPTILER_API_KEY: 'mt-key',
        }),
      );
      const result = await p.geocode({ address: 'Berlin' });
      ok(result !== null);
      ok(result!.location.lat === 52.52);
      ok(result!.location.lng === 13.404);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 12. unknown value
  console.log('\n12. unknown MAPS_PROVIDER → none (fallback)');
  {
    const p = createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'foobar' }));
    ok(p.name === 'none');
    console.log(`  ✅ fallback to none`);
  }

  // 13. pointInPolygon helper
  console.log('\n13. pointInPolygon helper');
  {
    // A 10x10 square polygon around Dhaka (roughly)
    const polygon = [
      { lat: 23.7, lng: 90.3 },
      { lat: 23.7, lng: 90.5 },
      { lat: 23.9, lng: 90.5 },
      { lat: 23.9, lng: 90.3 },
    ];
    ok(pointInPolygon({ lat: 23.8, lng: 90.4 }, polygon) === true);
    ok(pointInPolygon({ lat: 20.0, lng: 90.4 }, polygon) === false);
    ok(pointInPolygon({ lat: 23.8, lng: 85.0 }, polygon) === false);
    // Degenerate polygon
    ok(pointInPolygon({ lat: 0, lng: 0 }, [{ lat: 0, lng: 0 }]) === false);
    console.log(`  ✅ inside/outside/degenerate cases pass`);
  }

  // 14. aliases
  console.log('\n14. aliases');
  {
    ok(createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'osm' })).name === 'osm-leaflet');
    ok(createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'google' })).name === 'google-maps');
    ok(createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'gmaps' })).name === 'google-maps');
    ok(createMapsProvider(fakeConfig({ MAPS_PROVIDER: 'leaflet' })).name === 'osm-leaflet');
    console.log(`  ✅ all aliases resolve correctly`);
  }

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});

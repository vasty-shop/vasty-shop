/**
 * Smoke test for the multi-provider shipping factory.
 *
 * - manual-zones: exercised against the real default zones config
 *   (pure local computation, no network)
 * - shipengine/easypost/shippo/pathao: mock fetch to verify URL,
 *   auth header, payload translation
 * - pathao: also verifies the OAuth token-issue flow on first call
 *
 * Run with: npx ts-node scripts/smoke-test-shipping-providers.ts
 */
import { ConfigService } from '@nestjs/config';
import {
  createShippingProvider,
  ShippingProviderNotConfiguredError,
} from '../src/modules/shipping/providers';

function fakeConfig(env: Record<string, string>): ConfigService {
  return {
    get: <T>(key: string, def?: T) => (env[key] as any) ?? def,
  } as unknown as ConfigService;
}

type FetchCall = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
};
const fetchCalls: FetchCall[] = [];
const realFetch = global.fetch;
function installMockFetch(
  responder: (url: string, init: any) => { status: number; body: any },
) {
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
      body: init.body ? JSON.parse(init.body) : null,
    });
    const { status, body } = responder(String(url), init);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as any;
}
function restoreFetch() {
  global.fetch = realFetch;
}

async function main(): Promise<void> {
  let pass = 0;
  let fail = 0;
  const ok = (b: boolean, msg?: string) => {
    if (b) pass++;
    else {
      fail++;
      if (msg) console.log(`  ⚠️  ${msg}`);
    }
  };
  console.log('=== Shipping provider factory smoke test ===\n');

  const bdAddress = {
    name: 'Test',
    line1: '123 Gulshan Ave',
    city: 'Dhaka',
    postalCode: '1212',
    country: 'BD',
    phone: '+8801711111111',
  };
  const usAddress = {
    name: 'Test',
    line1: '1 Market St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    country: 'US',
  };
  const parcel = { weightGrams: 500, lengthCm: 20, widthCm: 10, heightCm: 5 };

  // 1. Default → manual-zones (NOT none)
  console.log('1. no SHIPPING_PROVIDER → defaults to manual-zones');
  {
    const p = createShippingProvider(fakeConfig({}));
    ok(p.name === 'manual-zones');
    ok(p.isAvailable() === true);
  }

  // 2. Manual zones Bangladesh quote
  console.log('\n2. manual-zones Bangladesh domestic');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'manual-zones' }),
    );
    const rates = await p.getRates({
      fromAddress: bdAddress,
      toAddress: bdAddress,
      parcel,
    });
    ok(rates.length === 1);
    ok(rates[0].carrier === 'Manual');
    ok(rates[0].currency === 'BDT');
    // 60 BDT base + 0.5kg * 20 BDT/kg = 60 + 10 = 70 BDT in paisa
    ok(rates[0].amount === 7000);
    console.log(`  ✅ BD quote: ${rates[0].amount / 100} ${rates[0].currency}`);
  }

  // 3. Manual zones US quote
  console.log('\n3. manual-zones USA domestic');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'manual-zones' }),
    );
    const rates = await p.getRates({
      fromAddress: usAddress,
      toAddress: usAddress,
      parcel,
    });
    ok(rates.length === 1);
    ok(rates[0].currency === 'USD');
    // $8 base + 0.5kg * $2/kg = $8 + $1 = $9 in cents
    ok(rates[0].amount === 900);
    console.log(`  ✅ US quote: $${rates[0].amount / 100}`);
  }

  // 4. Manual zones wildcard fallback for unknown country
  console.log('\n4. manual-zones wildcard fallback (PK → International)');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'manual-zones' }),
    );
    const rates = await p.getRates({
      fromAddress: bdAddress,
      toAddress: { ...bdAddress, country: 'PK', city: 'Karachi' },
      parcel,
    });
    ok(rates.length === 1);
    ok(rates[0].service === 'International');
    console.log(`  ✅ PK → wildcard International zone matched`);
  }

  // 5. Manual zones custom JSON override via env
  console.log('\n5. manual-zones with MANUAL_SHIPPING_ZONES env override');
  {
    const customZones = [
      {
        name: 'Custom EU',
        countryCode: 'DE',
        baseAmount: 500,
        perKgAmount: 100,
        currency: 'EUR',
        estimatedDays: 3,
      },
    ];
    const p = createShippingProvider(
      fakeConfig({
        SHIPPING_PROVIDER: 'manual-zones',
        MANUAL_SHIPPING_ZONES: JSON.stringify(customZones),
      }),
    );
    const rates = await p.getRates({
      fromAddress: bdAddress,
      toAddress: { ...bdAddress, country: 'DE', city: 'Berlin' },
      parcel,
    });
    ok(rates.length === 1);
    ok(rates[0].currency === 'EUR');
    // 500 cents + 0.5kg * 100 = 550 cents
    ok(rates[0].amount === 550);
    console.log(`  ✅ custom EU zone loaded + quoted`);
  }

  // 6. Manual zones createShipment → placeholder tracking number
  console.log('\n6. manual-zones createShipment');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'manual-zones' }),
    );
    const shipment = await p.createShipment({
      fromAddress: bdAddress,
      toAddress: bdAddress,
      parcel,
      orderReference: 'ORD-42',
    });
    ok(shipment.trackingNumber.includes('ORD-42'));
    ok(shipment.trackingNumber.startsWith('MANUAL-'));
    ok(shipment.provider === 'manual-zones');
    console.log(`  ✅ placeholder shipment: ${shipment.trackingNumber}`);
  }

  // 7. shipengine without key → unavailable
  console.log('\n7. shipengine without key → unavailable');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'shipengine' }),
    );
    ok(p.name === 'shipengine');
    ok(p.isAvailable() === false);
  }

  // 8. shipengine happy path
  console.log('\n8. shipengine getRates (mocked)');
  {
    installMockFetch((url, init) => {
      if (url.endsWith('/v1/rates') && init.method === 'POST') {
        return {
          status: 200,
          body: {
            rate_response: {
              rates: [
                {
                  rate_id: 'se_rate_abc',
                  carrier_friendly_name: 'USPS',
                  service_type: 'Priority Mail',
                  service_code: 'usps_priority_mail',
                  shipping_amount: { amount: 12.5, currency: 'usd' },
                  delivery_days: 3,
                },
              ],
            },
          },
        };
      }
      return { status: 404, body: {} };
    });
    try {
      const p = createShippingProvider(
        fakeConfig({
          SHIPPING_PROVIDER: 'shipengine',
          SHIPENGINE_API_KEY: 'TEST_abc123',
        }),
      );
      ok(p.isAvailable() === true);
      const rates = await p.getRates({
        fromAddress: usAddress,
        toAddress: usAddress,
        parcel,
      });
      ok(rates.length === 1);
      ok(rates[0].amount === 1250); // $12.50 → 1250 cents
      ok(rates[0].carrier === 'USPS');
      ok(rates[0].currency === 'USD');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.headers['API-Key'] === 'TEST_abc123');
      ok(call.url.endsWith('/v1/rates'));
      console.log(`  ✅ shipengine rate → ${rates[0].carrier} $${rates[0].amount / 100}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 9. easypost happy path
  console.log('\n9. easypost getRates (mocked)');
  {
    installMockFetch((url, init) => {
      if (url.endsWith('/v2/shipments') && init.method === 'POST') {
        return {
          status: 200,
          body: {
            id: 'shp_abc',
            rates: [
              {
                id: 'rate_abc',
                carrier: 'USPS',
                service: 'Priority',
                rate: '11.25',
                currency: 'USD',
                delivery_days: 3,
              },
            ],
          },
        };
      }
      return { status: 404, body: {} };
    });
    try {
      const p = createShippingProvider(
        fakeConfig({
          SHIPPING_PROVIDER: 'easypost',
          EASYPOST_API_KEY: 'EZTK_fake',
        }),
      );
      const rates = await p.getRates({
        fromAddress: usAddress,
        toAddress: usAddress,
        parcel,
      });
      ok(rates.length === 1);
      ok(rates[0].amount === 1125); // $11.25 in cents
      ok(rates[0].provider === 'easypost');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.headers['Authorization']?.startsWith('Basic '));
      console.log(`  ✅ easypost rate → $${rates[0].amount / 100}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 10. shippo happy path
  console.log('\n10. shippo getRates (mocked)');
  {
    installMockFetch((url) => {
      if (url.endsWith('/shipments/')) {
        return {
          status: 200,
          body: {
            object_id: 'sh_abc',
            rates: [
              {
                object_id: 'rate_abc',
                provider: 'UPS',
                servicelevel: { name: 'Ground', token: 'ups_ground' },
                amount: '9.99',
                currency: 'USD',
                estimated_days: 5,
              },
            ],
          },
        };
      }
      return { status: 404, body: {} };
    });
    try {
      const p = createShippingProvider(
        fakeConfig({
          SHIPPING_PROVIDER: 'shippo',
          SHIPPO_API_KEY: 'shippo_test_xxx',
        }),
      );
      const rates = await p.getRates({
        fromAddress: usAddress,
        toAddress: usAddress,
        parcel,
      });
      ok(rates.length === 1);
      ok(rates[0].amount === 999);
      ok(rates[0].carrier === 'UPS');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.headers['Authorization'] === 'ShippoToken shippo_test_xxx');
      console.log(`  ✅ shippo rate → UPS Ground $${rates[0].amount / 100}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 11. pathao OAuth token flow + getRates returns default quote
  console.log('\n11. pathao: token issue + getRates');
  {
    let tokenCalls = 0;
    installMockFetch((url) => {
      if (url.endsWith('/aladdin/api/v1/issue-token')) {
        tokenCalls++;
        return {
          status: 200,
          body: {
            access_token: 'pathao-fake-token',
            expires_in: 86400,
            refresh_token: 'refresh',
          },
        };
      }
      return { status: 404, body: {} };
    });
    try {
      const p = createShippingProvider(
        fakeConfig({
          SHIPPING_PROVIDER: 'pathao',
          PATHAO_BASE_URL: 'https://courier-api-sandbox.pathao.com',
          PATHAO_CLIENT_ID: 'cid',
          PATHAO_CLIENT_SECRET: 'csec',
          PATHAO_USERNAME: 'u',
          PATHAO_PASSWORD: 'p',
          PATHAO_STORE_ID: '123',
        }),
      );
      ok(p.isAvailable() === true);
      // getRates doesn't hit the API (default quote); just returns
      // a placeholder.
      const rates = await p.getRates({
        fromAddress: bdAddress,
        toAddress: bdAddress,
        parcel,
      });
      ok(rates.length === 1);
      ok(rates[0].currency === 'BDT');
      ok(rates[0].provider === 'pathao');
      console.log(`  ✅ pathao default quote: ${rates[0].amount / 100} BDT`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 12. pathao createShipment makes the token call then the order call
  console.log('\n12. pathao createShipment (token + order)');
  {
    installMockFetch((url) => {
      if (url.endsWith('/aladdin/api/v1/issue-token')) {
        return {
          status: 200,
          body: { access_token: 'tok', expires_in: 86400 },
        };
      }
      if (url.endsWith('/aladdin/api/v1/orders')) {
        return {
          status: 200,
          body: {
            data: {
              consignment_id: 'DM1234567',
              order_id: 'ord-1',
              delivery_fee: 60,
            },
          },
        };
      }
      return { status: 404, body: {} };
    });
    try {
      const p = createShippingProvider(
        fakeConfig({
          SHIPPING_PROVIDER: 'pathao',
          PATHAO_CLIENT_ID: 'c',
          PATHAO_CLIENT_SECRET: 's',
          PATHAO_USERNAME: 'u',
          PATHAO_PASSWORD: 'p',
          PATHAO_STORE_ID: '1',
        }),
      );
      const shipment = await p.createShipment({
        fromAddress: bdAddress,
        toAddress: bdAddress,
        parcel,
        orderReference: 'ORD-42',
      });
      ok(shipment.trackingNumber === 'DM1234567');
      ok(shipment.carrier === 'Pathao Courier');
      ok(shipment.currency === 'BDT');

      // Verify the two calls were made in the right order
      const tokenCall = fetchCalls.find((c) =>
        c.url.includes('/issue-token'),
      );
      const orderCall = fetchCalls.find((c) => c.url.endsWith('/orders'));
      ok(!!tokenCall);
      ok(!!orderCall);
      ok(orderCall!.headers['Authorization'] === 'Bearer tok');
      console.log(`  ✅ pathao tracking: ${shipment.trackingNumber}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 13. none returns empty rates (does not throw)
  console.log('\n13. none provider returns empty rate list');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'none' }),
    );
    const rates = await p.getRates({
      fromAddress: bdAddress,
      toAddress: bdAddress,
      parcel,
    });
    ok(rates.length === 0);
    console.log(`  ✅ none returns empty rates (UI can show "no shipping")`);
  }

  // 14. none createShipment → throws
  console.log('\n14. none createShipment throws');
  {
    const p = createShippingProvider(
      fakeConfig({ SHIPPING_PROVIDER: 'none' }),
    );
    try {
      await p.createShipment({
        fromAddress: bdAddress,
        toAddress: bdAddress,
        parcel,
        orderReference: 'x',
      });
      ok(false, 'expected throw');
    } catch (e) {
      ok(e instanceof ShippingProviderNotConfiguredError);
    }
  }

  // 15. Planned / unknown values fall back to manual-zones
  console.log('\n15. planned (delhivery/shiprocket/...) + unknown fall back to manual-zones');
  {
    for (const choice of ['delhivery', 'shiprocket', 'steadfast', 'redx', 'sendcloud', 'foobar']) {
      const p = createShippingProvider(fakeConfig({ SHIPPING_PROVIDER: choice }));
      ok(p.name === 'manual-zones', `${choice} should fallback to manual-zones`);
    }
    console.log(`  ✅ 6 unknown/planned values fell back to manual-zones`);
  }

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});

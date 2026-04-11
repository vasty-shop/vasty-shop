/**
 * Smoke test for the multi-provider tax factory.
 *
 * - manual-rules: exercised against real tax-rates.config for JP, BD, CA
 *   (no network — pure local computation)
 * - stripe-tax / taxjar: mocked fetch verifies URL, auth, payload shape
 * - none: returns zero without throwing
 *
 * Run with: npx ts-node scripts/smoke-test-tax-providers.ts
 */
import { ConfigService } from '@nestjs/config';
import {
  createTaxProvider,
  TaxProviderNotConfiguredError,
} from '../src/modules/tax/providers';

function fakeConfig(env: Record<string, string>): ConfigService {
  return {
    get: <T>(key: string, def?: T) => (env[key] as any) ?? def,
  } as unknown as ConfigService;
}

type FetchCall = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
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
      body: typeof init.body === 'string' ? init.body : null,
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
  let assertCounter = 0;
  const failures: number[] = [];
  const ok = (b: boolean) => {
    assertCounter++;
    if (b) pass++;
    else {
      fail++;
      failures.push(assertCounter);
      console.log(`  ⚠️  assert #${assertCounter} failed`);
    }
  };
  console.log('=== Tax provider factory smoke test ===\n');

  // 1. default → manual-rules (NOT none, unlike the other adapters)
  console.log('1. no TAX_PROVIDER → defaults to manual-rules');
  {
    const p = createTaxProvider(fakeConfig({}));
    ok(p.name === 'manual-rules');
    ok(p.isAvailable() === true);
    console.log(`  ✅ factory returned: ${p.name}`);
  }

  // 2. manual-rules Japan 10% standard
  console.log('\n2. manual-rules Japan standard rate (10%)');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    const result = await p.calculateTax({
      currency: 'JPY',
      fromAddress: { country: 'JP' },
      toAddress: { country: 'JP' },
      lineItems: [{ id: 'l1', unitPrice: 1000, quantity: 2 }], // 2000 JPY
    });
    ok(result.totalTax === 200); // 10% of 2000
    ok(result.lineItems[0].taxRate === 0.1);
    ok(result.provider === 'manual-rules');
    ok(result.jurisdictionName === 'Japan');
    console.log(`  ✅ JP 10% → tax=${result.totalTax} on 2000 JPY`);
  }

  // 3. manual-rules Japan essential food 8% reduced rate
  console.log('\n3. manual-rules Japan essential food (8% reduced)');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    const result = await p.calculateTax({
      currency: 'JPY',
      fromAddress: { country: 'JP' },
      toAddress: { country: 'JP' },
      lineItems: [
        {
          id: 'rice',
          unitPrice: 500,
          quantity: 2,
          category: 'essential_food',
        },
      ],
    });
    ok(result.totalTax === 80); // 8% of 1000
    ok(result.lineItems[0].taxRate === 0.08);
    console.log(`  ✅ JP essential food 8% → tax=${result.totalTax}`);
  }

  // 4. manual-rules Bangladesh 15% VAT
  console.log('\n4. manual-rules Bangladesh standard (15% VAT)');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    const result = await p.calculateTax({
      currency: 'BDT',
      fromAddress: { country: 'BD' },
      toAddress: { country: 'BD' },
      lineItems: [{ id: 'l1', unitPrice: 1000, quantity: 1 }],
    });
    ok(result.totalTax === 150);
    ok(result.lineItems[0].taxRate === 0.15);
    console.log(`  ✅ BD 15% VAT → tax=${result.totalTax}`);
  }

  // 5. manual-rules Bangladesh clothing 5% reduced rate
  console.log('\n5. manual-rules Bangladesh clothing (5% reduced)');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    const result = await p.calculateTax({
      currency: 'BDT',
      fromAddress: { country: 'BD' },
      toAddress: { country: 'BD' },
      lineItems: [
        { id: 'shirt', unitPrice: 500, quantity: 1, category: 'clothing' },
      ],
    });
    ok(result.totalTax === 25); // 5% of 500
    ok(result.lineItems[0].taxRate === 0.05);
    console.log(`  ✅ BD clothing 5% → tax=${result.totalTax}`);
  }

  // 6. manual-rules Canada with known province (ON = 13% HST)
  console.log('\n6. manual-rules Canada HST province (ON)');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    const result = await p.calculateTax({
      currency: 'CAD',
      fromAddress: { country: 'CA' },
      toAddress: { country: 'CA', state: 'ON' },
      lineItems: [{ id: 'l1', unitPrice: 100, quantity: 1 }],
    });
    // Ontario HST is 13% per tax-rates.config
    ok(result.totalTax === 13);
    ok(result.lineItems[0].taxRate === 0.13);
    ok(result.jurisdictionName?.includes('Ontario'));
    ok(
      result.lineItems[0].jurisdictions?.some((j) =>
        j.name.includes('HST'),
      ) === true,
    );
    console.log(`  ✅ CA Ontario HST 13% → tax=${result.totalTax}`);
  }

  // 7. manual-rules unknown country → zero tax with warning
  console.log('\n7. manual-rules unknown country → zero tax');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    const result = await p.calculateTax({
      currency: 'USD',
      fromAddress: { country: 'US' },
      toAddress: { country: 'US' },
      lineItems: [{ id: 'l1', unitPrice: 100, quantity: 1 }],
    });
    ok(result.totalTax === 0);
    console.log(`  ✅ US (unsupported) → tax=0`);
  }

  // 8. manual-rules commitTransaction is a no-op
  console.log('\n8. manual-rules commit/refund are no-ops');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'manual-rules' }));
    await p.commitTransaction({
      transactionId: 'x',
      orderId: 'o1',
      totalAmount: 100,
      totalTax: 10,
    });
    await p.refundTransaction('x');
    ok(true); // no throw
    console.log(`  ✅ commit + refund returned without error`);
  }

  // 9. stripe-tax without key → unavailable
  console.log('\n9. stripe-tax without key → unavailable');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'stripe-tax' }));
    ok(p.name === 'stripe-tax');
    ok(p.isAvailable() === false);
    ok(
      await expectThrow(
        'calculateTax throws NotConfigured',
        () =>
          p.calculateTax({
            currency: 'USD',
            fromAddress: { country: 'US' },
            toAddress: { country: 'US' },
            lineItems: [],
          }),
        (e) => e instanceof TaxProviderNotConfiguredError,
      ),
    );
  }

  // 10. stripe-tax happy path
  console.log('\n10. stripe-tax calculateTax (mocked)');
  {
    installMockFetch(200, {
      id: 'taxcalc_abc123',
      tax_amount_exclusive: 1050, // $10.50 in cents
      line_items: {
        data: [
          {
            reference: 'l1',
            amount: 10000, // $100 in cents
            amount_tax: 1050, // $10.50 in cents
            tax_behavior: 'exclusive',
            tax_breakdown: [
              {
                amount: 1050,
                jurisdiction: { display_name: 'California', level: 'state' },
                tax_rate_details: { percentage_decimal: '10.5' },
              },
            ],
          },
        ],
      },
      customer_details: { address: { country: 'US' } },
    });
    try {
      const p = createTaxProvider(
        fakeConfig({
          TAX_PROVIDER: 'stripe-tax',
          STRIPE_SECRET_KEY: 'sk_test_abc',
        }),
      );
      const result = await p.calculateTax({
        currency: 'USD',
        fromAddress: { country: 'US' },
        toAddress: {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          postalCode: '94103',
          line1: '1 Market St',
        },
        lineItems: [{ id: 'l1', unitPrice: 10000, quantity: 1 }],
      });
      ok(result.totalTax === 10.5);
      ok(result.transactionId === 'taxcalc_abc123');
      ok(result.provider === 'stripe-tax');
      ok(result.lineItems[0].jurisdictions?.[0].name === 'California');
      console.log(`  ✅ stripe-tax → $${result.totalTax}, calc=${result.transactionId}`);

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url === 'https://api.stripe.com/v1/tax/calculations');
      ok(call.headers['Authorization'] === 'Bearer sk_test_abc');
      ok(call.headers['Content-Type'] === 'application/x-www-form-urlencoded');
      ok(call.body?.includes('customer_details%5Baddress%5D%5Bcountry%5D=US'));
      ok(call.body?.includes('currency=usd'));
      console.log(`  ✅ URL + form encoding + nested keys correct`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 11. stripe-tax commitTransaction
  console.log('\n11. stripe-tax commitTransaction (mocked)');
  {
    installMockFetch(200, { id: 'tax_tx_xyz' });
    try {
      const p = createTaxProvider(
        fakeConfig({
          TAX_PROVIDER: 'stripe-tax',
          STRIPE_SECRET_KEY: 'sk_test',
        }),
      );
      await p.commitTransaction({
        transactionId: 'taxcalc_abc',
        orderId: 'order_42',
        totalAmount: 100,
        totalTax: 10,
      });
      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url.endsWith('/v1/tax/transactions/create_from_calculation'));
      ok(call.body?.includes('calculation=taxcalc_abc'));
      ok(call.body?.includes('reference=order_42'));
      console.log(`  ✅ commit POST + correct body`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 12. taxjar happy path
  console.log('\n12. taxjar calculateTax (mocked)');
  {
    installMockFetch(200, {
      tax: {
        amount_to_collect: 10.5,
        rate: 0.105,
        breakdown: {
          line_items: [
            {
              id: 'l1',
              tax_collectable: 10.5,
              combined_tax_rate: 0.105,
              state_tax_collectable: 8,
              state_sales_tax_rate: 0.08,
              city_tax_collectable: 2.5,
              city_tax_rate: 0.025,
            },
          ],
        },
      },
    });
    try {
      const p = createTaxProvider(
        fakeConfig({
          TAX_PROVIDER: 'taxjar',
          TAXJAR_API_KEY: 'tj_test',
        }),
      );
      const result = await p.calculateTax({
        currency: 'USD',
        fromAddress: { country: 'US', state: 'CA', postalCode: '94103' },
        toAddress: { country: 'US', state: 'CA', postalCode: '90001' },
        lineItems: [{ id: 'l1', unitPrice: 100, quantity: 1 }],
      });
      ok(result.totalTax === 10.5);
      ok(result.provider === 'taxjar');
      ok(result.lineItems[0].jurisdictions?.length === 2);
      ok(
        result.lineItems[0].jurisdictions?.some((j) => j.type === 'state'),
      );
      ok(
        result.lineItems[0].jurisdictions?.some((j) => j.type === 'city'),
      );
      console.log(
        `  ✅ taxjar → $${result.totalTax}, ${result.lineItems[0].jurisdictions?.length} jurisdictions`,
      );

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url === 'https://api.taxjar.com/v2/taxes');
      ok(call.headers['Authorization'] === 'Bearer tj_test');
      const payload = JSON.parse(call.body!);
      ok(payload.from_country === 'US');
      ok(payload.to_country === 'US');
      ok(payload.line_items[0].id === 'l1');
      console.log(`  ✅ taxjar URL + Bearer auth + payload correct`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 13. taxjar sandbox URL
  console.log('\n13. taxjar with TAXJAR_SANDBOX=true → sandbox URL');
  {
    installMockFetch(200, { tax: { amount_to_collect: 0, breakdown: { line_items: [] } } });
    try {
      const p = createTaxProvider(
        fakeConfig({
          TAX_PROVIDER: 'taxjar',
          TAXJAR_API_KEY: 'k',
          TAXJAR_SANDBOX: 'true',
        }),
      );
      await p.calculateTax({
        currency: 'USD',
        fromAddress: { country: 'US' },
        toAddress: { country: 'US' },
        lineItems: [{ id: 'l1', unitPrice: 1, quantity: 1 }],
      });
      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url === 'https://api.sandbox.taxjar.com/v2/taxes');
      console.log(`  ✅ sandbox URL`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 14. none provider returns zero without throwing
  console.log('\n14. none provider returns zero tax (does not throw)');
  {
    const p = createTaxProvider(fakeConfig({ TAX_PROVIDER: 'none' }));
    ok(p.name === 'none');
    ok(p.isAvailable() === true); // "available" — it works, just returns 0
    const result = await p.calculateTax({
      currency: 'USD',
      fromAddress: { country: 'US' },
      toAddress: { country: 'US' },
      lineItems: [{ id: 'l1', unitPrice: 100, quantity: 5 }],
    });
    ok(result.totalTax === 0);
    ok(result.provider === 'none');
    console.log(`  ✅ none returns zero tax without throwing`);
  }

  // 15. unknown + avalara (planned) → fallback to manual-rules
  console.log('\n15. unknown/planned TAX_PROVIDER → manual-rules fallback');
  {
    ok(
      createTaxProvider(fakeConfig({ TAX_PROVIDER: 'foobar' })).name ===
        'manual-rules',
    );
    ok(
      createTaxProvider(fakeConfig({ TAX_PROVIDER: 'avalara' })).name ===
        'manual-rules',
    );
    console.log(`  ✅ unknown + avalara both fallback to manual-rules`);
  }

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});

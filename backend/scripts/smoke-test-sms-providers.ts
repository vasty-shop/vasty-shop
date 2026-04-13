/**
 * Smoke test for the multi-provider SMS factory.
 *
 * Mocks `fetch` so no real SMS is sent. Verifies factory instantiation,
 * URL / auth header / payload shape per provider, and NotConfigured
 * error behaviour.
 *
 * Run with: npx ts-node scripts/smoke-test-sms-providers.ts
 */
import { ConfigService } from '@nestjs/config';
import {
  createSmsProvider,
  SmsProviderNotConfiguredError,
} from '../src/modules/sms/providers';

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
    return new Response(JSON.stringify(body), { status });
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
  console.log('=== SMS provider factory smoke test ===\n');

  // 1. none default
  console.log('1. no SMS_PROVIDER → none');
  {
    const p = createSmsProvider(fakeConfig({}));
    ok(p.name === 'none');
    console.log(`  ✅ factory returned: ${p.name}`);
    ok(p.isAvailable() === false);
    ok(
      await expectThrow(
        'send fails loudly',
        () => p.send({ to: '+15551234567', text: 'hi' }),
        (e) => e instanceof SmsProviderNotConfiguredError,
      ),
    );
  }

  // 2. twilio without creds
  console.log('\n2. SMS_PROVIDER=twilio without creds → unavailable');
  {
    const p = createSmsProvider(fakeConfig({ SMS_PROVIDER: 'twilio' }));
    ok(p.name === 'twilio');
    ok(p.isAvailable() === false);
    ok(
      await expectThrow(
        'send throws NotConfigured',
        () => p.send({ to: '+15551234567', text: 'hi' }),
        (e) => e instanceof SmsProviderNotConfiguredError,
      ),
    );
  }

  // 3. twilio happy path
  console.log('\n3. twilio with creds (mocked network)');
  {
    installMockFetch(201, { sid: 'SM123abc', status: 'queued' });
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'twilio',
          TWILIO_ACCOUNT_SID: 'ACtestxxx',
          TWILIO_AUTH_TOKEN: 'tokenxxx',
          TWILIO_FROM: '+15551112222',
        }),
      );
      ok(p.name === 'twilio');
      ok(p.isAvailable() === true);

      const result = await p.send({
        to: '+15553334444',
        text: 'Your OTP is 123456',
      });
      ok(result.messageId === 'SM123abc');
      ok(result.status === 'queued');
      console.log(`  ✅ send → ${result.messageId} (${result.status})`);

      const call = fetchCalls[fetchCalls.length - 1];
      ok(
        call.url ===
          'https://api.twilio.com/2010-04-01/Accounts/ACtestxxx/Messages.json',
      );
      ok(call.headers['Authorization']?.startsWith('Basic '));
      ok(
        call.headers['Content-Type'] ===
          'application/x-www-form-urlencoded',
      );
      const params = new URLSearchParams(call.body!);
      ok(params.get('To') === '+15553334444');
      ok(params.get('From') === '+15551112222');
      ok(params.get('Body') === 'Your OTP is 123456');
      console.log(`  ✅ correct URL, basic auth, form-encoded body`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 4. twilio messaging service SID (MG...) → uses MessagingServiceSid
  console.log('\n4. twilio with MG sender → uses MessagingServiceSid');
  {
    installMockFetch(201, { sid: 'SM456', status: 'sent' });
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'twilio',
          TWILIO_ACCOUNT_SID: 'AC1',
          TWILIO_AUTH_TOKEN: 't1',
          TWILIO_FROM: 'MGservice123',
        }),
      );
      await p.send({ to: '+15551234567', text: 'hi' });
      const params = new URLSearchParams(
        fetchCalls[fetchCalls.length - 1].body!,
      );
      ok(params.get('MessagingServiceSid') === 'MGservice123');
      ok(params.get('From') === null);
      console.log(`  ✅ MG SID routed to MessagingServiceSid param`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 5. messagebird
  console.log('\n5. messagebird with creds');
  {
    installMockFetch(201, { id: 'mb-id-999' });
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'messagebird',
          MESSAGEBIRD_API_KEY: 'live_key',
          SMS_FROM: 'VastyShop',
        }),
      );
      ok(p.name === 'messagebird');
      ok(p.isAvailable() === true);
      const result = await p.send({ to: '+31612345678', text: 'Test' });
      ok(result.messageId === 'mb-id-999');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url === 'https://rest.messagebird.com/messages');
      ok(call.headers['Authorization'] === 'AccessKey live_key');
      const payload = JSON.parse(call.body!);
      ok(payload.originator === 'VastyShop');
      ok(payload.recipients[0] === '+31612345678');
      ok(payload.body === 'Test');
      console.log(`  ✅ messagebird send → ${result.messageId}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 6. vonage
  console.log('\n6. vonage with creds');
  {
    installMockFetch(200, {
      messages: [{ 'message-id': 'vn-abc', status: '0' }],
    });
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'vonage',
          VONAGE_API_KEY: 'vk',
          VONAGE_API_SECRET: 'vs',
          SMS_FROM: 'VastyShop',
        }),
      );
      ok(p.name === 'vonage');
      const result = await p.send({ to: '+15551234567', text: 'hi' });
      ok(result.messageId === 'vn-abc');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url === 'https://rest.nexmo.com/sms/json');
      const params = new URLSearchParams(call.body!);
      ok(params.get('api_key') === 'vk');
      ok(params.get('api_secret') === 'vs');
      ok(params.get('to') === '15551234567'); // no leading +
      console.log(`  ✅ vonage send → ${result.messageId} (stripped +)`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 7. vonage rejection (status != 0) → throws
  console.log('\n7. vonage rejection (status != 0)');
  {
    installMockFetch(200, {
      messages: [{ status: '1', 'error-text': 'Throttled' }],
    });
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'vonage',
          VONAGE_API_KEY: 'v',
          VONAGE_API_SECRET: 's',
          SMS_FROM: 'x',
        }),
      );
      ok(
        await expectThrow(
          'vonage throws on status != 0',
          () => p.send({ to: '+1', text: 't' }),
          (e) => /Throttled/.test(e.message),
        ),
      );
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 8. textbee
  console.log('\n8. textbee with creds');
  {
    installMockFetch(200, { data: { smsBatchId: 'tb-batch-1' } });
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'textbee',
          TEXTBEE_API_KEY: 'tb-key',
          TEXTBEE_DEVICE_ID: 'device-uuid-123',
        }),
      );
      ok(p.name === 'textbee');
      const result = await p.send({ to: '+880171234567', text: 'Test' });
      ok(result.messageId === 'tb-batch-1');

      const call = fetchCalls[fetchCalls.length - 1];
      ok(
        call.url ===
          'https://api.textbee.dev/api/v1/gateway/devices/device-uuid-123/send-sms',
      );
      ok(call.headers['x-api-key'] === 'tb-key');
      console.log(`  ✅ textbee send → ${result.messageId}`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 9. local-http
  console.log('\n9. local-http with template');
  {
    installMockFetch(200, 'OK');
    try {
      const p = createSmsProvider(
        fakeConfig({
          SMS_PROVIDER: 'local-http',
          LOCAL_SMS_URL: 'http://gateway.local:8080/send',
          LOCAL_SMS_AUTH_HEADER: 'Bearer secret123',
          LOCAL_SMS_BODY_TEMPLATE: '{"phone":"{{to}}","msg":"{{text}}"}',
        }),
      );
      ok(p.name === 'local-http');
      await p.send({ to: '+8801712345', text: 'Hello "world"' });

      const call = fetchCalls[fetchCalls.length - 1];
      ok(call.url === 'http://gateway.local:8080/send');
      ok(call.headers['Authorization'] === 'Bearer secret123');
      ok(call.body?.includes('"phone":"+8801712345"') === true);
      // The quote in "world" should be escaped for JSON safety
      ok(call.body?.includes('\\"world\\"') === true);
      console.log(`  ✅ local-http send with template + JSON-escaped quotes`);
    } finally {
      restoreFetch();
      fetchCalls.length = 0;
    }
  }

  // 10. aws-sns without creds
  console.log('\n10. aws-sns without creds → unavailable');
  {
    const p = createSmsProvider(fakeConfig({ SMS_PROVIDER: 'aws-sns' }));
    ok(p.name === 'aws-sns');
    ok(p.isAvailable() === false);
    console.log(`  ✅ aws-sns requires credentials`);
  }

  // 11. unknown
  console.log('\n11. SMS_PROVIDER=foobar → none (fallback)');
  {
    const p = createSmsProvider(fakeConfig({ SMS_PROVIDER: 'foobar' }));
    ok(p.name === 'none');
    console.log(`  ✅ unknown fell back to: ${p.name}`);
  }

  // 12. aliases
  console.log('\n12. aliases route correctly');
  {
    ok(createSmsProvider(fakeConfig({ SMS_PROVIDER: 'nexmo' })).name === 'vonage');
    ok(createSmsProvider(fakeConfig({ SMS_PROVIDER: 'sns' })).name === 'aws-sns');
    ok(createSmsProvider(fakeConfig({ SMS_PROVIDER: 'http' })).name === 'local-http');
    console.log(`  ✅ nexmo→vonage, sns→aws-sns, http→local-http`);
  }

  console.log(`\n=== Result: ${pass} passed, ${fail} failed ===`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Smoke test crashed:', e);
  process.exit(1);
});

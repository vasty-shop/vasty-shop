# SMS providers

Vasty Shop supports six SMS backends plus a `none` default. Pick one by
setting `SMS_PROVIDER` in your `.env`.

```
SMS_PROVIDER=twilio
```

Prior to this adapter, `SmsService.sendViaProvider` was a stub that
generated fake message ids and pretended every send succeeded. Every
send now actually hits a real backend (or fails loudly if the provider
isn't configured).

## Comparison

| Provider | Free tier | Transport | Status API | Best for |
|---|---|---|---|---|
| **twilio** | ~$15 trial credit | REST (basic auth) | ✅ native | global, industry standard |
| **messagebird** | 1000 test | REST | ⚠️ webhooks only | EU, cheaper than Twilio |
| **vonage** (nexmo) | €2 trial | REST | ⚠️ webhooks only | global alternative |
| **aws-sns** | 100 free / month in Free Tier | AWS SDK *(optional dep)* | ❌ | cheapest at scale |
| **textbee** | 0 (self-hosted Android) | REST | ❌ | hyper-local, zero per-msg cost |
| **local-http** | depends on gateway | REST (generic) | ❌ | SIM box, Raspberry Pi GSM hat, custom endpoints |
| **none** *(default)* | — | — | — | SMS features disabled |

## Which should I pick?

- **Global rollout in 2 minutes** → `twilio`
- **EU-focused deployment** → `messagebird` or `vonage`
- **Already on AWS, high volume** → `aws-sns`
- **Bangladesh / India / hyper-local with cheap SIMs** → `textbee` (turn
  an Android phone into the gateway, pay only your mobile plan)
- **Running your own SMS infra** (SIM box, Kannel, Raspberry Pi + GSM
  hat) → `local-http` with a body template
- **Haven't picked a provider yet** → leave `SMS_PROVIDER` unset; SMS
  features are disabled and every code path fails loudly instead of
  silently swallowing the error

## Per-provider setup

### twilio

Sign up at <https://twilio.com>, grab Account SID + Auth Token from the
Console, buy a phone number (or create a Messaging Service).

```
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM=+15551234567
```

You can use a Messaging Service SID in place of a phone number — set
`TWILIO_FROM=MG...` and the provider will send `MessagingServiceSid`
instead of `From`. The provider auto-detects this by the `MG` prefix.

### messagebird

Sign up at <https://messagebird.com>, grab an API key from the dashboard.

```
SMS_PROVIDER=messagebird
MESSAGEBIRD_API_KEY=live_...
SMS_FROM=VastyShop           # alphanumeric sender id where allowed
```

MessageBird supports alphanumeric sender ids in most markets — much
friendlier than needing a purchased number.

### vonage (nexmo)

Sign up at <https://www.vonage.com/communications-apis/>. Vonage is the
post-rebrand name for Nexmo; `SMS_PROVIDER=nexmo` is accepted as an
alias.

```
SMS_PROVIDER=vonage
VONAGE_API_KEY=...
VONAGE_API_SECRET=...
SMS_FROM=VastyShop
```

Vonage's `/sms/json` returns `{ messages: [{ status, message-id }] }`.
`status='0'` means accepted; any other status is treated as a failure
and the provider throws with the `error-text` surfaced.

### aws-sns

`@aws-sdk/client-sns` is in **optionalDependencies** — lazy-loaded on
first use. If you pick a different provider, it's never downloaded.

```
SMS_PROVIDER=aws-sns
AWS_SNS_REGION=us-east-1
AWS_SNS_ACCESS_KEY_ID=AKIA...
AWS_SNS_SECRET_ACCESS_KEY=...
SMS_FROM=VastyShop           # optional sender id (market-dependent)
```

SNS has no per-message status API. Configure delivery logging via
CloudWatch if you need visibility; this provider throws
`NotSupportedError` on `getDeliveryStatus()`.

### textbee (self-hosted via Android)

Install the TextBee Android app on a phone with a cheap SIM plan,
register the device, and grab an API key + device UUID from
<https://textbee.dev>.

```
SMS_PROVIDER=textbee
TEXTBEE_API_KEY=...
TEXTBEE_DEVICE_ID=...
```

Great for marketplaces in regions where Twilio is prohibitively
expensive and you just need OTP / delivery pings. Zero per-message cost
— you only pay the phone's SIM plan.

### local-http (generic HTTP-to-SMS gateway)

The catch-all for self-hosters running their own SMS infrastructure:
SIM boxes, Kannel, Raspberry Pi + GSM hat, SMPP→HTTP bridges, etc.

```
SMS_PROVIDER=local-http
LOCAL_SMS_URL=http://sms-gateway.local:8080/send
LOCAL_SMS_METHOD=POST                           # GET | POST | PUT
LOCAL_SMS_AUTH_HEADER=Bearer my-secret-token    # optional
LOCAL_SMS_BODY_TEMPLATE={"phone":"{{to}}","msg":"{{text}}"}
LOCAL_SMS_CONTENT_TYPE=application/json         # default
```

The body template supports three placeholders:
- `{{to}}` — recipient phone number
- `{{text}}` — message body
- `{{from}}` — sender id (from `SMS_FROM`)

All values are JSON-escaped before substitution, so a message
containing `"` or `\n` is safely encoded for JSON bodies. For
form-encoded templates the extra escaping is a harmless superset.

### none (default if unset)

Every method throws `SmsProviderNotConfiguredError`. The startup log
prints which env var to set. This is intentional: the previous
`sendViaProvider` stub silently succeeded with a fake message id,
which hid real bugs in calling code for a long time.

## Tracking delivery status

Only Twilio has a synchronous status lookup via `getDeliveryStatus()`.
For MessageBird / Vonage / SNS / TextBee / local-http, configure the
vendor's delivery webhook to call back into your backend and update
`sms_logs` when the receipt arrives.

A future PR can land a generic `/webhooks/sms/:provider` endpoint that
dispatches to each provider's receipt parser.

## Adding a new provider

1. Implement `SmsProvider` in
   `backend/src/modules/sms/providers/<name>.provider.ts`
2. Add a case to `createSmsProvider()` in `providers/index.ts`
3. Document env vars in this file and in `.env.example`
4. If the provider needs an SDK, declare it in `optionalDependencies`
   in `backend/package.json` and `require()` it inside a `loadSdk()`
   method. See `aws-sns.provider.ts` for the pattern.
5. Add smoke-test coverage in
   `backend/scripts/smoke-test-sms-providers.ts` — mock `fetch`, assert
   URL / auth header / payload shape.

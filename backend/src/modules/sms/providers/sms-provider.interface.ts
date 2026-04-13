/**
 * Common interface that every SMS provider implements.
 *
 * Pick a provider by setting SMS_PROVIDER in your .env to one of:
 *
 *   twilio       - Twilio (https://twilio.com). Global, the industry standard.
 *   messagebird  - MessageBird (https://messagebird.com). Cheaper than Twilio in EU.
 *   vonage       - Vonage / Nexmo (https://www.vonage.com). Global.
 *   aws-sns      - AWS SNS. Cheapest transactional. @aws-sdk/client-sns is
 *                  an optional dependency — lazy-loaded.
 *   textbee      - TextBee (https://textbee.dev). Self-hosted SMS gateway
 *                  using an Android phone as the modem. Zero cost, local
 *                  numbers, great for hyper-local / prototype deployments.
 *   local-http   - Generic HTTP-to-SMS gateway. Works with SIM boxes,
 *                  Raspberry Pi + GSM hats, or any custom endpoint with
 *                  a URL + optional auth header + body template.
 *   none         - SMS disabled. Every method throws loudly.
 *                  The default if SMS_PROVIDER is unset.
 *
 * Adding a new provider: implement this interface, register it in
 * providers/index.ts, document the env vars in docs/providers/sms.md.
 */

export interface SendSmsInput {
  /** E.164 format phone number (e.g. "+15551234567"). */
  to: string;
  /** Message body. Providers will split/UCS-2 encode as needed. */
  text: string;
  /** From address / sender id. Overrides SMS_FROM env var. */
  from?: string;
}

export interface SendSmsResult {
  /** Provider-specific message id (for delivery tracking). */
  messageId: string;
  /** The provider that handled the send. */
  provider: string;
  /** True if the provider accepted the message (not necessarily delivered). */
  accepted: boolean;
  /** Current status as the provider reports it. */
  status?: SmsDeliveryStatus;
}

export type SmsDeliveryStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'undelivered'
  | 'failed'
  | 'unknown';

/**
 * Common interface implemented by every SMS provider. Methods a provider
 * can't support should throw SmsProviderNotSupportedError — never silently
 * no-op.
 */
export interface SmsProvider {
  /** Stable provider name for logging / clients. */
  readonly name:
    | 'twilio'
    | 'messagebird'
    | 'vonage'
    | 'aws-sns'
    | 'textbee'
    | 'local-http'
    | 'none';

  /** True if the provider has the credentials it needs to function. */
  isAvailable(): boolean;

  /** Send a single SMS. */
  send(input: SendSmsInput): Promise<SendSmsResult>;

  /**
   * Send many SMS messages in one batch. Default implementation loops
   * `send()`; providers with a native batch API override.
   */
  sendBulk(inputs: SendSmsInput[]): Promise<SendSmsResult[]>;

  /**
   * Look up the delivery status of a previously-sent message. Throws
   * SmsProviderNotSupportedError if the provider has no status API.
   */
  getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus>;
}

/**
 * Thrown when a provider is asked to do something it can't support
 * (e.g. status lookup on a fire-and-forget gateway).
 */
export class SmsProviderNotSupportedError extends Error {
  constructor(provider: string, operation: string) {
    super(
      `Operation "${operation}" is not supported by the "${provider}" SMS provider. See docs/providers/sms.md for provider capabilities.`,
    );
    this.name = 'SmsProviderNotSupportedError';
  }
}

/**
 * Thrown when a provider is selected but its credentials are missing.
 */
export class SmsProviderNotConfiguredError extends Error {
  constructor(provider: string, missingVars: string[]) {
    super(
      `SMS provider "${provider}" is selected but the following env vars are missing: ${missingVars.join(', ')}. See docs/providers/sms.md.`,
    );
    this.name = 'SmsProviderNotConfiguredError';
  }
}

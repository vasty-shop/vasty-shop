/**
 * Generic HTTP-to-SMS gateway provider.
 *
 *   SMS_PROVIDER=local-http
 *   LOCAL_SMS_URL=http://sms-gateway.local:8080/send
 *   LOCAL_SMS_METHOD=POST                          # GET | POST | PUT (default POST)
 *   LOCAL_SMS_AUTH_HEADER=Bearer my-secret         # optional Authorization
 *   LOCAL_SMS_BODY_TEMPLATE={"to":"{{to}}","text":"{{text}}"}
 *                                                   # JSON or form template
 *                                                   # placeholders: {{to}} {{text}} {{from}}
 *   LOCAL_SMS_CONTENT_TYPE=application/json        # default application/json
 *
 * The catch-all provider for self-hosters running their own SMS gateway:
 * a SIM box, a Raspberry Pi with a GSM hat, a Kannel install, an SMPP
 * gateway with an HTTP bridge, etc. If your gateway can receive an HTTP
 * request with a message and phone number, this provider can drive it.
 *
 * Placeholders are replaced with JSON-escaped values in the body before
 * sending, so a message containing `"` or `\n` is safely encoded.
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendSmsInput,
  SendSmsResult,
  SmsDeliveryStatus,
  SmsProvider,
  SmsProviderNotConfiguredError,
  SmsProviderNotSupportedError,
} from './sms-provider.interface';

export class LocalHttpProvider implements SmsProvider {
  readonly name = 'local-http' as const;
  private readonly logger = new Logger('LocalHttpProvider');

  private readonly url: string;
  private readonly method: string;
  private readonly authHeader?: string;
  private readonly bodyTemplate: string;
  private readonly contentType: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.url = config.get<string>('LOCAL_SMS_URL', '');
    this.method = (
      config.get<string>('LOCAL_SMS_METHOD', 'POST') || 'POST'
    ).toUpperCase();
    this.authHeader = config.get<string>('LOCAL_SMS_AUTH_HEADER');
    this.bodyTemplate = config.get<string>(
      'LOCAL_SMS_BODY_TEMPLATE',
      '{"to":"{{to}}","text":"{{text}}"}',
    );
    this.contentType = config.get<string>(
      'LOCAL_SMS_CONTENT_TYPE',
      'application/json',
    );
    this.from = config.get<string>('SMS_FROM', '');

    if (this.isAvailable()) {
      this.logger.log(
        `LocalHttp provider configured (${this.method} ${this.url})`,
      );
    } else {
      this.logger.warn(
        'LocalHttp provider selected but LOCAL_SMS_URL missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!this.url;
  }

  /**
   * Replace {{to}}, {{text}}, {{from}} in the template with JSON-escaped
   * values. JSON-safe escaping works for both application/json and
   * application/x-www-form-urlencoded bodies (the extra escaping is a
   * harmless superset for form bodies).
   */
  private renderTemplate(input: SendSmsInput): string {
    const escape = (s: string) =>
      JSON.stringify(s).slice(1, -1); // strip surrounding quotes
    return this.bodyTemplate
      .replace(/\{\{to\}\}/g, escape(input.to))
      .replace(/\{\{text\}\}/g, escape(input.text))
      .replace(/\{\{from\}\}/g, escape(input.from ?? this.from));
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('local-http', ['LOCAL_SMS_URL']);
    }

    const body = this.renderTemplate(input);
    const headers: Record<string, string> = {
      'Content-Type': this.contentType,
    };
    if (this.authHeader) headers['Authorization'] = this.authHeader;

    const res = await fetch(this.url, {
      method: this.method,
      headers,
      body: this.method === 'GET' ? undefined : body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `LocalHttp SMS gateway failed: ${res.status} ${text.slice(0, 200)}`,
      );
    }

    return {
      messageId: `local-http-${Date.now()}`,
      provider: 'local-http',
      accepted: true,
      status: 'sent',
    };
  }

  async sendBulk(inputs: SendSmsInput[]): Promise<SendSmsResult[]> {
    const results: SendSmsResult[] = [];
    for (const input of inputs) {
      results.push(await this.send(input));
    }
    return results;
  }

  async getDeliveryStatus(_messageId: string): Promise<SmsDeliveryStatus> {
    throw new SmsProviderNotSupportedError(
      'local-http',
      'getDeliveryStatus (generic HTTP gateways have no standard status API; use webhooks from your gateway to update sms_logs)',
    );
  }
}

/**
 * Vonage (formerly Nexmo) SMS provider.
 *
 *   SMS_PROVIDER=vonage
 *   VONAGE_API_KEY=...
 *   VONAGE_API_SECRET=...
 *   SMS_FROM=VastyShop              # alphanumeric sender id or E.164 number
 *
 * Pure REST via fetch. Vonage's /sms/json endpoint takes form-urlencoded
 * bodies with api_key/api_secret as form params. Alphanumeric sender ids
 * work in most markets; US requires a purchased 10DLC number.
 *
 * Sign up at https://www.vonage.com/communications-apis/.
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

export class VonageProvider implements SmsProvider {
  readonly name = 'vonage' as const;
  private readonly logger = new Logger('VonageProvider');

  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('VONAGE_API_KEY', '');
    this.apiSecret = config.get<string>('VONAGE_API_SECRET', '');
    this.from = config.get<string>('SMS_FROM', '');

    if (this.isAvailable()) {
      this.logger.log(`Vonage provider configured (from=${this.from})`);
    } else {
      this.logger.warn(
        'Vonage provider selected but VONAGE_API_KEY / VONAGE_API_SECRET / SMS_FROM missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!(this.apiKey && this.apiSecret && this.from);
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('vonage', this.missingVars());
    }
    const body = new URLSearchParams();
    body.append('api_key', this.apiKey);
    body.append('api_secret', this.apiSecret);
    body.append('from', input.from ?? this.from);
    body.append('to', input.to.replace(/^\+/, '')); // Vonage wants no leading +
    body.append('text', input.text);

    const res = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const json = (await res.json()) as {
      messages?: Array<{
        'message-id'?: string;
        status?: string;
        'error-text'?: string;
      }>;
    };
    if (!res.ok) {
      throw new Error(
        `Vonage API failed: ${res.status} ${JSON.stringify(json)}`,
      );
    }
    const first = json.messages?.[0];
    if (!first || first.status !== '0') {
      throw new Error(
        `Vonage send rejected: ${first?.['error-text'] ?? 'unknown error'} (status=${first?.status})`,
      );
    }
    return {
      messageId: first['message-id'] ?? `vonage-${Date.now()}`,
      provider: 'vonage',
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
      'vonage',
      'getDeliveryStatus (use Vonage delivery receipt webhooks instead)',
    );
  }

  private missingVars(): string[] {
    const out: string[] = [];
    if (!this.apiKey) out.push('VONAGE_API_KEY');
    if (!this.apiSecret) out.push('VONAGE_API_SECRET');
    if (!this.from) out.push('SMS_FROM');
    return out;
  }
}

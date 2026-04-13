/**
 * MessageBird SMS provider.
 *
 *   SMS_PROVIDER=messagebird
 *   MESSAGEBIRD_API_KEY=live_...
 *   SMS_FROM=VastyShop              # alphanumeric sender id or E.164 number
 *
 * Pure REST via fetch. Auth is `AccessKey <key>`. MessageBird is usually
 * cheaper than Twilio in EU and has an alphanumeric sender id option that
 * works in most European countries (where the regulatory environment
 * allows it).
 *
 * Sign up at https://messagebird.com.
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

const MESSAGEBIRD_API_BASE = 'https://rest.messagebird.com';

export class MessagebirdProvider implements SmsProvider {
  readonly name = 'messagebird' as const;
  private readonly logger = new Logger('MessagebirdProvider');

  private readonly apiKey: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('MESSAGEBIRD_API_KEY', '');
    this.from = config.get<string>('SMS_FROM', '');

    if (this.isAvailable()) {
      this.logger.log(`MessageBird provider configured (from=${this.from})`);
    } else {
      this.logger.warn(
        'MessageBird provider selected but MESSAGEBIRD_API_KEY or SMS_FROM missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!(this.apiKey && this.from);
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('messagebird', this.missingVars());
    }
    const payload = {
      originator: input.from ?? this.from,
      recipients: [input.to],
      body: input.text,
    };
    const res = await fetch(`${MESSAGEBIRD_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `AccessKey ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { id?: string; errors?: unknown };
    if (!res.ok) {
      throw new Error(
        `MessageBird API failed: ${res.status} ${JSON.stringify(json)}`,
      );
    }
    return {
      messageId: json.id ?? `messagebird-${Date.now()}`,
      provider: 'messagebird',
      accepted: true,
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
    // MessageBird does expose GET /messages/{id}, but the response shape
    // mapping is non-trivial (per-recipient statuses). Callers should
    // rely on delivery webhooks instead — throw loudly so the wrong path
    // isn't silently taken.
    throw new SmsProviderNotSupportedError(
      'messagebird',
      'getDeliveryStatus (use MessageBird delivery webhooks instead — see https://developers.messagebird.com/api/sms-messaging/#delivery-reports)',
    );
  }

  private missingVars(): string[] {
    const out: string[] = [];
    if (!this.apiKey) out.push('MESSAGEBIRD_API_KEY');
    if (!this.from) out.push('SMS_FROM');
    return out;
  }
}

/**
 * Twilio SMS provider.
 *
 *   SMS_PROVIDER=twilio
 *   TWILIO_ACCOUNT_SID=AC...
 *   TWILIO_AUTH_TOKEN=...
 *   TWILIO_FROM=+15551234567      # purchased Twilio number or messaging service SID
 *
 * Pure REST via fetch — no SDK dep needed. Basic auth with the account
 * SID + auth token. The messaging service SID can be used in place of
 * a phone number by setting TWILIO_FROM to a "MG..." SID.
 *
 * Sign up at https://twilio.com. Trial credit includes ~$15 of sends.
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SendSmsInput,
  SendSmsResult,
  SmsDeliveryStatus,
  SmsProvider,
  SmsProviderNotConfiguredError,
} from './sms-provider.interface';

export class TwilioProvider implements SmsProvider {
  readonly name = 'twilio' as const;
  private readonly logger = new Logger('TwilioProvider');

  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.accountSid = config.get<string>('TWILIO_ACCOUNT_SID', '');
    this.authToken = config.get<string>('TWILIO_AUTH_TOKEN', '');
    this.from = config.get<string>('TWILIO_FROM', '');

    if (this.isAvailable()) {
      this.logger.log(`Twilio provider configured (from=${this.from})`);
    } else {
      this.logger.warn(
        'Twilio provider selected but TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!(this.accountSid && this.authToken && this.from);
  }

  private missingVars(): string[] {
    const out: string[] = [];
    if (!this.accountSid) out.push('TWILIO_ACCOUNT_SID');
    if (!this.authToken) out.push('TWILIO_AUTH_TOKEN');
    if (!this.from) out.push('TWILIO_FROM');
    return out;
  }

  private authHeader(): string {
    return (
      'Basic ' +
      Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
    );
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('twilio', this.missingVars());
    }

    const from = input.from ?? this.from;
    const body = new URLSearchParams();
    body.append('To', input.to);
    body.append(from.startsWith('MG') ? 'MessagingServiceSid' : 'From', from);
    body.append('Body', input.text);

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: this.authHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    );

    const json = (await res.json()) as {
      sid?: string;
      status?: string;
      error_code?: number;
      message?: string;
    };
    if (!res.ok) {
      throw new Error(
        `Twilio API failed: ${res.status} ${json.message ?? JSON.stringify(json)}`,
      );
    }
    return {
      messageId: json.sid ?? `twilio-${Date.now()}`,
      provider: 'twilio',
      accepted: true,
      status: this.mapStatus(json.status),
    };
  }

  async sendBulk(inputs: SendSmsInput[]): Promise<SendSmsResult[]> {
    const results: SendSmsResult[] = [];
    for (const input of inputs) {
      results.push(await this.send(input));
    }
    return results;
  }

  async getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus> {
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('twilio', this.missingVars());
    }
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${messageId}.json`,
      {
        headers: { Authorization: this.authHeader() },
      },
    );
    if (!res.ok) return 'unknown';
    const json = (await res.json()) as { status?: string };
    return this.mapStatus(json.status);
  }

  private mapStatus(raw?: string): SmsDeliveryStatus {
    switch (raw) {
      case 'queued':
      case 'accepted':
        return 'queued';
      case 'sending':
        return 'sending';
      case 'sent':
        return 'sent';
      case 'delivered':
        return 'delivered';
      case 'undelivered':
        return 'undelivered';
      case 'failed':
        return 'failed';
      default:
        return 'unknown';
    }
  }
}

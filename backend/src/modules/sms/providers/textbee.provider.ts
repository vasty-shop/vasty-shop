/**
 * TextBee SMS provider — self-hosted SMS gateway via Android phone.
 *
 *   SMS_PROVIDER=textbee
 *   TEXTBEE_API_KEY=...
 *   TEXTBEE_DEVICE_ID=...        # UUID of the registered phone
 *
 * TextBee (https://textbee.dev) turns an Android phone into a relay:
 * install the TextBee Android app, register the device, grab an API key
 * + device id, and send SMS through the phone's local SIM. Zero per-
 * message cost (you only pay for the phone's plan), local numbers, no
 * cloud vendor. Perfect for hyper-local marketplaces or proof-of-concept
 * deployments.
 *
 * Pure REST via fetch — no SDK needed.
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

const TEXTBEE_API_BASE = 'https://api.textbee.dev/api/v1';

export class TextbeeProvider implements SmsProvider {
  readonly name = 'textbee' as const;
  private readonly logger = new Logger('TextbeeProvider');

  private readonly apiKey: string;
  private readonly deviceId: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('TEXTBEE_API_KEY', '');
    this.deviceId = config.get<string>('TEXTBEE_DEVICE_ID', '');

    if (this.isAvailable()) {
      this.logger.log(`TextBee provider configured (device=${this.deviceId})`);
    } else {
      this.logger.warn(
        'TextBee provider selected but TEXTBEE_API_KEY / TEXTBEE_DEVICE_ID missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!(this.apiKey && this.deviceId);
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('textbee', this.missingVars());
    }
    const payload = {
      recipients: [input.to],
      message: input.text,
    };
    const res = await fetch(
      `${TEXTBEE_API_BASE}/gateway/devices/${encodeURIComponent(this.deviceId)}/send-sms`,
      {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const json = (await res.json()) as {
      data?: { smsBatchId?: string };
      error?: string;
    };
    if (!res.ok) {
      throw new Error(
        `TextBee API failed: ${res.status} ${json.error ?? JSON.stringify(json)}`,
      );
    }
    return {
      messageId: json.data?.smsBatchId ?? `textbee-${Date.now()}`,
      provider: 'textbee',
      accepted: true,
      status: 'queued',
    };
  }

  async sendBulk(inputs: SendSmsInput[]): Promise<SendSmsResult[]> {
    // TextBee's /send-sms already accepts a recipients array, but our
    // interface sends per-message. Loop for simplicity.
    const results: SendSmsResult[] = [];
    for (const input of inputs) {
      results.push(await this.send(input));
    }
    return results;
  }

  async getDeliveryStatus(_messageId: string): Promise<SmsDeliveryStatus> {
    throw new SmsProviderNotSupportedError(
      'textbee',
      'getDeliveryStatus (TextBee reports batch status via its device dashboard; use device webhooks if you need programmatic tracking)',
    );
  }

  private missingVars(): string[] {
    const out: string[] = [];
    if (!this.apiKey) out.push('TEXTBEE_API_KEY');
    if (!this.deviceId) out.push('TEXTBEE_DEVICE_ID');
    return out;
  }
}

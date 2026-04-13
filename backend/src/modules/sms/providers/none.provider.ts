/**
 * "None" SMS provider — SMS is disabled.
 *
 * The default if SMS_PROVIDER is unset. Every method throws
 * SmsProviderNotConfiguredError so calling code fails loudly rather
 * than silently no-opping. The startup log tells the operator which
 * env var to set to enable SMS.
 *
 * Unlike the previous `sendViaProvider` stub in `sms.service.ts` which
 * fabricated a fake message id and pretended to succeed (swallowing
 * every failure), this provider makes disabled-SMS impossible to miss.
 */
import { Logger } from '@nestjs/common';
import {
  SendSmsInput,
  SendSmsResult,
  SmsDeliveryStatus,
  SmsProvider,
  SmsProviderNotConfiguredError,
} from './sms-provider.interface';

export class NoneSmsProvider implements SmsProvider {
  readonly name = 'none' as const;
  private readonly logger = new Logger('NoneSmsProvider');

  constructor() {
    this.logger.log(
      'SMS is DISABLED (SMS_PROVIDER not set). To enable, set SMS_PROVIDER to one of: twilio, messagebird, vonage, aws-sns, textbee, local-http. See docs/providers/sms.md.',
    );
  }

  isAvailable(): boolean {
    return false;
  }

  private fail(op: string): never {
    throw new SmsProviderNotConfiguredError('none', [
      `SMS_PROVIDER (currently unset) - cannot ${op}`,
    ]);
  }

  async send(_input: SendSmsInput): Promise<SendSmsResult> {
    return this.fail('send');
  }

  async sendBulk(_inputs: SendSmsInput[]): Promise<SendSmsResult[]> {
    return this.fail('sendBulk');
  }

  async getDeliveryStatus(_messageId: string): Promise<SmsDeliveryStatus> {
    return this.fail('getDeliveryStatus');
  }
}

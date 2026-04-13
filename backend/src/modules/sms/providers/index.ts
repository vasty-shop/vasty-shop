/**
 * SMS provider factory.
 *
 * Reads SMS_PROVIDER from config and returns the matching provider.
 * Unknown values fall back to 'none' with a warning listing the valid
 * choices.
 *
 * Add a new provider by:
 *   1. Implementing SmsProvider in <name>.provider.ts
 *   2. Adding a case to createSmsProvider() below
 *   3. Documenting env vars in docs/providers/sms.md
 */
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SmsProvider } from './sms-provider.interface';
import { TwilioProvider } from './twilio.provider';
import { MessagebirdProvider } from './messagebird.provider';
import { VonageProvider } from './vonage.provider';
import { AwsSnsProvider } from './aws-sns.provider';
import { TextbeeProvider } from './textbee.provider';
import { LocalHttpProvider } from './local-http.provider';
import { NoneSmsProvider } from './none.provider';

const log = new Logger('SmsProviderFactory');

export function createSmsProvider(config: ConfigService): SmsProvider {
  const choice = (config.get<string>('SMS_PROVIDER') || 'none')
    .toLowerCase()
    .trim();

  switch (choice) {
    case 'twilio': {
      const p = new TwilioProvider(config);
      log.log(`Selected SMS provider: twilio (available=${p.isAvailable()})`);
      return p;
    }
    case 'messagebird':
    case 'message-bird': {
      const p = new MessagebirdProvider(config);
      log.log(
        `Selected SMS provider: messagebird (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'vonage':
    case 'nexmo': {
      const p = new VonageProvider(config);
      log.log(`Selected SMS provider: vonage (available=${p.isAvailable()})`);
      return p;
    }
    case 'aws-sns':
    case 'sns':
    case 'aws_sns': {
      const p = new AwsSnsProvider(config);
      log.log(
        `Selected SMS provider: aws-sns (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'textbee': {
      const p = new TextbeeProvider(config);
      log.log(`Selected SMS provider: textbee (available=${p.isAvailable()})`);
      return p;
    }
    case 'local-http':
    case 'http':
    case 'local': {
      const p = new LocalHttpProvider(config);
      log.log(
        `Selected SMS provider: local-http (available=${p.isAvailable()})`,
      );
      return p;
    }
    case 'none':
    case '':
      return new NoneSmsProvider();
    default:
      log.warn(
        `Unknown SMS_PROVIDER="${choice}". Falling back to "none". Valid values: twilio, messagebird, vonage, aws-sns, textbee, local-http, none.`,
      );
      return new NoneSmsProvider();
  }
}

export * from './sms-provider.interface';
export { TwilioProvider } from './twilio.provider';
export { MessagebirdProvider } from './messagebird.provider';
export { VonageProvider } from './vonage.provider';
export { AwsSnsProvider } from './aws-sns.provider';
export { TextbeeProvider } from './textbee.provider';
export { LocalHttpProvider } from './local-http.provider';
export { NoneSmsProvider } from './none.provider';

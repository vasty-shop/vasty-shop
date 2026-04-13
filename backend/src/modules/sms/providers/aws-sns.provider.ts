/**
 * AWS SNS SMS provider.
 *
 *   SMS_PROVIDER=aws-sns
 *   AWS_SNS_REGION=us-east-1
 *   AWS_SNS_ACCESS_KEY_ID=AKIA...
 *   AWS_SNS_SECRET_ACCESS_KEY=...
 *   SMS_FROM=VastyShop            # optional sender id (market-dependent)
 *
 * The `@aws-sdk/client-sns` package is an OPTIONAL dependency —
 * lazy-loaded inside loadSdk(). Listed in optionalDependencies in
 * package.json.
 *
 * SNS is the cheapest transactional SMS at scale in most regions. SNS
 * has no status API per message — rely on CloudWatch metrics or a
 * delivery reports SQS topic for outbound visibility.
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

export class AwsSnsProvider implements SmsProvider {
  readonly name = 'aws-sns' as const;
  private readonly logger = new Logger('AwsSnsProvider');

  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly from: string;

  private sdkLoaded = false;
  private client: any;
  private publishCommandClass: any;
  private setAttributesCommandClass: any;

  constructor(config: ConfigService) {
    this.region = config.get<string>('AWS_SNS_REGION', 'us-east-1');
    this.accessKeyId = config.get<string>('AWS_SNS_ACCESS_KEY_ID', '');
    this.secretAccessKey = config.get<string>('AWS_SNS_SECRET_ACCESS_KEY', '');
    this.from = config.get<string>('SMS_FROM', '');

    if (this.isAvailable()) {
      this.logger.log(`AWS SNS provider configured (region=${this.region})`);
    } else {
      this.logger.warn(
        'AWS SNS provider selected but AWS_SNS_ACCESS_KEY_ID / AWS_SNS_SECRET_ACCESS_KEY missing',
      );
    }
  }

  isAvailable(): boolean {
    return !!(this.accessKeyId && this.secretAccessKey);
  }

  private loadSdk() {
    if (this.sdkLoaded) return;
    if (!this.isAvailable()) {
      throw new SmsProviderNotConfiguredError('aws-sns', this.missingVars());
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sdk = require('@aws-sdk/client-sns');
      this.client = new sdk.SNSClient({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });
      this.publishCommandClass = sdk.PublishCommand;
      this.setAttributesCommandClass = sdk.SetSMSAttributesCommand;
      this.sdkLoaded = true;
      this.logger.log('@aws-sdk/client-sns loaded');
    } catch (e: any) {
      throw new Error(
        `AWS SNS provider selected but "@aws-sdk/client-sns" is not installed. ` +
          `Run: npm install @aws-sdk/client-sns    Original: ${e.message}`,
      );
    }
  }

  private missingVars(): string[] {
    const out: string[] = [];
    if (!this.accessKeyId) out.push('AWS_SNS_ACCESS_KEY_ID');
    if (!this.secretAccessKey) out.push('AWS_SNS_SECRET_ACCESS_KEY');
    return out;
  }

  async send(input: SendSmsInput): Promise<SendSmsResult> {
    this.loadSdk();

    const from = input.from ?? this.from;
    const command = new this.publishCommandClass({
      PhoneNumber: input.to,
      Message: input.text,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
        ...(from
          ? {
              'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: from,
              },
            }
          : {}),
      },
    });

    const res = await this.client.send(command);
    return {
      messageId: res.MessageId ?? `sns-${Date.now()}`,
      provider: 'aws-sns',
      accepted: true,
    };
  }

  async sendBulk(inputs: SendSmsInput[]): Promise<SendSmsResult[]> {
    // SNS has no batch SMS API; loop send().
    const results: SendSmsResult[] = [];
    for (const input of inputs) {
      results.push(await this.send(input));
    }
    return results;
  }

  async getDeliveryStatus(_messageId: string): Promise<SmsDeliveryStatus> {
    // SNS has no per-message status API. Set up a delivery-status SNS
    // topic + SQS subscription and log consumer to get real visibility.
    throw new SmsProviderNotSupportedError(
      'aws-sns',
      'getDeliveryStatus (SNS has no per-message status API; configure delivery status logging via AWS.SNS.SMS.SetSMSAttributes + a CloudWatch log group)',
    );
  }
}

import { Injectable, Logger, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import {
  SmsProvider,
  SmsTemplateType,
  SmsStatus,
  ConfigureSmsDto,
  UpdateSmsSettingsDto,
  CreateSmsTemplateDto,
  UpdateSmsTemplateDto,
  SendSmsDto,
  SendBulkSmsDto,
  GetSmsLogsDto,
} from './dto/sms.dto';
import {
  createSmsProvider,
  SmsProvider as PluggableSmsProvider,
} from './providers';

@Injectable()
export class SmsService implements OnModuleInit {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Pluggable SMS provider resolved from SMS_PROVIDER env var at boot.
   * Replaces the old `sendViaProvider` stub. See `./providers/` and
   * `docs/providers/sms.md`.
   */
  private pluggableProvider!: PluggableSmsProvider;

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.pluggableProvider = createSmsProvider(this.config);
    this.logger.log(
      `SMS provider initialized: ${this.pluggableProvider.name} (available=${this.pluggableProvider.isAvailable()})`,
    );
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Get SMS configuration
   */
  async getConfig(): Promise<any> {
    const configs = await /* TODO: replace client call */ this.db.client.query
      .from('sms_config')
      .select('*')
      .limit(1)
      .get();

    if (!configs || configs.length === 0) {
      return this.getDefaultConfig();
    }

    return this.transformConfig(configs[0]);
  }

  /**
   * Configure SMS provider
   */
  async configureProvider(dto: ConfigureSmsDto): Promise<any> {
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('sms_config')
      .select('id')
      .limit(1)
      .get();

    const configData = {
      provider: dto.provider,
      credentials: JSON.stringify(dto.credentials),
      default_sender_id: dto.defaultSenderId || null,
      is_enabled: dto.isEnabled !== false,
      updated_at: new Date().toISOString(),
    };

    if (existing && existing.length > 0) {
      await /* TODO: replace client call */ this.db.client.query
        .from('sms_config')
        .where('id', existing[0].id)
        .update(configData)
        .execute();
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('sms_config')
        .insert({
          ...configData,
          otp_length: 6,
          otp_expiry_minutes: 5,
          daily_limit_per_user: 10,
          created_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.getConfig();
  }

  /**
   * Update SMS settings
   */
  async updateSettings(dto: UpdateSmsSettingsDto): Promise<any> {
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('sms_config')
      .select('id')
      .limit(1)
      .get();

    if (!existing || existing.length === 0) {
      throw new BadRequestException('SMS provider not configured');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.isEnabled !== undefined) updateData.is_enabled = dto.isEnabled;
    if (dto.defaultSenderId !== undefined) updateData.default_sender_id = dto.defaultSenderId;
    if (dto.otpLength !== undefined) updateData.otp_length = dto.otpLength;
    if (dto.otpExpiryMinutes !== undefined) updateData.otp_expiry_minutes = dto.otpExpiryMinutes;
    if (dto.dailyLimitPerUser !== undefined) updateData.daily_limit_per_user = dto.dailyLimitPerUser;

    await /* TODO: replace client call */ this.db.client.query
      .from('sms_config')
      .where('id', existing[0].id)
      .update(updateData)
      .execute();

    return this.getConfig();
  }

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  /**
   * Get all SMS templates
   */
  async getTemplates(includeInactive = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .select('*');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const templates = await query.orderBy('type', 'ASC').get();
    return (templates || []).map(this.transformTemplate);
  }

  /**
   * Get template by type
   */
  async getTemplateByType(type: SmsTemplateType): Promise<any | null> {
    const templates = await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .select('*')
      .where('type', type)
      .where('is_active', true)
      .get();

    if (!templates || templates.length === 0) {
      return null;
    }

    return this.transformTemplate(templates[0]);
  }

  /**
   * Create SMS template
   */
  async createTemplate(dto: CreateSmsTemplateDto): Promise<any> {
    // Check if template type already exists
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .select('id')
      .where('type', dto.type)
      .get();

    if (existing && existing.length > 0) {
      throw new BadRequestException(`Template for type '${dto.type}' already exists`);
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .insert({
        type: dto.type,
        name: dto.name,
        body: dto.body,
        variables: JSON.stringify(dto.variables || this.extractVariables(dto.body)),
        is_active: dto.isActive !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformTemplate(result[0]);
  }

  /**
   * Update SMS template
   */
  async updateTemplate(templateId: string, dto: UpdateSmsTemplateDto): Promise<any> {
    const templates = await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .select('*')
      .where('id', templateId)
      .get();

    if (!templates || templates.length === 0) {
      throw new NotFoundException('SMS template not found');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.body !== undefined) {
      updateData.body = dto.body;
      if (!dto.variables) {
        updateData.variables = JSON.stringify(this.extractVariables(dto.body));
      }
    }
    if (dto.variables !== undefined) updateData.variables = JSON.stringify(dto.variables);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .where('id', templateId)
      .update(updateData)
      .execute();

    const updated = await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .select('*')
      .where('id', templateId)
      .get();

    return this.transformTemplate(updated[0]);
  }

  /**
   * Delete SMS template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('sms_templates')
      .where('id', templateId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // SENDING SMS
  // ============================================

  /**
   * Send SMS using template
   */
  async sendSms(dto: SendSmsDto): Promise<any> {
    this.validateE164(dto.to);
    const config = await this.getConfig();

    if (!config.isEnabled) {
      throw new BadRequestException('SMS service is disabled');
    }

    if (!config.isConfigured) {
      throw new BadRequestException('SMS provider not configured');
    }

    const template = await this.getTemplateByType(dto.templateType);
    const message = template
      ? this.compileTemplate(template.body, dto.variables || {})
      : this.getDefaultMessage(dto.templateType, dto.variables || {});

    // Create log entry
    const log = await this.createSmsLog({
      phoneNumber: dto.to,
      templateType: dto.templateType,
      message,
    });

    try {
      // Send via provider
      const result = await this.sendViaProvider(config, dto.to, message);

      // Update log
      await this.updateSmsLog(log.id, {
        status: SmsStatus.SENT,
        providerMessageId: result.messageId,
        sentAt: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: log.id,
        providerMessageId: result.messageId,
      };
    } catch (error) {
      await this.updateSmsLog(log.id, {
        status: SmsStatus.FAILED,
        errorMessage: error.message,
      });

      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(dto: SendBulkSmsDto): Promise<any> {
    const results = {
      total: dto.recipients.length,
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const recipient of dto.recipients) {
      try {
        const variables = {
          ...(dto.commonVariables || {}),
          ...(dto.recipientVariables?.[recipient] || {}),
        };

        await this.sendSms({
          to: recipient,
          templateType: dto.templateType,
          variables,
        });

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          phoneNumber: recipient,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send OTP
   */
  async sendOtp(phoneNumber: string, purpose = 'verification'): Promise<any> {
    this.validateE164(phoneNumber);
    const config = await this.getConfig();
    const otp = this.generateOtp(config.otpLength);
    const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);

    // Store OTP
    await /* TODO: replace client call */ this.db.client.query
      .from('sms_otps')
      .insert({
        phone_number: phoneNumber,
        otp,
        purpose,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        created_at: new Date().toISOString(),
      })
      .execute();

    // Send SMS
    await this.sendSms({
      to: phoneNumber,
      templateType: SmsTemplateType.OTP,
      variables: { otp, expiryMinutes: config.otpExpiryMinutes },
    });

    return {
      success: true,
      expiresAt: expiresAt.toISOString(),
      expiryMinutes: config.otpExpiryMinutes,
    };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(phoneNumber: string, otp: string): Promise<{ valid: boolean; message: string }> {
    this.validateE164(phoneNumber);

    // Fetch the latest unverified OTP for this phone WITHOUT filtering
    // by OTP value. The previous version added `.where('otp', otp)` so
    // only a matching row was returned — which meant wrong guesses
    // always fell through to "Invalid OTP" without ever incrementing
    // attempts, and a scripted attacker had an unbounded window to
    // brute-force the numeric code. Pulling the row by phone number
    // and comparing in code lets us increment the counter on misses
    // and lock out after 3.
    const otps = await /* TODO: replace client call */ this.db.client.query
      .from('sms_otps')
      .select('*')
      .where('phone_number', phoneNumber)
      .where('verified', false)
      .orderBy('created_at', 'DESC')
      .limit(1)
      .get();

    if (!otps || otps.length === 0) {
      return { valid: false, message: 'Invalid OTP' };
    }

    const otpRecord = otps[0];

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      return { valid: false, message: 'OTP has expired' };
    }

    // Check attempts BEFORE comparing so a 4th attempt can't succeed
    // even if someone finally guesses right.
    if ((otpRecord.attempts ?? 0) >= 3) {
      return { valid: false, message: 'Too many attempts' };
    }

    // Constant-time compare to avoid leaking per-digit timing info.
    const expected = String(otpRecord.otp ?? '');
    const provided = String(otp ?? '');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const providedBuf = Buffer.from(provided, 'utf8');
    const isMatch =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!isMatch) {
      // Wrong code → increment the counter. This is the line that
      // was previously dead, letting an attacker brute-force the
      // whole OTP space within the TTL window.
      await /* TODO: replace client call */ this.db.client.query
        .from('sms_otps')
        .where('id', otpRecord.id)
        .update({ attempts: (otpRecord.attempts ?? 0) + 1 })
        .execute();
      return { valid: false, message: 'Invalid OTP' };
    }

    // Correct code → mark as verified.
    await /* TODO: replace client call */ this.db.client.query
      .from('sms_otps')
      .where('id', otpRecord.id)
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .execute();

    return { valid: true, message: 'OTP verified successfully' };
  }

  // ============================================
  // LOGS & STATS
  // ============================================

  /**
   * Get SMS logs
   */
  async getLogs(dto: GetSmsLogsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('sms_logs')
      .select('*');

    if (dto.templateType) {
      query = query.where('template_type', dto.templateType);
    }

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.phoneNumber) {
      query = query.where('phone_number', dto.phoneNumber);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const logs = await query
      .orderBy('created_at', 'DESC')
      .limit(dto.limit || 50)
      .offset(dto.offset || 0)
      .get();

    return (logs || []).map(this.transformLog);
  }

  /**
   * Get SMS statistics
   */
  async getStats(startDate?: string, endDate?: string): Promise<any> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('sms_logs')
      .select('*');

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const logs = await query.get();
    const all = logs || [];

    const totalSent = all.filter((l: any) => l.status !== SmsStatus.PENDING).length;
    const delivered = all.filter((l: any) => l.status === SmsStatus.DELIVERED || l.status === SmsStatus.SENT).length;
    const failed = all.filter((l: any) => l.status === SmsStatus.FAILED).length;
    const pending = all.filter((l: any) => l.status === SmsStatus.PENDING).length;

    return {
      totalSent,
      delivered,
      failed,
      pending,
      deliveryRate: totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(2) + '%' : '0%',
      costEstimate: totalSent * 0.0075, // Approximate cost per SMS
    };
  }

  /**
   * Update delivery status (webhook handler)
   */
  async updateDeliveryStatus(providerMessageId: string, status: SmsStatus): Promise<void> {
    const logs = await /* TODO: replace client call */ this.db.client.query
      .from('sms_logs')
      .select('id')
      .where('provider_message_id', providerMessageId)
      .get();

    if (logs && logs.length > 0) {
      await this.updateSmsLog(logs[0].id, {
        status,
        deliveredAt: status === SmsStatus.DELIVERED ? new Date().toISOString() : undefined,
      });
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Send via the pluggable provider adapter. Replaces the earlier
   * fake-id stub. The `config` param (database-stored SMS config row)
   * is kept for compatibility with existing callers but is no longer
   * consulted — the authoritative provider selection lives in
   * SMS_PROVIDER env var, which is the deskive pattern.
   *
   * See `backend/src/modules/sms/providers/` and
   * `backend/docs/providers/sms.md`.
   */
  private async sendViaProvider(
    _config: any,
    to: string,
    message: string,
  ): Promise<{ messageId: string }> {
    this.logger.log(
      `Sending SMS to ${to} via ${this.pluggableProvider.name}: ${message.substring(0, 50)}...`,
    );
    const result = await this.pluggableProvider.send({ to, text: message });
    return { messageId: result.messageId };
  }

  /**
   * Strict ISO E.164 validator. Must be + followed by a country
   * code and subscriber number, 8–15 digits total. Everything else
   * (trailing whitespace, parentheses, hyphens, US-style "(555)
   * 555-1234", dialed prefixes like 00 or 011) is rejected — callers
   * are expected to normalize upstream (e.g. via libphonenumber-js
   * in the frontend) before handing a number to this service.
   */
  private static readonly E164_RE = /^\+[1-9][0-9]{7,14}$/;

  private validateE164(phoneNumber: string): void {
    if (!SmsService.E164_RE.test(phoneNumber)) {
      throw new BadRequestException(
        `Phone number "${phoneNumber}" is not in E.164 format. Expected "+" followed by country code and 8–15 digits (e.g. +14155551234). Normalize the input before calling SmsService.`,
      );
    }
  }

  /**
   * Generate a numeric OTP with crypto-strong randomness.
   *
   * Math.random is NOT cryptographically secure — its PRNG state
   * can be reconstructed from 3-4 observed outputs (the
   * xorshift128+ weakness is well-documented). An OTP stream
   * seeded by Math.random is guessable by an attacker who captures
   * any sibling OTP from the same process.
   *
   * crypto.randomInt is a wrapper around /dev/urandom (or the OS
   * equivalent) and is suitable for authentication codes.
   */
  private generateOtp(length: number): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += crypto.randomInt(0, 10).toString();
    }
    return otp;
  }

  private async createSmsLog(data: {
    phoneNumber: string;
    templateType: SmsTemplateType;
    message: string;
  }): Promise<any> {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('sms_logs')
      .insert({
        phone_number: data.phoneNumber,
        template_type: data.templateType,
        message: data.message,
        status: SmsStatus.PENDING,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformLog(result[0]);
  }

  private async updateSmsLog(logId: string, data: any): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('sms_logs')
      .where('id', logId)
      .update(data)
      .execute();
  }

  private compileTemplate(template: string, variables: Record<string, any>): string {
    let compiled = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiled = compiled.replace(regex, String(value ?? ''));
    }
    return compiled.replace(/{{[^}]+}}/g, '');
  }

  private extractVariables(template: string): string[] {
    const matches = template.match(/{{([^}]+)}}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))];
  }

  private getDefaultMessage(type: SmsTemplateType, variables: Record<string, any>): string {
    const messages: Record<SmsTemplateType, string> = {
      [SmsTemplateType.OTP]: `Your verification code is {{otp}}. Valid for {{expiryMinutes}} minutes.`,
      [SmsTemplateType.VERIFICATION]: `Please verify your phone number. Code: {{code}}`,
      [SmsTemplateType.PASSWORD_RESET]: `Your password reset code is {{code}}`,
      [SmsTemplateType.LOGIN_ALERT]: `New login detected on your account.`,
      [SmsTemplateType.ORDER_PLACED]: `Order #{{orderId}} placed successfully! Total: {{total}}`,
      [SmsTemplateType.ORDER_CONFIRMED]: `Order #{{orderId}} confirmed. Preparing for delivery.`,
      [SmsTemplateType.ORDER_SHIPPED]: `Order #{{orderId}} shipped! Track: {{trackingNumber}}`,
      [SmsTemplateType.ORDER_OUT_FOR_DELIVERY]: `Order #{{orderId}} is out for delivery!`,
      [SmsTemplateType.ORDER_DELIVERED]: `Order #{{orderId}} delivered. Thank you!`,
      [SmsTemplateType.ORDER_CANCELLED]: `Order #{{orderId}} has been cancelled.`,
      [SmsTemplateType.DRIVER_ASSIGNED]: `Driver {{driverName}} assigned to your order.`,
      [SmsTemplateType.DELIVERY_ETA]: `Your order arrives in ~{{eta}} minutes.`,
      [SmsTemplateType.PAYMENT_RECEIVED]: `Payment of {{amount}} received. Thank you!`,
      [SmsTemplateType.REFUND_INITIATED]: `Refund of {{amount}} initiated for order #{{orderId}}.`,
      [SmsTemplateType.REFUND_COMPLETED]: `Refund of {{amount}} completed.`,
      [SmsTemplateType.WALLET_CREDITED]: `{{amount}} credited to your wallet. Balance: {{balance}}`,
      [SmsTemplateType.WALLET_LOW_BALANCE]: `Your wallet balance is low: {{balance}}`,
      [SmsTemplateType.PROMO]: `{{message}}`,
      [SmsTemplateType.FLASH_SALE]: `Flash Sale! {{discount}}% off. Use code: {{code}}`,
      [SmsTemplateType.ABANDONED_CART]: `You left items in your cart! Complete your order now.`,
      [SmsTemplateType.VENDOR_NEW_ORDER]: `New order #{{orderId}} received! Amount: {{total}}`,
      [SmsTemplateType.VENDOR_ORDER_CANCELLED]: `Order #{{orderId}} cancelled by customer.`,
      [SmsTemplateType.VENDOR_PAYOUT]: `Payout of {{amount}} processed to your account.`,
      [SmsTemplateType.CUSTOM]: `{{message}}`,
    };

    return this.compileTemplate(messages[type] || '{{message}}', variables);
  }

  private getDefaultConfig(): any {
    return {
      provider: null,
      isEnabled: false,
      defaultSenderId: null,
      otpLength: 6,
      otpExpiryMinutes: 5,
      dailyLimitPerUser: 10,
      isConfigured: false,
    };
  }

  private transformConfig(config: any): any {
    return {
      provider: config.provider,
      isEnabled: config.is_enabled,
      defaultSenderId: config.default_sender_id,
      otpLength: config.otp_length || 6,
      otpExpiryMinutes: config.otp_expiry_minutes || 5,
      dailyLimitPerUser: config.daily_limit_per_user || 10,
      isConfigured: !!config.provider && !!config.credentials,
    };
  }

  private transformTemplate(t: any): any {
    return {
      id: t.id,
      type: t.type,
      name: t.name,
      body: t.body,
      variables: typeof t.variables === 'string' ? JSON.parse(t.variables) : t.variables,
      isActive: t.is_active,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    };
  }

  private transformLog(log: any): any {
    return {
      id: log.id,
      phoneNumber: log.phone_number,
      templateType: log.template_type,
      message: log.message,
      status: log.status,
      providerMessageId: log.provider_message_id,
      errorMessage: log.error_message,
      sentAt: log.sent_at,
      deliveredAt: log.delivered_at,
      createdAt: log.created_at,
    };
  }
}

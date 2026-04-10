import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  EmailTemplateType,
  EmailLogStatus,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  SendEmailDto,
  SendBulkEmailDto,
  GetEmailLogsDto,
} from './dto/email-template.dto';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  /**
   * Get all email templates
   */
  async getTemplates(includeInactive: boolean = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
      .select('*');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const templates = await query.orderBy('type', 'ASC').get();
    return (templates || []).map(this.transformTemplate);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<any> {
    const templates = await /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
      .select('*')
      .where('id', templateId)
      .get();

    if (!templates || templates.length === 0) {
      throw new NotFoundException('Email template not found');
    }

    return this.transformTemplate(templates[0]);
  }

  /**
   * Get template by type
   */
  async getTemplateByType(type: EmailTemplateType): Promise<any | null> {
    const templates = await /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
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
   * Create email template
   */
  async createTemplate(dto: CreateEmailTemplateDto): Promise<any> {
    // Check if template type already exists
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
      .select('id')
      .where('type', dto.type)
      .get();

    if (existing && existing.length > 0) {
      throw new BadRequestException(`Template for type '${dto.type}' already exists`);
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
      .insert({
        type: dto.type,
        name: dto.name,
        subject: dto.subject,
        html_body: dto.htmlBody,
        text_body: dto.textBody || this.stripHtml(dto.htmlBody),
        variables: JSON.stringify(dto.variables || this.extractVariables(dto.htmlBody)),
        description: dto.description || null,
        is_active: dto.isActive !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformTemplate(result[0]);
  }

  /**
   * Update email template
   */
  async updateTemplate(templateId: string, dto: UpdateEmailTemplateDto): Promise<any> {
    await this.getTemplate(templateId); // Verify exists

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.subject !== undefined) updateData.subject = dto.subject;
    if (dto.htmlBody !== undefined) {
      updateData.html_body = dto.htmlBody;
      if (!dto.textBody) {
        updateData.text_body = this.stripHtml(dto.htmlBody);
      }
      if (!dto.variables) {
        updateData.variables = JSON.stringify(this.extractVariables(dto.htmlBody));
      }
    }
    if (dto.textBody !== undefined) updateData.text_body = dto.textBody;
    if (dto.variables !== undefined) updateData.variables = JSON.stringify(dto.variables);
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
      .where('id', templateId)
      .update(updateData)
      .execute();

    return this.getTemplate(templateId);
  }

  /**
   * Delete email template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.getTemplate(templateId); // Verify exists

    await /* TODO: replace client call */ this.db.client.query
      .from('email_templates')
      .where('id', templateId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // EMAIL SENDING
  // ============================================

  /**
   * Send email using template
   */
  async sendEmail(dto: SendEmailDto): Promise<any> {
    const template = await this.getTemplateByType(dto.templateType);

    if (!template) {
      // Use default template from database
      return this.sendDefaultEmail(dto);
    }

    // Compile template with variables
    const subject = dto.subjectOverride || this.compileTemplate(template.subject, dto.variables || {});
    const htmlBody = this.compileTemplate(template.htmlBody, dto.variables || {});
    const textBody = template.textBody
      ? this.compileTemplate(template.textBody, dto.variables || {})
      : this.stripHtml(htmlBody);

    // Create email log
    const log = await this.createEmailLog({
      templateType: dto.templateType,
      recipientEmail: dto.to,
      subject,
      htmlBody,
      textBody,
      variables: dto.variables || {},
    });

    try {
      // Send via database email service
      await /* TODO: replace client call */ this.db.client.email.send(
        dto.to,
        subject,
        htmlBody,
        {
          cc: dto.cc,
          bcc: dto.bcc,
          replyTo: dto.replyTo,
          trackOpens: true,
          trackClicks: true,
        },
      );

      // Update log as sent
      await this.updateEmailLog(log.id, EmailLogStatus.SENT);

      return {
        success: true,
        emailId: log.id,
        message: 'Email sent successfully',
      };
    } catch (error) {
      // Update log as failed
      await this.updateEmailLog(log.id, EmailLogStatus.FAILED, error.message);

      this.logger.error(`Failed to send email: ${error.message}`);
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmail(dto: SendBulkEmailDto): Promise<any> {
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

        await this.sendEmail({
          to: recipient,
          templateType: dto.templateType,
          variables,
        });

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: recipient,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Preview email without sending
   */
  async previewEmail(templateType: EmailTemplateType, variables: Record<string, any> = {}): Promise<any> {
    const template = await this.getTemplateByType(templateType);

    if (!template) {
      throw new NotFoundException(`Template for type '${templateType}' not found`);
    }

    // Use sample data if no variables provided
    const sampleVariables = this.getSampleVariables(templateType, variables);

    return {
      subject: this.compileTemplate(template.subject, sampleVariables),
      htmlBody: this.compileTemplate(template.htmlBody, sampleVariables),
      textBody: template.textBody
        ? this.compileTemplate(template.textBody, sampleVariables)
        : null,
      variables: template.variables,
    };
  }

  // ============================================
  // EMAIL LOGS
  // ============================================

  /**
   * Get email logs
   */
  async getEmailLogs(dto: GetEmailLogsDto): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('email_logs')
      .select('*');

    if (dto.templateType) {
      query = query.where('template_type', dto.templateType);
    }

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.recipientEmail) {
      query = query.where('recipient_email', dto.recipientEmail);
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
   * Get email stats
   */
  async getEmailStats(startDate?: string, endDate?: string): Promise<any> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('email_logs')
      .select('*');

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }

    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const logs = await query.get();
    const all = logs || [];

    const totalSent = all.filter((l: any) => l.status !== EmailLogStatus.PENDING).length;
    const delivered = all.filter((l: any) => l.status === EmailLogStatus.SENT || l.status === EmailLogStatus.OPENED || l.status === EmailLogStatus.CLICKED).length;
    const failed = all.filter((l: any) => l.status === EmailLogStatus.FAILED).length;
    const bounced = all.filter((l: any) => l.status === EmailLogStatus.BOUNCED).length;
    const opened = all.filter((l: any) => l.status === EmailLogStatus.OPENED || l.status === EmailLogStatus.CLICKED).length;
    const clicked = all.filter((l: any) => l.status === EmailLogStatus.CLICKED).length;

    return {
      totalSent,
      delivered,
      failed,
      bounced,
      opened,
      clicked,
      openRate: totalSent > 0 ? ((opened / totalSent) * 100).toFixed(2) + '%' : '0%',
      clickRate: totalSent > 0 ? ((clicked / totalSent) * 100).toFixed(2) + '%' : '0%',
      bounceRate: totalSent > 0 ? ((bounced / totalSent) * 100).toFixed(2) + '%' : '0%',
    };
  }

  /**
   * Track email open (webhook handler)
   */
  async trackEmailOpen(emailId: string): Promise<void> {
    await this.updateEmailLog(emailId, EmailLogStatus.OPENED);
    await /* TODO: replace client call */ this.db.client.query
      .from('email_logs')
      .where('id', emailId)
      .update({
        opened_at: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Track email click (webhook handler)
   */
  async trackEmailClick(emailId: string): Promise<void> {
    await this.updateEmailLog(emailId, EmailLogStatus.CLICKED);
    await /* TODO: replace client call */ this.db.client.query
      .from('email_logs')
      .where('id', emailId)
      .update({
        clicked_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // DEFAULT TEMPLATES
  // ============================================

  /**
   * Initialize default templates
   */
  async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = this.getDefaultTemplates();

    for (const template of defaultTemplates) {
      const existing = await this.getTemplateByType(template.type);
      if (!existing) {
        await this.createTemplate(template);
        this.logger.log(`Created default template: ${template.type}`);
      }
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private async sendDefaultEmail(dto: SendEmailDto): Promise<any> {
    // Fallback to database default email
    const subject = dto.subjectOverride || this.getDefaultSubject(dto.templateType);
    const htmlBody = this.getDefaultHtmlBody(dto.templateType, dto.variables || {});

    const log = await this.createEmailLog({
      templateType: dto.templateType,
      recipientEmail: dto.to,
      subject,
      htmlBody,
      textBody: this.stripHtml(htmlBody),
      variables: dto.variables || {},
    });

    try {
      await /* TODO: replace client call */ this.db.client.email.send(dto.to, subject, htmlBody);
      await this.updateEmailLog(log.id, EmailLogStatus.SENT);
      return { success: true, emailId: log.id };
    } catch (error) {
      await this.updateEmailLog(log.id, EmailLogStatus.FAILED, error.message);
      throw error;
    }
  }

  private async createEmailLog(data: {
    templateType: EmailTemplateType;
    recipientEmail: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: Record<string, any>;
  }): Promise<any> {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('email_logs')
      .insert({
        template_type: data.templateType,
        recipient_email: data.recipientEmail,
        subject: data.subject,
        html_body: data.htmlBody,
        text_body: data.textBody,
        variables: JSON.stringify(data.variables),
        status: EmailLogStatus.PENDING,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformLog(result[0]);
  }

  private async updateEmailLog(logId: string, status: EmailLogStatus, errorMessage?: string): Promise<void> {
    const updateData: any = {
      status,
    };

    if (status === EmailLogStatus.SENT) {
      updateData.sent_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('email_logs')
      .where('id', logId)
      .update(updateData)
      .execute();
  }

  private compileTemplate(template: string, variables: Record<string, any>): string {
    let compiled = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiled = compiled.replace(regex, String(value ?? ''));
    }

    // Remove any remaining unmatched variables
    compiled = compiled.replace(/{{[^}]+}}/g, '');

    return compiled;
  }

  private extractVariables(template: string): string[] {
    const matches = template.match(/{{([^}]+)}}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))];
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getSampleVariables(type: EmailTemplateType, provided: Record<string, any>): Record<string, any> {
    const defaults: Record<string, any> = {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      orderId: 'ORD-12345',
      orderTotal: '$99.99',
      orderDate: new Date().toLocaleDateString(),
      shopName: 'Sample Shop',
      productName: 'Sample Product',
      amount: '$50.00',
      points: '500',
      tier: 'Gold',
      referralCode: 'REF123',
      verificationLink: 'https://example.com/verify',
      resetLink: 'https://example.com/reset',
      trackingNumber: 'TRK123456',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    return { ...defaults, ...provided };
  }

  private getDefaultSubject(type: EmailTemplateType): string {
    const subjects: Record<EmailTemplateType, string> = {
      [EmailTemplateType.WELCOME]: 'Welcome to our platform!',
      [EmailTemplateType.EMAIL_VERIFICATION]: 'Verify your email address',
      [EmailTemplateType.PASSWORD_RESET]: 'Reset your password',
      [EmailTemplateType.PASSWORD_CHANGED]: 'Your password has been changed',
      [EmailTemplateType.TWO_FACTOR_CODE]: 'Your verification code',
      [EmailTemplateType.ORDER_PLACED]: 'Order Confirmation',
      [EmailTemplateType.ORDER_CONFIRMED]: 'Your order has been confirmed',
      [EmailTemplateType.ORDER_PROCESSING]: 'Your order is being processed',
      [EmailTemplateType.ORDER_SHIPPED]: 'Your order has been shipped',
      [EmailTemplateType.ORDER_DELIVERED]: 'Your order has been delivered',
      [EmailTemplateType.ORDER_CANCELLED]: 'Your order has been cancelled',
      [EmailTemplateType.ORDER_REFUND_INITIATED]: 'Refund initiated for your order',
      [EmailTemplateType.ORDER_REFUND_COMPLETED]: 'Refund completed',
      [EmailTemplateType.PAYMENT_RECEIVED]: 'Payment received',
      [EmailTemplateType.PAYMENT_FAILED]: 'Payment failed',
      [EmailTemplateType.PAYMENT_REFUNDED]: 'Payment refunded',
      [EmailTemplateType.WALLET_CREDITED]: 'Wallet credited',
      [EmailTemplateType.WALLET_DEBITED]: 'Wallet debited',
      [EmailTemplateType.WALLET_TRANSFER_SENT]: 'Transfer sent',
      [EmailTemplateType.WALLET_TRANSFER_RECEIVED]: 'Transfer received',
      [EmailTemplateType.LOYALTY_POINTS_EARNED]: 'Points earned!',
      [EmailTemplateType.LOYALTY_POINTS_REDEEMED]: 'Points redeemed',
      [EmailTemplateType.LOYALTY_TIER_UPGRADE]: 'Congratulations on your tier upgrade!',
      [EmailTemplateType.REFERRAL_SIGNUP]: 'Someone used your referral code!',
      [EmailTemplateType.REFERRAL_REWARD]: 'You earned a referral reward!',
      [EmailTemplateType.VENDOR_WELCOME]: 'Welcome to our vendor platform',
      [EmailTemplateType.VENDOR_SHOP_APPROVED]: 'Your shop has been approved',
      [EmailTemplateType.VENDOR_SHOP_REJECTED]: 'Shop application update',
      [EmailTemplateType.VENDOR_NEW_ORDER]: 'New order received',
      [EmailTemplateType.VENDOR_ORDER_REVIEW]: 'New review on your product',
      [EmailTemplateType.VENDOR_PAYOUT_INITIATED]: 'Payout initiated',
      [EmailTemplateType.VENDOR_PAYOUT_COMPLETED]: 'Payout completed',
      [EmailTemplateType.VENDOR_SUBSCRIPTION_EXPIRING]: 'Your subscription is expiring soon',
      [EmailTemplateType.VENDOR_SUBSCRIPTION_EXPIRED]: 'Your subscription has expired',
      [EmailTemplateType.SUBSCRIPTION_ACTIVATED]: 'Subscription activated',
      [EmailTemplateType.SUBSCRIPTION_RENEWED]: 'Subscription renewed',
      [EmailTemplateType.SUBSCRIPTION_CANCELLED]: 'Subscription cancelled',
      [EmailTemplateType.SUBSCRIPTION_PAYMENT_FAILED]: 'Subscription payment failed',
      [EmailTemplateType.PROMO_CAMPAIGN]: 'Special offer for you!',
      [EmailTemplateType.FLASH_SALE_ALERT]: 'Flash sale is live!',
      [EmailTemplateType.WISHLIST_PRICE_DROP]: 'Price drop alert!',
      [EmailTemplateType.BACK_IN_STOCK]: 'Back in stock!',
      [EmailTemplateType.ABANDONED_CART]: 'You left something behind',
      [EmailTemplateType.REVIEW_REQUEST]: 'How was your order?',
      [EmailTemplateType.REVIEW_RESPONSE]: 'Response to your review',
      [EmailTemplateType.NEWSLETTER]: 'Newsletter',
      [EmailTemplateType.CUSTOM]: 'Message',
    };

    return subjects[type] || 'Notification';
  }

  private getDefaultHtmlBody(type: EmailTemplateType, variables: Record<string, any>): string {
    const name = variables.userName || 'Customer';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hello ${name},</h1>
        <p>This is a notification regarding: ${type.replace(/_/g, ' ')}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;
  }

  private getDefaultTemplates(): CreateEmailTemplateDto[] {
    return [
      {
        type: EmailTemplateType.WELCOME,
        name: 'Welcome Email',
        subject: 'Welcome to {{appName}}!',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Welcome, {{userName}}!</h1>
            <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
            <p>Start exploring our amazing products and enjoy exclusive member benefits.</p>
            <a href="{{shopUrl}}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">Start Shopping</a>
            <p style="margin-top: 24px; color: #666;">Best regards,<br>The {{appName}} Team</p>
          </div>
        `,
        variables: ['userName', 'appName', 'shopUrl'],
        description: 'Sent when a new user registers',
      },
      {
        type: EmailTemplateType.ORDER_PLACED,
        name: 'Order Confirmation',
        subject: 'Order Confirmed - #{{orderId}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Order Confirmed!</h1>
            <p>Hi {{userName}},</p>
            <p>Thank you for your order. Here are the details:</p>
            <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Order ID:</strong> {{orderId}}</p>
              <p><strong>Order Date:</strong> {{orderDate}}</p>
              <p><strong>Total:</strong> {{orderTotal}}</p>
            </div>
            <p>We'll send you another email when your order ships.</p>
            <a href="{{trackingUrl}}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Track Order</a>
          </div>
        `,
        variables: ['userName', 'orderId', 'orderDate', 'orderTotal', 'trackingUrl'],
        description: 'Sent when an order is placed',
      },
      {
        type: EmailTemplateType.PASSWORD_RESET,
        name: 'Password Reset',
        subject: 'Reset Your Password',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333;">Password Reset Request</h1>
            <p>Hi {{userName}},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="{{resetLink}}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
        variables: ['userName', 'resetLink'],
        description: 'Sent when user requests password reset',
      },
    ];
  }

  private transformTemplate(template: any): any {
    return {
      id: template.id,
      type: template.type,
      name: template.name,
      subject: template.subject,
      htmlBody: template.html_body,
      textBody: template.text_body,
      variables: typeof template.variables === 'string' ? JSON.parse(template.variables) : template.variables,
      description: template.description,
      isActive: template.is_active,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    };
  }

  private transformLog(log: any): any {
    return {
      id: log.id,
      templateType: log.template_type,
      recipientEmail: log.recipient_email,
      subject: log.subject,
      status: log.status,
      sentAt: log.sent_at,
      openedAt: log.opened_at,
      clickedAt: log.clicked_at,
      errorMessage: log.error_message,
      createdAt: log.created_at,
    };
  }
}

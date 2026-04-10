import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ContactFormDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  // Default contact emails - can be configured via site settings
  private readonly contactEmails = [
    'support@vasty.shop',
    'patheditor1@gmail.com',
  ];

  constructor(private readonly db: DatabaseService) {}

  /**
   * Subject labels for email display
   */
  private readonly subjectLabels: Record<string, string> = {
    general: 'General Inquiry',
    order: 'Order Support',
    product: 'Product Question',
    partnership: 'Partnership Opportunity',
    other: 'Other',
  };

  /**
   * Send contact form email to business and confirmation to user
   */
  async sendContactEmail(dto: ContactFormDto): Promise<{ success: boolean; message: string }> {
    try {
      const subjectLabel = this.subjectLabels[dto.subject] || 'General Inquiry';
      const emailSubject = `[Vasty Shop Contact] ${subjectLabel} from ${dto.name}`;

      // Build HTML email content for business
      const businessEmailHtml = this.buildBusinessEmailHtml(dto, subjectLabel);

      // Send email to business
      this.logger.log(`Sending contact form email from ${dto.email} - Subject: ${dto.subject}`);

      await /* TODO: replace client call */ this.db.client.email.send(
        this.contactEmails,
        emailSubject,
        businessEmailHtml,
        {
          replyTo: dto.email,
        },
      );

      this.logger.log(`Contact email sent successfully to business addresses`);

      // Send confirmation email to user
      const confirmationEmailHtml = this.buildConfirmationEmailHtml(dto, subjectLabel);

      await /* TODO: replace client call */ this.db.client.email.send(
        dto.email,
        'Thank you for contacting Vasty Shop',
        confirmationEmailHtml,
        {
          replyTo: this.contactEmails[0],
        },
      );

      this.logger.log(`Confirmation email sent to ${dto.email}`);

      return {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.',
      };
    } catch (error) {
      this.logger.error(`Failed to send contact email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Build HTML email for business recipients
   */
  private buildBusinessEmailHtml(dto: ContactFormDto, subjectLabel: string): string {
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #84cc16 0%, #22c55e 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        New Contact Form Submission
                      </h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        Vasty Shop - ${subjectLabel}
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <!-- Contact Details Table -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</strong>
                            <p style="margin: 4px 0 0 0; color: #111827; font-size: 16px; font-weight: 500;">${dto.name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
                            <p style="margin: 4px 0 0 0;">
                              <a href="mailto:${dto.email}" style="color: #84cc16; text-decoration: none; font-size: 16px; font-weight: 500;">${dto.email}</a>
                            </p>
                          </td>
                        </tr>
                        ${dto.phone ? `
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</strong>
                            <p style="margin: 4px 0 0 0;">
                              <a href="tel:${dto.phone}" style="color: #84cc16; text-decoration: none; font-size: 16px; font-weight: 500;">${dto.phone}</a>
                            </p>
                          </td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                            <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</strong>
                            <p style="margin: 4px 0 0 0;">
                              <span style="display: inline-block; background-color: #ecfccb; color: #365314; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;">${subjectLabel}</span>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Message -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #84cc16;">
                        <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Message</strong>
                        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${dto.message}</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                        Received on ${timestamp}
                      </p>
                      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                        Reply directly to this email to respond to the customer
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Build HTML confirmation email for user
   */
  private buildConfirmationEmailHtml(dto: ContactFormDto, subjectLabel: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting Vasty Shop</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #84cc16 0%, #22c55e 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                        Thank You for Reaching Out!
                      </h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        We've received your message
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Hi ${dto.name},
                      </p>
                      <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Thank you for contacting Vasty Shop. We've received your inquiry regarding <strong>"${subjectLabel}"</strong> and our team will review it shortly.
                      </p>
                      <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        You can expect a response within <strong>24-48 hours</strong>. If your matter is urgent, please don't hesitate to call our support line.
                      </p>

                      <!-- Summary of Message -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 12px;">Your Message</strong>
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${dto.message.substring(0, 500)}${dto.message.length > 500 ? '...' : ''}</p>
                      </div>

                      <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Best regards,<br>
                        <strong>The Vasty Shop Team</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                        Need immediate assistance?
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Visit our <a href="https://database.shop/faq" style="color: #84cc16; text-decoration: none;">FAQ page</a> or contact us at support@database.com
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Unsubscribe -->
                <p style="margin: 24px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                  This is a transactional email regarding your contact form submission.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}

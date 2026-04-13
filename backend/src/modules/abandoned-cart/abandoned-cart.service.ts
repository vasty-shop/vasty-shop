import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { runAbandonedCartMigration } from './abandoned-cart.migration';
import * as crypto from 'crypto';

/**
 * Represents a record in the abandoned_carts table.
 */
interface AbandonedCartRecord {
  id: string;
  cart_id: string;
  user_id: string;
  cart_total: number;
  items_count: number;
  abandoned_at: string;
  email_sequence_step: number;
  last_email_sent_at: string | null;
  recovered_at: string | null;
  discount_code_used: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Email sequence step timing configuration (in hours after abandonment).
 */
const EMAIL_SEQUENCE_TIMING = {
  1: 1,   // Step 1: 1 hour after abandonment
  2: 24,  // Step 2: 24 hours after abandonment
  3: 72,  // Step 3: 72 hours after abandonment
};

@Injectable()
export class AbandonedCartService implements OnModuleInit {
  private readonly logger = new Logger(AbandonedCartService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  // Configuration
  private readonly enabled: boolean;
  private readonly thresholdHours: number;
  private readonly scanIntervalMinutes: number;
  private readonly discountPercent: number;
  private readonly appUrl: string;
  private readonly hmacSecret: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    this.enabled = this.configService.get('CART_RECOVERY_ENABLED', 'false') === 'true';
    this.thresholdHours = parseFloat(this.configService.get('CART_ABANDONMENT_THRESHOLD_HOURS', '1'));
    this.scanIntervalMinutes = parseInt(this.configService.get('CART_RECOVERY_SCAN_INTERVAL_MINUTES', '15'), 10);
    this.discountPercent = parseFloat(this.configService.get('CART_RECOVERY_DISCOUNT_PERCENT', '0'));
    this.appUrl = this.configService.get('APP_URL', 'http://localhost:3000');
    this.hmacSecret = this.configService.get('CART_RECOVERY_HMAC_SECRET', 'vasty-cart-recovery-secret');
  }

  async onModuleInit(): Promise<void> {
    // Run migration to ensure table exists
    try {
      await runAbandonedCartMigration(this.db);
    } catch (error) {
      this.logger.error('Failed to run abandoned cart migration', error.message);
    }

    if (!this.enabled) {
      this.logger.log('Abandoned cart recovery is DISABLED. Set CART_RECOVERY_ENABLED=true to enable.');
      return;
    }

    this.logger.log(
      `Abandoned cart recovery ENABLED - threshold: ${this.thresholdHours}h, scan interval: ${this.scanIntervalMinutes}m, discount: ${this.discountPercent}%`,
    );

    // Start the scan interval
    this.intervalHandle = setInterval(
      () => this.scanForAbandonedCarts(),
      this.scanIntervalMinutes * 60 * 1000,
    );

    // Run an initial scan after a short delay to let the app fully initialize
    setTimeout(() => this.scanForAbandonedCarts(), 10_000);
  }

  /**
   * Main scan: find abandoned carts and process email sequences.
   */
  async scanForAbandonedCarts(): Promise<void> {
    try {
      this.logger.debug('Scanning for abandoned carts...');

      // Step A: Detect newly abandoned carts (inactive > threshold, not yet tracked)
      await this.detectNewAbandonments();

      // Step B: Process email sequence for existing abandoned cart records
      await this.processEmailSequence();

      // Step C: Detect recovered carts (user completed checkout)
      await this.detectRecoveries();
    } catch (error) {
      this.logger.error('Error during abandoned cart scan', error.message);
    }
  }

  // ============================================
  // DETECTION
  // ============================================

  /**
   * Find carts that have been inactive longer than the threshold
   * and are not yet tracked in abandoned_carts.
   */
  private async detectNewAbandonments(): Promise<void> {
    const thresholdDate = new Date(
      Date.now() - this.thresholdHours * 60 * 60 * 1000,
    ).toISOString();

    // Find carts with items, belonging to a user, updated before threshold
    const result = await this.db.execute(
      `SELECT c.*
       FROM "carts" c
       LEFT JOIN "abandoned_carts" ac ON ac."cart_id" = c."id" AND ac."recovered_at" IS NULL
       WHERE c."userId" IS NOT NULL
         AND c."updatedAt" < $1
         AND jsonb_array_length(COALESCE(c."items"::jsonb, '[]'::jsonb)) > 0
         AND ac."id" IS NULL`,
      [thresholdDate],
    );

    const carts = result.rows || [];
    if (carts.length === 0) {
      this.logger.debug('No new abandoned carts detected');
      return;
    }

    this.logger.log(`Detected ${carts.length} newly abandoned cart(s)`);

    for (const cart of carts) {
      try {
        // Verify user has an email
        const user = await this.db.getUserById(cart.userId);
        if (!user || !user.email) {
          this.logger.debug(`Skipping cart ${cart.id}: user has no email`);
          continue;
        }

        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        const itemsCount = items.length;
        const cartTotal = parseFloat(cart.total) || 0;

        await this.db.insert('abandoned_carts', {
          cart_id: cart.id,
          user_id: cart.userId,
          cart_total: cartTotal,
          items_count: itemsCount,
          abandoned_at: cart.updatedAt || new Date().toISOString(),
          email_sequence_step: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        this.logger.log(
          `Tracked abandoned cart: cartId=${cart.id}, userId=${cart.userId}, total=${cartTotal}`,
        );
      } catch (error) {
        this.logger.error(`Failed to track abandoned cart ${cart.id}`, error.message);
      }
    }
  }

  /**
   * Detect carts that have been recovered (user completed checkout).
   * A cart is considered recovered if it now has 0 items or an order
   * was placed after the abandonment was tracked.
   */
  private async detectRecoveries(): Promise<void> {
    // Get unrecovered abandoned carts
    const result = await this.db.execute(
      `SELECT ac.*, c."items", c."updatedAt" as "cart_updated_at"
       FROM "abandoned_carts" ac
       JOIN "carts" c ON c."id" = ac."cart_id"
       WHERE ac."recovered_at" IS NULL`,
    );

    const records = result.rows || [];

    for (const record of records) {
      try {
        const items = typeof record.items === 'string'
          ? JSON.parse(record.items)
          : (record.items || []);

        // If cart is now empty, user likely completed checkout
        if (items.length === 0) {
          await this.db.update('abandoned_carts', record.id, {
            recovered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          this.logger.log(`Cart recovered: abandonedCartId=${record.id}, cartId=${record.cart_id}`);
        }

        // Also check if cart was updated after last email (user came back)
        if (
          items.length === 0 ||
          (record.cart_updated_at &&
            record.last_email_sent_at &&
            new Date(record.cart_updated_at) > new Date(record.last_email_sent_at) &&
            items.length === 0)
        ) {
          // Already handled above
        }
      } catch (error) {
        this.logger.error(`Failed to check recovery for ${record.id}`, error.message);
      }
    }
  }

  // ============================================
  // EMAIL SEQUENCE
  // ============================================

  /**
   * Process email drip sequence for all tracked abandoned carts.
   */
  private async processEmailSequence(): Promise<void> {
    // Get unrecovered abandoned carts that haven't completed the full sequence
    const result = await this.db.execute(
      `SELECT ac.*
       FROM "abandoned_carts" ac
       WHERE ac."recovered_at" IS NULL
         AND ac."email_sequence_step" < 3`,
    );

    const records: AbandonedCartRecord[] = result.rows || [];
    if (records.length === 0) {
      return;
    }

    const now = Date.now();

    for (const record of records) {
      try {
        const nextStep = record.email_sequence_step + 1;
        const hoursRequired = EMAIL_SEQUENCE_TIMING[nextStep as keyof typeof EMAIL_SEQUENCE_TIMING];
        if (!hoursRequired) continue;

        const abandonedAt = new Date(record.abandoned_at).getTime();
        const hoursElapsed = (now - abandonedAt) / (1000 * 60 * 60);

        if (hoursElapsed < hoursRequired) {
          continue; // Not time yet for the next email
        }

        // Get user info for the email
        const user = await this.db.getUserById(record.user_id);
        if (!user || !user.email) {
          this.logger.debug(`Skipping email for abandoned cart ${record.id}: no user email`);
          continue;
        }

        // Get current cart to include item details
        const cart = await this.db.findOne('carts', { id: record.cart_id });
        if (!cart) {
          this.logger.debug(`Skipping email for abandoned cart ${record.id}: cart no longer exists`);
          continue;
        }

        const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : (cart.items || []);
        if (items.length === 0) {
          // Cart was emptied, mark as recovered
          await this.db.update('abandoned_carts', record.id, {
            recovered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          continue;
        }

        // Generate recovery link
        const recoveryLink = this.generateRecoveryLink(record.cart_id, record.user_id);

        // Determine discount for this step
        const includeDiscount = nextStep >= 2 && this.discountPercent > 0;
        const discountCode = includeDiscount ? this.generateDiscountCode(record.cart_id) : null;

        // Send the email
        await this.sendRecoveryEmail(
          nextStep,
          user.email,
          user.name || 'Valued Customer',
          items,
          parseFloat(String(record.cart_total)),
          recoveryLink,
          includeDiscount ? this.discountPercent : 0,
          discountCode,
        );

        // Update the record
        await this.db.update('abandoned_carts', record.id, {
          email_sequence_step: nextStep,
          last_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        this.logger.log(
          `Sent recovery email step ${nextStep} for cart ${record.cart_id} to ${user.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process email for abandoned cart ${record.id}`,
          error.message,
        );
      }
    }
  }

  /**
   * Send a recovery email for the given step.
   */
  private async sendRecoveryEmail(
    step: number,
    toEmail: string,
    userName: string,
    items: any[],
    cartTotal: number,
    recoveryLink: string,
    discountPercent: number,
    discountCode: string | null,
  ): Promise<void> {
    const { subject, html } = this.buildEmailContent(
      step,
      userName,
      items,
      cartTotal,
      recoveryLink,
      discountPercent,
      discountCode,
    );

    try {
      await this.db.sendEmail(toEmail, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send recovery email to ${toEmail}`, error.message);
      throw error;
    }
  }

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  private buildEmailContent(
    step: number,
    userName: string,
    items: any[],
    cartTotal: number,
    recoveryLink: string,
    discountPercent: number,
    discountCode: string | null,
  ): { subject: string; html: string } {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;" />` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br/>
            <span style="color: #666;">Qty: ${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>`,
      )
      .join('');

    const cartSummary = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 8px 12px; text-align: left; width: 80px;"></th>
            <th style="padding: 8px 12px; text-align: left;">Item</th>
            <th style="padding: 8px 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 12px; text-align: right; font-weight: bold;">$${cartTotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const discountSection =
      discountPercent > 0 && discountCode
        ? `
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #856404;">Special offer: ${discountPercent}% off your order!</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #333;">${discountCode}</p>
        </div>`
        : '';

    const ctaButton = `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${recoveryLink}" style="display: inline-block; background: #007bff; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Complete Your Purchase
        </a>
      </div>
    `;

    switch (step) {
      case 1:
        return {
          subject: 'You left items in your cart',
          html: this.wrapEmailTemplate(`
            <h1 style="color: #333; margin-bottom: 8px;">Hi ${userName},</h1>
            <p style="color: #555; font-size: 16px;">
              It looks like you left some items in your cart. No worries — they are still waiting for you!
            </p>
            ${cartSummary}
            ${ctaButton}
            <p style="color: #888; font-size: 13px; text-align: center;">
              If you have any questions, just reply to this email.
            </p>
          `),
        };

      case 2:
        return {
          subject: 'Still interested? Your cart is waiting',
          html: this.wrapEmailTemplate(`
            <h1 style="color: #333; margin-bottom: 8px;">Hi ${userName},</h1>
            <p style="color: #555; font-size: 16px;">
              We noticed you haven't completed your purchase yet. Your items are still available!
            </p>
            ${cartSummary}
            ${discountSection}
            ${ctaButton}
            <p style="color: #888; font-size: 13px; text-align: center;">
              Need help? Reply to this email and we'll assist you.
            </p>
          `),
        };

      case 3:
        return {
          subject: 'Last chance — your cart is about to expire',
          html: this.wrapEmailTemplate(`
            <h1 style="color: #333; margin-bottom: 8px;">Hi ${userName},</h1>
            <p style="color: #555; font-size: 16px;">
              This is your last reminder! The items in your cart may not be available much longer.
              Don't miss out on what you picked.
            </p>
            ${cartSummary}
            ${discountSection}
            ${ctaButton}
            <p style="color: #d9534f; font-size: 14px; text-align: center; font-weight: bold;">
              Items are subject to availability and prices may change.
            </p>
            <p style="color: #888; font-size: 13px; text-align: center;">
              If you no longer wish to receive these reminders, simply ignore this email.
            </p>
          `),
        };

      default:
        return { subject: 'Your cart reminder', html: '' };
    }
  }

  private wrapEmailTemplate(body: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin: 0; padding: 0; background: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 24px; margin-bottom: 24px;">
          <div style="background: #007bff; padding: 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Vasty Shop</h2>
          </div>
          <div style="padding: 32px 24px;">
            ${body}
          </div>
          <div style="background: #f8f9fa; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
            <p>You are receiving this email because you have items in your cart.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================
  // RECOVERY LINK
  // ============================================

  /**
   * Generate a signed recovery URL.
   * Format: {appUrl}/cart/recover?cartId=...&userId=...&expires=...&sig=...
   */
  generateRecoveryLink(cartId: string, userId: string): string {
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    const payload = `${cartId}:${userId}:${expires}`;
    const sig = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    return `${this.appUrl}/cart/recover?cartId=${encodeURIComponent(cartId)}&userId=${encodeURIComponent(userId)}&expires=${expires}&sig=${sig}`;
  }

  /**
   * Verify a recovery link signature.
   */
  verifyRecoveryLink(cartId: string, userId: string, expires: number, sig: string): boolean {
    if (Date.now() > expires) {
      return false;
    }

    const payload = `${cartId}:${userId}:${expires}`;
    const expectedSig = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expectedSig, 'hex'),
    );
  }

  // ============================================
  // DISCOUNT CODE
  // ============================================

  /**
   * Generate a deterministic discount code for a cart.
   */
  private generateDiscountCode(cartId: string): string {
    const hash = crypto
      .createHash('md5')
      .update(`${cartId}-recovery`)
      .digest('hex')
      .substring(0, 6)
      .toUpperCase();
    return `COMEBACK-${hash}`;
  }

  // ============================================
  // ADMIN ANALYTICS
  // ============================================

  /**
   * Get abandoned cart analytics for the admin dashboard.
   */
  async getAnalytics(): Promise<{
    totalAbandoned: number;
    totalRecovered: number;
    recoveryRate: string;
    revenueAbandoned: number;
    revenueRecovered: number;
    emailsSent: number;
    byStep: { step: number; count: number }[];
    recent: any[];
  }> {
    // Total counts
    const totalResult = await this.db.execute(
      `SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN "recovered_at" IS NOT NULL THEN 1 END) AS recovered,
        COALESCE(SUM("cart_total"), 0) AS total_value,
        COALESCE(SUM(CASE WHEN "recovered_at" IS NOT NULL THEN "cart_total" ELSE 0 END), 0) AS recovered_value,
        COALESCE(SUM("email_sequence_step"), 0) AS total_emails
      FROM "abandoned_carts"`,
    );

    const stats = totalResult.rows[0] || {};
    const total = parseInt(stats.total || '0', 10);
    const recovered = parseInt(stats.recovered || '0', 10);
    const rate = total > 0 ? ((recovered / total) * 100).toFixed(2) : '0.00';

    // By step
    const stepResult = await this.db.execute(
      `SELECT "email_sequence_step" AS step, COUNT(*) AS count
       FROM "abandoned_carts"
       WHERE "recovered_at" IS NULL
       GROUP BY "email_sequence_step"
       ORDER BY "email_sequence_step"`,
    );

    const byStep = (stepResult.rows || []).map((r: any) => ({
      step: parseInt(r.step, 10),
      count: parseInt(r.count, 10),
    }));

    // Recent abandoned carts
    const recentResult = await this.db.execute(
      `SELECT ac.*, u."email" AS user_email, u."name" AS user_name
       FROM "abandoned_carts" ac
       LEFT JOIN "users" u ON u."id"::text = ac."user_id"
       ORDER BY ac."created_at" DESC
       LIMIT 20`,
    );

    const recent = (recentResult.rows || []).map((r: any) => ({
      id: r.id,
      cartId: r.cart_id,
      userId: r.user_id,
      userEmail: r.user_email,
      userName: r.user_name,
      cartTotal: parseFloat(r.cart_total),
      itemsCount: r.items_count,
      abandonedAt: r.abandoned_at,
      emailSequenceStep: r.email_sequence_step,
      lastEmailSentAt: r.last_email_sent_at,
      recoveredAt: r.recovered_at,
      discountCodeUsed: r.discount_code_used,
      createdAt: r.created_at,
    }));

    return {
      totalAbandoned: total,
      totalRecovered: recovered,
      recoveryRate: `${rate}%`,
      revenueAbandoned: parseFloat(stats.total_value || '0'),
      revenueRecovered: parseFloat(stats.recovered_value || '0'),
      emailsSent: parseInt(stats.total_emails || '0', 10),
      byStep,
      recent,
    };
  }

  /**
   * Mark an abandoned cart as recovered (called externally, e.g., on checkout).
   */
  async markAsRecovered(cartId: string, discountCode?: string): Promise<void> {
    const record = await this.db.findOne('abandoned_carts', {
      cart_id: cartId,
    });

    if (record && !record.recovered_at) {
      await this.db.update('abandoned_carts', record.id, {
        recovered_at: new Date().toISOString(),
        discount_code_used: discountCode || null,
        updated_at: new Date().toISOString(),
      });

      this.logger.log(`Cart marked as recovered: cartId=${cartId}`);
    }
  }
}

import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionStatus, SubscriptionInterval } from '../../database/types';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto, CreateSubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ============================================

  /**
   * Vendor creates a subscription plan
   */
  async createSubscriptionPlan(vendorId: string, dto: CreateSubscriptionPlanDto) {
    const now = new Date().toISOString();

    const planData = {
      vendor_id: vendorId,
      product_id: dto.productId || null,
      name: dto.name,
      description: dto.description || null,
      price: dto.price,
      currency: (dto.currency || 'USD').toUpperCase(),
      interval: dto.interval,
      trial_days: dto.trialDays ?? 0,
      subscription_discount_percent: dto.subscriptionDiscountPercent ?? 0,
      is_active: dto.isActive !== false,
      stripe_price_id: null,
      created_at: now,
      updated_at: now,
    };

    const plan = await this.db.insert('product_subscription_plans', planData);
    this.logger.log(`Subscription plan created: ${plan.id} for vendor ${vendorId}`);
    return this.transformPlan(plan);
  }

  /**
   * List plans (public, filterable)
   */
  async listPlans(filters: { vendorId?: string; productId?: string; isActive?: boolean } = {}) {
    const conditions: Record<string, any> = {};
    if (filters.vendorId) conditions.vendor_id = filters.vendorId;
    if (filters.productId) conditions.product_id = filters.productId;
    if (filters.isActive !== undefined) conditions.is_active = filters.isActive;

    const plans = await this.db.findMany('product_subscription_plans', conditions, { orderBy: 'created_at', order: 'desc' });
    return (plans || []).map((p: any) => this.transformPlan(p));
  }

  /**
   * Get single plan by ID
   */
  async getPlan(planId: string) {
    const plan = await this.db.findOne('product_subscription_plans', { id: planId });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return this.transformPlan(plan);
  }

  /**
   * Vendor updates a plan
   */
  async updatePlan(vendorId: string, planId: string, dto: UpdateSubscriptionPlanDto) {
    const plan = await this.db.findOne('product_subscription_plans', { id: planId });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    if (plan.vendor_id !== vendorId) throw new ForbiddenException('You do not own this plan');

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.currency !== undefined) updateData.currency = dto.currency.toUpperCase();
    if (dto.interval !== undefined) updateData.interval = dto.interval;
    if (dto.trialDays !== undefined) updateData.trial_days = dto.trialDays;
    if (dto.subscriptionDiscountPercent !== undefined) updateData.subscription_discount_percent = dto.subscriptionDiscountPercent;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const updated = await this.db.update('product_subscription_plans', planId, updateData);
    return this.transformPlan(updated);
  }

  // ============================================
  // SUBSCRIPTION LIFECYCLE
  // ============================================

  /**
   * Customer subscribes to a plan
   */
  async subscribe(userId: string, dto: CreateSubscriptionDto) {
    const plan = await this.db.findOne('product_subscription_plans', { id: dto.planId });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    if (!plan.is_active) throw new BadRequestException('This plan is not currently available');

    const now = new Date();
    const trialDays = plan.trial_days || 0;
    const hasTrialPeriod = trialDays > 0;

    const periodEnd = this.calculatePeriodEnd(now, plan.interval);
    const trialEnd = hasTrialPeriod ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    const nextBillingDate = hasTrialPeriod ? trialEnd : periodEnd;

    // Calculate effective price with subscribe-and-save discount
    const discountPercent = plan.subscription_discount_percent || 0;
    const effectivePrice = discountPercent > 0
      ? Math.round(plan.price * (1 - discountPercent / 100))
      : plan.price;

    const subscriptionData = {
      user_id: userId,
      plan_id: plan.id,
      vendor_id: plan.vendor_id,
      status: hasTrialPeriod ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      next_billing_date: nextBillingDate!.toISOString(),
      cancel_at: null,
      trial_end: trialEnd ? trialEnd.toISOString() : null,
      payment_method_id: dto.paymentMethodId || null,
      stripe_subscription_id: null, // Hook point: set when Stripe subscription is created
      renewal_count: 0,
      last_payment_at: null,
      last_payment_amount: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const subscription = await this.db.insert('product_subscriptions', subscriptionData);

    this.logger.log(
      `Subscription created: ${subscription.id} (user=${userId}, plan=${plan.id}, status=${subscriptionData.status}, effectivePrice=${effectivePrice})`,
    );

    // HOOK POINT: Stripe recurring billing integration
    // If Stripe is configured and paymentMethodId is provided, create a Stripe Subscription here:
    //   const stripeSubscription = await stripe.subscriptions.create({
    //     customer: stripeCustomerId,
    //     items: [{ price: plan.stripe_price_id }],
    //     trial_period_days: trialDays,
    //     default_payment_method: dto.paymentMethodId,
    //   });
    //   await this.db.update('product_subscriptions', subscription.id, {
    //     stripe_subscription_id: stripeSubscription.id,
    //   });

    return this.transformSubscription(subscription);
  }

  /**
   * Cancel subscription (effective at end of current period)
   */
  async cancelSubscription(userId: string, subscriptionId: string) {
    const sub = await this.getSubscriptionForUser(userId, subscriptionId);

    if (sub.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    const updateData = {
      status: SubscriptionStatus.CANCELING,
      cancel_at: sub.current_period_end,
      updated_at: new Date().toISOString(),
    };

    const updated = await this.db.update('product_subscriptions', subscriptionId, updateData);
    this.logger.log(`Subscription ${subscriptionId} set to cancel at ${sub.current_period_end}`);

    // HOOK POINT: Cancel Stripe subscription at period end
    // if (sub.stripe_subscription_id) {
    //   await stripe.subscriptions.update(sub.stripe_subscription_id, {
    //     cancel_at_period_end: true,
    //   });
    // }

    return this.transformSubscription(updated);
  }

  /**
   * Pause subscription (stop billing, keep subscription)
   */
  async pauseSubscription(userId: string, subscriptionId: string) {
    const sub = await this.getSubscriptionForUser(userId, subscriptionId);

    if (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== 'active') {
      throw new BadRequestException('Only active subscriptions can be paused');
    }

    const updated = await this.db.update('product_subscriptions', subscriptionId, {
      status: SubscriptionStatus.PAUSED,
      updated_at: new Date().toISOString(),
    });

    this.logger.log(`Subscription ${subscriptionId} paused`);

    // HOOK POINT: Pause Stripe subscription
    // if (sub.stripe_subscription_id) {
    //   await stripe.subscriptions.update(sub.stripe_subscription_id, {
    //     pause_collection: { behavior: 'mark_uncollectible' },
    //   });
    // }

    return this.transformSubscription(updated);
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(userId: string, subscriptionId: string) {
    const sub = await this.getSubscriptionForUser(userId, subscriptionId);

    if (sub.status !== SubscriptionStatus.PAUSED && sub.status !== 'paused') {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }

    const now = new Date();
    const plan = await this.db.findOne('product_subscription_plans', { id: sub.plan_id });
    const periodEnd = this.calculatePeriodEnd(now, plan.interval);

    const updated = await this.db.update('product_subscriptions', subscriptionId, {
      status: SubscriptionStatus.ACTIVE,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      next_billing_date: periodEnd.toISOString(),
      updated_at: now.toISOString(),
    });

    this.logger.log(`Subscription ${subscriptionId} resumed`);

    // HOOK POINT: Resume Stripe subscription
    // if (sub.stripe_subscription_id) {
    //   await stripe.subscriptions.update(sub.stripe_subscription_id, {
    //     pause_collection: '',
    //   });
    // }

    return this.transformSubscription(updated);
  }

  // ============================================
  // RENEWAL PROCESSING (CRON)
  // ============================================

  /**
   * Process subscriptions due for renewal.
   * Called daily by the cron job at midnight UTC.
   *
   * For v1, this is a simple implementation:
   *   - Find subscriptions where next_billing_date <= now AND status = 'active'
   *   - For each: attempt charge (stub), advance billing date on success, mark past_due on failure
   *   - Past-due subscriptions get retried up to 3 times over 7 days, then cancelled
   *
   * HOOK POINT: Replace the charge stub with a real call to PaymentService.chargeSubscription()
   * or Stripe's subscription billing when ready.
   */
  async processRenewals(): Promise<{ processed: number; succeeded: number; failed: number; cancelled: number }> {
    const now = new Date();
    const stats = { processed: 0, succeeded: 0, failed: 0, cancelled: 0 };

    // 1. Process active subscriptions due for billing
    const { rows: dueSubs } = await this.db.query(
      `SELECT s.*, sp.price, sp.interval, sp.subscription_discount_percent
       FROM product_subscriptions s
       JOIN product_subscription_plans sp ON s.plan_id = sp.id
       WHERE s.next_billing_date <= $1
         AND s.status = $2`,
      [now.toISOString(), SubscriptionStatus.ACTIVE],
    );

    for (const sub of dueSubs || []) {
      stats.processed++;
      const chargeSuccess = await this.attemptCharge(sub);

      if (chargeSuccess) {
        const nextPeriodEnd = this.calculatePeriodEnd(now, sub.interval);
        await this.db.update('product_subscriptions', sub.id, {
          current_period_start: now.toISOString(),
          current_period_end: nextPeriodEnd.toISOString(),
          next_billing_date: nextPeriodEnd.toISOString(),
          renewal_count: (sub.renewal_count || 0) + 1,
          last_payment_at: now.toISOString(),
          last_payment_amount: this.getEffectivePrice(sub.price, sub.subscription_discount_percent),
          updated_at: now.toISOString(),
        });
        stats.succeeded++;
        this.logger.log(`Renewal succeeded for subscription ${sub.id}`);
      } else {
        await this.db.update('product_subscriptions', sub.id, {
          status: SubscriptionStatus.PAST_DUE,
          updated_at: now.toISOString(),
        });
        stats.failed++;
        this.logger.warn(`Renewal failed for subscription ${sub.id}, marked as past_due`);
      }
    }

    // 2. Handle past-due subscriptions: retry or cancel
    const { rows: pastDueSubs } = await this.db.query(
      `SELECT s.*, sp.price, sp.interval, sp.subscription_discount_percent
       FROM product_subscriptions s
       JOIN product_subscription_plans sp ON s.plan_id = sp.id
       WHERE s.status = $1`,
      [SubscriptionStatus.PAST_DUE],
    );

    for (const sub of pastDueSubs || []) {
      // Cancel if past_due for more than 7 days
      const pastDueSince = new Date(sub.next_billing_date);
      const daysPastDue = (now.getTime() - pastDueSince.getTime()) / (1000 * 60 * 60 * 24);

      if (daysPastDue > 7) {
        await this.db.update('product_subscriptions', sub.id, {
          status: SubscriptionStatus.CANCELLED,
          cancel_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
        stats.cancelled++;
        this.logger.warn(`Subscription ${sub.id} cancelled after 7 days past_due`);
      } else {
        // Retry charge (up to 3 retries implicit via daily cron over 7 days)
        const chargeSuccess = await this.attemptCharge(sub);
        if (chargeSuccess) {
          const nextPeriodEnd = this.calculatePeriodEnd(now, sub.interval);
          await this.db.update('product_subscriptions', sub.id, {
            status: SubscriptionStatus.ACTIVE,
            current_period_start: now.toISOString(),
            current_period_end: nextPeriodEnd.toISOString(),
            next_billing_date: nextPeriodEnd.toISOString(),
            renewal_count: (sub.renewal_count || 0) + 1,
            last_payment_at: now.toISOString(),
            last_payment_amount: this.getEffectivePrice(sub.price, sub.subscription_discount_percent),
            updated_at: now.toISOString(),
          });
          stats.succeeded++;
          this.logger.log(`Past-due subscription ${sub.id} recovered`);
        }
      }
    }

    // 3. Finalize canceling subscriptions that have reached cancel_at
    const { rows: cancelingSubs } = await this.db.query(
      `SELECT * FROM product_subscriptions WHERE status = $1 AND cancel_at <= $2`,
      [SubscriptionStatus.CANCELING, now.toISOString()],
    );

    for (const sub of cancelingSubs || []) {
      await this.db.update('product_subscriptions', sub.id, {
        status: SubscriptionStatus.CANCELLED,
        updated_at: now.toISOString(),
      });
      stats.cancelled++;
      this.logger.log(`Subscription ${sub.id} finalized cancellation`);
    }

    // 4. Convert trialing subscriptions whose trial has ended
    const { rows: trialingSubs } = await this.db.query(
      `SELECT * FROM product_subscriptions WHERE status = $1 AND trial_end <= $2`,
      [SubscriptionStatus.TRIALING, now.toISOString()],
    );

    for (const sub of trialingSubs || []) {
      await this.db.update('product_subscriptions', sub.id, {
        status: SubscriptionStatus.ACTIVE,
        updated_at: now.toISOString(),
      });
      this.logger.log(`Subscription ${sub.id} trial ended, now active`);
    }

    this.logger.log(
      `Renewal processing complete: ${stats.processed} processed, ${stats.succeeded} succeeded, ${stats.failed} failed, ${stats.cancelled} cancelled`,
    );

    return stats;
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  /**
   * List user's subscriptions
   */
  async getSubscriptionsByUser(userId: string) {
    const subs = await this.db.findMany('product_subscriptions', { user_id: userId }, { orderBy: 'created_at', order: 'desc' });
    return (subs || []).map((s: any) => this.transformSubscription(s));
  }

  /**
   * List vendor's subscribers
   */
  async getSubscriptionsByVendor(vendorId: string) {
    const subs = await this.db.findMany('product_subscriptions', { vendor_id: vendorId }, { orderBy: 'created_at', order: 'desc' });
    return (subs || []).map((s: any) => this.transformSubscription(s));
  }

  /**
   * Vendor subscription analytics: MRR, active subscribers, churn rate, LTV
   */
  async getSubscriptionAnalytics(vendorId: string) {
    // Active subscribers
    const { rows: activeRows } = await this.db.query(
      `SELECT COUNT(*) as count FROM product_subscriptions WHERE vendor_id = $1 AND status IN ($2, $3)`,
      [vendorId, SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
    );
    const activeSubscribers = parseInt(activeRows[0]?.count || '0', 10);

    // MRR (Monthly Recurring Revenue) — sum of monthly-equivalent prices of active subs
    const { rows: mrrRows } = await this.db.query(
      `SELECT
         SUM(
           CASE sp.interval
             WHEN 'weekly' THEN sp.price * 4.33
             WHEN 'monthly' THEN sp.price
             WHEN 'quarterly' THEN sp.price / 3.0
             WHEN 'annual' THEN sp.price / 12.0
             ELSE sp.price
           END * (1 - COALESCE(sp.subscription_discount_percent, 0) / 100.0)
         ) as mrr
       FROM product_subscriptions s
       JOIN product_subscription_plans sp ON s.plan_id = sp.id
       WHERE s.vendor_id = $1 AND s.status IN ($2, $3)`,
      [vendorId, SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
    );
    const mrr = Math.round(parseFloat(mrrRows[0]?.mrr || '0'));

    // Total subscribers ever
    const { rows: totalRows } = await this.db.query(
      `SELECT COUNT(*) as count FROM product_subscriptions WHERE vendor_id = $1`,
      [vendorId],
    );
    const totalSubscribers = parseInt(totalRows[0]?.count || '0', 10);

    // Cancelled subscribers
    const { rows: cancelledRows } = await this.db.query(
      `SELECT COUNT(*) as count FROM product_subscriptions WHERE vendor_id = $1 AND status = $2`,
      [vendorId, SubscriptionStatus.CANCELLED],
    );
    const cancelledSubscribers = parseInt(cancelledRows[0]?.count || '0', 10);

    // Churn rate = cancelled / total (avoid division by zero)
    const churnRate = totalSubscribers > 0
      ? parseFloat((cancelledSubscribers / totalSubscribers * 100).toFixed(2))
      : 0;

    // Average LTV = total revenue collected / total subscribers
    const { rows: ltvRows } = await this.db.query(
      `SELECT COALESCE(SUM(last_payment_amount * renewal_count), 0) as total_revenue
       FROM product_subscriptions
       WHERE vendor_id = $1 AND renewal_count > 0`,
      [vendorId],
    );
    const totalRevenue = parseFloat(ltvRows[0]?.total_revenue || '0');
    const averageLtv = totalSubscribers > 0 ? Math.round(totalRevenue / totalSubscribers) : 0;

    return {
      activeSubscribers,
      totalSubscribers,
      cancelledSubscribers,
      mrr, // in minor units
      churnRate, // percentage
      averageLtv, // in minor units
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private async getSubscriptionForUser(userId: string, subscriptionId: string) {
    const sub = await this.db.findOne('product_subscriptions', { id: subscriptionId });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.user_id !== userId) throw new ForbiddenException('You do not own this subscription');
    return sub;
  }

  /**
   * Attempt to charge for a subscription renewal.
   *
   * V1 STUB: Always returns true (successful charge).
   * HOOK POINT: Replace with real payment integration:
   *   - Call PaymentService.createPaymentIntent() or charge the saved payment method
   *   - Use Stripe's off-session payment: stripe.paymentIntents.create({
   *       amount, currency, customer, payment_method, off_session: true, confirm: true
   *     })
   *   - Return true on success, false on failure
   */
  private async attemptCharge(sub: any): Promise<boolean> {
    const effectivePrice = this.getEffectivePrice(sub.price, sub.subscription_discount_percent);
    this.logger.log(
      `[STUB] Charging subscription ${sub.id}: ${effectivePrice} ${sub.currency || 'USD'} (payment_method=${sub.payment_method_id || 'none'})`,
    );
    // V1: always succeed. Replace with actual payment call in follow-up.
    return true;
  }

  private getEffectivePrice(price: number, discountPercent: number | null | undefined): number {
    if (!discountPercent || discountPercent <= 0) return price;
    return Math.round(price * (1 - discountPercent / 100));
  }

  private calculatePeriodEnd(from: Date, interval: string): Date {
    const end = new Date(from);
    switch (interval) {
      case SubscriptionInterval.WEEKLY:
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case SubscriptionInterval.MONTHLY:
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case SubscriptionInterval.QUARTERLY:
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case SubscriptionInterval.ANNUAL:
      case 'annual':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  private transformPlan(plan: any) {
    return {
      id: plan.id,
      vendorId: plan.vendor_id,
      productId: plan.product_id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      trialDays: plan.trial_days,
      subscriptionDiscountPercent: parseFloat(plan.subscription_discount_percent) || 0,
      isActive: plan.is_active,
      stripePriceId: plan.stripe_price_id,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    };
  }

  private transformSubscription(sub: any) {
    return {
      id: sub.id,
      userId: sub.user_id,
      planId: sub.plan_id,
      vendorId: sub.vendor_id,
      status: sub.status,
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      nextBillingDate: sub.next_billing_date,
      cancelAt: sub.cancel_at,
      trialEnd: sub.trial_end,
      paymentMethodId: sub.payment_method_id,
      stripeSubscriptionId: sub.stripe_subscription_id,
      renewalCount: sub.renewal_count,
      lastPaymentAt: sub.last_payment_at,
      lastPaymentAmount: sub.last_payment_amount,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
    };
  }
}

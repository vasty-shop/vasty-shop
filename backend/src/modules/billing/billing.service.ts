import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from '../subscription/subscription.service';
import { DatabaseService } from '../database/database.service';
import Stripe from 'stripe';
import {
  CreateCheckoutDto,
  CancelSubscriptionDto,
  SubscriptionResponseDto,
  PlanResponseDto,
  InvoiceResponseDto,
  PaymentMethodResponseDto,
  CheckoutSessionResponseDto,
  SetupSessionResponseDto,
} from './dto/billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    // Check if Stripe key is configured and not a placeholder
    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
      this.logger.log('Stripe initialized successfully');
    } else {
      this.logger.warn('Stripe is not configured or key is invalid. Billing features requiring Stripe will not work.');
    }
  }

  /**
   * Get vendor's shop subscription
   */
  async getSubscription(userId: string, shopId: string): Promise<SubscriptionResponseDto | null> {
    this.logger.debug(`Getting subscription for shop: ${shopId}, user: ${userId}`);

    // If no shop ID, try to get the user's shop
    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      // Return null subscription for free plan
      return {
        id: 'free',
        userId,
        plan: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const subscription = await this.subscriptionService.getShopSubscription(resolvedShopId);

    if (!subscription) {
      // Return free plan subscription
      return {
        id: 'free',
        userId,
        plan: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return this.transformSubscription(subscription, userId);
  }

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<{ plans: PlanResponseDto[] }> {
    const plans = await this.subscriptionService.getPlans(false);

    // If no plans exist in database, return default plans
    if (!plans || plans.length === 0) {
      return {
        plans: this.getDefaultPlans(),
      };
    }

    return {
      plans: plans.map(plan => this.transformPlan(plan)),
    };
  }

  /**
   * Get default plans when no plans are in database
   * - Free: Basic features
   * - Starter: For small businesses (2 months free on yearly)
   * - Pro: For growing businesses (2 months free on yearly)
   * - Business: For enterprise needs (2 months free on yearly)
   */
  private getDefaultPlans(): PlanResponseDto[] {
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Get started with basic features',
        stripePriceId: null,
        interval: 'month',
        price: 0,
        currency: 'USD',
        features: [
          '1 store with 10 products',
          'Free subdomain (yourstore.vasty.shop)',
          'Basic storefront theme',
          'Marketplace listing',
          'Standard checkout',
          'Community support',
        ],
        isPopular: false,
      },
      {
        id: 'starter',
        name: 'Starter',
        description: 'Launch & grow',
        stripePriceId: 'price_starter_monthly',
        stripePriceIdYearly: 'price_starter_yearly',
        interval: 'month',
        price: 2999, // $29.99 in cents
        yearlyPrice: 29999, // $299.99/year = 2 months free (10 months worth)
        currency: 'USD',
        features: [
          '2 stores with unlimited products',
          'Custom domain',
          'Premium storefront themes',
          'Basic analytics dashboard',
          '2 team members',
          'Email support',
        ],
        isPopular: false,
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'Grow your business',
        stripePriceId: 'price_pro_monthly',
        stripePriceIdYearly: 'price_pro_yearly',
        interval: 'month',
        price: 7999, // $79.99 in cents
        yearlyPrice: 79999, // $799.99/year = 2 months free (10 months worth)
        currency: 'USD',
        features: [
          '5 stores with unlimited products',
          'Custom domain per store',
          'Advanced analytics & reports',
          '5 team members',
          'Priority support (Email & Chat)',
          'Mobile app for customers',
          'Advanced promotions & campaigns',
        ],
        isPopular: true,
      },
      {
        id: 'business',
        name: 'Business',
        description: 'Scale without limits',
        stripePriceId: 'price_business_monthly',
        stripePriceIdYearly: 'price_business_yearly',
        interval: 'month',
        price: 19999, // $199.99 in cents
        yearlyPrice: 199999, // $1999.99/year = 2 months free (10 months worth)
        currency: 'USD',
        features: [
          'Unlimited stores & products',
          'Custom domain per store',
          'Full analytics + custom reports',
          '15 team members',
          'Full mobile app (All panels)',
          'API access for integrations',
          'White-label solution',
        ],
        isPopular: false,
      },
    ];
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckout(
    userId: string,
    shopId: string,
    dto: CreateCheckoutDto,
  ): Promise<CheckoutSessionResponseDto> {
    if (!this.stripe) {
      throw new BadRequestException(
        'Payment system is not configured. Please contact support or set up Stripe in your environment variables (STRIPE_SECRET_KEY must start with sk_).'
      );
    }

    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      throw new BadRequestException('Shop not found. Please create a shop first.');
    }

    // Get or create Stripe customer
    let stripeCustomerId = await this.getOrCreateStripeCustomer(userId, resolvedShopId);

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5186';
    const successUrl = dto.successUrl || `${frontendUrl}/shop/${resolvedShopId}/vendor/billing?success=true`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/shop/${resolvedShopId}/vendor/billing?canceled=true`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: dto.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        shopId: resolvedShopId,
      },
    };

    if (dto.trialPeriodDays) {
      sessionParams.subscription_data = {
        trial_period_days: dto.trialPeriodDays,
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    shopId: string,
    dto: CancelSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      throw new NotFoundException('Shop not found');
    }

    const result = await this.subscriptionService.cancelSubscription(resolvedShopId, {
      atPeriodEnd: dto.cancelAtPeriodEnd,
    });

    return this.transformSubscription(result, userId);
  }

  /**
   * Resume cancelled subscription
   */
  async resumeSubscription(userId: string, shopId: string): Promise<SubscriptionResponseDto> {
    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      throw new NotFoundException('Shop not found');
    }

    const result = await this.subscriptionService.reactivateSubscription(resolvedShopId);
    return this.transformSubscription(result, userId);
  }

  /**
   * Get invoices directly from Stripe
   */
  async getInvoices(
    userId: string,
    shopId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ invoices: InvoiceResponseDto[]; total: number }> {
    if (!this.stripe) {
      return { invoices: [], total: 0 };
    }

    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      return { invoices: [], total: 0 };
    }

    // Get Stripe customer ID
    const stripeCustomerId = await this.getStripeCustomerId(resolvedShopId);
    if (!stripeCustomerId) {
      return { invoices: [], total: 0 };
    }

    try {
      // Fetch all invoices from Stripe (up to 100 for total count)
      const allInvoices = await this.stripe.invoices.list({
        customer: stripeCustomerId,
        limit: 100,
      });

      const total = allInvoices.data.length;

      // Map Stripe status to our status
      const mapStatus = (stripeStatus: string): string => {
        switch (stripeStatus) {
          case 'paid':
            return 'paid';
          case 'open':
          case 'draft':
            return 'pending';
          case 'uncollectible':
          case 'void':
            return 'failed';
          default:
            return 'pending';
        }
      };

      // Apply pagination (offset and limit)
      const paginatedData = allInvoices.data.slice(offset, offset + limit);

      const invoices: InvoiceResponseDto[] = paginatedData.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid || invoice.total || 0,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: mapStatus(invoice.status || 'open'),
        date: new Date((invoice.created || 0) * 1000).toISOString(),
        description: invoice.lines?.data?.[0]?.description || 'Subscription payment',
        invoiceUrl: invoice.hosted_invoice_url || null,
        receiptUrl: invoice.invoice_pdf || null,
      }));

      return {
        invoices,
        total,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch invoices from Stripe: ${error.message}`);
      return { invoices: [], total: 0 };
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(userId: string, shopId: string): Promise<{ paymentMethods: PaymentMethodResponseDto[] }> {
    if (!this.stripe) {
      return { paymentMethods: [] };
    }

    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      return { paymentMethods: [] };
    }

    const stripeCustomerId = await this.getStripeCustomerId(resolvedShopId);
    if (!stripeCustomerId) {
      return { paymentMethods: [] };
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    // Get default payment method
    const customer = await this.stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    return {
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        type: 'card' as const,
        brand: pm.card?.brand,
        last4: pm.card?.last4 || '****',
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
        isDefault: pm.id === defaultPaymentMethodId,
      })),
    };
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    await this.stripe.paymentMethods.detach(paymentMethodId);
    return { message: 'Payment method removed successfully' };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<{ received: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle checkout.session.completed event
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    this.logger.log(`Processing checkout.session.completed for session: ${session.id}`);

    const shopId = session.metadata?.shopId;
    const userId = session.metadata?.userId;

    if (!shopId) {
      this.logger.error('No shopId in checkout session metadata');
      return;
    }

    // Get the subscription from Stripe
    if (session.subscription) {
      const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
      await this.updateSubscriptionFromStripe(shopId, subscription);
    }
  }

  /**
   * Handle subscription created/updated events
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Processing subscription update: ${subscription.id}`);

    const shopId = subscription.metadata?.shopId;
    if (!shopId) {
      // Try to find shop by customer ID
      const customerId = subscription.customer as string;
      const shopSubscription = await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .select('shop_id')
        .where('stripe_customer_id', customerId)
        .limit(1)
        .get();

      if (shopSubscription && shopSubscription.length > 0) {
        await this.updateSubscriptionFromStripe(shopSubscription[0].shop_id, subscription);
      }
      return;
    }

    await this.updateSubscriptionFromStripe(shopId, subscription);
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Processing subscription deletion: ${subscription.id}`);

    // Find shop by stripe subscription ID
    const shopSubscription = await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .select('id', 'shop_id')
      .where('stripe_subscription_id', subscription.id)
      .limit(1)
      .get();

    if (shopSubscription && shopSubscription.length > 0) {
      // Get free plan
      const freePlan = await /* TODO: replace client call */ this.db.client.query
        .from('subscription_plans')
        .select('id')
        .where('slug', 'free')
        .limit(1)
        .get();

      // Downgrade to free plan
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .where('id', shopSubscription[0].id)
        .update({
          plan_id: freePlan?.[0]?.id,
          status: 'cancelled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .execute();

      this.logger.log(`Downgraded shop ${shopSubscription[0].shop_id} to free plan`);
    }
  }

  /**
   * Handle invoice.paid event
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice paid: ${invoice.id}`);
    // Could store invoice records if needed
  }

  /**
   * Handle invoice.payment_failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);

    // Find subscription by customer ID and update status
    const customerId = invoice.customer as string;
    await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .where('stripe_customer_id', customerId)
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Update subscription in database from Stripe subscription object
   */
  private async updateSubscriptionFromStripe(shopId: string, subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`[UPDATE] Updating subscription for shop: ${shopId}`);

    // Get the price ID from the subscription
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      this.logger.error('[UPDATE] No price ID found in subscription');
      return;
    }
    this.logger.log(`[UPDATE] Looking for plan with price ID: ${priceId}`);

    // Find the plan by Stripe price ID
    const plans = await /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .select('id', 'slug', 'stripe_price_id_monthly', 'stripe_price_id_yearly')
      .get();

    this.logger.log(`[UPDATE] Found ${plans?.length || 0} plans in database`);

    let planId: string | null = null;
    let planSlug: string | null = null;
    for (const plan of plans || []) {
      this.logger.log(`[UPDATE] Checking plan: ${plan.slug}, monthly: ${plan.stripe_price_id_monthly}, yearly: ${plan.stripe_price_id_yearly}`);
      if (plan.stripe_price_id_monthly === priceId || plan.stripe_price_id_yearly === priceId) {
        planId = plan.id;
        planSlug = plan.slug;
        this.logger.log(`[UPDATE] Found matching plan: ${planSlug} (${planId})`);
        break;
      }
    }

    if (!planId) {
      this.logger.error(`[UPDATE] No plan found for price ID: ${priceId}`);
      return;
    }

    // Determine billing cycle
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    const billingCycle = interval === 'year' ? 'yearly' : 'monthly';

    // Map Stripe status to our status
    const statusMap: Record<string, string> = {
      active: 'active',
      trialing: 'trial',
      canceled: 'cancelled',
      incomplete: 'pending',
      incomplete_expired: 'expired',
      past_due: 'past_due',
      unpaid: 'past_due',
      paused: 'paused',
    };

    const status = statusMap[subscription.status] || 'active';

    // Update or create subscription
    const existingSubscription = await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .select('id')
      .where('shop_id', shopId)
      .limit(1)
      .get();

    const subscriptionData = {
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      billing_cycle: billingCycle,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existingSubscription && existingSubscription.length > 0) {
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .where('id', existingSubscription[0].id)
        .update(subscriptionData)
        .execute();
      this.logger.log(`Updated subscription for shop ${shopId}`);
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .insert({
          shop_id: shopId,
          ...subscriptionData,
          created_at: new Date().toISOString(),
        })
        .execute();
      this.logger.log(`Created subscription for shop ${shopId}`);
    }
  }

  /**
   * Sync subscription from Stripe (useful for local development or manual sync)
   */
  async syncSubscription(userId: string, shopId: string): Promise<SubscriptionResponseDto | null> {
    this.logger.log(`[SYNC] Starting sync for userId: ${userId}, shopId: ${shopId}`);

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
      this.logger.log(`[SYNC] Resolved shopId from userId: ${resolvedShopId}`);
    }

    if (!resolvedShopId) {
      throw new NotFoundException('Shop not found');
    }

    // Get the Stripe customer ID for this shop
    const stripeCustomerId = await this.getStripeCustomerId(resolvedShopId);
    this.logger.log(`[SYNC] Stripe customer ID: ${stripeCustomerId}`);

    if (!stripeCustomerId) {
      this.logger.log(`[SYNC] No Stripe customer found for shop ${resolvedShopId}`);
      return null;
    }

    // List all subscriptions for this customer
    const subscriptions = await this.stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    this.logger.log(`[SYNC] Found ${subscriptions.data.length} subscriptions for customer`);

    if (subscriptions.data.length === 0) {
      this.logger.log(`[SYNC] No subscriptions found for customer ${stripeCustomerId}`);
      return null;
    }

    // Get the most recent active subscription
    const stripeSubscription = subscriptions.data.find(s => s.status === 'active' || s.status === 'trialing') || subscriptions.data[0];
    this.logger.log(`[SYNC] Using Stripe subscription: ${stripeSubscription.id}, status: ${stripeSubscription.status}`);
    this.logger.log(`[SYNC] Price ID: ${stripeSubscription.items.data[0]?.price?.id}`);

    // Update local database
    await this.updateSubscriptionFromStripe(resolvedShopId, stripeSubscription);

    // Return updated subscription
    const result = await this.getSubscription(userId, resolvedShopId);
    this.logger.log(`[SYNC] Returning subscription with plan: ${result?.plan}`);
    return result;
  }

  /**
   * Create setup session for adding payment method
   */
  async createSetupSession(userId: string, shopId: string): Promise<SetupSessionResponseDto> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    let resolvedShopId = shopId;
    if (!resolvedShopId) {
      resolvedShopId = await this.getUserShopId(userId);
    }

    if (!resolvedShopId) {
      throw new BadRequestException('Shop not found. Please create a shop first.');
    }

    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId, resolvedShopId);
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5186';
    const returnUrl = `${frontendUrl}/shop/${resolvedShopId}/vendor/billing?setup=complete`;

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'setup',
      success_url: returnUrl,
      cancel_url: returnUrl,
    });

    return { url: session.url };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async getUserShopId(userId: string): Promise<string | null> {
    try {
      const shops = await /* TODO: replace client call */ this.db.client.query
        .from('shops')
        .select('id')
        .where('owner_id', userId)
        .limit(1)
        .get();

      return shops?.[0]?.id || null;
    } catch (error) {
      this.logger.error('Error getting user shop:', error);
      return null;
    }
  }

  private async getStripeCustomerId(shopId: string): Promise<string | null> {
    try {
      const subscriptions = await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .select('stripe_customer_id')
        .where('shop_id', shopId)
        .limit(1)
        .get();

      return subscriptions?.[0]?.stripe_customer_id || null;
    } catch (error) {
      return null;
    }
  }

  private async getOrCreateStripeCustomer(userId: string, shopId: string): Promise<string> {
    // Check if customer already exists in any subscription
    const existingCustomerId = await this.getStripeCustomerId(shopId);
    if (existingCustomerId) {
      return existingCustomerId;
    }

    // Get user email
    const user = await /* TODO: replace client call */ this.db.client.auth.getUserById(userId);
    const email = user?.email || user?.user?.email;

    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        userId,
        shopId,
      },
    });

    // Check if a subscription record already exists for this shop
    const existingSubscription = await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .select('id')
      .where('shop_id', shopId)
      .limit(1)
      .get();

    if (existingSubscription && existingSubscription.length > 0) {
      // Update existing subscription with customer ID
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .where('id', existingSubscription[0].id)
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      // Get the free plan ID first (required for plan_id)
      const freePlan = await /* TODO: replace client call */ this.db.client.query
        .from('subscription_plans')
        .select('id')
        .where('slug', 'free')
        .limit(1)
        .get();

      if (freePlan && freePlan.length > 0) {
        // Create a new subscription with free plan
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await /* TODO: replace client call */ this.db.client.query
          .from('shop_subscriptions')
          .insert({
            shop_id: shopId,
            plan_id: freePlan[0].id,
            stripe_customer_id: customer.id,
            billing_cycle: 'monthly',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            status: 'active',
            cancel_at_period_end: false,
            products_used: 0,
            orders_this_month: 0,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .execute();
      }
    }

    return customer.id;
  }

  private transformSubscription(subscription: any, userId: string): SubscriptionResponseDto {
    return {
      id: subscription.id,
      userId,
      plan: subscription.plan?.slug || subscription.planId || 'free',
      interval: subscription.billingCycle === 'yearly' ? 'year' : 'month',
      status: this.mapSubscriptionStatus(subscription.status),
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      trialEnd: subscription.trialEndsAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.createdAt,
    };
  }

  private mapSubscriptionStatus(status: string): string {
    const statusMap: Record<string, string> = {
      active: 'active',
      trial: 'trialing',
      cancelled: 'canceled',
      expired: 'canceled',
      past_due: 'past_due',
    };
    return statusMap[status] || status;
  }

  private transformPlan(plan: any): PlanResponseDto {
    return {
      id: plan.slug || plan.id,
      name: plan.name,
      description: plan.description,
      stripePriceId: plan.stripePriceIdMonthly,
      stripePriceIdYearly: plan.stripePriceIdYearly,
      interval: 'month',
      price: Math.round((plan.priceMonthly || 0) * 100), // Convert to cents
      yearlyPrice: plan.priceYearly ? Math.round(plan.priceYearly * 100) : undefined,
      currency: plan.currency || 'USD',
      features: plan.features || [],
      isPopular: plan.isFeatured,
    };
  }

  private transformInvoice(invoice: any): InvoiceResponseDto {
    return {
      id: invoice.id,
      date: invoice.createdAt || invoice.periodStart,
      amount: Math.round((invoice.totalAmount || invoice.amount || 0) * 100), // Convert to cents
      status: invoice.status === 'paid' ? 'paid' : invoice.status === 'pending' ? 'pending' : 'failed',
      invoiceUrl: invoice.invoicePdfUrl,
      description: `Subscription - ${invoice.periodStart ? new Date(invoice.periodStart).toLocaleDateString() : 'N/A'}`,
      currency: invoice.currency || 'USD',
    };
  }
}

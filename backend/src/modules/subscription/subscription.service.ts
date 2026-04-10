import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  BillingCycle,
  SubscriptionStatus,
  CreatePlanDto,
  UpdatePlanDto,
  SubscribeDto,
  ChangePlanDto,
  CancelSubscriptionDto,
} from './dto/subscription.dto';
import Stripe from 'stripe';

/**
 * Plan tier type matching frontend
 */
export type PlanTier = 'free' | 'starter' | 'pro' | 'business';
export type AnalyticsTier = 'none' | 'basic' | 'advanced' | 'full';

/**
 * Comprehensive plan features configuration
 * All plan restrictions and features are defined here
 * Must match frontend/src/types/billing.ts
 */
export interface PlanFeatures {
  // Limits
  stores: number;           // Max stores allowed (-1 = unlimited)
  products: number;         // Max products per store (-1 = unlimited)
  teamMembers: number;      // Max team members allowed

  // Feature flags
  customDomain: boolean;    // Can add custom domain
  premiumThemes: boolean;   // Access to premium themes
  analytics: AnalyticsTier; // Analytics level: none, basic, advanced, full
  mobileApp: boolean;       // Can generate mobile app
  apiAccess: boolean;       // Has API access
  whiteLabel: boolean;      // White-label solution
  promotions: boolean;      // Advanced promotions & campaigns
  prioritySupport: boolean; // Priority support access
}

/**
 * Complete plan features for each tier
 */
export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    stores: 1,
    products: 10,
    teamMembers: 1,
    customDomain: false,
    premiumThemes: false,
    analytics: 'none',
    mobileApp: false,
    apiAccess: false,
    whiteLabel: false,
    promotions: false,
    prioritySupport: false,
  },
  starter: {
    stores: 2,
    products: -1, // unlimited
    teamMembers: 2,
    customDomain: true,
    premiumThemes: true,
    analytics: 'basic',
    mobileApp: false,
    apiAccess: false,
    whiteLabel: false,
    promotions: false,
    prioritySupport: false,
  },
  pro: {
    stores: 5,
    products: -1, // unlimited
    teamMembers: 5,
    customDomain: true,
    premiumThemes: true,
    analytics: 'advanced',
    mobileApp: true, // Customer app only
    apiAccess: false,
    whiteLabel: false,
    promotions: true,
    prioritySupport: true,
  },
  business: {
    stores: -1, // unlimited
    products: -1, // unlimited
    teamMembers: 15,
    customDomain: true,
    premiumThemes: true,
    analytics: 'full',
    mobileApp: true, // All panels
    apiAccess: true,
    whiteLabel: true,
    promotions: true,
    prioritySupport: true,
  },
};

// Legacy PLAN_LIMITS for backward compatibility
export const PLAN_LIMITS: Record<PlanTier, { stores: number; products: number }> = {
  free: { stores: 1, products: 10 },
  starter: { stores: 2, products: Infinity },
  pro: { stores: 5, products: Infinity },
  business: { stores: Infinity, products: Infinity },
};

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private stripe: Stripe;

  constructor(private readonly db: DatabaseService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  // ============================================
  // PLAN LIMITS & USER-LEVEL CHECKS
  // ============================================

  /**
   * Get plan limits for a given plan tier
   * Defaults to 'free' if plan is not found
   */
  getPlanLimits(plan?: PlanTier | string | null): { stores: number; products: number } {
    const normalizedPlan = (plan?.toLowerCase() || 'free') as PlanTier;
    return PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.free;
  }

  /**
   * Get full plan features for a given plan tier
   */
  getPlanFeatures(plan?: PlanTier | string | null): PlanFeatures {
    const normalizedPlan = (plan?.toLowerCase() || 'free') as PlanTier;
    return PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free;
  }

  /**
   * Check if user can add more team members
   */
  async canAddTeamMember(userId: string): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
    const planTier = await this.getUserPlanTier(userId);
    const features = this.getPlanFeatures(planTier);
    const currentCount = await this.getUserTeamMemberCount(userId);

    const allowed = currentCount < features.teamMembers;
    return {
      allowed,
      current: currentCount,
      limit: features.teamMembers,
      message: allowed ? undefined : `Team member limit reached. Your ${planTier} plan allows ${features.teamMembers} team member(s). Upgrade to add more.`,
    };
  }

  /**
   * Get user's total team member count across all shops
   */
  async getUserTeamMemberCount(userId: string): Promise<number> {
    try {
      // Get all shops owned by user
      const shops = await /* TODO: replace client call */ this.db.client.query
        .from('shops')
        .select('id')
        .where('owner_id', userId)
        .get();

      if (!shops || shops.length === 0) return 0;

      const shopIds = shops.map(s => s.id);

      // Count team members across all shops
      const members = await /* TODO: replace client call */ this.db.client.query
        .from('shop_team_members')
        .select('id')
        .whereIn('shop_id', shopIds)
        .get();

      return members?.length || 0;
    } catch (error) {
      this.logger.warn(`Error getting team member count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if user has custom domain access
   */
  async hasCustomDomainAccess(userId: string): Promise<boolean> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).customDomain;
  }

  /**
   * Check if user has premium themes access
   */
  async hasPremiumThemesAccess(userId: string): Promise<boolean> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).premiumThemes;
  }

  /**
   * Get analytics tier for user
   */
  async getAnalyticsTier(userId: string): Promise<AnalyticsTier> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).analytics;
  }

  /**
   * Check if user has mobile app access
   */
  async hasMobileAppAccess(userId: string): Promise<boolean> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).mobileApp;
  }

  /**
   * Check if user has API access
   */
  async hasApiAccess(userId: string): Promise<boolean> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).apiAccess;
  }

  /**
   * Check if user has white-label access
   */
  async hasWhiteLabelAccess(userId: string): Promise<boolean> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).whiteLabel;
  }

  /**
   * Check if user has promotions access
   */
  async hasPromotionsAccess(userId: string): Promise<boolean> {
    const planTier = await this.getUserPlanTier(userId);
    return this.getPlanFeatures(planTier).promotions;
  }

  /**
   * Get all feature access for user (for frontend)
   */
  async getUserFeatureAccess(userId: string): Promise<PlanFeatures & { planTier: PlanTier }> {
    const planTier = await this.getUserPlanTier(userId);
    const features = this.getPlanFeatures(planTier);
    return { ...features, planTier };
  }

  /**
   * Get user's current plan tier based on their subscription
   * Returns 'free' if trial has expired and not paid
   */
  async getUserPlanTier(userId: string): Promise<PlanTier> {
    try {
      // Get user's first shop to check subscription
      const shops = await /* TODO: replace client call */ this.db.client.query
        .from('shops')
        .select('id')
        .where('owner_id', userId)
        .limit(1)
        .get();

      if (!shops || shops.length === 0) {
        return 'free';
      }

      const subscription = await this.getShopSubscription(shops[0].id);
      if (!subscription) {
        return 'free';
      }

      // Check if it's a trial subscription that has expired
      if (subscription.status === 'trial' && subscription.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(subscription.trialEndsAt);
        if (now > trialEnd) {
          // Trial expired - user must pay to continue using paid features
          this.logger.log(`[getUserPlanTier] Trial expired for user ${userId}, downgrading to free`);
          return 'free';
        }
      }

      // Check if subscription is in expired/past_due status
      if (['expired', 'past_due', 'canceled'].includes(subscription.status)) {
        return 'free';
      }

      // Map plan slug to tier (supports legacy 'basic'/'premium' names)
      const planSlug = subscription.plan?.slug || subscription.planId || 'free';
      const tierMap: Record<string, PlanTier> = {
        free: 'free',
        basic: 'starter',     // Legacy mapping
        starter: 'starter',
        pro: 'pro',
        premium: 'business',  // Legacy mapping
        business: 'business',
      };

      return tierMap[planSlug.toLowerCase()] || 'free';
    } catch (error) {
      this.logger.warn(`Error getting user plan tier: ${error.message}`);
      return 'free';
    }
  }

  /**
   * Get user's total store count
   */
  async getUserStoreCount(userId: string): Promise<number> {
    try {
      this.logger.debug(`[getUserStoreCount] Checking store count for user: ${userId}`);

      const shops = await /* TODO: replace client call */ this.db.client.query
        .from('shops')
        .select('id')
        .where('owner_id', userId)
        .get();

      const count = shops?.length || 0;
      this.logger.debug(`[getUserStoreCount] User ${userId} has ${count} stores`);

      return count;
    } catch (error) {
      this.logger.error(`[getUserStoreCount] Error getting user store count: ${error.message}`, error.stack);
      // Return a high number to block creation when there's an error
      // This is safer than returning 0 which would allow unlimited creation
      throw error;
    }
  }

  /**
   * Get user's total product count across all stores
   */
  async getUserProductCount(userId: string): Promise<number> {
    try {
      // Get all shops owned by user
      const shops = await /* TODO: replace client call */ this.db.client.query
        .from('shops')
        .select('id')
        .where('owner_id', userId)
        .get();

      if (!shops || shops.length === 0) {
        return 0;
      }

      const shopIds = shops.map((s: any) => s.id);

      // Count products across all user's shops
      let totalProducts = 0;
      for (const shopId of shopIds) {
        const products = await /* TODO: replace client call */ this.db.client.query
          .from('products')
          .select('id')
          .where('shop_id', shopId)
          .where('status', '!=', 'archived')
          .get();
        totalProducts += products?.length || 0;
      }

      return totalProducts;
    } catch (error) {
      this.logger.warn(`Error getting user product count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if user can create more stores based on their subscription
   */
  async canCreateStore(userId: string): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
    this.logger.log(`[canCreateStore] Checking store limit for user: ${userId}`);

    const planTier = await this.getUserPlanTier(userId);
    const limits = this.getPlanLimits(planTier);
    const currentStoreCount = await this.getUserStoreCount(userId);

    this.logger.log(`[canCreateStore] User ${userId}: plan=${planTier}, stores=${currentStoreCount}/${limits.stores}`);

    if (limits.stores === Infinity) {
      return { allowed: true, limit: Infinity, used: currentStoreCount };
    }

    if (currentStoreCount >= limits.stores) {
      return {
        allowed: false,
        reason: `Store limit reached. Your ${planTier} plan allows ${limits.stores} store(s). Upgrade your plan to create more stores.`,
        limit: limits.stores,
        used: currentStoreCount,
      };
    }

    return { allowed: true, limit: limits.stores, used: currentStoreCount };
  }

  /**
   * Check if user can add more products based on their subscription
   */
  async canAddProductForUser(userId: string): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
    const planTier = await this.getUserPlanTier(userId);
    const limits = this.getPlanLimits(planTier);
    const currentProductCount = await this.getUserProductCount(userId);

    this.logger.debug(`[canAddProductForUser] User ${userId}: plan=${planTier}, products=${currentProductCount}/${limits.products}`);

    if (limits.products === Infinity) {
      return { allowed: true, limit: Infinity, used: currentProductCount };
    }

    if (currentProductCount >= limits.products) {
      return {
        allowed: false,
        reason: `Product limit reached. Your ${planTier} plan allows ${limits.products} product(s). Upgrade your plan to add more products.`,
        limit: limits.products,
        used: currentProductCount,
      };
    }

    return { allowed: true, limit: limits.products, used: currentProductCount };
  }

  // ============================================
  // PLAN MANAGEMENT
  // ============================================

  /**
   * Get all subscription plans
   */
  async getPlans(includeInactive: boolean = false): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .select('*');

    if (!includeInactive) {
      query = query.where('is_active', true);
    }

    const plans = await query.orderBy('sort_order', 'ASC').get();
    return (plans || []).map(this.transformPlan);
  }

  /**
   * Get plan by ID or slug
   */
  async getPlan(idOrSlug: string): Promise<any> {
    const plans = await /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .select('*')
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .get();

    if (!plans || plans.length === 0) {
      throw new NotFoundException('Plan not found');
    }

    return this.transformPlan(plans[0]);
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(dto: CreatePlanDto): Promise<any> {
    // Check if slug exists
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .select('id')
      .where('slug', dto.slug)
      .get();

    if (existing && existing.length > 0) {
      throw new BadRequestException('Plan with this slug already exists');
    }

    // Create Stripe products and prices if needed
    let stripePriceIdMonthly: string | null = null;
    let stripePriceIdYearly: string | null = null;

    try {
      // Create Stripe product
      const stripeProduct = await this.stripe.products.create({
        name: dto.name,
        description: dto.description || undefined,
        metadata: { slug: dto.slug },
      });

      // Create monthly price
      const monthlyPrice = await this.stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(dto.priceMonthly * 100),
        currency: (dto.currency || 'USD').toLowerCase(),
        recurring: { interval: 'month' },
      });
      stripePriceIdMonthly = monthlyPrice.id;

      // Create yearly price if specified
      if (dto.priceYearly && dto.priceYearly > 0) {
        const yearlyPrice = await this.stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(dto.priceYearly * 100),
          currency: (dto.currency || 'USD').toLowerCase(),
          recurring: { interval: 'year' },
        });
        stripePriceIdYearly = yearlyPrice.id;
      }
    } catch (error) {
      this.logger.warn('Failed to create Stripe product/prices:', error);
    }

    const plan = await /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .insert({
        name: dto.name,
        slug: dto.slug,
        description: dto.description || null,
        badge_color: dto.badgeColor || null,
        price_monthly: dto.priceMonthly,
        price_yearly: dto.priceYearly || null,
        currency: dto.currency || 'USD',
        trial_days: dto.trialDays || 0,
        max_products: dto.maxProducts ?? null,
        max_orders_per_month: dto.maxOrdersPerMonth ?? null,
        max_team_members: dto.maxTeamMembers || 1,
        commission_rate: dto.commissionRate || 0,
        features: JSON.stringify(dto.features || []),
        has_analytics: dto.hasAnalytics || false,
        has_priority_support: dto.hasPrioritySupport || false,
        has_custom_domain: dto.hasCustomDomain || false,
        has_api_access: dto.hasApiAccess || false,
        has_bulk_upload: dto.hasBulkUpload || false,
        has_promotions: dto.hasPromotions ?? true,
        is_active: true,
        is_featured: dto.isFeatured || false,
        sort_order: dto.sortOrder || 0,
        stripe_price_id_monthly: stripePriceIdMonthly,
        stripe_price_id_yearly: stripePriceIdYearly,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformPlan(plan[0]);
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(planId: string, dto: UpdatePlanDto): Promise<any> {
    const existing = await this.getPlan(planId);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.priceMonthly !== undefined) updateData.price_monthly = dto.priceMonthly;
    if (dto.priceYearly !== undefined) updateData.price_yearly = dto.priceYearly;
    if (dto.maxProducts !== undefined) updateData.max_products = dto.maxProducts;
    if (dto.maxOrdersPerMonth !== undefined) updateData.max_orders_per_month = dto.maxOrdersPerMonth;
    if (dto.maxTeamMembers !== undefined) updateData.max_team_members = dto.maxTeamMembers;
    if (dto.commissionRate !== undefined) updateData.commission_rate = dto.commissionRate;
    if (dto.features !== undefined) updateData.features = JSON.stringify(dto.features);
    if (dto.hasAnalytics !== undefined) updateData.has_analytics = dto.hasAnalytics;
    if (dto.hasPrioritySupport !== undefined) updateData.has_priority_support = dto.hasPrioritySupport;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.isFeatured !== undefined) updateData.is_featured = dto.isFeatured;
    if (dto.sortOrder !== undefined) updateData.sort_order = dto.sortOrder;

    await /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .where('id', existing.id)
      .update(updateData)
      .execute();

    return this.getPlan(planId);
  }

  /**
   * Delete a subscription plan (soft delete by deactivating)
   */
  async deletePlan(planId: string): Promise<void> {
    // Check if any active subscriptions use this plan
    const activeSubscriptions = await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .select('id')
      .where('plan_id', planId)
      .whereIn('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
      .get();

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      throw new BadRequestException('Cannot delete plan with active subscriptions');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('subscription_plans')
      .where('id', planId)
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Subscribe a shop to a plan
   */
  async subscribe(dto: SubscribeDto): Promise<any> {
    const { shopId, planId, billingCycle, paymentMethodId } = dto;

    // Get plan
    const plan = await this.getPlan(planId);

    if (!plan.isActive) {
      throw new BadRequestException('This plan is not available');
    }

    // Check if shop already has an active subscription
    const existingSubscription = await this.getShopSubscription(shopId);
    if (existingSubscription && ['active', 'trial'].includes(existingSubscription.status)) {
      throw new BadRequestException('Shop already has an active subscription. Please cancel or change plan instead.');
    }

    const now = new Date();
    const periodStart = now.toISOString();
    let periodEnd: Date;
    let trialEndsAt: string | null = null;
    let status = SubscriptionStatus.ACTIVE;

    // Handle trial period
    if (plan.trialDays > 0) {
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + plan.trialDays);
      trialEndsAt = trialEnd.toISOString();
      periodEnd = trialEnd;
      status = SubscriptionStatus.TRIAL;
    } else {
      periodEnd = new Date(now);
      if (billingCycle === BillingCycle.MONTHLY) {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
    }

    // Create Stripe subscription if payment method provided and no trial
    let stripeSubscriptionId: string | null = null;
    let stripeCustomerId: string | null = null;

    // TODO: Implement Stripe subscription creation for paid plans

    // Create subscription record
    const subscription = await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .insert({
        shop_id: shopId,
        plan_id: planId,
        billing_cycle: billingCycle,
        current_period_start: periodStart,
        current_period_end: periodEnd.toISOString(),
        trial_ends_at: trialEndsAt,
        status,
        cancel_at_period_end: false,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        products_used: 0,
        orders_this_month: 0,
        usage_reset_at: periodStart,
        created_at: periodStart,
        updated_at: periodStart,
      })
      .returning('*')
      .execute();

    return this.transformSubscription(subscription[0], plan);
  }

  /**
   * Create a trial subscription for a shop (2 months free for paid plans)
   * This is called when a new shop is created with a paid plan selected
   */
  async createTrialSubscription(
    userId: string,
    shopId: string,
    planTier: string,
    billingPeriod: string = 'yearly'
  ): Promise<any> {
    this.logger.log(`[createTrialSubscription] Creating trial for shop ${shopId}, plan: ${planTier}, billing: ${billingPeriod}`);

    // Check if shop already has a subscription
    const existingSubscription = await this.getShopSubscription(shopId);
    if (existingSubscription) {
      this.logger.warn(`[createTrialSubscription] Shop ${shopId} already has a subscription`);
      throw new BadRequestException('Shop already has a subscription');
    }

    // Get or create the plan
    let plan = await this.getPlanBySlug(planTier);
    if (!plan) {
      // Create the plan if it doesn't exist
      this.logger.log(`[createTrialSubscription] Plan ${planTier} not found, using default config`);
      plan = {
        id: planTier,
        slug: planTier,
        name: planTier.charAt(0).toUpperCase() + planTier.slice(1),
        isActive: true,
      };
    }

    const now = new Date();
    const periodStart = now.toISOString();

    // Trial ends after 2 months (60 days)
    const trialEnd = new Date(now);
    trialEnd.setMonth(trialEnd.getMonth() + 2);
    const trialEndsAt = trialEnd.toISOString();

    // Subscription status is 'trial'
    const status = SubscriptionStatus.TRIAL;

    // Create subscription record
    try {
      const subscription = await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .insert({
          shop_id: shopId,
          plan_id: plan.id,
          billing_cycle: billingPeriod === 'yearly' ? BillingCycle.YEARLY : BillingCycle.MONTHLY,
          current_period_start: periodStart,
          current_period_end: trialEndsAt, // Trial period end
          trial_ends_at: trialEndsAt,
          status,
          cancel_at_period_end: false,
          stripe_subscription_id: null,
          stripe_customer_id: null,
          products_used: 0,
          orders_this_month: 0,
          usage_reset_at: periodStart,
          created_at: periodStart,
          updated_at: periodStart,
          metadata: JSON.stringify({
            trialPlan: planTier,
            trialBillingPeriod: billingPeriod,
            requiresPaymentAfterTrial: true,
          }),
        })
        .returning('*')
        .execute();

      this.logger.log(`[createTrialSubscription] Trial subscription created for shop ${shopId}, ends: ${trialEndsAt}`);
      return subscription[0];
    } catch (error) {
      this.logger.error(`[createTrialSubscription] Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get plan by slug
   */
  async getPlanBySlug(slug: string): Promise<any | null> {
    try {
      const plans = await /* TODO: replace client call */ this.db.client.query
        .from('subscription_plans')
        .select('*')
        .where('slug', slug.toLowerCase())
        .limit(1)
        .get();

      if (!plans || plans.length === 0) {
        return null;
      }

      return this.transformPlan(plans[0]);
    } catch (error) {
      this.logger.warn(`[getPlanBySlug] Error getting plan: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if user's trial has expired
   */
  async isTrialExpired(userId: string): Promise<{ expired: boolean; daysRemaining: number; trialEndsAt?: string }> {
    try {
      const shops = await /* TODO: replace client call */ this.db.client.query
        .from('shops')
        .select('id')
        .where('owner_id', userId)
        .limit(1)
        .get();

      if (!shops || shops.length === 0) {
        return { expired: false, daysRemaining: 0 };
      }

      const subscription = await this.getShopSubscription(shops[0].id);
      if (!subscription) {
        return { expired: false, daysRemaining: 0 };
      }

      // Check if it's a trial subscription
      if (subscription.status !== 'trial' || !subscription.trialEndsAt) {
        return { expired: false, daysRemaining: 0 };
      }

      const now = new Date();
      const trialEnd = new Date(subscription.trialEndsAt);
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        expired: now > trialEnd,
        daysRemaining: Math.max(0, daysRemaining),
        trialEndsAt: subscription.trialEndsAt,
      };
    } catch (error) {
      this.logger.warn(`[isTrialExpired] Error checking trial: ${error.message}`);
      return { expired: false, daysRemaining: 0 };
    }
  }

  /**
   * Get shop subscription
   */
  async getShopSubscription(shopId: string): Promise<any | null> {
    const subscriptions = await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .select('*')
      .where('shop_id', shopId)
      .orderBy('created_at', 'DESC')
      .limit(1)
      .get();

    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }

    const subscription = subscriptions[0];
    const plan = await this.getPlan(subscription.plan_id);

    return this.transformSubscription(subscription, plan);
  }

  /**
   * Change subscription plan
   */
  async changePlan(shopId: string, dto: ChangePlanDto): Promise<any> {
    const currentSubscription = await this.getShopSubscription(shopId);

    if (!currentSubscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (!['active', 'trial'].includes(currentSubscription.status)) {
      throw new BadRequestException('Cannot change plan for inactive subscription');
    }

    const newPlan = await this.getPlan(dto.planId);

    if (!newPlan.isActive) {
      throw new BadRequestException('Selected plan is not available');
    }

    // Check if downgrading would exceed new limits
    if (newPlan.maxProducts !== null && currentSubscription.productsUsed > newPlan.maxProducts) {
      throw new BadRequestException(`New plan allows only ${newPlan.maxProducts} products. Please remove some products first.`);
    }

    const billingCycle = dto.billingCycle || currentSubscription.billingCycle;

    // Update subscription
    await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .where('id', currentSubscription.id)
      .update({
        plan_id: dto.planId,
        billing_cycle: billingCycle,
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.getShopSubscription(shopId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(shopId: string, dto: CancelSubscriptionDto): Promise<any> {
    const subscription = await this.getShopSubscription(shopId);

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (!['active', 'trial'].includes(subscription.status)) {
      throw new BadRequestException('Subscription is not active');
    }

    const atPeriodEnd = dto.atPeriodEnd !== false;

    if (atPeriodEnd) {
      // Cancel at end of billing period
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .where('id', subscription.id)
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      // Cancel immediately
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_subscriptions')
        .where('id', subscription.id)
        .update({
          status: SubscriptionStatus.CANCELLED,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.getShopSubscription(shopId);
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(shopId: string): Promise<any> {
    const subscription = await this.getShopSubscription(shopId);

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not scheduled for cancellation');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .where('id', subscription.id)
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.getShopSubscription(shopId);
  }

  // ============================================
  // USAGE TRACKING
  // ============================================

  /**
   * Check if shop can add more products
   */
  async canAddProduct(shopId: string): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
    const subscription = await this.getShopSubscription(shopId);

    if (!subscription) {
      return { allowed: false, reason: 'No active subscription' };
    }

    if (!['active', 'trial'].includes(subscription.status)) {
      return { allowed: false, reason: 'Subscription is not active' };
    }

    if (subscription.plan.maxProducts === null) {
      return { allowed: true }; // Unlimited
    }

    if (subscription.productsUsed >= subscription.plan.maxProducts) {
      return {
        allowed: false,
        reason: `Product limit reached (${subscription.plan.maxProducts})`,
        limit: subscription.plan.maxProducts,
        used: subscription.productsUsed,
      };
    }

    return { allowed: true, limit: subscription.plan.maxProducts, used: subscription.productsUsed };
  }

  /**
   * Increment product count
   */
  async incrementProductCount(shopId: string): Promise<void> {
    const subscription = await this.getShopSubscription(shopId);
    if (!subscription) return;

    await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .where('id', subscription.id)
      .update({
        products_used: subscription.productsUsed + 1,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Decrement product count
   */
  async decrementProductCount(shopId: string): Promise<void> {
    const subscription = await this.getShopSubscription(shopId);
    if (!subscription) return;

    await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .where('id', subscription.id)
      .update({
        products_used: Math.max(0, subscription.productsUsed - 1),
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  /**
   * Increment order count
   */
  async incrementOrderCount(shopId: string): Promise<void> {
    const subscription = await this.getShopSubscription(shopId);
    if (!subscription) return;

    await /* TODO: replace client call */ this.db.client.query
      .from('shop_subscriptions')
      .where('id', subscription.id)
      .update({
        orders_this_month: subscription.ordersThisMonth + 1,
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  // ============================================
  // INVOICES
  // ============================================

  /**
   * Get subscription invoices
   */
  async getInvoices(shopId: string, limit: number = 20): Promise<any[]> {
    const invoices = await /* TODO: replace client call */ this.db.client.query
      .from('subscription_invoices')
      .select('*')
      .where('shop_id', shopId)
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .get();

    return (invoices || []).map(this.transformInvoice);
  }

  // ============================================
  // TRANSFORMERS
  // ============================================

  private transformPlan(plan: any): any {
    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      badgeColor: plan.badge_color,
      priceMonthly: parseFloat(plan.price_monthly) || 0,
      priceYearly: plan.price_yearly ? parseFloat(plan.price_yearly) : null,
      currency: plan.currency,
      trialDays: plan.trial_days || 0,
      maxProducts: plan.max_products,
      maxOrdersPerMonth: plan.max_orders_per_month,
      maxTeamMembers: plan.max_team_members || 1,
      commissionRate: parseFloat(plan.commission_rate) || 0,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || [],
      hasAnalytics: plan.has_analytics,
      hasPrioritySupport: plan.has_priority_support,
      hasCustomDomain: plan.has_custom_domain,
      hasApiAccess: plan.has_api_access,
      hasBulkUpload: plan.has_bulk_upload,
      hasPromotions: plan.has_promotions,
      isActive: plan.is_active,
      isFeatured: plan.is_featured,
      sortOrder: plan.sort_order,
      stripePriceIdMonthly: plan.stripe_price_id_monthly,
      stripePriceIdYearly: plan.stripe_price_id_yearly,
      createdAt: plan.created_at,
    };
  }

  private transformSubscription(subscription: any, plan: any): any {
    return {
      id: subscription.id,
      shopId: subscription.shop_id,
      planId: subscription.plan_id,
      plan,
      billingCycle: subscription.billing_cycle,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      trialEndsAt: subscription.trial_ends_at,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelledAt: subscription.cancelled_at,
      stripeSubscriptionId: subscription.stripe_subscription_id,
      lastPaymentAt: subscription.last_payment_at,
      nextPaymentAt: subscription.next_payment_at,
      productsUsed: subscription.products_used || 0,
      ordersThisMonth: subscription.orders_this_month || 0,
      usageResetAt: subscription.usage_reset_at,
      createdAt: subscription.created_at,
    };
  }

  private transformInvoice(invoice: any): any {
    return {
      id: invoice.id,
      subscriptionId: invoice.subscription_id,
      shopId: invoice.shop_id,
      invoiceNumber: invoice.invoice_number,
      amount: parseFloat(invoice.amount) || 0,
      currency: invoice.currency,
      taxAmount: parseFloat(invoice.tax_amount) || 0,
      totalAmount: parseFloat(invoice.total_amount) || 0,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      status: invoice.status,
      paidAt: invoice.paid_at,
      invoicePdfUrl: invoice.invoice_pdf_url,
      createdAt: invoice.created_at,
    };
  }
}

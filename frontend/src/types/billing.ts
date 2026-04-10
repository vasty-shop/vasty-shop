/**
 * Billing Types
 * Type definitions for subscription, plans, invoices, and payment methods
 */

export type PlanTier = 'free' | 'starter' | 'pro' | 'business';
export type BillingInterval = 'month' | 'year';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type AnalyticsTier = 'none' | 'basic' | 'advanced' | 'full';
export type ThemeTier = 'basic' | 'premium';

/**
 * Comprehensive plan features configuration
 * All plan restrictions and features are defined here
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
    mobileApp: true, // Full mobile app (All panels)
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

/**
 * Get plan features for a given plan tier
 * Defaults to 'free' if plan is not found
 */
export const getPlanFeatures = (plan?: PlanTier | string | null): PlanFeatures => {
  const normalizedPlan = (plan?.toLowerCase() || 'free') as PlanTier;
  return PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free;
};

/**
 * Get plan limits for a given plan tier (legacy)
 * Defaults to 'free' if plan is not found
 */
export const getPlanLimits = (plan?: PlanTier | null): { stores: number; products: number } => {
  return PLAN_LIMITS[plan || 'free'] || PLAN_LIMITS.free;
};

/**
 * Check if user can create more stores based on their plan
 */
export const canCreateStore = (currentStoreCount: number, plan?: PlanTier | null): boolean => {
  const features = getPlanFeatures(plan);
  if (features.stores === -1) return true;
  return currentStoreCount < features.stores;
};

/**
 * Check if user can add more products based on their plan
 */
export const canAddProduct = (currentProductCount: number, plan?: PlanTier | null): boolean => {
  const features = getPlanFeatures(plan);
  if (features.products === -1) return true;
  return currentProductCount < features.products;
};

/**
 * Check if user can add more team members
 */
export const canAddTeamMember = (currentMemberCount: number, plan?: PlanTier | null): boolean => {
  const features = getPlanFeatures(plan);
  return currentMemberCount < features.teamMembers;
};

/**
 * Check if user has custom domain access
 */
export const hasCustomDomainAccess = (plan?: PlanTier | null): boolean => {
  return getPlanFeatures(plan).customDomain;
};

/**
 * Check if user has premium themes access
 */
export const hasPremiumThemesAccess = (plan?: PlanTier | null): boolean => {
  return getPlanFeatures(plan).premiumThemes;
};

/**
 * Get analytics tier for plan
 */
export const getAnalyticsTier = (plan?: PlanTier | null): AnalyticsTier => {
  return getPlanFeatures(plan).analytics;
};

/**
 * Check if user has mobile app access
 */
export const hasMobileAppAccess = (plan?: PlanTier | null): boolean => {
  return getPlanFeatures(plan).mobileApp;
};

/**
 * Check if user has API access
 */
export const hasApiAccess = (plan?: PlanTier | null): boolean => {
  return getPlanFeatures(plan).apiAccess;
};

/**
 * Check if user has white-label access
 */
export const hasWhiteLabelAccess = (plan?: PlanTier | null): boolean => {
  return getPlanFeatures(plan).whiteLabel;
};

/**
 * Check if user has promotions access
 */
export const hasPromotionsAccess = (plan?: PlanTier | null): boolean => {
  return getPlanFeatures(plan).promotions;
};

/**
 * Get remaining stores allowed
 */
export const getRemainingStores = (currentStoreCount: number, plan?: PlanTier | null): number => {
  const features = getPlanFeatures(plan);
  if (features.stores === -1) return Infinity;
  return Math.max(0, features.stores - currentStoreCount);
};

/**
 * Get remaining products allowed
 */
export const getRemainingProducts = (currentProductCount: number, plan?: PlanTier | null): number => {
  const features = getPlanFeatures(plan);
  if (features.products === -1) return Infinity;
  return Math.max(0, features.products - currentProductCount);
};

/**
 * Get remaining team members allowed
 */
export const getRemainingTeamMembers = (currentMemberCount: number, plan?: PlanTier | null): number => {
  const features = getPlanFeatures(plan);
  return Math.max(0, features.teamMembers - currentMemberCount);
};
export type InvoiceStatus = 'paid' | 'pending' | 'failed';
export type PaymentMethodType = 'card' | 'bank_account';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  interval?: BillingInterval;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  trialEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  stripePriceId: string | null;
  stripePriceIdYearly?: string | null;
  interval: BillingInterval;
  price: number; // Monthly price in cents
  yearlyPrice?: number; // Yearly price in cents
  currency: string;
  features: string[];
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  invoiceUrl?: string;
  receiptUrl?: string;
  description?: string;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface CreateCheckoutRequest {
  priceId: string;
  trialPeriodDays?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd: boolean;
  reason?: string;
}

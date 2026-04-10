'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check,
  X,
  Sparkles,
  Star,
  Zap,
  Crown,
  ArrowRight,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { usePlans } from '@/lib/api/billing-api';
import type { SubscriptionPlan } from '@/types/billing';

// Fallback plans if API fails - Multi-vendor marketplace pricing
// Vendors create stores - pricing based on store & product limits
// Competitive pricing for new marketplace platform
const fallbackPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Start your first store',
    price: 0,
    yearlyPrice: 0,
    currency: 'USD',
    interval: 'month',
    stripePriceId: null,
    stripePriceIdYearly: null,
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
    price: 2999, // cents ($29.99/month displayed)
    yearlyPrice: 29999, // cents ($299.99/year = 2 months free)
    currency: 'USD',
    interval: 'month',
    stripePriceId: null,
    stripePriceIdYearly: null,
    features: [
      '2 stores with unlimited products',
      'Custom domain',
      'Premium storefront themes',
      'Basic analytics dashboard',
      '2 team members',
      'Email support',
      'Full mobile app (All panels)',
    ],
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Grow your business',
    price: 7999, // cents ($79.99/month displayed)
    yearlyPrice: 79999, // cents ($799.99/year = 2 months free)
    currency: 'USD',
    interval: 'month',
    stripePriceId: null,
    stripePriceIdYearly: null,
    features: [
      '5 stores with unlimited products',
      'Custom domain per store',
      'Advanced analytics & reports',
      '5 team members',
      'Priority support (Email & Chat)',
      'Full mobile app (All panels)',
      'Advanced promotions & campaigns',
    ],
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Scale without limits',
    price: 19999, // cents ($199.99/month displayed)
    yearlyPrice: 199999, // cents ($1999.99/year = 2 months free)
    currency: 'USD',
    interval: 'month',
    stripePriceId: null,
    stripePriceIdYearly: null,
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

const comparisonData = [
  { feature: 'Monthly platform fee', shopify: '$39-$399', vasty: '$0-$199.99', winner: 'vasty' },
  { feature: 'Free store creation', shopify: 'No free plan', vasty: '1 free store', winner: 'vasty' },
  { feature: 'Transaction fees', shopify: '2.4-2.9% + 30¢', vasty: 'No fees', winner: 'vasty' },
  { feature: 'Marketplace traffic', shopify: 'Not included', vasty: 'Built-in marketplace', winner: 'vasty' },
  { feature: 'Mobile app builder', shopify: '$299/mo add-on', vasty: 'Included (Pro+)', winner: 'vasty' },
  { feature: 'Multiple stores', shopify: 'Separate subscription each', vasty: 'Up to unlimited', winner: 'vasty' },
  { feature: 'Custom domain', shopify: 'All plans', vasty: 'Starter+ plans', winner: 'shopify' },
  { feature: 'Team members', shopify: '2-15 accounts', vasty: '1-15 members', winner: 'tie' },
];

// Plan icons mapping
const planIcons: Record<string, React.ReactNode> = {
  free: <Zap className="w-6 h-6" />,
  starter: <Zap className="w-6 h-6" />,
  basic: <Zap className="w-6 h-6" />,
  pro: <Star className="w-6 h-6" />,
  business: <Crown className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
  enterprise: <Crown className="w-6 h-6" />,
};

// Plan gradients mapping
const planGradients: Record<string, string> = {
  free: 'from-slate-500 to-slate-600',
  starter: 'from-blue-500 to-indigo-600',
  basic: 'from-slate-500 to-slate-600',
  pro: 'from-primary-lime to-emerald-500',
  business: 'from-purple-500 to-pink-500',
  premium: 'from-purple-500 to-pink-500',
  enterprise: 'from-amber-500 to-orange-500',
};

export function PricingSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { settings } = usePlatformSettings();
  const [showComparison, setShowComparison] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  // Fetch plans from API
  const { data: apiPlans = [], isLoading: plansLoading } = usePlans();

  // Use fallback plans (TODO: update backend prices to match)
  const plans = fallbackPlans;

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const dollars = amount / 100;
    // Show decimals only if price has cents (e.g. $29.99), not for whole dollars (e.g. $25)
    const hasDecimals = dollars % 1 !== 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(dollars);
  };

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { plan: planId } });
    } else {
      navigate('/vendor/create-shop', { state: { plan: planId } });
    }
  };

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-lime/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-white/90">{t('landing.pricing.badge')}</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('landing.pricing.title')} <span className="bg-gradient-to-r from-primary-lime to-emerald-400 bg-clip-text text-transparent">{t('landing.pricing.titleHighlight')}</span> {t('landing.pricing.titleEnd')}
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </motion.div>

        {/* Billing Period Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-lime text-white shadow-lg shadow-primary-lime/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('landing.pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-primary-lime text-white shadow-lg shadow-primary-lime/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('landing.pricing.yearly')}
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                {t('landing.pricing.save2Months', { defaultValue: '2 months free' })}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {plansLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
          </div>
        ) : (
          <>
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
              {plans.map((plan, index) => {
                const icon = planIcons[plan.id] || <Zap className="w-6 h-6" />;
                const gradient = planGradients[plan.id] || 'from-slate-500 to-slate-600';

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.15 }}
                    className={`relative ${plan.isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
                  >
                    {/* Popular Badge */}
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-primary-lime to-emerald-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {t('landing.pricing.mostPopular')}
                        </div>
                      </div>
                    )}

                    <div className={`h-full bg-white/5 backdrop-blur-sm border rounded-3xl p-8 transition-all hover:bg-white/10 ${
                      plan.isPopular
                        ? 'border-primary-lime/50 shadow-xl shadow-primary-lime/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                          {icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{t(`landing.pricing.${plan.id}.name`, { defaultValue: plan.name })}</h3>
                          <p className="text-sm text-white/60">{t(`landing.pricing.${plan.id}.description`, { defaultValue: plan.description })}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        {billingPeriod === 'yearly' && plan.yearlyPrice !== undefined && plan.price > 0 ? (
                          <>
                            {/* Discounted monthly price */}
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-4xl font-bold text-white">
                                {formatCurrency(Math.round(plan.yearlyPrice / 12), plan.currency)}
                              </span>
                              <span className="text-white/60">/{t('landing.pricing.perMonth', { defaultValue: 'month' }).replace('/', '')}</span>
                            </div>
                            {/* 2 months free badge on its own line */}
                            <div className="mt-2 text-center">
                              <span className="inline-block px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                {t('landing.pricing.save2Months', { defaultValue: '2 months free' })}
                              </span>
                            </div>
                            {/* Original yearly price crossed out + discounted yearly price */}
                            <div className="text-sm mt-2 flex items-center gap-2">
                              <span className="text-white/40 line-through">
                                {formatCurrency(plan.price * 12, plan.currency)}/{t('landing.pricing.perYear', { defaultValue: 'year' })}
                              </span>
                              <span className="text-primary-lime font-medium">
                                {formatCurrency(plan.yearlyPrice, plan.currency)}/{t('landing.pricing.perYear', { defaultValue: 'year' })}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Monthly price display */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold text-white">
                                {formatCurrency(plan.price, plan.currency)}
                              </span>
                              <span className="text-white/60">
                                /{t('landing.pricing.perMonth', { defaultValue: 'month' }).replace('/', '')}
                              </span>
                            </div>
                            {plan.price > 0 && plan.yearlyPrice && (
                              <div className="text-sm text-white/40 mt-2">
                                {formatCurrency(plan.price * 12, plan.currency)}/{t('landing.pricing.perYear', { defaultValue: 'year' })} {t('landing.pricing.billedMonthly', { defaultValue: 'billed monthly' })}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-start gap-2 text-white/70"
                          >
                            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary-lime" />
                            <span className="text-sm">{t(`landing.pricing.${plan.id}.feature${featureIndex + 1}`, { defaultValue: feature })}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`w-full py-6 font-semibold group ${
                          plan.isPopular
                            ? 'bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white shadow-lg shadow-primary-lime/30'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {plan.id === 'free' ? t('landing.pricing.startFree') : t('landing.pricing.getStarted')}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Comparison Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span>{t('landing.pricing.compareWithShopify')}</span>
          </button>
        </motion.div>

        {/* Comparison Table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 border-b border-white/10">
                <div className="text-white/60 font-medium">{t('landing.pricing.comparison.feature')}</div>
                <div className="text-center text-white/60 font-medium">Shopify</div>
                <div className="text-center text-primary-lime font-medium">{settings?.platformName || 'Vasty'}</div>
              </div>
              {comparisonData.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 gap-4 p-4 ${
                    index < comparisonData.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="text-white/80">{row.feature}</div>
                  <div className="text-center text-white/60">{row.shopify}</div>
                  <div className={`text-center font-medium ${
                    row.winner === 'vasty' ? 'text-primary-lime' : row.winner === 'tie' ? 'text-white/80' : 'text-white/80'
                  }`}>
                    {row.vasty}
                    {row.winner === 'vasty' && <span className="ml-1">✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-primary-lime/10 to-emerald-500/10 border border-primary-lime/20 rounded-2xl text-center">
              <p className="text-white mb-2">
                <strong className="text-primary-lime">{t('landing.pricing.comparison.typicalSavings', { defaultValue: 'Average savings' })}:</strong> {t('landing.pricing.comparison.savingsDescription', { defaultValue: 'Up to $3,000-$5,000/year vs Shopify when including apps, themes, and transaction fees' })}
              </p>
              <p className="text-white/60 text-sm">
                {t('landing.pricing.comparison.yearlyBack', { defaultValue: 'Most sellers save 40-60% compared to Shopify within the first year' })}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default PricingSection;

/**
 * Billing Page
 * Manage subscription, billing information, and invoices
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import {
  CreditCard,
  Download,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Check,
  Zap,
  Plus,
  Trash2,
  CreditCardIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// API & Types
import {
  useSubscription,
  usePlans,
  useInvoices,
  usePaymentMethods,
  useCancelSubscription,
  useResumeSubscription,
  useCreateCheckout,
  useDeletePaymentMethod,
  useCreateSetupSession,
  useSyncSubscription,
} from '@/lib/api/billing-api';
import type { SubscriptionPlan, PaymentMethod } from '@/types/billing';

// Fallback plans if API fails - same as PricingSection
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

const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Set shop context immediately (synchronously) so API calls have it
  if (shopId) {
    api.setShopId(shopId);
  }

  // Also set in useEffect for subsequent renders
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isSyncing, setIsSyncing] = useState(false);
  const [invoicePage, setInvoicePage] = useState(1);
  const invoicesPerPage = 5;

  // Helper to get translated features for a plan
  const getTranslatedFeatures = (planId: string): string[] => {
    const featureCount = planId === 'free' ? 6 : 7;
    const features: string[] = [];
    for (let i = 1; i <= featureCount; i++) {
      const key = `landing.pricing.${planId}.feature${i}`;
      const translated = t(key);
      // Only add if translation exists (not returning the key itself)
      if (translated && translated !== key) {
        features.push(translated);
      }
    }
    return features.length > 0 ? features : fallbackPlans.find(p => p.id === planId)?.features || [];
  };

  // Fetch data from API with fallbacks
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscription();
  const { data: plansData } = usePlans();
  const { data: invoicesResponse, isLoading: invoicesLoading } = useInvoices({
    page: invoicePage,
    limit: invoicesPerPage
  });
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethods();

  // Mutations
  const cancelMutation = useCancelSubscription();
  const resumeMutation = useResumeSubscription();
  const checkoutMutation = useCreateCheckout();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const setupSessionMutation = useCreateSetupSession();
  const syncMutation = useSyncSubscription();

  // Sync subscription from Stripe after successful payment
  useEffect(() => {
    const success = searchParams.get('success');

    if (success === 'true') {
      // Remove success param immediately to prevent re-triggering
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });

      // Sync subscription
      setIsSyncing(true);
      console.log('[BillingPage] Starting subscription sync...');

      syncMutation.mutateAsync()
        .then((result) => {
          console.log('[BillingPage] Sync successful:', result);
          toast.success(t('vendor.billing.subscriptionUpdated', 'Subscription updated successfully!'));
        })
        .catch((error) => {
          console.error('[BillingPage] Failed to sync subscription:', error);
          toast.error('Failed to sync subscription. Please try again.');
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }, []); // Empty deps - only run once on mount

  // Manual sync handler for debugging
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      console.log('[BillingPage] Manual sync starting...');
      const result = await syncMutation.mutateAsync();
      console.log('[BillingPage] Manual sync result:', result);
      toast.success('Subscription synced successfully!');
    } catch (error) {
      console.error('[BillingPage] Manual sync failed:', error);
      toast.error('Failed to sync subscription');
    } finally {
      setIsSyncing(false);
    }
  };

  // Use API data or fallback to static plans with translated features
  const plans = (plansData && plansData.length > 0 ? plansData : fallbackPlans).map(plan => ({
    ...plan,
    name: t(`landing.pricing.${plan.id}.name`, plan.name),
    description: t(`landing.pricing.${plan.id}.description`, plan.description),
    features: getTranslatedFeatures(plan.id),
  }));

  // Use API subscription or default free plan
  const subscription = subscriptionData || {
    id: 'default',
    plan: 'free',
    status: 'active' as const,
    interval: 'month' as 'month' | 'year',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date().toISOString(),
    cancelAtPeriodEnd: false,
  };

  const invoices = invoicesResponse?.invoices || [];
  const totalInvoices = invoicesResponse?.total || 0;
  const totalInvoicePages = Math.ceil(totalInvoices / invoicesPerPage);
  const paymentMethods = paymentMethodsData || [];

  // Get current plan details
  const currentPlan = plans.find(p => p.id === subscription?.plan) || plans.find(p => p.id === 'free');

  // Note: billingPeriod defaults to 'yearly' - we don't sync with current subscription
  // so users always see the yearly pricing (with 2 months free) by default

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    try {
      await cancelMutation.mutateAsync({
        cancelAtPeriodEnd: true,
      });
      toast.success(t('vendor.billing.subscriptionCanceled'), {
        description: t('vendor.billing.subscriptionCanceledDesc'),
      });
      setCancelDialogOpen(false);
    } catch (error) {
      toast.error(t('vendor.billing.failedToCancel'), {
        description: error instanceof Error ? error.message : t('common.tryAgain'),
      });
    }
  };

  // Handle resume subscription
  const handleResumeSubscription = async () => {
    try {
      await resumeMutation.mutateAsync();
      toast.success(t('vendor.billing.subscriptionResumed'), {
        description: t('vendor.billing.subscriptionResumedDesc'),
      });
    } catch (error) {
      toast.error(t('vendor.billing.failedToResume'), {
        description: error instanceof Error ? error.message : t('common.tryAgain'),
      });
    }
  };

  // Handle upgrade/downgrade
  const handleChangePlan = async (plan: SubscriptionPlan) => {
    // Free plan doesn't need checkout
    if (plan.id === 'free' || !plan.stripePriceId) {
      toast.info('Free plan', {
        description: 'You cannot downgrade to the free plan. Please contact support if you need to cancel your subscription.',
      });
      return;
    }

    // Get the correct price ID based on billing period
    const priceId = billingPeriod === 'yearly' && plan.stripePriceIdYearly
      ? plan.stripePriceIdYearly
      : plan.stripePriceId;

    if (!priceId) {
      toast.error('Invalid plan', {
        description: 'This plan is not available for the selected billing period.',
      });
      return;
    }

    setSelectedPlanForCheckout(plan.id);

    try {
      const { url } = await checkoutMutation.mutateAsync({
        priceId,
        successUrl: `${window.location.origin}${window.location.pathname}?success=true`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?canceled=true`,
      });

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast.error(t('vendor.billing.failedToStartCheckout'), {
        description: error instanceof Error ? error.message : t('common.tryAgain'),
      });
      setSelectedPlanForCheckout(null);
    }
  };

  // Handle add payment method
  const handleAddPaymentMethod = async () => {
    try {
      const { url } = await setupSessionMutation.mutateAsync();
      window.location.href = url;
    } catch (error) {
      toast.error(t('vendor.billing.failedToAddPaymentMethod'), {
        description: error instanceof Error ? error.message : t('common.tryAgain'),
      });
    }
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      await deletePaymentMethodMutation.mutateAsync(paymentMethodId);
      toast.success(t('vendor.billing.paymentMethodRemoved'));
    } catch (error) {
      toast.error(t('vendor.billing.failedToRemovePaymentMethod'), {
        description: error instanceof Error ? error.message : t('common.tryAgain'),
      });
    }
  };

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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      active: { className: 'bg-green-100 text-green-700 border border-green-200', label: 'Active' },
      trialing: { className: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'Trial' },
      canceled: { className: 'bg-red-100 text-red-700 border border-red-200', label: 'Canceled' },
      past_due: { className: 'bg-red-100 text-red-700 border border-red-200', label: 'Past Due' },
      paid: { className: 'bg-green-100 text-green-700 border border-green-200', label: 'Paid' },
      pending: { className: 'bg-yellow-100 text-yellow-700 border border-yellow-200', label: 'Pending' },
      failed: { className: 'bg-red-100 text-red-700 border border-red-200', label: 'Failed' },
    };

    const { className, label } = config[status] || { className: 'bg-gray-100 text-gray-600 border border-gray-200', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  // Get card brand icon
  const getCardBrandIcon = (brand?: string) => {
    // For simplicity, just show a generic card icon
    return <CreditCardIcon className="w-8 h-8 text-gray-400" />;
  };

  // Don't block on loading - we have fallbacks for everything

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('vendor.billing.title')}</h1>
        <p className="mt-1 text-gray-500">{t('vendor.billing.subtitle')}</p>
      </div>

      {/* Current Subscription Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <CreditCard className="w-5 h-5 text-primary-lime" />
          <h2 className="text-lg font-semibold text-gray-900">{t('vendor.billing.currentSubscription')}</h2>
        </div>

        {subscription && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{t('vendor.billing.plan')}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {currentPlan?.name || subscription.plan}
                  </p>
                  {getStatusBadge(subscription.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="ml-2"
                  >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync'}
                  </Button>
                </div>
              </div>

              {/* Billing Cycle */}
              {subscription.interval && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">{t('vendor.billing.billingCycle')}</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {subscription.interval === 'year' ? t('vendor.billing.yearly') : t('vendor.billing.monthly')}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Billing Date */}
              {subscription.plan !== 'free' && subscription.currentPeriodEnd && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    {subscription.cancelAtPeriodEnd ? t('vendor.billing.accessUntil') : t('vendor.billing.nextBillingDate')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {subscription.plan !== 'free' && (
              <div className="pt-4 border-t border-gray-100">
                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleResumeSubscription}
                    disabled={resumeMutation.isPending}
                    className="bg-primary-lime hover:bg-primary-lime/90"
                  >
                    {resumeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('vendor.billing.resuming')}
                      </>
                    ) : (
                      t('vendor.billing.resumeSubscription')
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={cancelMutation.isPending}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {t('vendor.billing.cancelSubscription')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('vendor.billing.availablePlans')}</h2>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-lime text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('vendor.billing.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-primary-lime text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t('vendor.billing.yearly')}
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                {t('vendor.billing.save2Months', { defaultValue: '2 months free' })}
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isLoading = selectedPlanForCheckout === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 bg-white transition-all ${
                  plan.isPopular
                    ? 'border-primary-lime shadow-lg shadow-primary-lime/10'
                    : isCurrentPlan
                    ? 'border-primary-lime/50 bg-primary-lime/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-lime text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      {t('vendor.billing.popular')}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                  <div className="mt-4">
                    {billingPeriod === 'yearly' && plan.yearlyPrice !== undefined && plan.price > 0 ? (
                      <>
                        {/* Discounted monthly price */}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatCurrency(Math.round(plan.yearlyPrice / 12), plan.currency)}
                          </span>
                          <span className="text-gray-500">/{t('vendor.billing.month')}</span>
                        </div>
                        {/* 2 months free badge on its own line */}
                        <div className="mt-2">
                          <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {t('vendor.billing.save2Months', { defaultValue: '2 months free' })}
                          </span>
                        </div>
                        {/* Original yearly price crossed out + discounted yearly price */}
                        <div className="text-sm mt-2 flex items-center justify-center gap-2">
                          <span className="text-gray-400 line-through">
                            {formatCurrency(plan.price * 12, plan.currency)}/{t('vendor.billing.year')}
                          </span>
                          <span className="text-primary-lime font-medium">
                            {formatCurrency(plan.yearlyPrice, plan.currency)}/{t('vendor.billing.year')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Monthly price display */}
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            {formatCurrency(plan.price, plan.currency)}
                          </span>
                          <span className="text-gray-500">/{t('vendor.billing.month')}</span>
                        </div>
                        {plan.price > 0 && plan.yearlyPrice && (
                          <div className="text-sm text-gray-400 mt-2">
                            {formatCurrency(plan.price * 12, plan.currency)}/{t('vendor.billing.year')} {t('vendor.billing.billedMonthly', { defaultValue: 'billed monthly' })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-primary-lime mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleChangePlan(plan)}
                  disabled={isCurrentPlan || isLoading || plan.id === 'free'}
                  className={`mt-6 w-full ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.isPopular
                      ? 'bg-primary-lime hover:bg-primary-lime/90'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    t('vendor.billing.currentPlan')
                  ) : plan.id === 'free' ? (
                    t('vendor.billing.freePlan')
                  ) : (
                    t('vendor.billing.upgrade')
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('vendor.billing.paymentMethods')}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPaymentMethod}
            disabled={setupSessionMutation.isPending}
            className="gap-2"
          >
            {setupSessionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {t('vendor.billing.addMethod')}
          </Button>
        </div>

        {paymentMethodsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getCardBrandIcon(method.brand)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1) : 'Card'} {t('vendor.billing.cardEndingIn')} {method.last4}
                    </p>
                    {method.expiryMonth && method.expiryYear && (
                      <p className="text-sm text-gray-500">
                        {t('vendor.billing.expires')} {method.expiryMonth}/{method.expiryYear}
                      </p>
                    )}
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 bg-primary-lime/10 text-primary-lime text-xs font-medium rounded-full">
                      {t('vendor.billing.default')}
                    </span>
                  )}
                </div>
                {!method.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    disabled={deletePaymentMethodMutation.isPending}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('vendor.billing.noPaymentMethods')}</p>
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('vendor.billing.invoiceHistory')}</h2>

        {invoicesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : invoices.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('vendor.billing.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('vendor.billing.description')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('vendor.billing.amount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('vendor.billing.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('vendor.billing.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.description || t('vendor.billing.subscriptionPayment')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invoice.invoiceUrl && (
                          <a
                            href={invoice.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-lime hover:text-primary-lime/80 flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            {t('vendor.billing.download')}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalInvoicePages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                <p className="text-sm text-gray-500">
                  {t('vendor.billing.showingInvoices', {
                    from: (invoicePage - 1) * invoicesPerPage + 1,
                    to: Math.min(invoicePage * invoicesPerPage, totalInvoices),
                    total: totalInvoices,
                    defaultValue: `Showing ${(invoicePage - 1) * invoicesPerPage + 1} to ${Math.min(invoicePage * invoicesPerPage, totalInvoices)} of ${totalInvoices} invoices`
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoicePage(p => Math.max(1, p - 1))}
                    disabled={invoicePage === 1 || invoicesLoading}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('common.previous', 'Previous')}
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    {invoicePage} / {totalInvoicePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInvoicePage(p => Math.min(totalInvoicePages, p + 1))}
                    disabled={invoicePage === totalInvoicePages || invoicesLoading}
                    className="gap-1"
                  >
                    {t('common.next', 'Next')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('vendor.billing.noInvoices')}</p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('vendor.billing.cancelSubscription')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('vendor.billing.cancelConfirmMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                {t('vendor.billing.keepSubscription')}
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={cancelMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('vendor.billing.canceling')}
                  </>
                ) : (
                  t('vendor.billing.yesCancel')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { BillingPage };
export default BillingPage;

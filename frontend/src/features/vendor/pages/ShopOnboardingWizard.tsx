'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Mail,
  FileText,
  CheckCircle,
  ChevronDown,
  Sparkles,
  Package,
  Shirt,
  Utensils,
  Laptop,
  Home,
  Heart,
  Palette,
  Dumbbell,
  Car,
  BookOpen,
  Gift,
  Check,
  Globe,
  Languages,
  Crown,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useShopStore } from '@/stores/useShopStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { VendorShop } from '@/features/vendor-auth/types';
import { useTranslation } from 'react-i18next';
import { useSubscription, useCreateCheckout } from '@/lib/api/billing-api';
import { PlanTier, getPlanLimits, canCreateStore } from '@/types/billing';
import type { SubscriptionPlan } from '@/types/billing';

// Fallback plans - same as BillingPage
// Yearly = 10 months (2 months free)
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
    price: 2999, // $29.99/month
    yearlyPrice: 29999, // $299.99/year = 2 months free (10 months)
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_starter_monthly',
    stripePriceIdYearly: 'price_starter_yearly',
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
    price: 7999, // $79.99/month
    yearlyPrice: 79999, // $799.99/year = 2 months free (10 months)
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_pro_monthly',
    stripePriceIdYearly: 'price_pro_yearly',
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
    price: 19999, // $199.99/month
    yearlyPrice: 199999, // $1999.99/year = 2 months free (10 months)
    currency: 'USD',
    interval: 'month',
    stripePriceId: 'price_business_monthly',
    stripePriceIdYearly: 'price_business_yearly',
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

// Store type options
const storeTypes = [
  { id: 'fashion', name: 'Fashion & Apparel', icon: Shirt, color: 'from-pink-500 to-rose-500' },
  { id: 'electronics', name: 'Electronics & Tech', icon: Laptop, color: 'from-blue-500 to-cyan-500' },
  { id: 'home', name: 'Home & Living', icon: Home, color: 'from-amber-500 to-orange-500' },
  { id: 'food', name: 'Food & Beverages', icon: Utensils, color: 'from-green-500 to-emerald-500' },
  { id: 'beauty', name: 'Beauty & Wellness', icon: Heart, color: 'from-purple-500 to-pink-500' },
  { id: 'art', name: 'Art & Crafts', icon: Palette, color: 'from-indigo-500 to-purple-500' },
  { id: 'sports', name: 'Sports & Outdoors', icon: Dumbbell, color: 'from-red-500 to-orange-500' },
  { id: 'automotive', name: 'Automotive', icon: Car, color: 'from-slate-500 to-gray-500' },
  { id: 'books', name: 'Books & Media', icon: BookOpen, color: 'from-yellow-500 to-amber-500' },
  { id: 'gifts', name: 'Gifts & Occasions', icon: Gift, color: 'from-rose-500 to-pink-500' },
  { id: 'general', name: 'General Store', icon: Package, color: 'from-primary-lime to-emerald-500' },
  { id: 'other', name: 'Other', icon: Store, color: 'from-gray-500 to-slate-500' },
];

// Country codes
const COUNTRIES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
];

// Supported languages matching i18n configuration
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
];

interface WizardData {
  storeType: string;
  name: string;
  description: string;
  businessEmail: string;
  businessName: string;
  businessType: 'individual' | 'llc' | 'corporation';
  countryCode: string;
  businessPhone: string;
  template: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

// Steps will be translated inside component
const stepKeys = ['storeType', 'storeDetails', 'businessInfo', 'review'] as const;

export const ShopOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addShop, setCurrentShop, ownedShopsCount, fetchUserShops } = useShopStore();
  const { t, i18n } = useTranslation();
  const { data: subscription } = useSubscription();

  // Checkout mutation for Stripe
  const checkoutMutation = useCreateCheckout();

  // Plan and limit checking
  const currentPlan = (subscription?.plan as PlanTier) || 'free';
  const planLimits = getPlanLimits(currentPlan);
  const canCreate = canCreateStore(ownedShopsCount, currentPlan);

  // Plan selection state
  const [showPlanModal, setShowPlanModal] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planSelected, setPlanSelected] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null); // Track which plan is loading

  // Helper to format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const dollars = amount / 100;
    const hasDecimals = dollars % 1 !== 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(dollars);
  };

  // Helper to get translated features for a plan
  const getTranslatedFeatures = (planId: string): string[] => {
    const featureCount = planId === 'free' ? 6 : 7;
    const features: string[] = [];
    for (let i = 1; i <= featureCount; i++) {
      const key = `landing.pricing.${planId}.feature${i}`;
      const translated = t(key);
      if (translated && translated !== key) {
        features.push(translated);
      }
    }
    return features.length > 0 ? features : fallbackPlans.find(p => p.id === planId)?.features || [];
  };

  // Plans with translations
  const plans = fallbackPlans.map(plan => ({
    ...plan,
    name: t(`landing.pricing.${plan.id}.name`, plan.name),
    description: t(`landing.pricing.${plan.id}.description`, plan.description),
    features: getTranslatedFeatures(plan.id),
  }));

  // Translated steps
  const steps = stepKeys.map((key, index) => ({
    id: index + 1,
    title: t(`vendor.createShop.wizard.steps.${key}`),
  }));

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [wizardData, setWizardData] = useState<WizardData>({
    storeType: '',
    name: '',
    description: '',
    businessEmail: user?.email || '',
    businessName: '',
    businessType: 'individual',
    countryCode: '+1',
    businessPhone: '',
    template: 'ai-builder',
    defaultLanguage: i18n.language?.split('-')[0] || 'en',
    supportedLanguages: [i18n.language?.split('-')[0] || 'en'],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/vendor/create-shop' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's shops on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserShops();
    }
  }, [isAuthenticated, fetchUserShops]);

  // Hide plan modal for paid users
  useEffect(() => {
    const isPaidPlan = subscription?.plan && ['starter', 'pro', 'business'].includes(subscription.plan);
    if (isPaidPlan) {
      setShowPlanModal(false);
      setPlanSelected(true);
    }
  }, [subscription?.plan]);

  // Handle checkout success/cancel from Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');
    const planFromUrl = urlParams.get('plan');

    if (checkoutStatus === 'success') {
      // Payment successful - proceed to wizard
      toast.success(t('vendor.billing.paymentSuccessful', {
        defaultValue: 'Payment successful! You can now create your store.'
      }));
      setShowPlanModal(false);
      setPlanSelected(true);
      if (planFromUrl) {
        setSelectedPlan(planFromUrl);
      }
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutStatus === 'canceled') {
      // Payment canceled - show modal again
      toast.info(t('vendor.billing.paymentCanceled', {
        defaultValue: 'Payment was canceled. You can try again or start with a free plan.'
      }));
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [t]);

  // Pre-fill email
  useEffect(() => {
    if (user?.email && !wizardData.businessEmail) {
      setWizardData(prev => ({ ...prev, businessEmail: user.email || '' }));
    }
  }, [user?.email]);

  // Get current shop for billing redirect
  const { currentShop, shops } = useShopStore();
  const existingShopId = currentShop?.id || shops[0]?.id;

  // Handle plan selection - proceed directly to wizard with 2 months free trial for paid plans
  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setShowPlanModal(false);
    setPlanSelected(true);

    // Show trial info for paid plans
    if (planId !== 'free') {
      toast.success(t('vendor.createShop.planModal.trialStarted', {
        defaultValue: 'Great choice! You get 2 months free trial. Payment required after trial ends.'
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!wizardData.storeType) {
          newErrors.storeType = t('vendor.createShop.wizard.step1.error');
        }
        break;
      case 2:
        if (!wizardData.name.trim()) {
          newErrors.name = t('vendor.createShop.wizard.step2.storeNameError');
        } else if (wizardData.name.length < 3) {
          newErrors.name = t('vendor.createShop.wizard.step2.storeNameMinError');
        }
        break;
      case 3:
        if (!wizardData.businessEmail.trim()) {
          newErrors.businessEmail = t('vendor.createShop.wizard.step3.businessEmailError');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizardData.businessEmail)) {
          newErrors.businessEmail = t('vendor.createShop.wizard.step3.businessEmailInvalid');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDefaultLanguageChange = (langCode: string) => {
    setWizardData((prev) => {
      const updatedSupported = prev.supportedLanguages.includes(langCode)
        ? prev.supportedLanguages
        : [langCode, ...prev.supportedLanguages];
      return {
        ...prev,
        defaultLanguage: langCode,
        supportedLanguages: updatedSupported,
      };
    });
    setIsLanguageDropdownOpen(false);
  };

  const toggleSupportedLanguage = (langCode: string) => {
    setWizardData((prev) => {
      if (langCode === prev.defaultLanguage) return prev;
      const isSelected = prev.supportedLanguages.includes(langCode);
      const updatedSupported = isSelected
        ? prev.supportedLanguages.filter((l) => l !== langCode)
        : [...prev.supportedLanguages, langCode];
      return {
        ...prev,
        supportedLanguages: updatedSupported,
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload: Record<string, any> = {
        name: wizardData.name.trim(),
        business_email: wizardData.businessEmail.trim(),
        business_type: wizardData.businessType,
        category: wizardData.storeType,
        template: wizardData.template,
      };

      if (wizardData.description.trim()) {
        payload.description = wizardData.description.trim();
      }
      if (wizardData.businessName.trim()) {
        payload.business_name = wizardData.businessName.trim();
      }
      if (wizardData.businessPhone.trim()) {
        payload.business_phone = `${wizardData.countryCode}${wizardData.businessPhone.replace(/\D/g, '')}`;
      }

      // Add language settings
      payload.default_language = wizardData.defaultLanguage;
      payload.supported_languages = wizardData.supportedLanguages;

      // Add selected plan for trial subscription (2 months free for paid plans)
      if (selectedPlan) {
        payload.selected_plan = selectedPlan;
        payload.billing_period = billingPeriod;
      }

      const response = await apiClient.post<{ data: VendorShop } | VendorShop>('/shops', payload);

      let newShop: VendorShop;
      if ('data' in response.data && (response.data as { data: VendorShop }).data) {
        newShop = (response.data as { data: VendorShop }).data;
      } else {
        newShop = response.data as VendorShop;
      }

      addShop(newShop);
      setCurrentShop(newShop);

      toast.success(t('vendor.createShop.wizard.success'));

      // Navigate to vendor dashboard
      navigate(`/shop/${newShop.id}/vendor/dashboard`, { replace: true });
    } catch (error: any) {
      console.error('Failed to create shop:', error);
      const errorMessage = error.response?.data?.message || t('vendor.createShop.wizard.error');
      setErrors({ general: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage });
      toast.error(typeof errorMessage === 'string' ? errorMessage : t('vendor.createShop.wizard.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('vendor.createShop.wizard.step1.title')}</h2>
              <p className="text-gray-500">{t('vendor.createShop.wizard.step1.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {storeTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setWizardData(prev => ({ ...prev, storeType: type.id }))}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    wizardData.storeType === type.id
                      ? 'border-primary-lime bg-primary-lime/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {wizardData.storeType === type.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-lime flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3 mx-auto`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">{t(`vendor.createShop.wizard.storeTypes.${type.id}`)}</p>
                </motion.button>
              ))}
            </div>
            {errors.storeType && (
              <p className="text-red-500 text-sm text-center">{errors.storeType}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('vendor.createShop.wizard.step2.title')}</h2>
              <p className="text-gray-500">{t('vendor.createShop.wizard.step2.subtitle')}</p>
            </div>

            <div>
              <Label htmlFor="name">{t('vendor.createShop.wizard.step2.storeName')} <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  id="name"
                  value={wizardData.name}
                  onChange={(e) => setWizardData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('vendor.createShop.wizard.step2.storeNamePlaceholder')}
                  className={`pl-10 py-6 text-lg ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              <p className="mt-2 text-xs text-gray-500">
                {t('vendor.createShop.wizard.step2.storeUrlHint', { slug: wizardData.name.toLowerCase().replace(/\s+/g, '-') || 'your-store' })}
              </p>
            </div>

            <div>
              <Label htmlFor="description">{t('vendor.createShop.wizard.step2.description')}</Label>
              <div className="relative mt-2">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="description"
                  value={wizardData.description}
                  onChange={(e) => setWizardData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('vendor.createShop.wizard.step2.descriptionPlaceholder')}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none"
                />
              </div>
            </div>

            {/* Language Settings */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">{t('vendor.createShop.wizard.step2.languageSettings')}</span>
              </div>

              {/* Default Language */}
              <div className="mb-4">
                <Label htmlFor="defaultLanguage">{t('vendor.createShop.wizard.step2.defaultLanguage')}</Label>
                <div className="relative mt-2">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 bg-white text-left flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">
                        {LANGUAGES.find((l) => l.code === wizardData.defaultLanguage)?.flag}
                      </span>
                      <span>
                        {LANGUAGES.find((l) => l.code === wizardData.defaultLanguage)?.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({LANGUAGES.find((l) => l.code === wizardData.defaultLanguage)?.nativeName})
                      </span>
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {isLanguageDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsLanguageDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleDefaultLanguageChange(lang.code)}
                            className={`flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left ${
                              wizardData.defaultLanguage === lang.code ? 'bg-primary-lime/10' : ''
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm text-gray-900">{lang.name}</span>
                            <span className="text-sm text-gray-500">({lang.nativeName})</span>
                            {wizardData.defaultLanguage === lang.code && (
                              <Check className="w-4 h-4 text-primary-lime ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t('vendor.createShop.wizard.step2.defaultLanguageHint')}
                </p>
              </div>

              {/* Supported Languages */}
              <div>
                <Label>{t('vendor.createShop.wizard.step2.additionalLanguages')}</Label>
                <p className="text-xs text-gray-500 mb-2">
                  {t('vendor.createShop.wizard.step2.additionalLanguagesHint')}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LANGUAGES.map((lang) => {
                    const isDefault = wizardData.defaultLanguage === lang.code;
                    const isSelected = wizardData.supportedLanguages.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => toggleSupportedLanguage(lang.code)}
                        disabled={isDefault}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary-lime/10 border-primary-lime text-gray-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        } ${isDefault ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-lime" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('vendor.createShop.wizard.step3.title')}</h2>
              <p className="text-gray-500">{t('vendor.createShop.wizard.step3.subtitle')}</p>
            </div>

            <div>
              <Label htmlFor="businessEmail">{t('vendor.createShop.wizard.step3.businessEmail')} <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  id="businessEmail"
                  value={wizardData.businessEmail}
                  onChange={(e) => setWizardData(prev => ({ ...prev, businessEmail: e.target.value }))}
                  placeholder={t('vendor.createShop.wizard.step3.businessEmailPlaceholder')}
                  className={`pl-10 ${errors.businessEmail ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.businessEmail && <p className="mt-1 text-sm text-red-500">{errors.businessEmail}</p>}
            </div>

            <div>
              <Label htmlFor="businessName">{t('vendor.createShop.wizard.step3.businessName')}</Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  id="businessName"
                  value={wizardData.businessName}
                  onChange={(e) => setWizardData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder={t('vendor.createShop.wizard.step3.businessNamePlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessType">{t('vendor.createShop.wizard.step3.businessType')}</Label>
              <select
                id="businessType"
                value={wizardData.businessType}
                onChange={(e) => setWizardData(prev => ({ ...prev, businessType: e.target.value as any }))}
                className="w-full mt-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
              >
                <option value="individual">{t('vendor.createShop.wizard.step3.businessTypes.individual')}</option>
                <option value="llc">{t('vendor.createShop.wizard.step3.businessTypes.llc')}</option>
                <option value="corporation">{t('vendor.createShop.wizard.step3.businessTypes.corporation')}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="businessPhone">{t('vendor.createShop.wizard.step3.businessPhone')}</Label>
              <div className="flex mt-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center gap-1 h-10 px-3 border border-gray-200 border-r-0 rounded-l-xl bg-gray-50 hover:bg-gray-100 min-w-[90px]"
                  >
                    <span className="text-lg">
                      {COUNTRIES.find(c => c.code === wizardData.countryCode)?.flag || '🇺🇸'}
                    </span>
                    <span className="text-sm text-gray-700">{wizardData.countryCode}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {isCountryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsCountryDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.country}
                            type="button"
                            onClick={() => {
                              setWizardData(prev => ({ ...prev, countryCode: country.code }));
                              setIsCountryDropdownOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50"
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-sm text-gray-900">{country.name}</span>
                            <span className="text-sm text-gray-500 ml-auto">{country.code}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <Input
                  type="tel"
                  id="businessPhone"
                  value={wizardData.businessPhone}
                  onChange={(e) => setWizardData(prev => ({ ...prev, businessPhone: e.target.value }))}
                  placeholder={t('vendor.createShop.wizard.step3.businessPhonePlaceholder')}
                  className="flex-1 rounded-l-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        const selectedType = storeTypes.find(type => type.id === wizardData.storeType);

        return (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-lime to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('vendor.createShop.wizard.step4.title')}</h2>
              <p className="text-gray-500">{t('vendor.createShop.wizard.step4.subtitle')}</p>
            </div>

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">{t('vendor.createShop.wizard.step4.storeName')}</span>
                <span className="font-medium text-gray-900">{wizardData.name}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">{t('vendor.createShop.wizard.step4.category')}</span>
                <div className="flex items-center gap-2">
                  {selectedType && <selectedType.icon className="w-4 h-4 text-gray-600" />}
                  <span className="font-medium text-gray-900">{selectedType ? t(`vendor.createShop.wizard.storeTypes.${selectedType.id}`) : ''}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">{t('vendor.createShop.wizard.step4.businessEmail')}</span>
                <span className="font-medium text-gray-900">{wizardData.businessEmail}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">{t('vendor.createShop.wizard.step4.businessType')}</span>
                <span className="font-medium text-gray-900">{t(`vendor.createShop.wizard.step3.businessTypes.${wizardData.businessType}`)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500">{t('vendor.createShop.wizard.step4.languages')}</span>
                <div className="flex items-center gap-1">
                  {wizardData.supportedLanguages.map((langCode) => {
                    const lang = LANGUAGES.find((l) => l.code === langCode);
                    return (
                      <span
                        key={langCode}
                        className={`text-lg ${langCode === wizardData.defaultLanguage ? 'ring-2 ring-primary-lime rounded' : ''}`}
                        title={`${lang?.name}${langCode === wizardData.defaultLanguage ? ' (Default)' : ''}`}
                      >
                        {lang?.flag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-lime/10 to-emerald-500/10 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary-lime flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{t('vendor.createShop.wizard.step4.whatHappensNext')}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>{t('vendor.createShop.wizard.step4.nextSteps.step1')}</li>
                    <li>{t('vendor.createShop.wizard.step4.nextSteps.step2')}</li>
                    <li>{t('vendor.createShop.wizard.step4.nextSteps.step3')}</li>
                    <li>{t('vendor.createShop.wizard.step4.nextSteps.step4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // If plan not selected yet, only show the plan modal
  if (!planSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t('common.back', { defaultValue: 'Back' })}</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-lime to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('vendor.createShop.planModal.title', { defaultValue: 'Choose Your Plan' })}
              </h2>
              <p className="text-gray-600">
                {t('vendor.createShop.planModal.subtitle', { defaultValue: 'Select a plan to get started with your store' })}
              </p>
            </div>

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
                  {t('vendor.billing.monthly', { defaultValue: 'Monthly' })}
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    billingPeriod === 'yearly'
                      ? 'bg-primary-lime text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('vendor.billing.yearly', { defaultValue: 'Yearly' })}
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    {t('vendor.billing.save2Months', { defaultValue: '2 months free' })}
                  </span>
                </button>
              </div>
            </div>

            {/* Current Usage Warning */}
            {ownedShopsCount > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 font-medium">
                      {t('vendor.createShop.planModal.currentUsage', {
                        defaultValue: 'You currently have {{count}} store(s). Free plan allows only 1 store.',
                        count: ownedShopsCount
                      })}
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      {t('vendor.createShop.planModal.upgradeRequired', {
                        defaultValue: 'Upgrade to a paid plan to create more stores.'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Grid - Exactly like BillingPage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {plans.map((plan) => {
                const isDisabled = plan.id === 'free' && ownedShopsCount >= 1;
                const isSelected = selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => !isDisabled && setSelectedPlan(plan.id)}
                    className={`relative rounded-2xl border-2 p-6 bg-white transition-all cursor-pointer ${
                      plan.isPopular
                        ? 'border-primary-lime shadow-lg shadow-primary-lime/10'
                        : isSelected
                        ? 'border-primary-lime/50 bg-primary-lime/5'
                        : isDisabled
                        ? 'border-gray-100 opacity-60 cursor-not-allowed'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-lime text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          {t('vendor.billing.popular', { defaultValue: 'POPULAR' })}
                        </span>
                      </div>
                    )}

                    {isDisabled && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                        {t('vendor.createShop.planModal.limitReached', { defaultValue: 'Limit Reached' })}
                      </div>
                    )}

                    {isSelected && !isDisabled && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-primary-lime rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
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
                              <span className="text-gray-500">/{t('vendor.billing.month', { defaultValue: 'mo' })}</span>
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
                                {formatCurrency(plan.price * 12, plan.currency)}/{t('vendor.billing.year', { defaultValue: 'yr' })}
                              </span>
                              <span className="text-primary-lime font-medium">
                                {formatCurrency(plan.yearlyPrice, plan.currency)}/{t('vendor.billing.year', { defaultValue: 'yr' })}
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
                              <span className="text-gray-500">/{t('vendor.billing.month', { defaultValue: 'mo' })}</span>
                            </div>
                            {plan.price > 0 && plan.yearlyPrice && (
                              <div className="text-sm text-gray-400 mt-2">
                                {formatCurrency(plan.price * 12, plan.currency)}/{t('vendor.billing.year', { defaultValue: 'yr' })} {t('vendor.billing.billedMonthly', { defaultValue: 'billed monthly' })}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled && !checkoutLoading) {
                          handlePlanSelect(plan.id);
                        }
                      }}
                      disabled={isDisabled || checkoutLoading !== null}
                      className={`mt-6 w-full ${
                        isDisabled || checkoutLoading !== null
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : plan.isPopular
                          ? 'bg-primary-lime hover:bg-primary-lime/90'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      {checkoutLoading === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('vendor.billing.redirectingToPayment', { defaultValue: 'Redirecting...' })}
                        </>
                      ) : isDisabled ? (
                        t('vendor.createShop.planModal.limitReached', { defaultValue: 'Limit Reached' })
                      ) : plan.id === 'free' ? (
                        t('vendor.createShop.planModal.continueWithFree', { defaultValue: 'Start Free' })
                      ) : !existingShopId ? (
                        // User has no shop - show they need to create free first
                        t('vendor.createShop.planModal.upgradeAfterCreate', { defaultValue: 'Create Free First' })
                      ) : (
                        t('vendor.billing.upgrade', { defaultValue: 'Get Started' })
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Skip Link */}
            <p className="text-center text-gray-500 text-sm">
              {t('vendor.createShop.planModal.skipNote', { defaultValue: 'You can always upgrade later from your billing settings' })}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Back Button Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => currentStep > 1 ? handleBack() : navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('common.back')}</span>
          </button>
        </div>
      </div>

      {/* Progress Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Store className="w-6 h-6 text-primary-lime" />
              <span className="font-bold text-gray-900">Vasty</span>
            </button>
            <span className="text-sm text-gray-500">{t('vendor.createShop.wizard.stepOf', { current: currentStep, total: steps.length })}</span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    step.id <= currentStep ? 'bg-primary-lime' : 'bg-gray-200'
                  }`}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Step Labels */}
          <div className="hidden md:flex items-center justify-between mt-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-xs ${
                  step.id === currentStep
                    ? 'text-primary-lime font-medium'
                    : step.id < currentStep
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto flex items-center justify-between max-w-2xl">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-primary-lime hover:bg-primary-lime/90 text-white px-8"
            >
              {t('vendor.createShop.wizard.navigation.continue')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('vendor.createShop.wizard.navigation.creatingStore')}
                </>
              ) : (
                <>
                  {t('vendor.createShop.wizard.navigation.launchStore')}
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopOnboardingWizard;

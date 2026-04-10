import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ArrowRight, ArrowLeft, Loader2, Building2, Mail, FileText, CheckCircle, ChevronDown, Tag, Globe, Languages, AlertTriangle, Crown, X, Zap, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useShopStore } from '@/stores/useShopStore';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { api } from '@/lib/api';
import type { VendorShop } from '@/features/vendor-auth/types';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/lib/api/billing-api';
import { canCreateStore, getPlanLimits, type PlanTier } from '@/types/billing';

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Country codes with flags
const COUNTRIES = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+880', country: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+92', country: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
  { code: '+48', country: 'PL', flag: '🇵🇱', name: 'Poland' },
  { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', country: 'DK', flag: '🇩🇰', name: 'Denmark' },
  { code: '+358', country: 'FI', flag: '🇫🇮', name: 'Finland' },
  { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', country: 'AT', flag: '🇦🇹', name: 'Austria' },
  { code: '+32', country: 'BE', flag: '🇧🇪', name: 'Belgium' },
  { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30', country: 'GR', flag: '🇬🇷', name: 'Greece' },
  { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland' },
  { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: '+98', country: 'IR', flag: '🇮🇷', name: 'Iran' },
  { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia' },
  { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Peru' },
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

interface CreateShopFormData {
  name: string;
  description: string;
  businessEmail: string;
  businessName: string;
  businessType: 'individual' | 'llc' | 'corporation';
  countryCode: string;
  businessPhone: string;
  categoryId: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

interface FormErrors {
  name?: string;
  businessEmail?: string;
  businessPhone?: string;
  general?: string;
}

// Plan options for selection modal - matches BillingPage fallbackPlans
// Prices in cents, yearly = 10 months (2 months free)
// Features use translation keys that are resolved at render time
const PLAN_OPTIONS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Start your first store',
    price: 0,
    yearlyPrice: 0,
    currency: 'USD',
    featureKeys: [
      'storeWithProducts',
      'freeSubdomain',
      'basicTheme',
      'marketplaceListing',
      'standardCheckout',
      'communitySupport',
    ],
    isPopular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Launch & grow',
    price: 2999, // cents ($29.99)
    yearlyPrice: 29999, // cents ($299.99/year = 2 months free)
    currency: 'USD',
    featureKeys: [
      'storesUnlimited',
      'customDomain',
      'premiumThemes',
      'basicAnalytics',
      'teamMembers',
      'emailSupport',
    ],
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Grow your business',
    price: 7999, // cents ($79.99)
    yearlyPrice: 79999, // cents ($799.99/year = 2 months free)
    currency: 'USD',
    featureKeys: [
      'storesUnlimited',
      'customDomainPerStore',
      'advancedAnalytics',
      'teamMembers',
      'prioritySupport',
      'mobileApp',
      'advancedPromotions',
    ],
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Scale without limits',
    price: 19999, // cents ($199.99)
    yearlyPrice: 199999, // cents ($1999.99/year = 2 months free)
    currency: 'USD',
    featureKeys: [
      'unlimitedStores',
      'customDomainPerStore',
      'fullAnalytics',
      'teamMembers',
      'fullMobileApp',
      'apiAccess',
      'whiteLabel',
    ],
    isPopular: false,
  },
];

export const CreateShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { token: vendorToken } = useVendorAuthStore();
  const { user, isAuthenticated: customerAuthenticated, loading: isAuthLoading } = useAuth();
  const { addShop, setCurrentShop, shops, fetchUserShops, isLoading: isShopsLoading } = useShopStore();
  const { data: subscription, isLoading: isSubscriptionLoading, error: subscriptionError } = useSubscription();

  // Check if authenticated via either system
  const isAuthenticated = customerAuthenticated || !!vendorToken;

  // Get current plan and limits - default to 'free' if no subscription or error
  const currentPlan = (subscription?.plan as PlanTier) || 'free';
  const planLimits = getPlanLimits(currentPlan);
  // Use ownedShopsCount for limit checking (not total shops including member shops)
  const { ownedShopsCount } = useShopStore();
  const currentShopCount = ownedShopsCount;
  const canCreate = canCreateStore(currentShopCount, currentPlan);
  const remainingStores = planLimits.stores === Infinity ? Infinity : planLimits.stores - currentShopCount;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(true); // Always show plan selection first
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planSelected, setPlanSelected] = useState(false); // Track if user has selected a plan
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly for 2 months free

  const [shopsLoaded, setShopsLoaded] = useState(false);
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<CreateShopFormData>({
    name: '',
    description: '',
    businessEmail: user?.email || '',
    businessName: '',
    businessType: 'individual',
    countryCode: '+1',
    businessPhone: '',
    categoryId: '',
    defaultLanguage: i18n.language?.split('-')[0] || 'en', // Use current language as default
    supportedLanguages: [i18n.language?.split('-')[0] || 'en'],
  });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Fetch shops and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user's shops to get accurate count
        await fetchUserShops();
        setShopsLoaded(true);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setShopsLoaded(true);
      }

      try {
        const response = await api.getCategories();
        setCategories(response || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, fetchUserShops]);

  // Redirect if not authenticated (wait for auth to finish loading)
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/vendor/create-shop', message: 'Please login to create your store' } });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Pre-fill email from user data
  React.useEffect(() => {
    if (user?.email && !formData.businessEmail) {
      setFormData(prev => ({ ...prev, businessEmail: user.email || '' }));
    }
  }, [user?.email]);

  // Only hide plan modal if user has a PAID subscription
  useEffect(() => {
    const isPaidPlan = subscription?.plan && ['starter', 'pro', 'business'].includes(subscription.plan);
    if (isPaidPlan) {
      setShowPlanModal(false);
    }
  }, [subscription?.plan]);

  // Handle upgrade button click - navigate to billing page
  const handleUpgradeClick = () => {
    setShowLimitModal(false);
    navigate('/vendor/billing');
  };

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPlanModal(false);
    setPlanSelected(true);

    if (planId !== 'free') {
      // Paid plan - redirect to billing with selected plan
      navigate('/vendor/billing', { state: { selectedPlan: planId } });
    }
    // Free plan - just close modal and proceed with shop creation form
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Shop name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Shop name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Shop name must be less than 100 characters';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email address';
    }

    if (formData.businessPhone && !/^\+?[1-9]\d{1,14}$/.test(formData.businessPhone.replace(/[\s-]/g, ''))) {
      newErrors.businessPhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDefaultLanguageChange = (langCode: string) => {
    setFormData((prev) => {
      // Ensure default language is always in supported languages
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
    setFormData((prev) => {
      // Don't allow removing the default language
      if (langCode === prev.defaultLanguage) {
        return prev;
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check store limit before proceeding - show modal
    if (!canCreate) {
      setShowLimitModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare payload with snake_case for backend
      const phoneNumber = formData.businessPhone.trim().replace(/\D/g, ''); // Remove non-digits
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        business_email: formData.businessEmail.trim(),
        business_type: formData.businessType,
      };

      // Only add optional fields if they have values
      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }
      if (formData.businessName.trim()) {
        payload.business_name = formData.businessName.trim();
      }
      if (phoneNumber) {
        // Combine country code with phone number in E.164 format
        payload.business_phone = `${formData.countryCode}${phoneNumber}`;
      }
      if (formData.categoryId) {
        payload.category_id = formData.categoryId;
      }

      // Add language settings
      payload.default_language = formData.defaultLanguage;
      payload.supported_languages = formData.supportedLanguages;

      // Create shop using the shops endpoint
      const response = await apiClient.post<{ data: VendorShop } | VendorShop>('/shops', payload);
      // Handle both response structures
      let newShop: VendorShop;
      if ('data' in response.data && (response.data as { data: VendorShop }).data) {
        newShop = (response.data as { data: VendorShop }).data;
      } else {
        newShop = response.data as VendorShop;
      }

      // Add shop to store and set as current
      addShop(newShop);
      setCurrentShop(newShop);

      toast.success(t('vendor.createShop.shopCreated'));

      // Navigate to the new shop's dashboard
      navigate(`/shop/${newShop.id}/vendor/dashboard`, { replace: true });
    } catch (error: any) {
      console.error('Failed to create shop:', error);
      console.error('Error response:', error.response?.data);

      // Extract error message safely
      let errorMessage = t('vendor.createShop.wizard.error');
      const responseMessage = error.response?.data?.message;

      if (responseMessage) {
        if (Array.isArray(responseMessage)) {
          errorMessage = responseMessage.join(', ');
        } else if (typeof responseMessage === 'string') {
          errorMessage = responseMessage;
        } else {
          errorMessage = JSON.stringify(responseMessage);
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }

      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
        setErrors({ name: t('vendor.createShop.errors.storeNameExists', { defaultValue: 'A store with this name already exists' }) });
      } else {
        setErrors({ general: errorMessage });
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-lime mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Back Button - Above Hero */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t('common.back')}</span>
          </button>
        </div>
      </div>

      {/* Only show form content after plan is selected */}
      {planSelected && (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-lime/20 flex items-center justify-center"
                >
                  <Store className="w-10 h-10 text-primary-lime" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('vendor.createShop.title')}</h1>
                <p className="text-gray-300 text-lg">
                  {t('vendor.createShop.subtitle')}
                </p>
              </div>
            </div>
          </section>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: CheckCircle, text: t('vendor.createShop.benefits.freeToStart') },
                { icon: CheckCircle, text: t('vendor.createShop.benefits.noMonthlyFees') },
                { icon: CheckCircle, text: t('vendor.createShop.benefits.support247') },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <item.icon className="w-4 h-4 text-primary-lime" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Store Limit Reached Banner */}
            {!canCreate && (
              <Card className="p-6 mb-8 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-1">
                      {t('vendor.createShop.limits.title')}
                    </h3>
                    <p className="text-amber-700 text-sm mb-4">
                      {t('vendor.createShop.limits.description', {
                        current: currentShopCount,
                        max: planLimits.stores,
                        plan: currentPlan || 'free'
                      })}
                    </p>
                    <Link to="/vendor/billing">
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Crown className="w-4 h-4 mr-2" />
                        {t('vendor.createShop.limits.upgradeButton')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Store Usage Info */}
            {canCreate && currentShopCount > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Store className="w-4 h-4" />
                  <span>
                    {remainingStores === Infinity
                      ? t('vendor.createShop.limits.unlimited')
                      : t('vendor.createShop.limits.remaining', {
                          remaining: remainingStores,
                          max: planLimits.stores
                        })}
                  </span>
                </div>
              </div>
            )}

            {/* Form Card */}
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Shop Name */}
                <div>
                  <Label htmlFor="name">
                    {t('vendor.createShop.form.storeName')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('vendor.createShop.form.storeNamePlaceholder')}
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">{t('vendor.createShop.form.description')}</Label>
                  <div className="relative mt-2">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={t('vendor.createShop.form.descriptionPlaceholder')}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="categoryId">{t('vendor.createShop.form.storeCategory')}</Label>
                  <div className="relative mt-2">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">{t('vendor.createShop.form.selectCategory')}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{t('vendor.createShop.form.categoryHint')}</p>
                </div>

                {/* Language Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">{t('vendor.createShop.form.languageSettings')}</span>
                  </div>

                  {/* Default Language */}
                  <div>
                    <Label htmlFor="defaultLanguage">{t('vendor.createShop.form.defaultLanguage')}</Label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">
                            {LANGUAGES.find((l) => l.code === formData.defaultLanguage)?.flag}
                          </span>
                          <span>
                            {LANGUAGES.find((l) => l.code === formData.defaultLanguage)?.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({LANGUAGES.find((l) => l.code === formData.defaultLanguage)?.nativeName})
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
                          <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            {LANGUAGES.map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={() => handleDefaultLanguageChange(lang.code)}
                                className={`flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 transition-colors text-left ${
                                  formData.defaultLanguage === lang.code ? 'bg-primary-lime/10' : ''
                                }`}
                              >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm text-gray-900">{lang.name}</span>
                                <span className="text-sm text-gray-500">({lang.nativeName})</span>
                                {formData.defaultLanguage === lang.code && (
                                  <CheckCircle className="w-4 h-4 text-primary-lime ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('vendor.createShop.form.defaultLanguageHint')}
                    </p>
                  </div>

                  {/* Supported Languages */}
                  <div>
                    <Label>{t('vendor.createShop.form.additionalLanguages')}</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      {t('vendor.createShop.form.additionalLanguagesHint')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {LANGUAGES.map((lang) => {
                        const isDefault = formData.defaultLanguage === lang.code;
                        const isSelected = formData.supportedLanguages.includes(lang.code);
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => toggleSupportedLanguage(lang.code)}
                            disabled={isDefault}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                              isSelected
                                ? 'bg-primary-lime/10 border-primary-lime text-gray-900'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                            } ${isDefault ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                            title={isDefault ? 'Default language is always included' : ''}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-primary-lime" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Business Email */}
                <div>
                  <Label htmlFor="businessEmail">
                    {t('vendor.createShop.form.businessEmail')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      id="businessEmail"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      placeholder="store@yourbusiness.com"
                      className={`pl-10 ${errors.businessEmail ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.businessEmail && <p className="mt-1 text-sm text-red-500">{errors.businessEmail}</p>}
                </div>

                {/* Business Name */}
                <div>
                  <Label htmlFor="businessName">{t('vendor.createShop.form.businessName')}</Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder={t('vendor.createShop.form.businessNamePlaceholder')}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <Label htmlFor="businessType">{t('vendor.createShop.form.businessType')}</Label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime focus:border-transparent"
                  >
                    <option value="individual">{t('vendor.createShop.form.businessTypes.individual')}</option>
                    <option value="llc">{t('vendor.createShop.form.businessTypes.llc')}</option>
                    <option value="corporation">{t('vendor.createShop.form.businessTypes.corporation')}</option>
                  </select>
                </div>

                {/* Business Phone */}
                <div>
                  <Label htmlFor="businessPhone">{t('vendor.createShop.form.businessPhone')}</Label>
                  <div className="flex mt-2">
                    {/* Country Code Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="flex items-center gap-1 h-10 px-3 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[90px]"
                      >
                        <span className="text-lg">
                          {COUNTRIES.find(c => c.code === formData.countryCode && c.country === 'US')?.flag ||
                           COUNTRIES.find(c => c.code === formData.countryCode)?.flag || '🇺🇸'}
                        </span>
                        <span className="text-sm text-gray-700">{formData.countryCode}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>

                      {isCountryDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsCountryDropdownOpen(false)}
                          />
                          <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            {COUNTRIES.map((country, index) => (
                              <button
                                key={`${country.country}-${index}`}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, countryCode: country.code }));
                                  setIsCountryDropdownOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 transition-colors text-left"
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

                    {/* Phone Number Input */}
                    <Input
                      type="tel"
                      id="businessPhone"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className={`flex-1 rounded-l-none ${errors.businessPhone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{t('vendor.createShop.form.phoneHint')}</p>
                  {errors.businessPhone && <p className="mt-1 text-sm text-red-500">{errors.businessPhone}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-lime hover:bg-primary-lime/90 text-white py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {t('vendor.createShop.form.creating')}
                    </>
                  ) : (
                    <>
                      {t('vendor.createShop.form.createStore')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Footer Note */}
            <p className="text-center text-gray-500 text-sm mt-6">
              {t('vendor.createShop.form.footerNote')}
            </p>
          </div>
        </div>
      </div>

      <Footer />
        </>
      )}

      {/* Store Limit Reached Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setShowLimitModal(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t('vendor.createShop.limits.title', { defaultValue: 'Store Limit Reached' })}
                  </h3>

                  {/* Message */}
                  <p className="text-gray-600 mb-6">
                    {t('vendor.createShop.limits.modalDescription', {
                      defaultValue: 'You have created {{current}} out of {{max}} stores allowed on your {{plan}} plan. Upgrade your plan to create more stores.',
                      current: currentShopCount,
                      max: planLimits.stores,
                      plan: (currentPlan || 'free').charAt(0).toUpperCase() + (currentPlan || 'free').slice(1)
                    })}
                  </p>

                  {/* Plan info */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('vendor.createShop.limits.currentPlan', { defaultValue: 'Current Plan' })}</span>
                      <span className="font-semibold text-gray-900 capitalize">{currentPlan || 'free'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500">{t('vendor.createShop.limits.storesUsed', { defaultValue: 'Stores Used' })}</span>
                      <span className="font-semibold text-gray-900">{currentShopCount} / {planLimits.stores}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLimitModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      {t('common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      onClick={handleUpgradeClick}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Crown className="w-5 h-5" />
                      {t('vendor.createShop.limits.upgradeButton', { defaultValue: 'Upgrade Plan' })}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Plan Selection Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Content */}
                <div className="p-8">
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

                  {/* Current Usage Warning for Free Users */}
                  {currentShopCount > 0 && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-amber-800 font-medium">
                            {t('vendor.createShop.planModal.currentUsage', {
                              defaultValue: 'You currently have {{count}} store(s). Free plan allows only 1 store.',
                              count: currentShopCount
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

                  {/* Billing Period Toggle */}
                  <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                      <button
                        type="button"
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
                        type="button"
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

                  {/* Plans Grid - Same as BillingPage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {PLAN_OPTIONS.map((plan) => {
                      // Disable free plan if user already has stores (since free only allows 1)
                      const isDisabled = plan.id === 'free' && currentShopCount >= 1;
                      const isSelected = selectedPlan === plan.id;

                      // Format currency helper
                      const formatCurrency = (amount: number) => {
                        const dollars = amount / 100;
                        const hasDecimals = dollars % 1 !== 0;
                        return new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: plan.currency,
                          minimumFractionDigits: hasDecimals ? 2 : 0,
                          maximumFractionDigits: hasDecimals ? 2 : 0,
                        }).format(dollars);
                      };

                      return (
                        <div
                          key={plan.id}
                          onClick={() => !isDisabled && setSelectedPlan(plan.id)}
                          className={`relative rounded-2xl border-2 p-6 bg-white transition-all cursor-pointer ${
                            plan.isPopular
                              ? 'border-primary-lime shadow-lg shadow-primary-lime/10'
                              : isSelected
                              ? 'border-primary-lime bg-primary-lime/5'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {plan.isPopular && (
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-lime text-white">
                                <Zap className="w-3 h-3 mr-1" />
                                {t('vendor.billing.popular', { defaultValue: 'Popular' })}
                              </span>
                            </div>
                          )}

                          {isSelected && !isDisabled && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary-lime rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {t(`vendor.createShop.planModal.plans.${plan.id}.name`, { defaultValue: plan.name })}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                              {t(`vendor.createShop.planModal.plans.${plan.id}.description`, { defaultValue: plan.description })}
                            </p>
                            <div className="mt-4">
                              {billingPeriod === 'yearly' && plan.yearlyPrice !== undefined && plan.price > 0 ? (
                                <>
                                  {/* Discounted monthly price with 2 months free badge */}
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-gray-900">
                                      {formatCurrency(Math.round(plan.yearlyPrice / 12))}
                                    </span>
                                    <span className="text-gray-500">/{t('vendor.billing.month', { defaultValue: 'month' })}</span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                      {t('vendor.billing.save2Months', { defaultValue: '2 months free' })}
                                    </span>
                                  </div>
                                  {/* Original yearly price crossed out + discounted yearly price */}
                                  <div className="text-sm mt-2 flex items-center justify-center gap-2">
                                    <span className="text-gray-400 line-through">
                                      {formatCurrency(plan.price * 12)}/{t('vendor.billing.year', { defaultValue: 'year' })}
                                    </span>
                                    <span className="text-primary-lime font-medium">
                                      {formatCurrency(plan.yearlyPrice)}/{t('vendor.billing.year', { defaultValue: 'year' })}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* Monthly price display */}
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-4xl font-bold text-gray-900">
                                      {formatCurrency(plan.price)}
                                    </span>
                                    <span className="text-gray-500">/{t('vendor.billing.month', { defaultValue: 'month' })}</span>
                                  </div>
                                  {plan.price > 0 && plan.yearlyPrice && (
                                    <div className="text-sm text-gray-400 mt-2">
                                      {formatCurrency(plan.price * 12)}/{t('vendor.billing.year', { defaultValue: 'year' })} {t('vendor.billing.billedMonthly', { defaultValue: 'billed monthly' })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <ul className="mt-6 space-y-3">
                            {plan.featureKeys.map((featureKey, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="w-5 h-5 text-primary-lime mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600">
                                  {t(`vendor.createShop.planModal.plans.${plan.id}.features.${featureKey}`)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handlePlanSelect(selectedPlan || 'free')}
                      disabled={!selectedPlan}
                      className={`
                        px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
                        ${selectedPlan
                          ? 'bg-primary-lime text-white hover:bg-primary-lime/90 shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {selectedPlan === 'free' ? (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          {t('vendor.createShop.planModal.continueWithFree', { defaultValue: 'Continue with Free' })}
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5" />
                          {t('vendor.createShop.planModal.subscribeToPlan', { defaultValue: 'Subscribe to Plan' })}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Skip Link */}
                  <p className="text-center text-gray-500 text-sm mt-4">
                    {t('vendor.createShop.planModal.skipNote', { defaultValue: 'You can always upgrade later from your billing settings' })}
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

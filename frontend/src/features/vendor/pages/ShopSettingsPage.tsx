import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Store,
  Building2,
  CreditCard,
  Bell,
  Search as SearchIcon,
  Code,
  Upload,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Image as ImageIcon,
  Smartphone,
  Loader2,
  Check,
  AlertCircle,
  Link2,
  ExternalLink,
  Copy,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { useShopStore } from '../../../stores/useShopStore';
import { extractRouteContext } from '../../../lib/navigation-utils';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';

// Helper to check if a URL is valid (not a blob URL or invalid)
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (url.startsWith('blob:')) return false;
  return true;
};

type TabId = 'general' | 'business' | 'payment' | 'notifications' | 'seo' | 'domain' | 'advanced';

interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export const ShopSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();
  const params = useParams();
  const { shopId } = extractRouteContext(params);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Get shop from shop store
  const { currentShop, updateShop: updateShopInStore } = useShopStore();

  // Set shop context in API client for automatic header injection
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  const [generalSettings, setGeneralSettings] = useState({
    shopName: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
    email: '',
    phone: '',
    address: ''
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessName: '',
    taxId: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    businessPhone: '',
    businessEmail: '',
    // Tax Settings (Shipping is configured in Delivery page)
    taxRate: 0,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripe: {
      enabled: false,
      publishableKey: '',
      secretKey: ''
    },
    paypal: {
      enabled: false,
      clientId: '',
      secret: ''
    }
  });

  // Available payment methods for customers
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', enabled: true },
    { id: 'paypal', name: 'PayPal', icon: 'paypal', enabled: false },
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash', enabled: false },
    { id: 'bank', name: 'Bank Transfer', icon: 'bank', enabled: false },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    newReview: true,
    lowStock: true,
    smsAlerts: false,
    emailDigest: 'daily'
  });

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    sitemapEnabled: true
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    customCss: '',
    analyticsCode: '',
    headerScripts: '',
    footerScripts: ''
  });

  const [domainSettings, setDomainSettings] = useState({
    subdomain: '',
    subdomainAvailable: true,
    customDomain: '',
    customDomainVerified: false,
    customDomainStatus: 'not_configured' as 'not_configured' | 'pending' | 'verified' | 'failed',
    sslEnabled: false,
    redirectToCustomDomain: false,
  });

  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

  const tabs = [
    { id: 'general', label: t('vendor.settings.tabs.general', { defaultValue: 'General' }), icon: Store },
    { id: 'business', label: t('vendor.settings.tabs.business', { defaultValue: 'Business' }), icon: Building2 },
    { id: 'payment', label: t('vendor.settings.tabs.payment', { defaultValue: 'Payment' }), icon: CreditCard },
    { id: 'notifications', label: t('vendor.settings.tabs.notifications', { defaultValue: 'Notifications' }), icon: Bell },
    { id: 'seo', label: t('vendor.settings.tabs.seo', { defaultValue: 'SEO' }), icon: SearchIcon },
    { id: 'domain', label: t('vendor.settings.tabs.domain', { defaultValue: 'Domain' }), icon: Globe },
    { id: 'advanced', label: t('vendor.settings.tabs.advanced', { defaultValue: 'Advanced' }), icon: Code }
  ];

  // Load shop settings on mount
  useEffect(() => {
    loadShopSettings();
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadShopSettings = async () => {
    const effectiveShopId = shopId || currentShop?.id;
    if (!effectiveShopId) {
      toast.error('Shop not found', { description: 'Please log in again' });
      return;
    }

    setIsLoading(true);
    try {
      // shopId will be automatically added via x-shop-id header in api-client.ts
      const shopData = await api.getShop(effectiveShopId);

      // Populate form with shop data
      setGeneralSettings({
        shopName: shopData.name || '',
        slug: shopData.slug || '',
        description: shopData.description || '',
        logo: shopData.logo || '',
        banner: shopData.banner || '',
        email: shopData.email || '',
        phone: shopData.phone || '',
        address: shopData.address || ''
      });

      setBusinessSettings({
        businessName: shopData.businessInfo?.name || '',
        taxId: shopData.businessInfo?.taxId || '',
        businessAddress: shopData.businessInfo?.address || '',
        city: shopData.businessInfo?.city || '',
        state: shopData.businessInfo?.state || '',
        zipCode: shopData.businessInfo?.zipCode || '',
        country: shopData.businessInfo?.country || '',
        businessPhone: shopData.businessInfo?.phone || '',
        businessEmail: shopData.businessInfo?.email || '',
        // Tax Settings only (Shipping is in Delivery page)
        taxRate: shopData.taxRate ?? shopData.tax_rate ?? shopData.settings?.taxRate ?? shopData.settings?.tax_rate ?? 0,
      });

      if (shopData.paymentSettings) {
        setPaymentSettings(shopData.paymentSettings);
      }

      if (shopData.notificationSettings) {
        setNotificationSettings(shopData.notificationSettings);
      }

      if (shopData.seoSettings) {
        setSeoSettings(shopData.seoSettings);
      }

      if (shopData.advancedSettings) {
        setAdvancedSettings(shopData.advancedSettings);
      }

      // Load payment methods from shop.paymentMethods (direct column) or fallback to settings
      // Backend stores: ['card', 'paypal', 'cod']
      // Priority: direct column > settings.payment_methods > settings.paymentMethods
      const savedPaymentMethods = shopData.paymentMethods || shopData.settings?.payment_methods || shopData.settings?.paymentMethods;
      if (savedPaymentMethods && Array.isArray(savedPaymentMethods)) {
        // Update the enabled state based on saved methods
        const methodsArray = paymentMethods.map(method => ({
          ...method,
          enabled: savedPaymentMethods.includes(method.id)
        }));
        setPaymentMethods(methodsArray);
      }
    } catch (error: any) {
      console.error('Failed to load shop settings:', error);
      toast.error('Failed to load settings', {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (activeTab === 'general') {
      if (!generalSettings.shopName.trim()) {
        errors.shopName = 'Shop name is required';
      }
    }

    if (activeTab === 'business') {
      if (businessSettings.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessSettings.businessEmail)) {
        errors.businessEmail = 'Invalid email format';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Validation failed', { description: 'Please fix the errors and try again' });
      return;
    }

    const effectiveShopId = shopId || currentShop?.id;
    if (!effectiveShopId) {
      toast.error('Shop not found');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {};

      if (activeTab === 'general') {
        updateData.name = generalSettings.shopName;
        updateData.description = generalSettings.description;
        updateData.logo = generalSettings.logo;
        updateData.banner = generalSettings.banner;
      } else if (activeTab === 'business') {
        updateData.business_name = businessSettings.businessName;
        updateData.tax_id = businessSettings.taxId;
        // Only send email if valid
        if (businessSettings.businessEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessSettings.businessEmail)) {
          updateData.business_email = businessSettings.businessEmail;
        }
        // Only send phone if in E.164 format or empty
        if (businessSettings.businessPhone && businessSettings.businessPhone.startsWith('+')) {
          updateData.business_phone = businessSettings.businessPhone.replace(/[^+\d]/g, '');
        }
        updateData.business_address = {
          street: businessSettings.businessAddress,
          city: businessSettings.city,
          state: businessSettings.state,
          postal_code: businessSettings.zipCode,
          country: businessSettings.country
        };
        // Tax Settings only (Shipping is configured in Delivery page)
        updateData.settings = {
          tax_rate: businessSettings.taxRate,
        };
      } else if (activeTab === 'payment') {
        // Backend expects payment_methods as direct column: ['card', 'paypal', 'cod']
        const enabledMethods = paymentMethods
          .filter(method => method.enabled)
          .map(method => method.id);
        // Save to direct column (like delivery_methods pattern)
        updateData.payment_methods = enabledMethods;
      } else if (activeTab === 'notifications') {
        updateData.notificationSettings = notificationSettings;
      } else if (activeTab === 'seo') {
        updateData.seoSettings = seoSettings;
      } else if (activeTab === 'advanced') {
        updateData.advancedSettings = advancedSettings;
      }

      // shopId will be automatically added via x-shop-id header in api-client.ts
      await api.updateShop(updateData);

      // Update the shop in the store so header reflects changes
      const effectiveShopId = shopId || currentShop?.id;
      if (effectiveShopId && activeTab === 'general') {
        updateShopInStore(effectiveShopId, {
          name: generalSettings.shopName,
          description: generalSettings.description,
          logo: generalSettings.logo,
          banner: generalSettings.banner
        });
      }

      toast.success('Settings saved successfully', {
        description: 'Your changes have been saved'
      });
      setHasUnsavedChanges(false);

      // Reload to get updated data
      await loadShopSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings', {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (hasUnsavedChanges) {
      const confirmed = await dialog.showConfirm({
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        cancelText: 'Keep Editing',
        variant: 'warning'
      });

      if (!confirmed) return;
    }
    loadShopSettings();
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    const effectiveShopId = shopId || currentShop?.id;
    if (!effectiveShopId) {
      toast.error('Shop not found');
      return;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', { description: 'Please upload an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File too large', { description: 'Please upload an image smaller than 5MB' });
      return;
    }

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingBanner;
    setUploading(true);

    try {
      // Upload to server
      const response = await api.uploadShopImage(file, type);

      if (type === 'logo') {
        setGeneralSettings({ ...generalSettings, logo: response.url });
      } else {
        setGeneralSettings({ ...generalSettings, banner: response.url });
      }

      setHasUnsavedChanges(true);

      toast.success('Image uploaded', {
        description: 'Remember to save your changes'
      });
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image', {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'logo');
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'banner');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('vendor.settings.loadingSettings', { defaultValue: 'Loading shop settings...' })}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('vendor.settings.pageTitle', { defaultValue: 'Shop Settings' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.settings.pageSubtitle', { defaultValue: 'Configure your shop preferences' })}
          </p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary-lime rounded-xl font-medium hover:bg-primary-lime/90 transition-all shadow-lg flex items-center space-x-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('common.saving', { defaultValue: 'Saving...' })}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{t('vendor.settings.saveChanges', { defaultValue: 'Save Changes' })}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <GlassCard hover={false}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center space-y-2 ${
                activeTab === tab.id
                  ? 'bg-primary-lime text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Tab Content */}
      <GlassCard hover={false}>
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.generalInfo', { defaultValue: 'General Information' })}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.shopNameLabel', { defaultValue: 'Shop Name *' })}</label>
                <input
                  type="text"
                  value={generalSettings.shopName}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, shopName: e.target.value });
                    setHasUnsavedChanges(true);
                    if (validationErrors.shopName) {
                      setValidationErrors({ ...validationErrors, shopName: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all ${
                    validationErrors.shopName ? 'border-red-500/50' : 'border-gray-200'
                  }`}
                  placeholder={t('vendor.placeholders.shopName')}
                />
                {validationErrors.shopName && (
                  <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.shopName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.shopSlugLabel', { defaultValue: 'Shop Slug *' })}</label>
                <input
                  type="text"
                  value={generalSettings.slug}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                    setGeneralSettings({ ...generalSettings, slug });
                    setHasUnsavedChanges(true);
                    if (validationErrors.slug) {
                      setValidationErrors({ ...validationErrors, slug: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all ${
                    validationErrors.slug ? 'border-red-500/50' : 'border-gray-200'
                  }`}
                  placeholder="shop-slug"
                />
                {validationErrors.slug && (
                  <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.slug}</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.slugHint', { defaultValue: 'Used in shop URL (lowercase letters, numbers, hyphens only)' })}</p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.descriptionLabel', { defaultValue: 'Description' })}</label>
              <textarea
                value={generalSettings.description}
                onChange={(e) => {
                  setGeneralSettings({ ...generalSettings, description: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none transition-all"
                rows={4}
                placeholder={t('vendor.placeholders.shopDescription')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.logoLabel', { defaultValue: 'Shop Logo' })}</label>
                <div className="space-y-3">
                  {isValidImageUrl(generalSettings.logo) && (
                    <div className="relative w-32 h-32">
                      <img
                        src={generalSettings.logo}
                        alt="Shop logo"
                        className="w-full h-full rounded-xl object-cover border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setGeneralSettings({ ...generalSettings, logo: '' });
                          setHasUnsavedChanges(true);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center space-x-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('vendor.settings.uploading', { defaultValue: 'Uploading...' })}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{t('vendor.settings.uploadLogo', { defaultValue: 'Upload Logo' })}</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400">{t('vendor.settings.logoRecommended', { defaultValue: 'Recommended: 200x200px, max 5MB' })}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.bannerLabel', { defaultValue: 'Shop Banner' })}</label>
                <div className="space-y-3">
                  {isValidImageUrl(generalSettings.banner) && (
                    <div className="relative w-full h-32">
                      <img
                        src={generalSettings.banner}
                        alt="Shop banner"
                        className="w-full h-full rounded-xl object-cover border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setGeneralSettings({ ...generalSettings, banner: '' });
                          setHasUnsavedChanges(true);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center space-x-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('vendor.settings.uploading', { defaultValue: 'Uploading...' })}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{t('vendor.settings.uploadBanner', { defaultValue: 'Upload Banner' })}</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400">{t('vendor.settings.bannerRecommended', { defaultValue: 'Recommended: 1200x400px, max 5MB' })}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block flex items-center space-x-2 font-medium">
                  <Mail className="w-4 h-4 text-primary-lime" />
                  <span>{t('vendor.settings.emailLabel', { defaultValue: 'Email' })}</span>
                </label>
                <input
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, email: e.target.value });
                    setHasUnsavedChanges(true);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all ${
                    validationErrors.email ? 'border-red-500/50' : 'border-gray-200'
                  }`}
                  placeholder="shop@example.com"
                />
                {validationErrors.email && (
                  <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block flex items-center space-x-2 font-medium">
                  <Phone className="w-4 h-4 text-primary-lime" />
                  <span>{t('vendor.settings.phoneLabel', { defaultValue: 'Phone' })}</span>
                </label>
                <input
                  type="tel"
                  value={generalSettings.phone}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, phone: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block flex items-center space-x-2 font-medium">
                  <MapPin className="w-4 h-4 text-primary-lime" />
                  <span>{t('vendor.settings.addressLabel', { defaultValue: 'Address' })}</span>
                </label>
                <input
                  type="text"
                  value={generalSettings.address}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, address: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="123 Commerce St, City, State"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.businessInfo', { defaultValue: 'Business Information' })}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.businessNameLabel', { defaultValue: 'Business Name *' })}</label>
                <input
                  type="text"
                  value={businessSettings.businessName}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, businessName: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder={t('vendor.placeholders.businessName')}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.taxIdLabel', { defaultValue: 'Tax ID / EIN' })}</label>
                <input
                  type="text"
                  value={businessSettings.taxId}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, taxId: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="12-3456789"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.businessAddressLabel', { defaultValue: 'Business Address' })}</label>
              <input
                type="text"
                value={businessSettings.businessAddress}
                onChange={(e) => {
                  setBusinessSettings({ ...businessSettings, businessAddress: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                placeholder={t('vendor.placeholders.streetAddress')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.cityLabel', { defaultValue: 'City' })}</label>
                <input
                  type="text"
                  value={businessSettings.city}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, city: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder={t('vendor.placeholders.city')}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.stateLabel', { defaultValue: 'State' })}</label>
                <input
                  type="text"
                  value={businessSettings.state}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, state: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder={t('vendor.placeholders.state')}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.zipCodeLabel', { defaultValue: 'ZIP Code' })}</label>
                <input
                  type="text"
                  value={businessSettings.zipCode}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, zipCode: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="ZIP"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.countryLabel', { defaultValue: 'Country' })}</label>
                <input
                  type="text"
                  value={businessSettings.country}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, country: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder={t('vendor.placeholders.country')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.businessPhoneLabel', { defaultValue: 'Business Phone' })}</label>
                <input
                  type="tel"
                  value={businessSettings.businessPhone}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, businessPhone: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="+15551234567"
                />
                <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.phoneHint', { defaultValue: 'E.164 format: +[country code][number] (e.g., +15551234567)' })}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.businessEmailLabel', { defaultValue: 'Business Email' })}</label>
                <input
                  type="email"
                  value={businessSettings.businessEmail}
                  onChange={(e) => {
                    setBusinessSettings({ ...businessSettings, businessEmail: e.target.value });
                    setHasUnsavedChanges(true);
                    if (validationErrors.businessEmail) {
                      setValidationErrors({ ...validationErrors, businessEmail: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-100 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all ${
                    validationErrors.businessEmail ? 'border-red-500/50' : 'border-gray-200'
                  }`}
                  placeholder="business@example.com"
                />
                {validationErrors.businessEmail && (
                  <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.businessEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tax Settings */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('vendor.settings.taxSettings', { defaultValue: 'Tax Settings' })}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('vendor.settings.shippingNote', { defaultValue: 'Shipping rates are configured in the Delivery page.' })}</p>

              <div className="max-w-md">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.taxRateLabel', { defaultValue: 'Default Tax Rate (%)' })}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={businessSettings.taxRate}
                    onChange={(e) => {
                      setBusinessSettings({ ...businessSettings, taxRate: parseFloat(e.target.value) || 0 });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.taxRateHint', { defaultValue: 'Default tax percentage for all orders. Products can override this.' })}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.paymentMethods', { defaultValue: 'Payment Methods' })}</h3>

            {/* Stripe */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Stripe</h4>
                    <p className="text-xs text-gray-500">{t('vendor.settings.creditCardPayments', { defaultValue: 'Credit card payments' })}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.stripe.enabled}
                    onChange={(e) => {
                      setPaymentSettings({
                        ...paymentSettings,
                        stripe: { ...paymentSettings.stripe, enabled: e.target.checked }
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-primary-lime peer-checked:to-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {paymentSettings.stripe.enabled && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.publishableKey', { defaultValue: 'Publishable Key' })}</label>
                    <input
                      type="text"
                      value={paymentSettings.stripe.publishableKey}
                      onChange={(e) => {
                        setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, publishableKey: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.secretKey', { defaultValue: 'Secret Key' })}</label>
                    <input
                      type="password"
                      value={paymentSettings.stripe.secretKey}
                      onChange={(e) => {
                        setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, secretKey: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PayPal */}
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">PayPal</h4>
                    <p className="text-xs text-gray-500">{t('vendor.settings.paypalPayments', { defaultValue: 'PayPal payments' })}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.paypal.enabled}
                    onChange={(e) => {
                      setPaymentSettings({
                        ...paymentSettings,
                        paypal: { ...paymentSettings.paypal, enabled: e.target.checked }
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-primary-lime peer-checked:to-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {paymentSettings.paypal.enabled && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.clientId', { defaultValue: 'Client ID' })}</label>
                    <input
                      type="text"
                      value={paymentSettings.paypal.clientId}
                      onChange={(e) => {
                        setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, clientId: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                      placeholder={t('vendor.placeholders.paypalClientId')}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.secret', { defaultValue: 'Secret' })}</label>
                    <input
                      type="password"
                      value={paymentSettings.paypal.secret}
                      onChange={(e) => {
                        setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, secret: e.target.value }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                      placeholder={t('vendor.placeholders.paypalSecret')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customer Payment Methods Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('vendor.settings.customerPaymentOptions', { defaultValue: 'Customer Payment Options' })}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('vendor.settings.customerPaymentOptionsDesc', { defaultValue: 'Choose which payment methods are available to your customers at checkout' })}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      method.enabled
                        ? 'border-primary-lime bg-primary-lime/5'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => {
                      setPaymentMethods(paymentMethods.map(m =>
                        m.id === method.id ? { ...m, enabled: !m.enabled } : m
                      ));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          method.enabled ? 'bg-primary-lime text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {method.id === 'card' && <CreditCard className="w-5 h-5" />}
                          {method.id === 'paypal' && (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
                            </svg>
                          )}
                          {method.id === 'cod' && <span className="text-lg">💵</span>}
                          {method.id === 'bank' && <span className="text-lg">🏦</span>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500">
                            {method.id === 'card' && t('vendor.settings.paymentCardDesc', { defaultValue: 'Visa, Mastercard, Amex' })}
                            {method.id === 'paypal' && t('vendor.settings.paymentPaypalDesc', { defaultValue: 'Pay with PayPal account' })}
                            {method.id === 'cod' && t('vendor.settings.paymentCodDesc', { defaultValue: 'Pay when delivered' })}
                            {method.id === 'bank' && t('vendor.settings.paymentBankDesc', { defaultValue: 'Direct bank transfer' })}
                          </p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        method.enabled
                          ? 'border-primary-lime bg-primary-lime'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {method.enabled && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.notificationPreferences', { defaultValue: 'Notification Preferences' })}</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary-lime" />
                  <div>
                    <p className="font-medium text-gray-900">{t('vendor.settings.orderConfirmation', { defaultValue: 'Order Confirmation' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.settings.orderConfirmationDesc', { defaultValue: 'Send email when order is placed' })}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderConfirmation}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, orderConfirmation: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-primary-lime peer-checked:to-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900">{t('vendor.settings.orderShipped', { defaultValue: 'Order Shipped' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.settings.orderShippedDesc', { defaultValue: 'Send email when order ships' })}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderShipped}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, orderShipped: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-primary-lime peer-checked:to-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900">{t('vendor.settings.orderDelivered', { defaultValue: 'Order Delivered' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.settings.orderDeliveredDesc', { defaultValue: 'Send email when order is delivered' })}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderDelivered}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, orderDelivered: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-primary-lime peer-checked:to-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="font-medium text-gray-900">{t('vendor.settings.smsAlerts', { defaultValue: 'SMS Alerts' })}</p>
                    <p className="text-xs text-gray-500">{t('vendor.settings.smsAlertsDesc', { defaultValue: 'Receive SMS notifications' })}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsAlerts}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, smsAlerts: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-primary-lime peer-checked:to-green-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.emailDigestFrequency', { defaultValue: 'Email Digest Frequency' })}</label>
                <select
                  value={notificationSettings.emailDigest}
                  onChange={(e) => {
                    setNotificationSettings({ ...notificationSettings, emailDigest: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all cursor-pointer"
                >
                  <option value="never" className="bg-white">{t('vendor.settings.never', { defaultValue: 'Never' })}</option>
                  <option value="daily" className="bg-white">{t('vendor.settings.daily', { defaultValue: 'Daily' })}</option>
                  <option value="weekly" className="bg-white">{t('vendor.settings.weekly', { defaultValue: 'Weekly' })}</option>
                  <option value="monthly" className="bg-white">{t('vendor.settings.monthly', { defaultValue: 'Monthly' })}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.seoSettings', { defaultValue: 'SEO Settings' })}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.metaTitle', { defaultValue: 'Meta Title' })}</label>
                <input
                  type="text"
                  value={seoSettings.metaTitle}
                  onChange={(e) => {
                    setSeoSettings({ ...seoSettings, metaTitle: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder={t('vendor.placeholders.seoTitle')}
                  maxLength={60}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {seoSettings.metaTitle.length}/60 {t('vendor.settings.characters', { defaultValue: 'characters' })} ({t('vendor.settings.recommended', { defaultValue: 'Recommended' })}: 50-60)
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.metaDescription', { defaultValue: 'Meta Description' })}</label>
                <textarea
                  value={seoSettings.metaDescription}
                  onChange={(e) => {
                    setSeoSettings({ ...seoSettings, metaDescription: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none transition-all"
                  rows={3}
                  placeholder={t('vendor.placeholders.seoDescription')}
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {seoSettings.metaDescription.length}/160 {t('vendor.settings.characters', { defaultValue: 'characters' })} ({t('vendor.settings.recommended', { defaultValue: 'Recommended' })}: 150-160)
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.metaKeywords', { defaultValue: 'Meta Keywords' })}</label>
                <input
                  type="text"
                  value={seoSettings.metaKeywords}
                  onChange={(e) => {
                    setSeoSettings({ ...seoSettings, metaKeywords: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.separateKeywords', { defaultValue: 'Separate keywords with commas' })}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">{t('vendor.settings.ogImageUrl', { defaultValue: 'Open Graph Image URL' })}</label>
                <input
                  type="url"
                  value={seoSettings.ogImage}
                  onChange={(e) => {
                    setSeoSettings({ ...seoSettings, ogImage: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                {seoSettings.ogImage && (
                  <div className="mt-3">
                    <img
                      src={seoSettings.ogImage}
                      alt="OG preview"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.ogImageRecommended', { defaultValue: 'Recommended: 1200x630px for social media sharing' })}</p>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="sitemapEnabled"
                  checked={seoSettings.sitemapEnabled}
                  onChange={(e) => {
                    setSeoSettings({ ...seoSettings, sitemapEnabled: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 cursor-pointer accent-primary-lime"
                />
                <label htmlFor="sitemapEnabled" className="text-gray-900 cursor-pointer flex-1">
                  <span className="font-medium">{t('vendor.settings.enableSitemap', { defaultValue: 'Enable automatic sitemap generation' })}</span>
                  <p className="text-xs text-gray-500 mt-1">{t('vendor.settings.enableSitemapDesc', { defaultValue: 'Helps search engines discover your shop pages' })}</p>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domain' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.domainSettings', { defaultValue: 'Domain Settings' })}</h3>
            <p className="text-sm text-gray-500">{t('vendor.settings.domainSettingsDesc', { defaultValue: "Configure your shop's subdomain and custom domain for a professional storefront URL." })}</p>

            {/* Subdomain Section */}
            <div className="p-6 bg-gradient-to-r from-primary-lime/5 to-emerald-500/5 rounded-xl border border-primary-lime/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-lime/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary-lime" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('vendor.settings.subdomain', { defaultValue: 'Subdomain' })}</h4>
                  <p className="text-xs text-gray-500">{t('vendor.settings.subdomainDesc', { defaultValue: 'Your free storefront URL' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={domainSettings.subdomain}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setDomainSettings({ ...domainSettings, subdomain: value, subdomainAvailable: true });
                    setHasUnsavedChanges(true);
                  }}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                  placeholder="yourshop"
                />
                <span className="text-gray-500 font-medium">.vasty.shop</span>
                <button
                  onClick={async () => {
                    if (!domainSettings.subdomain) return;
                    setIsCheckingSubdomain(true);
                    // Simulate API check
                    await new Promise(r => setTimeout(r, 1000));
                    setDomainSettings({ ...domainSettings, subdomainAvailable: Math.random() > 0.3 });
                    setIsCheckingSubdomain(false);
                  }}
                  disabled={isCheckingSubdomain || !domainSettings.subdomain}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                >
                  {isCheckingSubdomain ? <Loader2 className="w-4 h-4 animate-spin" /> : t('vendor.settings.check', { defaultValue: 'Check' })}
                </button>
              </div>

              {domainSettings.subdomain && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${domainSettings.subdomainAvailable ? 'text-green-600' : 'text-red-500'}`}>
                  {domainSettings.subdomainAvailable ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('vendor.settings.subdomainAvailable', { subdomain: `${domainSettings.subdomain}.vasty.shop`, defaultValue: `${domainSettings.subdomain}.vasty.shop is available!` })}</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>{t('vendor.settings.subdomainTaken', { defaultValue: 'This subdomain is already taken. Try another one.' })}</span>
                    </>
                  )}
                </div>
              )}

              {domainSettings.subdomain && domainSettings.subdomainAvailable && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>https://{domainSettings.subdomain}.vasty.shop</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${domainSettings.subdomain}.vasty.shop`);
                      toast.success(t('vendor.settings.urlCopied', { defaultValue: 'URL copied to clipboard' }));
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Custom Domain Section */}
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('vendor.settings.customDomain', { defaultValue: 'Custom Domain' })}</h4>
                    <p className="text-xs text-gray-500">{t('vendor.settings.customDomainDesc', { defaultValue: 'Use your own domain (Pro plan required)' })}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Pro</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">{t('vendor.settings.yourDomain', { defaultValue: 'Your domain' })}</label>
                  <input
                    type="text"
                    value={domainSettings.customDomain}
                    onChange={(e) => {
                      setDomainSettings({
                        ...domainSettings,
                        customDomain: e.target.value,
                        customDomainStatus: 'not_configured',
                        customDomainVerified: false
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
                    placeholder="shop.yourdomain.com"
                  />
                </div>

                {domainSettings.customDomain && (
                  <>
                    {/* DNS Instructions */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h5 className="font-medium text-blue-900 mb-2">{t('vendor.settings.dnsConfigRequired', { defaultValue: 'DNS Configuration Required' })}</h5>
                      <p className="text-sm text-blue-700 mb-3">{t('vendor.settings.addDnsRecord', { defaultValue: 'Add the following DNS record to your domain:' })}</p>
                      <div className="bg-white rounded-lg p-3 font-mono text-sm">
                        <div className="grid grid-cols-3 gap-4 text-gray-600">
                          <div>
                            <span className="text-xs text-gray-400 block">{t('vendor.settings.dnsType', { defaultValue: 'Type' })}</span>
                            CNAME
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">{t('vendor.settings.dnsName', { defaultValue: 'Name' })}</span>
                            {domainSettings.customDomain.split('.')[0]}
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">{t('vendor.settings.dnsValue', { defaultValue: 'Value' })}</span>
                            shops.vasty.shop
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {domainSettings.customDomainStatus === 'verified' ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        ) : domainSettings.customDomainStatus === 'pending' ? (
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
                          </div>
                        ) : domainSettings.customDomainStatus === 'failed' ? (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {domainSettings.customDomainStatus === 'verified' ? t('vendor.settings.domainVerified', { defaultValue: 'Domain Verified' }) :
                             domainSettings.customDomainStatus === 'pending' ? t('vendor.settings.verificationPending', { defaultValue: 'Verification Pending' }) :
                             domainSettings.customDomainStatus === 'failed' ? t('vendor.settings.verificationFailed', { defaultValue: 'Verification Failed' }) :
                             t('vendor.settings.notConfigured', { defaultValue: 'Not Configured' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {domainSettings.customDomainStatus === 'verified' ? t('vendor.settings.domainActiveDesc', { defaultValue: 'Your custom domain is active' }) :
                             domainSettings.customDomainStatus === 'pending' ? t('vendor.settings.dnsPropagation', { defaultValue: 'DNS propagation can take up to 48 hours' }) :
                             domainSettings.customDomainStatus === 'failed' ? t('vendor.settings.dnsNotFound', { defaultValue: 'DNS records not found. Please check your configuration.' }) :
                             t('vendor.settings.addDnsRecords', { defaultValue: 'Add DNS records and verify your domain' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setIsVerifyingDomain(true);
                          setDomainSettings({ ...domainSettings, customDomainStatus: 'pending' });
                          // Simulate verification
                          await new Promise(r => setTimeout(r, 2000));
                          const success = Math.random() > 0.5;
                          setDomainSettings({
                            ...domainSettings,
                            customDomainStatus: success ? 'verified' : 'failed',
                            customDomainVerified: success,
                            sslEnabled: success
                          });
                          setIsVerifyingDomain(false);
                          if (success) {
                            toast.success(t('vendor.settings.domainVerifiedSuccess', { defaultValue: 'Domain verified successfully!' }));
                          } else {
                            toast.error(t('vendor.settings.domainVerifiedError', { defaultValue: 'Domain verification failed. Please check your DNS settings.' }));
                          }
                        }}
                        disabled={isVerifyingDomain || !domainSettings.customDomain}
                        className="px-4 py-2 bg-primary-lime text-white rounded-lg font-medium hover:bg-primary-lime/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isVerifyingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {t('vendor.settings.verify', { defaultValue: 'Verify' })}
                      </button>
                    </div>

                    {/* SSL Status */}
                    {domainSettings.customDomainVerified && (
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{t('vendor.settings.sslActive', { defaultValue: 'SSL Certificate Active' })}</p>
                            <p className="text-xs text-green-700">{t('vendor.settings.sslActiveDesc', { defaultValue: 'Your site is secure with HTTPS' })}</p>
                          </div>
                        </div>
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}

                    {/* Redirect Option */}
                    {domainSettings.customDomainVerified && (
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{t('vendor.settings.redirectToCustomDomain', { defaultValue: 'Redirect to custom domain' })}</p>
                          <p className="text-xs text-gray-500">{t('vendor.settings.redirectToCustomDomainDesc', { defaultValue: 'Redirect subdomain visitors to your custom domain' })}</p>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={domainSettings.redirectToCustomDomain}
                            onChange={(e) => {
                              setDomainSettings({ ...domainSettings, redirectToCustomDomain: e.target.checked });
                              setHasUnsavedChanges(true);
                            }}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${domainSettings.redirectToCustomDomain ? 'bg-primary-lime' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${domainSettings.redirectToCustomDomain ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
                          </div>
                        </div>
                      </label>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Preview Links */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h5 className="font-medium text-gray-900 mb-3">{t('vendor.settings.yourStorefrontUrls', { defaultValue: 'Your Storefront URLs' })}</h5>
              <div className="space-y-2">
                {domainSettings.subdomain && (
                  <a
                    href={`https://${domainSettings.subdomain}.vasty.shop`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-lime transition-colors group"
                  >
                    <span className="text-sm text-gray-600">{domainSettings.subdomain}.vasty.shop</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-lime" />
                  </a>
                )}
                {domainSettings.customDomain && domainSettings.customDomainVerified && (
                  <a
                    href={`https://${domainSettings.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-lime transition-colors group"
                  >
                    <span className="text-sm text-gray-600">{domainSettings.customDomain}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-lime" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">{t('vendor.settings.advancedSettings', { defaultValue: 'Advanced Settings' })}</h3>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-500/30 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-600">{t('vendor.settings.warningAdvanced', { defaultValue: 'Warning: Advanced Settings' })}</p>
                <p className="text-xs text-yellow-600/80 mt-1">
                  {t('vendor.settings.warningAdvancedDesc', { defaultValue: 'These settings are for advanced users only. Incorrect code may break your shop or create security issues.' })}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary-lime" />
                <span>{t('vendor.settings.customCss', { defaultValue: 'Custom CSS' })}</span>
              </label>
              <textarea
                value={advancedSettings.customCss}
                onChange={(e) => {
                  setAdvancedSettings({ ...advancedSettings, customCss: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none font-mono text-sm transition-all"
                rows={8}
                placeholder=".my-custom-class {&#10;  color: white;&#10;  background: linear-gradient(...);&#10;}"
              />
              <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.customCssDesc', { defaultValue: 'Add custom styles to personalize your shop appearance' })}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary-lime" />
                <span>{t('vendor.settings.analyticsCode', { defaultValue: 'Analytics Code (Google Analytics, etc.)' })}</span>
              </label>
              <textarea
                value={advancedSettings.analyticsCode}
                onChange={(e) => {
                  setAdvancedSettings({ ...advancedSettings, analyticsCode: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none font-mono text-sm transition-all"
                rows={6}
                placeholder="<!-- Google Analytics -->&#10;<script>&#10;  // Your analytics code here&#10;</script>"
              />
              <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.analyticsCodeDesc', { defaultValue: 'Track visitor behavior and shop performance' })}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary-lime" />
                <span>{t('vendor.settings.headerScripts', { defaultValue: 'Header Scripts' })}</span>
              </label>
              <textarea
                value={advancedSettings.headerScripts}
                onChange={(e) => {
                  setAdvancedSettings({ ...advancedSettings, headerScripts: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none font-mono text-sm transition-all"
                rows={4}
                placeholder="<script src='...'></script>"
              />
              <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.headerScriptsDesc', { defaultValue: 'Scripts to inject in the <head> section' })}</p>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block font-medium flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary-lime" />
                <span>{t('vendor.settings.footerScripts', { defaultValue: 'Footer Scripts' })}</span>
              </label>
              <textarea
                value={advancedSettings.footerScripts}
                onChange={(e) => {
                  setAdvancedSettings({ ...advancedSettings, footerScripts: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none font-mono text-sm transition-all"
                rows={4}
                placeholder="<script>&#10;  // Footer scripts&#10;</script>"
              />
              <p className="text-xs text-gray-400 mt-1">{t('vendor.settings.footerScriptsDesc', { defaultValue: 'Scripts to inject before </body> (recommended for performance)' })}</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Save Button at Bottom */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-primary-lime rounded-xl font-medium hover:bg-primary-lime/90 transition-all shadow-lg flex items-center space-x-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('vendor.settings.savingAllChanges', { defaultValue: 'Saving All Changes...' })}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t('vendor.settings.saveAllChanges', { defaultValue: 'Save All Changes' })}</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};

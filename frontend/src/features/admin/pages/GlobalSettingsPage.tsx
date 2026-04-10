import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  DollarSign,
  Store,
  CreditCard,
  Bell,
  AlertTriangle,
  Globe,
  Upload,
  Save,
  X,
  Mail,
  Loader2,
  AlertCircle,
  Check,
  Package,
  FileText,
  Smartphone,
  Shield,
  Zap,
  ShoppingBag,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../../lib/api';
import { z } from 'zod';

type TabId = 'general' | 'commission' | 'shops' | 'payment' | 'notifications' | 'maintenance' | 'api';

interface ValidationErrors {
  [key: string]: string;
}

// Validation schemas
const generalSettingsSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required'),
  supportEmail: z.string().email('Invalid email address'),
  defaultCurrency: z.string().min(1, 'Currency is required'),
  defaultLanguage: z.string().min(1, 'Language is required')
});

const commissionSettingsSchema = z.object({
  platformCommissionRate: z.number().min(0).max(100),
  minimumOrderAmount: z.number().min(0),
  freeShippingThreshold: z.number().min(0)
});

export const GlobalSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: '',
    platformLogo: '',
    supportEmail: '',
    defaultCurrency: '',
    defaultLanguage: ''
  });

  // Commission Settings
  const [commissionSettings, setCommissionSettings] = useState({
    platformCommissionRate: 0,
    minimumOrderAmount: 0,
    freeShippingThreshold: 0
  });

  // Shop Settings
  const [shopSettings, setShopSettings] = useState({
    autoApproveShops: false,
    requiredDocuments: [] as string[],
    maxProductsPerShop: 0,
    allowedCategories: [] as string[]
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripe: {
      enabled: false,
      status: 'inactive' as 'active' | 'inactive' | 'error'
    },
    paypal: {
      enabled: false,
      status: 'inactive' as 'active' | 'inactive' | 'error'
    },
    cod: {
      enabled: false,
      status: 'inactive' as 'active' | 'inactive' | 'error'
    }
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false
  });

  // Maintenance Settings
  const [maintenanceSettings, setMaintenanceSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: ''
  });

  // API Integration Settings
  const [apiSettings, setApiSettings] = useState({
    webhookUrl: '',
    apiKey: '',
    apiVersion: '',
    rateLimitPerMinute: 0
  });

  const tabs = [
    { id: 'general', label: t('admin.settings.general'), icon: Settings },
    { id: 'commission', label: t('admin.sidebar.payments'), icon: DollarSign },
    { id: 'shops', label: t('admin.sidebar.shops'), icon: Store },
    { id: 'payment', label: t('admin.settings.payment'), icon: CreditCard },
    { id: 'notifications', label: t('admin.sidebar.notifications'), icon: Bell },
    { id: 'maintenance', label: t('admin.settings.maintenance'), icon: AlertTriangle },
    { id: 'api', label: 'API', icon: Globe }
  ];

  // Currency options
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
  ];

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ];

  // Required documents options
  const documentTypes = [
    { id: 'business_license', label: 'Business License' },
    { id: 'tax_id', label: 'Tax ID / EIN' },
    { id: 'bank_account', label: 'Bank Account Verification' },
    { id: 'identity_verification', label: 'Identity Verification' },
    { id: 'address_proof', label: 'Address Proof' }
  ];

  // Load settings on mount
  useEffect(() => {
    loadSettings();
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

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.getGlobalSettings();
      // Handle both { data: settings } and direct settings response formats
      const settings = response?.data || response;

      if (settings.general) {
        setGeneralSettings(settings.general);
      }
      if (settings.commission) {
        setCommissionSettings(settings.commission);
      }
      if (settings.shops) {
        setShopSettings(settings.shops);
      }
      if (settings.payment) {
        setPaymentSettings(settings.payment);
      }
      if (settings.notifications) {
        setNotificationSettings(settings.notifications);
      }
      if (settings.maintenance) {
        setMaintenanceSettings(settings.maintenance);
      }
      if (settings.api) {
        setApiSettings(settings.api);
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      toast.error(t('admin.settings.settingsFailedLoad'), {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (activeTab === 'general') {
      try {
        generalSettingsSchema.parse(generalSettings);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
        }
      }
    }

    if (activeTab === 'commission') {
      try {
        commissionSettingsSchema.parse(commissionSettings);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t('admin.settings.validationFailed'), { description: t('admin.settings.fixErrors') });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {};

      if (activeTab === 'general') {
        updateData.general = generalSettings;
      } else if (activeTab === 'commission') {
        updateData.commission = commissionSettings;
      } else if (activeTab === 'shops') {
        updateData.shops = shopSettings;
      } else if (activeTab === 'payment') {
        updateData.payment = paymentSettings;
      } else if (activeTab === 'notifications') {
        updateData.notifications = notificationSettings;
      } else if (activeTab === 'maintenance') {
        updateData.maintenance = maintenanceSettings;
      } else if (activeTab === 'api') {
        updateData.api = apiSettings;
      }

      await api.updateGlobalSettings(updateData);

      toast.success(t('admin.settings.settingsSaved'), {
        description: t('admin.settings.changesApplied')
      });
      setHasUnsavedChanges(false);

      // Reload to get updated data
      await loadSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(t('admin.settings.settingsFailed'), {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadSettings();
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('admin.settings.invalidFileType'), { description: t('admin.settings.uploadImage') });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('admin.settings.fileTooLarge'), { description: t('admin.settings.uploadSmaller') });
      return;
    }

    setUploadingLogo(true);
    try {
      const response = await api.uploadPlatformLogo(file);
      // Response is { url: string }
      const logoUrl = response?.url;

      setGeneralSettings({ ...generalSettings, platformLogo: logoUrl });
      setHasUnsavedChanges(true);

      toast.success(t('admin.settings.logoUploaded'), {
        description: t('admin.settings.rememberSave')
      });
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      toast.error(t('admin.settings.logoUploadFailed'), {
        description: error.response?.data?.message || 'Please try again'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const toggleDocumentRequirement = (docId: string) => {
    const current = shopSettings.requiredDocuments;
    const updated = current.includes(docId)
      ? current.filter(id => id !== docId)
      : [...current, docId];

    setShopSettings({ ...shopSettings, requiredDocuments: updated });
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('admin.common.loading')}</p>
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
            {t('admin.settings.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('admin.settings.subtitle')}
          </p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 flex items-center space-x-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('admin.common.loading')}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{t('admin.common.save')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center space-y-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{t('admin.settings.generalSettings')}</h3>
                <p className="text-gray-500 text-sm">{t('admin.settings.configureBasicPlatform')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">{t('admin.settings.platformNameRequired')}</label>
                <input
                  type="text"
                  value={generalSettings.platformName}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, platformName: e.target.value });
                    setHasUnsavedChanges(true);
                    if (validationErrors.platformName) {
                      setValidationErrors({ ...validationErrors, platformName: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    validationErrors.platformName ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder={t('common.placeholders.platformName')}
                />
                {validationErrors.platformName && (
                  <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.platformName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">{t('admin.settings.supportEmailRequired')}</label>
                <input
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, supportEmail: e.target.value });
                    setHasUnsavedChanges(true);
                    if (validationErrors.supportEmail) {
                      setValidationErrors({ ...validationErrors, supportEmail: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    validationErrors.supportEmail ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="support@vasty.shop"
                />
                {validationErrors.supportEmail && (
                  <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.supportEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block font-medium">{t('admin.settings.platformLogo')}</label>
              <div className="space-y-3">
                {generalSettings.platformLogo && (
                  <div className="relative w-32 h-32">
                    <img
                      src={generalSettings.platformLogo}
                      alt="Platform logo"
                      className="w-full h-full rounded-xl object-cover border border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setGeneralSettings({ ...generalSettings, platformLogo: '' });
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
                  className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all flex items-center space-x-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('admin.settings.uploading')}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{t('admin.settings.uploadLogo')}</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400">{t('admin.settings.logoRecommended')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">{t('admin.settings.currencyRequired')}</label>
                <select
                  value={generalSettings.defaultCurrency}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, defaultCurrency: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code} className="bg-white">
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">{t('admin.settings.languageRequired')}</label>
                <select
                  value={generalSettings.defaultLanguage}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code} className="bg-white">
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Commission Settings Tab */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{t('admin.settings.commissionSettings')}</h3>
                <p className="text-gray-500 text-sm">{t('admin.settings.configureCommission')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">
                  {t('admin.settings.platformCommissionRate')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionSettings.platformCommissionRate}
                    onChange={(e) => {
                      setCommissionSettings({
                        ...commissionSettings,
                        platformCommissionRate: parseFloat(e.target.value) || 0
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('admin.settings.commissionTaken')}</p>
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">
                  {t('admin.settings.minimumOrderAmount')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={commissionSettings.minimumOrderAmount}
                    onChange={(e) => {
                      setCommissionSettings({
                        ...commissionSettings,
                        minimumOrderAmount: parseFloat(e.target.value) || 0
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 pl-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="5.00"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('admin.settings.minimumOrderValue')}</p>
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">
                  {t('admin.settings.freeShippingThreshold')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={commissionSettings.freeShippingThreshold}
                    onChange={(e) => {
                      setCommissionSettings({
                        ...commissionSettings,
                        freeShippingThreshold: parseFloat(e.target.value) || 0
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 pl-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="50.00"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('admin.settings.orderValueFreeShipping')}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">{t('admin.settings.commissionInfo')}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {t('admin.settings.commissionInfoDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shop Settings Tab */}
        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Shop Settings</h3>
                <p className="text-gray-500 text-sm">Configure shop approval and verification requirements</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Auto-approve New Shops</p>
                  <p className="text-xs text-gray-500">Automatically approve shop registrations without manual review</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shopSettings.autoApproveShops}
                  onChange={(e) => {
                    setShopSettings({ ...shopSettings, autoApproveShops: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-3 block font-medium">
                Required Documents for Shop Verification
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentTypes.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all"
                    onClick={() => toggleDocumentRequirement(doc.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      shopSettings.requiredDocuments.includes(doc.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {shopSettings.requiredDocuments.includes(doc.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-1">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-900 font-medium">{doc.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block font-medium">
                Maximum Products Per Shop
              </label>
              <div className="relative max-w-xs">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={shopSettings.maxProductsPerShop}
                  onChange={(e) => {
                    setShopSettings({
                      ...shopSettings,
                      maxProductsPerShop: parseInt(e.target.value) || 1000
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="1000"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Limit the number of products each shop can create</p>
            </div>
          </div>
        )}

        {/* Payment Settings Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Settings</h3>
                <p className="text-gray-500 text-sm">Enable and configure payment methods</p>
              </div>
            </div>

            {/* Stripe */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Stripe</h4>
                    <p className="text-xs text-gray-500">Credit card and digital wallet payments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    paymentSettings.stripe.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : paymentSettings.stripe.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {paymentSettings.stripe.status === 'active' ? 'Active' :
                     paymentSettings.stripe.status === 'error' ? 'Error' : 'Inactive'}
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
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">PayPal</h4>
                    <p className="text-xs text-gray-500">PayPal digital payments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    paymentSettings.paypal.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : paymentSettings.paypal.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {paymentSettings.paypal.status === 'active' ? 'Active' :
                     paymentSettings.paypal.status === 'error' ? 'Error' : 'Inactive'}
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
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-gray-500">Pay with cash upon delivery</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    paymentSettings.cod.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : paymentSettings.cod.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {paymentSettings.cod.status === 'active' ? 'Active' :
                     paymentSettings.cod.status === 'error' ? 'Error' : 'Inactive'}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.cod.enabled}
                      onChange={(e) => {
                        setPaymentSettings({
                          ...paymentSettings,
                          cod: { ...paymentSettings.cod, enabled: e.target.checked }
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
                <p className="text-gray-500 text-sm">Configure notification channels</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Send notifications via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-xs text-gray-500">Browser push notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-xs text-gray-500">Send notifications via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => {
                      setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked });
                      setHasUnsavedChanges(true);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Mode Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Maintenance Mode</h3>
                <p className="text-gray-500 text-sm">Configure platform maintenance settings</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Warning: Maintenance Mode</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Enabling maintenance mode will make the platform unavailable to all users except administrators.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900 text-lg">Enable Maintenance Mode</p>
                  <p className="text-xs text-gray-500 mt-1">Temporarily disable access to the platform</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceSettings.maintenanceMode}
                  onChange={(e) => {
                    setMaintenanceSettings({ ...maintenanceSettings, maintenanceMode: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block font-medium">
                Maintenance Message
              </label>
              <textarea
                value={maintenanceSettings.maintenanceMessage}
                onChange={(e) => {
                  setMaintenanceSettings({ ...maintenanceSettings, maintenanceMessage: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                rows={4}
                placeholder={t('common.placeholders.maintenanceMessage')}
              />
              <p className="text-xs text-gray-400 mt-1">This message will be shown to users when accessing the platform</p>
            </div>
          </div>
        )}

        {/* API Integration Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">API Integration</h3>
                <p className="text-gray-500 text-sm">Configure API access and webhooks</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">API Version</label>
                <input
                  type="text"
                  value={apiSettings.apiVersion}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-2 block font-medium">Rate Limit (per minute)</label>
                <input
                  type="number"
                  min="1"
                  value={apiSettings.rateLimitPerMinute}
                  onChange={(e) => {
                    setApiSettings({ ...apiSettings, rateLimitPerMinute: parseInt(e.target.value) || 60 });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block font-medium">Webhook URL</label>
              <input
                type="url"
                value={apiSettings.webhookUrl}
                onChange={(e) => {
                  setApiSettings({ ...apiSettings, webhookUrl: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="https://your-domain.com/webhook"
              />
              <p className="text-xs text-gray-400 mt-1">Receive real-time event notifications</p>
            </div>

            <div>
              <label className="text-sm text-gray-700 mb-2 block font-medium">API Key</label>
              <div className="relative">
                <input
                  type="text"
                  value={apiSettings.apiKey}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Contact support to regenerate API key</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">API Security</p>
                <p className="text-xs text-blue-600 mt-1">
                  Keep your API key secure and never share it publicly. All API requests are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 flex items-center space-x-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('admin.settings.savingAllChanges')}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t('admin.settings.saveAllChanges')}</span>
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

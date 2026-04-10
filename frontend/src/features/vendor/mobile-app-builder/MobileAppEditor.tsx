'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Upload,
  Download,
  Eye,
  Smartphone,
  Palette,
  Layout,
  Settings,
  Layers,
  ChevronRight,
  CheckCircle,
  Loader2,
  Monitor,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  Truck,
  Store,
  Bell,
  Moon,
  Fingerprint,
  MessageCircle,
  Apple,
  ZoomIn,
  ZoomOut,
  Info,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShopStore } from '@/stores/useShopStore';
import { api } from '@/lib/api';
import { MobileAppPreview } from './MobileAppPreview';
import { VendorPanelPreview } from './VendorPanelPreview';
import { AppConfigModal, AppConfig } from './AppConfigModal';
import {
  MOBILE_THEME_PRESETS,
  COLOR_PALETTES,
  MOBILE_FONT_OPTIONS,
  LANGUAGE_OPTIONS,
  createDefaultMobileAppConfig,
  DEFAULT_CUSTOMER_SCREENS,
  DEFAULT_VENDOR_SCREENS,
  DEFAULT_DELIVERY_SCREENS,
  DEFAULT_CUSTOMER_NAVIGATION,
  DEFAULT_VENDOR_NAVIGATION,
  DEFAULT_DELIVERY_NAVIGATION,
} from './constants';
import type {
  MobileAppConfig,
  MobileAppType,
  MobileAppTheme,
  DesignVariant,
  ColorScheme,
  MobileAppScreen,
  NavigationConfig,
  MobileAppFeatures,
} from './types';

type EditorPanel = 'screens' | 'theme' | 'navigation' | 'features' | null;
type PreviewDevice = 'iphone' | 'android';
type PreviewScale = 50 | 75 | 100 | 125 | 150;

export function MobileAppEditor() {
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams] = useSearchParams();
  const { currentShop } = useShopStore();

  // Editor state
  const [activeAppType, setActiveAppType] = useState<MobileAppType>('customer');
  const [customerConfig, setCustomerConfig] = useState<MobileAppConfig | null>(null);
  const [deliveryConfig, setDeliveryConfig] = useState<MobileAppConfig | null>(null);
  const [activePanel, setActivePanel] = useState<EditorPanel>('theme');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('iphone');
  const [previewScreen, setPreviewScreen] = useState<string>('home'); // Always start with home screen
  const [darkModePreview, setDarkModePreview] = useState(false);
  const [previewScale, setPreviewScale] = useState<PreviewScale>(100);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // App config modal state
  const [showAppConfigModal, setShowAppConfigModal] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<MobileAppConfig[]>([]);
  const [redoStack, setRedoStack] = useState<MobileAppConfig[]>([]);

  // Shop data for dynamic preview
  const [shopProducts, setShopProducts] = useState<Array<{
    id: string;
    name: string;
    slug?: string;
    price: number;
    salePrice?: number;
    image?: string;
    images?: string[];
    category?: string;
    brand?: string;
    rating?: number;
    stock?: number;
    description?: string;
  }>>([]);
  const [shopCategories, setShopCategories] = useState<Array<{
    id: string;
    name: string;
    slug?: string;
    image?: string;
    productCount?: number;
  }>>([]);
  const [shopData, setShopData] = useState<{
    name: string;
    logo?: string;
    banner?: string;
    description?: string;
    tagline?: string;
  } | null>(null);
  const [shopOrders, setShopOrders] = useState<Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    itemCount: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: any;
    createdAt: string;
    items?: any[];
  }>>([]);

  // Fetch shop data for preview (same pattern as StorefrontEditor)
  useEffect(() => {
    const fetchShopData = async () => {
      if (!currentShop?.id) return;

      try {
        // Fetch products, categories, shop data, and orders in parallel (like StorefrontEditor)
        const [productsResult, categoriesResult, shopResult, ordersResult] = await Promise.all([
          api.getProducts({ shopId: currentShop.id, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => {
            return { data: [], total: 0 };
          }),
          api.getCategories().catch(() => {
            return [] as any[];
          }),
          api.getShop(currentShop.id).catch(() => null),
          api.getShopOrders({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => {
            return { data: [], total: 0 };
          }),
        ]);

        // Set products
        const productsData = productsResult?.data || [];
        const products = productsData.map((p: any) => ({
          id: p.id,
          name: p.name || 'Product',
          slug: p.slug,
          price: p.price || 0,
          salePrice: p.salePrice,
          image: p.images?.[0] || p.thumbnail || '',
          images: p.images || [],
          category: p.category?.name || '',
          brand: p.brand || currentShop?.name || '',
          rating: p.averageRating || 4.5,
          stock: p.inventory?.quantity || p.stock || 0,
          description: p.shortDescription || p.description || '',
        }));
        setShopProducts(products);

        // Set categories
        const categoriesData = Array.isArray(categoriesResult) ? categoriesResult : ((categoriesResult as any)?.data || []);
        const categories = categoriesData.map((c: any) => ({
          id: c.id,
          name: c.name || 'Category',
          slug: c.slug,
          image: c.image || '',
          productCount: c.productCount || 0,
        }));
        setShopCategories(categories);

        // Set shop data
        if (shopResult) {
          setShopData({
            name: shopResult.name || currentShop?.name || 'My Store',
            logo: shopResult.logo,
            banner: shopResult.banner,
            description: shopResult.description,
            tagline: shopResult.tagline,
          });
        }

        // Set orders data
        const ordersData = ordersResult?.data || [];
        const orders = ordersData.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber || o.order_number || `ORD-${o.id?.slice(0, 8)}`,
          status: o.status || 'pending',
          total: o.total || o.totalAmount || 0,
          itemCount: o.items?.length || o.itemCount || 1,
          customerName: o.shippingAddress?.name || o.customerName || o.customer?.name || 'Customer',
          customerEmail: o.customer?.email || o.customerEmail || '',
          customerPhone: o.shippingAddress?.phone || o.customerPhone || '',
          shippingAddress: o.shippingAddress || o.shipping_address,
          createdAt: o.createdAt || o.created_at || new Date().toISOString(),
          items: o.items || [],
        }));
        setShopOrders(orders);

        console.log('[MobileAppEditor] Loaded shop data:', {
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          shopName: shopResult?.name
        });
      } catch (error) {
        console.error('[MobileAppEditor] Failed to fetch shop data:', error);
      }
    };

    fetchShopData();
  }, [currentShop?.id]);

  // All panels use the same config (customer config)
  // Only the mobile preview changes based on activeAppType
  const currentConfig = customerConfig;
  const setCurrentConfig = setCustomerConfig;

  // Get screens based on active app type
  const getScreensForAppType = (appType: MobileAppType): MobileAppScreen[] => {
    switch (appType) {
      case 'customer':
        return (currentConfig?.screens || DEFAULT_CUSTOMER_SCREENS) as MobileAppScreen[];
      case 'vendor':
        return DEFAULT_VENDOR_SCREENS as MobileAppScreen[];
      case 'delivery':
        return DEFAULT_DELIVERY_SCREENS as MobileAppScreen[];
      default:
        return DEFAULT_CUSTOMER_SCREENS as MobileAppScreen[];
    }
  };

  // Get navigation based on active app type
  const getNavigationForAppType = (appType: MobileAppType): NavigationConfig => {
    // Get the base navigation items for the app type
    const baseNavigation = (() => {
      switch (appType) {
        case 'customer':
          return DEFAULT_CUSTOMER_NAVIGATION;
        case 'vendor':
          return DEFAULT_VENDOR_NAVIGATION;
        case 'delivery':
          return DEFAULT_DELIVERY_NAVIGATION;
        default:
          return DEFAULT_CUSTOMER_NAVIGATION;
      }
    })();

    // Merge with current config navigation to preserve style, showLabels, hapticFeedback
    return {
      ...baseNavigation,
      type: currentConfig?.navigation?.type || baseNavigation.type,
      position: currentConfig?.navigation?.position || baseNavigation.position,
      style: currentConfig?.navigation?.style || baseNavigation.style,
      showLabels: currentConfig?.navigation?.showLabels ?? baseNavigation.showLabels,
      hapticFeedback: currentConfig?.navigation?.hapticFeedback ?? baseNavigation.hapticFeedback,
    };
  };

  // Reset preview screen when app type changes
  useEffect(() => {
    const screens = getScreensForAppType(activeAppType);
    if (screens && screens.length > 0) {
      // Set to first enabled screen, or first screen if none enabled
      const firstEnabledScreen = screens.find(s => s.enabled);
      setPreviewScreen(firstEnabledScreen?.id || screens[0]?.id || 'home');
    }
  }, [activeAppType]);

  // Load configuration
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        // Try to load existing config from database
        const response = await api.getMobileAppConfig();
    

        // Handle both response structures: {config: {...}} or {data: {...}}
        const configData = response?.config || response?.data || {};

        if (configData && Object.keys(configData).length > 0) {
          // Convert unified config to MobileAppConfig format for preview
          // Merge saved config with defaults to ensure all required fields exist
          const defaultConfig = createDefaultMobileAppConfig(shopId || '', currentShop?.name || 'Store', 'customer');

          // Merge saved screens with new default screens
          // This ensures new screens are added while preserving saved screen settings
          const savedScreens = configData.screens || [];
          const mergedScreens = defaultConfig.screens.map(defaultScreen => {
            const savedScreen = savedScreens.find((s: any) => s.id === defaultScreen.id);
            return savedScreen ? { ...defaultScreen, ...savedScreen } : defaultScreen;
          });

          const fullConfig: MobileAppConfig = {
            ...defaultConfig,
            id: `mobile-app-${shopId}`,
            shopId: shopId || '',
            appType: 'customer', // Since it's one unified app
            version: 1,
            appName: currentShop?.name || 'Store',
            appSlogan: 'Shop anytime, anywhere',
            appIcon: configData.appIcon || undefined,
            // Merge theme: defaults + saved values
            theme: {
              ...defaultConfig.theme,
              ...(configData.theme || {}),
            },
            // Merge navigation: defaults + saved values
            navigation: {
              ...defaultConfig.navigation,
              ...(configData.navigation || {}),
            },
            // Merge features: defaults + saved values
            features: {
              ...defaultConfig.features,
              ...(configData.features || {}),
            },
            splashScreen: configData.splashScreen || defaultConfig.splashScreen,
            onboarding: configData.onboarding || defaultConfig.onboarding,
            screens: mergedScreens, // Use merged screens
            pushNotifications: configData.pushNotifications || defaultConfig.pushNotifications,
            published: response.published || false,
            createdAt: response.createdAt || new Date().toISOString(),
            updatedAt: response.updatedAt || new Date().toISOString(),
          };

          // console.log('✅ Final merged config for preview:', fullConfig);
          // console.log('🎨 Theme applied:', fullConfig.theme);
          // console.log('📦 Config data:', configData);
          // console.log('📦 App config from API:', configData.appConfig);
          setCustomerConfig(fullConfig);

          // Load app config if it exists
          if (configData.appConfig) {
            setAppConfig(configData.appConfig);
          } else {
            // console.log('⚠️ No app config found in response');
          }
        } else {
          // No config found, create default
          setCustomerConfig(
            createDefaultMobileAppConfig(shopId || '', currentShop?.name || 'Store', 'customer')
          );
        }
      } catch (error) {
        console.error('Failed to load mobile app config:', error);
        // Create default config
        setCustomerConfig(
          createDefaultMobileAppConfig(shopId || '', currentShop?.name || 'Store', 'customer')
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [shopId, currentShop?.name]);

  // Update config with undo support
  const updateConfig = (updates: Partial<MobileAppConfig>) => {
    if (!currentConfig) return;

    setUndoStack((prev) => [...prev.slice(-19), currentConfig]);
    setRedoStack([]);
    setCurrentConfig({ ...currentConfig, ...updates, updatedAt: new Date().toISOString() });
    setIsDirty(true);
  };

  // Update theme
  const updateTheme = (themeUpdates: Partial<MobileAppTheme>) => {
    if (!currentConfig) return;
    updateConfig({
      theme: { ...currentConfig.theme, ...themeUpdates },
    });
  };

  // Update app logo
  const updateAppLogo = (url: string) => {
    if (!currentConfig) return;
    updateConfig({ appIcon: url });
  };

  // Update navigation
  const updateNavigation = (navigation: NavigationConfig) => {
    updateConfig({ navigation });
  };

  // Update features
  const updateFeatures = (features: MobileAppFeatures) => {
    updateConfig({ features });
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0 || !currentConfig) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, currentConfig]);
    setUndoStack((prev) => prev.slice(0, -1));
    setCurrentConfig(previous);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0 || !currentConfig) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, currentConfig!]);
    setRedoStack((prev) => prev.slice(0, -1));
    setCurrentConfig(next);
  };

  // Save
  const handleSave = async () => {
    if (!currentConfig) return;

    setIsSaving(true);
    try {
      // Convert MobileAppConfig to minimal unified config format
      // Note: shopInfo is NOT saved - backend always fetches fresh shop data
      const unifiedConfig = {
        appIcon: currentConfig.appIcon || undefined,
        theme: {
          primaryColor: currentConfig.theme.primaryColor,
          secondaryColor: currentConfig.theme.secondaryColor,
          accentColor: currentConfig.theme.accentColor,
          backgroundColor: currentConfig.theme.backgroundColor,
          surfaceColor: currentConfig.theme.surfaceColor,
          textColor: currentConfig.theme.textColor,
          textSecondaryColor: currentConfig.theme.textSecondaryColor,
          fontFamily: currentConfig.theme.fontFamily,
          borderRadius: currentConfig.theme.borderRadius,
          colorScheme: currentConfig.theme.colorScheme,
          styleVariant: (currentConfig.theme as any).styleVariant || 'modern',
          darkMode: currentConfig.theme.darkMode || false,
        },
        navigation: {
          type: currentConfig.navigation.type,
          style: currentConfig.navigation.style,
          showLabels: currentConfig.navigation.showLabels,
          hapticFeedback: currentConfig.navigation.hapticFeedback ?? true,
        },
        features: {
          darkMode: currentConfig.features.darkMode ?? true,
          pushNotifications: currentConfig.features.pushNotifications ?? true,
          biometricAuth: currentConfig.features.biometricAuth ?? true,
          language: currentConfig.features.language ?? 'en',
        },
      };

      await api.updateMobileAppConfig(unifiedConfig);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!currentConfig) return;

    setIsPublishing(true);
    try {
      // Save first with minimal config format
      // Note: shopInfo is NOT saved - backend always fetches fresh shop data
      const unifiedConfig = {
        appIcon: currentConfig.appIcon || undefined,
        theme: {
          primaryColor: currentConfig.theme.primaryColor,
          secondaryColor: currentConfig.theme.secondaryColor,
          accentColor: currentConfig.theme.accentColor,
          backgroundColor: currentConfig.theme.backgroundColor,
          surfaceColor: currentConfig.theme.surfaceColor,
          textColor: currentConfig.theme.textColor,
          textSecondaryColor: currentConfig.theme.textSecondaryColor,
          fontFamily: currentConfig.theme.fontFamily,
          borderRadius: currentConfig.theme.borderRadius,
          colorScheme: currentConfig.theme.colorScheme,
          styleVariant: (currentConfig.theme as any).styleVariant || 'modern',
          darkMode: currentConfig.theme.darkMode || false,
        },
        navigation: {
          type: currentConfig.navigation.type,
          style: currentConfig.navigation.style,
          showLabels: currentConfig.navigation.showLabels,
          hapticFeedback: currentConfig.navigation.hapticFeedback ?? true,
        },
        features: {
          darkMode: currentConfig.features.darkMode ?? true,
          pushNotifications: currentConfig.features.pushNotifications ?? true,
          biometricAuth: currentConfig.features.biometricAuth ?? true,
          language: currentConfig.features.language ?? 'en',
        },
      };

      await api.updateMobileAppConfig(unifiedConfig);
      // Then publish
      await api.publishMobileApp();
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Show app config modal before download
  const handleDownloadClick = () => {
    setShowAppConfigModal(true);
  };

  // Download App with config
  const handleDownloadApp = async (config: AppConfig) => {
    setIsDownloading(true);
    try {
      // Save app config to database first
      if (!currentConfig) return;

      const unifiedConfig = {
        appIcon: currentConfig.appIcon || undefined,
        theme: {
          primaryColor: currentConfig.theme.primaryColor,
          secondaryColor: currentConfig.theme.secondaryColor,
          accentColor: currentConfig.theme.accentColor,
          backgroundColor: currentConfig.theme.backgroundColor,
          surfaceColor: currentConfig.theme.surfaceColor,
          textColor: currentConfig.theme.textColor,
          textSecondaryColor: currentConfig.theme.textSecondaryColor,
          fontFamily: currentConfig.theme.fontFamily,
          borderRadius: currentConfig.theme.borderRadius,
          colorScheme: currentConfig.theme.colorScheme,
          styleVariant: (currentConfig.theme as any).styleVariant || 'modern',
          darkMode: currentConfig.theme.darkMode || false,
        },
        navigation: {
          type: currentConfig.navigation.type,
          style: currentConfig.navigation.style,
          showLabels: currentConfig.navigation.showLabels,
          hapticFeedback: currentConfig.navigation.hapticFeedback ?? true,
        },
        features: {
          darkMode: currentConfig.features.darkMode ?? true,
          pushNotifications: currentConfig.features.pushNotifications ?? true,
          biometricAuth: currentConfig.features.biometricAuth ?? true,
        },
        appConfig: config, // Save app config
      };

      await api.updateMobileAppConfig(unifiedConfig);
      setAppConfig(config); // Update local state

      // Use centralized API method with app config
      const blob = await api.downloadMobileApp(config);

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mobile-app-${shopId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowAppConfigModal(false);
    } catch (error) {
      console.error('Failed to download app:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Apply theme preset
  const applyThemePreset = (preset: (typeof MOBILE_THEME_PRESETS)[0]) => {
    updateTheme(preset.theme);
  };

  // Apply color scheme - ONLY changes brand colors (primary, secondary, accent)
  // Does NOT change background, surface, or text colors
  const applyColorScheme = (scheme: ColorScheme) => {
    const palette = COLOR_PALETTES[scheme];
    updateTheme({
      colorScheme: scheme,
      primaryColor: palette.primaryColor,
      secondaryColor: palette.secondaryColor,
      accentColor: palette.accentColor,
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-lime mx-auto mb-4" />
          <p className="text-white/60">Loading mobile app editor...</p>
        </div>
      </div>
    );
  }

  if (!currentConfig) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-white/60">No configuration found</p>
          <Button
            onClick={() => navigate(`/shop/${shopId}/vendor/storefront-builder`)}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/shop/${shopId}/vendor/storefront-builder`)}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="h-6 w-px bg-white/20" />

          {/* Panel Tabs - One app with multiple panels */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveAppType('customer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeAppType === 'customer'
                  ? 'bg-primary-lime text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Customer Panel
            </button>
            <button
              onClick={() => setActiveAppType('vendor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeAppType === 'vendor'
                  ? 'bg-primary-lime text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              Vendor Panel
            </button>
            <button
              onClick={() => setActiveAppType('delivery')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeAppType === 'delivery'
                  ? 'bg-primary-lime text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              Delivery Panel
            </button>
          </div>
        </div>

        {/* Device Selector & Zoom Controls - Middle */}
        <div className="flex items-center gap-3">
          {/* Device Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice('iphone')}
              className={`p-1.5 rounded-md transition-all duration-300 ${
                previewDevice === 'iphone'
                  ? 'bg-primary-lime/20 text-primary-lime'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Apple className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('android')}
              className={`p-1.5 rounded-md transition-all duration-300 ${
                previewDevice === 'android'
                  ? 'bg-primary-lime/20 text-primary-lime'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setPreviewScale(Math.max(50, previewScale - 25) as PreviewScale)}
              disabled={previewScale <= 50}
              className="p-1.5 rounded-md text-white/40 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <select
              value={previewScale}
              onChange={(e) => setPreviewScale(Number(e.target.value) as PreviewScale)}
              className="bg-transparent text-white/70 text-xs font-medium px-1 py-1 outline-none cursor-pointer appearance-none text-center min-w-[52px]"
            >
              <option value={50} className="bg-slate-800 text-white">50%</option>
              <option value={75} className="bg-slate-800 text-white">75%</option>
              <option value={100} className="bg-slate-800 text-white">100%</option>
              <option value={125} className="bg-slate-800 text-white">125%</option>
              <option value={150} className="bg-slate-800 text-white">150%</option>
            </select>
            <button
              onClick={() => setPreviewScale(Math.min(150, previewScale + 25) as PreviewScale)}
              disabled={previewScale >= 150}
              className="p-1.5 rounded-md text-white/40 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="text-white/60 hover:text-white disabled:opacity-30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="text-white/60 hover:text-white disabled:opacity-30"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Save Button - Always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`border-white/40 transition-all ${
              isDirty
                ? 'text-white bg-white/10 hover:bg-white/20'
                : 'text-white/70 bg-white/5 cursor-not-allowed opacity-60'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {isDirty ? 'Save Changes' : 'Saved'}
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="bg-primary-lime hover:bg-primary-lime/90 text-white"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download App
          </Button>

          {/* Publish button - Commented out for now
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-primary-lime hover:bg-primary-lime/90"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Publish
          </Button>
          */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Panel Selection */}
        <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-2 flex-shrink-0">
          {[
            { id: 'theme', icon: Palette, label: 'Theme' },
            { id: 'screens', icon: Layers, label: 'Screens' },
            { id: 'navigation', icon: Layout, label: 'Navigation' },
            { id: 'features', icon: Settings, label: 'Features' },
          ].map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id as EditorPanel)}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                activePanel === panel.id
                  ? 'bg-primary-lime/20 text-primary-lime'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <panel.icon className="w-5 h-5" />
              <span className="text-[10px]">{panel.label}</span>
            </button>
          ))}
        </div>

        {/* Left Panel Content */}
        <div className="w-80 border-r border-white/10 overflow-y-auto flex-shrink-0">
          <AnimatePresence mode="wait">
            {activePanel === 'theme' && (
              <ThemePanel
                theme={currentConfig.theme}
                onUpdate={updateTheme}
                onApplyPreset={applyThemePreset}
                onApplyColorScheme={applyColorScheme}
                appLogo={currentConfig.appIcon}
                onAppLogoUpdate={updateAppLogo}
              />
            )}
            {activePanel === 'screens' && (
              <ScreensPanel
                screens={getScreensForAppType(activeAppType)}
                appType={activeAppType}
                onSelectScreen={setPreviewScreen}
                selectedScreen={previewScreen}
              />
            )}
            {activePanel === 'navigation' && (
              <NavigationPanel
                navigation={getNavigationForAppType(activeAppType)}
                onUpdate={updateNavigation}
              />
            )}
            {activePanel === 'features' && (
              <FeaturesPanel
                features={currentConfig.features}
                appType={activeAppType}
                onUpdate={updateFeatures}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col bg-slate-800/50 overflow-auto">
          {/* Phone Preview with Floating Banner */}
          <div className="flex-1 flex items-center justify-center py-8 relative">
            {/* Floating Preview Banner - Top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 text-white shadow-lg backdrop-blur-sm">
                <Info className="w-4 h-4" />
                <span className="text-xs font-medium">Preview Mode - Full functionality available in downloaded app</span>
              </div>
            </div>

            {/* Scalable Preview Container */}
            <div
              className="transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${previewScale / 100})`,
                transformOrigin: 'center center',
              }}
            >
              {activeAppType === 'customer' && (
                <MobileAppPreview
                  config={{
                    ...currentConfig,
                    appType: 'customer',
                    navigation: getNavigationForAppType('customer'),
                    screens: getScreensForAppType('customer'),
                  }}
                  device={previewDevice}
                  darkMode={darkModePreview}
                  activeScreen={previewScreen}
                  onNavigate={setPreviewScreen}
                  shopProducts={shopProducts}
                  shopCategories={shopCategories}
                  shopName={shopData?.name || currentShop?.name}
                  shopLogo={shopData?.logo}
                  shopBanner={shopData?.banner}
                  shopOrders={shopOrders}
                />
              )}

              {activeAppType === 'vendor' && (
                <MobileAppPreview
                  config={{
                    ...currentConfig,
                    appType: 'vendor',
                    navigation: getNavigationForAppType('vendor'),
                    screens: getScreensForAppType('vendor'),
                  }}
                  device={previewDevice}
                  darkMode={darkModePreview}
                  activeScreen={previewScreen}
                  onNavigate={setPreviewScreen}
                  shopProducts={shopProducts}
                  shopCategories={shopCategories}
                  shopName={shopData?.name || currentShop?.name}
                  shopLogo={shopData?.logo}
                  shopBanner={shopData?.banner}
                  shopOrders={shopOrders}
                />
              )}

              {activeAppType === 'delivery' && (
                <MobileAppPreview
                  config={{
                    ...currentConfig,
                    appType: 'delivery',
                    navigation: getNavigationForAppType('delivery'),
                    screens: getScreensForAppType('delivery'),
                  }}
                  device={previewDevice}
                  darkMode={darkModePreview}
                  activeScreen={previewScreen}
                  onNavigate={setPreviewScreen}
                  shopProducts={shopProducts}
                  shopCategories={shopCategories}
                  shopName={shopData?.name || currentShop?.name}
                  shopLogo={shopData?.logo}
                  shopBanner={shopData?.banner}
                  shopOrders={shopOrders}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Config Modal */}
      <AppConfigModal
        isOpen={showAppConfigModal}
        onClose={() => setShowAppConfigModal(false)}
        onDownload={handleDownloadApp}
        existingConfig={appConfig}
        isDownloading={isDownloading}
        shopName={currentShop?.name}
      />
    </div>
  );
}

// Theme Panel Component
function ThemePanel({
  theme,
  onUpdate,
  onApplyPreset,
  onApplyColorScheme,
  appLogo,
  onAppLogoUpdate,
}: {
  theme: MobileAppTheme;
  onUpdate: (updates: Partial<MobileAppTheme>) => void;
  onApplyPreset: (preset: (typeof MOBILE_THEME_PRESETS)[0]) => void;
  onApplyColorScheme: (scheme: ColorScheme) => void;
  appLogo?: string;
  onAppLogoUpdate: (url: string) => void;
}) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const result = await api.uploadAppIcon(file);
      onAppLogoUpdate(result.url);
    } catch (error) {
      console.error('Failed to upload app logo:', error);
      alert('Failed to upload app logo. Please try again.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 space-y-6"
    >
      <h3 className="text-lg font-semibold text-white">Theme</h3>

      {/* App Logo Upload */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">App Logo</h4>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
        <div className="flex items-center gap-3">
          {/* Upload Box */}
          <div
            onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
            className={`relative w-16 h-16 rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center transition-all ${
              isUploadingLogo ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/40 hover:bg-white/10 cursor-pointer'
            }`}
          >
            {appLogo ? (
              <>
                <img
                  src={appLogo}
                  alt="App Logo"
                  className="w-12 h-12 object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppLogoUpdate('');
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </>
            ) : isUploadingLogo ? (
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-white/40" />
            )}
          </div>
          {/* Info Text */}
          <div className="flex-1">
            <p className="text-sm text-white/70 mb-0.5">
              {appLogo ? 'Click to change' : 'Click to upload'}
            </p>
            <p className="text-xs text-white/40">PNG, JPG (max 5MB)</p>
          </div>
        </div>
      </div>

      {/* Theme Presets */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_THEME_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                theme.id === preset.theme.id
                  ? 'border-primary-lime bg-primary-lime/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div
                className="w-full h-8 rounded mb-2"
                style={{ backgroundColor: preset.theme.primaryColor }}
              />
              <div className="text-xs font-medium text-white truncate">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Color Scheme</h4>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(COLOR_PALETTES) as ColorScheme[]).map((scheme) => (
            <button
              key={scheme}
              onClick={() => onApplyColorScheme(scheme)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                theme.colorScheme === scheme
                  ? 'border-white ring-2 ring-primary-lime'
                  : 'border-transparent hover:border-white/30'
              }`}
              style={{ backgroundColor: COLOR_PALETTES[scheme].primaryColor }}
              title={scheme}
            />
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Border Radius</h4>
        <div className="flex gap-2">
          {(['none', 'small', 'medium', 'large', 'full'] as const).map((radius) => (
            <button
              key={radius}
              onClick={() => onUpdate({ borderRadius: radius })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                theme.borderRadius === radius
                  ? 'bg-primary-lime text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {radius}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Font Family</h4>
        <select
          value={theme.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-lime/50"
        >
          {MOBILE_FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dark Mode */}
      <div>
        <label className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Dark Mode Default</span>
          <button
            onClick={() => onUpdate({ darkMode: !theme.darkMode })}
            className={`w-11 h-6 rounded-full transition-colors ${
              theme.darkMode ? 'bg-primary-lime' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                theme.darkMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>
    </motion.div>
  );
}

// Screens Panel Component
function ScreensPanel({
  screens,
  appType,
  onSelectScreen,
  selectedScreen,
}: {
  screens: MobileAppScreen[];
  appType: MobileAppType;
  onSelectScreen: (screenId: string) => void;
  selectedScreen: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">Screens</h3>
      <p className="text-sm text-white/50">
        Click on a screen to preview
      </p>

      <div className="space-y-2">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
              selectedScreen === screen.id
                ? 'border-primary-lime bg-primary-lime/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
            onClick={() => onSelectScreen(screen.id)}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-lime/20 text-primary-lime">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{screen.title}</div>
              <div className="text-xs text-white/50">{screen.type}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Navigation Panel Component
function NavigationPanel({
  navigation,
  onUpdate,
}: {
  navigation: NavigationConfig;
  onUpdate: (navigation: NavigationConfig) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 space-y-6"
    >
      <h3 className="text-lg font-semibold text-white">Navigation</h3>

      {/* Navigation Type */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Type</h4>
        <div className="flex gap-2">
          {(['bottom-tabs', 'drawer'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onUpdate({ ...navigation, type })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                navigation.type === type
                  ? 'bg-primary-lime text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {type === 'bottom-tabs' ? 'Bottom Tabs' : 'Drawer'}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Style</h4>
        <div className="flex gap-2">
          {(['default', 'floating', 'minimal'] as const).map((style) => (
            <button
              key={style}
              onClick={() => onUpdate({ ...navigation, style })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                navigation.style === style
                  ? 'bg-primary-lime text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center justify-between">
          <span className="text-sm text-white/70">Show Labels</span>
          <button
            onClick={() => onUpdate({ ...navigation, showLabels: !navigation.showLabels })}
            className={`w-11 h-6 rounded-full transition-colors ${
              navigation.showLabels ? 'bg-primary-lime' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                navigation.showLabels ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white/70">Haptic Feedback</span>
          <button
            onClick={() => onUpdate({ ...navigation, hapticFeedback: !navigation.hapticFeedback })}
            className={`w-11 h-6 rounded-full transition-colors ${
              navigation.hapticFeedback ? 'bg-primary-lime' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                navigation.hapticFeedback ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Navigation Items */}
      <div>
        <h4 className="text-sm font-medium text-white/70 mb-3">Items</h4>
        <div className="space-y-2">
          {navigation.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-white/40 text-xs w-4">{index + 1}</span>
              <span className="text-white text-sm flex-1">{item.label}</span>
              <span className="text-white/40 text-xs">{item.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Features Panel Component
function FeaturesPanel({
  features,
  appType,
  onUpdate,
}: {
  features: MobileAppFeatures;
  appType: MobileAppType;
  onUpdate: (features: MobileAppFeatures) => void;
}) {
  const featureItems = [
    { key: 'darkMode', label: 'Dark Mode', icon: Moon, description: 'Allow users to switch themes' },
    { key: 'biometricAuth', label: 'Biometric Auth', icon: Fingerprint, description: 'Face ID / Fingerprint' },
    { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, description: 'Order & promo alerts' },
    { key: 'inAppChat', label: 'In-App Chat', icon: MessageCircle, description: 'Customer support chat' },
    ...(appType === 'customer'
      ? [
          { key: 'wishlist', label: 'Wishlist', icon: ShoppingBag, description: 'Save favorite items' },
          { key: 'reviews', label: 'Reviews', icon: Layout, description: 'Product reviews' },
        ]
      : [
          { key: 'liveTracking', label: 'Live Tracking', icon: Truck, description: 'Real-time GPS' },
          { key: 'routeOptimization', label: 'Route Optimization', icon: Layout, description: 'Optimize delivery routes' },
        ]),
  ];

  const selectedLanguage = LANGUAGE_OPTIONS.find((lang) => lang.value === features.language) || LANGUAGE_OPTIONS[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white">Features</h3>
      <p className="text-sm text-white/50">Configure app features and language</p>

      {/* Language Selector */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-base font-semibold text-white">App Language</div>
            <div className="text-sm text-white/50">Select default language for the app</div>
          </div>
        </div>
        <select
          value={features.language || 'en'}
          onChange={(e) => onUpdate({ ...features, language: e.target.value as any })}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/20 text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '20px',
          }}
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-slate-800">
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/40 mt-2">
          Currently selected: {selectedLanguage.flag} {selectedLanguage.label}
        </p>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-3">
        {featureItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-white">{item.label}</div>
                <div className="text-sm text-white/50 mt-0.5">{item.description}</div>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <div
                className={`w-12 h-7 rounded-full transition-colors cursor-not-allowed ${
                  (features as any)[item.key] ? 'bg-primary-lime' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    (features as any)[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default MobileAppEditor;

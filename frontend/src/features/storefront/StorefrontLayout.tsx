'use client';

/**
 * Storefront Layout
 * Wraps all store pages with shared header, footer, and theme
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Heart,
  Package,
  Loader2,
  Store,
  ExternalLink,
  Home,
  ShoppingBag,
  MapPin,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import type {
  StorefrontConfig,
  StorefrontConfigV2,
} from '@/features/vendor/storefront-builder/types';
import { migrateConfigV1ToV2, createDefaultStorefrontConfigV2 } from '@/features/vendor/storefront-builder/constants';
import { StorefrontMobileNav } from './components/StorefrontMobileNav';
import { LanguageSelector } from './components/LanguageSelector';

interface ShopInfo {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

interface StorefrontContextType {
  config: StorefrontConfigV2 | null;
  shop: ShopInfo | null;
  shopId: string;
  theme: StorefrontConfigV2['theme'] | null;
  isLoading: boolean;
}

const StorefrontContext = createContext<StorefrontContextType>({
  config: null,
  shop: null,
  shopId: '',
  theme: null,
  isLoading: true,
});

export const useStorefront = () => useContext(StorefrontContext);

interface StorefrontLayoutProps {
  shopIdOverride?: string;
}

export function StorefrontLayout({ shopIdOverride }: StorefrontLayoutProps = {}) {
  const { shopId: shopIdFromParams } = useParams<{ shopId: string }>();
  const shopId = shopIdOverride || shopIdFromParams || '';
  const location = useLocation();
  const { t } = useTranslation();

  const [config, setConfig] = useState<StorefrontConfigV2 | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { items: cartItems, getTotalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isStoreAuthenticated, storeCustomer, storeLogout, setCurrentShopId } = useStoreAuth();

  // Set current shop context for store auth
  useEffect(() => {
    if (shopId) {
      setCurrentShopId(shopId);
    }
    return () => setCurrentShopId(null);
  }, [shopId, setCurrentShopId]);

  // Check if user is authenticated for this store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  // Count items for this shop
  const cartCount = cartItems.filter(item => item.product?.shopId === shopId).length;
  const wishlistCount = wishlistItems.filter(item => item.product?.shopId === shopId).length;

  const fetchData = useCallback(async () => {
    if (!shopId) {
      setError('No shop ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [storefrontResponse, shopResponse] = await Promise.all([
        api.getPublicStorefront(shopId).catch(() => null),
        api.getShop(shopId).catch(() => null),
      ]);

      // Get shop info from either response
      const shopInfo = storefrontResponse?.shop || shopResponse?.data || shopResponse;

      // If no shop found at all, show error
      if (!shopInfo) {
        setError('Shop not found');
        return;
      }

      setShop(shopInfo);

      // Check if storefront has a valid published config
      const rawConfig = storefrontResponse?.config || storefrontResponse;
      const hasValidConfig = rawConfig && Object.keys(rawConfig).length > 0 && (rawConfig.version || rawConfig.pages || rawConfig.theme);

      // Only use saved config if it's published AND has actual content
      if (storefrontResponse?.published && hasValidConfig) {
        let v2Config: StorefrontConfigV2;
        if (rawConfig.version === 2 && rawConfig.pages) {
          v2Config = rawConfig as StorefrontConfigV2;
        } else {
          v2Config = migrateConfigV1ToV2(rawConfig as StorefrontConfig, shopInfo?.name || 'Store');
        }

        setConfig(v2Config);
      } else {
        // No custom storefront - use minimal default config
        setConfig(createDefaultStorefrontConfigV2(shopId, shopInfo?.name || 'Store'));
      }
    } catch (err) {
      console.error('Failed to load storefront:', err);
      setError('Failed to load storefront');
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('errors.pageNotFound')}</h1>
          <p className="text-gray-500 mb-4">{t('errors.pageNotFoundMessage')}</p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-lime text-white rounded-lg hover:bg-primary-lime/90"
          >
            {t('common.shopNow')}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { theme, header, footer } = config;

  // Default menu items if none configured
  const defaultMenuItems = [
    { id: 'home', label: t('common.home'), link: `/store/${shopId}` },
    { id: 'products', label: t('common.products'), link: `/store/${shopId}/products` },
    { id: 'about', label: t('common.about'), link: `/store/${shopId}/about` },
    { id: 'contact', label: t('common.contact'), link: `/store/${shopId}/contact` },
  ];

  const menuItems = header.menuItems.length > 0
    ? header.menuItems.map(item => ({
        ...item,
        // Convert relative links to store-scoped links
        link: item.link.startsWith('/') && !item.link.startsWith(`/store/${shopId}`)
          ? `/store/${shopId}${item.link}`
          : item.link.startsWith('#')
          ? `/store/${shopId}${item.link}`
          : item.link,
      }))
    : defaultMenuItems;

  const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const radiusMap: Record<string, Record<string, string>> = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-full', medium: 'rounded-full', large: 'rounded-full' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  return (
    <StorefrontContext.Provider value={{ config, shop, shopId, theme, isLoading }}>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: theme.bodyFont,
        }}
      >
        {/* Announcement Bar */}
        {header.announcementBar?.enabled && (
          <div
            className="py-2 px-4 text-center text-sm"
            style={{
              backgroundColor: header.announcementBar.backgroundColor,
              color: header.announcementBar.textColor,
            }}
          >
            {header.announcementBar.link ? (
              <Link to={header.announcementBar.link}>
                {header.announcementBar.text}
              </Link>
            ) : (
              header.announcementBar.text
            )}
          </div>
        )}

        {/* Header */}
        <header
          className={`py-4 px-6 ${header.sticky ? 'sticky top-0 z-50' : ''}`}
          style={{
            backgroundColor: header.transparent ? 'transparent' : theme.backgroundColor,
            borderBottom: header.transparent ? 'none' : '1px solid #e5e7eb',
          }}
        >
          <div className={`max-w-7xl mx-auto flex items-center ${
            header.variant === 'centered' ? 'justify-center' : 'justify-between'
          }`}>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Left Nav for Centered Layout */}
            {header.variant === 'centered' && (
              <nav className="hidden md:flex items-center gap-6">
                {menuItems.slice(0, Math.ceil(menuItems.length / 2)).map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                    style={{ color: theme.textColor }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Logo */}
            {header.showLogo && (
              <Link
                to={`/store/${shopId}`}
                className={`text-xl font-bold flex items-center gap-2 ${
                  header.variant === 'centered' ? 'mx-8' : ''
                }`}
                style={{ fontFamily: theme.headingFont }}
              >
                {shop?.logo ? (
                  <img src={shop.logo} alt={shop.name} className="h-8 w-auto" />
                ) : (
                  <Store className="w-6 h-6" style={{ color: theme.primaryColor }} />
                )}
                <span className="hidden sm:inline">{shop?.name || t('common.store')}</span>
              </Link>
            )}

            {/* Desktop Navigation - Standard or Right side of Centered */}
            <nav className="hidden md:flex items-center gap-6">
              {(header.variant === 'centered'
                ? menuItems.slice(Math.ceil(menuItems.length / 2))
                : menuItems
              ).map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: theme.textColor }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Header Actions */}
            <div className={`flex items-center gap-2 ${header.variant === 'centered' ? 'ml-8' : ''}`}>
              {header.showSearch && (
                <Link
                  to={`/store/${shopId}/search`}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                  <Search className="w-5 h-5" />
                </Link>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    to={`/store/${shopId}/wishlist`}
                    className="p-2 hover:opacity-70 transition-opacity relative"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {header.showCart && (
                    <Link
                      to={`/store/${shopId}/cart`}
                      className="p-2 hover:opacity-70 transition-opacity relative"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}

                  {header.showAccount && (
                    <Link
                      to={`/store/${shopId}/profile`}
                      className="p-2 hover:opacity-70 transition-opacity"
                    >
                      <User className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={() => storeLogout(shopId)}
                    className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm hover:opacity-70 transition-opacity"
                    title={t('common.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('common.logout')}</span>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <Link
                  to={`/store/${shopId}/login`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('common.login')}</span>
                </Link>
              )}

              {/* Language Selector */}
              <LanguageSelector variant="header" showLabel={false} />
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b overflow-hidden"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              <nav className="px-6 py-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className="flex items-center gap-3 py-3 text-sm font-medium border-b border-gray-100 last:border-0"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-200 space-y-1">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={`/store/${shopId}/wishlist`}
                        className="flex items-center gap-3 py-3 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart className="w-5 h-5" />
                        {t('common.wishlist')} {wishlistCount > 0 && `(${wishlistCount})`}
                      </Link>
                      <Link
                        to={`/store/${shopId}/cart`}
                        className="flex items-center gap-3 py-3 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {t('common.cart')} {cartCount > 0 && `(${cartCount})`}
                      </Link>
                      <Link
                        to={`/store/${shopId}/orders`}
                        className="flex items-center gap-3 py-3 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Package className="w-5 h-5" />
                        {t('orders.myOrders')}
                      </Link>
                      <Link
                        to={`/store/${shopId}/profile`}
                        className="flex items-center gap-3 py-3 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        {t('header.myAccount')}
                      </Link>
                      <button
                        onClick={() => {
                          storeLogout(shopId);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 py-3 text-sm text-red-500 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        {t('common.logout')}
                      </button>
                    </>
                  ) : (
                    <Link
                      to={`/store/${shopId}/login`}
                      className="flex items-center gap-3 py-3 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ color: theme.primaryColor }}
                    >
                      <LogIn className="w-5 h-5" />
                      {t('common.login')}
                    </Link>
                  )}

                  {/* Language Selector in Mobile Menu */}
                  <LanguageSelector variant="mobile" />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <StorefrontMobileNav />

        {/* Footer */}
        <footer
          className="py-12 px-6 border-t"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Footer Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {/* Store Info */}
              {footer.showLogo && (
                <div className="col-span-2 md:col-span-1">
                  <Link
                    to={`/store/${shopId}`}
                    className="text-xl font-bold flex items-center gap-2"
                    style={{ fontFamily: theme.headingFont }}
                  >
                    {shop?.logo ? (
                      <img src={shop.logo} alt={shop.name} className="h-8 w-auto" />
                    ) : (
                      <Store className="w-6 h-6" style={{ color: theme.primaryColor }} />
                    )}
                    {shop?.name || t('common.store')}
                  </Link>
                  {shop?.description && (
                    <p className="mt-3 text-sm opacity-70 line-clamp-3">
                      {shop.description}
                    </p>
                  )}
                </div>
              )}

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: theme.textColor }}>{t('footer.quickLinks')}</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to={`/store/${shopId}/products`} className="text-sm opacity-70 hover:opacity-100">
                      {t('products.allProducts')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/collections`} className="text-sm opacity-70 hover:opacity-100">
                      {t('common.collections')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/new-arrivals`} className="text-sm opacity-70 hover:opacity-100">
                      {t('home.newArrivals')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/sale`} className="text-sm opacity-70 hover:opacity-100">
                      {t('common.sale')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Info */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: theme.textColor }}>{t('footer.customerService')}</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to={`/store/${shopId}/about`} className="text-sm opacity-70 hover:opacity-100">
                      {t('footer.aboutUs')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/contact`} className="text-sm opacity-70 hover:opacity-100">
                      {t('common.contact')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/faq`} className="text-sm opacity-70 hover:opacity-100">
                      {t('common.faq')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account */}
              <div>
                <h4 className="font-semibold mb-4" style={{ color: theme.textColor }}>{t('common.profile')}</h4>
                <ul className="space-y-2">
                  <li>
                    <Link to={`/store/${shopId}/profile`} className="text-sm opacity-70 hover:opacity-100">
                      {t('header.myAccount')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/orders`} className="text-sm opacity-70 hover:opacity-100">
                      {t('orders.myOrders')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/wishlist`} className="text-sm opacity-70 hover:opacity-100">
                      {t('common.wishlist')}
                    </Link>
                  </li>
                  <li>
                    <Link to={`/store/${shopId}/track-order`} className="text-sm opacity-70 hover:opacity-100">
                      {t('header.trackOrder')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
              <p className="text-sm opacity-70">
                {footer.copyrightText || `© ${new Date().getFullYear()} ${shop?.name || t('common.store')}. ${t('footer.copyright')}`}
              </p>

              {footer.showSocial && footer.socialLinks && footer.socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {footer.socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-70 hover:opacity-100 transition-opacity text-sm"
                    >
                      {social.platform}
                    </a>
                  ))}
                </div>
              )}

              {/* Powered by */}
              <div className="text-sm opacity-50">
                Powered by <span className="font-semibold text-primary-lime">Vasty Shop</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </StorefrontContext.Provider>
  );
}

export default StorefrontLayout;

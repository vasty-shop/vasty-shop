/**
 * StorefrontRegisterPage - Store-specific customer registration
 * Provides a branded registration experience for each store
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Store, Loader2, ArrowLeft, User, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { useTranslation } from 'react-i18next';

interface ShopInfo {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  buttonStyle: 'solid' | 'outline' | 'ghost';
}

const defaultTheme: ThemeConfig = {
  primaryColor: '#4F46E5',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  borderRadius: 'medium',
  buttonStyle: 'solid',
};

export function StorefrontRegisterPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeRegister, isStoreAuthenticated } = useStoreAuth();
  const { t } = useTranslation();

  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Get the return path from location state
  const from = (location.state as any)?.from?.pathname || `/store/${shopId}`;

  // Redirect if already authenticated for this store
  useEffect(() => {
    if (shopId && isStoreAuthenticated(shopId)) {
      navigate(from, { replace: true });
    }
  }, [shopId, isStoreAuthenticated, navigate, from]);

  // Fetch shop info and theme
  useEffect(() => {
    const fetchShopData = async () => {
      if (!shopId) return;

      setIsLoading(true);
      try {
        const [storefrontRes, shopRes] = await Promise.all([
          api.getPublicStorefront(shopId).catch(() => null),
          api.getShop(shopId).catch(() => null),
        ]);

        const shopData = storefrontRes?.shop || shopRes?.data || shopRes;
        if (shopData) {
          setShop({
            id: shopData.id,
            name: shopData.name,
            logo: shopData.logo,
            description: shopData.description,
          });
        }

        // Extract theme from storefront config
        if (storefrontRes?.config?.theme) {
          setTheme({ ...defaultTheme, ...storefrontRes.config.theme });
        }
      } catch (err) {
        console.error('Failed to fetch shop data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('validation.passwordsDoNotMatch'));
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError(t('validation.passwordMin6'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await storeRegister(shopId, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      // Redirect to the return path or store home
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBorderRadius = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const radiusMap = {
      none: { sm: 'rounded-none', md: 'rounded-none', lg: 'rounded-none' },
      small: { sm: 'rounded', md: 'rounded-md', lg: 'rounded-lg' },
      medium: { sm: 'rounded-md', md: 'rounded-lg', lg: 'rounded-xl' },
      large: { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl' },
      full: { sm: 'rounded-full', md: 'rounded-2xl', lg: 'rounded-3xl' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  // Helper to determine if a color is dark
  const isColorDark = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Dynamic card colors based on theme background
  const isDarkTheme = isColorDark(theme.backgroundColor);
  const cardBgColor = isDarkTheme ? 'rgba(255,255,255,0.95)' : '#FFFFFF';
  const cardTextColor = '#1F2937';
  const inputBgColor = isDarkTheme ? '#FFFFFF' : '#F9FAFB';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.backgroundColor }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header */}
      <header className="p-4 border-b" style={{ borderColor: `${theme.textColor}20` }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to={`/store/${shopId}`}
            className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: theme.textColor }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
          {shop?.logo ? (
            <img src={shop.logo} alt={shop.name} className="h-8 object-contain" />
          ) : (
            <div className="flex items-center gap-2" style={{ color: theme.primaryColor }}>
              <Store className="w-6 h-6" />
              <span className="font-semibold">{shop?.name || 'Store'}</span>
            </div>
          )}
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 shadow-lg ${getBorderRadius('lg')}`}
          style={{ backgroundColor: cardBgColor, borderColor: `${cardTextColor}10` }}
        >
          {/* Store Branding */}
          <div className="text-center mb-8">
            {shop?.logo ? (
              <img src={shop.logo} alt={shop.name} className="h-16 mx-auto mb-4 object-contain" />
            ) : (
              <div
                className={`w-16 h-16 mx-auto mb-4 flex items-center justify-center ${getBorderRadius('md')}`}
                style={{ backgroundColor: `${theme.primaryColor}15` }}
              >
                <Store className="w-8 h-8" style={{ color: theme.primaryColor }} />
              </div>
            )}
            <h1 className="text-2xl font-bold" style={{ color: cardTextColor }}>
              {t('auth.createAccount')}
            </h1>
            <p className="text-sm mt-2" style={{ color: cardTextColor, opacity: 0.7 }}>
              {t('auth.joinToShop')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1"
                style={{ color: cardTextColor }}
              >
                {t('checkout.fullName')}
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: cardTextColor, opacity: 0.4 }}
                />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border ${getBorderRadius('sm')} focus:outline-none focus:ring-2`}
                  style={{
                    borderColor: `${cardTextColor}20`,
                    color: cardTextColor,
                    backgroundColor: inputBgColor,
                  }}
                  placeholder={t('checkout.fullName')}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
                style={{ color: cardTextColor }}
              >
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: cardTextColor, opacity: 0.4 }}
                />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border ${getBorderRadius('sm')} focus:outline-none focus:ring-2`}
                  style={{
                    borderColor: `${cardTextColor}20`,
                    color: cardTextColor,
                    backgroundColor: inputBgColor,
                  }}
                  placeholder={t('common.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium mb-1"
                style={{ color: cardTextColor }}
              >
                {t('checkout.phone')} ({t('common.optional')})
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: cardTextColor, opacity: 0.4 }}
                />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border ${getBorderRadius('sm')} focus:outline-none focus:ring-2`}
                  style={{
                    borderColor: `${cardTextColor}20`,
                    color: cardTextColor,
                    backgroundColor: inputBgColor,
                  }}
                  placeholder={t('checkout.phone')}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
                style={{ color: cardTextColor }}
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: cardTextColor, opacity: 0.4 }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 border ${getBorderRadius('sm')} focus:outline-none focus:ring-2`}
                  style={{
                    borderColor: `${cardTextColor}20`,
                    color: cardTextColor,
                    backgroundColor: inputBgColor,
                  }}
                  placeholder={t('auth.password')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: cardTextColor, opacity: 0.4 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
                style={{ color: cardTextColor }}
              >
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: cardTextColor, opacity: 0.4 }}
                />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border ${getBorderRadius('sm')} focus:outline-none focus:ring-2`}
                  style={{
                    borderColor: `${cardTextColor}20`,
                    color: cardTextColor,
                    backgroundColor: inputBgColor,
                  }}
                  placeholder={t('auth.confirmPassword')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 font-semibold transition-opacity ${getBorderRadius('sm')} disabled:opacity-50`}
              style={{
                backgroundColor: theme.primaryColor,
                color: '#FFFFFF',
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                t('auth.createAccount')
              )}
            </button>
          </form>

          {/* Login Link */}
          <p
            className="text-center mt-6 text-sm"
            style={{ color: cardTextColor, opacity: 0.7 }}
          >
            {t('auth.haveAccount')}{' '}
            <Link
              to={`/store/${shopId}/login`}
              state={{ from: location.state?.from }}
              className="font-medium hover:underline"
              style={{ color: theme.primaryColor }}
            >
              {t('common.signIn')}
            </Link>
          </p>

          {/* Continue as Guest */}
          <p
            className="text-center mt-4 text-sm"
            style={{ color: cardTextColor, opacity: 0.5 }}
          >
            <Link
              to={`/store/${shopId}`}
              className="hover:underline"
            >
              {t('checkout.guestCheckout')}
            </Link>
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="p-4 text-center text-sm"
        style={{ color: theme.textColor, opacity: 0.5 }}
      >
        Powered by Vasty Shop
      </footer>
    </div>
  );
}

export default StorefrontRegisterPage;

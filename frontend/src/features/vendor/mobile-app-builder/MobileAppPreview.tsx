'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Home,
  ShoppingCart,
  User,
  Heart,
  Package,
  Truck,
  Navigation,
  DollarSign,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Menu,
  LogOut,
  Settings,
  Grid,
} from 'lucide-react';
import type { MobileAppConfig, MobileAppType } from './types';
import { CustomerAppPreview } from './CustomerAppPreview';
import { VendorAppPreview } from './VendorAppPreview';
import { DeliveryAppPreview } from './DeliveryAppPreview';

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  brand?: string;
  rating?: number;
  stock?: number;
  description?: string;
}

interface ShopCategory {
  id: string;
  name: string;
  image?: string;
  productCount?: number;
}

interface ShopOrder {
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
}

interface MobileAppPreviewProps {
  config: MobileAppConfig;
  device: 'iphone' | 'android';
  darkMode: boolean;
  activeScreen: string;
  onNavigate?: (screen: string) => void;
  shopProducts?: ShopProduct[];
  shopCategories?: ShopCategory[];
  shopName?: string;
  shopLogo?: string;
  shopBanner?: string;
  shopOrders?: ShopOrder[];
}

export function MobileAppPreview({
  config,
  device,
  darkMode,
  activeScreen,
  onNavigate,
  shopProducts = [],
  shopCategories = [],
  shopName,
  shopLogo,
  shopBanner,
  shopOrders = [],
}: MobileAppPreviewProps) {
  const { t } = useTranslation();
  const { theme, navigation, appType, appName, screens } = config;

  // Login state for preview flow
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cart and Wishlist state for preview functionality
  const [cartItems, setCartItems] = useState<Array<{id: string; name: string; price: number; quantity: number; image?: string}>>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  // Cart functions
  const addToCart = (item: {id: string; name: string; price: number; image?: string}) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, {...item, quantity: 1}];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCartItems(prev => prev.map(i => i.id === id ? {...i, quantity} : i));
    }
  };

  const clearCart = () => setCartItems([]);

  // Wishlist functions
  const toggleWishlist = (id: string) => {
    setWishlistItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isInWishlist = (id: string) => wishlistItems.includes(id);

  // Get border radius based on theme
  const getBorderRadius = (size: 'none' | 'small' | 'medium' | 'large' | 'full' = 'medium') => {
    const radiusMap = {
      none: '0px',
      small: '0.375rem',   // 6px
      medium: '0.75rem',   // 12px
      large: '1rem',       // 16px
      full: '9999px',      // Fully rounded
    };
    return radiusMap[size] || radiusMap.medium;
  };

  const borderRadius = getBorderRadius(theme.borderRadius as any);

  // Get colors based on dark mode
  const colors = darkMode
    ? {
        bg: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: 'rgba(255,255,255,0.1)',
      }
    : {
        bg: theme.backgroundColor,
        surface: theme.surfaceColor,
        text: theme.textColor,
        textSecondary: theme.textSecondaryColor,
        border: 'rgba(0,0,0,0.1)',
      };

  // Device frame dimensions
  const frameStyles = device === 'iphone'
    ? {
        width: 375,
        height: 812,
        borderRadius: 48,
        notchWidth: 160,
        notchHeight: 34,
      }
    : {
        width: 360,
        height: 780,
        borderRadius: 24,
        notchWidth: 0,
        notchHeight: 24, // Status bar
      };

  return (
    <div className="relative">
      {/* Phone Frame */}
      <div
        className="relative bg-black shadow-2xl"
        style={{
          width: frameStyles.width,
          height: frameStyles.height,
          borderRadius: frameStyles.borderRadius,
          padding: device === 'iphone' ? 12 : 8,
        }}
      >
        {/* Screen */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            backgroundColor: colors.bg,
            borderRadius: frameStyles.borderRadius - (device === 'iphone' ? 12 : 8),
          }}
        >
          {/* Status Bar / Notch */}
          {device === 'iphone' ? (
            <div className="absolute top-0 left-0 right-0 h-11 flex items-start justify-center z-20">
              <div
                className="bg-black rounded-b-3xl"
                style={{
                  width: frameStyles.notchWidth,
                  height: frameStyles.notchHeight,
                }}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between px-4"
              style={{
                height: frameStyles.notchHeight,
                backgroundColor: colors.bg,
              }}
            >
              <span className="text-xs" style={{ color: colors.text }}>
                9:41
              </span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 rounded-sm border border-current" style={{ color: colors.text }}>
                  <div className="w-2/3 h-full bg-current rounded-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Screen Content */}
          <div
            className="absolute left-0 right-0 overflow-y-auto"
            style={{
              top: device === 'iphone' ? 44 : frameStyles.notchHeight,
              bottom: navigation.type === 'bottom-tabs' && activeScreen !== 'login'
                ? (navigation.style === 'floating' ? 115 : 83)
                : 0,
              backgroundColor: colors.bg,
              fontFamily: theme.fontFamily || 'Inter',
            }}
          >
            {/* Show login screen when activeScreen is 'login' for preview purposes */}
            {activeScreen === 'login' ? (
              <LoginScreen
                theme={theme}
                colors={colors}
                borderRadius={borderRadius}
                appLogo={config.appIcon}
                email={email}
                password={password}
                showPassword={showPassword}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onLogin={() => {
                  // Accept any email/password - no validation
                  if (email && password) {
                    setIsLoggedIn(true);
                    // Navigate to home after login
                    onNavigate?.('home');
                  }
                }}
              />
            ) : appType === 'customer' ? (
              <CustomerAppPreview
                screen={activeScreen}
                config={config}
                colors={colors}
                darkMode={darkMode}
                borderRadius={borderRadius}
                onNavigate={onNavigate}
                onMenuClick={() => setDrawerOpen(true)}
                cartItems={cartItems}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                updateCartQuantity={updateCartQuantity}
                clearCart={clearCart}
                wishlistItems={wishlistItems}
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
                shopProducts={shopProducts}
                shopCategories={shopCategories}
                shopName={shopName}
                shopLogo={shopLogo}
                shopBanner={shopBanner}
                shopOrders={shopOrders}
              />
            ) : appType === 'vendor' ? (
              <VendorAppPreview
                screen={activeScreen}
                config={config}
                colors={colors}
                darkMode={darkMode}
                borderRadius={borderRadius}
                onNavigate={onNavigate}
                onMenuClick={() => setDrawerOpen(true)}
                shopProducts={shopProducts}
                shopCategories={shopCategories}
                shopName={shopName}
                shopLogo={shopLogo}
                shopOrders={shopOrders}
              />
            ) : (
              <DeliveryAppPreview
                screen={activeScreen}
                config={config}
                colors={colors}
                darkMode={darkMode}
                borderRadius={borderRadius}
                onNavigate={onNavigate}
                onMenuClick={() => setDrawerOpen(true)}
                shopProducts={shopProducts}
                shopCategories={shopCategories}
                shopName={shopName}
                shopLogo={shopLogo}
                shopOrders={shopOrders}
              />
            )}
          </div>

          {/* Bottom Navigation - Hide on login screen */}
          {navigation.type === 'bottom-tabs' && activeScreen !== 'login' && (
            <div
              className={`absolute left-0 right-0 flex items-center justify-around ${
                navigation.style === 'floating' ? 'px-4 pb-8' : 'px-2 pb-6'
              }`}
              style={{
                bottom: navigation.style === 'floating' ? 16 : 0,
                height: 83,
                paddingTop: 8,
                zIndex: 20,
                pointerEvents: 'auto',
                ...(navigation.style === 'floating'
                  ? {
                      left: 16,
                      right: 16,
                      width: 'auto',
                      backgroundColor: colors.surface,
                      borderRadius: borderRadius,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    }
                  : navigation.style === 'minimal'
                  ? {
                      backgroundColor: 'transparent',
                      borderTop: 'none',
                    }
                  : {
                      backgroundColor: colors.surface,
                      borderTop: `1px solid ${colors.border}`,
                    }
                ),
              }}
            >
              {navigation.items.slice(0, 5).map((item, index) => {
                const isActive = item.id.toLowerCase() === activeScreen.toLowerCase() ||
                  item.route.toLowerCase() === activeScreen.toLowerCase() ||
                  (activeScreen === 'home' && index === 0) ||
                  (activeScreen === 'dashboard' && index === 0);
                const Icon = getNavIcon(item.icon);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate?.(item.id);
                    }}
                    className="flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
                    style={{
                      minWidth: 50,
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: 4,
                    }}
                  >
                    {navigation.style === 'minimal' && isActive ? (
                      <div
                        className="px-4 py-2 rounded-full flex items-center gap-2 transition-all"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#FFFFFF' }} />
                        {navigation.showLabels && (
                          <span className="text-xs font-medium text-white">
                            {item.label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div
                          className="w-6 h-6 flex items-center justify-center transition-colors"
                          style={{ color: isActive ? theme.primaryColor : colors.textSecondary }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {navigation.showLabels && (
                          <span
                            className="text-[10px] font-medium transition-colors"
                            style={{ color: isActive ? theme.primaryColor : colors.textSecondary }}
                          >
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Home Indicator (iPhone) */}
          {device === 'iphone' && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div
                className="w-32 h-1 rounded-full"
                style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}
              />
            </div>
          )}

          {/* Drawer Menu - Hide on login screen */}
          {activeScreen !== 'login' && (
            <>
              {/* Overlay */}
              {drawerOpen && (
                <div
                  className="absolute inset-0 bg-black/50 z-30"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    top: device === 'iphone' ? 44 : frameStyles.notchHeight,
                  }}
                />
              )}

              {/* Drawer */}
              <motion.div
                className="absolute top-0 left-0 bottom-0 w-4/5 z-40 overflow-hidden"
                initial={{ x: '-100%' }}
                animate={{ x: drawerOpen ? 0 : '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                style={{
                  backgroundColor: colors.surface,
                  top: device === 'iphone' ? 44 : frameStyles.notchHeight,
                }}
              >
                <SidebarMenu
                  theme={theme}
                  colors={colors}
                  borderRadius={borderRadius}
                  email={email}
                  appType={appType}
                  appName={appName}
                  onClose={() => setDrawerOpen(false)}
                  onNavigate={(screen: string) => {
                    onNavigate?.(screen);
                    setDrawerOpen(false);
                  }}
                  onLogout={() => {
                    setIsLoggedIn(false);
                    setDrawerOpen(false);
                    setEmail('');
                    setPassword('');
                  }}
                />
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Device Label */}
      <div className="text-center mt-4">
        <span className="text-sm text-white/40">
          {device === 'iphone' ? 'iPhone 14 Pro' : 'Android'}
        </span>
      </div>
    </div>
  );
}

// Sidebar Menu Component
function SidebarMenu({
  theme,
  colors,
  borderRadius,
  email,
  appType,
  appName,
  onClose,
  onNavigate,
  onLogout,
}: {
  theme: any;
  colors: any;
  borderRadius: string;
  email: string;
  appType: MobileAppType;
  appName?: string;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}) {
  // Get menu items based on app type
  const getMenuItems = () => {
    switch (appType) {
      case 'vendor':
        return [
          { icon: Home, label: 'Dashboard', screen: 'dashboard', onClick: () => onNavigate('dashboard') },
          { icon: Package, label: 'Products', screen: 'products', onClick: () => onNavigate('products') },
          { icon: ShoppingCart, label: 'Orders', screen: 'orders', onClick: () => onNavigate('orders') },
          { icon: User, label: 'Profile', screen: 'profile', onClick: () => onNavigate('profile') },
          { icon: Settings, label: 'Settings', screen: 'settings', onClick: onClose },
        ];
      case 'delivery':
        return [
          { icon: Home, label: 'Dashboard', screen: 'dashboard', onClick: () => onNavigate('dashboard') },
          { icon: Truck, label: 'Active Deliveries', screen: 'active-deliveries', onClick: () => onNavigate('active-deliveries') },
          { icon: DollarSign, label: 'Earnings', screen: 'earnings', onClick: () => onNavigate('earnings') },
          { icon: Package, label: 'History', screen: 'history', onClick: () => onNavigate('active-deliveries') },
          { icon: User, label: 'Profile', screen: 'profile', onClick: () => onNavigate('profile') },
          { icon: Settings, label: 'Settings', screen: 'settings', onClick: onClose },
        ];
      default: // customer
        return [
          { icon: Home, label: 'Home', screen: 'home', onClick: () => onNavigate('home') },
          { icon: Package, label: 'My Orders', screen: 'orders', onClick: () => onNavigate('orders') },
          { icon: Heart, label: 'Wishlist', screen: 'wishlist', onClick: () => onNavigate('wishlist') },
          { icon: User, label: 'Profile', screen: 'profile', onClick: () => onNavigate('profile') },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: colors.surface }}>
      {/* User Profile Section */}
      <div
        className="p-6"
        style={{
          backgroundColor: theme.primaryColor + '10',
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {appType === 'customer'
              ? (email.charAt(0).toUpperCase() || 'U')
              : (appName?.charAt(0).toUpperCase() || 'S')
            }
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" style={{ color: colors.text }}>
              {appType === 'customer'
                ? (email || 'User')
                : (appName || 'My Shop')
              }
            </h3>
            <p className="text-sm truncate" style={{ color: colors.textSecondary }}>
              {appType === 'vendor'
                ? 'Vendor Account'
                : appType === 'delivery'
                ? 'Delivery Partner'
                : (email || 'user@example.com')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full flex items-center gap-4 px-6 py-4 transition-all hover:bg-white/5"
            style={{
              color: colors.text,
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              textAlign: 'left',
            }}
          >
            <item.icon className="w-6 h-6" style={{ color: theme.primaryColor }} />
            <span className="text-base font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-4 transition-all hover:bg-red-500/10"
          style={{
            color: '#EF4444',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            textAlign: 'left',
          }}
        >
          <LogOut className="w-6 h-6" />
          <span className="text-base font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

// Login Screen Component
function LoginScreen({
  theme,
  colors,
  borderRadius,
  appLogo,
  email,
  password,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onLogin,
}: {
  theme: any;
  colors: any;
  borderRadius: string;
  appLogo?: string;
  email: string;
  password: string;
  showPassword: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onLogin: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-start h-full px-6 pt-12 pb-8">
      {/* App Icon */}
      <div
        className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6"
        style={{
          backgroundColor: theme.primaryColor + '15',
          borderRadius: borderRadius === '0px' ? '1.5rem' : borderRadius
        }}
      >
        {appLogo ? (
          <img src={appLogo} alt="App Logo" className="w-20 h-20 object-contain" />
        ) : (
          <ShoppingCart className="w-16 h-16" style={{ color: theme.primaryColor }} />
        )}
      </div>

      {/* Welcome Text */}
      <h1 className="text-[28px] font-bold mb-2" style={{ color: '#3A0B3D' }}>
        Welcome Back!
      </h1>
      <p className="text-[15px] mb-10" style={{ color: '#999999' }}>
        Login to continue shopping
      </p>

      {/* Email Input */}
      <div className="w-full mb-3">
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{
            backgroundColor: '#F5F5F5',
            borderRadius,
          }}
        >
          <Mail className="w-5 h-5" style={{ color: '#666666' }} />
          <input
            type="email"
            placeholder={t('auth.emailAddress')}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: '#333333' }}
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="w-full mb-4">
        <div
          className="flex items-center gap-3 px-4 py-4"
          style={{
            backgroundColor: '#F5F5F5',
            borderRadius,
          }}
        >
          <Lock className="w-5 h-5" style={{ color: '#666666' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: '#333333' }}
          />
          <button onClick={onTogglePassword} className="p-0">
            {showPassword ? (
              <EyeOff className="w-5 h-5" style={{ color: '#666666' }} />
            ) : (
              <Eye className="w-5 h-5" style={{ color: '#666666' }} />
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="w-full flex items-center justify-between mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            className="w-5 h-5 border-2 rounded-sm"
            style={{ borderColor: '#CCCCCC' }}
          />
          <span className="text-[14px]" style={{ color: '#666666' }}>
            Remember me
          </span>
        </label>
        <button className="text-[14px] font-medium" style={{ color: theme.primaryColor }}>
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
      <button
        onClick={onLogin}
        disabled={!email || !password}
        className="w-full py-4 font-semibold text-white text-[16px] mb-6"
        style={{
          backgroundColor: email && password ? theme.primaryColor : '#CCCCCC',
          borderRadius,
        }}
      >
        Login
      </button>

      {/* OR Divider */}
      <div className="w-full flex items-center gap-4 mb-6">
        <div className="flex-1 h-px" style={{ backgroundColor: '#E0E0E0' }} />
        <span className="text-[13px]" style={{ color: '#999999' }}>OR</span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#E0E0E0' }} />
      </div>

      {/* Social Login Buttons */}
      <div className="w-full flex gap-3 mb-3">
        <button
          className="flex-1 py-3.5 font-medium text-[15px] flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'transparent',
            border: `1.5px solid ${theme.primaryColor}`,
            color: theme.primaryColor,
            borderRadius
          }}
        >
          <span className="font-bold text-[18px]">G</span> Google
        </button>
        <button
          className="flex-1 py-3.5 font-medium text-[15px] flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'transparent',
            border: `1.5px solid ${theme.primaryColor}`,
            color: theme.primaryColor,
            borderRadius
          }}
        >
          <span className="font-bold text-[18px]">f</span> Facebook
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="text-[14px]">
        <span style={{ color: '#666666' }}>Don't have an account? </span>
        <button className="font-semibold" style={{ color: theme.primaryColor }}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

// Get navigation icon
function getNavIcon(iconName: string) {
  const icons: Record<string, any> = {
    home: Home,
    'home-filled': Home,
    grid: Grid,
    'grid-filled': Grid,
    'shopping-cart': ShoppingCart,
    'shopping-cart-filled': ShoppingCart,
    package: Package,
    'package-filled': Package,
    user: User,
    'user-filled': User,
    truck: Truck,
    'truck-filled': Truck,
    map: Navigation,
    'map-filled': Navigation,
    'dollar-sign': DollarSign,
    'dollar-sign-filled': DollarSign,
  };
  return icons[iconName] || Home;
}

export default MobileAppPreview;

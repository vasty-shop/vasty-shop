'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Store,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Sparkles,
  LogOut,
  Gift,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useShopStore } from '@/stores/useShopStore';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

interface NavLink {
  label: string;
  href: string;
  isSection?: boolean;
}

// navLinks will be created inside the component to access translations

export function PlatformNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, shops: authShops, isVendor, isAdmin, logout } = useAuth();
  const { currentShop } = useShopStore();
  const { settings } = usePlatformSettings();

  // Navigation links with translations
  const navLinks: NavLink[] = [
    { label: t('platformNavbar.howItWorks'), href: 'how-it-works', isSection: true },
    { label: t('platformNavbar.features'), href: 'features', isSection: true },
    { label: t('platformNavbar.marketplace'), href: 'marketplace', isSection: true },
    { label: t('platformNavbar.pricing'), href: 'pricing', isSection: true },
    { label: t('platformNavbar.blog', 'Blog'), href: '/blog', isSection: false },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const shops = authShops;
  const hasShop = isVendor;

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
    localStorage.setItem('i18nextLng', langCode);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsAccountDropdownOpen(false);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Determine active section
      const sections = navLinks.filter(l => l.isSection).map(l => l.href);
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Check if we're on the landing page
    const isLandingPage = location.pathname === '/' || location.pathname === '';

    if (isLandingPage) {
      // Scroll to section on current page
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      // Navigate to landing page with hash
      navigate(`/#${sectionId}`);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-lg border-b border-white/10 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {settings.platformLogo ? (
                <>
                  <img
                    src={settings.platformLogo}
                    alt={settings.platformName}
                    className="h-10 w-auto max-w-[120px] object-contain group-hover:scale-110 transition-transform"
                  />
                  <span className="text-xl font-bold text-white">{settings.platformName}</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-lime to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">{settings.platformName}</span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                link.isSection ? (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSection === link.href
                        ? 'text-primary-lime bg-primary-lime/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/explore')}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('header.exploreStores')}
              </Button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title={t('header.selectLanguage')}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{currentLanguage.flag}</span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    isLanguageDropdownOpen && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {isLanguageDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsLanguageDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 max-h-80 overflow-y-auto"
                      >
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          {t('header.selectLanguage')}
                        </div>
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                              currentLanguage.code === lang.code
                                ? "bg-primary-lime/10 text-primary-lime"
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium">{lang.name}</span>
                            {currentLanguage.code === lang.code && (
                              <span className="ml-auto text-primary-lime">✓</span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated ? (
                <>
                  {/* My Store Button (if has shop) */}
                  {hasShop && (
                    <Button
                      variant="outline"
                      onClick={() => navigate(currentShop ? `/shop/${currentShop.id}/vendor/dashboard` : `/shop/${shops[0]?.id}/vendor/dashboard`)}
                      className="border-primary-lime/50 bg-primary-lime/10 text-primary-lime hover:bg-primary-lime/20"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      {t('header.myStore')}
                    </Button>
                  )}

                  {/* Account Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                      className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {user?.avatar || user?.metadata?.avatar ? (
                        <img
                          src={user.avatar || user.metadata?.avatar}
                          alt={user?.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary-lime"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-lime flex items-center justify-center text-white font-semibold text-sm">
                          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isAccountDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                          >
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                {isAdmin ? (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                  </div>
                                ) : user?.avatar || user?.metadata?.avatar ? (
                                  <img
                                    src={user.avatar || user.metadata?.avatar}
                                    alt={user?.name || 'User'}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary-lime flex items-center justify-center text-white font-semibold">
                                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || user?.email?.split('@')[0] || 'User'}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {isAdmin ? 'Admin' : user?.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Admin Menu - Only Admin Panel + Logout */}
                            {isAdmin ? (
                              <>
                                <Link
                                  to="/admin"
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-gray-50 transition-colors"
                                  onClick={() => setIsAccountDropdownOpen(false)}
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>{t('platformNavbar.adminPanel')}</span>
                                </Link>
                                <div className="border-t border-gray-100 my-2" />
                                <button
                                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors w-full disabled:opacity-50"
                                  onClick={handleLogout}
                                  disabled={isLoggingOut}
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span>{isLoggingOut ? t('header.loggingOut') : t('header.logout')}</span>
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Vendor Menu - Only Store Dashboard + Logout */}
                                {hasShop ? (
                                  <>
                                    <Link
                                      to={currentShop ? `/shop/${currentShop.id}/vendor/dashboard` : `/shop/${shops[0]?.id}/vendor/dashboard`}
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-lime hover:bg-gray-50 transition-colors"
                                      onClick={() => setIsAccountDropdownOpen(false)}
                                    >
                                      <Store className="w-4 h-4" />
                                      <span>{t('platformNavbar.storeDashboard')}</span>
                                    </Link>
                                    <div className="border-t border-gray-100 my-2" />
                                    <button
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors w-full disabled:opacity-50"
                                      onClick={handleLogout}
                                      disabled={isLoggingOut}
                                    >
                                      <LogOut className="w-4 h-4" />
                                      <span>{isLoggingOut ? t('header.loggingOut') : t('header.logout')}</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {/* Regular User Menu Items */}
                                    <Link
                                      to="/profile"
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      onClick={() => setIsAccountDropdownOpen(false)}
                                    >
                                      <User className="w-4 h-4" />
                                      <span>{t('header.myAccount')}</span>
                                    </Link>
                                    <Link
                                      to="/referrals"
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      onClick={() => setIsAccountDropdownOpen(false)}
                                    >
                                      <Gift className="w-4 h-4" />
                                      <span>{t('header.referrals')}</span>
                                    </Link>

                                    <div className="border-t border-gray-100 my-2" />

                                    <Link
                                      to="/vendor/create-shop"
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-lime hover:bg-gray-50 transition-colors"
                                      onClick={() => setIsAccountDropdownOpen(false)}
                                    >
                                      <Store className="w-4 h-4" />
                                      <span>{t('header.createYourStore')}</span>
                                    </Link>

                                    <div className="border-t border-gray-100 my-2" />

                                    <button
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors w-full disabled:opacity-50"
                                      onClick={handleLogout}
                                      disabled={isLoggingOut}
                                    >
                                      <LogOut className="w-4 h-4" />
                                      <span>{isLoggingOut ? t('header.loggingOut') : t('header.logout')}</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {t('header.signIn')}
                  </Button>
                  <Button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-primary-lime to-emerald-500 hover:from-primary-lime/90 hover:to-emerald-500/90 text-white shadow-lg shadow-primary-lime/20"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('platformNavbar.startSelling')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-white/10 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="text-lg font-bold text-white">{t('header.menu')}</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-2">
                  {navLinks.map((link) => (
                    link.isSection ? (
                      <button
                        key={link.href}
                        onClick={() => scrollToSection(link.href)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                          activeSection === link.href
                            ? 'bg-primary-lime/20 text-primary-lime'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="font-medium">{link.label}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        <span className="font-medium">{link.label}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )
                  ))}

                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        navigate('/explore');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Search className="w-5 h-5" />
                      <span className="font-medium">{t('header.exploreStores')}</span>
                    </button>
                  </div>

                  {/* Mobile Language Selector */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="px-4 mb-3">
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t('header.selectLanguage')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-4">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors",
                            currentLanguage.code === lang.code
                              ? "bg-primary-lime/20 text-primary-lime border border-primary-lime/30"
                              : "text-white/70 hover:bg-white/10 hover:text-white border border-transparent"
                          )}
                        >
                          <span>{lang.flag}</span>
                          <span className="font-medium text-xs">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>

                {/* Actions */}
                <div className="p-4 border-t border-white/10 space-y-3">
                  {isAuthenticated ? (
                    <>
                      {/* User Profile Section */}
                      <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10 mb-3">
                        {isAdmin ? (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                          </div>
                        ) : user?.avatar || user?.metadata?.avatar ? (
                          <img
                            src={user.avatar || user.metadata?.avatar}
                            alt={user?.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary-lime"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-lime flex items-center justify-center text-white font-semibold text-lg">
                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user?.name || user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {isAdmin ? 'Admin' : user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Admin Menu - Only Admin Panel + Logout */}
                      {isAdmin ? (
                        <>
                          <Button
                            onClick={() => {
                              navigate('/admin');
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-2"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            {t('platformNavbar.adminPanel')}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            disabled={isLoggingOut}
                            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {isLoggingOut ? t('header.loggingOut') : t('header.logout')}
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Vendor Menu - Only Store Dashboard + Logout */}
                          {hasShop ? (
                            <>
                              <Button
                                onClick={() => {
                                  navigate(currentShop ? `/shop/${currentShop.id}/vendor/dashboard` : `/shop/${shops[0]?.id}/vendor/dashboard`);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full bg-gradient-to-r from-primary-lime to-emerald-500 text-white mb-2"
                              >
                                <Store className="w-4 h-4 mr-2" />
                                {t('header.myStoreDashboard')}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  handleLogout();
                                  setIsMobileMenuOpen(false);
                                }}
                                disabled={isLoggingOut}
                                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <LogOut className="w-4 h-4 mr-2" />
                                {isLoggingOut ? t('header.loggingOut') : t('header.logout')}
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Regular User Menu Links */}
                              <div className="space-y-1 mb-3">
                                <button
                                  onClick={() => {
                                    navigate('/profile');
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                  <User className="w-4 h-4" />
                                  <span>{t('header.myAccount')}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    navigate('/referrals');
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                  <Gift className="w-4 h-4" />
                                  <span>{t('header.referrals')}</span>
                                </button>
                              </div>

                              <Button
                                onClick={() => {
                                  navigate('/vendor/create-shop');
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full bg-gradient-to-r from-primary-lime to-emerald-500 text-white mb-2"
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('header.createYourStore')}
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => {
                                  handleLogout();
                                  setIsMobileMenuOpen(false);
                                }}
                                disabled={isLoggingOut}
                                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <LogOut className="w-4 h-4 mr-2" />
                                {isLoggingOut ? t('header.loggingOut') : t('header.logout')}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          navigate('/signup');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-primary-lime to-emerald-500 text-white"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('platformNavbar.startSellingFree')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/login');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        {t('header.signIn')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PlatformNavbar;

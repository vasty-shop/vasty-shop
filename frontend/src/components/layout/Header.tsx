import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Store,
  Gift,
  Globe,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useShopStore } from '@/stores/useShopStore';
import { useAuth } from '@/contexts/AuthContext';

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

interface MenuItem {
  label: string;
  href: string;
  dropdown?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { user, shops: authShops, isVendor, logout, loading: isAuthLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { currentShop } = useShopStore();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
    // Store preference
    localStorage.setItem('i18nextLng', langCode);
  };

  const isAuthenticated = !!user;
  const shops = authShops;
  const hasShop = isVendor;

  // Simplified navigation menu items - no products or categories
  const menuItems: MenuItem[] = [
    { label: t('header.nav.home'), href: '/' },
    { label: t('header.nav.blog', 'Blog'), href: '/blog' },
    {
      label: t('header.nav.pages'),
      href: '#',
      dropdown: [
        { label: t('header.nav.aboutUs'), href: '/about' },
        { label: t('header.nav.faq'), href: '/faq' },
        { label: t('header.nav.terms'), href: '/terms' },
        { label: t('header.nav.privacy'), href: '/privacy' },
      ],
    },
    { label: t('header.nav.contact'), href: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const isOnExplorePage = location.pathname === '/explore';

    if (isOnExplorePage) {
      // Update URL params directly when already on explore page
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', searchQuery.trim());
      setSearchParams(newParams);
    } else {
      // Navigate to explore page with search query
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }

    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  const isActive = (href: string) => {
    return location.pathname === href;
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

  const toggleDropdown = (label: string) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 gap-2">
              <img
                src="/vasty-logo-small.png"
                alt="Vasty Shop"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                Vasty Shop
              </span>
            </Link>


            {/* Right Side Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Explore Stores */}
              <Link
                to="/explore"
                className="hidden lg:flex items-center gap-2 text-sm text-gray-700 hover:text-primary-lime transition-colors"
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">{t('header.exploreStores')}</span>
              </Link>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  title={t('header.selectLanguage')}
                >
                  <Globe className="w-5 h-5 text-gray-600" />
                  <span className="hidden md:inline text-gray-700 font-medium">{currentLanguage.flag}</span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-gray-500 transition-transform hidden md:block",
                    isLanguageDropdownOpen && "rotate-180"
                  )} />
                </button>

                {isLanguageDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsLanguageDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-80 overflow-y-auto">
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
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                          {currentLanguage.code === lang.code && (
                            <span className="ml-auto text-primary-lime">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isAuthenticated && user ? (
                    <div className="relative">
                      {user.avatar || user.metadata?.avatar ? (
                        <img
                          src={user.avatar || user.metadata?.avatar}
                          alt={user.name || 'User'}
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary-lime"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-lime flex items-center justify-center text-white font-semibold text-sm">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                  ) : (
                    <User className="w-6 h-6 text-gray-700" />
                  )}
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-700 transition-transform hidden md:block",
                    isAccountDropdownOpen && "rotate-180"
                  )} />
                </button>

                {/* Account Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsAccountDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      {isAuthLoading ? (
                        <div className="px-4 py-6 flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-2 border-primary-lime border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-sm text-gray-500">{t('header.loading')}</p>
                        </div>
                      ) : !isAuthenticated ? (
                        <div className="px-3 py-2">
                          <Link
                            to="/login"
                            className="block w-full mb-2"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <button className="w-full px-4 py-2 bg-primary-lime text-white text-sm font-medium rounded-lg hover:bg-primary-lime-dark transition-colors">
                              {t('header.signIn')}
                            </button>
                          </Link>
                          <Link
                            to="/signup"
                            className="block w-full"
                            onClick={() => setIsAccountDropdownOpen(false)}
                          >
                            <button className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-primary-lime hover:text-primary-lime transition-colors">
                              {t('header.createAccount')}
                            </button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              {user?.avatar || user?.metadata?.avatar ? (
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
                                  {user?.name || user?.metadata?.firstName || user?.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Vendor Menu - Only Store Dashboard + Logout */}
                          {hasShop ? (
                            <>
                              <Link
                                to={currentShop ? `/shop/${currentShop.id}/vendor/dashboard` : `/shop/${shops[0]?.id}/vendor/dashboard`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-lime hover:bg-gray-100 transition-colors"
                                onClick={() => setIsAccountDropdownOpen(false)}
                              >
                                <Store className="w-4 h-4" />
                                <span>{t('header.myStoreDashboard')}</span>
                              </Link>
                              <div className="border-t border-gray-200 my-2" />
                              <button
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors w-full disabled:opacity-50"
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
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsAccountDropdownOpen(false)}
                              >
                                <User className="w-4 h-4" />
                                <span>{t('header.myAccount')}</span>
                              </Link>
                              <Link
                                to="/referrals"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsAccountDropdownOpen(false)}
                              >
                                <Gift className="w-4 h-4" />
                                <span>{t('header.referrals')}</span>
                              </Link>
                              <Link
                                to="/settings"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsAccountDropdownOpen(false)}
                              >
                                <Settings className="w-4 h-4" />
                                <span>{t('header.settings')}</span>
                              </Link>
                              <div className="border-t border-gray-200 my-2" />
                              <Link
                                to="/vendor/create-shop"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-lime hover:bg-gray-100 transition-colors"
                                onClick={() => setIsAccountDropdownOpen(false)}
                              >
                                <Store className="w-4 h-4" />
                                <span>{t('header.createYourStore')}</span>
                              </Link>
                              <div className="border-t border-gray-200 my-2" />
                              <button
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors w-full disabled:opacity-50"
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
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="lg:hidden pb-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('header.searchPlaceholder')}
                  className="w-full h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-lime text-sm"
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 bg-primary-lime hover:bg-primary-lime-dark"
              >
                <Search className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-11">
            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "text-primary-lime"
                        : "text-gray-700 hover:text-primary-lime hover:bg-gray-50"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.dropdown && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        activeDropdown === item.label && "rotate-180"
                      )} />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.label && (
                    <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      {item.dropdown.map((dropdownItem, index) => (
                        <Link
                          key={index}
                          to={dropdownItem.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">{dropdownItem.label}</div>
                          {dropdownItem.description && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {dropdownItem.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Sell on Vasty Shop / My Store Link */}
              {hasShop ? (
                <Link
                  to={currentShop ? `/shop/${currentShop.id}/vendor/dashboard` : `/shop/${shops[0]?.id}/vendor/dashboard`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-lime rounded-lg hover:bg-primary-lime/90 transition-colors ml-2"
                >
                  <Store className="w-4 h-4" />
                  <span>{t('header.myStore')}</span>
                </Link>
              ) : (
                <Link
                  to={isAuthenticated ? "/vendor/create-shop" : "/signup"}
                  state={!isAuthenticated ? { from: '/vendor/create-shop', message: 'Sign up to create your store' } : undefined}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-primary-lime to-accent-blue rounded-lg hover:opacity-90 transition-opacity ml-2"
                >
                  <Store className="w-4 h-4" />
                  <span>{t('header.sellOnVasty')}</span>
                </Link>
              )}
            </nav>

            {/* Empty space for mobile */}
            <div className="lg:hidden" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-bold text-gray-900">{t('header.menu')}</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="p-4">
              {menuItems.map((item) => (
                <div key={item.label} className="mb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.href}
                      className={cn(
                        "flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive(item.href)
                          ? "text-primary-lime bg-primary-lime/10"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      onClick={() => !item.dropdown && setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.dropdown && (
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronDown className={cn(
                          "w-4 h-4 text-gray-700 transition-transform",
                          activeDropdown === item.label && "rotate-180"
                        )} />
                      </button>
                    )}
                  </div>

                  {/* Mobile Dropdown Items */}
                  {item.dropdown && activeDropdown === item.label && (
                    <div className="mt-2 ml-4 space-y-1">
                      {item.dropdown.map((dropdownItem, index) => (
                        <Link
                          key={index}
                          to={dropdownItem.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="font-medium">{dropdownItem.label}</div>
                          {dropdownItem.description && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {dropdownItem.description}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Explore Stores */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/explore"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Store className="w-5 h-5" />
                  <span>{t('header.exploreStores')}</span>
                </Link>
              </div>

              {/* Mobile Language Selector */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('header.selectLanguage')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                        currentLanguage.code === lang.code
                          ? "bg-primary-lime/10 text-primary-lime border border-primary-lime/30"
                          : "text-gray-700 hover:bg-gray-100 border border-transparent"
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span className="font-medium text-xs">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

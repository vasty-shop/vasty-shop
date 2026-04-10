'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  LayoutGrid,
  User,
  X,
  Sparkles,
  Store,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  action?: 'search' | 'categories' | 'account';
  badge?: number;
}

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isVendor, shops, logout } = useAuth();

  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = !!user;

  // Don't show on vendor/admin/delivery dashboards
  const isExcludedPath =
    location.pathname.startsWith('/shop/') && location.pathname.includes('/vendor') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery');

  if (isExcludedPath) {
    return null;
  }

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: LayoutGrid, label: 'Categories', action: 'categories' },
    { icon: Search, label: 'Search', action: 'search' },
    { icon: Store, label: 'Stores', href: '/stores' },
    { icon: User, label: 'Account', action: 'account' },
  ];

  const categories = [
    { icon: '👕', label: 'Clothing', href: '/category/clothing' },
    { icon: '👟', label: 'Shoes', href: '/category/shoes' },
    { icon: '👜', label: 'Bags', href: '/category/bags' },
    { icon: '💍', label: 'Accessories', href: '/category/accessories' },
    { icon: '📱', label: 'Electronics', href: '/category/electronics' },
    { icon: '🏠', label: 'Home & Living', href: '/category/home-living' },
    { icon: '💄', label: 'Beauty', href: '/category/beauty' },
    { icon: '🎮', label: 'Gaming', href: '/category/gaming' },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'search') {
      setShowSearch(true);
      setShowCategories(false);
      setShowAccount(false);
    } else if (item.action === 'categories') {
      setShowCategories(true);
      setShowSearch(false);
      setShowAccount(false);
    } else if (item.action === 'account') {
      setShowAccount(true);
      setShowSearch(false);
      setShowCategories(false);
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowAccount(false);
    navigate('/');
  };

  const closeAllModals = () => {
    setShowSearch(false);
    setShowCategories(false);
    setShowAccount(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === location.pathname ||
              (item.action === 'search' && showSearch) ||
              (item.action === 'categories' && showCategories) ||
              (item.action === 'account' && showAccount);

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full relative transition-colors',
                  isActive ? 'text-primary-lime' : 'text-gray-500'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-lime rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={closeAllModals}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Search Header */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Search</h2>
                  <button onClick={closeAllModals} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.placeholders.searchProductsBrands')}
                    autoFocus
                    className="w-full h-12 pl-12 pr-4 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-primary-lime outline-none text-sm"
                  />
                </form>
              </div>

              {/* Quick Links */}
              <div className="px-4 pb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Quick Links</h3>
                <div className="flex flex-wrap gap-2">
                  {['New Arrivals', 'Best Sellers', 'On Sale', 'Trending'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        navigate(`/products?filter=${term.toLowerCase().replace(' ', '-')}`);
                        closeAllModals();
                      }}
                      className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Modal */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={closeAllModals}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Categories Header */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Categories</h2>
                <button onClick={closeAllModals} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Categories Grid */}
              <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.label}
                      to={category.href}
                      onClick={closeAllModals}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-3xl mb-2">{category.icon}</span>
                      <span className="text-xs text-gray-700 text-center font-medium">{category.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Browse All */}
                <Link
                  to="/products"
                  onClick={closeAllModals}
                  className="flex items-center justify-between mt-4 p-4 bg-gradient-to-r from-primary-lime/10 to-emerald-500/10 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary-lime" />
                    <span className="font-medium text-gray-900">Browse All Products</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Modal */}
      <AnimatePresence>
        {showAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={closeAllModals}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Account Content */}
              <div className="px-4 pb-6">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || ''}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary-lime">
                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{user?.name || 'User'}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    {/* Account Links */}
                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        onClick={closeAllModals}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{t('mobileNav.myProfile')}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </Link>
                      <Link
                        to="/stores"
                        onClick={closeAllModals}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <Store className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{t('mobileNav.exploreStores')}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </Link>
                      <Link
                        to="/settings"
                        onClick={closeAllModals}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{t('mobileNav.settings')}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                      </Link>

                      {/* Vendor Store Link */}
                      {isVendor && shops && shops.length > 0 ? (
                        <Link
                          to={`/shop/${shops[0].id}/vendor/dashboard`}
                          onClick={closeAllModals}
                          className="flex items-center gap-3 p-3 rounded-xl bg-primary-lime/10 hover:bg-primary-lime/20 transition-colors"
                        >
                          <Store className="w-5 h-5 text-primary-lime" />
                          <span className="text-primary-lime font-medium">{t('mobileNav.myStoreDashboard')}</span>
                          <ChevronRight className="w-5 h-5 text-primary-lime ml-auto" />
                        </Link>
                      ) : (
                        <Link
                          to="/vendor/create-shop"
                          onClick={closeAllModals}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-lime/10 to-emerald-500/10 hover:from-primary-lime/20 hover:to-emerald-500/20 transition-colors"
                        >
                          <Store className="w-5 h-5 text-primary-lime" />
                          <span className="text-primary-lime font-medium">{t('mobileNav.startSelling')}</span>
                          <ChevronRight className="w-5 h-5 text-primary-lime ml-auto" />
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-5 h-5 text-red-500" />
                        <span className="text-red-500">{t('mobileNav.logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Guest View */}
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{t('mobileNav.welcomeTitle')}</h2>
                      <p className="text-gray-500 mb-6">{t('mobileNav.welcomeSubtitle')}</p>

                      <div className="space-y-3">
                        <Link
                          to="/login"
                          onClick={closeAllModals}
                          className="block w-full py-3 bg-primary-lime text-white font-medium rounded-xl hover:bg-primary-lime/90 transition-colors"
                        >
                          {t('mobileNav.signIn')}
                        </Link>
                        <Link
                          to="/signup"
                          onClick={closeAllModals}
                          className="block w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          {t('mobileNav.createAccount')}
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default MobileBottomNav;

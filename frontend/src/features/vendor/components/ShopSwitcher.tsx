import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ChevronDown, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useShopStore } from '../../../stores/useShopStore';
import { useVendorAuthStore } from '../../../stores/useVendorAuthStore';
import { getShopUrl } from '../../../lib/navigation-utils';
import { TokenManager } from '../../../lib/token-manager';
import { api } from '../../../lib/api';

// Helper to check if a URL is valid (not a blob URL or invalid)
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (url.startsWith('blob:')) return false;
  return true;
};

export const ShopSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  const { token: vendorToken } = useVendorAuthStore();
  const {
    currentShop,
    shops,
    setCurrentShop,
    switchShop,
    fetchUserShops,
  } = useShopStore();

  // Check if user is authenticated (either vendor or customer auth)
  const isAuthenticated = vendorToken || TokenManager.getToken();

  // Load shops on mount
  useEffect(() => {
    if (isAuthenticated && shops.length === 0) {
      loadShops();
    }
  }, [isAuthenticated, shops.length]);

  const loadShops = async () => {
    if (!isAuthenticated || isLoadingShops) return;

    try {
      setIsLoadingShops(true);

      // Fetch user shops using the my-shops endpoint
      await fetchUserShops();

      // Get the updated shops from the store
      const { shops: updatedShops } = useShopStore.getState();
    } catch (error) {
      // Failed to load shops
    } finally {
      setIsLoadingShops(false);
    }
  };

  const handleShopSwitch = async (shopId: string) => {
    if (shopId === currentShop?.id) {
      return;
    }

    try {
      setIsSwitching(true);
      setIsOpen(false);

      const shop = shops.find((s) => s.id === shopId);
      if (!shop) {
        toast.error('Shop not found');
        return;
      }

      // Update local state
      switchShop(shopId);
      setCurrentShop(shop);

      // Also update API client shop context
      api.setShopId(shopId);

      // Extract the current vendor path (e.g., 'dashboard', 'products', etc.)
      // URL format: /shop/:shopId/vendor/:page
      const pathParts = location.pathname.split('/');
      const vendorIndex = pathParts.indexOf('vendor');
      const subPath = vendorIndex >= 0 && pathParts[vendorIndex + 1]
        ? pathParts.slice(vendorIndex + 1).join('/')
        : 'dashboard';

      // Navigate to the same page but with new shop context
      const newUrl = getShopUrl(shopId, subPath);

      // Force navigation with page reload to ensure all state is fresh
      window.location.href = newUrl;

      toast.success(`Switched to ${shop.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to switch shop');
      setIsSwitching(false);
    }
  };

  const handleCreateShop = () => {
    setIsOpen(false);
    navigate('/vendor/create-shop');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.shop-switcher-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Always show the switcher - it will display the current shop or a "Select Shop" prompt
  // If no shops, show create shop option

  return (
    <div className="relative shop-switcher-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center space-x-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Shop Logo/Icon */}
        {isValidImageUrl(currentShop?.logo) ? (
          <img
            src={currentShop!.logo}
            alt={currentShop!.name}
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-lime to-green-500 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Shop Name */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900">
            {isSwitching ? t('vendor.shopSwitcher.switching', { defaultValue: 'Switching...' }) : currentShop?.name || t('vendor.shopSwitcher.selectShop', { defaultValue: 'Select Shop' })}
          </p>
          <p className="text-xs text-gray-500">
            {currentShop?.status === 'active' ? t('vendor.shopSwitcher.activeShop', { defaultValue: 'Active Shop' }) : currentShop?.status}
          </p>
        </div>

        {/* Dropdown Icon or Loading */}
        {isSwitching ? (
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200">
                <p className="text-xs text-gray-500 font-medium px-3 uppercase tracking-wider">
                  Your Shops
                </p>
              </div>

              {/* Shop List */}
              <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                {isLoadingShops ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-8 h-8 text-primary-lime mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-gray-600">Loading shops...</p>
                  </div>
                ) : shops.length === 0 ? (
                  <div className="p-6 text-center">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No shops found</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first shop to get started</p>
                  </div>
                ) : (
                  shops.map((shop) => {
                    const isActive = shop.id === currentShop?.id;

                    return (
                      <motion.button
                        key={shop.id}
                        onClick={() => handleShopSwitch(shop.id)}
                        disabled={isActive}
                        whileHover={!isActive ? { scale: 1.02 } : {}}
                        whileTap={!isActive ? { scale: 0.98 } : {}}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all
                          ${
                            isActive
                              ? 'bg-primary-lime/10 border border-primary-lime/30'
                              : 'hover:bg-gray-50 cursor-pointer'
                          }
                        `}
                      >
                        {/* Shop Logo */}
                        {isValidImageUrl(shop.logo) ? (
                          <img
                            src={shop.logo}
                            alt={shop.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-lime to-green-500 flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5 text-white" />
                          </div>
                        )}

                        {/* Shop Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {shop.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span
                              className={`text-xs ${
                                shop.status === 'active'
                                  ? 'text-green-600'
                                  : shop.status === 'pending'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {shop.status}
                            </span>
                            {shop.isVerified && (
                              <span className="text-xs text-blue-600">Verified</span>
                            )}
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <div className="flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Footer - Create New Shop */}
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleCreateShop}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-lime text-white rounded-lg text-sm font-medium hover:bg-primary-lime/90 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Shop</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

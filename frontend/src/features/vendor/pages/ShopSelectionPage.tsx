import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Store, Plus, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useShopStore } from '@/stores/useShopStore';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { BackgroundEffects } from '../components/BackgroundEffects';

// Helper to check if a URL is valid (not a blob URL or invalid)
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (url.startsWith('blob:')) return false;
  return true;
};

export const ShopSelectionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, vendor } = useVendorAuthStore();
  const { shops, setShops, setCurrentShop, isLoading, error, fetchUserShops } = useShopStore();

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/vendor/login');
      return;
    }

    loadShops();
  }, [token]);

  const loadShops = async () => {
    if (!token) return;

    try {
      await fetchUserShops();

      // If only one shop, auto-select it
      if (shops.length === 1) {
        setSelectedShopId(shops[0].id);
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
      toast.error('Failed to load shops');
    }
  };

  const handleShopSelect = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    if (shop) {
      setCurrentShop(shop);
    }
    navigate(`/shop/${shopId}/vendor/dashboard`);
    toast.success('Shop selected successfully!');
  };

  const handleCreateShop = () => {
    navigate('/vendor/create-shop');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <BackgroundEffects />
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white/70">{t('vendor.shopSelection.loadingShops', { defaultValue: 'Loading your shops...' })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <BackgroundEffects />
        <div className="text-center relative z-10 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('vendor.shopSelection.errorTitle', { defaultValue: 'Something went wrong' })}</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={loadShops}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            {t('vendor.common.tryAgain', { defaultValue: 'Try Again' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <BackgroundEffects />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <Store className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('vendor.common.welcome', { defaultValue: 'Welcome' })}{vendor?.firstName ? `, ${vendor.firstName}` : ''}!
          </h1>
          <p className="text-xl text-white/70">
            {shops.length === 0
              ? t('vendor.shopSelection.createFirstShop', { defaultValue: 'Get started by creating your first shop' })
              : t('vendor.shopSelection.selectShop', { defaultValue: 'Select a shop to continue' })}
          </p>
        </div>

        {/* No Shops - Create Shop CTA */}
        {shops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="backdrop-blur-md bg-gray-900/50 border border-purple-500/20 rounded-2xl p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <Store className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t('vendor.shopSelection.noShopsYet', { defaultValue: 'No Shops Yet' })}</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                {t('vendor.shopSelection.noShopsMessage', { defaultValue: 'Create your first shop to start selling products and managing your business on our platform.' })}
              </p>
              <button
                onClick={handleCreateShop}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>{t('vendor.shopSelection.createFirstShopButton', { defaultValue: 'Create Your First Shop' })}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Shop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {shops.map((shop, index) => (
                <motion.button
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleShopSelect(shop.id)}
                  className={`
                    relative group p-6 backdrop-blur-md bg-gray-900/50 border rounded-2xl text-left transition-all
                    hover:scale-105 hover:bg-gray-900/70 hover:shadow-2xl hover:shadow-purple-900/40
                    ${
                      selectedShopId === shop.id
                        ? 'border-purple-500/50 ring-2 ring-purple-500/30'
                        : 'border-purple-500/20'
                    }
                  `}
                >
                  {/* Shop Logo/Icon */}
                  <div className="mb-4">
                    {isValidImageUrl(shop.logo) ? (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Store className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <h3 className="text-xl font-bold text-white mb-2 truncate">
                    {shop.name}
                  </h3>

                  {/* Status & Verification Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        shop.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : shop.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {shop.status}
                    </span>
                    {shop.isVerified && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Shop Stats */}
                  {(shop.totalProducts || shop.totalOrders || shop.totalSales) && (
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                      {shop.totalProducts !== undefined && (
                        <div>
                          <p className="text-xs text-white/50">{t('vendor.shopSelection.products', { defaultValue: 'Products' })}</p>
                          <p className="text-sm font-semibold text-white">
                            {shop.totalProducts}
                          </p>
                        </div>
                      )}
                      {shop.totalOrders !== undefined && (
                        <div>
                          <p className="text-xs text-white/50">{t('vendor.shopSelection.orders', { defaultValue: 'Orders' })}</p>
                          <p className="text-sm font-semibold text-white">
                            {shop.totalOrders}
                          </p>
                        </div>
                      )}
                      {shop.totalSales !== undefined && (
                        <div>
                          <p className="text-xs text-white/50">{t('vendor.shopSelection.sales', { defaultValue: 'Sales' })}</p>
                          <p className="text-sm font-semibold text-white">
                            ${shop.totalSales.toFixed(0)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-purple-400" />
                  </div>
                </motion.button>
              ))}

              {/* Create New Shop Card */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * shops.length }}
                onClick={handleCreateShop}
                className="group p-6 backdrop-blur-md bg-gray-900/30 border-2 border-dashed border-purple-500/30 rounded-2xl text-left transition-all hover:scale-105 hover:bg-gray-900/50 hover:border-purple-500/50"
              >
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                  <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                    <Plus className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{t('vendor.shopSelection.createNewShop', { defaultValue: 'Create New Shop' })}</h3>
                  <p className="text-sm text-white/50">
                    {t('vendor.shopSelection.createNewShopDesc', { defaultValue: 'Start a new shop and grow your business' })}
                  </p>
                </div>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

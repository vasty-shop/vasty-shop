import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';
import { VendorSidebar } from '../components/VendorSidebar';
import { VendorTopBar } from '../components/VendorTopBar';
import { BackgroundEffects } from '../components/BackgroundEffects';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useShopStore } from '../../../stores/useShopStore';
import { api } from '../../../lib/api';

export const VendorLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { switchShop, currentShop, shops, setCurrentShop, addShop } = useShopStore();

  // Set shop ID immediately (synchronously) so child components have it
  if (shopId) {
    api.setShopId(shopId);
  }

  // Sync currentShop with URL shopId
  useEffect(() => {
    if (!shopId) {
      navigate('/vendor/login');
      return;
    }

    // Set shop context in API client
    api.setShopId(shopId);

    // If currentShop already matches URL, we're good
    if (currentShop?.id === shopId) {
      return;
    }

    // Try to find the shop in the list and switch to it
    const existingShop = shops.find(s => s.id === shopId);
    if (existingShop) {
      setCurrentShop(existingShop);
      return;
    }

    // Shop not in stores - try to fetch it
    const loadShop = async () => {
      try {
        const shopData = await api.getShop(shopId);
        if (shopData) {
          addShop(shopData);
          setCurrentShop(shopData);
        }
      } catch (error) {
        // Failed to fetch shop
      }
    };

    loadShop();
  }, [shopId, currentShop?.id, shops, navigate, setCurrentShop, addShop]);

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-gray-50">
      {/* Background Effects - subtle for light theme */}
      {/* <BackgroundEffects /> */}

      {/* Layout Container */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Sidebar - Fixed/Sticky */}
        <div className="hidden lg:block relative z-20">
          <VendorSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
              >
                <VendorSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar - Sticky Header */}
          <div className="relative z-30">
            <VendorTopBar
              onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              shopName={currentShop?.name}
            />
          </div>

          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        richColors
      />
    </div>
  );
};

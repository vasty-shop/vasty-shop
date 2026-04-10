import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { DeliverySidebar } from '../components/DeliverySidebar';
import { DeliveryTopBar } from '../components/DeliveryTopBar';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';
import { deliveryApi } from '../api/deliveryApi';
import { Loader2 } from 'lucide-react';

export const DeliveryLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { deliveryMan, isAuthenticated, setDeliveryMan } = useDeliveryAuthStore();

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        navigate('/delivery/login');
        return;
      }

      try {
        // Always fetch fresh profile data to get latest fields
        const response = await deliveryApi.getMyProfile();
        if (response.data?.data) {
          setDeliveryMan(response.data.data);
        } else if (!deliveryMan) {
          // Not registered as delivery man
          navigate('/delivery/login');
          return;
        }
      } catch (error) {
        console.error('Failed to load delivery profile:', error);
        if (!deliveryMan) {
          navigate('/delivery/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate, setDeliveryMan]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Fixed/Sticky */}
        <div className="hidden lg:block relative z-20">
          <DeliverySidebar
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
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
              >
                <DeliverySidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar - Sticky Header */}
          <div className="relative z-30">
            <DeliveryTopBar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          </div>

          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
};

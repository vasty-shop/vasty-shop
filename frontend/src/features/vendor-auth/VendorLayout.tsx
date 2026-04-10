import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { Button } from '@/components/ui/button';

/**
 * Vendor Layout Component
 * Protected layout for vendor dashboard with sidebar navigation
 */
export const VendorLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, vendor, shop, logout, _hasHydrated } = useVendorAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-lime mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (only after hydration)
  if (!isAuthenticated || !vendor || !shop) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Build shop-aware navigation links
  const shopId = shop?.id || '';
  const navigation = [
    { name: 'Dashboard', href: `/shop/${shopId}/vendor/dashboard`, icon: LayoutDashboard },
    { name: 'Products', href: `/shop/${shopId}/vendor/products`, icon: Package },
    { name: 'Orders', href: `/shop/${shopId}/vendor/orders`, icon: ShoppingCart },
    { name: 'Analytics', href: `/shop/${shopId}/vendor/analytics`, icon: BarChart3 },
    { name: 'Settings', href: `/shop/${shopId}/vendor/settings`, icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to={`/shop/${shopId}/vendor/dashboard`} className="flex items-center gap-2">
              <Store className="w-6 h-6 text-primary-lime" />
              <span className="text-xl font-bold">
                <span className="text-gray-900">Flux</span>
                <span className="text-primary-lime">ez</span>
              </span>
            </Link>
          </div>

          {/* Shop Info & User Menu */}
          <div className="flex items-center gap-4">
            {/* Shop Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  shop.status === 'active' && 'bg-green-500',
                  shop.status === 'pending' && 'bg-yellow-500',
                  shop.status === 'suspended' && 'bg-red-500'
                )}
              />
              <span className="text-sm font-medium text-gray-700 capitalize">{shop.status}</span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-primary-lime/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-lime">
                    {vendor.firstName?.[0] || vendor.email?.[0]?.toUpperCase() || 'V'}{vendor.lastName?.[0] || ''}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {vendor.firstName && vendor.lastName ? `${vendor.firstName} ${vendor.lastName}` : vendor.email}
                  </div>
                  <div className="text-xs text-gray-500">{shop.name}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-200">
                      <div className="font-semibold text-gray-900">
                        {vendor.firstName && vendor.lastName ? `${vendor.firstName} ${vendor.lastName}` : vendor.email}
                      </div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                      <div className="text-sm text-gray-500 mt-1">{shop.name}</div>
                    </div>
                    <div className="p-2">
                      <Link
                        to={`/shop/${shopId}/vendor/settings`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-[57px] left-0 z-20 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200 transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-primary-lime text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  BarChart3,
  Settings,
  Users,
  Truck,
  Gift,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Store,
  Palette,
  CreditCard,
  Eye,
  Bell,
  Wallet,
} from 'lucide-react';
import { useCurrentShop } from '../../../stores/useShopStore';
import { getShopUrl } from '../../../lib/navigation-utils';
import { api } from '../../../lib/api';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  subItems?: { label: string; path: string }[];
}

interface SidebarCounts {
  pendingOrders: number;
  pendingReviews: number;
}

const getNavItems = (shopId: string | null, counts: SidebarCounts, t: (key: string, options?: any) => string): NavItem[] => {
  if (!shopId) return [];

  return [
    {
      icon: LayoutDashboard,
      label: t('vendor.sidebar.dashboard', { defaultValue: 'Dashboard' }),
      path: getShopUrl(shopId, 'dashboard')
    },
    {
      icon: Package,
      label: t('vendor.sidebar.products', { defaultValue: 'Products' }),
      path: getShopUrl(shopId, 'products'),
      subItems: [
        { label: t('vendor.sidebar.allProducts', { defaultValue: 'All Products' }), path: getShopUrl(shopId, 'products') },
        { label: t('vendor.sidebar.addProduct', { defaultValue: 'Add Product' }), path: getShopUrl(shopId, 'products/add') }
      ]
    },
    {
      icon: Palette,
      label: t('vendor.sidebar.storefront', { defaultValue: 'Storefront' }),
      path: getShopUrl(shopId, 'storefront'),
      subItems: [
        { label: t('vendor.sidebar.viewStorefront', { defaultValue: 'View Storefront' }), path: getShopUrl(shopId, 'storefront') },
        { label: t('vendor.sidebar.editStorefront', { defaultValue: 'Edit Storefront' }), path: `/shop/${shopId}/vendor/storefront-builder` }
      ]
    },
    {
      icon: ShoppingCart,
      label: t('vendor.sidebar.orders', { defaultValue: 'Orders' }),
      path: getShopUrl(shopId, 'orders'),
      badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined
    },
    {
      icon: Tag,
      label: t('vendor.sidebar.offers', { defaultValue: 'Offers' }),
      path: getShopUrl(shopId, 'offers')
    },
    {
      icon: Truck,
      label: t('vendor.sidebar.delivery', { defaultValue: 'Delivery' }),
      path: getShopUrl(shopId, 'delivery')
    },
    {
      icon: MessageSquare,
      label: t('vendor.sidebar.reviews', { defaultValue: 'Reviews' }),
      path: getShopUrl(shopId, 'reviews'),
      badge: counts.pendingReviews > 0 ? counts.pendingReviews : undefined
    },
    {
      icon: BarChart3,
      label: t('vendor.sidebar.analytics', { defaultValue: 'Analytics' }),
      path: getShopUrl(shopId, 'analytics')
    },
    {
      icon: Bell,
      label: t('vendor.sidebar.notifications', { defaultValue: 'Notifications' }),
      path: getShopUrl(shopId, 'notifications')
    },
    {
      icon: Users,
      label: t('vendor.sidebar.team', { defaultValue: 'Team' }),
      path: getShopUrl(shopId, 'team')
    },
    {
      icon: Wallet,
      label: t('vendor.sidebar.paymentSettings', { defaultValue: 'Payment Settings' }),
      path: getShopUrl(shopId, 'payment-settings')
    },
    {
      icon: CreditCard,
      label: t('vendor.sidebar.billing', { defaultValue: 'Billing' }),
      path: getShopUrl(shopId, 'billing')
    },
    {
      icon: Settings,
      label: t('vendor.sidebar.settings', { defaultValue: 'Settings' }),
      path: getShopUrl(shopId, 'settings')
    }
  ];
};

interface VendorSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({
  collapsed: controlledCollapsed,
  onCollapsedChange
}) => {
  const { t } = useTranslation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [counts, setCounts] = useState<SidebarCounts>({ pendingOrders: 0, pendingReviews: 0 });
  const location = useLocation();
  const currentShop = useCurrentShop();

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setCollapsed = onCollapsedChange || setInternalCollapsed;

  // Fetch counts for sidebar badges
  useEffect(() => {
    const fetchCounts = async () => {
      if (!currentShop?.id) return;

      try {
        // Set shop ID for API calls
        api.setShopId(currentShop.id);

        // Fetch pending orders count
        const ordersResponse = await api.getVendorOrders({ status: 'pending', limit: 100 });
        const pendingOrders = ordersResponse?.data?.length || 0;

        // Fetch reviews count (total reviews that might need attention)
        let pendingReviews = 0;
        try {
          const reviewsResponse = await api.getShopReviews(currentShop.id, { limit: 100 });
          // Count reviews - use total or data length
          pendingReviews = reviewsResponse?.total || reviewsResponse?.data?.length || 0;
        } catch {
          // Reviews endpoint might not exist or fail - ignore
        }

        setCounts({ pendingOrders, pendingReviews });
      } catch (error) {
        console.error('[VendorSidebar] Failed to fetch counts:', error);
      }
    };

    fetchCounts();

    // Refresh counts every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [currentShop?.id]);

  // Get shop-aware navigation items with dynamic counts
  const navItems = useMemo(() => getNavItems(currentShop?.id || null, counts, t), [currentShop?.id, counts, t]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleItemClick = (item: NavItem) => {
    if (item.subItems) {
      setExpandedItem(expandedItem === item.path ? null : item.path);
    }
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col relative z-20 shadow-sm"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <motion.div
          className="flex items-center space-x-3"
          animate={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary-lime flex items-center justify-center shadow-md">
            <Store className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  {t('vendor.sidebar.vendorPanel', { defaultValue: 'Vendor Panel' })}
                </h2>
                <p className="text-gray-500 text-xs">{t('vendor.sidebar.manageStore', { defaultValue: 'Manage your store' })}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.path}>
            <Link to={item.path} onClick={() => handleItemClick(item)}>
              <motion.div
                whileHover={{ x: 3 }}
                className={`
                  flex items-center py-3 rounded-xl transition-all relative group
                  ${collapsed ? 'justify-center px-3' : 'space-x-3 px-4'}
                  ${
                    isActive(item.path)
                      ? 'bg-primary-lime/10 border border-primary-lime/30'
                      : 'hover:bg-gray-100'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary-lime rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0
                    ${isActive(item.path) ? 'text-primary-lime' : 'text-gray-500 group-hover:text-gray-900'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                </div>

                {/* Label and Badge */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex-1 flex items-center justify-between overflow-hidden"
                    >
                      <span
                        className={`
                          text-sm font-medium
                          ${isActive(item.path) ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}
                        `}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-primary-lime text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.subItems && (
                        <ChevronRight
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedItem === item.path ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {/* Sub Items */}
            <AnimatePresence>
              {!collapsed && item.subItems && expandedItem === item.path && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-4 mt-1 space-y-1 overflow-hidden"
                >
                  {item.subItems.map((subItem) => (
                    <Link key={subItem.path} to={subItem.path}>
                      <motion.div
                        whileHover={{ x: 3 }}
                        className={`
                          flex items-center space-x-3 px-4 py-2 rounded-lg text-sm
                          ${
                            location.pathname === subItem.path
                              ? 'text-primary-lime bg-primary-lime/5'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{subItem.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl p-3 flex items-center justify-center transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">{t('vendor.sidebar.collapse', { defaultValue: 'Collapse' })}</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wallet,
  History,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  Star,
  MapPin,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeliveryAuthStore } from '@/stores/useDeliveryAuthStore';

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  path: string;
  badge?: number;
}

const getNavItems = (deliveryManId: string): NavItem[] => [
  {
    icon: LayoutDashboard,
    labelKey: 'delivery.sidebar.dashboard',
    path: `/delivery/${deliveryManId}/dashboard`,
  },
  {
    icon: Package,
    labelKey: 'delivery.sidebar.orders',
    path: `/delivery/${deliveryManId}/orders`,
    badge: 0, // Will be updated dynamically
  },
  {
    icon: Wallet,
    labelKey: 'delivery.sidebar.earnings',
    path: `/delivery/${deliveryManId}/earnings`,
  },
  {
    icon: History,
    labelKey: 'delivery.sidebar.history',
    path: `/delivery/${deliveryManId}/history`,
  },
  {
    icon: Star,
    labelKey: 'delivery.sidebar.reviews',
    path: `/delivery/${deliveryManId}/reviews`,
  },
  {
    icon: MapPin,
    labelKey: 'delivery.sidebar.zones',
    path: `/delivery/${deliveryManId}/zones`,
  },
  {
    icon: User,
    labelKey: 'delivery.sidebar.profile',
    path: `/delivery/${deliveryManId}/profile`,
  },
  {
    icon: Settings,
    labelKey: 'delivery.sidebar.settings',
    path: `/delivery/${deliveryManId}/settings`,
  },
];

interface DeliverySidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  collapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const { t } = useTranslation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();
  const { deliveryMan } = useDeliveryAuthStore();

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setCollapsed = onCollapsedChange || setInternalCollapsed;

  const deliveryManId = deliveryMan?.id || '';
  const navItems = getNavItems(deliveryManId);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6 text-white" />
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
                <h2 className="text-xl font-bold text-gray-900">{t('delivery.sidebar.delivery')}</h2>
                <p className="text-gray-500 text-xs">{t('delivery.sidebar.partnerDashboard')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Availability Status */}
      {!collapsed && deliveryMan && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('delivery.common.status')}</span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                deliveryMan.availability === 'ON_DELIVERY'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {deliveryMan.availability === 'ON_DELIVERY'
                ? t('delivery.dashboard.onDelivery')
                : t('delivery.dashboard.online')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <motion.div
              whileHover={{ x: 3 }}
              className={`
                flex items-center py-3 rounded-xl transition-all relative group
                ${collapsed ? 'justify-center px-3' : 'space-x-3 px-4'}
                ${
                  isActive(item.path)
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-gray-100'
                }
              `}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div
                className={`
                  flex-shrink-0
                  ${isActive(item.path) ? 'text-orange-600' : 'text-gray-500 group-hover:text-gray-900'}
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
                      {t(item.labelKey)}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
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
              <span className="text-sm text-gray-500">{t('delivery.sidebar.collapse')}</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
};

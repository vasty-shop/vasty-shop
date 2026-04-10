import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Package,
  ShoppingCart,
  Tag,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bell,
  CreditCard,
  FileBarChart,
  Gift,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  path: string;
  badge?: number;
  subItems?: { labelKey: string; path: string }[];
}

const navItemsConfig: NavItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: 'admin.sidebar.dashboard',
    path: '/admin/dashboard'
  },
  {
    icon: Store,
    labelKey: 'admin.sidebar.shops',
    path: '/admin/shops'
  },
  {
    icon: Users,
    labelKey: 'admin.sidebar.users',
    path: '/admin/users'
  },
  {
    icon: ShoppingCart,
    labelKey: 'admin.sidebar.orders',
    path: '/admin/orders'
  },
  {
    icon: Package,
    labelKey: 'admin.sidebar.products',
    path: '/admin/products'
  },
  {
    icon: Tag,
    labelKey: 'admin.sidebar.categories',
    path: '/admin/categories'
  },
  {
    icon: CreditCard,
    labelKey: 'admin.sidebar.payments',
    path: '/admin/payments'
  },
  {
    icon: MessageSquare,
    labelKey: 'admin.sidebar.reviews',
    path: '/admin/reviews'
  },
  {
    icon: Bell,
    labelKey: 'admin.sidebar.notifications',
    path: '/admin/notifications'
  },
  {
    icon: BarChart3,
    labelKey: 'admin.sidebar.analytics',
    path: '/admin/analytics'
  },
  {
    icon: FileBarChart,
    labelKey: 'admin.sidebar.reports',
    path: '/admin/reports'
  },
  {
    icon: Gift,
    labelKey: 'admin.sidebar.referrals',
    path: '/admin/referrals'
  },
  {
    icon: Settings,
    labelKey: 'admin.sidebar.settings',
    path: '/admin/settings'
  }
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed: controlledCollapsed,
  onCollapsedChange
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();
  const { t } = useTranslation();

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setCollapsed = onCollapsedChange || setInternalCollapsed;

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
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
                  {t('admin.common.adminPanel')}
                </h2>
                <p className="text-gray-500 text-xs">{t('admin.sidebar.managePlatform')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        {navItemsConfig.map((item) => (
          <div key={item.path}>
            <Link to={item.path} onClick={() => handleItemClick(item)}>
              <motion.div
                whileHover={{ x: 3 }}
                className={`
                  flex items-center py-3 rounded-xl transition-all relative group
                  ${collapsed ? 'justify-center px-3' : 'space-x-3 px-4'}
                  ${
                    isActive(item.path)
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-gray-100'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0
                    ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-900'}
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
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500 text-white rounded-full">
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
                              ? 'text-indigo-600 bg-indigo-50'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{t(subItem.labelKey)}</span>
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
              <span className="text-sm text-gray-500">{t('admin.sidebar.collapse')}</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
};

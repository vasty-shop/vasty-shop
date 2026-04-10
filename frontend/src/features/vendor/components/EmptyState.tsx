import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  Users,
  FileText,
  Inbox,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  type?: 'products' | 'orders' | 'customers' | 'search' | 'general';
  fullScreen?: boolean;
}

const emptyConfig: Record<
  NonNullable<EmptyStateProps['type']>,
  {
    icon: LucideIcon;
    color: string;
    defaultTitle: string;
    defaultMessage: string;
    defaultActionLabel: string;
  }
> = {
  products: {
    icon: Package,
    color: 'from-primary-lime to-green-500',
    defaultTitle: 'No Products Yet',
    defaultMessage: 'Start building your inventory by adding your first product.',
    defaultActionLabel: 'Add Product',
  },
  orders: {
    icon: ShoppingCart,
    color: 'from-blue-500 to-cyan-500',
    defaultTitle: 'No Orders Yet',
    defaultMessage: 'Orders will appear here once customers start purchasing from your shop.',
    defaultActionLabel: 'View Shop',
  },
  customers: {
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    defaultTitle: 'No Customers Yet',
    defaultMessage: 'Customer information will appear here after they make their first purchase.',
    defaultActionLabel: 'Promote Shop',
  },
  search: {
    icon: Search,
    color: 'from-yellow-500 to-orange-500',
    defaultTitle: 'No Results Found',
    defaultMessage: 'Try adjusting your search or filters to find what you are looking for.',
    defaultActionLabel: 'Clear Filters',
  },
  general: {
    icon: Inbox,
    color: 'from-gray-500 to-slate-500',
    defaultTitle: 'Nothing Here',
    defaultMessage: 'There is nothing to display at the moment.',
    defaultActionLabel: 'Go Back',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  type = 'general',
  fullScreen = false,
}) => {
  const config = emptyConfig[type];
  const Icon = icon || config.icon;

  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;
  const displayActionLabel = actionLabel || (onAction ? config.defaultActionLabel : undefined);

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center p-6'
    : 'min-h-[400px] flex items-center justify-center p-6';

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          <div className="text-center space-y-6">
            {/* Icon with gradient background */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 relative"
            >
              {/* Gradient glow */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.color} opacity-20 blur-xl`}
              />

              <Icon className="w-10 h-10 text-gray-400 relative z-10" />
            </motion.div>

            {/* Title & Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h3 className="text-2xl font-bold text-gray-900">{displayTitle}</h3>
              <p className="text-gray-500 text-base leading-relaxed">{displayMessage}</p>
            </motion.div>

            {/* Actions */}
            {(onAction || onSecondaryAction) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                {onAction && displayActionLabel && (
                  <button
                    onClick={onAction}
                    className="flex-1 px-6 py-3 bg-primary-lime hover:bg-primary-lime/90 text-white rounded-xl font-medium transition-all shadow-md flex items-center justify-center space-x-2 group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>{displayActionLabel}</span>
                  </button>
                )}

                {onSecondaryAction && secondaryActionLabel && (
                  <button
                    onClick={onSecondaryAction}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border border-gray-200 group"
                  >
                    <span>{secondaryActionLabel}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Optional decorative elements */}
            <div className="absolute -z-10 inset-0 overflow-hidden rounded-2xl">
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${config.color} opacity-10 rounded-full blur-2xl`}
              />
              <div
                className={`absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br ${config.color} opacity-10 rounded-full blur-2xl`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Specialized Empty States
export const NoProducts: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="products" />
);

export const NoOrders: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="orders" />
);

export const NoCustomers: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="customers" />
);

export const NoSearchResults: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="search" />
);

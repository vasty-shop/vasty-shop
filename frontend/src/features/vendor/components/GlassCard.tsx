import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        bg-white rounded-2xl p-6 border border-gray-200 shadow-sm
        ${hover ? 'hover:shadow-md hover:border-gray-300 transition-all cursor-pointer' : ''}
        ${gradient ? 'border-primary-lime/30' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactElement<LucideIcon>;
  color?: string;
  subtitle?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'from-primary-lime to-green-500',
  subtitle
}) => {
  const { t } = useTranslation();
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md`}>
            {React.cloneElement(icon as any, { className: 'w-5 h-5 text-white' })}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>

          {subtitle && (
            <div className="text-gray-400 text-sm">{subtitle}</div>
          )}

          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(change)}%
              </span>
              <span className="text-gray-400 text-xs">{t('admin.common.vsLastPeriod')}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions
}) => {
  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div>{children}</div>
    </GlassCard>
  );
};

interface QuickActionCardProps {
  icon: React.ReactElement<LucideIcon>;
  title: string;
  description: string;
  color?: string;
  onClick?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  color = 'from-primary-lime to-green-500',
  onClick
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl p-6 text-left w-full group relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
          {React.cloneElement(icon as any, { className: 'w-6 h-6 text-white' })}
        </div>
        <h4 className="text-gray-900 font-semibold mb-1">{title}</h4>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </motion.button>
  );
};

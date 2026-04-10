'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Bell,
  ShoppingBag,
  Package,
  DollarSign,
  TrendingUp,
  Store,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { MobileAppConfig } from './types';

interface VendorPanelPreviewProps {
  config: MobileAppConfig;
  device: 'iphone' | 'android';
  darkMode: boolean;
  activeScreen: string;
  onNavigate?: (screen: string) => void;
}

export function VendorPanelPreview({
  config,
  device,
  darkMode,
  activeScreen,
  onNavigate,
}: VendorPanelPreviewProps) {
  const { theme, navigation, appName } = config;
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sample Products Data
  const sampleProducts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 149.99,
      stock: 24,
      sales: 156,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      price: 399.99,
      stock: 12,
      sales: 89,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    },
    {
      id: 3,
      name: 'Leather Wallet',
      price: 49.99,
      stock: 45,
      sales: 234,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=100&h=100&fit=crop',
    },
  ];

  // Sample Orders Data
  const sampleOrders = [
    {
      id: '#ORD-2024-001',
      customer: 'John Smith',
      items: 2,
      total: 199.98,
      status: 'pending',
      time: '10 min ago',
    },
    {
      id: '#ORD-2024-002',
      customer: 'Sarah Johnson',
      items: 1,
      total: 149.99,
      status: 'processing',
      time: '25 min ago',
    },
    {
      id: '#ORD-2024-003',
      customer: 'Mike Wilson',
      items: 3,
      total: 599.97,
      status: 'completed',
      time: '1 hour ago',
    },
  ];

  // Get border radius based on theme
  const getBorderRadius = (size: 'none' | 'small' | 'medium' | 'large' | 'full' = 'medium') => {
    const radiusMap = {
      none: '0px',
      small: '0.375rem',
      medium: '0.75rem',
      large: '1rem',
      full: '9999px',
    };
    return radiusMap[size] || radiusMap.medium;
  };

  const borderRadius = getBorderRadius(theme.borderRadius as any);

  // Get font family from theme
  const fontFamily = theme.fontFamily || 'Inter, system-ui, sans-serif';

  // Get colors based on dark mode
  const colors = darkMode
    ? {
        bg: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: 'rgba(255,255,255,0.1)',
      }
    : {
        bg: theme.backgroundColor,
        surface: theme.surfaceColor,
        text: theme.textColor,
        textSecondary: theme.textSecondaryColor,
        border: 'rgba(0,0,0,0.1)',
      };

  // Device frame dimensions
  const frameStyles = device === 'iphone'
    ? {
        width: 375,
        height: 812,
        borderRadius: 48,
        notchWidth: 160,
        notchHeight: 34,
      }
    : {
        width: 360,
        height: 780,
        borderRadius: 24,
        notchWidth: 0,
        notchHeight: 0,
      };

  // Render Dashboard Screen
  const renderDashboard = () => {
    return (
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.bg }}>
        {/* Header */}
        <div
          className="px-4 pt-4 pb-6"
          style={{
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg"
              style={{ color: colors.text }}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: colors.text }}>
              Vendor Dashboard
            </h1>
            <button className="p-2 rounded-lg" style={{ color: colors.text }}>
              <Bell size={24} />
            </button>
          </div>

          {/* Shop Card */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
              borderRadius: borderRadius,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Store size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{appName || 'MyShop'}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    <span className="text-xs text-white/90">Verified</span>
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-white/20">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Total Products */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Total Products
                </span>
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme.primaryColor + '20' }}>
                  <Package size={20} style={{ color: theme.primaryColor }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {sampleProducts.length}
              </p>
            </div>

            {/* Total Orders */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Total Orders
                </span>
                <div className="p-2 rounded-lg" style={{ backgroundColor: theme.accentColor + '20' }}>
                  <ShoppingCart size={20} style={{ color: theme.accentColor }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {sampleOrders.length}
              </p>
            </div>

            {/* Revenue */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Total Revenue
                </span>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#10b981' + '20' }}>
                  <DollarSign size={20} style={{ color: '#10b981' }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                ${sampleOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
            </div>

            {/* Total Stock */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Total Stock
                </span>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#f59e0b' + '20' }}>
                  <TrendingUp size={20} style={{ color: '#f59e0b' }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                {sampleProducts.reduce((sum, product) => sum + product.stock, 0)}
              </p>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                Recent Orders
              </h3>
              <button className="text-sm" style={{ color: theme.primaryColor }}>
                See All
              </button>
            </div>

            <div className="space-y-2">
              {sampleOrders.map((order) => {
                const getStatusColor = (status: string) => {
                  if (status === 'pending') return '#f59e0b';
                  if (status === 'processing') return '#3b82f6';
                  if (status === 'completed') return '#10b981';
                  return colors.textSecondary;
                };

                const getStatusIcon = (status: string) => {
                  if (status === 'pending') return Clock;
                  if (status === 'processing') return Package;
                  if (status === 'completed') return CheckCircle;
                  return Clock;
                };

                const StatusIcon = getStatusIcon(order.status);

                return (
                  <div
                    key={order.id}
                    className="p-3 rounded-xl"
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: borderRadius,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-0.5" style={{ color: colors.text }}>
                          {order.id}
                        </p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {order.customer} • {order.items} items
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: getStatusColor(order.status) + '20' }}>
                        <StatusIcon size={12} style={{ color: getStatusColor(order.status) }} />
                        <span className="text-xs font-medium capitalize" style={{ color: getStatusColor(order.status) }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: colors.textSecondary }}>
                        {order.time}
                      </span>
                      <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products Section */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                Top Products
              </h3>
              <button className="text-sm" style={{ color: theme.primaryColor }}>
                See All
              </button>
            </div>

            <div className="space-y-2">
              {sampleProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="p-3 rounded-xl flex items-center gap-3"
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: borderRadius,
                  }}
                >
                  {/* Product Image Placeholder */}
                  <div
                    className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden"
                    style={{
                      borderRadius: borderRadius,
                      background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.secondaryColor}40)`,
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} style={{ color: theme.primaryColor }} />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-0.5 truncate text-sm" style={{ color: colors.text }}>
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        Stock: {product.stock}
                      </p>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>•</span>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        {product.sales} sales
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <p className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                    ${product.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Bottom Navigation
  const renderBottomNav = () => {
    if (navigation.type !== 'bottom-tabs') return null;

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'deliveries', label: 'Deliveries', icon: Truck },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
      <div
        className="border-t"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingBottom: device === 'iphone' ? '20px' : '8px',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-0 flex-1"
                style={{
                  color: isActive ? theme.primaryColor : colors.textSecondary,
                  backgroundColor: isActive ? theme.primaryColor + '15' : 'transparent',
                }}
              >
                <Icon size={20} />
                {navigation.showLabels && (
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Phone Frame */}
      <div
        className="relative mx-auto shadow-2xl"
        style={{
          width: `${frameStyles.width}px`,
          height: `${frameStyles.height}px`,
          borderRadius: `${frameStyles.borderRadius}px`,
          backgroundColor: '#1a1a1a',
          border: '8px solid #1a1a1a',
        }}
      >
        {/* Notch (iPhone only) */}
        {device === 'iphone' && (
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black"
            style={{
              width: `${frameStyles.notchWidth}px`,
              height: `${frameStyles.notchHeight}px`,
              borderRadius: '0 0 20px 20px',
              zIndex: 20,
            }}
          />
        )}

        {/* Screen */}
        <div
          className="relative w-full h-full overflow-hidden"
          style={{
            borderRadius: `${frameStyles.borderRadius - 8}px`,
            backgroundColor: colors.bg,
            fontFamily: fontFamily,
          }}
        >
          {/* Status Bar */}
          <div
            className="flex items-center justify-between px-6 h-12"
            style={{
              backgroundColor: colors.surface,
              paddingTop: device === 'iphone' ? '40px' : '8px',
              color: colors.text,
            }}
          >
            <span className="text-sm font-medium">5:02</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-current opacity-40 rounded-sm"></div>
                <div className="w-1 h-3 bg-current opacity-60 rounded-sm"></div>
                <div className="w-1 h-3 bg-current opacity-80 rounded-sm"></div>
                <div className="w-1 h-3 bg-current rounded-sm"></div>
              </div>
              <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor">
                <path d="M1 3a2 2 0 012-2h11a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V3z" opacity="0.4" />
                <path d="M18 4v4a1 1 0 001.447.894l.5-.25A1 1 0 0020 8V4a1 1 0 00-.553-.894l-.5-.25A1 1 0 0018 4z" />
              </svg>
              <div className="w-6 h-3 border border-current rounded-sm relative">
                <div className="absolute inset-0.5 bg-current rounded-sm" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col" style={{ height: 'calc(100% - 48px)' }}>
            {renderDashboard()}
            {renderBottomNav()}
          </div>

          {/* Drawer Overlay */}
          {drawerOpen && (
            <div
              className="absolute inset-0 bg-black/50 z-30"
              onClick={() => setDrawerOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

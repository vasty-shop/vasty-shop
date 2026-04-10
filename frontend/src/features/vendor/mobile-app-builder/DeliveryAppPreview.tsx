'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Truck,
  Navigation,
  Star,
  MapPin,
  Menu,
  RefreshCw,
  Clock,
  Bell,
  CheckCircle2,
  Inbox,
  Package,
  Image as ImageIcon,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  Settings,
  Shield,
  Globe,
  HelpCircle,
  LogOut,
  MessageCircle,
  Search,
  Calendar,
  Filter,
  Send,
  AlertCircle,
  Wallet,
  TrendingUp,
  Gift,
  Store,
  X,
  ShoppingBag,
  CircleDot,
  Check,
  Info,
} from 'lucide-react';
import type { MobileAppConfig } from './types';

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  brand?: string;
  rating?: number;
  stock?: number;
  description?: string;
}

interface ShopCategory {
  id: string;
  name: string;
  image?: string;
  productCount?: number;
}

interface ShopOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: any;
  createdAt: string;
  items?: any[];
}

interface DeliveryAppPreviewProps {
  screen: string;
  config: MobileAppConfig;
  colors: any;
  darkMode: boolean;
  borderRadius: string;
  onNavigate?: (screen: string) => void;
  onMenuClick?: () => void;
  // Shop data props
  shopProducts?: ShopProduct[];
  shopCategories?: ShopCategory[];
  shopName?: string;
  shopLogo?: string;
  shopOrders?: ShopOrder[];
}

export function DeliveryAppPreview({
  screen,
  config,
  colors,
  darkMode,
  borderRadius,
  onNavigate,
  onMenuClick,
  shopProducts = [],
  shopCategories = [],
  shopName,
  shopLogo,
  shopOrders = [],
}: DeliveryAppPreviewProps) {
  const { theme, appIcon, appName } = config;

  // Use shop data if available, otherwise use config values
  const displayShopName = shopName || appName || 'Delivery';
  const displayShopLogo = shopLogo || appIcon;

  // Always use demo data for preview (real data is used in downloaded app)
  const deliveries = [
    {
      id: 'FLX-2025-68451',
      customerName: 'John Smith',
      address: '123 Main St, Downtown',
      distance: '2.3',
      items: 2,
      amount: 45.99,
      status: 'picked_up',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      estimatedTime: '15 mins',
      phone: '+1 234-567-8900',
    },
    {
      id: 'FLX-2025-68452',
      customerName: 'Sarah Johnson',
      address: '456 Oak Avenue, Suburb',
      distance: '4.7',
      items: 1,
      amount: 89.99,
      status: 'on_way',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
      estimatedTime: '25 mins',
      phone: '+1 234-567-8901',
    },
    {
      id: 'FLX-2025-68453',
      customerName: 'Mike Brown',
      address: '789 Pine Road, Uptown',
      distance: '6.8',
      items: 3,
      amount: 125.50,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop',
      estimatedTime: '35 mins',
      phone: '+1 234-567-8902',
    },
  ];

  // Demo stats for preview
  const totalDeliveries = 156;
  const completedDeliveries = 142;
  const pendingDeliveries = 14;

  // Tab state for interactive tabs
  const [ordersTabIndex, setOrdersTabIndex] = useState(0); // Orders page tabs
  const [earningsDateTabIndex, setEarningsDateTabIndex] = useState(0); // Earnings date filter tabs

  switch (screen) {
    case 'dashboard':
      return (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: colors.bg }}>
            <button
              onClick={onMenuClick}
              className="p-1 transition-opacity hover:opacity-70"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Delivery Dashboard
            </h2>
            <RefreshCw className="w-6 h-6" style={{ color: colors.text }} />
          </div>

          <div className="px-4 space-y-4">
            {/* Welcome Card */}
            <div
              className="p-4"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
                borderRadius,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                {displayShopLogo && (
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm p-2 flex items-center justify-center">
                    <img src={displayShopLogo} alt="Shop Logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Welcome back, Md!
                  </h3>
                  <p className="text-sm text-white/80">
                    Here's what's happening with your deliveries today.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Today's Deliveries", value: '12', icon: Truck, color: '#FF9500' },
                { label: 'Active Orders', value: '3', icon: Clock, color: '#007AFF' },
                { label: 'Pending', value: '5', icon: Bell, color: '#AF52DE' },
                { label: 'Total Orders', value: '156', icon: CheckCircle2, color: '#34C759' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius }}
                >
                  <stat.icon className="w-8 h-8 mb-3" style={{ color: stat.color }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: '#3A0B3D' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Orders Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: '#3A0B3D' }}>
                  Pending Orders
                </h3>
                <button onClick={() => onNavigate?.('active-deliveries')} className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                  View All
                </button>
              </div>

              {/* Pending Order Cards */}
              <div className="space-y-3">
                {deliveries.filter(d => d.status === 'pending').slice(0, 2).map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-4"
                    style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {/* Order Status Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)' }}
                      >
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold" style={{ color: colors.text }}>#{delivery.id.split('-').pop()}</span>
                          <span
                            className="text-xs px-2 py-0.5 font-semibold"
                            style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderRadius: '8px' }}
                          >
                            Pending
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>{delivery.customerName}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: colors.textSecondary }}>
                          <MapPin className="w-3 h-3" />
                          <span>{delivery.distance} km away</span>
                          <span>•</span>
                          <span>{delivery.items} items</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: '#16A34A' }}>${delivery.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-2.5 text-sm font-semibold"
                        style={{ backgroundColor: colors.bg, color: '#DC2626', borderRadius: '10px', border: `1px solid ${colors.border}` }}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onNavigate?.('active-deliveries')}
                        className="flex-1 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#16A34A', borderRadius: '10px' }}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
                {deliveries.filter(d => d.status === 'pending').length === 0 && (
                  <div className="p-8 text-center" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
                    <Inbox className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textSecondary }} />
                    <p className="font-medium" style={{ color: colors.text }}>No Pending Orders</p>
                    <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>New orders will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 'active-deliveries':
      return (
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            Active Deliveries
          </h2>

          {/* Map Placeholder */}
          <div
            className="h-48 flex items-center justify-center"
            style={{ backgroundColor: colors.surface, borderRadius }}
          >
            <MapPin className="w-12 h-12" style={{ color: colors.textSecondary }} />
          </div>

          {/* Delivery List */}
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="p-4"
                style={{ backgroundColor: colors.surface, borderRadius }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={delivery.image}
                    alt="Product"
                    className="w-16 h-16 object-cover"
                    style={{ backgroundColor: colors.border, borderRadius }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
                      {delivery.id}
                    </div>
                    <div className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                      {delivery.customerName}
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                      <MapPin className="w-3 h-3" />
                      {delivery.distance} km • {delivery.estimatedTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold mb-2" style={{ color: theme.primaryColor }}>
                      ${delivery.amount.toFixed(2)}
                    </div>
                    <button
                      className="px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                      style={{ backgroundColor: theme.primaryColor, borderRadius }}
                    >
                      Navigate
                    </button>
                  </div>
                </div>
                <div
                  className="pt-3 flex items-center justify-between"
                  style={{ borderTop: `1px solid ${colors.border}` }}
                >
                  <span className="text-xs" style={{ color: colors.textSecondary }}>
                    {delivery.address}
                  </span>
                  <span
                    className="text-xs px-2 py-1"
                    style={{
                      backgroundColor: delivery.status === 'picked_up' ? '#E3F2FD' : delivery.status === 'on_way' ? '#FFF3E0' : '#F3E5F5',
                      color: delivery.status === 'picked_up' ? '#1976D2' : delivery.status === 'on_way' ? '#F57C00' : '#7B1FA2',
                      borderRadius: '9999px',
                    }}
                  >
                    {delivery.status === 'picked_up' ? 'Picked Up' : delivery.status === 'on_way' ? 'On the Way' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'earnings':
      // Period filter options
      const earningPeriods = ['Today', 'Week', 'Month', 'All'];
      // Sample earnings data
      const earningsData = {
        totalEarnings: 1245.50,
        availableBalance: 856.25,
        cashInHand: 125.00,
        periodEarnings: 245.50,
        periodDeliveries: 12,
        periodDeliveryFees: 208.68,
        periodTips: 36.82,
      };
      const earningsTransactions = [
        { id: 1, type: 'EARNING', description: 'Order #12345 completed', amount: 15.50, date: 'Today, 2:30 PM' },
        { id: 2, type: 'EARNING', description: 'Order #12344 completed', amount: 22.00, date: 'Today, 11:15 AM' },
        { id: 3, type: 'WITHDRAWAL', description: 'Bank Transfer', amount: -200.00, date: 'Yesterday' },
      ];
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <div
                className="flex-1 flex p-1"
                style={{ backgroundColor: colors.surface, borderRadius: '8px', border: `1px solid ${colors.border}` }}
              >
                {earningPeriods.map((period, idx) => (
                  <button
                    key={period}
                    className="flex-1 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: idx === 1 ? 'white' : 'transparent',
                      color: idx === 1 ? colors.text : colors.textSecondary,
                      borderRadius: '6px',
                      boxShadow: idx === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Earnings - Green Gradient */}
              <div
                className="p-4"
                style={{
                  background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                  borderRadius: '16px',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-green-100">Total Earnings</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">${earningsData.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-green-100 mt-1">Lifetime earnings</p>
              </div>

              {/* Available Balance */}
              <div
                className="p-4"
                style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs" style={{ color: colors.textSecondary }}>Available Balance</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                    <DollarSign className="w-4 h-4" style={{ color: '#EA580C' }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>${earningsData.availableBalance.toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: '#22C55E' }}>Ready to withdraw</p>
              </div>

              {/* Cash In Hand */}
              <div
                className="p-4"
                style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs" style={{ color: colors.textSecondary }}>Cash In Hand</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                    <Wallet className="w-4 h-4" style={{ color: '#2563EB' }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>${earningsData.cashInHand.toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>To be deposited</p>
              </div>

              {/* Period Earnings */}
              <div
                className="p-4"
                style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs" style={{ color: colors.textSecondary }}>This Week</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: '#9333EA' }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>${earningsData.periodEarnings.toFixed(2)}</p>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{earningsData.periodDeliveries} deliveries</p>
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              className="w-full py-3 flex items-center justify-center gap-2 text-white font-bold"
              style={{ backgroundColor: '#F97316', borderRadius: '12px' }}
            >
              <Wallet className="w-5 h-5" />
              Withdraw Funds
            </button>

            {/* Period Breakdown */}
            <div
              className="p-4"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <h4 className="text-base font-bold mb-4" style={{ color: colors.text }}>This Week Breakdown</h4>
              <div className="flex gap-3">
                {/* Delivery Fees */}
                <div className="flex-1 p-3 text-center" style={{ backgroundColor: colors.bg, borderRadius: '12px' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#DCFCE7' }}>
                    <Truck className="w-5 h-5" style={{ color: '#16A34A' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Delivery Fees</p>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>${earningsData.periodDeliveryFees.toFixed(2)}</p>
                </div>
                {/* Tips */}
                <div className="flex-1 p-3 text-center" style={{ backgroundColor: colors.bg, borderRadius: '12px' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#DBEAFE' }}>
                    <Gift className="w-5 h-5" style={{ color: '#2563EB' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Tips</p>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>${earningsData.periodTips.toFixed(2)}</p>
                </div>
                {/* Total */}
                <div className="flex-1 p-3 text-center" style={{ backgroundColor: '#FFF7ED', borderRadius: '12px' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#FFEDD5' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: '#EA580C' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>Total</p>
                  <p className="text-sm font-bold" style={{ color: '#EA580C' }}>${earningsData.periodEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <div className="p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h4 className="text-base font-bold" style={{ color: colors.text }}>Recent Transactions</h4>
              </div>
              {earningsTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textSecondary }} />
                  <p style={{ color: colors.textSecondary }}>No transactions yet</p>
                </div>
              ) : (
                earningsTransactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-4"
                    style={{ borderBottom: idx < earningsTransactions.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {tx.type === 'WITHDRAWAL' ? (
                        <TrendingUp className="w-5 h-5 rotate-45" style={{ color: '#DC2626' }} />
                      ) : (
                        <TrendingUp className="w-5 h-5 -rotate-45" style={{ color: '#22C55E' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>{tx.description}</p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-bold"
                        style={{ color: tx.amount >= 0 ? '#22C55E' : '#DC2626' }}
                      >
                        {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-0.5" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '12px' }}>
                        Completed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );

    case 'profile':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>Profile</h2>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Manage your account</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2" style={{ background: 'none', border: 'none' }}>
                <RefreshCw className="w-5 h-5" style={{ color: colors.text }} />
              </button>
              <button className="text-sm font-semibold" style={{ color: '#F97316', background: 'none', border: 'none' }}>
                Edit Profile
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Profile Header Card - Orange Gradient */}
            <div
              className="p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
                borderRadius: '16px',
              }}
            >
              {/* Avatar with Camera Icon */}
              <div className="relative inline-block mb-3">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <User className="w-12 h-12 text-white" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-lg"
                >
                  <ImageIcon className="w-4 h-4" style={{ color: '#F97316' }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{displayShopName} Driver</h3>
              <p className="text-sm text-white/80 mb-3">driver@{displayShopName?.toLowerCase().replace(/\s+/g, '')}.com</p>
              <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
                <Clock className="w-4 h-4" />
                <span>Member since 2024</span>
              </div>
            </div>

            {/* Personal Information Section */}
            <div
              className="p-4"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5" style={{ color: '#F97316' }} />
                <h4 className="text-base font-bold" style={{ color: colors.text }}>Personal Information</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>First Name</p>
                  <p className="text-sm" style={{ color: colors.text }}>Delivery</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Last Name</p>
                  <p className="text-sm" style={{ color: colors.text }}>Driver</p>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <p className="text-sm" style={{ color: colors.text }}>driver@{displayShopName?.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <p className="text-sm" style={{ color: colors.text }}>+1 234 567 8900</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Account Section */}
            <div
              className="p-4"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid #FEE2E2` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <LogOut className="w-5 h-5" style={{ color: '#DC2626' }} />
                <h4 className="text-base font-bold" style={{ color: '#DC2626' }}>Delete Account</h4>
              </div>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                className="px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: '#DC2626', borderRadius: '12px' }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      );

    case 'splash':
      return (
        <div
          className="h-full flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
          }}
        >
          {displayShopLogo ? (
            <img src={displayShopLogo} alt="Shop Logo" className="w-24 h-24 mb-4 object-contain" />
          ) : (
            <Truck className="w-24 h-24 mb-4 text-white" />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">{displayShopName}</h1>
          <p className="text-white/70 text-sm">Delivery Partner</p>
          <div className="mt-8">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      );

    case 'onboarding':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: theme.primaryColor + '20' }}
            >
              <Truck className="w-16 h-16" style={{ color: theme.primaryColor }} />
            </div>
            <h2 className="text-xl font-bold text-center mb-2" style={{ color: colors.text }}>
              Deliver & Earn
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: colors.textSecondary }}>
              Join our delivery network and start earning on your own schedule
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: i === 0 ? theme.primaryColor : colors.border }}
                />
              ))}
            </div>
          </div>
          <div className="p-6 space-y-3">
            <button
              className="w-full py-3 text-white font-medium"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              Get Started
            </button>
            <button
              className="w-full py-3 font-medium"
              style={{ backgroundColor: 'transparent', color: theme.primaryColor }}
            >
              I already have an account
            </button>
          </div>
        </div>
      );

    case 'login':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="p-4">
            <button
              onClick={() => onNavigate?.('onboarding')}
              className="p-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              Welcome Back
            </h1>
            <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
              Sign in to start delivering
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                  Email
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ backgroundColor: colors.surface, borderRadius }}
                >
                  <Mail className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  <span className="text-sm" style={{ color: colors.textSecondary }}>
                    Enter your email
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                  Password
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ backgroundColor: colors.surface, borderRadius }}
                >
                  <Lock className="w-5 h-5" style={{ color: colors.textSecondary }} />
                  <span className="flex-1 text-sm" style={{ color: colors.textSecondary }}>
                    Enter your password
                  </span>
                  <Eye className="w-5 h-5" style={{ color: colors.textSecondary }} />
                </div>
              </div>
              <button className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                Forgot Password?
              </button>
            </div>
          </div>
          <div className="p-6">
            <button
              className="w-full py-3 text-white font-medium"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              Sign In
            </button>
            <p className="text-center text-sm mt-4" style={{ color: colors.textSecondary }}>
              Don't have an account?{' '}
              <span className="font-medium" style={{ color: theme.primaryColor }}>
                Sign Up
              </span>
            </p>
          </div>
        </div>
      );

    case 'signup':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="p-4">
            <button
              onClick={() => onNavigate?.('login')}
              className="p-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              Become a Driver
            </h1>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              Join our delivery team and start earning
            </p>
            <div className="space-y-4">
              {[
                { label: 'Full Name', icon: User, placeholder: 'Enter your name' },
                { label: 'Email', icon: Mail, placeholder: 'Enter your email' },
                { label: 'Phone', icon: Phone, placeholder: 'Enter your phone' },
                { label: 'Password', icon: Lock, placeholder: 'Create a password' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    {field.label}
                  </label>
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius }}
                  >
                    <field.icon className="w-5 h-5" style={{ color: colors.textSecondary }} />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      {field.placeholder}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6">
            <button
              className="w-full py-3 text-white font-medium"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              Create Account
            </button>
          </div>
        </div>
      );

    case 'forgot-password':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="p-4">
            <button
              onClick={() => onNavigate?.('login')}
              className="p-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: theme.primaryColor + '20' }}
            >
              <Lock className="w-8 h-8" style={{ color: theme.primaryColor }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              Reset Password
            </h1>
            <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
              Enter your email and we'll send you a link to reset your password
            </p>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                Email
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: colors.surface, borderRadius }}
              >
                <Mail className="w-5 h-5" style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  Enter your email
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <button
              className="w-full py-3 text-white font-medium"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              Send Reset Link
            </button>
          </div>
        </div>
      );

    case 'available-orders':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Available Orders
            </h2>
            <Filter className="w-6 h-6" style={{ color: colors.text }} />
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="p-4"
                style={{ backgroundColor: colors.surface, borderRadius }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={delivery.image}
                    alt="Product"
                    className="w-16 h-16 object-cover"
                    style={{ backgroundColor: colors.border, borderRadius }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
                      {delivery.id}
                    </div>
                    <div className="flex items-center gap-1 text-xs mb-1" style={{ color: colors.textSecondary }}>
                      <MapPin className="w-3 h-3" />
                      {delivery.address}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: colors.textSecondary }}>
                        {delivery.distance} km
                      </span>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>
                        {delivery.items} items
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                    ${delivery.amount.toFixed(2)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 text-sm font-medium"
                    style={{ backgroundColor: colors.border, color: colors.text, borderRadius }}
                  >
                    Decline
                  </button>
                  <button
                    className="flex-1 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: theme.primaryColor, borderRadius }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'order-detail':
      const selectedDelivery = deliveries[0];
      // Status configuration matching Flutter
      const orderStatusConfig: Record<string, { bannerColor: string; icon: React.ElementType; text: string }> = {
        pending: { bannerColor: '#F97316', icon: Bell, text: 'New order waiting for acceptance' },
        accepted: { bannerColor: '#3B82F6', icon: CheckCircle2, text: 'Order accepted - Go to pickup location' },
        picked_up: { bannerColor: '#9333EA', icon: Package, text: 'Order picked up - Deliver to customer' },
        on_way: { bannerColor: '#4F46E5', icon: Truck, text: 'On the way to customer' },
        delivered: { bannerColor: '#16A34A', icon: CheckCircle2, text: 'Order delivered successfully' },
      };
      const currentStatus = orderStatusConfig[selectedDelivery.status] || orderStatusConfig.pending;
      const CurrentStatusIcon = currentStatus.icon;
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
          {/* AppBar */}
          <div className="flex items-center px-4 py-3" style={{ backgroundColor: 'white' }}>
            <button
              onClick={() => onNavigate?.('orders')}
              className="p-2 -ml-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-bold ml-2" style={{ color: colors.text }}>
              Order #{selectedDelivery.id.split('-').pop()}
            </h2>
          </div>

          {/* Status Banner */}
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{ backgroundColor: currentStatus.bannerColor }}
          >
            <CurrentStatusIcon className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">{currentStatus.text}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Customer Information */}
            <div className="bg-white mt-4 p-4">
              <h3 className="text-base font-bold mb-4" style={{ color: colors.text }}>Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" style={{ color: '#6B7280' }} />
                  <div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Name</p>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{selectedDelivery.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: '#6B7280' }} />
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: '#6B7280' }}>Phone</p>
                    <p className="text-sm font-medium" style={{ color: '#3B82F6' }}>+1 234-567-8900</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="bg-white mt-4 p-4">
              <h3 className="text-base font-bold mb-4" style={{ color: colors.text }}>Pickup Address</h3>
              <div
                className="flex items-start gap-4 p-4"
                style={{ border: `1px solid ${colors.border}`, borderRadius: '12px' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                  <Store className="w-6 h-6" style={{ color: '#3B82F6' }} />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold mb-1" style={{ color: colors.text }}>Fashion Store</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>123 Market Street, Downtown, City</p>
                </div>
                <button className="p-2">
                  <Navigation className="w-5 h-5" style={{ color: '#3B82F6' }} />
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white mt-4 p-4">
              <h3 className="text-base font-bold mb-4" style={{ color: colors.text }}>Delivery Address</h3>
              <div
                className="flex items-start gap-4 p-4"
                style={{ border: `1px solid ${colors.border}`, borderRadius: '12px' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                  <MapPin className="w-6 h-6" style={{ color: '#16A34A' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: '#6B7280' }}>{selectedDelivery.address}</p>
                </div>
                <button className="p-2">
                  <Navigation className="w-5 h-5" style={{ color: '#3B82F6' }} />
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white mt-4 p-4">
              <h3 className="text-base font-bold mb-4" style={{ color: colors.text }}>Order Items ({selectedDelivery.items})</h3>
              <div
                className="flex items-center gap-3 p-3"
                style={{ border: `1px solid ${colors.border}`, borderRadius: '8px' }}
              >
                <img
                  src={selectedDelivery.image}
                  alt="Product"
                  className="w-14 h-14 object-cover"
                  style={{ backgroundColor: colors.border, borderRadius: '8px' }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Premium Headphones</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Size: M • Color: Black</p>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: '#6B7280' }}>x1</p>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>${selectedDelivery.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white mt-4 p-4 mb-4">
              <h3 className="text-base font-bold mb-4" style={{ color: colors.text }}>Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#6B7280' }}>Subtotal</span>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>${selectedDelivery.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#6B7280' }}>Delivery Fee</span>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: '#16A34A' }}>Tip</span>
                  <span className="text-sm font-medium" style={{ color: '#16A34A' }}>$3.00</span>
                </div>
                <div className="h-px my-2" style={{ backgroundColor: colors.border }} />
                <div className="flex justify-between">
                  <span className="text-sm font-bold" style={{ color: colors.text }}>Your Earnings</span>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>$8.00</span>
                </div>
                <div
                  className="flex items-center justify-between px-3 py-2 mt-2"
                  style={{ backgroundColor: '#FEF3C7', borderRadius: '8px' }}
                >
                  <span className="text-sm" style={{ color: '#92400E' }}>Payment Status</span>
                  <span className="text-sm font-bold" style={{ color: '#B45309' }}>Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-white shadow-lg">
            {selectedDelivery.status === 'pending' ? (
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 font-semibold"
                  style={{ backgroundColor: 'white', color: '#DC2626', borderRadius: '12px', border: '1px solid #FCA5A5' }}
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
                <button
                  className="flex-[2] py-3.5 flex items-center justify-center gap-2 text-white font-semibold"
                  style={{ backgroundColor: '#16A34A', borderRadius: '12px' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Order
                </button>
              </div>
            ) : selectedDelivery.status === 'accepted' ? (
              <button
                className="w-full py-3.5 flex items-center justify-center gap-2 text-white font-semibold"
                style={{ backgroundColor: '#9333EA', borderRadius: '12px' }}
              >
                <Package className="w-5 h-5" />
                Mark as Picked Up
              </button>
            ) : selectedDelivery.status === 'picked_up' ? (
              <button
                className="w-full py-3.5 flex items-center justify-center gap-2 text-white font-semibold"
                style={{ backgroundColor: '#4F46E5', borderRadius: '12px' }}
              >
                <Navigation className="w-5 h-5" />
                Mark On The Way
              </button>
            ) : selectedDelivery.status === 'on_way' ? (
              <button
                className="w-full py-3.5 flex items-center justify-center gap-2 text-white font-semibold"
                style={{ backgroundColor: '#16A34A', borderRadius: '12px' }}
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark as Delivered
              </button>
            ) : null}
          </div>
        </div>
      );

    case 'earnings-history':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Earnings History
            </h2>
            <Calendar className="w-6 h-6" style={{ color: colors.text }} />
          </div>
          <div className="p-4" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: colors.textSecondary }}>This Month</span>
              <span className="font-bold text-xl" style={{ color: theme.primaryColor }}>$1,245.50</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span style={{ color: colors.textSecondary }}>45 deliveries</span>
              <span style={{ color: colors.textSecondary }}>142 km</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {[
              { date: 'Today', deliveries: 8, amount: 145.50 },
              { date: 'Yesterday', deliveries: 6, amount: 112.00 },
              { date: 'Jan 9', deliveries: 9, amount: 178.25 },
              { date: 'Jan 8', deliveries: 5, amount: 89.99 },
              { date: 'Jan 7', deliveries: 7, amount: 134.00 },
            ].map((day, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4"
                style={{ backgroundColor: colors.surface, borderRadius }}
              >
                <div>
                  <p className="font-medium" style={{ color: colors.text }}>{day.date}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {day.deliveries} deliveries
                  </p>
                </div>
                <span className="font-bold" style={{ color: theme.primaryColor }}>
                  ${day.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'account-settings':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Account Settings
            </h2>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {[
              { icon: User, label: 'Personal Information', desc: 'Name, email, phone' },
              { icon: Lock, label: 'Password & Security', desc: 'Change password, 2FA' },
              { icon: Truck, label: 'Vehicle Information', desc: 'Vehicle type, license' },
              { icon: Bell, label: 'Notifications', desc: 'Push, email, SMS' },
              { icon: Globe, label: 'Language', desc: 'English' },
              { icon: Shield, label: 'Privacy', desc: 'Data and permissions' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4"
                style={{ backgroundColor: colors.surface, borderRadius }}
              >
                <item.icon className="w-6 h-6" style={{ color: theme.primaryColor }} />
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.text }}>{item.label}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </div>
            ))}
            <button
              className="flex items-center gap-3 w-full p-4 mt-4"
              style={{ backgroundColor: '#FFEBEE', borderRadius }}
            >
              <LogOut className="w-6 h-6" style={{ color: '#F44336' }} />
              <span className="font-medium" style={{ color: '#F44336' }}>Log Out</span>
            </button>
          </div>
        </div>
      );

    case 'notifications':
      // Stats for notifications page
      const notifStats = [
        { icon: Bell, label: 'Total Activity', value: '24', gradientFrom: '#FB923C', gradientTo: '#EA580C' },
        { icon: Mail, label: 'Unread', value: '8', gradientFrom: '#F87171', gradientTo: '#DC2626' },
        { icon: Truck, label: 'Deliveries', value: '12', gradientFrom: '#60A5FA', gradientTo: '#2563EB' },
        { icon: CheckCircle2, label: 'Completed', value: '4', gradientFrom: '#4ADE80', gradientTo: '#16A34A' },
      ];
      const notifFilters = ['All', 'Unread', 'Read'];
      const notifications = [
        { type: 'order', title: 'New Order Available', desc: 'Order #12345 is ready for pickup', time: '2 min ago', unread: true },
        { type: 'earning', title: 'Payment Received', desc: '$45.50 has been added to your wallet', time: '1 hour ago', unread: true },
        { type: 'system', title: 'Document Expiring', desc: 'Your license expires in 30 days', time: '3 hours ago', unread: false },
        { type: 'order', title: 'Delivery Completed', desc: 'Order #12344 delivered successfully', time: 'Yesterday', unread: false },
      ];
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Notifications
            </h2>
            <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>Mark All Read</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {notifStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>{stat.label}</p>
                    <p className="text-2xl font-bold" style={{ color: colors.text }}>{stat.value}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${stat.gradientFrom} 0%, ${stat.gradientTo} 100%)` }}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {notifFilters.map((filter, idx) => (
                <button
                  key={filter}
                  className="px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: idx === 0 ? '#F97316' : colors.surface,
                    color: idx === 0 ? 'white' : colors.text,
                    borderRadius: '10px',
                    border: idx === 0 ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}>
              {notifications.map((notif, idx) => {
                const iconColor = notif.type === 'order' ? '#3B82F6' : notif.type === 'earning' ? '#22C55E' : '#F97316';
                const NotifIcon = notif.type === 'order' ? Truck : notif.type === 'earning' ? DollarSign : AlertCircle;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4"
                    style={{
                      backgroundColor: notif.unread ? theme.primaryColor + '08' : 'transparent',
                      borderBottom: idx < notifications.length - 1 ? `1px solid ${colors.border}` : 'none',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconColor + '15' }}
                    >
                      <NotifIcon className="w-5 h-5" style={{ color: iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium flex-1" style={{ color: colors.text, fontWeight: notif.unread ? 600 : 400 }}>
                          {notif.title}
                        </p>
                        {notif.unread && (
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: theme.primaryColor }} />
                        )}
                      </div>
                      <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{notif.desc}</p>
                      <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>{notif.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );

    case 'chat':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Messages
            </h2>
            <Search className="w-6 h-6" style={{ color: colors.text }} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {[
              { name: 'John Smith', message: 'I\'m waiting at the lobby', time: '2 min', unread: 2, order: '#12345' },
              { name: 'Sarah Johnson', message: 'Thanks for the delivery!', time: '1 hour', unread: 0, order: '#12344' },
              { name: 'Support Team', message: 'Your documents have been verified', time: 'Yesterday', unread: 1, order: '' },
            ].map((chat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <span className="text-white font-medium">{chat.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium" style={{ color: colors.text }}>{chat.name}</p>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>{chat.time}</span>
                  </div>
                  {chat.order && (
                    <p className="text-xs" style={{ color: theme.primaryColor }}>Order {chat.order}</p>
                  )}
                  <p
                    className="text-sm truncate"
                    style={{ color: chat.unread ? colors.text : colors.textSecondary }}
                  >
                    {chat.message}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Settings</h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <RefreshCw className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Order Settings Section */}
            <div
              className="overflow-hidden"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 p-4">
                <Settings className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h4 className="text-base font-bold" style={{ color: colors.text }}>Order Settings</h4>
              </div>
              {/* Auto Accept Orders */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Auto Accept Orders</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Automatically accept new orders</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative"
                  style={{ backgroundColor: colors.border }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 left-0.5 shadow"
                  />
                </div>
              </div>
              {/* Max Concurrent Orders */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Max Concurrent Orders</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Maximum orders at once</p>
                </div>
                <div
                  className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
                  style={{ backgroundColor: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}
                >
                  <span style={{ color: colors.text }}>3</span>
                  <ChevronRight className="w-4 h-4 rotate-90" style={{ color: colors.textSecondary }} />
                </div>
              </div>
            </div>

            {/* Notification Settings Section */}
            <div
              className="overflow-hidden"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 p-4">
                <Bell className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h4 className="text-base font-bold" style={{ color: colors.text }}>Notification Settings</h4>
              </div>
              {/* Push Notifications */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Push Notifications</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Receive push notifications</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow"
                  />
                </div>
              </div>
              {/* Sound */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Sound</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Play sound for notifications</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow"
                  />
                </div>
              </div>
              {/* Vibration */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Vibration</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Vibrate for notifications</p>
                </div>
                <div
                  className="w-11 h-6 rounded-full relative"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow"
                  />
                </div>
              </div>
            </div>

            {/* Working Hours Section */}
            <div
              className="overflow-hidden"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 p-4">
                <Clock className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h4 className="text-base font-bold" style={{ color: colors.text }}>Working Hours</h4>
              </div>
              {/* Start Time */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Start Time</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>09:00</p>
                </div>
                <Clock className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </div>
              {/* End Time */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>End Time</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>21:00</p>
                </div>
                <Clock className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </div>
            </div>

            {/* Language Section */}
            <div
              className="overflow-hidden"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 p-4">
                <Globe className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h4 className="text-base font-bold" style={{ color: colors.text }}>Language</h4>
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Select Language</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>English</p>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </div>
            </div>

            {/* Logout Button */}
            <div
              className="flex items-center gap-3 p-4"
              style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid #FEE2E2` }}
            >
              <LogOut className="w-5 h-5" style={{ color: '#DC2626' }} />
              <span className="text-sm font-semibold" style={{ color: '#DC2626' }}>Log Out</span>
              <div className="flex-1" />
              <ChevronRight className="w-5 h-5" style={{ color: '#DC2626' }} />
            </div>
          </div>
        </div>
      );

    case 'delivery-history':
      // Sample history data
      const historyStats = {
        totalDeliveries: 156,
        completed: 142,
        cancelled: 14,
        totalEarned: 2845.50,
      };
      const historyDateFilters = ['All', 'Today', 'Week', 'Month'];
      const historyOrders = [
        { id: '12345', status: 'delivered', customer: 'John Smith', phone: '+1 234-567-8900', date: 'Jan 10, 2025', time: '2:30 PM', deliveryFee: 12.50, tip: 5.00, items: 3, distance: '2.3 km' },
        { id: '12344', status: 'delivered', customer: 'Sarah Johnson', phone: '+1 234-567-8901', date: 'Jan 10, 2025', time: '11:15 AM', deliveryFee: 15.00, tip: 3.50, items: 2, distance: '4.7 km' },
        { id: '12343', status: 'cancelled', customer: 'Mike Brown', phone: '+1 234-567-8902', date: 'Jan 9, 2025', time: '5:45 PM', deliveryFee: 18.00, tip: 0, items: 5, distance: '6.8 km' },
      ];
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Stats Summary - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Deliveries */}
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Total Deliveries</p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>{historyStats.totalDeliveries}</p>
              </div>
              {/* Completed */}
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Completed</p>
                <p className="text-2xl font-bold" style={{ color: '#16A34A' }}>{historyStats.completed}</p>
              </div>
              {/* Cancelled */}
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Cancelled</p>
                <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>{historyStats.cancelled}</p>
              </div>
              {/* Total Earned */}
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Total Earned</p>
                <p className="text-2xl font-bold" style={{ color: '#16A34A' }}>${historyStats.totalEarned.toFixed(2)}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Search orders, customers...</span>
            </div>

            {/* Date Filter Tabs */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <div
                className="flex-1 flex p-1"
                style={{ backgroundColor: colors.surface, borderRadius: '8px', border: `1px solid ${colors.border}` }}
              >
                {historyDateFilters.map((filter, idx) => {
                  const isActive = idx === earningsDateTabIndex;
                  return (
                    <button
                      key={filter}
                      onClick={() => setEarningsDateTabIndex(idx)}
                      className="flex-1 py-2 text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isActive ? 'white' : 'transparent',
                        color: isActive ? colors.text : colors.textSecondary,
                        borderRadius: '6px',
                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History Cards */}
            {historyOrders.map((order) => {
              const isDelivered = order.status === 'delivered';
              const totalEarned = order.deliveryFee + order.tip;
              return (
                <div
                  key={order.id}
                  style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}
                >
                  <div className="p-4">
                    {/* Top Row */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Status Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background: isDelivered
                            ? 'linear-gradient(135deg, #4ADE80 0%, #16A34A 100%)'
                            : 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
                        }}
                      >
                        {isDelivered ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <X className="w-5 h-5 text-white" />
                        )}
                      </div>
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold" style={{ color: colors.text }}>#{order.id}</span>
                          <span
                            className="text-xs px-2 py-0.5 font-semibold"
                            style={{
                              backgroundColor: isDelivered ? '#DCFCE7' : '#FEE2E2',
                              color: isDelivered ? '#16A34A' : '#DC2626',
                              borderRadius: '6px',
                            }}
                          >
                            {isDelivered ? 'Delivered' : 'Cancelled'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                          <Calendar className="w-3 h-3" />
                          <span>{order.date}</span>
                          <Clock className="w-3 h-3" />
                          <span>{order.time}</span>
                        </div>
                      </div>
                      {/* Earnings */}
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: '#16A34A' }}>${totalEarned.toFixed(2)}</p>
                        {order.tip > 0 && (
                          <span className="text-xs px-1.5 py-0.5" style={{ backgroundColor: '#FEF3C7', color: '#B45309', borderRadius: '4px' }}>
                            <Star className="w-2.5 h-2.5 inline mr-0.5" />+${order.tip.toFixed(2)} tip
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="h-px mb-3" style={{ backgroundColor: colors.border }} />
                    {/* Bottom Row */}
                    <div className="flex items-center justify-between">
                      {/* Customer Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                          <User className="w-4 h-4" style={{ color: '#2563EB' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: colors.text }}>{order.customer}</p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>{order.phone}</p>
                        </div>
                      </div>
                      {/* Items & Distance */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1" style={{ backgroundColor: colors.bg, color: colors.textSecondary, borderRadius: '6px' }}>
                          <ShoppingBag className="w-3 h-3 inline mr-1" />{order.items} items
                        </span>
                        <span className="text-xs px-2 py-1" style={{ backgroundColor: colors.bg, color: colors.textSecondary, borderRadius: '6px' }}>
                          <Navigation className="w-3 h-3 inline mr-1" />{order.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Expand Button */}
                  <div className="flex items-center justify-center py-2.5" style={{ backgroundColor: colors.bg }}>
                    <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>Show Details</span>
                    <ChevronDown className="w-4 h-4 ml-1" style={{ color: colors.textSecondary }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'reviews':
      // Sample reviews data
      const reviewsData = {
        averageRating: 4.8,
        totalReviews: 124,
        fiveStarCount: 98,
        ratingCounts: { 5: 98, 4: 18, 3: 5, 2: 2, 1: 1 },
      };
      const recentReviews = [
        { id: 1, customer: 'John Smith', rating: 5, orderNumber: '12345', comment: 'Excellent service! Very fast delivery and friendly driver.', date: 'Jan 10, 2025' },
        { id: 2, customer: 'Sarah Johnson', rating: 5, orderNumber: '12344', comment: 'Great experience, will order again!', date: 'Jan 9, 2025' },
        { id: 3, customer: 'Mike Brown', rating: 4, orderNumber: '12343', comment: 'Good delivery, package was in perfect condition.', date: 'Jan 8, 2025' },
      ];
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>My Reviews</h2>
              <p className="text-xs" style={{ color: colors.textSecondary }}>See what customers say about you</p>
            </div>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <RefreshCw className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Stats Section */}
            {/* Average Rating - Full Width Gradient */}
            <div
              className="p-5"
              style={{
                background: 'linear-gradient(135deg, #EAB308 0%, #F97316 100%)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-100 mb-2">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-white">{reviewsData.averageRating.toFixed(1)}</span>
                    <Star className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Reviews & 5 Star Reviews */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Total Reviews</p>
                    <p className="text-2xl font-bold" style={{ color: colors.text }}>{reviewsData.totalReviews}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                    <MessageCircle className="w-6 h-6" style={{ color: '#2563EB' }} />
                  </div>
                </div>
              </div>
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>5 Star Reviews</p>
                    <p className="text-2xl font-bold" style={{ color: colors.text }}>{reviewsData.fiveStarCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                    <TrendingUp className="w-6 h-6" style={{ color: '#16A34A' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="p-5" style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h4 className="text-base font-semibold mb-4" style={{ color: colors.text }}>Rating Distribution</h4>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewsData.ratingCounts[star as keyof typeof reviewsData.ratingCounts] || 0;
                  const percentage = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="w-12 flex items-center gap-1">
                        <span className="text-sm font-medium" style={{ color: colors.text }}>{star}</span>
                        <Star className="w-4 h-4" style={{ color: '#F59E0B' }} />
                      </div>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.bg }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: '#F59E0B' }}
                        />
                      </div>
                      <span className="w-8 text-sm text-right" style={{ color: colors.textSecondary }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews */}
            <div style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <div className="p-5" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h4 className="text-base font-semibold" style={{ color: colors.text }}>Recent Reviews</h4>
              </div>
              {recentReviews.map((review, idx) => (
                <div
                  key={review.id}
                  className="p-5"
                  style={{ borderBottom: idx < recentReviews.length - 1 ? `1px solid ${colors.border}` : 'none' }}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF7ED' }}>
                      <User className="w-5 h-5" style={{ color: '#EA580C' }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>{review.customer}</span>
                        {/* Stars */}
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              style={{ color: i <= review.rating ? '#F59E0B' : colors.border }}
                              fill={i <= review.rating ? '#F59E0B' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>Order #{review.orderNumber}</p>
                      <p className="text-sm" style={{ color: colors.text, lineHeight: 1.5 }}>{review.comment}</p>
                    </div>
                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{review.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'zones':
      // Sample zone data
      const zoneData = {
        name: 'Downtown Zone',
        description: 'Central business district area',
        radius: 5,
        isActive: true,
      };
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: colors.surface }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>My Zone</h2>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Your assigned delivery area</p>
            </div>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <RefreshCw className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Assigned Zone Card */}
            <div style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              {/* Header */}
              <div className="p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold" style={{ color: colors.text }}>Assigned Zone</span>
                  <span
                    className="text-xs px-2 py-1 font-semibold"
                    style={{ backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '12px' }}
                  >
                    Active
                  </span>
                </div>
              </div>
              {/* Zone Content */}
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Zone Icon */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                    <MapPin className="w-7 h-7" style={{ color: '#16A34A' }} />
                  </div>
                  {/* Zone Info */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-1" style={{ color: colors.text }}>{zoneData.name}</h4>
                    <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>{zoneData.description}</p>
                    <div className="flex items-center gap-1">
                      <CircleDot className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="text-sm" style={{ color: colors.textSecondary }}>{zoneData.radius} km coverage radius</span>
                    </div>
                  </div>
                  {/* Check Icon */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                    <CheckCircle2 className="w-6 h-6" style={{ color: '#16A34A' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-5" style={{ backgroundColor: '#EFF6FF', borderRadius: '16px', border: `1px solid #BFDBFE` }}>
              <h4 className="text-base font-semibold mb-3" style={{ color: '#1E40AF' }}>About Your Zone</h4>
              <div className="space-y-3">
                {[
                  'You will receive orders only from within your zone',
                  'Your zone is assigned by the vendor',
                  'Contact your vendor to request zone changes',
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" style={{ color: '#2563EB' }} />
                    <span className="text-sm" style={{ color: '#1E40AF' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'orders':
      // Orders page with tabs
      const orderTabs = ['All', 'Active', 'Completed'];
      const allOrders = [
        { id: '68453', status: 'pending', customer: 'Mike Brown', address: '789 Pine Road, Uptown', amount: 125.50, items: 3, distance: '6.8 km', time: '5 mins ago' },
        { id: '68452', status: 'on_way', customer: 'Sarah Johnson', address: '456 Oak Avenue, Suburb', amount: 89.99, items: 1, distance: '4.7 km', time: '15 mins ago' },
        { id: '68451', status: 'picked_up', customer: 'John Smith', address: '123 Main St, Downtown', amount: 45.99, items: 2, distance: '2.3 km', time: '25 mins ago' },
        { id: '68450', status: 'delivered', customer: 'Emily Davis', address: '321 Elm Street, Midtown', amount: 67.25, items: 4, distance: '3.5 km', time: '1 hour ago' },
        { id: '68449', status: 'delivered', customer: 'Tom Wilson', address: '555 Cedar Lane, Westside', amount: 112.00, items: 2, distance: '5.2 km', time: '2 hours ago' },
      ];
      // Filter orders: 0=All, 1=Active (pending, picked_up, on_way), 2=Completed (delivered)
      const activeStatuses = ['pending', 'picked_up', 'on_way'];
      const filteredDeliveryOrders = ordersTabIndex === 0
        ? allOrders
        : ordersTabIndex === 1
          ? allOrders.filter(o => activeStatuses.includes(o.status))
          : allOrders.filter(o => o.status === 'delivered');
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: colors.surface }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>My Orders</h2>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Manage your deliveries</p>
            </div>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <RefreshCw className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Search Bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Search orders...</span>
            </div>

            {/* Segmented Tabs */}
            <div
              className="flex p-1"
              style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
            >
              {orderTabs.map((tab, idx) => {
                const isActive = idx === ordersTabIndex;
                return (
                  <button
                    key={tab}
                    onClick={() => setOrdersTabIndex(idx)}
                    className="flex-1 py-2.5 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? theme.primaryColor : 'transparent',
                      color: isActive ? 'white' : colors.textSecondary,
                      borderRadius: '10px',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Orders List */}
            {filteredDeliveryOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 mb-4" style={{ color: colors.border }} />
                <p className="text-sm font-medium" style={{ color: colors.text }}>No orders found</p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>No {orderTabs[ordersTabIndex].toLowerCase()} orders</p>
              </div>
            ) : filteredDeliveryOrders.map((order) => {
              const statusConfig: Record<string, { bg: string; color: string; text: string; icon: React.ElementType }> = {
                pending: { bg: '#FFF7ED', color: '#EA580C', text: 'Pending', icon: Bell },
                picked_up: { bg: '#F3E8FF', color: '#9333EA', text: 'Picked Up', icon: Package },
                on_way: { bg: '#EFF6FF', color: '#2563EB', text: 'On The Way', icon: Truck },
                delivered: { bg: '#DCFCE7', color: '#16A34A', text: 'Delivered', icon: CheckCircle2 },
              };
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <div
                  key={order.id}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: config.bg }}
                    >
                      <StatusIcon className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold" style={{ color: colors.text }}>#{order.id}</span>
                        <span
                          className="text-xs px-2 py-0.5 font-semibold"
                          style={{ backgroundColor: config.bg, color: config.color, borderRadius: '8px' }}
                        >
                          {config.text}
                        </span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: colors.text }}>{order.customer}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: colors.textSecondary }}>
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{order.address}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: colors.textSecondary }}>
                        <span><ShoppingBag className="w-3 h-3 inline mr-1" />{order.items} items</span>
                        <span><Navigation className="w-3 h-3 inline mr-1" />{order.distance}</span>
                        <span><Clock className="w-3 h-3 inline mr-1" />{order.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: '#16A34A' }}>${order.amount.toFixed(2)}</p>
                      <ChevronRight className="w-5 h-5 mt-1" style={{ color: colors.textSecondary }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <span style={{ color: colors.textSecondary }}>Screen: {screen}</span>
        </div>
      );
  }
}

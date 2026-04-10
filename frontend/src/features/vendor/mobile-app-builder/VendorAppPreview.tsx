'use client';

import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  DollarSign,
  Package,
  Store,
  Clock,
  Menu,
  Bell,
  CheckCircle,
  Edit2,
  ShoppingCart,
  Archive,
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  MoreVertical,
  Star,
  ChevronLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Upload,
  Camera,
  Plus,
  Minus,
  Truck,
  Users,
  Settings,
  BarChart2,
  TrendingUp,
  Tag,
  MessageCircle,
  Wallet,
  CreditCard,
  FileText,
  Shield,
  HelpCircle,
  LogOut,
  Globe,
  Moon,
  Calendar,
  Filter,
  Send,
  Percent,
  Gift,
  AlertCircle,
  X,
  Navigation,
  Copy,
  MessageSquare,
  Award,
  ThumbsUp,
  QrCode,
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

interface VendorAppPreviewProps {
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

// Dummy product data with placeholder images and status
const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 89.99,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'Electronics',
    status: 'active'
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    price: 199.99,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'Electronics',
    status: 'active'
  },
  {
    id: 3,
    name: 'USB-C Cable 2m',
    price: 12.99,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop',
    category: 'Accessories',
    status: 'draft'
  },
  {
    id: 4,
    name: 'Laptop Stand',
    price: 45.00,
    stock: 38,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    category: 'Office',
    status: 'active'
  },
  {
    id: 5,
    name: 'Mechanical Keyboard',
    price: 129.99,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    category: 'Electronics',
    status: 'draft'
  },
];

export function VendorAppPreview({
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
}: VendorAppPreviewProps) {
  const { theme, appName, appIcon } = config;

  // Always use demo data for preview (real data is used in downloaded app)
  const products = DUMMY_PRODUCTS;

  // Demo orders for preview
  const demoOrders = [
    { id: '1', orderNumber: 'ORD-2025-001', status: 'shipped', total: 149.99, itemCount: 3, customerName: 'John Smith', customerEmail: 'john@email.com', createdAt: new Date().toISOString() },
    { id: '2', orderNumber: 'ORD-2025-002', status: 'pending', total: 89.50, itemCount: 2, customerName: 'Sarah Johnson', customerEmail: 'sarah@email.com', createdAt: new Date().toISOString() },
    { id: '3', orderNumber: 'ORD-2025-003', status: 'delivered', total: 199.99, itemCount: 1, customerName: 'Mike Brown', customerEmail: 'mike@email.com', createdAt: new Date().toISOString() },
  ];
  const orders = demoOrders;

  // Demo stats for preview
  const totalProducts = 156;
  const totalOrders = 48;
  const totalStock = 1250;
  const stockValue = 12800;

  const displayShopName = shopName || appName || 'MyShop';
  const displayShopLogo = shopLogo || appIcon;

  // Tab state for interactive tabs
  const [productsTabIndex, setProductsTabIndex] = useState(0); // Products page filter tabs
  const [ordersTabIndex, setOrdersTabIndex] = useState(0); // Orders page filter tabs
  const [deliveryTabIndex, setDeliveryTabIndex] = useState(0); // Delivery settings tabs
  const [settingsTabIndex, setSettingsTabIndex] = useState(0); // Settings page tabs

  // Form modal states for delivery tabs
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [showAddTrackingForm, setShowAddTrackingForm] = useState(false);

  // Filter products based on tab selection: 0=All, 1=Active, 2=Draft
  const productTabFilters = ['all', 'active', 'draft'];
  const filteredProducts = productsTabIndex === 0
    ? products
    : products.filter(p => p.status === productTabFilters[productsTabIndex]);

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
              Vendor Dashboard
            </h2>
            <Bell className="w-6 h-6" style={{ color: colors.text }} />
          </div>

          <div className="px-4 space-y-4">
            {/* Shop Card */}
            <div
              className="p-4 flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
                borderRadius,
              }}
            >
              <div className="flex items-center gap-3">
                {displayShopLogo ? (
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm p-2 flex items-center justify-center">
                    <img src={displayShopLogo} alt="Shop Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <Store className="w-12 h-12 text-white" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {displayShopName}
                  </h3>
                  <div
                    className="flex items-center gap-1 mt-1 px-3 py-1 bg-white/20 w-fit"
                    style={{ borderRadius: '9999px' }}
                  >
                    <CheckCircle className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">Verified</span>
                  </div>
                </div>
              </div>
              <Edit2 className="w-5 h-5 text-white" />
            </div>

            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Products', value: String(totalProducts), icon: Archive, color: '#007AFF' },
                { label: 'Total Orders', value: String(totalOrders), icon: ShoppingCart, color: '#34C759' },
                { label: 'Stock Value', value: `$${stockValue.toLocaleString()}`, icon: DollarSign, color: '#AF52DE' },
                { label: 'Total Stock', value: String(totalStock), icon: Package, color: '#FF9500' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      {stat.label}
                    </span>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="text-3xl font-bold" style={{ color: '#3A0B3D' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: '#3A0B3D' }}>
                  Recent Orders
                </h3>
                <button onClick={() => onNavigate?.('orders')} className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                  See All
                </button>
              </div>

              {/* Order Cards */}
              {orders.length > 0 ? (
                orders.slice(0, 2).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onNavigate?.('order-detail')}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:opacity-80 transition-opacity mb-2"
                    style={{ backgroundColor: colors.surface, borderRadius }}
                  >
                    <div
                      className="w-16 h-16 flex items-center justify-center"
                      style={{ backgroundColor: '#F3E5F5', borderRadius }}
                    >
                      <ShoppingBag className="w-8 h-8" style={{ color: '#9C27B0' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: '#3A0B3D' }}>
                        Order #{order.orderNumber}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: order.status === 'delivered' ? '#D1FAE5' : order.status === 'shipped' ? '#E1BEE7' : '#FEF3C7',
                            color: order.status === 'delivered' ? '#059669' : order.status === 'shipped' ? '#9C27B0' : '#D97706',
                            borderRadius
                          }}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>
                          {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex flex-col items-center justify-center p-6"
                  style={{ backgroundColor: colors.surface, borderRadius }}
                >
                  <ShoppingBag className="w-12 h-12 mb-2" style={{ color: colors.textSecondary }} />
                  <p className="text-sm" style={{ color: colors.textSecondary }}>No orders yet</p>
                </div>
              )}
            </div>

            {/* Top Products Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: '#3A0B3D' }}>
                  Top Products
                </h3>
                <button onClick={() => onNavigate?.('products')} className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                  See All
                </button>
              </div>

              {/* Product Cards */}
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: colors.surface, borderRadius }}
                    onClick={() => onNavigate?.('product-detail')}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover"
                      style={{ backgroundColor: colors.border, borderRadius }}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-1" style={{ color: '#3A0B3D' }}>
                        {product.name}
                      </h4>
                      <div className="text-base font-bold" style={{ color: theme.primaryColor }}>
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        Stock
                      </div>
                      <div className="text-xl font-bold" style={{ color: '#3A0B3D' }}>
                        {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'products':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Products
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Search Bar with Filter */}
            <div className="flex gap-2">
              <div
                className="flex-1 flex items-center gap-3 px-4 py-2.5"
                style={{ backgroundColor: colors.surface, borderRadius: '12px' }}
              >
                <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
                <span className="text-sm flex-1" style={{ color: colors.textSecondary }}>
                  Search products...
                </span>
                <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </div>
              <button
                className="p-2.5"
                style={{ backgroundColor: colors.surface, borderRadius: '12px' }}
              >
                <Filter className="w-5 h-5" style={{ color: theme.primaryColor }} />
              </button>
            </div>

            {/* Product Count */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                {products.length} products
              </span>
              <div className="flex gap-2">
                {['All', 'Active', 'Draft'].map((tab, idx) => {
                  const isActive = idx === productsTabIndex;
                  return (
                    <button
                      key={tab}
                      onClick={() => setProductsTabIndex(idx)}
                      className="px-3 py-1 text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isActive ? theme.primaryColor : 'transparent',
                        color: isActive ? 'white' : colors.textSecondary,
                        borderRadius: '16px',
                        border: isActive ? 'none' : `1px solid ${colors.border}`,
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 mb-4" style={{ color: colors.border }} />
                  <p className="text-sm font-medium" style={{ color: colors.text }}>No products found</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>No {productTabFilters[productsTabIndex]} products</p>
                </div>
              ) : filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  onClick={() => onNavigate?.('product-detail')}
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div
                      className="w-[100px] h-[100px] flex-shrink-0 overflow-hidden"
                      style={{ borderRadius: '12px', backgroundColor: colors.border }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate" style={{ color: colors.text }}>
                            {product.name}
                          </h4>
                          <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                            TechBrand Pro
                          </p>
                        </div>
                        <button className="p-1" style={{ background: 'none', border: 'none' }}>
                          <MoreVertical className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-base" style={{ color: theme.primaryColor }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs line-through" style={{ color: colors.textSecondary }}>
                          ${(product.price * 1.2).toFixed(2)}
                        </span>
                      </div>

                      {/* Stock & Rating */}
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{
                            backgroundColor: product.stock > 0 ? '#DCFCE7' : '#FEF2F2',
                            color: product.stock > 0 ? '#16A34A' : '#DC2626',
                          }}
                        >
                          <Package className="w-3 h-3" />
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" style={{ color: '#FFA726' }} />
                          <span className="text-xs font-medium" style={{ color: colors.text }}>4.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAB */}
          <button
            className="absolute bottom-4 right-4 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2"
            style={{ backgroundColor: theme.primaryColor }}
            onClick={() => onNavigate?.('add-product')}
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">Add Product</span>
          </button>
        </div>
      );

    case 'orders':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Orders
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Horizontal Stat Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { label: 'Total', value: '156', color: '#3B82F6' },
                { label: 'Pending', value: '12', color: '#F59E0B' },
                { label: 'Processing', value: '8', color: '#8B5CF6' },
                { label: 'Shipped', value: '45', color: '#06B6D4' },
                { label: 'Delivered', value: '89', color: '#22C55E' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex-shrink-0 px-4 py-3 min-w-[100px]"
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: '12px',
                    borderLeft: `4px solid ${stat.color}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: colors.textSecondary }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status, idx) => (
                <button
                  key={status}
                  className="px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: idx === 0 ? theme.primaryColor : 'transparent',
                    color: idx === 0 ? 'white' : colors.textSecondary,
                    borderRadius: '16px',
                    border: idx === 0 ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {[
                { id: '#ORD-1234', customer: 'Alice M.', items: 3, total: '$89.99', status: 'Pending', statusColor: '#F59E0B', time: '10 min ago' },
                { id: '#ORD-1233', customer: 'Bob K.', items: 2, total: '$156.00', status: 'Processing', statusColor: '#8B5CF6', time: '25 min ago' },
                { id: '#ORD-1232', customer: 'Carol S.', items: 1, total: '$45.50', status: 'Shipped', statusColor: '#06B6D4', time: '1 hour ago' },
              ].map((order, idx) => (
                <div
                  key={idx}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: colors.text }}>{order.id}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: order.statusColor + '20', color: order.statusColor }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>{order.time}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.primaryColor + '15' }}
                    >
                      <span className="font-semibold text-sm" style={{ color: theme.primaryColor }}>{order.customer.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>{order.customer}</p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>{order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: theme.primaryColor }}>{order.total}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 text-xs font-medium rounded-lg"
                      style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                    >
                      View Details
                    </button>
                    {order.status === 'Pending' && (
                      <button
                        className="py-2 px-4 text-xs font-medium rounded-lg"
                        style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
                      >
                        Accept
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'product-detail':
      // Using the first available product for detail view
      const selectedProduct = products[0] || DUMMY_PRODUCTS[0];
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: colors.bg }}>
            <button
              onClick={() => onNavigate?.('products')}
              className="p-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ArrowLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Product Details
            </h2>
            <div className="flex items-center gap-2">
              <button
                className="p-2"
                onClick={() => onNavigate?.('add-product')}
                style={{ background: 'none', border: 'none' }}
              >
                <Edit2 className="w-5 h-5" style={{ color: theme.primaryColor }} />
              </button>
              <button className="p-2" style={{ background: 'none', border: 'none' }}>
                <MoreVertical className="w-5 h-5" style={{ color: colors.text }} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Gallery */}
            <div className="relative" style={{ height: '300px', backgroundColor: colors.surface }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: i === 0 ? theme.primaryColor : 'rgba(255,255,255,0.5)' }}
                  />
                ))}
              </div>
              {/* Image Counter */}
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
              >
                1 / 4
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-4">
              {/* Name & Brand */}
              <div>
                <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                  {selectedProduct.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  by <span style={{ color: theme.primaryColor }}>TechBrand Pro</span>
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                  ${selectedProduct.price.toFixed(2)}
                </span>
                <span className="text-lg line-through" style={{ color: colors.textSecondary }}>
                  ${(selectedProduct.price * 1.2).toFixed(2)}
                </span>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
                >
                  20% OFF
                </span>
              </div>

              {/* Stock & Rating Row */}
              <div className="flex items-center gap-4">
                {/* Stock Badge */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ backgroundColor: selectedProduct.stock > 0 ? '#DCFCE7' : '#FEF2F2' }}
                >
                  <Package className="w-4 h-4" style={{ color: selectedProduct.stock > 0 ? '#16A34A' : '#DC2626' }} />
                  <span className="text-sm font-medium" style={{ color: selectedProduct.stock > 0 ? '#16A34A' : '#DC2626' }}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current" style={{ color: '#FFA726' }} />
                  <span className="font-bold" style={{ color: colors.text }}>4.5</span>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>(24 reviews)</span>
                </div>
              </div>

              {/* Description Section */}
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
                  Description
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                  High-quality product with premium features. Perfect for everyday use and designed with attention to detail. Made with the finest materials for lasting durability.
                </p>
              </div>

              {/* Product Details Section */}
              <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
                <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                  Product Details
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Category', value: selectedProduct.category },
                    { label: 'SKU', value: `SKU-${selectedProduct.id}00${selectedProduct.id}` },
                    { label: 'Sizes', value: 'S, M, L, XL' },
                    { label: 'Colors', value: 'Black, White, Blue' },
                    { label: 'Sold', value: '142 units' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.textSecondary }}>{item.label}</span>
                      <span className="text-sm font-medium" style={{ color: colors.text }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                >
                  <Edit2 className="w-4 h-4" /> Edit Product
                </button>
                <button
                  className="py-3 px-4 text-sm font-medium rounded-xl"
                  style={{ border: `1px solid #DC2626`, color: '#DC2626' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'profile':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Profile</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Profile Header - Gradient */}
            <div
              className="p-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor || theme.primaryColor + 'AA'} 100%)`,
              }}
            >
              {/* Avatar with Camera Button */}
              <div className="relative inline-block mb-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                >
                  <span className="text-3xl font-bold text-white">
                    {displayShopName?.charAt(0) || 'V'}
                  </span>
                </div>
                <div
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-lg"
                >
                  <Camera className="w-4 h-4" style={{ color: theme.primaryColor }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{displayShopName}</h3>
              <p className="text-sm text-white/80">{displayShopName?.toLowerCase().replace(/\s+/g, '')}@shop.com</p>
            </div>

            {/* Form Section */}
            <div className="p-4 space-y-4">
              {/* Name Row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>First Name</p>
                  <div
                    className="px-3 py-2.5 flex items-center gap-2"
                    style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
                  >
                    <User className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <span className="text-sm" style={{ color: colors.text }}>Vendor</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>Last Name</p>
                  <div
                    className="px-3 py-2.5"
                    style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>Name</span>
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>Email</p>
                <div
                  className="px-3 py-2.5 flex items-center gap-2"
                  style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}`, opacity: 0.7 }}
                >
                  <Mail className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <span className="text-sm" style={{ color: colors.text }}>{displayShopName?.toLowerCase().replace(/\s+/g, '')}@shop.com</span>
                </div>
                <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>Phone</p>
                <div
                  className="px-3 py-2.5 flex items-center gap-2"
                  style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
                >
                  <Phone className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <span className="text-sm" style={{ color: colors.text }}>+1 234 567 8900</span>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>Address</p>
                <div
                  className="px-3 py-2.5 flex items-center gap-2"
                  style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
                >
                  <MapPin className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  <span className="text-sm" style={{ color: colors.text }}>123 Business St, City</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                className="w-full py-3 text-white font-medium flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: theme.primaryColor, borderRadius: '12px' }}
              >
                <Upload className="w-4 h-4" />
                Save Changes
              </button>

              {/* Delete Account Section */}
              <div
                className="p-4 mt-4"
                style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5" style={{ color: '#DC2626' }} />
                  <span className="font-bold text-sm" style={{ color: '#DC2626' }}>Delete Account</span>
                </div>
                <p className="text-xs mb-3" style={{ color: '#991B1B' }}>
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  className="px-4 py-2 text-sm font-medium"
                  style={{ color: '#DC2626', border: '1px solid #DC2626', borderRadius: '8px', backgroundColor: 'transparent' }}
                >
                  Delete My Account
                </button>
              </div>
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
            <Store className="w-24 h-24 mb-4 text-white" />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">{displayShopName}</h1>
          <p className="text-white/70 text-sm">Seller Portal</p>
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
              <Store className="w-16 h-16" style={{ color: theme.primaryColor }} />
            </div>
            <h2 className="text-xl font-bold text-center mb-2" style={{ color: colors.text }}>
              Start Selling Today
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: colors.textSecondary }}>
              Create your store, add products, and reach customers worldwide
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
              Sign in to manage your store
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
              Create Account
            </h1>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              Start your selling journey today
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

    case 'add-product':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* AppBar */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => onNavigate?.('products')}
              className="p-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Add Product
            </h2>
            <button
              className="px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: theme.primaryColor }}
            >
              Create
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Basic Information Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Basic Information</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Product Name *', placeholder: 'Enter product name' },
                  { label: 'Brand', placeholder: 'Enter brand name' },
                  { label: 'Description', placeholder: 'Enter product description', multiline: true },
                  { label: 'SKU', placeholder: 'Enter SKU code' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                      {field.label}
                    </label>
                    <div
                      className={`px-3 py-2.5 ${field.multiline ? 'min-h-[60px]' : ''}`}
                      style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}
                    >
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        {field.placeholder}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category & Tags Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Category & Tags</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Category</label>
                  <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Select category</span>
                    <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Tags</label>
                  <div className="flex gap-2 flex-wrap">
                    {['New', 'Featured'].map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>
                        {tag} <X className="w-3 h-3 inline ml-1" />
                      </span>
                    ))}
                    <button className="px-3 py-1 text-xs font-medium rounded-full" style={{ border: `1px dashed ${colors.border}`, color: colors.textSecondary }}>
                      + Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Pricing</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Price *</label>
                  <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>$0.00</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Compare Price</label>
                  <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>$0.00</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: theme.primaryColor + '10' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textSecondary }}>Profit Margin</span>
                  <span className="text-sm font-bold" style={{ color: theme.primaryColor }}>0%</span>
                </div>
              </div>
            </div>

            {/* Product Images Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Product Images</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className="aspect-square flex flex-col items-center justify-center"
                  style={{ backgroundColor: colors.bg, borderRadius: '12px', border: `2px dashed ${colors.border}` }}
                >
                  <Plus className="w-6 h-6" style={{ color: colors.textSecondary }} />
                  <span className="text-xs mt-1" style={{ color: colors.textSecondary }}>Add</span>
                </div>
                {[1, 2].map((i) => (
                  <div key={i} className="aspect-square relative overflow-hidden" style={{ borderRadius: '12px', backgroundColor: colors.bg }}>
                    <img
                      src={products[i]?.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#DC2626' }}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Inventory</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: colors.text }}>Track Inventory</span>
                <div
                  className="w-10 h-6 rounded-full p-1"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <div className="w-4 h-4 rounded-full bg-white" style={{ transform: 'translateX(16px)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Quantity</label>
                  <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>0</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Low Stock Alert</label>
                  <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Copy className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Variants</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Sizes</label>
                  <div className="flex gap-2 flex-wrap">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button key={size} className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>
                        {size}
                      </button>
                    ))}
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ border: `1px dashed ${colors.border}`, color: colors.textSecondary }}>
                      + Add
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Colors</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#000000', '#3B82F6', '#EF4444', '#22C55E'].map((color) => (
                      <div key={color} className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
                    ))}
                    <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `2px dashed ${colors.border}` }}>
                      <Plus className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Status</h3>
              </div>
              <div className="flex p-1 rounded-xl" style={{ backgroundColor: colors.bg }}>
                <button className="flex-1 py-2 text-sm font-medium rounded-lg text-white" style={{ backgroundColor: theme.primaryColor }}>
                  Published
                </button>
                <button className="flex-1 py-2 text-sm font-medium rounded-lg" style={{ color: colors.textSecondary }}>
                  Draft
                </button>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Specifications</h3>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'Weight', value: '500g' },
                  { key: 'Dimensions', value: '30 x 20 x 10 cm' },
                  { key: 'Material', value: 'Cotton' },
                ].map((spec, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1 px-3 py-2" style={{ backgroundColor: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.text }}>{spec.key}</span>
                    </div>
                    <div className="flex-1 px-3 py-2" style={{ backgroundColor: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.text }}>{spec.value}</span>
                    </div>
                    <button className="p-2" style={{ color: '#DC2626' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 flex-wrap">
                  {['Weight', 'Dimensions', 'Color', 'Material', 'Origin'].map((quick) => (
                    <button key={quick} className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.textSecondary }}>
                      + {quick}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaigns & Offers Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Percent className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Campaigns & Offers</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" style={{ color: '#F59E0B' }} />
                    <span className="text-sm font-medium" style={{ color: colors.text }}>Flash Sale</span>
                  </div>
                  <div className="w-10 h-6 rounded-full p-1" style={{ backgroundColor: theme.primaryColor }}>
                    <div className="w-4 h-4 rounded-full bg-white" style={{ transform: 'translateX(16px)' }} />
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: '#92400E' }}>Sale Price</label>
                      <div className="px-3 py-2 bg-white rounded-lg" style={{ border: '1px solid #FCD34D' }}>
                        <span className="text-sm" style={{ color: '#92400E' }}>$79.99</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: '#92400E' }}>Discount</label>
                      <div className="px-3 py-2 bg-white rounded-lg flex items-center justify-between" style={{ border: '1px solid #FCD34D' }}>
                        <span className="text-sm font-bold" style={{ color: '#DC2626' }}>20% OFF</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: '#92400E' }}>Start Date</label>
                      <div className="px-3 py-2 bg-white rounded-lg flex items-center gap-2" style={{ border: '1px solid #FCD34D' }}>
                        <Calendar className="w-4 h-4" style={{ color: '#92400E' }} />
                        <span className="text-xs" style={{ color: '#92400E' }}>Jan 15, 2025</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: '#92400E' }}>End Date</label>
                      <div className="px-3 py-2 bg-white rounded-lg flex items-center gap-2" style={{ border: '1px solid #FCD34D' }}>
                        <Calendar className="w-4 h-4" style={{ color: '#92400E' }} />
                        <span className="text-xs" style={{ color: '#92400E' }}>Jan 31, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Settings Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>SEO Settings</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium" style={{ color: colors.textSecondary }}>Meta Title</label>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>0/60</span>
                  </div>
                  <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Enter meta title</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium" style={{ color: colors.textSecondary }}>Meta Description</label>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>0/160</span>
                  </div>
                  <div className="px-3 py-2.5 min-h-[60px]" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Enter meta description</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>URL Slug</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.textSecondary }}>product-name</span>
                    </div>
                    <button className="px-3 py-2 text-xs font-medium rounded-lg" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Care Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Shipping & Care</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>Care Instructions</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Machine wash cold', 'Do not bleach', 'Tumble dry low', 'Iron on low', 'Dry clean only'].map((care, idx) => (
                      <button
                        key={care}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg"
                        style={{
                          backgroundColor: idx < 3 ? theme.primaryColor : 'transparent',
                          color: idx < 3 ? 'white' : colors.textSecondary,
                          border: idx < 3 ? 'none' : `1px solid ${colors.border}`,
                        }}
                      >
                        {care}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Standard Shipping</label>
                    <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.text }}>3-5 days</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Express Shipping</label>
                    <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.text }}>1-2 days</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.text }}>Free Shipping Above</span>
                  <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                    <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>$50.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Policy Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Archive className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Return Policy</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Return Period</label>
                    <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.text }}>30 days</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>Refund Processing</label>
                    <div className="px-3 py-2.5" style={{ backgroundColor: colors.bg, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                      <span className="text-sm" style={{ color: colors.text }}>5-7 days</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.text }}>Free Returns</span>
                  <div className="w-10 h-6 rounded-full p-1" style={{ backgroundColor: theme.primaryColor }}>
                    <div className="w-4 h-4 rounded-full bg-white" style={{ transform: 'translateX(16px)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: colors.textSecondary }}>Return Conditions</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Unopened', 'Original packaging', 'With tags', 'Unworn'].map((cond, idx) => (
                      <span key={cond} className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Status</h3>
              </div>
              <div className="flex p-1 rounded-xl" style={{ backgroundColor: colors.bg }}>
                <button className="flex-1 py-2 text-sm font-medium rounded-lg text-white" style={{ backgroundColor: theme.primaryColor }}>
                  Published
                </button>
                <button className="flex-1 py-2 text-sm font-medium rounded-lg" style={{ color: colors.textSecondary }}>
                  Draft
                </button>
              </div>
            </div>

            {/* Visibility Section */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Visibility</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Show in Store', enabled: true },
                  { label: 'Featured Product', enabled: false },
                  { label: 'New Arrival Badge', enabled: true },
                ].map((option) => (
                  <div key={option.label} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors.text }}>{option.label}</span>
                    <div
                      className="w-10 h-6 rounded-full p-1"
                      style={{ backgroundColor: option.enabled ? theme.primaryColor : colors.border }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white" style={{ transform: option.enabled ? 'translateX(16px)' : 'translateX(0)' }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t" style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors.text }}>Schedule Publish</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="text-sm" style={{ color: colors.textSecondary }}>Set date</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="font-semibold" style={{ color: colors.text }}>Quick Actions</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                  <Globe className="w-3 h-3" /> Generate Slug
                </button>
                <button className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                  <Copy className="w-3 h-3" /> Save Template
                </button>
                <button className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'order-detail':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => onNavigate?.('orders')}
              className="p-2"
              style={{ background: 'none', border: 'none' }}
            >
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Order #{orders[0]?.orderNumber || 'N/A'}
            </h2>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: theme.primaryColor + '20', borderRadius }}
            >
              <span className="font-medium" style={{ color: theme.primaryColor }}>
                {orders[0]?.status || 'Pending'}
              </span>
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                {orders[0]?.createdAt ? new Date(orders[0].createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
              <h3 className="font-semibold mb-3" style={{ color: colors.text }}>
                Customer
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <span className="text-white font-medium">{orders[0]?.customerName?.charAt(0) || 'C'}</span>
                </div>
                <div>
                  <p className="font-medium" style={{ color: colors.text }}>{orders[0]?.customerName || 'Customer'}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{orders[0]?.customerEmail || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
              <h3 className="font-semibold mb-3" style={{ color: colors.text }}>
                Items ({orders[0]?.itemCount || 2})
              </h3>
              {products.slice(0, 2).map((item: any, index: number) => (
                <div key={item.id || index} className="flex items-center gap-3 py-2">
                  <img
                    src={item.image || ''}
                    alt={item.name || 'Product'}
                    className="w-12 h-12 object-cover"
                    style={{ borderRadius }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: colors.text }}>
                      {item.name || 'Product'}
                    </p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Qty: 1
                    </p>
                  </div>
                  <span className="font-medium" style={{ color: theme.primaryColor }}>
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: colors.textSecondary }}>Subtotal</span>
                <span style={{ color: colors.text }}>${((orders[0]?.total || 0) * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: colors.textSecondary }}>Shipping</span>
                <span style={{ color: colors.text }}>${((orders[0]?.total || 0) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: colors.border }}>
                <span className="font-bold" style={{ color: colors.text }}>Total</span>
                <span className="font-bold" style={{ color: theme.primaryColor }}>${(orders[0]?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <button
              className="w-full py-3 text-white font-medium"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              Update Status
            </button>
          </div>
        </div>
      );

    case 'delivery-management':
      return (
        <div className="h-full flex flex-col relative" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Delivery
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            {/* Gradient Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Methods', value: '3', gradient: ['#22C55E', '#16A34A'], icon: Truck },
                { label: 'Shipped Today', value: '24', gradient: ['#3B82F6', '#2563EB'], icon: Package },
                { label: 'In Transit', value: '12', gradient: ['#8B5CF6', '#7C3AED'], icon: MapPin },
                { label: 'Avg Delivery', value: '2.4d', gradient: ['#F59E0B', '#D97706'], icon: Clock },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4"
                  style={{
                    background: `linear-gradient(135deg, ${stat.gradient[0]} 0%, ${stat.gradient[1]} 100%)`,
                    borderRadius: '16px',
                    boxShadow: `0 8px 20px ${stat.gradient[0]}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white font-medium">{stat.label}</span>
                    <stat.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Tab Bar */}
            <div className="p-1 rounded-xl" style={{ backgroundColor: colors.surface }}>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'methods', label: 'Methods', icon: Truck },
                  { id: 'zones', label: 'Zones', icon: MapPin },
                  { id: 'men', label: 'Men', icon: Users },
                  { id: 'tracking', label: 'Tracking', icon: Navigation },
                ].map((tab, idx) => {
                  const isActive = idx === deliveryTabIndex;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDeliveryTabIndex(idx)}
                      className="py-2 flex flex-col items-center gap-1 transition-all"
                      style={{
                        backgroundColor: isActive ? theme.primaryColor : 'transparent',
                        borderRadius: '10px',
                      }}
                    >
                      <tab.icon className="w-4 h-4" style={{ color: isActive ? 'white' : colors.textSecondary }} />
                      <span className="text-xs font-medium" style={{ color: isActive ? 'white' : colors.textSecondary }}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content based on deliveryTabIndex */}
            {deliveryTabIndex === 0 && (
              /* Methods Tab Content */
              <div className="space-y-3">
                {[
                  { name: 'Standard Shipping', price: '$5.00', time: '3-5 days', active: true, orders: 156 },
                  { name: 'Express Shipping', price: '$15.00', time: '1-2 days', active: true, orders: 89 },
                  { name: 'Same Day Delivery', price: '$25.00', time: 'Same day', active: false, orders: 45 },
                  { name: 'Free Shipping', price: 'Free', time: '5-7 days', active: true, orders: 234 },
                ].map((method, idx) => (
                  <div
                    key={idx}
                    className="p-4"
                    style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: method.active ? '#DCFCE7' : colors.bg }}
                        >
                          <Truck className="w-5 h-5" style={{ color: method.active ? '#16A34A' : colors.textSecondary }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: colors.text }}>{method.name}</h4>
                          <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                            <span>{method.time}</span>
                            <span>•</span>
                            <span>{method.orders} orders</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: theme.primaryColor }}>{method.price}</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: method.active ? '#DCFCE7' : '#FEF2F2',
                            color: method.active ? '#16A34A' : '#DC2626',
                          }}
                        >
                          {method.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1"
                        style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        className="py-1.5 px-3 text-xs font-medium rounded-lg"
                        style={{ backgroundColor: method.active ? '#FEF2F2' : '#DCFCE7', color: method.active ? '#DC2626' : '#16A34A' }}
                      >
                        {method.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            )}

            {deliveryTabIndex === 1 && (
              /* Zones Tab Content */
              <div className="space-y-3">
                {[
                  { name: 'Downtown', radius: '5 km', fee: '$3.00', active: true, deliveries: 234 },
                  { name: 'Suburbs', radius: '15 km', fee: '$7.00', active: true, deliveries: 156 },
                  { name: 'Metro Area', radius: '25 km', fee: '$12.00', active: true, deliveries: 89 },
                  { name: 'Extended Zone', radius: '50 km', fee: '$20.00', active: false, deliveries: 23 },
                ].map((zone, idx) => (
                  <div
                    key={idx}
                    className="p-4"
                    style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: zone.active ? '#DBEAFE' : colors.bg }}
                        >
                          <MapPin className="w-5 h-5" style={{ color: zone.active ? '#2563EB' : colors.textSecondary }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: colors.text }}>{zone.name}</h4>
                          <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                            <span>{zone.radius} radius</span>
                            <span>•</span>
                            <span>{zone.deliveries} deliveries</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: theme.primaryColor }}>{zone.fee}</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: zone.active ? '#DCFCE7' : '#FEF2F2',
                            color: zone.active ? '#16A34A' : '#DC2626',
                          }}
                        >
                          {zone.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1"
                        style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
                      >
                        <Edit2 className="w-3 h-3" /> Edit Zone
                      </button>
                      <button
                        className="py-1.5 px-3 text-xs font-medium rounded-lg"
                        style={{ backgroundColor: zone.active ? '#FEF2F2' : '#DCFCE7', color: zone.active ? '#DC2626' : '#16A34A' }}
                      >
                        {zone.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            )}

            {deliveryTabIndex === 2 && (
              /* Delivery Men Tab Content */
              <div className="space-y-3">
                {[
                  { name: 'Alex Johnson', status: 'Active', orders: 23, rating: 4.8, phone: '+1 234-567-8901' },
                  { name: 'Mike Smith', status: 'Active', orders: 18, rating: 4.5, phone: '+1 234-567-8902' },
                  { name: 'Sarah Williams', status: 'Busy', orders: 31, rating: 4.9, phone: '+1 234-567-8903' },
                  { name: 'David Brown', status: 'Offline', orders: 12, rating: 4.2, phone: '+1 234-567-8904' },
                ].map((driver, idx) => {
                  const statusColors: Record<string, { bg: string; color: string }> = {
                    Active: { bg: '#DCFCE7', color: '#16A34A' },
                    Busy: { bg: '#FEF3C7', color: '#D97706' },
                    Offline: { bg: '#F3F4F6', color: '#6B7280' },
                  };
                  const statusStyle = statusColors[driver.status] || statusColors.Offline;
                  return (
                    <div
                      key={idx}
                      className="p-4"
                      style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm" style={{ color: colors.text }}>{driver.name}</h4>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>{driver.phone}</p>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {driver.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" style={{ color: '#F59E0B' }} />
                          <span className="text-sm font-medium" style={{ color: colors.text }}>{driver.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" style={{ color: colors.textSecondary }} />
                          <span className="text-sm" style={{ color: colors.textSecondary }}>{driver.orders} deliveries</span>
                        </div>
                        <button
                          className="text-xs font-medium px-3 py-1 rounded-lg"
                          style={{ backgroundColor: theme.primaryColor + '15', color: theme.primaryColor }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            {deliveryTabIndex === 3 && (
              /* Tracking Tab Content - Shipments List (like Flutter) */
              <div className="space-y-3">
                {[
                  { orderNumber: 'ORD-1001', customer: 'John Smith', trackingNumber: 'ODM-K8X2P-A1B2', method: 'Express', carrier: 'FedEx', status: 'shipped', estimatedDelivery: 'Jan 15, 2026' },
                  { orderNumber: 'ORD-1002', customer: 'Sarah Johnson', trackingNumber: 'ODM-L9Y3Q-C3D4', method: 'Standard', carrier: 'UPS', status: 'in_transit', estimatedDelivery: 'Jan 18, 2026' },
                  { orderNumber: 'ORD-1003', customer: 'Mike Brown', trackingNumber: 'ODM-M0Z4R-E5F6', method: 'Own Delivery', carrier: 'Own Delivery Man', status: 'delivered', estimatedDelivery: 'Jan 10, 2026' },
                ].map((shipment, idx) => {
                  const statusColors: Record<string, { bg: string; color: string }> = {
                    pending: { bg: '#FEF3C7', color: '#D97706' },
                    processing: { bg: '#DBEAFE', color: '#2563EB' },
                    shipped: { bg: '#E9D5FF', color: '#7C3AED' },
                    in_transit: { bg: '#E9D5FF', color: '#7C3AED' },
                    delivered: { bg: '#DCFCE7', color: '#16A34A' },
                  };
                  const statusStyle = statusColors[shipment.status] || statusColors.pending;
                  const statusLabel = shipment.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

                  return (
                    <div
                      key={idx}
                      className="p-4"
                      style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}
                    >
                      {/* Header with icon */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${statusStyle.color}99, ${statusStyle.color})`,
                            boxShadow: `0 4px 12px ${statusStyle.color}30`
                          }}
                        >
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm" style={{ color: colors.text }}>#{shipment.orderNumber}</h4>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>{shipment.customer}</p>
                        </div>
                        <span
                          className="text-xs px-3 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* Tracking Info Box */}
                      <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: colors.bg }}>
                        <div className="flex items-center gap-2 mb-3">
                          <QrCode className="w-4 h-4" style={{ color: colors.textSecondary }} />
                          <span className="text-sm font-semibold font-mono" style={{ color: colors.text }}>{shipment.trackingNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 text-center">
                            <p className="text-[10px] mb-1" style={{ color: colors.textSecondary }}>Method</p>
                            <p className="text-xs font-semibold" style={{ color: colors.text }}>{shipment.method}</p>
                          </div>
                          <div className="w-px h-8" style={{ backgroundColor: colors.border }} />
                          <div className="flex-1 text-center">
                            <p className="text-[10px] mb-1" style={{ color: colors.textSecondary }}>Carrier</p>
                            <p className="text-xs font-semibold" style={{ color: colors.text }}>{shipment.carrier}</p>
                          </div>
                        </div>
                      </div>

                      {/* Estimated Delivery */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Est. Delivery:</span>
                        <span className="text-xs font-semibold" style={{ color: colors.text }}>{shipment.estimatedDelivery}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Floating Action Button (FAB) - like Flutter */}
          <button
            onClick={() => {
              if (deliveryTabIndex === 0) setShowAddMethodForm(true);
              else if (deliveryTabIndex === 1) setShowAddZoneForm(true);
              else if (deliveryTabIndex === 2) setShowAddDriverForm(true);
              else if (deliveryTabIndex === 3) setShowAddTrackingForm(true);
            }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-sm shadow-lg z-10"
            style={{ backgroundColor: theme.primaryColor, boxShadow: `0 4px 14px ${theme.primaryColor}50` }}
          >
            <Plus className="w-5 h-5" />
            {deliveryTabIndex === 0 && 'Add Method'}
            {deliveryTabIndex === 1 && 'Add Zone'}
            {deliveryTabIndex === 2 && 'Add Driver'}
            {deliveryTabIndex === 3 && 'Add Tracking'}
          </button>

          {/* Add Method Form Modal */}
          {showAddMethodForm && (
            <div className="absolute inset-0 bg-black/50 flex items-end z-20">
              <div className="w-full p-4 rounded-t-3xl" style={{ backgroundColor: colors.bg }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Shipping Method</h3>
                  <button onClick={() => setShowAddMethodForm(false)}>
                    <X className="w-6 h-6" style={{ color: colors.textSecondary }} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Method Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Express Delivery"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Price</label>
                      <input
                        type="text"
                        placeholder="$0.00"
                        className="w-full px-4 py-3 text-sm rounded-xl"
                        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Delivery Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 2-3 days"
                        className="w-full px-4 py-3 text-sm rounded-xl"
                        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMethodForm(false)}
                    className="w-full py-3 rounded-xl text-white font-semibold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Add Method
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Zone Form Modal */}
          {showAddZoneForm && (
            <div className="absolute inset-0 bg-black/50 flex items-end z-20">
              <div className="w-full p-4 rounded-t-3xl" style={{ backgroundColor: colors.bg }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Delivery Zone</h3>
                  <button onClick={() => setShowAddZoneForm(false)}>
                    <X className="w-6 h-6" style={{ color: colors.textSecondary }} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Zone Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Downtown Area"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Radius (km)</label>
                      <input
                        type="text"
                        placeholder="e.g., 10"
                        className="w-full px-4 py-3 text-sm rounded-xl"
                        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Delivery Fee</label>
                      <input
                        type="text"
                        placeholder="$0.00"
                        className="w-full px-4 py-3 text-sm rounded-xl"
                        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddZoneForm(false)}
                    className="w-full py-3 rounded-xl text-white font-semibold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Add Zone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Driver Form Modal */}
          {showAddDriverForm && (
            <div className="absolute inset-0 bg-black/50 flex items-end z-20">
              <div className="w-full p-4 rounded-t-3xl" style={{ backgroundColor: colors.bg }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Delivery Person</h3>
                  <button onClick={() => setShowAddDriverForm(false)}>
                    <X className="w-6 h-6" style={{ color: colors.textSecondary }} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 234-567-8900"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Email</label>
                    <input
                      type="email"
                      placeholder="driver@email.com"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <button
                    onClick={() => setShowAddDriverForm(false)}
                    className="w-full py-3 rounded-xl text-white font-semibold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Add Driver
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Tracking Form Modal */}
          {showAddTrackingForm && (
            <div className="absolute inset-0 bg-black/50 flex items-end z-20">
              <div className="w-full max-h-[90%] overflow-y-auto p-4 rounded-t-3xl" style={{ backgroundColor: colors.bg }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    <h3 className="font-bold text-lg" style={{ color: colors.text }}>Add Tracking</h3>
                  </div>
                  <button onClick={() => setShowAddTrackingForm(false)}>
                    <X className="w-6 h-6" style={{ color: colors.textSecondary }} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Select Order *</label>
                    <select
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    >
                      <option value="">Select an order...</option>
                      <option value="ord-1">#ORD-1001 - John Smith</option>
                      <option value="ord-2">#ORD-1002 - Sarah Johnson</option>
                      <option value="ord-3">#ORD-1003 - Mike Brown</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Delivery Zone *</label>
                    <select
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    >
                      <option value="">Select zone...</option>
                      <option value="downtown">Downtown</option>
                      <option value="suburbs">Suburbs</option>
                      <option value="metro">Metro Area</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Delivery Method *</label>
                    <select
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    >
                      <option value="standard">Standard Shipping</option>
                      <option value="express">Express</option>
                      <option value="own_delivery_man">Own Delivery Man</option>
                      <option value="local_pickup">Local Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Tracking Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., ODM-K8X2P-A1B2"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Carrier</label>
                    <input
                      type="text"
                      placeholder="e.g., FedEx, UPS, DHL"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Status</label>
                    <select
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>Est. Delivery Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 text-sm rounded-xl"
                      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
                    />
                  </div>
                  <button
                    onClick={() => setShowAddTrackingForm(false)}
                    className="w-full py-3 rounded-xl text-white font-semibold"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Create Tracking
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'tracking-settings':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Tracking Settings
            </h2>
            <div className="w-10" />
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {[
              { label: 'Enable Order Tracking', desc: 'Allow customers to track orders', enabled: true },
              { label: 'SMS Notifications', desc: 'Send SMS updates to customers', enabled: true },
              { label: 'Email Notifications', desc: 'Send email updates', enabled: true },
              { label: 'Real-time Updates', desc: 'Push live location updates', enabled: false },
            ].map((setting, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4"
                style={{ backgroundColor: colors.surface, borderRadius }}
              >
                <div>
                  <p className="font-medium" style={{ color: colors.text }}>{setting.label}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{setting.desc}</p>
                </div>
                <div
                  className="w-10 h-6 rounded-full p-1"
                  style={{ backgroundColor: setting.enabled ? theme.primaryColor : colors.border }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white"
                    style={{ transform: setting.enabled ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'analytics':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Analytics
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <FileText className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            {/* Time Range Selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: '3m', label: '3 Months' },
                { value: '6m', label: '6 Months' },
                { value: '1y', label: '1 Year' },
              ].map((range, idx) => (
                <button
                  key={range.value}
                  className="px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: idx === 1 ? theme.primaryColor + '20' : colors.surface,
                    color: idx === 1 ? theme.primaryColor : colors.textSecondary,
                    borderRadius: '16px',
                    border: idx === 1 ? `1px solid ${theme.primaryColor}` : `1px solid ${colors.border}`,
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Gradient Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Revenue', value: '$12,450', subtitle: '156 paid orders', gradient: ['#4ADE80', '#16A34A'], icon: DollarSign },
                { label: 'Total Orders', value: '189', subtitle: '156 completed', gradient: ['#60A5FA', '#2563EB'], icon: ShoppingBag },
                { label: 'Avg Order Value', value: '$65.87', subtitle: 'Per order', gradient: ['#C084FC', '#9333EA'], icon: TrendingUp },
                { label: 'Products', value: '42', subtitle: 'Rating: 4.8/5', gradient: ['#FB923C', '#EA580C'], icon: Package },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4"
                  style={{
                    background: `linear-gradient(135deg, ${stat.gradient[0]} 0%, ${stat.gradient[1]} 100%)`,
                    borderRadius: '16px',
                    boxShadow: `0 8px 20px ${stat.gradient[0]}40`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white font-medium">{stat.label}</span>
                    <stat.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.subtitle}</div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h3 className="font-bold mb-4" style={{ color: colors.text }}>Revenue & Orders Trend</h3>
              <div className="h-40 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs" style={{ color: colors.textSecondary }}>
                  <span>$800</span>
                  <span>$600</span>
                  <span>$400</span>
                  <span>$200</span>
                  <span>$0</span>
                </div>
                {/* Chart area */}
                <div className="ml-10 h-full flex items-end justify-between gap-1 pb-6">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full relative"
                        style={{ height: `${height}%`, background: `linear-gradient(180deg, #22D3EE 0%, #22D3EE30 100%)`, borderRadius: '8px 8px 0 0' }}
                      >
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 border-2 border-white shadow" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs" style={{ color: colors.textSecondary }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: colors.text }}>Top Performing Products</h3>
              <div className="space-y-3">
                {[
                  { name: 'Wireless Headphones', sales: 45, revenue: '$2,250', trend: 15.2 },
                  { name: 'Smart Watch Pro', sales: 38, revenue: '$1,900', trend: 8.5 },
                  { name: 'Premium Earbuds', sales: 32, revenue: '$960', trend: -2.3 },
                ].map((product, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center gap-3"
                    style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: idx === 0
                          ? 'linear-gradient(135deg, #FDE047 0%, #F97316 100%)'
                          : 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                      }}
                    >
                      <span className="text-white font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>{product.name}</p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: theme.primaryColor }}>{product.revenue}</p>
                      <div className="flex items-center justify-end gap-1 text-xs" style={{ color: product.trend > 0 ? '#16A34A' : '#DC2626' }}>
                        {product.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        <span>{product.trend > 0 ? '+' : ''}{product.trend}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'offers':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Offers & Coupons
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            {/* Gradient Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Offers', value: '8', gradient: ['#22C55E', '#16A34A'], icon: Tag },
                { label: 'Total Usage', value: '1,245', gradient: ['#3B82F6', '#2563EB'], icon: ShoppingBag },
                { label: 'Revenue Impact', value: '+$4.5K', gradient: ['#8B5CF6', '#7C3AED'], icon: DollarSign },
                { label: 'Conversion', value: '12.5%', gradient: ['#F59E0B', '#D97706'], icon: TrendingUp },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4"
                  style={{
                    background: `linear-gradient(135deg, ${stat.gradient[0]} 0%, ${stat.gradient[1]} 100%)`,
                    borderRadius: '16px',
                    boxShadow: `0 8px 20px ${stat.gradient[0]}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white font-medium">{stat.label}</span>
                    <stat.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Search offers...</span>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['All', 'Active', 'Scheduled', 'Expired'].map((filter, idx) => (
                <button
                  key={filter}
                  className="px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: idx === 0 ? theme.primaryColor : 'transparent',
                    color: idx === 0 ? 'white' : colors.textSecondary,
                    borderRadius: '16px',
                    border: idx === 0 ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Offer Cards */}
            <div className="space-y-3">
              {[
                { code: 'SUMMER20', type: 'Percentage', discount: '20%', uses: 45, limit: 100, active: true, expires: 'Jan 31', icon: Percent },
                { code: 'FREESHIP', type: 'Free Shipping', discount: 'Free', uses: 120, limit: 500, active: true, expires: 'Feb 15', icon: Truck },
                { code: 'WELCOME10', type: 'Fixed Amount', discount: '$10', uses: 89, limit: 200, active: false, expires: 'Expired', icon: Tag },
              ].map((offer, idx) => (
                <div
                  key={idx}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="p-2.5 rounded-xl"
                      style={{
                        backgroundColor: offer.active ? '#DCFCE7' : colors.bg,
                      }}
                    >
                      <offer.icon className="w-5 h-5" style={{ color: offer.active ? '#16A34A' : colors.textSecondary }} />
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: colors.textSecondary }}>{offer.type}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: offer.active ? '#DCFCE7' : '#FEF2F2',
                            color: offer.active ? '#16A34A' : '#DC2626',
                          }}
                        >
                          {offer.active ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      {/* Coupon Code Display */}
                      <div
                        className="flex items-center justify-between px-3 py-2 mb-2"
                        style={{
                          backgroundColor: colors.bg,
                          borderRadius: '8px',
                          border: `2px dashed ${offer.active ? theme.primaryColor : colors.border}`,
                        }}
                      >
                        <span className="font-mono font-bold" style={{ color: colors.text }}>{offer.code}</span>
                        <Copy className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      </div>
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: colors.textSecondary }}>{offer.uses} / {offer.limit} used</span>
                        <span style={{ color: colors.textSecondary }}>{offer.expires}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: colors.border }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(offer.uses / offer.limit) * 100}%`,
                            backgroundColor: offer.active ? theme.primaryColor : colors.textSecondary,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAB */}
          <button
            className="absolute bottom-4 right-4 p-4 rounded-2xl shadow-lg"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      );

    case 'reviews':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Reviews
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            {/* Gradient Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Reviews', value: '128', gradient: ['#3B82F6', '#2563EB'], icon: MessageSquare },
                { label: 'Average Rating', value: '4.5', gradient: ['#F59E0B', '#D97706'], icon: Star },
                { label: 'Featured', value: '12', gradient: ['#8B5CF6', '#7C3AED'], icon: Award },
                { label: 'Helpful Votes', value: '456', gradient: ['#22C55E', '#16A34A'], icon: ThumbsUp },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4"
                  style={{
                    background: `linear-gradient(135deg, ${stat.gradient[0]} 0%, ${stat.gradient[1]} 100%)`,
                    borderRadius: '16px',
                    boxShadow: `0 8px 20px ${stat.gradient[0]}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white font-medium">{stat.label}</span>
                    <stat.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Rating Distribution */}
            <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <h3 className="font-bold mb-3" style={{ color: colors.text }}>Rating Distribution</h3>
              {[
                { stars: 5, count: 85, percent: 66 },
                { stars: 4, count: 28, percent: 22 },
                { stars: 3, count: 10, percent: 8 },
                { stars: 2, count: 3, percent: 2 },
                { stars: 1, count: 2, percent: 2 },
              ].map((rating) => (
                <div key={rating.stars} className="flex items-center gap-2 mb-2">
                  <span className="text-xs w-4 text-right" style={{ color: colors.text }}>{rating.stars}</span>
                  <Star className="w-3 h-3 fill-current" style={{ color: '#F59E0B' }} />
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.bg }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${rating.percent}%`, backgroundColor: '#F59E0B' }}
                    />
                  </div>
                  <span className="text-xs w-8" style={{ color: colors.textSecondary }}>{rating.count}</span>
                </div>
              ))}
            </div>

            {/* Search and Filter */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Search reviews...</span>
            </div>

            {/* Rating Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'].map((filter, idx) => (
                <button
                  key={filter}
                  className="px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: idx === 0 ? theme.primaryColor : 'transparent',
                    color: idx === 0 ? 'white' : colors.textSecondary,
                    borderRadius: '16px',
                    border: idx === 0 ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Review Cards */}
            <div className="space-y-3">
              {[
                { name: 'Alice M.', product: 'Wireless Headphones', rating: 5, comment: 'Great product, fast delivery! The sound quality exceeded my expectations.', date: '2 days ago', helpful: 12, featured: true },
                { name: 'Bob K.', product: 'Smart Watch Pro', rating: 4, comment: 'Good quality, recommended. Battery life could be better but overall satisfied.', date: '1 week ago', helpful: 8, featured: false },
                { name: 'Carol S.', product: 'Premium Earbuds', rating: 5, comment: 'Excellent service and product!', date: '2 weeks ago', helpful: 5, featured: false },
              ].map((review, idx) => (
                <div
                  key={idx}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex gap-3">
                    {/* Product Image Placeholder */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <Package className="w-6 h-6" style={{ color: colors.textSecondary }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm" style={{ color: colors.text }}>{review.name}</span>
                          {review.featured && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>Featured</span>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>{review.date}</span>
                      </div>
                      <p className="text-xs mb-1 truncate" style={{ color: colors.textSecondary }}>{review.product}</p>
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-current"
                            style={{ color: i <= review.rating ? '#F59E0B' : colors.border }}
                          />
                        ))}
                      </div>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: colors.text }}>{review.comment}</p>
                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-xs" style={{ color: colors.textSecondary }}>
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{review.helpful} helpful</span>
                        </button>
                        <button className="flex items-center gap-1 text-xs" style={{ color: theme.primaryColor }}>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'team':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onMenuClick} className="p-2" style={{ background: 'none', border: 'none' }}>
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Team
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Members', value: '5', icon: Users, color: '#3B82F6' },
                { label: 'Active', value: '4', icon: CheckCircle, color: '#22C55E' },
                { label: 'Pending', value: '2', icon: Clock, color: '#F59E0B' },
                { label: 'Admins', value: '1', icon: Shield, color: '#8B5CF6' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4"
                  style={{ backgroundColor: colors.surface, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: stat.color + '15' }}>
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Search members...</span>
            </div>

            {/* Team Members Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold" style={{ color: colors.text }}>Team Members</h3>
                <span className="text-sm" style={{ color: colors.textSecondary }}>3 members</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'You', role: 'Owner', email: 'owner@shop.com', active: true, roleColor: '#D97706', roleIcon: Star },
                  { name: 'Jane Smith', role: 'Admin', email: 'jane@shop.com', active: true, roleColor: '#8B5CF6', roleIcon: Shield },
                  { name: 'Mike Johnson', role: 'Staff', email: 'mike@shop.com', active: false, roleColor: '#14B8A6', roleIcon: User },
                ].map((member, idx) => (
                  <div
                    key={idx}
                    className="p-4"
                    style={{ backgroundColor: colors.surface, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar with role badge */}
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: member.roleColor + '15' }}
                        >
                          <span className="font-bold" style={{ color: member.roleColor }}>{member.name.charAt(0)}</span>
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                          style={{ backgroundColor: member.roleColor }}
                        >
                          <member.roleIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: colors.text }}>{member.name}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: member.roleColor + '15', color: member.roleColor }}
                          >
                            {member.role}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>{member.email}</span>
                      </div>
                      {/* Status */}
                      <div
                        className="px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ backgroundColor: member.active ? '#DCFCE7' : colors.border }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: member.active ? '#22C55E' : '#9CA3AF' }}
                        />
                        <span className="text-xs" style={{ color: member.active ? '#16A34A' : colors.textSecondary }}>
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {/* Actions for non-owners */}
                    {member.role !== 'Owner' && (
                      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                        <button
                          className="flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1"
                          style={{ border: `1px solid #3B82F6`, color: '#3B82F6' }}
                        >
                          <Settings className="w-3 h-3" /> Permissions
                        </button>
                        <button
                          className="py-2 px-3 text-xs font-medium rounded-lg flex items-center gap-1"
                          style={{ border: '1px solid #DC2626', color: '#DC2626' }}
                        >
                          <User className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAB */}
          <button
            className="absolute bottom-4 right-4 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Invite Member</span>
          </button>
        </div>
      );

    case 'billing':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Billing
            </h2>
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <Bell className="w-5 h-5" style={{ color: colors.text }} />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            {/* Current Subscription Card */}
            <div
              className="p-5 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)`,
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Current Plan</span>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', color: '#86EFAC' }}
                >
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Pro Plan</h3>
              <p className="text-sm text-white/70 mb-4">Monthly billing</p>
              <div className="flex items-center gap-1 text-white/70 text-xs mb-4">
                <Calendar className="w-4 h-4" />
                <span>Next billing: Feb 10, 2025</span>
              </div>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                Cancel Plan
              </button>
            </div>

            {/* Billing Interval Toggle */}
            <div className="p-1 rounded-xl" style={{ backgroundColor: colors.surface }}>
              <div className="flex">
                <button className="flex-1 py-2.5 text-sm font-medium rounded-lg" style={{ backgroundColor: 'white', color: colors.text }}>
                  Monthly
                </button>
                <button className="flex-1 py-2.5 text-sm font-medium rounded-lg flex flex-col items-center" style={{ color: colors.textSecondary }}>
                  <span>Yearly</span>
                  <span className="text-xs font-medium" style={{ color: '#16A34A' }}>2 months free</span>
                </button>
              </div>
            </div>

            {/* Available Plans */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: colors.text }}>Available Plans</h3>
              <div className="space-y-3">
                {[
                  { name: 'Starter', price: '$9', desc: 'Perfect for small shops', popular: false, current: false },
                  { name: 'Pro', price: '$29', desc: 'For growing businesses', popular: true, current: true },
                  { name: 'Business', price: '$79', desc: 'For large operations', popular: false, current: false },
                ].map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-4 relative"
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: '12px',
                      border: plan.current ? `2px solid ${theme.primaryColor}` : plan.popular ? '2px solid #A855F7' : `1px solid ${colors.border}`,
                    }}
                  >
                    {plan.popular && (
                      <span
                        className="absolute -top-2 right-4 text-xs px-2 py-0.5 font-medium"
                        style={{ backgroundColor: '#F3E8FF', color: '#7C3AED', borderRadius: '4px' }}
                      >
                        Popular
                      </span>
                    )}
                    {plan.current && (
                      <span
                        className="absolute -top-2 right-4 text-xs px-2 py-0.5 font-medium"
                        style={{ backgroundColor: '#DBEAFE', color: '#2563EB', borderRadius: '4px' }}
                      >
                        Current
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold" style={{ color: colors.text }}>{plan.name}</h4>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>{plan.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold" style={{ color: colors.text }}>{plan.price}</span>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>/mo</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs" style={{ color: colors.textSecondary }}>
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" style={{ color: '#16A34A' }} /> Unlimited products</span>
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" style={{ color: '#16A34A' }} /> Priority support</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold" style={{ color: colors.text }}>Payment Methods</h3>
                <button className="text-sm font-medium flex items-center gap-1" style={{ color: theme.primaryColor }}>
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div
                className="p-4 flex items-center gap-3"
                style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.bg }}>
                  <CreditCard className="w-6 h-6" style={{ color: colors.textSecondary }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: colors.text }}>Visa •••• 4242</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>Default</span>
                  </div>
                  <span className="text-xs" style={{ color: colors.textSecondary }}>Expires 12/25</span>
                </div>
                <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
              </div>
            </div>

            {/* Invoices */}
            <div>
              <h3 className="font-bold mb-3" style={{ color: colors.text }}>Invoice History</h3>
              <div className="space-y-2">
                {[
                  { date: 'Jan 10, 2025', amount: '$29.00', status: 'Paid' },
                  { date: 'Dec 10, 2024', amount: '$29.00', status: 'Paid' },
                  { date: 'Nov 10, 2024', amount: '$29.00', status: 'Paid' },
                ].map((invoice, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center gap-3"
                    style={{ backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}` }}
                  >
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#DBEAFE' }}>
                      <FileText className="w-5 h-5" style={{ color: '#2563EB' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>Subscription</p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>{invoice.amount}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>{invoice.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'shop-settings':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Shop Settings
            </h2>
            <button className="text-sm font-medium" style={{ color: theme.primaryColor }}>
              Save
            </button>
          </div>

          {/* Tab Bar */}
          <div className="px-4 pb-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {['General', 'Business', 'Payment', 'Notifications', 'SEO', 'Advanced'].map((tab, idx) => {
                const isActive = idx === settingsTabIndex;
                return (
                  <button
                    key={tab}
                    onClick={() => setSettingsTabIndex(idx)}
                    className="px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                    style={{
                      backgroundColor: isActive ? theme.primaryColor : 'transparent',
                      color: isActive ? 'white' : colors.textSecondary,
                      borderRadius,
                      border: isActive ? 'none' : `1px solid ${colors.border}`,
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content based on settingsTabIndex */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {settingsTabIndex === 0 && (
              /* General Tab Content */
              <>
                {/* Shop Name */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Shop Name <span style={{ color: theme.primaryColor }}>*</span>
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>{displayShopName}</span>
                  </div>
                </div>

                {/* Shop Slug */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Shop Slug <span style={{ color: theme.primaryColor }}>*</span>
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.textSecondary }}>my-shop</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>URL: yoursite.com/shop/my-shop</p>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Description
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}`, minHeight: 80 }}
                  >
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Describe your shop...</span>
                  </div>
                </div>

                {/* Shop Logo */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Shop Logo
                  </label>
                  {displayShopLogo ? (
                    <div className="relative inline-block">
                      <img src={displayShopLogo} alt="Shop Logo" className="w-24 h-24 rounded-xl object-cover" style={{ border: `1px solid ${colors.border}` }} />
                      <button
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#DC2626' }}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-xl flex flex-col items-center justify-center"
                      style={{ backgroundColor: colors.surface, border: `2px dashed ${colors.border}` }}
                    >
                      <Upload className="w-6 h-6 mb-1" style={{ color: colors.textSecondary }} />
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Upload</span>
                    </div>
                  )}
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>Recommended: 200x200px</p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Email
                  </label>
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <Mail className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>{displayShopName?.toLowerCase().replace(/\s+/g, '')}@shop.com</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Phone
                  </label>
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <Phone className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>+1 234 567 8900</span>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Address
                  </label>
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <MapPin className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>123 Business St, City</span>
                  </div>
                </div>
              </>
            )}

            {settingsTabIndex === 1 && (
              /* Business Tab Content */
              <>
                {/* Business Type */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Business Type
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>Retail Store</span>
                  </div>
                </div>

                {/* Business Registration */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Business Registration Number
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.textSecondary }}>BR-123456789</span>
                  </div>
                </div>

                {/* Tax ID */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Tax ID / VAT Number
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.textSecondary }}>VAT-987654321</span>
                  </div>
                </div>

                {/* Business Hours */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Business Hours
                  </label>
                  {['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'].map((hours, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 mb-2 flex items-center gap-2"
                      style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                    >
                      <Clock className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="text-sm" style={{ color: colors.text }}>{hours}</span>
                    </div>
                  ))}
                </div>

                {/* Currency */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Currency
                  </label>
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>USD ($)</span>
                    <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
                  </div>
                </div>
              </>
            )}

            {settingsTabIndex === 2 && (
              /* Payment Tab Content */
              <>
                {/* Payment Methods */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Payment Methods
                  </label>
                  {[
                    { name: 'Credit/Debit Card', enabled: true, icon: CreditCard },
                    { name: 'Cash on Delivery', enabled: true, icon: DollarSign },
                    { name: 'Bank Transfer', enabled: false, icon: Wallet },
                  ].map((method, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 mb-2 flex items-center justify-between"
                      style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                    >
                      <div className="flex items-center gap-3">
                        <method.icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                        <span className="text-sm" style={{ color: colors.text }}>{method.name}</span>
                      </div>
                      <div
                        className="w-10 h-6 rounded-full p-1"
                        style={{ backgroundColor: method.enabled ? theme.primaryColor : colors.border }}
                      >
                        <div
                          className="w-4 h-4 rounded-full bg-white transition-transform"
                          style={{ transform: method.enabled ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bank Account */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Bank Account for Payouts
                  </label>
                  <div
                    className="p-4"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <p className="text-sm font-medium" style={{ color: colors.text }}>**** **** **** 4521</p>
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>Bank of America • Checking</p>
                  </div>
                </div>

                {/* Minimum Payout */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Minimum Payout Amount
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>$50.00</span>
                  </div>
                </div>
              </>
            )}

            {settingsTabIndex === 3 && (
              /* Notifications Tab Content */
              <>
                {/* Email Notifications */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Email Notifications
                  </label>
                  {[
                    { label: 'New Order', desc: 'Get notified when you receive a new order', enabled: true },
                    { label: 'Order Shipped', desc: 'Notify when order is shipped', enabled: true },
                    { label: 'Low Stock Alert', desc: 'Alert when product stock is low', enabled: true },
                    { label: 'New Review', desc: 'Get notified of new customer reviews', enabled: false },
                  ].map((notif, idx) => (
                    <div
                      key={idx}
                      className="p-3 mb-2 flex items-center justify-between"
                      style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.text }}>{notif.label}</p>
                        <p className="text-xs" style={{ color: colors.textSecondary }}>{notif.desc}</p>
                      </div>
                      <div
                        className="w-10 h-6 rounded-full p-1"
                        style={{ backgroundColor: notif.enabled ? theme.primaryColor : colors.border }}
                      >
                        <div
                          className="w-4 h-4 rounded-full bg-white transition-transform"
                          style={{ transform: notif.enabled ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Push Notifications */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Push Notifications
                  </label>
                  {[
                    { label: 'Order Updates', enabled: true },
                    { label: 'Promotional Alerts', enabled: false },
                    { label: 'Daily Summary', enabled: true },
                  ].map((notif, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 mb-2 flex items-center justify-between"
                      style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                    >
                      <span className="text-sm" style={{ color: colors.text }}>{notif.label}</span>
                      <div
                        className="w-10 h-6 rounded-full p-1"
                        style={{ backgroundColor: notif.enabled ? theme.primaryColor : colors.border }}
                      >
                        <div
                          className="w-4 h-4 rounded-full bg-white transition-transform"
                          style={{ transform: notif.enabled ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {settingsTabIndex === 4 && (
              /* SEO Tab Content */
              <>
                {/* Meta Title */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Meta Title
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>{displayShopName} - Official Store</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>50/60 characters</p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Meta Description
                  </label>
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}`, minHeight: 80 }}
                  >
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Shop the best products at {displayShopName}. Quality items, fast shipping, great prices.</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>120/160 characters</p>
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: colors.text }}>
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['fashion', 'clothing', 'accessories', 'shop online'].map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs rounded-full"
                        style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Preview */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Social Media Preview
                  </label>
                  <div
                    className="p-3"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <div className="h-24 rounded-lg mb-2" style={{ backgroundColor: colors.border }} />
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{displayShopName}</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>yoursite.com/shop/my-shop</p>
                  </div>
                </div>
              </>
            )}

            {settingsTabIndex === 5 && (
              /* Advanced Tab Content */
              <>
                {/* Maintenance Mode */}
                <div
                  className="p-4 flex items-center justify-between"
                  style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>Maintenance Mode</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>Temporarily close your shop</p>
                  </div>
                  <div
                    className="w-10 h-6 rounded-full p-1"
                    style={{ backgroundColor: colors.border }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </div>
                </div>

                {/* Inventory Settings */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Inventory Settings
                  </label>
                  <div
                    className="p-3 mb-2 flex items-center justify-between"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>Track Inventory</span>
                    <div
                      className="w-10 h-6 rounded-full p-1"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white" style={{ transform: 'translateX(16px)' }} />
                    </div>
                  </div>
                  <div
                    className="p-3 flex items-center justify-between"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <span className="text-sm" style={{ color: colors.text }}>Low Stock Threshold</span>
                    <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>10 units</span>
                  </div>
                </div>

                {/* Data Export */}
                <div>
                  <label className="text-sm font-bold mb-2 block" style={{ color: colors.text }}>
                    Data Export
                  </label>
                  <button
                    className="w-full px-4 py-3 text-sm font-medium flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}`, color: colors.text }}
                  >
                    <FileText className="w-4 h-4" />
                    Export Products (CSV)
                  </button>
                  <button
                    className="w-full px-4 py-3 mt-2 text-sm font-medium flex items-center justify-center gap-2"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}`, color: colors.text }}
                  >
                    <FileText className="w-4 h-4" />
                    Export Orders (CSV)
                  </button>
                </div>

                {/* Danger Zone */}
                <div
                  className="p-4"
                  style={{ backgroundColor: '#FEF2F2', borderRadius, border: '1px solid #FECACA' }}
                >
                  <p className="text-sm font-bold mb-2" style={{ color: '#DC2626' }}>Danger Zone</p>
                  <button
                    className="w-full px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: '#DC2626', color: 'white', borderRadius }}
                  >
                    Delete Shop
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      );

    case 'notifications':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: colors.bg }}>
          <div className="flex items-center justify-between px-4 py-3">
            <button className="p-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Notifications
            </h2>
            <span className="text-sm" style={{ color: theme.primaryColor }}>Clear All</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {[
              { icon: ShoppingCart, title: 'New Order', desc: 'Order #12345 received', time: '5 min ago', unread: true },
              { icon: Star, title: 'New Review', desc: 'Customer left 5-star review', time: '1 hour ago', unread: true },
              { icon: Package, title: 'Low Stock', desc: 'Wireless Headphones running low', time: '3 hours ago', unread: false },
              { icon: DollarSign, title: 'Payment Received', desc: '$89.99 deposited to wallet', time: 'Yesterday', unread: false },
            ].map((notif, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4"
                style={{
                  backgroundColor: notif.unread ? theme.primaryColor + '10' : colors.surface,
                  borderRadius,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: theme.primaryColor + '20' }}
                >
                  <notif.icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.text }}>{notif.title}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{notif.desc}</p>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{notif.time}</p>
                </div>
                {notif.unread && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                )}
              </div>
            ))}
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
              { name: 'John Doe', message: 'Is this product still available?', time: '2 min', unread: 2 },
              { name: 'Alice Smith', message: 'Thank you for the quick delivery!', time: '1 hour', unread: 0 },
              { name: 'Bob Johnson', message: 'Can I get a discount on bulk order?', time: '3 hours', unread: 1 },
              { name: 'Support Team', message: 'Your payout has been processed', time: 'Yesterday', unread: 0 },
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

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <span style={{ color: colors.textSecondary }}>Screen: {screen}</span>
        </div>
      );
  }
}

// Helper Component
function OrderCard({
  colors,
  theme,
  borderRadius,
  status = 'Delivered',
  statusColor
}: {
  colors: any;
  theme: any;
  borderRadius: string;
  status?: string;
  statusColor?: string;
}) {
  const badgeColor = statusColor || theme.primaryColor;

  return (
    <div
      className="p-3"
      style={{ backgroundColor: colors.surface, borderRadius }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: colors.text }}>
          Order #12345
        </span>
        <span
          className="text-xs px-2 py-1"
          style={{
            backgroundColor: badgeColor + '20',
            color: badgeColor,
            borderRadius: theme.borderRadius === 'full' ? '9999px' : borderRadius
          }}
        >
          {status}
        </span>
      </div>
      <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>
        2 items - $89.99
      </p>
    </div>
  );
}

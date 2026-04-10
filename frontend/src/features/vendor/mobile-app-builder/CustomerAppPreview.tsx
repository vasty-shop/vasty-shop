'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  Bell,
  ChevronRight,
  ChevronLeft,
  Star,
  Package,
  CheckCircle,
  Menu,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  Phone,
  MessageCircle,
  Camera,
  Settings,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  Filter,
  Grid,
  List,
  Trash2,
  Plus,
  Minus,
  Image,
  Send,
  X,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  XCircle,
  ThumbsUp,
  Edit3,
  Copy,
  Share2,
  BellRing,
  Calendar,
} from 'lucide-react';
import type { MobileAppConfig } from './types';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

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

interface CustomerAppPreviewProps {
  screen: string;
  config: MobileAppConfig;
  colors: any;
  darkMode: boolean;
  borderRadius: string;
  onNavigate?: (screen: string) => void;
  onMenuClick?: () => void;
  // Cart props
  cartItems?: CartItem[];
  addToCart?: (item: {id: string; name: string; price: number; image?: string}) => void;
  removeFromCart?: (id: string) => void;
  updateCartQuantity?: (id: string, quantity: number) => void;
  clearCart?: () => void;
  // Wishlist props
  wishlistItems?: string[];
  toggleWishlist?: (id: string) => void;
  isInWishlist?: (id: string) => boolean;
  // Shop data props
  shopProducts?: ShopProduct[];
  shopCategories?: ShopCategory[];
  shopName?: string;
  shopLogo?: string;
  shopBanner?: string;
  shopOrders?: ShopOrder[];
}

// Default sample products (fallback when no shop data)
const DEFAULT_SAMPLE_PRODUCTS = [
  { id: '1', name: 'Premium Wireless Headphones', price: 79.99, salePrice: 59.99, brand: 'SoundMax', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', rating: 4.5, category: 'Electronics' },
  { id: '2', name: 'Classic Cotton T-Shirt', price: 29.99, salePrice: undefined, brand: 'Urban Style', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', rating: 4.2, category: 'Clothing' },
  { id: '3', name: 'Running Sneakers Pro', price: 129.99, salePrice: 99.99, brand: 'SportFlex', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', rating: 4.8, category: 'Sports' },
  { id: '4', name: 'Smart Watch Series 5', price: 199.99, salePrice: undefined, brand: 'TechTime', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', rating: 4.6, category: 'Electronics' },
];

const DEFAULT_SAMPLE_CATEGORIES = [
  { id: '1', name: 'Electronics', image: '', productCount: 45 },
  { id: '2', name: 'Clothing', image: '', productCount: 120 },
  { id: '3', name: 'Sports', image: '', productCount: 78 },
  { id: '4', name: 'Home & Garden', image: '', productCount: 56 },
];

export function CustomerAppPreview({
  screen,
  config,
  colors,
  darkMode,
  borderRadius,
  onNavigate,
  onMenuClick,
  cartItems = [],
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  wishlistItems = [],
  toggleWishlist,
  isInWishlist,
  shopProducts = [],
  shopCategories = [],
  shopName,
  shopLogo,
  shopBanner,
  shopOrders = [],
}: CustomerAppPreviewProps) {
  const { t } = useTranslation();
  const { theme, appName, appIcon } = config;

  // Always use demo data for preview (real data is used in actual storefront)
  const products = DEFAULT_SAMPLE_PRODUCTS;
  const categories = DEFAULT_SAMPLE_CATEGORIES;
  const displayShopName = shopName || appName || 'Store';

  // Demo orders for preview with statusKey for filtering
  const demoOrders = [
    { orderNumber: '12345', date: 'Jan 10, 2026', status: 'Delivered', statusKey: 'delivered', statusColor: '#22C55E', items: 3, total: '$149.99' },
    { orderNumber: '12344', date: 'Jan 08, 2026', status: 'Shipped', statusKey: 'shipped', statusColor: '#8B5CF6', items: 2, total: '$89.50' },
    { orderNumber: '12343', date: 'Jan 05, 2026', status: 'Processing', statusKey: 'processing', statusColor: '#3B82F6', items: 1, total: '$49.99' },
    { orderNumber: '12342', date: 'Jan 04, 2026', status: 'Pending', statusKey: 'pending', statusColor: '#F59E0B', items: 2, total: '$75.00' },
    { orderNumber: '12341', date: 'Jan 03, 2026', status: 'Cancelled', statusKey: 'cancelled', statusColor: '#EF4444', items: 1, total: '$29.99' },
    { orderNumber: '12340', date: 'Jan 02, 2026', status: 'Delivered', statusKey: 'delivered', statusColor: '#22C55E', items: 4, total: '$199.99' },
  ];

  // Local state for UI interactions
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Address, 1: Delivery, 2: Payment, 3: Review
  const [ordersTabIndex, setOrdersTabIndex] = useState(0); // Orders page tab filter
  const [selectedShippingIndex, setSelectedShippingIndex] = useState(0); // Checkout shipping address selection
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0); // Checkout delivery method selection
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0); // Checkout payment method selection

  // Tab filter mapping: 0=All, 1=Pending, 2=Processing, 3=Shipped, 4=Delivered, 5=Cancelled
  const orderTabFilters = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const filteredOrders = ordersTabIndex === 0
    ? demoOrders
    : demoOrders.filter(order => order.statusKey === orderTabFilters[ordersTabIndex]);

  switch (screen) {
    case 'home':
      return (
        <div className="flex flex-col h-full" style={{ backgroundColor: '#F5F5F5' }}>
          {/* App Bar - Flutter Style */}
          <div
            className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
            style={{ backgroundColor: 'white' }}
          >
            <button onClick={onMenuClick} className="p-2 -ml-2">
              <Menu className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <div className="flex items-center gap-2">
              {shopLogo ? (
                <img src={shopLogo} alt={shopName || appName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <Package className="w-6 h-6" style={{ color: theme.primaryColor }} />
              )}
              <span className="font-bold" style={{ color: colors.text }}>
                {shopName || appName || 'database'}
              </span>
            </div>
            {/* Cart with badge */}
            <button className="p-2 relative" onClick={() => onNavigate?.('cart')}>
              <ShoppingCart className="w-6 h-6" style={{ color: colors.text }} />
              {cartItems.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              {/* Search Bar - Flutter Style */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: 'white', borderRadius, border: `1px solid ${colors.border}` }}
              >
                <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
                <span className="flex-1 text-sm" style={{ color: colors.textSecondary }}>
                  Search products...
                </span>
                <Filter className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </div>
            </div>

            {/* Categories Section - Flutter Style */}
            <div className="px-4 py-3">
              <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
                Categories
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {categories.slice(0, 6).map((cat) => (
                  <div key={cat.id} className="flex-shrink-0 w-20 text-center cursor-pointer" onClick={() => onNavigate?.('categories')}>
                    {cat.image ? (
                      <div
                        className="w-14 h-14 mx-auto rounded-full mb-2 bg-cover bg-center"
                        style={{ backgroundImage: `url(${cat.image})` }}
                      />
                    ) : (
                      <div
                        className="w-14 h-14 mx-auto rounded-full mb-2 flex items-center justify-center"
                        style={{ backgroundColor: theme.primaryColor + '15' }}
                      >
                        <Package className="w-7 h-7" style={{ color: theme.primaryColor }} />
                      </div>
                    )}
                    <span className="text-xs truncate block" style={{ color: colors.text }}>
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Products - Flutter Style Horizontal Scroll */}
            <div className="px-4 py-3">
              <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
                Featured Products
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-44 overflow-hidden cursor-pointer"
                    style={{ backgroundColor: 'white', borderRadius }}
                    onClick={() => onNavigate?.('product-detail')}
                  >
                    <div
                      className="h-28"
                      style={{
                        backgroundColor: colors.border,
                        backgroundImage: product.image ? `url(${product.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="p-3">
                      <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>{product.brand || product.category || shopName || 'Brand'}</p>
                      <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 my-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>{product.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: theme.primaryColor }}>${product.price.toFixed(2)}</span>
                        {product.salePrice && (
                          <span className="text-xs line-through" style={{ color: colors.textSecondary }}>${product.salePrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Products - Flutter Style Grid */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                  All Products
                </h3>
                <button className="flex items-center gap-1 text-sm" style={{ color: theme.primaryColor }}>
                  <Filter className="w-4 h-4" />
                  Sort
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className="overflow-hidden relative"
                    style={{ backgroundColor: 'white', borderRadius }}
                  >
                    <div
                      className="h-24 relative cursor-pointer"
                      style={{
                        backgroundColor: colors.border,
                        backgroundImage: product.image ? `url(${product.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      onClick={() => onNavigate?.('product-detail')}
                    >
                      {i === 0 && (
                        <span
                          className="absolute top-2 left-2 text-xs px-2 py-0.5 text-white rounded"
                          style={{ backgroundColor: '#EF4444' }}
                        >
                          -20%
                        </span>
                      )}
                      {/* Wishlist heart button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist?.(product.id);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                      >
                        <Heart
                          className={`w-4 h-4 ${isInWishlist?.(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                          style={{ color: isInWishlist?.(product.id) ? '#EF4444' : colors.textSecondary }}
                        />
                      </button>
                    </div>
                    <div className="p-2 cursor-pointer" onClick={() => onNavigate?.('product-detail')}>
                      <p className="text-xs mb-0.5" style={{ color: colors.textSecondary }}>{product.brand || product.category}</p>
                      <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 my-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs" style={{ color: colors.textSecondary }}>{product.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart?.(product);
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'product-detail':
      return (
        <div className="flex flex-col h-full">
          {/* Header with Back Button */}
          <div
            className="flex items-center gap-3 p-4 sticky top-0 z-10"
            style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => onNavigate?.('home')}
              className="p-2 -ml-2"
              style={{ color: colors.text }}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="font-semibold flex-1" style={{ color: colors.text }}>
              Product Details
            </h2>
            {/* Wishlist button - Uses Accent Color */}
            <button
              className="p-2"
              onClick={() => toggleWishlist?.('1')}
              style={{ color: isInWishlist?.('1') ? '#EF4444' : theme.accentColor }}
            >
              <Heart className={`w-5 h-5 ${isInWishlist?.('1') ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Product Image */}
            <div
              className="w-full h-64"
              style={{ backgroundColor: colors.border }}
            />

            {/* Product Info */}
            <div className="p-4 space-y-4">
              {/* Title and Price */}
              <div>
                <h1 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                  Premium Wireless Headphones
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                    $29.99
                  </span>
                  <span className="text-sm line-through" style={{ color: colors.textSecondary }}>
                    $39.99
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  4.5 (1,234 reviews)
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                  Description
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                  Experience premium sound quality with our latest wireless headphones.
                  Features advanced noise cancellation, 30-hour battery life, and comfortable design
                  perfect for all-day use.
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                  Features
                </h3>
                <div className="space-y-2">
                  {[
                    'Active Noise Cancellation',
                    '30-Hour Battery Life',
                    'Bluetooth 5.0',
                    'Premium Sound Quality'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span className="text-sm" style={{ color: colors.text }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Options - Shows all brand colors */}
              <div>
                <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                  Color
                </h3>
                <div className="flex gap-2">
                  {[
                    { color: theme.primaryColor, label: 'Primary' },
                    { color: theme.secondaryColor, label: 'Secondary' },
                    { color: theme.accentColor, label: 'Accent' }
                  ].map(({ color, label }) => (
                    <button
                      key={label}
                      className="w-8 h-8 border-2"
                      style={{
                        backgroundColor: color,
                        borderColor: label === 'Primary' ? color : colors.border,
                        borderRadius: borderRadius
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: colors.text }}>
                    Customer Reviews
                  </h3>
                  <button className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                    See All
                  </button>
                </div>

                {/* Review Stats */}
                <div
                  className="p-4 mb-4"
                  style={{ backgroundColor: colors.surface, borderRadius }}
                >
                  <div className="flex items-center gap-4">
                    {/* Average Rating */}
                    <div className="text-center">
                      <span className="text-4xl font-bold" style={{ color: colors.text }}>4.5</span>
                      <div className="flex items-center justify-center gap-0.5 my-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>
                        1,234 reviews
                      </span>
                    </div>
                    {/* Rating Bars */}
                    <div className="flex-1 space-y-1">
                      {[
                        { stars: 5, percent: 70 },
                        { stars: 4, percent: 20 },
                        { stars: 3, percent: 5 },
                        { stars: 2, percent: 3 },
                        { stars: 1, percent: 2 },
                      ].map((rating) => (
                        <div key={rating.stars} className="flex items-center gap-2">
                          <span className="text-xs w-3" style={{ color: colors.textSecondary }}>
                            {rating.stars}
                          </span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: colors.border }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${rating.percent}%`, backgroundColor: '#FACC15' }}
                            />
                          </div>
                          <span className="text-xs w-8" style={{ color: colors.textSecondary }}>
                            {rating.percent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Write Review Button */}
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full py-3 mb-4 font-semibold flex items-center justify-center gap-2"
                  style={{
                    border: `1px solid ${theme.primaryColor}`,
                    color: theme.primaryColor,
                    borderRadius
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  {showReviewForm ? 'Cancel' : 'Write Review'}
                </button>

                {/* Review Form */}
                {showReviewForm && (
                  <div
                    className="p-4 mb-4 space-y-4"
                    style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
                  >
                    <h4 className="font-semibold" style={{ color: colors.text }}>Write Your Review</h4>

                    {/* Rating Selection */}
                    <div>
                      <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>Your Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : ''}`}
                              style={{ color: star <= reviewRating ? '#FACC15' : colors.border }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>Your Review</p>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full p-3 text-sm resize-none outline-none"
                        style={{
                          backgroundColor: colors.bg,
                          borderRadius,
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                          minHeight: '100px'
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(0);
                        setReviewText('');
                      }}
                      className="w-full py-3 font-semibold text-white"
                      style={{ backgroundColor: theme.primaryColor, borderRadius }}
                    >
                      Submit Review
                    </button>
                  </div>
                )}

                {/* Review Cards */}
                <div className="space-y-3">
                  {[
                    { name: 'Sarah M.', rating: 5, comment: 'Excellent product! The sound quality is amazing and battery lasts forever.', date: '2 days ago', helpful: 12 },
                    { name: 'John D.', rating: 4, comment: 'Great value for money. Comfortable to wear for long periods.', date: '1 week ago', helpful: 8 },
                  ].map((review, idx) => (
                    <div
                      key={idx}
                      className="p-3"
                      style={{ backgroundColor: colors.surface, borderRadius }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: theme.primaryColor + '20' }}
                        >
                          <User className="w-5 h-5" style={{ color: theme.primaryColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm" style={{ color: colors.text }}>
                                {review.name}
                              </span>
                              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                            </div>
                            <span className="text-xs" style={{ color: colors.textSecondary }}>
                              {review.date}
                            </span>
                          </div>
                          {/* Stars */}
                          <div className="flex items-center gap-0.5 my-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {/* Comment */}
                          <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                            {review.comment}
                          </p>
                          {/* Helpful Button */}
                          <button
                            className="flex items-center gap-1.5 mt-2 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div
            className="p-4 space-y-3"
            style={{
              backgroundColor: colors.surface,
              borderTop: `1px solid ${colors.border}`
            }}
          >
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: colors.text }}>
                Quantity
              </span>
              <div className="flex items-center gap-3">
                <button
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    backgroundColor: colors.border,
                    borderRadius
                  }}
                >
                  <span style={{ color: colors.text }}>-</span>
                </button>
                <span className="w-8 text-center font-semibold" style={{ color: colors.text }}>
                  1
                </span>
                <button
                  className="w-8 h-8 flex items-center justify-center"
                  style={{
                    backgroundColor: colors.border,
                    borderRadius
                  }}
                >
                  <span style={{ color: colors.text }}>+</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Buy Now - Secondary Color */}
              <button
                onClick={() => {
                  addToCart?.({ id: '1', name: 'Premium Wireless Headphones', price: 79.99 });
                  onNavigate?.('checkout');
                }}
                className="flex-1 py-3 font-semibold flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'transparent',
                  border: `2px solid ${theme.secondaryColor}`,
                  color: theme.secondaryColor,
                  borderRadius
                }}
              >
                Buy Now
              </button>
              {/* Add to Cart - Primary Color */}
              <button
                onClick={() => {
                  addToCart?.({ id: '1', name: 'Premium Wireless Headphones', price: 79.99 });
                  onNavigate?.('cart');
                }}
                className="flex-1 py-3 font-semibold text-white flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      );

    case 'categories':
      return (
        <div className="space-y-4">
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 sticky top-0 z-10"
            style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}` }}
          >
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2"
              style={{ color: colors.text }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              Categories
            </h2>
          </div>

          <div className="px-4 space-y-4">
            {/* Search Bar */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                placeholder={t('vendor.placeholders.searchCategories')}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: colors.text }}
              />
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category, index) => {
                const categoryColors = ['#007AFF', '#FF2D55', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5856D6', '#00C7BE'];
                const categoryIcons = ['📦', '👕', '🏡', '⚽', '📚', '🧸', '💄', '🚗'];
                const color = categoryColors[index % categoryColors.length];
                const icon = categoryIcons[index % categoryIcons.length];
                return (
                  <div
                    key={category.id}
                    className="p-4 rounded-2xl cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: colors.surface }}
                    onClick={() => onNavigate?.('home')}
                  >
                    {category.image ? (
                      <div
                        className="w-14 h-14 rounded-2xl mb-3 bg-cover bg-center"
                        style={{ backgroundImage: `url(${category.image})` }}
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3"
                        style={{ backgroundColor: color + '15' }}
                      >
                        {icon}
                      </div>
                    )}
                    <h3 className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
                      {category.name}
                    </h3>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {category.productCount || 0} items
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );

    case 'cart':
      const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const cartTax = cartSubtotal * 0.08;
      const cartTotal = cartSubtotal + cartTax;
      const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      return (
        <div className="flex flex-col h-full" style={{ backgroundColor: '#F9FAFB' }}>
          {/* AppBar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: 'white' }}
          >
            <button
              onClick={() => onNavigate?.('home')}
              className="p-2 -ml-2"
              style={{ color: colors.text }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold" style={{ color: colors.text }}>
              Shopping Cart
            </h2>
            <button onClick={clearCart} className="text-sm font-medium" style={{ color: theme.primaryColor }}>
              Clear All
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="w-20 h-20 mb-4" style={{ color: '#D1D5DB' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Your cart is empty</h3>
                <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
                  Browse our products and add items to your cart
                </p>
                <button
                  onClick={() => onNavigate?.('home')}
                  className="px-6 py-3 font-semibold text-white"
                  style={{ backgroundColor: theme.primaryColor, borderRadius: '12px' }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl flex gap-3"
                  style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                >
                  {/* Product Image */}
                  <div className="w-[90px] h-[90px] rounded-lg flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }} />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <p className="font-semibold text-sm truncate" style={{ color: colors.text }}>
                      {item.name}
                    </p>
                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                        ${item.price.toFixed(2)}
                      </span>
                      {/* Quantity Controls */}
                      <div
                        className="flex items-center rounded-lg overflow-hidden"
                        style={{ border: '1px solid #D1D5DB' }}
                      >
                        <button onClick={() => updateCartQuantity?.(item.id, item.quantity - 1)} className="p-1.5">
                          <Minus className="w-4 h-4" style={{ color: colors.text }} />
                        </button>
                        <span
                          className="px-3 text-sm font-bold"
                          style={{ color: colors.text }}
                        >
                          {item.quantity}
                        </span>
                        <button onClick={() => updateCartQuantity?.(item.id, item.quantity + 1)} className="p-1.5">
                          <Plus className="w-4 h-4" style={{ color: colors.text }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button onClick={() => removeFromCart?.(item.id)} className="p-1 self-start">
                    <Trash2 className="w-5 h-5" style={{ color: '#EF4444' }} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Order Summary - Bottom Sheet Style */}
          {cartItems.length > 0 && (
            <div
              className="p-5"
              style={{
                backgroundColor: 'white',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {/* Subtotal */}
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>Subtotal ({totalCartItems} items)</span>
                <span className="text-sm font-semibold" style={{ color: colors.text }}>${cartSubtotal.toFixed(2)}</span>
              </div>
              {/* Shipping */}
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>Shipping</span>
                <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>FREE</span>
              </div>
              {/* Tax */}
              <div className="flex justify-between mb-3">
                <span className="text-sm" style={{ color: '#6B7280' }}>Tax</span>
                <span className="text-sm font-semibold" style={{ color: colors.text }}>${cartTax.toFixed(2)}</span>
              </div>

              <div className="border-t my-3" style={{ borderColor: '#E5E7EB' }} />

              {/* Total */}
              <div className="flex justify-between mb-5">
                <span className="text-lg font-bold" style={{ color: colors.text }}>Total</span>
                <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>${cartTotal.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onNavigate?.('checkout')}
                className="w-full py-4 font-bold text-white text-lg"
                style={{ backgroundColor: theme.primaryColor, borderRadius: '12px' }}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      );

    case 'orders':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
          {/* AppBar */}
          <div className="px-4 py-3" style={{ backgroundColor: 'white' }}>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>My Orders</h2>
          </div>

          {/* Statistics Cards */}
          <div className="p-4 flex gap-3" style={{ backgroundColor: 'white' }}>
            {[
              { label: 'Total Orders', value: '12', icon: ShoppingBag, color: '#3B82F6' },
              { label: 'Processing', value: '2', icon: Truck, color: '#22C55E' },
              { label: 'Total Spent', value: '$1,250', icon: DollarSign, color: '#8B5CF6' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 p-3 rounded-xl"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="overflow-x-auto py-2 px-4" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
            <div className="flex gap-2">
              {[
                { label: 'All', icon: List },
                { label: 'Pending', icon: Clock },
                { label: 'Processing', icon: RefreshCw },
                { label: 'Shipped', icon: Truck },
                { label: 'Delivered', icon: CheckCircle },
                { label: 'Cancelled', icon: XCircle },
              ].map((tab, idx) => {
                const isActive = idx === ordersTabIndex;
                return (
                  <button
                    key={tab.label}
                    onClick={() => setOrdersTabIndex(idx)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all"
                    style={{
                      background: isActive ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}CC)` : '#F3F4F6',
                      color: isActive ? 'white' : '#6B7280',
                      boxShadow: isActive ? `0 3px 8px ${theme.primaryColor}40` : 'none',
                    }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 mb-4" style={{ color: colors.border }} />
                <p className="text-sm font-medium" style={{ color: colors.text }}>No orders found</p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>No orders with this status</p>
              </div>
            ) : filteredOrders.map((order) => (
              <div
                key={order.orderNumber}
                className="p-4 rounded-xl cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                onClick={() => onNavigate?.('order-detail')}
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold" style={{ color: colors.text }}>Order #{order.orderNumber}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{order.date}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                    style={{ backgroundColor: order.statusColor + '15', color: order.statusColor }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-b py-3 my-3" style={{ borderColor: '#E5E7EB' }}>
                  {/* Product Images Preview */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].slice(0, Math.min(order.items, 3)).map((i) => (
                      <div key={i} className="w-12 h-12 rounded-lg" style={{ backgroundColor: '#F3F4F6' }} />
                    ))}
                    {order.items > 3 && (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                        <span className="text-xs font-bold" style={{ color: '#6B7280' }}>+{order.items - 3}</span>
                      </div>
                    )}
                    <div className="ml-2">
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{order.items} items</p>
                      <p className="text-sm font-medium" style={{ color: colors.text }}>Product Name</p>
                    </div>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Total</p>
                    <p className="text-lg font-bold" style={{ color: theme.primaryColor }}>{order.total}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1"
                      style={{ border: `1px solid #F97316`, color: '#F97316' }}
                      onClick={(e) => { e.stopPropagation(); onNavigate?.('order-tracking'); }}
                    >
                      <Truck className="w-3.5 h-3.5" /> Track
                    </button>
                    <button
                      className="px-3 py-1.5 text-xs font-medium rounded-lg"
                      style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
                      onClick={(e) => { e.stopPropagation(); onNavigate?.('order-detail'); }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'profile':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
          {/* AppBar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: 'white' }}
          >
            <button onClick={() => onNavigate?.('home')} className="p-2 -ml-2" style={{ background: 'none', border: 'none' }}>
              <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
            </button>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>Personal Information</h2>
            <button className="text-sm font-semibold" style={{ color: theme.primaryColor, background: 'none', border: 'none' }}>
              Edit
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Avatar Section */}
            <div
              className="flex flex-col items-center py-8"
              style={{ backgroundColor: 'white' }}
            >
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ border: `3px solid ${theme.primaryColor}`, backgroundColor: theme.primaryColor + '15' }}
                >
                  <User className="w-12 h-12" style={{ color: theme.primaryColor }} />
                </div>
                <div
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor, border: '3px solid white' }}
                >
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>Upload Photo</p>
            </div>

            {/* Form Section */}
            <div
              className="mx-4 mt-4 p-5"
              style={{ backgroundColor: 'white', borderRadius: '16px' }}
            >
              {/* First Name */}
              <div className="mb-5">
                <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>First Name</p>
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                >
                  <User className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                  <span style={{ color: colors.text }}>John</span>
                </div>
              </div>

              {/* Last Name */}
              <div className="mb-5">
                <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Last Name</p>
                <div
                  className="px-4 py-3"
                  style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                >
                  <span style={{ color: colors.text }}>Doe</span>
                </div>
              </div>

              {/* Email */}
              <div className="mb-5">
                <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Email</p>
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                >
                  <Mail className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                  <span style={{ color: colors.text }}>customer@{displayShopName?.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Phone</p>
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                >
                  <Phone className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                  <span style={{ color: colors.text }}>+1 234 567 8900</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // ============= NEW SCREENS =============

    case 'splash':
      return (
        <div
          className="flex flex-col items-center justify-center h-full"
          style={{ backgroundColor: theme.primaryColor }}
        >
          {appIcon ? (
            <img src={appIcon} alt="App Logo" className="w-24 h-24 object-contain mb-4" />
          ) : (
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <ShoppingCart className="w-12 h-12 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{appName || 'Shop'}</h1>
          <div className="mt-8">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      );

    case 'onboarding':
      // Flutter-style onboarding with 3 slides
      const onboardingSlides = [
        {
          title: 'Discover',
          description: 'Explore thousands of products from your favorite brands',
          color: '#8B5CF6', // Purple
          icon: Package,
        },
        {
          title: 'Shop',
          description: 'Secure checkout with multiple payment options',
          color: '#EC4899', // Pink
          icon: Shield,
        },
        {
          title: 'Delivery',
          description: 'Fast and reliable delivery to your doorstep',
          color: '#3B82F6', // Blue
          icon: Truck,
        },
      ];
      const currentSlide = onboardingSlides[0]; // First slide shown
      return (
        <div className="flex flex-col h-full" style={{ backgroundColor: 'white' }}>
          {/* Skip button */}
          <div className="flex justify-end p-4">
            <button onClick={() => onNavigate?.('login')} className="text-base font-semibold" style={{ color: currentSlide.color }}>
              Skip
            </button>
          </div>

          {/* Slide Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div
              className="w-72 h-72 rounded-3xl mb-12 flex items-center justify-center"
              style={{ backgroundColor: currentSlide.color + '15' }}
            >
              <currentSlide.icon className="w-36 h-36" style={{ color: currentSlide.color }} />
            </div>
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: colors.text }}>
              {currentSlide.title}
            </h2>
            <p className="text-center text-base leading-relaxed" style={{ color: colors.textSecondary }}>
              {currentSlide.description}
            </p>
          </div>

          {/* Bottom Section */}
          <div className="p-6">
            {/* Page Indicator */}
            <div className="flex justify-center gap-3 mb-8">
              {onboardingSlides.map((slide, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-colors"
                  style={{ backgroundColor: i === 0 ? currentSlide.color : colors.border }}
                />
              ))}
            </div>

            {/* Next/Shop Now Button */}
            <button
              onClick={() => onNavigate?.('login')}
              className="w-full py-4 font-bold text-white text-lg"
              style={{ backgroundColor: currentSlide.color, borderRadius: '16px' }}
            >
              Next
            </button>
          </div>
        </div>
      );

    case 'login':
      return (
        <div className="flex flex-col h-full" style={{ backgroundColor: colors.bg }}>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="h-10" /> {/* Spacer */}
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: theme.primaryColor + '15' }}
              >
                <Package className="w-12 h-12" style={{ color: theme.primaryColor }} />
              </div>
            </div>
            {/* Title */}
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              Welcome Back
            </h1>
            <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
              Sign in to continue
            </p>
            {/* Form */}
            <div className="space-y-4">
              {/* Email Field */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
              >
                <Mail className="w-5 h-5" style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textSecondary }}>Email</span>
              </div>
              {/* Password Field */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: colors.surface, borderRadius, border: `1px solid ${colors.border}` }}
              >
                <Lock className="w-5 h-5" style={{ color: colors.textSecondary }} />
                <span className="flex-1 text-sm" style={{ color: colors.textSecondary }}>Password</span>
                <Eye className="w-5 h-5" style={{ color: colors.textSecondary }} />
              </div>
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ border: `2px solid ${colors.border}` }}
                  />
                  <span className="text-sm" style={{ color: colors.text }}>Remember me</span>
                </div>
                <button
                  onClick={() => onNavigate?.('forgot-password')}
                  className="text-sm font-medium"
                  style={{ color: theme.primaryColor }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            {/* Login Button */}
            <button
              className="w-full py-4 font-semibold text-white mt-6"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              Login
            </button>
            {/* OR Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>OR</span>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
            </div>
            {/* Social Login */}
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3"
                style={{ border: `1px solid ${colors.border}`, borderRadius }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#DB4437" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: colors.text }}>Google</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3"
                style={{ border: `1px solid ${colors.border}`, borderRadius }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: colors.text }}>Facebook</span>
              </button>
            </div>
            {/* Sign Up Link */}
            <p className="text-center text-sm mt-8" style={{ color: colors.textSecondary }}>
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate?.('signup')}
                className="font-semibold"
                style={{ color: theme.primaryColor }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      );

    case 'signup':
      return (
        <div className="flex flex-col h-full p-6" style={{ backgroundColor: colors.bg }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Create Account
          </h1>
          <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
            Join to shop
          </p>
          <div className="space-y-3">
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius }}
            >
              <User className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Full Name</span>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius }}
            >
              <Mail className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Email Address</span>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius }}
            >
              <Phone className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="text-sm" style={{ color: colors.textSecondary }}>Phone Number</span>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: colors.surface, borderRadius }}
            >
              <Lock className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="flex-1 text-sm" style={{ color: colors.textSecondary }}>Password</span>
              <Eye className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </div>
          </div>
          <div className="flex items-center gap-2 my-4">
            <div className="w-5 h-5 border-2 rounded" style={{ borderColor: colors.border }} />
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              I agree to the Terms & Conditions
            </span>
          </div>
          <button
            className="w-full py-3 font-semibold text-white mt-auto"
            style={{ backgroundColor: theme.primaryColor, borderRadius }}
          >
            Sign Up
          </button>
          <p className="text-center text-sm mt-4" style={{ color: colors.textSecondary }}>
            Already have an account?{' '}
            <span style={{ color: theme.primaryColor }}>Login</span>
          </p>
        </div>
      );

    case 'forgot-password':
      return (
        <div className="flex flex-col h-full p-6" style={{ backgroundColor: colors.bg }}>
          <button
            onClick={() => onNavigate?.('login')}
            className="w-10 h-10 flex items-center justify-center mb-4 -ml-2"
          >
            <ChevronLeft className="w-6 h-6" style={{ color: colors.text }} />
          </button>
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Forgot Password
          </h1>
          <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
            Enter your email to reset your password
          </p>
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{ backgroundColor: colors.surface, borderRadius }}
          >
            <Mail className="w-5 h-5" style={{ color: colors.textSecondary }} />
            <span className="text-sm" style={{ color: colors.textSecondary }}>Email Address</span>
          </div>
          <button
            className="w-full py-3 font-semibold text-white mt-6"
            style={{ backgroundColor: theme.primaryColor, borderRadius }}
          >
            Send Reset Link
          </button>
        </div>
      );

    case 'products':
      return (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
            style={{ backgroundColor: colors.bg }}
          >
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Products
            </h2>
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5" style={{ color: theme.primaryColor }} />
              <List className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </div>
          </div>
          <div className="px-4">
            <div
              className="flex items-center gap-3 px-4 py-3 mb-4"
              style={{ backgroundColor: colors.surface, borderRadius }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
              <span className="flex-1 text-sm" style={{ color: colors.textSecondary }}>Search products...</span>
              <Filter className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCard
                  key={i}
                  colors={colors}
                  theme={theme}
                  borderRadius={borderRadius}
                  onClick={() => onNavigate?.('product-detail')}
                />
              ))}
            </div>
          </div>
        </div>
      );

    case 'checkout':
      const checkoutStepsData = [
        { label: 'Shipping', icon: Truck },
        { label: 'Delivery', icon: Package },
        { label: 'Payment', icon: CreditCard },
        { label: 'Review', icon: ShoppingBag },
      ];
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 sticky top-0 z-10"
            style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => {
                if (checkoutStep > 0) {
                  setCheckoutStep(checkoutStep - 1);
                } else {
                  onNavigate?.('cart');
                }
              }}
              className="p-2 -ml-2"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: colors.text }} />
            </button>
            <h2 className="font-semibold" style={{ color: colors.text }}>Checkout</h2>
          </div>

          {/* Step Indicator - Flutter Style */}
          <div className="px-4 py-5" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center">
              {checkoutStepsData.map((step, i) => {
                const isActive = i === checkoutStep;
                const isCompleted = i < checkoutStep;
                const StepIcon = step.icon;

                return (
                  <React.Fragment key={step.label}>
                    {/* Step Dot */}
                    <button
                      onClick={() => isCompleted && setCheckoutStep(i)}
                      className="flex flex-col items-center"
                      disabled={!isCompleted}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: isCompleted
                            ? theme.primaryColor
                            : isActive
                              ? theme.primaryColor + '15'
                              : '#E5E7EB',
                          border: isActive ? `2px solid ${theme.primaryColor}` : 'none',
                          boxShadow: isActive ? `0 0 8px ${theme.primaryColor}40` : 'none',
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <StepIcon
                            className="w-5 h-5"
                            style={{ color: isActive ? theme.primaryColor : '#9CA3AF' }}
                          />
                        )}
                      </div>
                      <span
                        className="text-xs mt-1.5"
                        style={{
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? theme.primaryColor : isCompleted ? '#1F2937' : '#6B7280',
                        }}
                      >
                        {step.label}
                      </span>
                    </button>

                    {/* Connector Line */}
                    {i < checkoutStepsData.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-1 rounded-full"
                        style={{
                          backgroundColor: i < checkoutStep ? theme.primaryColor : '#E5E7EB',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Step 0: Shipping Address - Form Based (Flutter Style) */}
            {checkoutStep === 0 && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                {/* Contact Information Section */}
                <div className="mb-5">
                  <h4 className="font-semibold text-sm mb-4" style={{ color: colors.text }}>Contact Information</h4>

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                      Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <User className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="text-sm flex-1" style={{ color: colors.text }}>John Doe</span>
                    </div>
                  </div>

                  {/* Email and Phone Row */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                        Email <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <Mail className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        <span className="text-xs flex-1 truncate" style={{ color: colors.text }}>john@email.com</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                        Phone <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <Phone className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        <span className="text-xs flex-1" style={{ color: colors.text }}>+1 555-1234</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t my-4" style={{ borderColor: colors.border }} />

                {/* Shipping Address Section */}
                <div>
                  <h4 className="font-semibold text-sm mb-4" style={{ color: colors.text }}>Shipping Address</h4>

                  {/* Country Dropdown */}
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                      Country <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer"
                      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        <span className="text-sm" style={{ color: colors.text }}>United States</span>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                      Address Line 1 <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="text-sm flex-1" style={{ color: colors.text }}>123 Main Street</span>
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div className="mb-3">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                      Address Line 2 <span className="text-xs font-normal" style={{ color: colors.textSecondary }}>(Optional)</span>
                    </label>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      <Home className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="text-sm flex-1" style={{ color: colors.text }}>Apt 4B</span>
                    </div>
                  </div>

                  {/* City, State, ZIP Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                        City <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div
                        className="px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <span className="text-xs" style={{ color: colors.text }}>New York</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                        State <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <span className="text-xs" style={{ color: colors.text }}>NY</span>
                        <ChevronRight className="w-3 h-3" style={{ color: colors.textSecondary }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: colors.textSecondary }}>
                        ZIP <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div
                        className="px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <span className="text-xs" style={{ color: colors.text }}>10001</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Address Checkbox */}
                  <div className="flex items-start gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: theme.primaryColor + '08' }}>
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5"
                      style={{ borderColor: theme.primaryColor, backgroundColor: theme.primaryColor }}
                    >
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>Save this address</p>
                      <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Save for faster checkout next time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Delivery Method */}
            {checkoutStep === 1 && (
              <>
                <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Delivery Method</h3>
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>Choose how you want your order delivered</p>

                {[
                  { label: 'Standard Shipping', time: '5-7 business days', price: 'FREE', priceValue: 0, icon: Truck, badge: 'Eco-friendly' },
                  { label: 'Express Shipping', time: '2-3 business days', price: '$9.99', priceValue: 9.99, icon: Truck },
                  { label: 'Next Day Delivery', time: 'Order before 2pm', price: '$19.99', priceValue: 19.99, icon: Clock, badge: 'Fastest' },
                ].map((method, idx) => {
                  const isSelected = idx === selectedDeliveryIndex;
                  const MethodIcon = method.icon;
                  return (
                    <div
                      key={method.label}
                      onClick={() => setSelectedDeliveryIndex(idx)}
                      className="p-4 cursor-pointer transition-all mb-3"
                      style={{
                        backgroundColor: isSelected ? theme.primaryColor + '08' : colors.surface,
                        borderRadius,
                        border: isSelected ? `2px solid ${theme.primaryColor}` : `1px solid ${colors.border}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio Button */}
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                          style={{ borderColor: isSelected ? theme.primaryColor : colors.border }}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />}
                        </div>

                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: isSelected ? theme.primaryColor + '20' : colors.border + '40' }}
                        >
                          <MethodIcon className="w-5 h-5" style={{ color: isSelected ? theme.primaryColor : colors.textSecondary }} />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm" style={{ color: colors.text }}>{method.label}</p>
                            {method.badge && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded font-medium"
                                style={{
                                  backgroundColor: method.badge === 'Fastest' ? '#FEF3C7' : '#D1FAE5',
                                  color: method.badge === 'Fastest' ? '#D97706' : '#059669'
                                }}
                              >
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>{method.time}</p>
                        </div>

                        {/* Price */}
                        <span
                          className="font-bold text-sm"
                          style={{ color: method.priceValue === 0 ? theme.accentColor : colors.text }}
                        >
                          {method.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Step 2: Payment Method */}
            {checkoutStep === 2 && (
              <>
                <h3 className="font-semibold mb-1" style={{ color: colors.text }}>Payment Method</h3>
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>Select how you want to pay</p>

                {[
                  { label: 'Credit/Debit Card', subtitle: '**** **** **** 4242', icon: CreditCard, iconBg: theme.primaryColor },
                  { label: 'PayPal', subtitle: 'john.doe@email.com', iconText: 'PP', iconBg: '#003087' },
                  { label: 'Apple Pay', subtitle: 'Pay with Face ID', iconText: '', iconBg: '#000000' },
                  { label: 'Cash on Delivery', subtitle: 'Pay when you receive', icon: DollarSign, iconBg: '#059669' },
                ].map((method, idx) => {
                  const isSelected = idx === selectedPaymentIndex;
                  const PaymentIcon = method.icon;
                  return (
                    <div
                      key={method.label}
                      onClick={() => setSelectedPaymentIndex(idx)}
                      className="p-4 cursor-pointer transition-all mb-3"
                      style={{
                        backgroundColor: isSelected ? theme.primaryColor + '08' : colors.surface,
                        borderRadius,
                        border: isSelected ? `2px solid ${theme.primaryColor}` : `1px solid ${colors.border}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio Button */}
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                          style={{ borderColor: isSelected ? theme.primaryColor : colors.border }}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />}
                        </div>

                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: isSelected ? method.iconBg : method.iconBg + '20' }}
                        >
                          {PaymentIcon ? (
                            <PaymentIcon className="w-5 h-5" style={{ color: isSelected ? 'white' : method.iconBg }} />
                          ) : method.iconText ? (
                            <span className="text-xs font-bold" style={{ color: isSelected ? 'white' : method.iconBg }}>{method.iconText}</span>
                          ) : (
                            <span className="text-lg" style={{ color: isSelected ? 'white' : method.iconBg }}></span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <p className="font-semibold text-sm" style={{ color: colors.text }}>{method.label}</p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>{method.subtitle}</p>
                        </div>

                        {/* Checkmark for selected */}
                        {isSelected && (
                          <CheckCircle className="w-5 h-5" style={{ color: theme.primaryColor }} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add New Card */}
                <button
                  className="w-full p-4 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                  style={{
                    border: `2px dashed ${colors.border}`,
                    borderRadius,
                    color: theme.primaryColor,
                    backgroundColor: 'transparent'
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add New Payment Method
                </button>
              </>
            )}

            {/* Step 3: Review */}
            {checkoutStep === 3 && (
              <>
                <h3 className="font-semibold" style={{ color: colors.text }}>Order Review</h3>

                {/* Shipping Address Summary */}
                <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span className="font-medium text-sm" style={{ color: colors.text }}>Shipping Address</span>
                    </div>
                    <button onClick={() => setCheckoutStep(0)} className="text-xs" style={{ color: theme.primaryColor }}>Change</button>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>123 Main Street, Apt 4B, New York, NY 10001</p>
                </div>

                {/* Payment Summary */}
                <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span className="font-medium text-sm" style={{ color: colors.text }}>Payment Method</span>
                    </div>
                    <button onClick={() => setCheckoutStep(2)} className="text-xs" style={{ color: theme.primaryColor }}>Change</button>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>**** **** **** 4242</p>
                </div>

                {/* Delivery Method Summary */}
                <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      <span className="font-medium text-sm" style={{ color: colors.text }}>Delivery Method</span>
                    </div>
                    <button onClick={() => setCheckoutStep(1)} className="text-xs" style={{ color: theme.primaryColor }}>Change</button>
                  </div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Standard Shipping (5-7 days) - FREE</p>
                </div>

                {/* Order Items */}
                <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
                  <h4 className="font-medium text-sm mb-3" style={{ color: colors.text }}>Order Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</h4>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded" style={{ backgroundColor: colors.border }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate" style={{ color: colors.text }}>{item.name}</p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold" style={{ color: theme.primaryColor }}>${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="p-4" style={{ backgroundColor: colors.surface, borderRadius }}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Subtotal</span>
                      <span style={{ color: colors.text }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Shipping</span>
                      <span style={{ color: theme.accentColor }}>FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Tax</span>
                      <span style={{ color: colors.text }}>${(subtotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t" style={{ borderColor: colors.border }}>
                      <span style={{ color: colors.text }}>Total</span>
                      <span style={{ color: theme.primaryColor }}>${(subtotal * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <button
              onClick={() => {
                if (checkoutStep < 3) {
                  setCheckoutStep(checkoutStep + 1);
                } else {
                  clearCart?.();
                  setCheckoutStep(0);
                  onNavigate?.('orders');
                }
              }}
              className="w-full py-3 font-semibold text-white"
              style={{ backgroundColor: theme.primaryColor, borderRadius }}
            >
              {checkoutStep < 3 ? 'Continue' : 'Place Order'}
            </button>
          </div>
        </div>
      );

    case 'order-detail':
      return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
          {/* AppBar */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'white' }}>
            <button onClick={() => onNavigate?.('orders')} className="p-2 -ml-2">
              <ChevronLeft className="w-5 h-5" style={{ color: colors.text }} />
            </button>
            <h2 className="font-bold" style={{ color: colors.text }}>Order #12345</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Status Banner */}
            <div className="py-5 px-4 text-center" style={{ backgroundColor: '#8B5CF615' }}>
              <Truck className="w-14 h-14 mx-auto mb-3" style={{ color: '#8B5CF6' }} />
              <h3 className="text-xl font-bold" style={{ color: '#8B5CF6' }}>In Transit</h3>
              <p className="text-sm mt-2" style={{ color: '#6B7280' }}>Estimated Delivery: Jan 12, 2026</p>
            </div>

            {/* Order Items Section */}
            <div className="m-4 p-4 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <h3 className="font-bold mb-4" style={{ color: colors.text }}>Order Items</h3>
              {[1, 2].map((item) => (
                <div key={item} className="flex gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <div className="w-20 h-20 rounded-lg" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: colors.text }}>Product Name</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Shop Name</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs" style={{ color: '#6B7280' }}>Size: M</span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>Qty: 1</span>
                    </div>
                    <p className="font-bold mt-2" style={{ color: theme.primaryColor }}>$49.99</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address Section */}
            <div className="mx-4 mb-4 p-4 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <h3 className="font-bold mb-4" style={{ color: colors.text }}>Shipping Address</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <span className="font-medium" style={{ color: colors.text }}>John Doe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <span style={{ color: colors.text }}>+1 234 567 8900</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#9CA3AF' }} />
                  <span style={{ color: colors.text }}>123 Main Street, New York, NY 10001</span>
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="mx-4 mb-4 p-4 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}>
              <h3 className="font-bold mb-4" style={{ color: colors.text }}>Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Payment Method</span>
                  <span className="font-medium" style={{ color: colors.text }}>Credit Card</span>
                </div>
                <div className="border-t my-2" style={{ borderColor: '#E5E7EB' }} />
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Subtotal</span>
                  <span style={{ color: colors.text }}>$99.98</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Discount</span>
                  <span style={{ color: '#22C55E' }}>-$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Shipping</span>
                  <span style={{ color: '#22C55E' }}>FREE</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>Tax</span>
                  <span style={{ color: colors.text }}>$8.99</span>
                </div>
                <div className="border-t my-2" style={{ borderColor: '#E5E7EB' }} />
                <div className="flex justify-between">
                  <span className="font-bold" style={{ color: colors.text }}>Total</span>
                  <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>$98.97</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => onNavigate?.('order-tracking')}
                className="w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2"
                style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
              >
                <Truck className="w-5 h-5" />
                Track Order
              </button>
              <button
                className="w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2"
                style={{ border: '1px solid #E5E7EB', color: colors.text }}
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Again
              </button>
              <button
                className="w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2"
                style={{ border: '1px solid #EF4444', color: '#EF4444' }}
              >
                <XCircle className="w-5 h-5" />
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      );

    case 'order-tracking':
      return (
        <div className="h-full overflow-y-auto" style={{ backgroundColor: '#F9FAFB' }}>
          {/* AppBar */}
          <div
            className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
            style={{ backgroundColor: 'white' }}
          >
            <button onClick={() => onNavigate?.('orders')} className="p-2 -ml-2">
              <ChevronLeft className="w-5 h-5" style={{ color: colors.text }} />
            </button>
            <h2 className="font-bold" style={{ color: colors.text }}>Track Order</h2>
          </div>

          {/* Hero Section with Gradient */}
          <div
            className="p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}CC, #22C55E)`
            }}
          >
            <h1 className="text-2xl font-bold text-white mb-2">Track Your Order</h1>
            <p className="text-white/80 text-sm mb-6">Enter your order number to track</p>

            {/* Search Bar */}
            <div
              className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg"
            >
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                <span className="text-sm" style={{ color: '#9CA3AF' }}>ORD-12345</span>
              </div>
              <button
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Track
              </button>
            </div>

            <p className="text-white/60 text-xs mt-4">e.g., ORD-12345 or tracking number</p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Order Details Card */}
            <div className="p-5 rounded-2xl bg-white shadow-sm">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>Order Details</h3>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Order #ORD-12345</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2">
                    <Share2 className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                  <button className="p-2">
                    <BellRing className="w-5 h-5" style={{ color: '#6B7280' }} />
                  </button>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3B82F615' }}>
                    <Calendar className="w-5 h-5" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Order Date</p>
                    <p className="font-semibold" style={{ color: colors.text }}>January 10, 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22C55E15' }}>
                    <Clock className="w-5 h-5" style={{ color: '#22C55E' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Estimated Delivery</p>
                    <p className="font-bold text-lg" style={{ color: theme.primaryColor }}>January 14, 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B5CF615' }}>
                    <Truck className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Carrier</p>
                    <p className="font-semibold" style={{ color: colors.text }}>Standard Shipping</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Express Delivery</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F9731615' }}>
                    <Package className="w-5 h-5" style={{ color: '#F97316' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: '#6B7280' }}>Tracking Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold font-mono" style={{ color: colors.text }}>TRK-9876543210</p>
                      <button>
                        <Copy className="w-4 h-4" style={{ color: theme.primaryColor }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items in Order */}
            <div className="p-5 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Items in Order (2)</h3>

              <div className="space-y-3">
                {[
                  { name: 'Premium Wireless Headphones', size: 'One Size', qty: 1, price: 79.99 },
                  { name: 'Classic Cotton T-Shirt', size: 'M', color: 'Navy', qty: 1, price: 29.99 },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: '#E5E7EB' }} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: colors.text }}>{item.name}</p>
                      <div className="flex gap-2 mt-1 text-xs" style={{ color: '#6B7280' }}>
                        <span>Size: {item.size}</span>
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.qty}</span>
                      </div>
                      <p className="font-bold mt-1" style={{ color: colors.text }}>${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t my-4" style={{ borderColor: '#E5E7EB' }} />
              <div className="flex justify-between">
                <span className="font-semibold" style={{ color: colors.text }}>Order Total</span>
                <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>$109.98</span>
              </div>
            </div>

            {/* Delivery Updates Timeline */}
            <div className="p-5 rounded-2xl bg-white shadow-sm">
              <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Delivery Updates</h3>

              <div className="space-y-0">
                {[
                  { status: 'Out for Delivery', date: 'Jan 12', time: '8:30 AM', location: 'New York, NY', isFirst: true },
                  { status: 'Package at Local Facility', date: 'Jan 11', time: '10:15 PM', location: 'Brooklyn, NY' },
                  { status: 'In Transit', date: 'Jan 11', time: '3:45 PM', location: 'Newark, NJ' },
                  { status: 'Shipped', date: 'Jan 10', time: '2:00 PM', location: 'Warehouse' },
                  { status: 'Order Confirmed', date: 'Jan 10', time: '10:00 AM', location: '' },
                ].map((update, idx, arr) => (
                  <div key={idx} className="flex gap-3">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          backgroundColor: update.isFirst ? theme.primaryColor : 'white',
                          borderColor: update.isFirst ? theme.primaryColor : '#D1D5DB'
                        }}
                      />
                      {idx < arr.length - 1 && (
                        <div className="w-0.5 h-full min-h-[40px]" style={{ backgroundColor: '#E5E7EB' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm" style={{ color: colors.text }}>{update.status}</span>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{update.date}, {update.time}</span>
                      </div>
                      {update.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" style={{ color: '#9CA3AF' }} />
                          <span className="text-xs" style={{ color: '#6B7280' }}>{update.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-5 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
                <h3 className="text-lg font-bold" style={{ color: colors.text }}>Shipping Address</h3>
              </div>
              <p className="font-semibold" style={{ color: colors.text }}>John Doe</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>123 Main Street</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>New York, NY 10001</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>United States</p>
            </div>

            {/* Contact Support */}
            <div className="p-5 rounded-2xl shadow-sm" style={{ backgroundColor: theme.primaryColor + '10' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>Need Help?</h3>
              <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <button
                className="w-full py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </button>
              <div className="flex gap-3 mt-3">
                <button
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
                >
                  <Phone className="w-4 h-4" />
                  Call Us
                </button>
                <button
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${theme.primaryColor}`, color: theme.primaryColor }}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    case 'wishlist':
      const wishlistProducts = products.filter(p => wishlistItems.includes(p.id));
      return (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
            style={{ backgroundColor: colors.bg }}
          >
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              Wishlist
            </h2>
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.surface }}>
                <Heart className="w-10 h-10" style={{ color: colors.textSecondary }} />
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: colors.text }}>Your wishlist is empty</p>
              <p className="text-sm text-center mb-6" style={{ color: colors.textSecondary }}>
                Save items you love by tapping the heart icon
              </p>
              <button
                onClick={() => onNavigate?.('home')}
                className="px-6 py-3 text-white font-medium rounded-xl"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="px-4 grid grid-cols-2 gap-3">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="relative">
                  <div
                    className="overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
                    style={{ backgroundColor: colors.surface, borderRadius }}
                    onClick={() => onNavigate?.('product-detail')}
                  >
                    <div
                      className="h-24"
                      style={{
                        backgroundColor: colors.border,
                        backgroundImage: product.image ? `url(${product.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="p-2">
                      <p className="text-xs truncate" style={{ color: colors.text }}>
                        {product.name}
                      </p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        {product.brand || shopName || 'Brand'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-semibold text-sm" style={{ color: theme.primaryColor }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs" style={{ color: colors.textSecondary }}>{product.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => toggleWishlist?.(product.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                  {/* Add to cart button */}
                  <button
                    onClick={() => {
                      addToCart?.(product);
                      toggleWishlist?.(product.id);
                    }}
                    className="absolute bottom-12 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <ShoppingCart className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
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

// Helper Components
function ProductCard({
  colors,
  theme,
  borderRadius,
  onClick
}: {
  colors: any;
  theme: any;
  borderRadius: string;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
      style={{ backgroundColor: colors.surface, borderRadius }}
      onClick={onClick}
    >
      <div
        className="h-24"
        style={{ backgroundColor: colors.border }}
      />
      <div className="p-2">
        <p className="text-xs truncate" style={{ color: colors.text }}>
          Product Name
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-sm" style={{ color: theme.primaryColor }}>
            $29.99
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs" style={{ color: colors.textSecondary }}>
              4.5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemCard({ colors, theme, borderRadius }: { colors: any; theme: any; borderRadius: string }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex gap-3 p-3"
      style={{ backgroundColor: colors.surface, borderRadius }}
    >
      <div
        className="w-16 h-16 flex-shrink-0"
        style={{ backgroundColor: colors.border, borderRadius }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: colors.text }}>
          Product Name Here
        </p>
        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          Qty: 1
        </p>
        <p className="font-semibold text-sm mt-1" style={{ color: theme.primaryColor }}>
          $49.99
        </p>
      </div>
    </div>
  );
}

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
  const { t } = useTranslation();
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

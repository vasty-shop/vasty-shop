import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, Tag, Truck, Shield, CreditCard, RotateCcw, Lock, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { SEO } from '@/components/seo';
import type { Product } from '@/types';

export const CartPage: React.FC = () => {
  // SEO: noindex for user-specific page
  const seoElement = <SEO title="Shopping Cart" noIndex={true} />;
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const items = useCartStore((state) => state.items);
  const loading = useCartStore((state) => state.loading);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const totalItems = useCartStore((state) => state.getTotalItems());
  const fetchCart = useCartStore((state) => state.fetchCart);
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);
  const applyCouponAction = useCartStore((state) => state.applyCoupon);
  const removeCouponAction = useCartStore((state) => state.removeCoupon);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Fetch cart from backend on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // Fetch product recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        // Fetch featured products as recommendations
        const response = await api.getFeaturedProducts(4);
        const transformedProducts = response.map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.brand || 'Unknown',
          price: product.price,
          salePrice: product.salePrice,
          discountPercent: product.discountPercent,
          rating: product.rating || 0,
          category: product.category,
          images: product.images || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
        }));
        setRecommendations(transformedProducts);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Calculate totals
  const subtotal = totalPrice;
  const shipping = 0; // Free shipping
  const discount = appliedPromo ? appliedPromo.discount : 0;
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + shipping + tax;

  // Select all functionality
  const allSelected = items.length > 0 && selectedItems.size === items.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => `${item.product.id}-${item.size}`)));
    }
  };

  const toggleSelectItem = (productId: string, size: string) => {
    const key = `${productId}-${size}`;
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const removeSelectedItems = () => {
    selectedItems.forEach(key => {
      const [productId, size] = key.split('-');
      removeItem(productId, size as any);
    });
    setSelectedItems(new Set());
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsPromoLoading(true);
    try {
      const result = await applyCouponAction(promoCode);
      setAppliedPromo({ code: promoCode, discount: result.discount || 0 });
      setPromoCode('');
    } catch (error) {
      // Error is already handled in the store
      console.error('Failed to apply coupon:', error);
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleRemovePromo = async () => {
    if (!appliedPromo) return;

    try {
      await removeCouponAction(appliedPromo.code);
      setAppliedPromo(null);
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  // Loading state
  if (loading && items.length === 0) {
    return (
      <>
        {seoElement}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-lime mx-auto mb-4" />
            <p className="text-lg text-text-secondary">Loading your cart...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <>
        {seoElement}
        {/* Mobile Empty State */}
        <div className="lg:hidden min-h-screen bg-cloud-gradient flex items-center justify-center pb-24 px-4">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-white shadow-card flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              </div>
            </div>
            <h2 className="text-h2 text-text-primary mb-2">Your cart is empty</h2>
            <p className="text-body text-text-secondary mb-6">
              Start adding items to your cart
            </p>
            <Button onClick={() => (window.location.href = '/products')} size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>

        {/* Desktop Empty State */}
        <div className="hidden lg:block min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-8">
              <Link to="/" className="text-text-secondary hover:text-primary-lime">Home</Link>
              <ChevronRight className="w-4 h-4 text-text-secondary" />
              <span className="text-text-primary font-medium">Shopping Cart</span>
            </nav>

            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="mb-8 flex justify-center">
                <div className="w-40 h-40 rounded-full bg-white shadow-card flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-gray-300" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-text-primary mb-4">Your cart is empty</h1>
              <p className="text-lg text-text-secondary mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping and discover amazing products!
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => (window.location.href = '/products')} size="lg" className="px-8">
                  Browse Products
                </Button>
                <Button onClick={() => (window.location.href = '/')} size="lg" variant="outline" className="px-8">
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {seoElement}
      {/* ========== MOBILE VERSION (Existing UI) ========== */}
      <div className="lg:hidden min-h-screen bg-cloud-gradient pb-32">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <h1 className="text-h1 font-bold text-text-primary mb-6">Shopping Cart</h1>

          <div className="space-y-4 mb-6">
            {items.map((item, index) => {
              const price = item.product.salePrice || item.product.price;
              return (
                <motion.div
                  key={`${item.product.id}-${item.size}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-button overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || '/placeholder-product.png'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-1 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-text-secondary mb-2">{item.product.brand}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-caption text-text-secondary">
                            Size: {item.size}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-pill p-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="p-1 hover:bg-white rounded-full transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="p-1 hover:bg-white rounded-full transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-body font-bold text-text-primary">
                              {formatPrice(price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product.id, item.size)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Checkout Section - Mobile */}
          <Card className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-body">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text-primary">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-body">
                <span className="text-text-secondary">Shipping</span>
                <span className="font-medium text-text-primary">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-h3">
                  <span className="font-bold text-text-primary">Total</span>
                  <span className="font-bold text-text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* ========== DESKTOP VERSION (Enhanced UI) ========== */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link to="/" className="text-text-secondary hover:text-primary-lime transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-text-secondary" />
            <span className="text-text-primary font-medium">Shopping Cart</span>
          </nav>

          {/* Main Content - 2 Column Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Cart Items (65-70%) */}
            <div className="col-span-8">
              {/* Header with Item Count */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-text-primary">
                    Shopping Cart <span className="text-text-secondary text-xl">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  </h1>
                </div>

                {/* Select All & Remove */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-primary-lime focus:ring-2 focus:ring-primary-lime cursor-pointer"
                    />
                    <span className="text-sm font-medium text-text-primary group-hover:text-primary-lime transition-colors">
                      Select All Items
                    </span>
                  </label>

                  {selectedItems.size > 0 && (
                    <button
                      onClick={removeSelectedItems}
                      className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove Selected ({selectedItems.size})
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const price = item.product.salePrice || item.product.price;
                    const originalPrice = item.product.price;
                    const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;
                    const itemKey = `${item.product.id}-${item.size}`;
                    const isSelected = selectedItems.has(itemKey);

                    return (
                      <motion.div
                        key={itemKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "bg-white rounded-lg shadow-sm p-6 transition-all",
                          isSelected && "ring-2 ring-primary-lime"
                        )}
                      >
                        <div className="flex gap-6">
                          {/* Checkbox */}
                          <div className="flex items-start pt-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectItem(item.product.id, item.size)}
                              className="w-5 h-5 rounded border-2 border-gray-300 text-primary-lime focus:ring-2 focus:ring-primary-lime cursor-pointer"
                            />
                          </div>

                          {/* Product Image */}
                          <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
                              <img
                                src={item.product.images?.[0] || '/placeholder-product.png'}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-2">
                              <div className="flex-1">
                                <Link
                                  to={`/product/${item.product.id}`}
                                  className="font-semibold text-lg text-text-primary hover:text-primary-lime transition-colors line-clamp-2"
                                >
                                  {item.product.name}
                                </Link>
                                <p className="text-sm text-text-secondary mt-1">{item.product.brand}</p>
                              </div>
                            </div>

                            {/* Size & Color */}
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary">Size:</span>
                                <span className="text-sm font-medium text-text-primary">{item.size}</span>
                              </div>
                              {item.color && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-text-secondary">Color:</span>
                                  <div
                                    className="w-5 h-5 rounded-full border-2 border-gray-200"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4">
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                                <Package className="w-4 h-4" />
                                In Stock
                              </span>
                            </div>

                            {/* Price, Quantity, Actions */}
                            <div className="flex items-center justify-between">
                              {/* Price */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-text-primary">
                                    {formatPrice(price * item.quantity)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-sm text-text-secondary line-through">
                                      {formatPrice(originalPrice * item.quantity)}
                                    </span>
                                  )}
                                </div>
                                {hasDiscount && (
                                  <span className="text-sm text-badge-sale font-medium">
                                    Save {formatPrice((originalPrice - price) * item.quantity)}
                                  </span>
                                )}
                              </div>

                              {/* Quantity & Actions */}
                              <div className="flex items-center gap-4">
                                {/* Quantity Selector */}
                                <div className="flex items-center gap-1 border-2 border-gray-200 rounded-lg">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.product.id,
                                        item.size,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-base font-semibold w-12 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.product.id, item.size, item.quantity + 1)
                                    }
                                    className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => removeItem(item.product.id, item.size)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                                </button>
                              </div>
                            </div>

                            {/* Save for Later */}
                            <div className="mt-3 pt-3 border-t">
                              <button className="text-sm font-medium text-primary-lime hover:text-primary-lime-dark transition-colors">
                                Save for Later
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column - Order Summary (30-35%) */}
            <div className="col-span-4">
              <div className="sticky top-8 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-6">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-text-primary mb-2 block">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder={t('common.placeholders.enterCode')}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary-lime focus:outline-none transition-colors text-sm font-medium"
                        />
                      </div>
                      <Button
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim() || isPromoLoading}
                        className="px-6"
                      >
                        {isPromoLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-green-600">Code "{appliedPromo.code}" applied!</span>
                        <button
                          onClick={handleRemovePromo}
                          className="text-red-500 hover:text-red-600 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-base">
                      <span className="text-text-secondary">Subtotal ({totalItems} items)</span>
                      <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-base">
                        <span className="text-green-600">Discount ({appliedPromo.code})</span>
                        <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base">
                      <span className="text-text-secondary">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>

                    <div className="flex justify-between text-base">
                      <span className="text-text-secondary">Tax (8%)</span>
                      <span className="font-medium text-text-primary">{formatPrice(tax)}</span>
                    </div>

                    <div className="border-t-2 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-text-primary">Total</span>
                        <span className="text-2xl font-bold text-primary-lime">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link to="/checkout">
                    <Button className="w-full mb-4" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  {/* Continue Shopping */}
                  <Link to="/products">
                    <Button variant="outline" className="w-full" size="lg">
                      Continue Shopping
                    </Button>
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Truck className="w-5 h-5 text-green-600" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <RotateCcw className="w-5 h-5 text-green-600" />
                      <span>Free 30-day returns</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>2-year warranty</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-medium text-text-secondary mb-3">We Accept</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-xs font-bold text-text-primary">
                        VISA
                      </div>
                      <div className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-xs font-bold text-text-primary">
                        MC
                      </div>
                      <div className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-xs font-bold text-text-primary">
                        AMEX
                      </div>
                      <div className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-xs font-bold text-primary-lime">
                        PayPal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-gradient-to-br from-primary-lime to-primary-lime-dark rounded-lg shadow-sm p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                  <p className="text-sm mb-4 opacity-90">
                    Our customer service team is here to assist you
                  </p>
                  <Button variant="secondary" className="w-full bg-white text-primary-lime hover:bg-gray-100">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Products Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">You Might Also Like</h2>
              <Link to="/products" className="text-sm font-medium text-primary-lime hover:text-primary-lime-dark transition-colors">
                View All
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-4 gap-6">
                {recommendations.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.images?.[0] || '/placeholder-product.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-text-secondary uppercase mb-1">{product.brand}</p>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-text-primary mb-2 line-clamp-2 hover:text-primary-lime transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-lg font-bold text-badge-sale">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-sm text-text-secondary line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-text-primary">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      variant="outline"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-text-secondary">No recommendations available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

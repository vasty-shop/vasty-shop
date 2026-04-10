'use client';

/**
 * Storefront Cart Page
 * Full-featured cart with promo codes, recommendations, trust badges
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  Truck,
  Shield,
  RotateCcw,
  Lock,
  Package,
  Loader2,
  CreditCard,
  Star,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useStorefront } from '../StorefrontLayout';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  rating?: number;
  brand?: string;
}

export function StorefrontCartPage() {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { theme } = useStorefront();
  const { isStoreAuthenticated } = useStoreAuth();
  const { items, removeItem, updateQuantity, applyCoupon, removeCoupon } = useCartStore();
  const { addItem: addToWishlist } = useWishlistStore();

  // Check if user is authenticated for this store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  // Filter cart items for this shop - be strict about shopId matching
  const shopItems = items.filter(item => {
    const itemShopId = item.product?.shopId;
    return itemShopId && itemShopId === shopId;
  });


  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  // Recommendations
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Shop tax rate (shipping comes from delivery methods)
  const [shopTaxRate, setShopTaxRate] = useState<number>(0);
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);

  // Fetch shop settings for tax and delivery methods
  useEffect(() => {
    const fetchSettings = async () => {
      if (!shopId) return;
      try {
        // Fetch shop data for tax rate
        const shopData = await api.getShop(shopId);
        const settings = shopData?.settings || {};
        setShopTaxRate(settings.taxRate ?? settings.tax_rate ?? 0);

        // Fetch delivery methods for shipping rates
        const deliveryResponse = await api.getDeliveryMethods();
        if (deliveryResponse && Array.isArray(deliveryResponse)) {
          setDeliveryMethods(deliveryResponse.filter((m: any) => m.isActive !== false));
        }
      } catch (error) {
        // Settings fetch failed, using defaults
      }
    };
    fetchSettings();
  }, [shopId]);

  // Calculate totals
  const subtotal = shopItems.reduce((sum, item) => {
    const price = Number(item.product?.salePrice || item.product?.price || 0);
    return sum + (price * item.quantity);
  }, 0);

  const discount = appliedPromo ? appliedPromo.discount : 0;

  // Get shipping from first active delivery method (or 0 if none)
  const getShippingCost = () => {
    if (deliveryMethods.length > 0) {
      const defaultMethod = deliveryMethods[0];
      const threshold = defaultMethod.freeShippingThreshold || 0;
      if (threshold > 0 && subtotal >= threshold) return 0;
      return defaultMethod.baseCost || defaultMethod.rate || 0;
    }
    return 0; // Free shipping if no delivery methods configured
  };

  const shipping = getShippingCost();

  // Calculate tax per product (product tax if set, else shop default)
  const tax = shopItems.reduce((sum, item) => {
    const price = Number(item.product?.salePrice || item.product?.price || 0);
    const itemTotal = price * item.quantity;
    // Use product's tax rate if set (> 0), otherwise use shop default
    const product = item.product as any;
    const productTaxRate = product?.taxRate || product?.tax_rate || 0;
    const effectiveTaxRate = productTaxRate > 0 ? productTaxRate : shopTaxRate;
    return sum + (itemTotal * (effectiveTaxRate / 100));
  }, 0);

  // Calculate effective tax rate for display (weighted average)
  const effectiveTaxRate = subtotal > 0 ? (tax / subtotal) * 100 : shopTaxRate;

  const total = subtotal - discount + shipping + tax;
  const totalItems = shopItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!shopId) return;
      setLoadingRecommendations(true);
      try {
        const response = await api.getProducts({ shopId, limit: 4 });
        const products = response?.data || [];
        // Filter out items already in cart
        const cartProductIds = shopItems.map(item => item.product?.id);
        const filtered = products.filter((p: Product) => !cartProductIds.includes(p.id));
        setRecommendations(filtered.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [shopId, shopItems.length]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsPromoLoading(true);
    try {
      const result = await applyCoupon(promoCode);
      setAppliedPromo({ code: promoCode, discount: result?.discount || subtotal * 0.1 });
      setPromoCode('');
      toast.success(t('cart.promoApplied', { code: promoCode }));
    } catch (error) {
      toast.error(t('cart.invalidPromoCode'));
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleRemovePromo = async () => {
    if (!appliedPromo) return;
    try {
      await removeCoupon(appliedPromo.code);
      setAppliedPromo(null);
      toast.success(t('cart.promoRemoved'));
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  const handleSaveForLater = async (productId: string, size: string) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('cart.loginToSaveWishlist'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/cart` } });
      return;
    }

    const item = shopItems.find(i => i.product?.id === productId && i.size === size);
    if (item?.product) {
      await addToWishlist(item.product as any);
      removeItem(productId, size as any);
      toast.success(t('cart.savedToWishlist'));
    }
  };

  const handleAddToCart = async (product: Product) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('cart.loginToAddToCart'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/cart` } });
      return;
    }

    const { addItem } = useCartStore.getState();
    await addItem({ ...product, shopId: shopId || '' } as any, 'M');
    toast.success(t('products.addedToCart'));
  };

  if (!theme) return null;

  const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium') => {
    const radiusMap: Record<string, Record<string, string>> = {
      none: { small: 'rounded-none', medium: 'rounded-none', large: 'rounded-none' },
      small: { small: 'rounded', medium: 'rounded-md', large: 'rounded-lg' },
      medium: { small: 'rounded-md', medium: 'rounded-lg', large: 'rounded-xl' },
      large: { small: 'rounded-lg', medium: 'rounded-xl', large: 'rounded-2xl' },
      full: { small: 'rounded-xl', medium: 'rounded-2xl', large: 'rounded-3xl' },
    };
    return radiusMap[theme.borderRadius]?.[size] || 'rounded-lg';
  };

  const getSecondaryTextStyle = () => ({
    color: theme.textColor,
    opacity: 0.7,
  });

  const getCardBg = () => {
    const isDark = theme.backgroundColor.toLowerCase() === '#000000' ||
                   theme.backgroundColor.toLowerCase() === '#1a1a1a' ||
                   theme.backgroundColor.toLowerCase().includes('rgb(0');
    if (isDark) {
      return 'rgba(255,255,255,0.05)';
    }
    return theme.backgroundColor;
  };

  // Empty cart state
  if (shopItems.length === 0) {
    return (
      <div className="py-20 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className={`w-32 h-32 mx-auto mb-8 ${getBorderRadius('large')} flex items-center justify-center`}
            style={{ backgroundColor: `${theme.textColor}10` }}
          >
            <ShoppingCart
              className="w-16 h-16"
              style={{ color: theme.textColor, opacity: 0.3 }}
            />
          </div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('cart.emptyCart')}
          </h1>
          <p className="text-lg mb-8" style={getSecondaryTextStyle()}>
            {t('cart.emptyCartMessage')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to={`/store/${shopId}/products`}
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
              style={{ backgroundColor: theme.primaryColor, fontFamily: theme.bodyFont }}
            >
              <ShoppingBag className="w-5 h-5" />
              {t('cart.browseProducts')}
            </Link>
            <Link
              to={`/store/${shopId}`}
              className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} border transition-opacity hover:opacity-80`}
              style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
            >
              {t('cart.goToStoreHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 md:px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link
            to={`/store/${shopId}`}
            className="hover:opacity-70 transition-opacity"
            style={{ color: theme.textColor }}
          >
            {t('common.store')}
          </Link>
          <ChevronRight className="w-4 h-4" style={getSecondaryTextStyle()} />
          <span style={{ color: theme.primaryColor }}>{t('cart.shoppingCart')}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('cart.shoppingCart')}
          </h1>
          <p style={getSecondaryTextStyle()}>
            {t('cart.itemsInCart', { count: totalItems })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {shopItems.map((item, index) => {
                const product = item.product;
                const productImage = product?.images?.[0] || '';
                const productPrice = Number(product?.salePrice || product?.price || 0);
                const originalPrice = Number(product?.price || 0);
                const hasDiscount = product?.salePrice && product.salePrice < originalPrice;
                const productName = product?.name || 'Unknown Product';
                const productId = product?.id || '';

                return (
                  <motion.div
                    key={`${productId}-${item.size}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 md:p-6 ${getBorderRadius('large')} border`}
                    style={{
                      backgroundColor: getCardBg(),
                      borderColor: `${theme.textColor}15`,
                    }}
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* Product Image */}
                      <Link to={`/store/${shopId}/product/${productId}`}>
                        <div
                          className={`w-24 h-24 md:w-32 md:h-32 ${getBorderRadius('medium')} overflow-hidden flex-shrink-0`}
                          style={{ backgroundColor: `${theme.textColor}10` }}
                        >
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8" style={{ color: theme.textColor, opacity: 0.3 }} />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/store/${shopId}/product/${productId}`}
                              className="font-semibold hover:opacity-70 line-clamp-2 transition-opacity text-lg"
                              style={{ color: theme.textColor }}
                            >
                              {productName}
                            </Link>
                            {product?.brand && (
                              <p className="text-sm mt-1" style={getSecondaryTextStyle()}>
                                {product.brand}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          {item.size && (
                            <span className="text-sm" style={getSecondaryTextStyle()}>
                              {t('cart.size')}: <span style={{ color: theme.textColor }}>{item.size}</span>
                            </span>
                          )}
                          {item.color && (
                            <span className="text-sm" style={getSecondaryTextStyle()}>
                              {t('cart.color')}: <span style={{ color: theme.textColor }}>{item.color}</span>
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="mb-3">
                          <span
                            className="inline-flex items-center gap-1 text-sm font-medium"
                            style={{ color: '#22c55e' }}
                          >
                            <Package className="w-4 h-4" />
                            {t('cart.inStock')}
                          </span>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          {/* Price */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>
                                ${(productPrice * item.quantity).toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-sm line-through" style={getSecondaryTextStyle()}>
                                  ${(originalPrice * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                            {hasDiscount && (
                              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
                                Save ${((originalPrice - productPrice) * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex items-center ${getBorderRadius('medium')} overflow-hidden border`}
                              style={{ borderColor: `${theme.textColor}20` }}
                            >
                              <button
                                onClick={() => updateQuantity(productId, item.size, Math.max(1, item.quantity - 1))}
                                className="p-2 transition-colors hover:opacity-70"
                                style={{ color: theme.textColor }}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span
                                className="px-4 font-medium"
                                style={{ color: theme.textColor }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(productId, item.size, item.quantity + 1)}
                                className="p-2 transition-colors hover:opacity-70"
                                style={{ color: theme.textColor }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(productId, item.size)}
                              className={`p-2 ${getBorderRadius('medium')} transition-colors`}
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                              title="Remove from cart"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Save for Later */}
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: `${theme.textColor}10` }}>
                          <button
                            onClick={() => handleSaveForLater(productId, item.size)}
                            className="text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                            style={{ color: theme.primaryColor }}
                          >
                            <Heart className="w-4 h-4" />
                            {t('cart.saveForLater')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className={`p-6 ${getBorderRadius('large')} border sticky top-24`}
              style={{
                backgroundColor: getCardBg(),
                borderColor: `${theme.textColor}15`,
              }}
            >
              <h2
                className="text-xl font-bold mb-6"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {t('cart.orderSummary')}
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label
                  className="text-sm font-medium mb-2 block"
                  style={{ color: theme.textColor }}
                >
                  {t('cart.promoCode')}
                </label>
                <div className="flex gap-2">
                  <div
                    className={`flex-1 flex items-center border ${getBorderRadius('medium')} overflow-hidden`}
                    style={{ borderColor: `${theme.textColor}20` }}
                  >
                    <Tag className="w-4 h-4 ml-3" style={getSecondaryTextStyle()} />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder={t('cart.enterCode')}
                      className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
                      style={{ color: theme.textColor }}
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim() || isPromoLoading}
                    className={`px-4 py-2 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90 disabled:opacity-50`}
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {isPromoLoading ? t('cart.applying') : t('cart.apply')}
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
                      "{appliedPromo.code}" {t('cart.applied')}!
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-sm font-medium"
                      style={{ color: '#ef4444' }}
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span style={getSecondaryTextStyle()}>{t('cart.subtotal')} ({totalItems} {t('cart.items')})</span>
                  <span className="font-medium" style={{ color: theme.textColor }}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between">
                    <span style={{ color: '#22c55e' }}>{t('cart.discount')} ({appliedPromo.code})</span>
                    <span className="font-medium" style={{ color: '#22c55e' }}>
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span style={getSecondaryTextStyle()}>{t('cart.shipping')}</span>
                  <span className="font-medium" style={{ color: shipping === 0 ? '#22c55e' : theme.textColor }}>
                    {shipping === 0 ? t('cart.free') : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={getSecondaryTextStyle()}>{t('cart.tax')} ({effectiveTaxRate.toFixed(1)}%)</span>
                  <span className="font-medium" style={{ color: theme.textColor }}>
                    ${tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <div
                className="border-t pt-4 mb-6"
                style={{ borderColor: `${theme.textColor}15` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold" style={{ color: theme.textColor }}>{t('cart.total')}</span>
                  <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs mt-2" style={getSecondaryTextStyle()}>
                    {t('cart.addMoreForFreeShipping', { amount: (50 - subtotal).toFixed(2) })}
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate(`/store/${shopId}/checkout`)}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-semibold ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
                style={{ backgroundColor: theme.primaryColor }}
              >
                {t('cart.proceedToCheckout')}
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to={`/store/${shopId}/products`}
                className="block text-center mt-4 text-sm transition-opacity hover:opacity-80"
                style={{ color: theme.primaryColor }}
              >
                {t('cart.continueShopping')}
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3" style={{ borderColor: `${theme.textColor}15` }}>
                <div className="flex items-center gap-3 text-sm" style={getSecondaryTextStyle()}>
                  <Lock className="w-5 h-5" style={{ color: '#22c55e' }} />
                  <span>{t('cart.secureCheckout')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={getSecondaryTextStyle()}>
                  <Truck className="w-5 h-5" style={{ color: '#22c55e' }} />
                  <span>{t('cart.freeShippingOver')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={getSecondaryTextStyle()}>
                  <RotateCcw className="w-5 h-5" style={{ color: '#22c55e' }} />
                  <span>{t('cart.freeReturns')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm" style={getSecondaryTextStyle()}>
                  <Shield className="w-5 h-5" style={{ color: '#22c55e' }} />
                  <span>{t('cart.buyerProtection')}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: `${theme.textColor}15` }}>
                <p className="text-sm font-medium mb-3" style={getSecondaryTextStyle()}>
                  {t('cart.weAccept')}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className={`px-3 py-2 border ${getBorderRadius('small')}`}
                    style={{ borderColor: `${theme.textColor}20` }}
                  >
                    <CreditCard className="w-5 h-5" style={getSecondaryTextStyle()} />
                  </div>
                  <div
                    className={`px-3 py-2 border ${getBorderRadius('small')} text-xs font-bold`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                  >
                    VISA
                  </div>
                  <div
                    className={`px-3 py-2 border ${getBorderRadius('small')} text-xs font-bold`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                  >
                    MC
                  </div>
                  <div
                    className={`px-3 py-2 border ${getBorderRadius('small')} text-xs font-bold`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                  >
                    AMEX
                  </div>
                  <div
                    className={`px-3 py-2 border ${getBorderRadius('small')} text-xs font-bold`}
                    style={{ borderColor: `${theme.textColor}20`, color: theme.primaryColor }}
                  >
                    PayPal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {t('cart.youMightAlsoLike')}
              </h2>
              <Link
                to={`/store/${shopId}/products`}
                className="text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: theme.primaryColor }}
              >
                {t('common.viewAll')}
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`animate-pulse ${getBorderRadius('large')} overflow-hidden border`}
                    style={{ borderColor: `${theme.textColor}15` }}
                  >
                    <div className="aspect-square" style={{ backgroundColor: `${theme.textColor}20` }} />
                    <div className="p-4 space-y-3">
                      <div className="h-3 rounded w-1/4" style={{ backgroundColor: `${theme.textColor}20` }} />
                      <div className="h-4 rounded w-3/4" style={{ backgroundColor: `${theme.textColor}20` }} />
                      <div className="h-5 rounded w-1/2" style={{ backgroundColor: `${theme.textColor}20` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${getBorderRadius('large')} overflow-hidden border group`}
                    style={{
                      backgroundColor: getCardBg(),
                      borderColor: `${theme.textColor}15`,
                    }}
                  >
                    <Link to={`/store/${shopId}/product/${product.id}`}>
                      <div
                        className="aspect-square overflow-hidden"
                        style={{ backgroundColor: `${theme.textColor}10` }}
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12" style={{ color: theme.textColor, opacity: 0.3 }} />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      {product.brand && (
                        <p className="text-xs uppercase mb-1" style={getSecondaryTextStyle()}>
                          {product.brand}
                        </p>
                      )}
                      <Link
                        to={`/store/${shopId}/product/${product.id}`}
                        className="font-semibold hover:opacity-70 line-clamp-2 transition-opacity"
                        style={{ color: theme.textColor }}
                      >
                        {product.name}
                      </Link>
                      {product.rating !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm" style={{ color: theme.textColor }}>
                            {Number(product.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
                          ${Number(product.salePrice || product.price || 0).toFixed(2)}
                        </span>
                        {product.salePrice && (
                          <span className="text-sm line-through" style={{ color: theme.textColor, opacity: 0.4 }}>
                            ${Number(product.price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full mt-3 px-4 py-2 font-medium ${getBorderRadius('medium')} border transition-opacity hover:opacity-80`}
                        style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
                      >
                        {t('common.addToCart')}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StorefrontCartPage;

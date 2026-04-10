'use client';

/**
 * Storefront Wishlist Page
 */

import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Store,
} from 'lucide-react';
import { useStorefront } from '../StorefrontLayout';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { useTranslation } from 'react-i18next';

export function StorefrontWishlistPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { theme } = useStorefront();
  const { t } = useTranslation();
  const { isStoreAuthenticated } = useStoreAuth();
  const { items, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  // Check if user is authenticated for this store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  // Filter wishlist items for this shop
  const shopItems = items.filter(item => item.product?.shopId === shopId);

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

  const handleAddToCart = async (product: Product) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('messages.loginToAddCart'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/wishlist` } });
      return;
    }

    await addToCart(product, 'M'); // Default size
    toast.success(t('messages.addedToCart'));
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeItem(productId);
    toast.success(t('messages.removedFromWishlist'));
  };

  if (shopItems.length === 0) {
    return (
      <div className="py-20 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <Heart
            className="w-20 h-20 mx-auto mb-6"
            style={{ color: theme.textColor, opacity: 0.2 }}
          />
          <h1
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('wishlist.emptyWishlist')}
          </h1>
          <p className="text-lg mb-8" style={getSecondaryTextStyle()}>
            {t('wishlist.emptyWishlistMessage')}
          </p>
          <Link
            to={`/store/${shopId}/products`}
            className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            {t('common.products')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      {/* Wishlist Header - matches wishlist-header preview */}
      <div className="py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.textColor }}>
            {t('wishlist.myWishlist')}
          </h1>
          <p className="opacity-70" style={{ color: theme.textColor }}>
            {t('wishlist.itemCount', { count: shopItems.length })}
          </p>
        </div>
      </div>

      {/* Wishlist Items - matches wishlist-items preview */}
      <div className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {shopItems.map((item) => {
              const product = item.product;
              const productImage = product.images?.[0] || '';
              const productPrice = Number(product.salePrice || product.price || 0);

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`${getBorderRadius('large')} overflow-hidden relative`}
                  style={{
                    backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#F9FAFB' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Heart button - matches preview */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    <Heart className="w-4 h-4" style={{ color: '#EF4444', fill: '#EF4444' }} />
                  </button>

                  <Link to={`/store/${shopId}/product/${product.id}`}>
                    <div className="aspect-square overflow-hidden">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${theme.primaryColor}15` }}
                        >
                          <Store className="w-12 h-12" style={{ color: theme.primaryColor, opacity: 0.5 }} />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1" style={{ color: theme.textColor }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: theme.primaryColor }}>
                        ${productPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`px-3 py-1.5 text-sm font-medium ${getBorderRadius('medium')}`}
                        style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                      >
                        {t('common.addToCart')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wishlist Share - matches wishlist-share preview */}
      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-6 ${getBorderRadius('large')}`} style={{ backgroundColor: `${theme.primaryColor}10` }}>
            <h3 className="font-bold mb-2" style={{ color: theme.textColor }}>
              {t('wishlist.shareWishlist')}
            </h3>
            <p className="text-sm opacity-70 mb-4" style={{ color: theme.textColor }}>
              {t('wishlist.shareMessage')}
            </p>
            <div className="flex justify-center gap-3">
              <button className={`px-4 py-2 ${getBorderRadius('medium')}`} style={{ backgroundColor: '#1877F2', color: '#FFFFFF' }}>
                Facebook
              </button>
              <button className={`px-4 py-2 ${getBorderRadius('medium')}`} style={{ backgroundColor: '#1DA1F2', color: '#FFFFFF' }}>
                Twitter
              </button>
              <button
                className={`px-4 py-2 ${getBorderRadius('medium')}`}
                style={{ backgroundColor: theme.primaryColor, color: '#FFFFFF' }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(t('common.linkCopied'));
                }}
              >
                {t('common.copyLink')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StorefrontWishlistPage;

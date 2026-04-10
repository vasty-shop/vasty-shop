'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Store,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount?: number;
  reviews?: number;
  images?: string[];
  image?: string;
  shop?: {
    id: string;
    name: string;
  };
  shopName?: string;
  category?: {
    id: string;
    name: string;
  };
  categoryName?: string;
}

interface Shop {
  id: string;
  name: string;
  logo?: string;
  rating?: number;
  productCount?: number;
  products?: number;
  address?: string;
  city?: string;
  country?: string;
  location?: string;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get the display values from flexible interface
  const shopName = product.shop?.name || product.shopName || 'Unknown Shop';
  // Handle both string URLs and image objects from API
  const firstImage = product.images?.[0] as string | { url: string } | undefined;
  const productImage = typeof firstImage === 'string'
    ? firstImage
    : (firstImage as { url: string })?.url || product.image;

  // Parse rating properly - handle both camelCase and snake_case from API
  // Database field is 'rating' but might come as different names
  const rawRating = (product as any).rating ?? (product as any).averageRating ?? (product as any).average_rating ?? (product as any).avg_rating ?? 0;
  const rating = typeof rawRating === 'string' ? parseFloat(rawRating) : Number(rawRating) || 0;

  // Parse review count - database field is 'total_reviews'
  const rawReviewCount = (product as any).total_reviews ?? (product as any).totalReviews ?? (product as any).reviewCount ?? (product as any).review_count ?? (product as any).reviews ?? 0;
  const reviewCount = typeof rawReviewCount === 'string' ? parseInt(rawReviewCount, 10) : Number(rawReviewCount) || 0;

  // Parse prices properly - handle both camelCase and snake_case from API
  const rawPrice = (product as any).price || (product as any).sale_price || (product as any).salePrice || 0;
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice) || 0;

  const rawSalePrice = (product as any).salePrice || (product as any).sale_price;
  const salePrice = rawSalePrice ? (typeof rawSalePrice === 'string' ? parseFloat(rawSalePrice) : Number(rawSalePrice)) : undefined;

  const displayPrice = (salePrice && salePrice < price) ? salePrice : price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        const shopId = product.shop?.id;
        if (shopId) {
          window.open(`/store/${shopId}/product/${product.id}`, '_blank');
        } else {
          window.open(`/products/${product.id}`, '_blank');
        }
      }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-primary-lime/50" />
            </div>
          </div>
        )}

        {/* Badges */}
        {salePrice && salePrice < price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - salePrice / price) * 100)}%
          </div>
        )}

        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 right-3 flex gap-2"
            >
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-primary-lime flex items-center justify-center hover:bg-primary-lime/90 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-primary-lime mb-1">{shopName}</div>
        <h3 className="text-white font-medium mb-2 line-clamp-2">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-white/80">{rating.toFixed(1)}</span>
          <span className="text-xs text-white/40">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">
            ${displayPrice.toFixed(2)}
          </span>
          {salePrice && salePrice < price && (
            <span className="text-sm text-white/40 line-through">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShopCard({ shop, index }: { shop: Shop; index: number }) {
  const navigate = useNavigate();

  // Get display values from flexible interface
  const shopLocation = shop.location || [shop.city, shop.country].filter(Boolean).join(', ') || 'Online Store';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => navigate(`/store/${shop.id}`)}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-primary-lime/50 transition-all cursor-pointer group"
    >
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:from-primary-lime/30 group-hover:to-emerald-500/30 transition-colors overflow-hidden">
        {shop.logo ? (
          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <Store className="w-8 h-8 text-primary-lime" />
        )}
      </div>

      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{shop.name}</h3>

      <div className="flex items-center gap-1 text-sm text-white/60">
        <MapPin className="w-3 h-3" />
        <span className="line-clamp-1">{shopLocation}</span>
      </div>
    </motion.div>
  );
}

export function MarketplacePreviewSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);

  // Fetch trending products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await api.getProducts({ limit: 4, status: 'active' });
        const productData = response?.data || response || [];
        setProducts(Array.isArray(productData) ? productData.slice(0, 4) : []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch featured shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoadingShops(true);
        const response = await api.getShops({ limit: 4, status: 'active' });
        const shopData = response?.data || response || [];
        setShops(Array.isArray(shopData) ? shopData.slice(0, 4) : []);
      } catch (error) {
        console.error('Failed to fetch shops:', error);
        setShops([]);
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <section
      id="marketplace"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary-lime/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-lime" />
            <span className="text-sm font-medium text-white/90">{t('landing.marketplacePreview.badge')}</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('landing.marketplacePreview.title')}{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {t('landing.marketplacePreview.titleHighlight')}
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {t('landing.marketplacePreview.subtitle')}
          </p>
        </motion.div>

        {/* Trending Products */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-lime" />
              <h3 className="text-xl font-bold text-white">{t('landing.marketplacePreview.trendingNow')}</h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/explore')}
              className="text-primary-lime hover:bg-primary-lime/10"
            >
              {t('landing.marketplacePreview.viewAll')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-5 bg-white/10 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/60">{t('landing.marketplacePreview.noProducts')}</p>
              <Button
                variant="ghost"
                onClick={() => navigate('/explore')}
                className="mt-4 text-primary-lime hover:bg-primary-lime/10"
              >
                {t('landing.marketplacePreview.exploreProducts')}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Featured Shops */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">{t('landing.marketplacePreview.featuredStores')}</h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/explore?tab=stores')}
              className="text-cyan-400 hover:bg-cyan-400/10"
            >
              {t('landing.marketplacePreview.viewAll')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loadingShops ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 mb-4" />
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {shops.map((shop, index) => (
                <ShopCard key={shop.id} shop={shop} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/60">{t('landing.marketplacePreview.noStores')}</p>
              <Button
                variant="ghost"
                onClick={() => navigate('/explore?tab=stores')}
                className="mt-4 text-cyan-400 hover:bg-cyan-400/10"
              >
                {t('landing.marketplacePreview.exploreStores')}
              </Button>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            onClick={() => navigate('/explore')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-500/90 hover:to-blue-500/90 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-cyan-500/30 group"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {t('landing.marketplacePreview.exploreMarketplace')}
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default MarketplacePreviewSection;

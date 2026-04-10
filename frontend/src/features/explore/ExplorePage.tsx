'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Star,
  Heart,
  ShoppingCart,
  Store,
  MapPin,
  Sparkles,
  Grid3X3,
  LayoutList,
  ChevronDown,
  SlidersHorizontal,
  Package,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { toast } from 'sonner';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  shop: {
    id: string;
    name: string;
    logo?: string;
  };
  category: string;
  description?: string;
}

interface Shop {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  productCount: number;
  location?: string;
  description?: string;
  region?: string;
}

interface FilterState {
  priceRange: [number, number];
  rating: number;
  region: string;
  sortBy: string;
}

const sortOptionsConfig = [
  { value: 'relevance', labelKey: 'platform.explore.sortOptions.relevance' },
  { value: 'newest', labelKey: 'platform.explore.sortOptions.newest' },
  { value: 'price_low', labelKey: 'platform.explore.sortOptions.priceLow' },
  { value: 'price_high', labelKey: 'platform.explore.sortOptions.priceHigh' },
  { value: 'rating', labelKey: 'platform.explore.sortOptions.rating' },
  { value: 'popular', labelKey: 'platform.explore.sortOptions.popular' },
];

const regionsConfig = [
  { value: 'all', labelKey: 'platform.explore.regions.all' },
  { value: 'asia', labelKey: 'platform.explore.regions.asia' },
  { value: 'middle_east', labelKey: 'platform.explore.regions.middleEast' },
  { value: 'europe', labelKey: 'platform.explore.regions.europe' },
  { value: 'americas', labelKey: 'platform.explore.regions.americas' },
];

function ProductCard({ product, onAddToCart, onWishlistToggle, isWishlisted }: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWishlistToggle: (productId: string) => void;
  isWishlisted: boolean;
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Image */}
      <div
        className="relative aspect-square bg-gray-50 overflow-hidden"
        onClick={() => navigate(`/store/${product.shop.id}/product/${product.id}`)}
      >
        {(() => {
          // Handle both string URLs and image objects from API
          const firstImage = product.images?.[0];
          const imageUrl = typeof firstImage === 'string'
            ? firstImage
            : (firstImage as any)?.url;
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : null;
        })() || (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Sale Badge */}
        {product.salePrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
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
                onClick={(e) => {
                  e.stopPropagation();
                  onWishlistToggle(product.id);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 hover:bg-white text-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
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
        {/* Shop */}
        <div
          className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/store/${product.shop.id}`);
          }}
        >
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <Store className="w-3 h-3 text-gray-500" />
          </div>
          <span className="text-xs text-primary-lime font-medium truncate">
            {product.shop.name}
          </span>
        </div>

        {/* Name */}
        <h3
          className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary-lime transition-colors"
          onClick={() => navigate(`/store/${product.shop.id}/product/${product.id}`)}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-gray-600">{(Number(product.rating) || 0).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.salePrice || product.price}
          </span>
          {product.salePrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const handleClick = () => {
    window.open(`/store/${shop.id}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={handleClick}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center mb-4">
        {shop.logo ? (
          <img src={shop.logo} alt={shop.name} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <Store className="w-8 h-8 text-primary-lime" />
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{shop.name}</h3>

      {shop.location && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          {shop.location}
        </div>
      )}

    </motion.div>
  );
}

export function ExplorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<'products' | 'stores'>(
    (searchParams.get('tab') as 'products' | 'stores') || 'products'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    rating: 0,
    region: 'all',
    sortBy: 'relevance',
  });

  // Store hooks
  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { isStoreAuthenticated } = useStoreAuth();

  // Fetch data with all filters connected
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'products') {
        // Build query params for products
        const queryParams: Record<string, any> = {
          search: searchQuery || undefined,
          minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice: filters.priceRange[1] < 10000 ? filters.priceRange[1] : undefined,
          minRating: filters.rating > 0 ? filters.rating : undefined,
          region: filters.region !== 'all' ? filters.region : undefined,
          sortBy: filters.sortBy !== 'relevance' ? filters.sortBy : undefined,
          limit: 24,
        };

        // Remove undefined values
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === undefined) {
            delete queryParams[key];
          }
        });

        const response = await api.getProducts(queryParams);
        let transformedProducts = response.data.map((product: any) => {
          // Parse prices - backend returns numeric but could be string
          const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
          // Shopify convention: price = selling price, compare_price = original (crossed out)
          // salePrice for display = price if compare_price > price (indicates a sale)
          const comparePrice = product.compare_price || product.comparePrice || product.compareAtPrice;
          const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
          // If compare price exists and is higher than price, product is on sale
          const isOnSale = comparePriceVal && comparePriceVal > priceVal;

          return {
            id: product.id,
            name: product.name,
            price: isOnSale ? comparePriceVal : priceVal, // Original price for display
            salePrice: isOnSale ? priceVal : undefined, // Sale price only if on sale
            rating: product.rating || 4.5,
            reviews: product.reviewCount || product.review_count || 0,
            // Handle both string URLs and image objects from API
            images: (product.images || []).map((img: any) =>
              typeof img === 'string' ? img : img?.url
            ).filter(Boolean),
            shop: {
              id: product.shopId || product.shop_id || product.shop?.id || 'shop-1',
              name: product.shopName || product.shop_name || product.shop?.name || 'Unknown Shop',
              logo: product.shop?.logo,
            },
            category: product.category,
            region: product.region || product.shop?.region,
            description: product.description,
          };
        });

        // Client-side sorting if backend doesn't support it
        if (filters.sortBy === 'price_low') {
          transformedProducts.sort((a: Product, b: Product) => (a.salePrice || a.price) - (b.salePrice || b.price));
        } else if (filters.sortBy === 'price_high') {
          transformedProducts.sort((a: Product, b: Product) => (b.salePrice || b.price) - (a.salePrice || a.price));
        } else if (filters.sortBy === 'rating') {
          transformedProducts.sort((a: Product, b: Product) => b.rating - a.rating);
        }

        // Client-side price filter as backup
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
          transformedProducts = transformedProducts.filter((p: Product) => {
            const price = p.salePrice || p.price;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
          });
        }

        // Client-side rating filter as backup
        if (filters.rating > 0) {
          transformedProducts = transformedProducts.filter((p: Product) => p.rating >= filters.rating);
        }

        setProducts(transformedProducts);
      } else {
        // Build query params for shops
        const queryParams: Record<string, any> = {
          search: searchQuery || undefined,
          region: filters.region !== 'all' ? filters.region : undefined,
          minRating: filters.rating > 0 ? filters.rating : undefined,
          sortBy: filters.sortBy !== 'relevance' ? filters.sortBy : undefined,
          limit: 24,
        };

        // Remove undefined values
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === undefined) {
            delete queryParams[key];
          }
        });

        const response = await api.getShops(queryParams);
        let transformedShops = response.data.map((shop: any) => ({
          id: shop.id,
          name: shop.name,
          logo: shop.logo,
          rating: shop.rating || 4.5,
          productCount: shop.productCount || 0,
          location: shop.address?.city || shop.location,
          region: shop.region,
          description: shop.description,
        }));

        // Client-side rating filter as backup
        if (filters.rating > 0) {
          transformedShops = transformedShops.filter((s: Shop) => s.rating >= filters.rating);
        }

        // Client-side sorting for shops
        if (filters.sortBy === 'rating') {
          transformedShops.sort((a: Shop, b: Shop) => b.rating - a.rating);
        } else if (filters.sortBy === 'popular') {
          transformedShops.sort((a: Shop, b: Shop) => b.productCount - a.productCount);
        }

        setShops(transformedShops);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (activeTab === 'products') {
        setProducts([]);
      } else {
        setShops([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Track if update is from URL (external) vs user input (internal)
  const isUrlUpdateRef = useRef(false);
  const prevSearchParamsRef = useRef(searchParams.toString());

  // Sync from URL params (when Header search or direct URL change)
  useEffect(() => {
    const currentParamsString = searchParams.toString();

    // Only sync if URL actually changed externally
    if (currentParamsString !== prevSearchParamsRef.current) {
      const urlQuery = searchParams.get('q') || '';
      const urlTab = searchParams.get('tab') as 'products' | 'stores' | null;

      isUrlUpdateRef.current = true;

      if (urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
      }
      if (urlTab && urlTab !== activeTab) {
        setActiveTab(urlTab);
      } else if (!urlTab && activeTab !== 'products') {
        // Reset to products if no tab in URL
      }

      prevSearchParamsRef.current = currentParamsString;

      // Reset flag after state updates
      setTimeout(() => {
        isUrlUpdateRef.current = false;
      }, 0);
    }
  }, [searchParams, searchQuery, activeTab]);

  // Update URL params when state changes (only from user input, not URL sync)
  useEffect(() => {
    if (isUrlUpdateRef.current) return; // Skip if update came from URL

    const params = new URLSearchParams();
    if (activeTab !== 'products') params.set('tab', activeTab);
    if (searchQuery) params.set('q', searchQuery);

    const newParamsString = params.toString();
    if (newParamsString !== prevSearchParamsRef.current) {
      prevSearchParamsRef.current = newParamsString;
      setSearchParams(params, { replace: true });
    }
  }, [activeTab, searchQuery, setSearchParams]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleAddToCart = (product: Product) => {
    const shopId = product.shop.id;

    // Check if user is authenticated for this store
    if (!isStoreAuthenticated(shopId)) {
      toast.info('Please login to this store first');
      navigate(`/store/${shopId}/login`, {
        state: { from: `/store/${shopId}/product/${product.id}` }
      });
      return;
    }

    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      brand: product.shop.name,
      shopId: shopId,
      rating: product.rating,
      category: product.category,
      description: product.description || '',
      sizes: [],
      colors: [],
    };
    addToCart(cartProduct as any, 'M' as any, undefined);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlistToggle = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const shopId = product.shop.id;

      // Check if user is authenticated for this store
      if (!isStoreAuthenticated(shopId)) {
        toast.info('Please login to this store first');
        navigate(`/store/${shopId}/login`, {
          state: { from: `/store/${shopId}/product/${product.id}` }
        });
        return;
      }

      toggleWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images,
        brand: product.shop.name,
        shopId: shopId,
        rating: product.rating,
        category: product.category,
        description: product.description || '',
        sizes: [],
        colors: [],
      } as any);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Search Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary-lime" />
              <span className="text-sm font-medium text-white/90">{t('platform.explore.discoverBadge')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('platform.explore.title')}{' '}
              <span className="bg-gradient-to-r from-primary-lime to-cyan-400 bg-clip-text text-transparent">
                {t('platform.explore.marketplace')}
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              {t('platform.explore.subtitle')}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={activeTab === 'products' ? t('platform.explore.searchProducts') : t('platform.explore.searchStores')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-32 py-4 bg-white rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 shadow-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-lime to-emerald-500 text-white px-6"
              >
                {t('platform.explore.search')}
              </Button>
            </div>
          </motion.form>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-2 mt-6"
          >
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              {t('platform.explore.products')}
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'stores'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Store className="w-4 h-4 inline mr-2" />
              {t('platform.explore.stores')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              {isLoading ? t('common.loading') : (
                activeTab === 'products'
                  ? t('platform.explore.productsFound', { count: products.length })
                  : t('platform.explore.storesFound', { count: shops.length })
              )}
            </p>
            {searchQuery && (
              <span className="text-gray-400">{t('platform.explore.forQuery', { query: searchQuery })}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
              >
                {sortOptionsConfig.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-200"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {t('platform.explore.filters')}
            </Button>

            {/* View Mode */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{t('platform.explore.filters')}</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range - only for products */}
                {activeTab === 'products' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('platform.explore.priceRange')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={t('platform.explore.min')}
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters({
                          ...filters,
                          priceRange: [Number(e.target.value), filters.priceRange[1]]
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder={t('platform.explore.max')}
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters({
                          ...filters,
                          priceRange: [filters.priceRange[0], Number(e.target.value)]
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      />
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('platform.explore.minimumRating')}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, rating })}
                        className={`p-2 rounded-lg transition-colors ${
                          filters.rating === rating
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${filters.rating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('platform.explore.region')}
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                  >
                    {regionsConfig.map((region) => (
                      <option key={region.value} value={region.value}>
                        {t(region.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    priceRange: [0, 10000],
                    rating: 0,
                    region: 'all',
                    sortBy: 'relevance',
                  })}
                >
                  {t('platform.explore.clearAll')}
                </Button>
                <Button
                  onClick={() => {
                    fetchData();
                    setShowFilters(false);
                  }}
                  className="bg-primary-lime text-white"
                >
                  {t('platform.explore.applyFilters')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
          </div>
        ) : activeTab === 'products' ? (
          products.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onWishlistToggle={handleWishlistToggle}
                  isWishlisted={isInWishlist(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('platform.explore.noProductsFound')}</h3>
              <p className="text-gray-500">
                {t('platform.explore.noProductsFoundDesc')}
              </p>
            </div>
          )
        ) : (
          shops.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('platform.explore.noStoresFound')}</h3>
              <p className="text-gray-500">
                {t('platform.explore.noStoresFoundDesc')}
              </p>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ExplorePage;

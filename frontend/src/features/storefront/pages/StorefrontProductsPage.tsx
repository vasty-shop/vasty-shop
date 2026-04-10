'use client';

/**
 * Storefront Products Page
 * Full-featured products listing with filters, pagination, and multiple view modes
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Store,
  Grid,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Tag,
  Loader2,
  AlertCircle,
  LayoutGrid,
  Grid3X3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStorefront } from '../StorefrontLayout';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  rating: number;
  reviewCount?: number;
  description?: string;
  category?: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
}

interface Category {
  id: string;
  name: string;
  productCount?: number;
}

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'popularity' | 'name-a-z' | 'name-z-a';
type ViewMode = 'grid-3' | 'grid-4' | 'list';

const PRODUCTS_PER_PAGE = 24;
const PRICE_RANGE_MAX = 2000;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'name-a-z', label: 'Name: A to Z' },
  { value: 'name-z-a', label: 'Name: Z to A' },
];

export function StorefrontProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useStorefront();
  const { isStoreAuthenticated } = useStoreAuth();
  const { t } = useTranslation();
  const isInitialMount = useRef(true);

  // Check if user is authenticated for this store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  // Products data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('priceMin')) || 0,
    Number(searchParams.get('priceMax')) || PRICE_RANGE_MAX,
  ]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('sizes')?.split(',').filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  );
  const [selectedRatings, setSelectedRatings] = useState<number[]>(
    searchParams.get('ratings')?.split(',').map(Number).filter(Boolean) || []
  );

  // View states
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'grid-3'
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'featured'
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );
  const [showFilters, setShowFilters] = useState(false);

  // Stores
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();

  // Available filter options from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors?.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [products]);

  // Fetch products
  useEffect(() => {
    if (shopId) {
      setIsLoading(true);
      setError(null);

      const fetchProducts = async () => {
        try {
          const params: any = {
            shopId,
            limit: 100, // Fetch more for client-side filtering
          };

          if (searchQuery) {
            params.search = searchQuery;
          }
          if (selectedCategories.length > 0) {
            params.category = selectedCategories[0];
          }
          if (priceRange[0] > 0) {
            params.minPrice = priceRange[0];
          }
          if (priceRange[1] < PRICE_RANGE_MAX) {
            params.maxPrice = priceRange[1];
          }

          const res = await api.getProducts(params);
          // Shopify convention: price = selling price, compare_price = original (crossed out)
          const transformedProducts = (res?.data || []).map((product: any) => {
            const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            const comparePrice = product.compare_price || product.comparePrice || product.compareAtPrice;
            const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
            const isOnSale = comparePriceVal && comparePriceVal > priceVal;

            return {
              ...product,
              price: isOnSale ? comparePriceVal : priceVal,
              salePrice: isOnSale ? priceVal : undefined,
              shopId: product.shop_id || product.shopId,
              shopName: product.shop_name || product.shopName,
            };
          });
          setProducts(transformedProducts);
          setTotalProducts(res?.total || res?.data?.length || 0);
        } catch (err) {
          console.error('Error fetching products:', err);
          setError('Failed to load products. Please try again.');
          setProducts([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    }
  }, [shopId, searchQuery, selectedCategories, priceRange]);

  // Fetch categories
  useEffect(() => {
    if (shopId) {
      api.getCategories()
        .then((res: any) => {
          const cats = Array.isArray(res) ? res : (res?.data || []);
          setCategories(cats);
        })
        .catch(() => setCategories([]));
    }
  }, [shopId]);

  // Update URL when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (selectedRatings.length > 0) params.set('ratings', selectedRatings.join(','));
    if (priceRange[0] > 0) params.set('priceMin', priceRange[0].toString());
    if (priceRange[1] < PRICE_RANGE_MAX) params.set('priceMax', priceRange[1].toString());
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (viewMode !== 'grid-3') params.set('view', viewMode);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategories, selectedSizes, selectedColors, selectedRatings, priceRange, sortBy, viewMode, currentPage, setSearchParams]);

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

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes?.some(size => selectedSizes.includes(size))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors?.some(color => selectedColors.includes(color))
      );
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings);
      filtered = filtered.filter(p => (p.rating || 0) >= minRating);
    }

    return filtered;
  }, [products, selectedSizes, selectedColors, selectedRatings]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case 'price-high':
        return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popularity':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'name-a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'featured':
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleAddToCart = async (product: Product) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('auth.signInToContinue'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/products` } });
      return;
    }

    const productWithShopId = { ...product, shopId: shopId || '' } as any;
    await addToCart(productWithShopId, 'M');
    toast.success(t('products.addedToCart'));
  };

  const handleToggleWishlist = async (product: Product) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('auth.signInToContinue'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/products` } });
      return;
    }

    const isInWishlist = wishlistItems.some(item => item.product?.id === product.id);
    if (isInWishlist) {
      await removeFromWishlist(product.id);
      toast.success(t('products.removedFromWishlist'));
    } else {
      const productWithShopId = { ...product, shopId: shopId || '' } as any;
      await addToWishlist(productWithShopId);
      toast.success(t('products.addedToWishlist'));
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedRatings([]);
    setPriceRange([0, PRICE_RANGE_MAX]);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 ||
    selectedSizes.length > 0 || selectedColors.length > 0 ||
    selectedRatings.length > 0 || priceRange[0] > 0 || priceRange[1] < PRICE_RANGE_MAX;

  // Page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Filter sidebar component
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-6 ${isMobile ? '' : 'sticky top-24'}`}>
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3
            className="font-semibold mb-3"
            style={{ color: theme.textColor, fontFamily: theme.headingFont }}
          >
            {t('common.categories')}
          </h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, cat.id]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: theme.primaryColor }}
                />
                <span
                  className="text-sm group-hover:opacity-80"
                  style={{ color: theme.textColor }}
                >
                  {cat.name}
                </span>
                {cat.productCount !== undefined && (
                  <span className="text-xs" style={getSecondaryTextStyle()}>
                    ({cat.productCount})
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3
          className="font-semibold mb-3"
          style={{ color: theme.textColor, fontFamily: theme.headingFont }}
        >
          {t('products.priceRange')}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 ${getBorderRadius('small')} border overflow-hidden`}
              style={{ borderColor: `${theme.textColor}20` }}
            >
              <input
                type="number"
                min={0}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => {
                  setPriceRange([Number(e.target.value), priceRange[1]]);
                  setCurrentPage(1);
                }}
                placeholder={t('vendor.placeholders.min')}
                className="w-full px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'transparent', color: theme.textColor }}
              />
            </div>
            <span style={getSecondaryTextStyle()}>-</span>
            <div
              className={`flex-1 ${getBorderRadius('small')} border overflow-hidden`}
              style={{ borderColor: `${theme.textColor}20` }}
            >
              <input
                type="number"
                min={priceRange[0]}
                max={PRICE_RANGE_MAX}
                value={priceRange[1]}
                onChange={(e) => {
                  setPriceRange([priceRange[0], Number(e.target.value)]);
                  setCurrentPage(1);
                }}
                placeholder={t('vendor.placeholders.max')}
                className="w-full px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'transparent', color: theme.textColor }}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_RANGE_MAX}
            value={priceRange[1]}
            onChange={(e) => {
              setPriceRange([priceRange[0], Number(e.target.value)]);
              setCurrentPage(1);
            }}
            className="w-full"
            style={{ accentColor: theme.primaryColor }}
          />
        </div>
      </div>

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <h3
            className="font-semibold mb-3"
            style={{ color: theme.textColor, fontFamily: theme.headingFont }}
          >
            {t('products.size')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => {
                  if (selectedSizes.includes(size)) {
                    setSelectedSizes(selectedSizes.filter(s => s !== size));
                  } else {
                    setSelectedSizes([...selectedSizes, size]);
                  }
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-sm border ${getBorderRadius('small')} transition-all`}
                style={{
                  borderColor: selectedSizes.includes(size) ? theme.primaryColor : `${theme.textColor}20`,
                  backgroundColor: selectedSizes.includes(size) ? `${theme.primaryColor}20` : 'transparent',
                  color: selectedSizes.includes(size) ? theme.primaryColor : theme.textColor,
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {availableColors.length > 0 && (
        <div>
          <h3
            className="font-semibold mb-3"
            style={{ color: theme.textColor, fontFamily: theme.headingFont }}
          >
            {t('products.color')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => {
                  if (selectedColors.includes(color)) {
                    setSelectedColors(selectedColors.filter(c => c !== color));
                  } else {
                    setSelectedColors([...selectedColors, color]);
                  }
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-sm border ${getBorderRadius('small')} transition-all`}
                style={{
                  borderColor: selectedColors.includes(color) ? theme.primaryColor : `${theme.textColor}20`,
                  backgroundColor: selectedColors.includes(color) ? `${theme.primaryColor}20` : 'transparent',
                  color: selectedColors.includes(color) ? theme.primaryColor : theme.textColor,
                }}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <h3
          className="font-semibold mb-3"
          style={{ color: theme.textColor, fontFamily: theme.headingFont }}
        >
          {t('common.rating')}
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedRatings.includes(rating)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRatings([...selectedRatings, rating]);
                  } else {
                    setSelectedRatings(selectedRatings.filter(r => r !== rating));
                  }
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded"
                style={{ accentColor: theme.primaryColor }}
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : ''}`}
                    style={{ color: i >= rating ? `${theme.textColor}30` : undefined }}
                  />
                ))}
                <span className="text-sm ml-1" style={getSecondaryTextStyle()}>
                  & Up
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className={`w-full py-2 text-sm font-medium border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
          style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
        >
          {t('products.clearFilters')}
        </button>
      )}
    </div>
  );

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const isInWishlist = wishlistItems.some(item => item.product?.id === product.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${getBorderRadius('large')} overflow-hidden border group`}
        style={{
          backgroundColor: getCardBg(),
          borderColor: `${theme.textColor}15`,
        }}
      >
        <div className="relative">
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
                  <Store className="w-12 h-12" style={{ color: theme.textColor, opacity: 0.3 }} />
                </div>
              )}
            </div>
          </Link>

          {/* Wishlist Button */}
          <button
            onClick={() => handleToggleWishlist(product)}
            className="absolute top-2 right-2 p-2 rounded-full shadow-md hover:scale-110 transition-transform"
            style={{
              backgroundColor: getCardBg(),
              color: isInWishlist ? '#ef4444' : theme.textColor,
            }}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Sale Badge */}
          {product.salePrice && (
            <span
              className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
              style={{ backgroundColor: theme.primaryColor }}
            >
              SALE
            </span>
          )}
        </div>

        <div className="p-4">
          <Link
            to={`/store/${shopId}/product/${product.id}`}
            className="font-semibold hover:opacity-70 line-clamp-2 transition-opacity"
            style={{ color: theme.textColor }}
          >
            {product.name}
          </Link>

          {product.brand && (
            <p className="text-xs mt-1" style={getSecondaryTextStyle()}>
              {product.brand}
            </p>
          )}

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm" style={{ color: theme.textColor }}>
              {Number(product.rating || 0).toFixed(1)}
            </span>
            {product.reviewCount !== undefined && (
              <span className="text-xs" style={getSecondaryTextStyle()}>
                ({product.reviewCount})
              </span>
            )}
          </div>

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
            className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            <ShoppingCart className="w-4 h-4" />
            {t('common.addToCart')}
          </button>
        </div>
      </motion.div>
    );
  };

  // Product List View Component
  const ProductListView = ({ product }: { product: Product }) => {
    const isInWishlist = wishlistItems.some(item => item.product?.id === product.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex gap-6 p-4 ${getBorderRadius('large')} border`}
        style={{
          backgroundColor: getCardBg(),
          borderColor: `${theme.textColor}15`,
        }}
      >
        <Link to={`/store/${shopId}/product/${product.id}`} className="w-40 h-40 flex-shrink-0">
          <div
            className={`w-full h-full ${getBorderRadius('medium')} overflow-hidden relative`}
            style={{ backgroundColor: `${theme.textColor}10` }}
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-8 h-8" style={{ color: theme.textColor, opacity: 0.3 }} />
              </div>
            )}
            {product.salePrice && (
              <span
                className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded"
                style={{ backgroundColor: theme.primaryColor }}
              >
                SALE
              </span>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/store/${shopId}/product/${product.id}`}
            className="text-lg font-semibold hover:opacity-70 line-clamp-2 transition-opacity"
            style={{ color: theme.textColor }}
          >
            {product.name}
          </Link>

          {product.brand && (
            <p className="text-sm mt-1" style={getSecondaryTextStyle()}>
              {product.brand}
            </p>
          )}

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm" style={{ color: theme.textColor }}>
              {Number(product.rating || 0).toFixed(1)}
            </span>
            {product.reviewCount !== undefined && (
              <span className="text-xs" style={getSecondaryTextStyle()}>
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>

          <p className="text-sm mt-2 line-clamp-2" style={getSecondaryTextStyle()}>
            {product.description || 'No description available'}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: theme.primaryColor }}>
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
              className={`flex items-center gap-2 px-4 py-2 font-medium ${getBorderRadius('medium')} text-white transition-opacity hover:opacity-90`}
              style={{ backgroundColor: theme.primaryColor }}
            >
              <ShoppingCart className="w-4 h-4" />
              {t('common.addToCart')}
            </button>

            <button
              onClick={() => handleToggleWishlist(product)}
              className={`p-2 border ${getBorderRadius('small')} transition-opacity hover:opacity-70`}
              style={{
                borderColor: `${theme.textColor}20`,
                color: isInWishlist ? '#ef4444' : theme.textColor,
              }}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-12 px-4 md:px-6" style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ fontFamily: theme.headingFont, color: theme.textColor }}
          >
            {t('products.allProducts')}
          </h1>
          <p style={getSecondaryTextStyle()}>
            {t('products.showingResults', { count: sortedProducts.length })}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div
              className={`p-4 border ${getBorderRadius('large')}`}
              style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
            >
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-4 mb-6 p-4 border ${getBorderRadius('medium')}`}
              style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
            >
              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-md relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: theme.textColor, opacity: 0.5 }}
                />
                <input
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: `${theme.textColor}20`,
                    color: theme.textColor,
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className={`lg:hidden flex items-center gap-2 px-3 py-2 border ${getBorderRadius('medium')}`}
                  style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t('common.filter')}
                  {hasActiveFilters && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                  )}
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 border ${getBorderRadius('medium')} focus:outline-none`}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: `${theme.textColor}20`,
                    color: theme.textColor,
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode */}
                <div
                  className={`flex border ${getBorderRadius('medium')} overflow-hidden`}
                  style={{ borderColor: `${theme.textColor}20` }}
                >
                  <button
                    onClick={() => setViewMode('grid-3')}
                    className="p-2 transition-opacity"
                    title="3 columns"
                    style={{
                      backgroundColor: viewMode === 'grid-3' ? `${theme.primaryColor}20` : 'transparent',
                      color: viewMode === 'grid-3' ? theme.primaryColor : theme.textColor,
                    }}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid-4')}
                    className="p-2 transition-opacity"
                    title="4 columns"
                    style={{
                      backgroundColor: viewMode === 'grid-4' ? `${theme.primaryColor}20` : 'transparent',
                      color: viewMode === 'grid-4' ? theme.primaryColor : theme.textColor,
                    }}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2 transition-opacity"
                    title="List view"
                    style={{
                      backgroundColor: viewMode === 'list' ? `${theme.primaryColor}20` : 'transparent',
                      color: viewMode === 'list' ? theme.primaryColor : theme.textColor,
                    }}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {selectedCategories.map(catId => {
                  const cat = categories.find(c => c.id === catId);
                  return cat ? (
                    <span
                      key={catId}
                      className={`flex items-center gap-1 px-3 py-1 text-sm ${getBorderRadius('small')}`}
                      style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                    >
                      {cat.name}
                      <button onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== catId))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
                {selectedSizes.map(size => (
                  <span
                    key={size}
                    className={`flex items-center gap-1 px-3 py-1 text-sm ${getBorderRadius('small')}`}
                    style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    Size: {size}
                    <button onClick={() => setSelectedSizes(selectedSizes.filter(s => s !== size))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedColors.map(color => (
                  <span
                    key={color}
                    className={`flex items-center gap-1 px-3 py-1 text-sm ${getBorderRadius('small')}`}
                    style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    {color}
                    <button onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < PRICE_RANGE_MAX) && (
                  <span
                    className={`flex items-center gap-1 px-3 py-1 text-sm ${getBorderRadius('small')}`}
                    style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    ${priceRange[0]} - ${priceRange[1]}
                    <button onClick={() => setPriceRange([0, PRICE_RANGE_MAX])}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-sm underline"
                  style={{ color: theme.primaryColor }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-12 text-center border ${getBorderRadius('large')}`}
                style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
              >
                <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: theme.textColor, fontFamily: theme.headingFont }}
                >
                  Error Loading Products
                </h3>
                <p className="mb-6" style={getSecondaryTextStyle()}>
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className={`px-6 py-2 border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
                  style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && paginatedProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-12 text-center border ${getBorderRadius('large')}`}
                style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
              >
                <Store className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.2 }} />
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: theme.textColor, fontFamily: theme.headingFont }}
                >
                  {t('products.noProductsFound')}
                </h3>
                <p className="mb-6" style={getSecondaryTextStyle()}>
                  {t('products.adjustFilters')}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className={`px-6 py-2 border ${getBorderRadius('medium')} transition-opacity hover:opacity-80`}
                    style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
                  >
                    {t('products.clearFilters')}
                  </button>
                )}
              </motion.div>
            )}

            {/* Products Grid/List */}
            {!isLoading && !error && paginatedProducts.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${viewMode}-${currentPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === 'list' ? (
                      <div className="space-y-4">
                        {paginatedProducts.map(product => (
                          <ProductListView key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`grid gap-4 md:gap-6 ${
                          viewMode === 'grid-3'
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                        }`}
                      >
                        {paginatedProducts.map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    className={`mt-8 p-4 flex flex-col md:flex-row items-center justify-between gap-4 border ${getBorderRadius('medium')}`}
                    style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
                  >
                    <p className="text-sm" style={getSecondaryTextStyle()}>
                      Showing{' '}
                      <span className="font-semibold" style={{ color: theme.textColor }}>
                        {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold" style={{ color: theme.textColor }}>
                        {Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold" style={{ color: theme.textColor }}>
                        {sortedProducts.length}
                      </span>{' '}
                      products
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage(p => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === 1}
                        className={`p-2 border ${getBorderRadius('small')} transition-opacity disabled:opacity-30`}
                        style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                          page === '...' ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-1"
                              style={getSecondaryTextStyle()}
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => {
                                setCurrentPage(page as number);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`min-w-[36px] py-1 ${getBorderRadius('small')} transition-all`}
                              style={{
                                backgroundColor: currentPage === page ? theme.primaryColor : 'transparent',
                                color: currentPage === page ? '#fff' : theme.textColor,
                              }}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage(p => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={currentPage === totalPages}
                        className={`p-2 border ${getBorderRadius('small')} transition-opacity disabled:opacity-30`}
                        style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] z-50 lg:hidden overflow-y-auto"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              <div className="sticky top-0 p-4 border-b flex items-center justify-between"
                style={{ borderColor: `${theme.textColor}15`, backgroundColor: theme.backgroundColor }}
              >
                <h2
                  className="text-lg font-bold"
                  style={{ color: theme.textColor, fontFamily: theme.headingFont }}
                >
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2"
                  style={{ color: theme.textColor }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar isMobile />
              </div>
              <div className="sticky bottom-0 p-4 border-t flex gap-3"
                style={{ borderColor: `${theme.textColor}15`, backgroundColor: theme.backgroundColor }}
              >
                <button
                  onClick={handleClearFilters}
                  className={`flex-1 py-3 border ${getBorderRadius('medium')} font-medium transition-opacity hover:opacity-80`}
                  style={{ borderColor: `${theme.textColor}30`, color: theme.textColor }}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className={`flex-1 py-3 ${getBorderRadius('medium')} font-medium text-white transition-opacity hover:opacity-90`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StorefrontProductsPage;

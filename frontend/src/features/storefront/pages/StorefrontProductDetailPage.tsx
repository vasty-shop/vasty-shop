'use client';

/**
 * Storefront Product Detail Page
 * Full-featured product page with reviews, tabs, and related products
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  Store,
  Share2,
  Facebook,
  Twitter,
  Link2,
  Check,
  Package,
  Clock,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  X,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Loader2,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useStorefront } from '../StorefrontLayout';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  sizes?: string[];
  colors?: Array<string | { name: string; code?: string }>;
  inStock?: number;
  category?: string;
  shopId?: string;
  brand?: string;
  sku?: string;
  features?: string[];
  specifications?: Record<string, string>;
  materials?: string[];
  careInstructions?: string[];
  sizeChart?: Array<{ size: string; chest?: string; waist?: string; hips?: string; length?: string }>;
  shippingInfo?: {
    freeShippingThreshold?: number;
    standardDays?: string;
    expressDays?: string;
    expressCost?: number;
    nextDayCost?: number;
  };
  returnPolicy?: {
    returnDays?: number;
    conditions?: string[];
    freeReturns?: boolean;
    refundDays?: string;
  };
  shop?: {
    id: string;
    name: string;
    slug?: string;
    logo?: string;
    isVerified?: boolean;
    rating?: number;
    totalProducts?: number;
  };
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  userName?: string;
  userAvatar?: string;
  createdAt?: string;
  verified?: boolean;
  helpful?: number;
  images?: string[];
  size?: string;
  color?: string;
}

export function StorefrontProductDetailPage() {
  const { shopId, productId } = useParams<{ shopId: string; productId: string }>();
  const navigate = useNavigate();
  const { theme } = useStorefront();
  const { isStoreAuthenticated } = useStoreAuth();
  const { t } = useTranslation();

  // Check if user is authenticated for this store
  const isAuthenticated = shopId ? isStoreAuthenticated(shopId) : false;

  // Product state
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [expandedReviews, setExpandedReviews] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Share menu
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();

  // Fetch product
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      api.getProduct(productId)
        .then((res) => {
          // Shopify convention: price = selling price, compare_price = original (crossed out)
          const priceVal = typeof res.price === 'string' ? parseFloat(res.price) : res.price;
          const comparePrice = res.compare_price || res.comparePrice || res.compareAtPrice;
          const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
          // If compare price exists and is higher than price, product is on sale
          const isOnSale = comparePriceVal && comparePriceVal > priceVal;

          const transformedProduct: Product = {
            id: res.id || res._id,
            name: res.name,
            description: res.description,
            price: isOnSale ? comparePriceVal : priceVal, // Original price for display
            salePrice: isOnSale ? priceVal : undefined, // Sale price only if on sale
            discountPercent: isOnSale ? Math.round(((comparePriceVal - priceVal) / comparePriceVal) * 100) : undefined,
            images: (res.images || []).map((img: any) => typeof img === 'string' ? img : img.url),
            rating: typeof res.rating === 'string' ? parseFloat(res.rating) : (res.rating || 0),
            reviewCount: res.reviewCount || res.review_count || 0,
            sizes: typeof res.sizes === 'string' ? JSON.parse(res.sizes) : (res.sizes || []),
            colors: typeof res.colors === 'string' ? JSON.parse(res.colors) : (res.colors || []),
            inStock: res.inStock || res.in_stock || res.quantity || res.stock || 0,
            category: res.category,
            shopId: res.shopId || res.shop_id || shopId,
            brand: res.brand,
            sku: res.sku || 'N/A',
            features: res.features || [],
            specifications: res.specifications || {},
            materials: res.materials || [],
            careInstructions: res.careInstructions || res.care_instructions || [],
            sizeChart: res.sizeChart || res.size_chart || [],
            shippingInfo: res.shippingInfo || res.shipping_info || {},
            returnPolicy: res.returnPolicy || res.return_policy || {},
            shop: res.shop,
          };
          setProduct(transformedProduct);
          if (transformedProduct.sizes?.length) setSelectedSize(transformedProduct.sizes[0]);
          if (transformedProduct.colors?.length) {
            const firstColor = transformedProduct.colors[0];
            setSelectedColor(typeof firstColor === 'string' ? firstColor : firstColor.name);
          }
        })
        .catch(() => setProduct(null))
        .finally(() => setIsLoading(false));
    }
  }, [productId, shopId]);

  // Fetch reviews
  useEffect(() => {
    if (productId) {
      setReviewsLoading(true);
      api.getProductReviews(productId)
        .then((res) => setReviews(res.data || []))
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  }, [productId]);

  // Fetch related products
  useEffect(() => {
    if (productId) {
      api.getRelatedProducts(productId, 4)
        .then((res: any) => {
          const related = Array.isArray(res) ? res : (res?.data || []);
          // Apply same Shopify convention transformation
          const transformedRelated = related.map((product: any) => {
            const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            const comparePrice = product.compare_price || product.comparePrice || product.compareAtPrice;
            const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
            const isOnSale = comparePriceVal && comparePriceVal > priceVal;

            return {
              ...product,
              price: isOnSale ? comparePriceVal : priceVal,
              salePrice: isOnSale ? priceVal : undefined,
            };
          });
          setRelatedProducts(transformedRelated);
        })
        .catch(() => setRelatedProducts([]));
    }
  }, [productId]);

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

  const isInWishlist = wishlistItems.some(item => item.product?.id === productId);

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const filteredReviews = reviewFilter ? reviews.filter((r) => r.rating === reviewFilter) : reviews;
  const displayedReviews = expandedReviews ? filteredReviews : filteredReviews.slice(0, 3);

  // Calculate actual rating
  const actualReviewCount = reviews.length;
  const actualAverageRating = actualReviewCount > 0
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / actualReviewCount
    : (product?.rating || 0);
  const displayRating = actualReviewCount > 0 ? actualAverageRating : (product?.rating || 0);
  const displayReviewCount = actualReviewCount > 0 ? actualReviewCount : (product?.reviewCount || 0);

  const handleAddToCart = async () => {
    if (!product) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('messages.loginToAddCart'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/product/${productId}` } });
      return;
    }

    if (product.sizes?.length && !selectedSize) {
      toast.error(t('messages.selectSize'));
      return;
    }

    const productWithShopId = {
      ...product,
      shopId: shopId || '',
    } as any;

    for (let i = 0; i < quantity; i++) {
      await addToCart(productWithShopId, (selectedSize || 'M') as any, selectedColor);
    }
    toast.success(t('messages.addedItemsToCart', { count: quantity }));
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.info(t('messages.loginToAddWishlist'));
      navigate(`/store/${shopId}/login`, { state: { from: `/store/${shopId}/product/${productId}` } });
      return;
    }

    if (isInWishlist) {
      await removeFromWishlist(product.id);
      toast.success(t('messages.removedFromWishlist'));
    } else {
      const productWithShopId = { ...product, shopId: shopId || '' } as any;
      await addToWishlist(productWithShopId);
      toast.success(t('messages.addedToWishlist'));
    }
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name}`;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success(t('messages.linkCopied'));
    }
    setShowShareMenu(false);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error(t('products.reviews.selectRating'));
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      toast.error(t('products.reviews.reviewMinLength'));
      return;
    }

    try {
      setReviewSubmitting(true);
      await api.createReview({
        productId: productId!,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        shopId: shopId, // Pass shopId for store-specific authentication
      });
      toast.success(t('products.reviews.reviewSubmitted'));
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');

      // Refresh reviews
      const reviewsData = await api.getProductReviews(productId!);
      setReviews(reviewsData.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.markReviewHelpful(reviewId);
      toast.success('Marked as helpful!');
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
      ));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.alreadyMarked'));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="py-12 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div
              className={`animate-pulse ${getBorderRadius('large')} aspect-square`}
              style={{ backgroundColor: `${theme.textColor}20` }}
            />
            <div className="space-y-4">
              <div className="h-8 rounded w-3/4" style={{ backgroundColor: `${theme.textColor}20` }} />
              <div className="h-6 rounded w-1/4" style={{ backgroundColor: `${theme.textColor}20` }} />
              <div className="h-4 rounded w-full" style={{ backgroundColor: `${theme.textColor}20` }} />
              <div className="h-4 rounded w-2/3" style={{ backgroundColor: `${theme.textColor}20` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="py-20 px-6" style={{ color: theme.textColor }}>
        <div className="max-w-2xl mx-auto text-center">
          <Store className="w-20 h-20 mx-auto mb-6" style={{ color: theme.textColor, opacity: 0.2 }} />
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: theme.headingFont }}>
            {t('product.notFound')}
          </h1>
          <p className="text-lg mb-8" style={getSecondaryTextStyle()}>
            {t('common.noResults')}
          </p>
          <Link
            to={`/store/${shopId}/products`}
            className={`inline-flex items-center gap-2 px-6 py-3 font-medium ${getBorderRadius('medium')} text-white`}
            style={{ backgroundColor: theme.primaryColor }}
          >
            {t('common.products')}
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'description', label: t('product.description') },
    { id: 'reviews', label: `${t('product.reviews')} (${displayReviewCount})` },
    { id: 'shipping', label: t('product.shipping') },
  ];

  return (
    <div style={{ color: theme.textColor, fontFamily: theme.bodyFont }}>
      {/* Main Product Section */}
      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8" style={getSecondaryTextStyle()}>
            <Link to={`/store/${shopId}`} className="hover:opacity-100" style={{ color: theme.textColor }}>{t('common.home')}</Link>
            <span>/</span>
            <Link to={`/store/${shopId}/products`} className="hover:opacity-100" style={{ color: theme.textColor }}>{t('common.products')}</Link>
            <span>/</span>
            <span style={{ opacity: 0.5 }}>{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Product Images - Left Column */}
            <div className="lg:col-span-7">
              {/* Main Image */}
              <div
                className={`relative ${getBorderRadius('large')} overflow-hidden aspect-[4/5] mb-4`}
                style={{ backgroundColor: `${theme.textColor}10` }}
              >
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-20 h-20" style={{ color: theme.textColor, opacity: 0.3 }} />
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                      style={{ backgroundColor: getCardBg(), color: theme.textColor }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                      style={{ backgroundColor: getCardBg(), color: theme.textColor }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Sale Badge */}
                {product.discountPercent && (
                  <span
                    className="absolute top-4 left-4 px-3 py-1 text-sm font-bold text-white rounded"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    -{product.discountPercent}% OFF
                  </span>
                )}

                {/* Image Counter */}
                {product.images?.length > 1 && (
                  <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 text-sm rounded-full"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square ${getBorderRadius('small')} overflow-hidden border-2 transition-all`}
                      style={{
                        borderColor: selectedImage === index ? theme.primaryColor : `${theme.textColor}20`,
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Right Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Shop Info */}
              {product.shop && (
                <Link
                  to={`/store/${shopId}`}
                  className={`flex items-center gap-3 p-3 ${getBorderRadius('medium')} border transition-colors hover:opacity-90`}
                  style={{ borderColor: `${theme.textColor}15`, backgroundColor: getCardBg() }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                  >
                    {product.shop.logo ? (
                      <img src={product.shop.logo} alt={product.shop.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <Store className="w-6 h-6" style={{ color: theme.primaryColor }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate" style={{ color: theme.textColor }}>
                        {product.shop.name}
                      </span>
                      {product.shop.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-0.5" style={getSecondaryTextStyle()}>
                      {Number(product.shop.rating) > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {Number(product.shop.rating).toFixed(1)}
                        </span>
                      )}
                      {product.shop.totalProducts && (
                        <span>{product.shop.totalProducts} Products</span>
                      )}
                      <span style={{ color: theme.primaryColor }}>{t('common.store')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: theme.textColor, opacity: 0.5 }} />
                </Link>
              )}

              {/* Brand & Actions */}
              <div className="flex items-center justify-between">
                {product.brand && (
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.primaryColor }}>
                    {product.brand}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-2 rounded-full border transition-colors`}
                    style={{
                      borderColor: `${theme.textColor}20`,
                      backgroundColor: isInWishlist ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      color: isInWishlist ? '#ef4444' : theme.textColor,
                    }}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2 rounded-full border transition-colors"
                      style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute right-0 mt-2 w-48 ${getBorderRadius('medium')} shadow-lg border py-2 z-50`}
                          style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                        >
                          {[
                            { icon: Facebook, label: 'Facebook', action: 'facebook' },
                            { icon: Twitter, label: 'Twitter', action: 'twitter' },
                            { icon: Link2, label: 'Copy Link', action: 'copy' },
                          ].map((item) => (
                            <button
                              key={item.action}
                              onClick={() => handleShare(item.action)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:opacity-70 transition-opacity"
                              style={{ color: theme.textColor }}
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="text-sm">{item.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <h1
                className="text-3xl lg:text-4xl font-bold"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {product.name}
              </h1>

              {/* Rating & SKU */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(displayRating) ? 'fill-yellow-400 text-yellow-400' : ''}`}
                        style={{ color: star <= Math.round(displayRating) ? undefined : `${theme.textColor}30` }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">{displayRating.toFixed(1)}</span>
                </div>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: theme.primaryColor }}
                >
                  ({displayReviewCount} reviews)
                </button>
                <div className="h-4 w-px" style={{ backgroundColor: `${theme.textColor}30` }} />
                <span className="text-sm" style={getSecondaryTextStyle()}>SKU: {product.sku}</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold" style={{ color: theme.textColor }}>
                  ${Number(product.salePrice || product.price || 0).toFixed(2)}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-2xl line-through" style={{ color: theme.textColor, opacity: 0.4 }}>
                      ${Number(product.price || 0).toFixed(2)}
                    </span>
                    <span
                      className={`px-2 py-1 text-sm font-bold ${getBorderRadius('small')} text-white`}
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Save ${(product.price - product.salePrice).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              {typeof product.inStock === 'number' && (
                <div
                  className={`p-4 ${getBorderRadius('medium')} border`}
                  style={{
                    backgroundColor: product.inStock <= 0 ? 'rgba(239, 68, 68, 0.1)' : product.inStock <= 10 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    borderColor: product.inStock <= 0 ? 'rgba(239, 68, 68, 0.3)' : product.inStock <= 10 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {product.inStock <= 0 ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-600">{t('product.outOfStock')}</span>
                      </>
                    ) : product.inStock <= 10 ? (
                      <>
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-700">{t('product.lowStock', { count: product.inStock })}</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">{t('cart.inStock')}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (() => {
                // Filter valid colors (must have name and code, not empty arrays)
                const validColors = product.colors.filter((color: any) => {
                  if (!color || Array.isArray(color) || typeof color !== 'object') return false;
                  return color.name && color.code;
                });

                if (validColors.length === 0) return null;

                return (
                  <div>
                    <label className="block font-semibold mb-3" style={{ color: theme.textColor }}>
                      Color: <span className="font-normal" style={getSecondaryTextStyle()}>{selectedColor || 'Select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {validColors.map((color: any, index: number) => {
                        const colorName = color.name;
                        let colorCode = color.code;

                        // Ensure color code has # prefix if it's a hex value
                        if (colorCode && !colorCode.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(colorCode)) {
                          colorCode = '#' + colorCode;
                        }

                        const isSelected = selectedColor === colorName;

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(colorName)}
                            title={colorName}
                            className={`w-10 h-10 rounded-lg transition-all ${isSelected ? 'ring-2 ring-offset-2' : 'hover:scale-105'}`}
                            style={{
                              backgroundColor: colorCode,
                              '--tw-ring-color': theme.primaryColor,
                              border: (colorCode?.toLowerCase() === '#ffffff' || colorCode?.toLowerCase() === '#fff') ? '1px solid #e5e7eb' : 'none',
                            } as React.CSSProperties}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block font-semibold mb-3" style={{ color: theme.textColor }}>
                    Size: <span className="font-normal" style={getSecondaryTextStyle()}>{selectedSize || 'Select'}</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 ${getBorderRadius('medium')} border-2 text-sm font-medium transition-all`}
                        style={{
                          borderColor: selectedSize === size ? theme.primaryColor : `${theme.textColor}20`,
                          backgroundColor: selectedSize === size ? theme.primaryColor : 'transparent',
                          color: selectedSize === size ? '#fff' : theme.textColor,
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block font-semibold mb-3" style={{ color: theme.textColor }}>{t('common.qty')}:</label>
                <div
                  className={`flex items-center ${getBorderRadius('medium')} border w-fit`}
                  style={{ borderColor: `${theme.textColor}20` }}
                >
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 transition-opacity hover:opacity-70"
                    style={{ color: theme.textColor }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-semibold min-w-[60px] text-center" style={{ color: theme.textColor }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="p-3 transition-opacity hover:opacity-70"
                    style={{ color: theme.textColor }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock !== undefined && product.inStock <= 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold ${getBorderRadius('medium')} text-white transition-all ${product.inStock !== undefined && product.inStock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock !== undefined && product.inStock <= 0 ? t('product.outOfStock') : t('common.addToCart')}
                </button>
                <button
                  onClick={() => navigate(`/ar-tryon/${product.id}`)}
                  className={`flex items-center justify-center gap-2 px-6 py-4 font-semibold ${getBorderRadius('medium')} transition-all hover:opacity-90`}
                  style={{
                    backgroundColor: 'transparent',
                    border: `2px solid ${theme.primaryColor}`,
                    color: theme.primaryColor
                  }}
                >
                  <Camera className="w-5 h-5" />
                  {t('product.tryOn')}
                </button>
              </div>

              {/* Trust Badges */}
              <div
                className={`grid grid-cols-2 gap-4 p-4 ${getBorderRadius('medium')}`}
                style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
              >
                {[
                  { icon: Truck, title: t('cart.freeShippingOver'), desc: '$100+', color: 'blue' },
                  { icon: Shield, title: t('cart.secureCheckout'), desc: '100%', color: 'green' },
                  { icon: RefreshCw, title: t('cart.freeReturns'), desc: '30', color: 'purple' },
                  { icon: Check, title: t('cart.buyerProtection'), desc: '100%', color: 'orange' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${theme.primaryColor}15` }}
                    >
                      <badge.icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: theme.textColor }}>{badge.title}</h4>
                      <p className="text-xs" style={getSecondaryTextStyle()}>{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs Section */}
      <div className="border-t px-6 py-12" style={{ borderColor: `${theme.textColor}15` }}>
        <div className="max-w-7xl mx-auto">
          {/* Tab Headers */}
          <div
            className="flex gap-8 border-b mb-8 overflow-x-auto"
            style={{ borderColor: `${theme.textColor}15` }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? '' : 'border-transparent'}`}
                style={{
                  borderColor: activeTab === tab.id ? theme.primaryColor : 'transparent',
                  color: activeTab === tab.id ? theme.textColor : `${theme.textColor}70`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="max-w-4xl">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {t('product.description')}
              </h2>
              <p className="leading-relaxed mb-6" style={getSecondaryTextStyle()}>
                {product.description || t('product.noDescription')}
              </p>

              {product.features && product.features.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-3" style={{ color: theme.textColor }}>{t('product.features')}:</h3>
                  <ul className="grid md:grid-cols-2 gap-3 mb-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                        <span style={getSecondaryTextStyle()}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-3" style={{ color: theme.textColor }}>{t('product.specifications')}:</h3>
                  <div
                    className={`${getBorderRadius('medium')} p-6`}
                    style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
                  >
                    <dl className="grid md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between pb-2 border-b"
                          style={{ borderColor: `${theme.textColor}15` }}
                        >
                          <dt className="font-semibold" style={{ color: theme.textColor }}>{key}:</dt>
                          <dd style={getSecondaryTextStyle()}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-5xl">
              {/* Write Review Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                  >
                    <div
                      className={`${getBorderRadius('large')} p-6 border`}
                      style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold" style={{ color: theme.textColor }}>{t('products.reviews.writeReview')}</h3>
                        <button onClick={() => setShowReviewForm(false)} className="p-2 rounded-full hover:opacity-70">
                          <X className="w-5 h-5" style={{ color: theme.textColor }} />
                        </button>
                      </div>

                      {/* Star Rating */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.textColor }}>{t('products.reviews.yourRating')} *</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${star <= (reviewHoverRating || reviewRating) ? 'fill-yellow-400 text-yellow-400' : ''}`}
                                style={{ color: star <= (reviewHoverRating || reviewRating) ? undefined : `${theme.textColor}30` }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Title */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.textColor }}>{t('products.reviews.reviewTitle')}</label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder={t('products.reviews.reviewTitlePlaceholder')}
                          className={`w-full px-4 py-3 ${getBorderRadius('medium')} border focus:outline-none`}
                          style={{
                            backgroundColor: getCardBg(),
                            borderColor: `${theme.textColor}20`,
                            color: theme.textColor,
                          }}
                        />
                      </div>

                      {/* Review Comment */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2" style={{ color: theme.textColor }}>{t('products.reviews.yourReview')} *</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={t('products.reviews.yourReviewPlaceholder')}
                          rows={4}
                          className={`w-full px-4 py-3 ${getBorderRadius('medium')} border focus:outline-none resize-none`}
                          style={{
                            backgroundColor: getCardBg(),
                            borderColor: `${theme.textColor}20`,
                            color: theme.textColor,
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: reviewComment.length < 10 ? theme.textColor : theme.primaryColor, opacity: reviewComment.length < 10 ? 0.5 : 1 }}>
                          {reviewComment.length}/10 {t('products.reviews.charactersMinimum')}
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowReviewForm(false)}
                          disabled={reviewSubmitting}
                          className={`px-4 py-2 ${getBorderRadius('medium')} border font-medium transition-opacity hover:opacity-70`}
                          style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          disabled={reviewSubmitting || reviewRating === 0 || reviewComment.trim().length < 10}
                          className={`px-4 py-2 ${getBorderRadius('medium')} font-medium text-white flex items-center gap-2 transition-opacity ${reviewSubmitting || reviewRating === 0 || reviewComment.trim().length < 10 ? 'opacity-50' : 'hover:opacity-90'}`}
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          {reviewSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                          {reviewSubmitting ? t('products.reviews.submitting') : t('products.reviews.submitReview')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="md:col-span-1">
                  <div
                    className={`${getBorderRadius('medium')} p-6 text-center`}
                    style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
                  >
                    <div className="text-5xl font-bold mb-2" style={{ color: theme.textColor }}>{displayRating.toFixed(1)}</div>
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(displayRating) ? 'fill-yellow-400 text-yellow-400' : ''}`}
                          style={{ color: star <= Math.round(displayRating) ? undefined : `${theme.textColor}30` }}
                        />
                      ))}
                    </div>
                    <p className="text-sm" style={getSecondaryTextStyle()}>{t('products.reviews.basedOnReviews', { count: displayReviewCount })}</p>
                  </div>

                  {!showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className={`w-full mt-4 px-4 py-3 ${getBorderRadius('medium')} font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90`}
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {t('products.reviews.writeReview')}
                    </button>
                  )}

                  {/* Rating Distribution */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3" style={{ color: theme.textColor }}>{t('products.reviews.ratingDistribution')}</h4>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingDistribution[rating] || 0;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <button
                          key={rating}
                          onClick={() => setReviewFilter(reviewFilter === rating ? null : rating)}
                          className={`w-full flex items-center gap-2 mb-2 text-sm p-2 ${getBorderRadius('small')} transition-colors`}
                          style={{
                            backgroundColor: reviewFilter === rating ? `${theme.primaryColor}15` : 'transparent',
                          }}
                        >
                          <span className="font-medium w-8" style={{ color: theme.textColor }}>{rating}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <div
                            className={`flex-1 h-2 ${getBorderRadius('small')} overflow-hidden`}
                            style={{ backgroundColor: `${theme.textColor}15` }}
                          >
                            <div
                              className={`h-full ${getBorderRadius('small')}`}
                              style={{ width: `${percentage}%`, backgroundColor: theme.primaryColor }}
                            />
                          </div>
                          <span style={getSecondaryTextStyle()} className="w-8 text-right">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: theme.textColor }}>{t('products.customerReviews')}</h3>
                    {reviewFilter && (
                      <button
                        onClick={() => setReviewFilter(null)}
                        className="text-sm hover:opacity-70"
                        style={{ color: theme.primaryColor }}
                      >
                        {t('products.reviews.clearFilter')}
                      </button>
                    )}
                  </div>

                  {reviewsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primaryColor }} />
                    </div>
                  ) : displayedReviews.length === 0 ? (
                    <div
                      className={`text-center py-12 ${getBorderRadius('medium')}`}
                      style={{ backgroundColor: getCardBg() }}
                    >
                      <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: theme.textColor, opacity: 0.3 }} />
                      <h4 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>{t('products.reviews.noReviewsYet')}</h4>
                      <p className="mb-4" style={getSecondaryTextStyle()}>{t('products.reviews.beFirstToReview')}</p>
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className={`px-4 py-2 ${getBorderRadius('medium')} font-medium text-white`}
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {t('products.reviews.writeReview')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b pb-6 last:border-0"
                          style={{ borderColor: `${theme.textColor}15` }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${theme.primaryColor}20` }}
                            >
                              {review.userAvatar ? (
                                <img src={review.userAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <span className="font-bold text-lg" style={{ color: theme.primaryColor }}>
                                  {(review.userName || 'A')[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold" style={{ color: theme.textColor }}>{review.userName || 'Anonymous'}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : ''}`}
                                          style={{ color: star <= review.rating ? undefined : `${theme.textColor}30` }}
                                        />
                                      ))}
                                    </div>
                                    {review.verified && (
                                      <span
                                        className={`text-xs px-2 py-0.5 ${getBorderRadius('small')} font-medium`}
                                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'rgb(22, 163, 74)' }}
                                      >
                                        {t('products.reviews.verified')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm" style={getSecondaryTextStyle()}>
                                  {review.createdAt && new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              {review.title && (
                                <h5 className="font-semibold mb-2" style={{ color: theme.textColor }}>{review.title}</h5>
                              )}
                              <p className="mb-3" style={getSecondaryTextStyle()}>{review.comment}</p>

                              {(review.size || review.color) && (
                                <div className="flex items-center gap-4 text-sm mb-3" style={getSecondaryTextStyle()}>
                                  {review.size && <span>{t('cart.size')}: {review.size}</span>}
                                  {review.color && <span>{t('cart.color')}: {review.color}</span>}
                                </div>
                              )}

                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                  {review.images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt=""
                                      className={`w-20 h-20 object-cover ${getBorderRadius('small')}`}
                                    />
                                  ))}
                                </div>
                              )}

                              <button
                                onClick={() => handleMarkHelpful(review.id)}
                                className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
                                style={{ color: theme.textColor }}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                {t('products.reviews.helpful', { count: review.helpful || 0 })}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredReviews.length > 3 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setExpandedReviews(!expandedReviews)}
                        className={`px-6 py-2 ${getBorderRadius('medium')} border font-medium flex items-center gap-2 mx-auto transition-opacity hover:opacity-70`}
                        style={{ borderColor: `${theme.textColor}20`, color: theme.textColor }}
                      >
                        {expandedReviews ? (
                          <>Show Less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Show More Reviews <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-4xl">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <Truck className="w-6 h-6" style={{ color: theme.primaryColor }} />
                    {t('products.shippingInfo')}
                  </h3>
                  <div className="space-y-4">
                    {/* Standard Shipping - Always shown */}
                    <div
                      className={`${getBorderRadius('medium')} p-4`}
                      style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
                    >
                      <h4 className="font-semibold mb-1" style={{ color: theme.textColor }}>{t('products.shipping.standard')}</h4>
                      <p className="text-sm mb-1" style={getSecondaryTextStyle()}>{product?.shippingInfo?.standardDays || '5-7'} {t('products.shipping.businessDays')}</p>
                      <p className="text-sm" style={{ color: theme.primaryColor }}>{t('products.shipping.freeOver')} ${product?.shippingInfo?.freeShippingThreshold || 100}</p>
                    </div>
                    {/* Express Shipping - Show if available */}
                    {product?.shippingInfo?.expressDays && (
                      <div
                        className={`${getBorderRadius('medium')} p-4`}
                        style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
                      >
                        <h4 className="font-semibold mb-1" style={{ color: theme.textColor }}>{t('products.shipping.express')}</h4>
                        <p className="text-sm mb-1" style={getSecondaryTextStyle()}>{product.shippingInfo.expressDays} {t('products.shipping.businessDays')}</p>
                        <p className="text-sm" style={{ color: theme.primaryColor }}>${product.shippingInfo.expressCost || 15.99}</p>
                      </div>
                    )}
                    {/* Next Day Delivery - Show if available */}
                    {product?.shippingInfo?.nextDayCost && (
                      <div
                        className={`${getBorderRadius('medium')} p-4`}
                        style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
                      >
                        <h4 className="font-semibold mb-1" style={{ color: theme.textColor }}>{t('products.shipping.nextDay')}</h4>
                        <p className="text-sm mb-1" style={getSecondaryTextStyle()}>1 {t('products.shipping.businessDay')}</p>
                        <p className="text-sm" style={{ color: theme.primaryColor }}>${product.shippingInfo.nextDayCost}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <RefreshCw className="w-6 h-6" style={{ color: theme.primaryColor }} />
                    {t('products.returnPolicy')}
                  </h3>
                  <div
                    className={`${getBorderRadius('medium')} p-6`}
                    style={{ backgroundColor: getCardBg(), border: `1px solid ${theme.textColor}15` }}
                  >
                    <ul className="space-y-3">
                      {/* Return window */}
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                        <span className="text-sm" style={getSecondaryTextStyle()}>
                          {product?.returnPolicy?.returnDays || 30}-{t('products.returnPolicyItems.returnWindowDays')}
                        </span>
                      </li>
                      {/* Dynamic conditions from product */}
                      {product?.returnPolicy?.conditions && product.returnPolicy.conditions.length > 0 ? (
                        product.returnPolicy.conditions.map((condition: string, i: number) => (
                          <li key={`cond-${i}`} className="flex items-start gap-2">
                            <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                            <span className="text-sm" style={getSecondaryTextStyle()}>{condition}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                          <span className="text-sm" style={getSecondaryTextStyle()}>{t('products.returnPolicyItems.itemCondition')}</span>
                        </li>
                      )}
                      {/* Free returns if enabled */}
                      {product?.returnPolicy?.freeReturns && (
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                          <span className="text-sm" style={getSecondaryTextStyle()}>{t('products.returnPolicyItems.freeReturn')}</span>
                        </li>
                      )}
                      {/* Refund option */}
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                        <span className="text-sm" style={getSecondaryTextStyle()}>{t('products.returnPolicyItems.refundOption')}</span>
                      </li>
                      {/* Refund time */}
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
                        <span className="text-sm" style={getSecondaryTextStyle()}>
                          {t('products.returnPolicyItems.refundProcessed')} {product?.returnPolicy?.refundDays || '5-7'} {t('products.shipping.businessDays')}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t px-6 py-12" style={{ borderColor: `${theme.textColor}15` }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: theme.headingFont, color: theme.textColor }}
              >
                {t('cart.youMightAlsoLike')}
              </h2>
              <Link
                to={`/store/${shopId}/products`}
                className="font-semibold hover:opacity-70 transition-opacity"
                style={{ color: theme.primaryColor }}
              >
                {t('common.viewAll')}
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/store/${shopId}/product/${relatedProduct.id}`}
                  className={`${getBorderRadius('large')} overflow-hidden border group`}
                  style={{ backgroundColor: getCardBg(), borderColor: `${theme.textColor}15` }}
                >
                  <div
                    className="aspect-square overflow-hidden"
                    style={{ backgroundColor: `${theme.textColor}10` }}
                  >
                    {relatedProduct.images?.[0] ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12" style={{ color: theme.textColor, opacity: 0.3 }} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold line-clamp-2 mb-2 group-hover:opacity-70 transition-opacity"
                      style={{ color: theme.textColor }}
                    >
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm" style={{ color: theme.textColor }}>
                        {Number(relatedProduct.rating || 5).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: theme.primaryColor }}>
                        ${Number(relatedProduct.salePrice || relatedProduct.price || 0).toFixed(2)}
                      </span>
                      {relatedProduct.salePrice && (
                        <span className="text-sm line-through" style={{ color: theme.textColor, opacity: 0.4 }}>
                          ${Number(relatedProduct.price || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StorefrontProductDetailPage;

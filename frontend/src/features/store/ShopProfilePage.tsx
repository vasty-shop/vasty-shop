'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Star,
  MapPin,
  Package,
  ShoppingCart,
  Heart,
  Share2,
  Clock,
  CheckCircle2,
  Shield,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Grid3X3,
  LayoutList,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { toast } from 'sonner';
import { Product as ProductType, Size } from '@/types';

interface ShopDetails {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  banner?: string;
  description?: string;
  rating: number;
  reviewCount?: number;
  productCount: number;
  location?: string;
  region?: string;
  createdAt?: string;
  verified?: boolean;
  status?: string;
  categories?: string[];
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  category?: string;
  description?: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  productId?: string;
  productName?: string;
}

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
      <div
        className="relative aspect-square bg-gray-50 overflow-hidden"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {product.salePrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </div>
        )}

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
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-10 h-10 rounded-full bg-primary-lime text-white flex items-center justify-center shadow-lg hover:bg-primary-lime/90 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4" onClick={() => navigate(`/products/${product.id}`)}>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-lime transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600">{(Number(product.rating) || 0).toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-400">({product.reviews || 0} reviews)</span>
        </div>

        <div className="flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-primary-lime">
                ${(Number(product.salePrice) || 0).toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${(Number(product.price) || 0).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${(Number(product.price) || 0).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-primary-lime">
              {review.userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">{review.userName}</h4>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
          )}
          {review.productName && (
            <p className="text-xs text-gray-500 mb-2">
              Reviewed: {review.productName}
            </p>
          )}
          <p className="text-sm text-gray-600">{review.comment}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ShopProfilePage() {
  const { t } = useTranslation();
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<number, number>>({});
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const fetchShopData = useCallback(async () => {
    if (!shopId) return;

    setIsLoading(true);
    try {
      // Fetch shop details
      const shopData = await api.getShop(shopId);
      setShop(shopData.data || shopData);

      // Fetch shop products
      const productsResponse = await api.getProducts({ shopId, limit: 50 });
      // API returns { data: any[]; total: number }
      const productsData = productsResponse?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Fetch shop reviews
      try {
        const reviewsResponse = await api.getShopReviews(shopId, { limit: 50 });
        setReviews(reviewsResponse?.data || []);
        setRatingBreakdown(reviewsResponse?.ratingBreakdown || {});
        setAverageRating(reviewsResponse?.averageRating || 0);
      } catch {
        // Reviews API might not be available yet
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch shop data:', error);
      toast.error('Failed to load shop details');
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleAddToCart = (product: Product) => {
  const { t } = useTranslation();
    // Convert local Product to global ProductType for the cart store
    const productForCart: ProductType = {
      id: product.id,
      name: product.name,
      brand: '',
      price: product.price,
      salePrice: product.salePrice,
      images: product.images || [],
      sizes: ['M'] as Size[],
      rating: product.rating,
      category: product.category || '',
    };
    addItem(productForCart, 'M');
    toast.success('Added to cart');
  };

  const handleWishlistToggle = (productId: string) => {
  const { t } = useTranslation();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const isWishlisted = wishlistItems.some(item => item.product.id === productId);
    if (isWishlisted) {
      removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } else {
      // Convert local Product to global ProductType for the wishlist store
      const productForWishlist: ProductType = {
        id: product.id,
        name: product.name,
        brand: '',
        price: product.price,
        salePrice: product.salePrice,
        images: product.images || [],
        sizes: ['M'] as Size[],
        rating: product.rating,
        category: product.category || '',
      };
      addToWishlist(productForWishlist);
      toast.success('Added to wishlist');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: shop?.name || 'Check out this shop',
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleSubmitReview = async () => {
    if (!shopId || !reviewForm.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.submitShopReview(shopId, {
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || undefined,
        comment: reviewForm.comment.trim(),
      });
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      // Refresh reviews
      const reviewsResponse = await api.getShopReviews(shopId, { limit: 50 });
      setReviews(reviewsResponse?.data || []);
      setRatingBreakdown(reviewsResponse?.ratingBreakdown || {});
      setAverageRating(reviewsResponse?.averageRating || 0);
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Store className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h1>
          <p className="text-gray-500 mb-6">
            The shop you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/explore')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const memberSince = shop.createdAt
    ? new Date(shop.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Shop Banner & Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary-lime/30 via-emerald-500/20 to-teal-500/30 relative overflow-hidden">
          {shop.banner ? (
            <img
              src={shop.banner}
              alt={`${shop.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-4 opacity-10">
                {[...Array(8)].map((_, i) => (
                  <Package key={i} className="w-16 h-16 text-gray-800" />
                ))}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        {/* Shop Info Card */}
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary-lime/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-lg border-4 border-white">
                {shop.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <Store className="w-12 h-12 md:w-16 md:h-16 text-primary-lime" />
                )}
              </div>

              {/* Shop Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {shop.name}
                      </h1>
                      {shop.verified && (
                        <CheckCircle2 className="w-6 h-6 text-primary-lime" />
                      )}
                    </div>

                    {shop.location && (
                      <div className="flex items-center gap-1 text-gray-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.location}</span>
                      </div>
                    )}

                    {shop.description && (
                      <p className="text-gray-600 max-w-2xl line-clamp-2 mb-4">
                        {shop.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 md:gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {(Number(shop.rating) || 0).toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary-lime/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary-lime" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {shop.productCount || 0}
                          </p>
                          <p className="text-xs text-gray-500">Products</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {shop.reviewCount || reviews.length || 0}
                          </p>
                          <p className="text-xs text-gray-500">Reviews</p>
                        </div>
                      </div>

                      {memberSince && (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {memberSince}
                            </p>
                            <p className="text-xs text-gray-500">Member since</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                {shop.verified && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Verified Seller</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Top Rated</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-700">Fast Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare },
              { id: 'about', label: 'About', icon: Store },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'products' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-primary-lime text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-primary-lime text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {products.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlistItems.some(item => item.product.id === product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products yet
                </h3>
                <p className="text-gray-500">
                  This shop hasn't listed any products yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>

                {/* Average Rating */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {Number(averageRating) > 0 ? (Number(averageRating) || 0).toFixed(1) : 'N/A'}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(Number(averageRating) || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2 mb-6">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = ratingBreakdown[rating] || 0;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-6">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Button */}
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-primary-lime hover:bg-primary-lime/90"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {/* Review Form Modal */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Write Your Review
                    </h3>

                    {/* Star Rating Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewForm.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200 hover:text-yellow-200'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title (optional)
                      </label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('vendor.placeholders.reviewSummary')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none"
                      />
                    </div>

                    {/* Review Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder={t('vendor.placeholders.reviewContent')}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-lime/20 focus:border-primary-lime outline-none resize-none"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || !reviewForm.comment.trim()}
                        className="bg-primary-lime hover:bg-primary-lime/90"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewForm({ rating: 5, title: '', comment: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Be the first to review this shop!
                  </p>
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-primary-lime hover:bg-primary-lime/90"
                  >
                    Write the First Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              {/* Description */}
              {shop.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    About {shop.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{shop.description}</p>
                </div>
              )}

              {/* Categories */}
              {shop.categories && shop.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {shop.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies */}
              {shop.policies && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Shop Policies
                  </h3>
                  <div className="space-y-4">
                    {shop.policies.shipping && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Shipping</h4>
                        <p className="text-sm text-gray-600">{shop.policies.shipping}</p>
                      </div>
                    )}
                    {shop.policies.returns && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Returns</h4>
                        <p className="text-sm text-gray-600">{shop.policies.returns}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {shop.socialLinks && Object.values(shop.socialLinks).some(Boolean) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Connect
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {shop.socialLinks.website && (
                      <a
                        href={shop.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {shop.location && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Location
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{shop.location}</span>
                    {shop.region && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
                        {shop.region}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ShopProfilePage;

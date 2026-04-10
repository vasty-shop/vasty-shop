import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Star,
  ShoppingCart,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
  Award,
  Facebook,
  Twitter,
  Link2,
  Mail,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Loader2,
  MessageSquare,
  ThumbsUp,
  Camera,
  X,
  Store,
  BadgeCheck,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { cn, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Size, Product } from '@/types';

export const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();

  // State management
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedReviews, setExpandedReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState(false);

  // API state
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Refs
  const mainProductRef = useRef<HTMLDivElement>(null);
  const imageGalleryRef = useRef<HTMLDivElement>(null);

  // Fetch product data from API
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch product details
        const productData = await api.getProduct(id);

        // Transform API response to match expected format
        const transformedProduct = {
          id: productData.id || productData._id,
          name: productData.name,
          brand: productData.brand || 'Unknown Brand',
          // Price logic:
          // - If compareAtPrice exists, it's the original price (crossed out), and price is the current/sale price
          // - If salePrice exists, price is original and salePrice is current
          price: (() => {
            const compareAt = productData.compareAtPrice || productData.compare_at_price;
            // If compareAtPrice exists and is higher, use it as the "original" price
            if (compareAt && compareAt > productData.price) {
              return typeof compareAt === 'string' ? parseFloat(compareAt) : compareAt;
            }
            return typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
          })(),
          salePrice: (() => {
            // Check for explicit sale price first
            const saleVal = productData.salePrice || productData.sale_price;
            if (saleVal) {
              return typeof saleVal === 'string' ? parseFloat(saleVal) : saleVal;
            }
            // If compareAtPrice exists and is higher than price, the regular price IS the sale price
            const compareAt = productData.compareAtPrice || productData.compare_at_price;
            if (compareAt && compareAt > productData.price) {
              return typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
            }
            return null;
          })(),
          discountPercent: productData.discountPercent || productData.discount_percent,
          rating: typeof productData.rating === 'string' ? parseFloat(productData.rating) : (productData.rating || 0),
          category: productData.category || 'Uncategorized',
          description: productData.description || '',
          images: (productData.images || []).map((img: any) =>
            typeof img === 'string' ? img : (img.url || img)
          ),
          sizes: typeof productData.sizes === 'string' ? JSON.parse(productData.sizes) : (productData.sizes || []),
          colors: (() => {
            // Parse colors if it's a string (from database)
            let colorsArray = productData.colors;
            if (typeof colorsArray === 'string') {
              try {
                colorsArray = JSON.parse(colorsArray);
              } catch {
                colorsArray = [];
              }
            }
            // Ensure we have an array
            if (!Array.isArray(colorsArray)) return [];
            return colorsArray;
          })(),
          sku: productData.sku || 'N/A',
          barcode: productData.barcode || '',
          reviewCount: productData.reviewCount || productData.review_count || 0,
          reviews: productData.reviews || [],
          features: productData.features || [],
          specifications: productData.specifications || {},
          characteristics: productData.characteristics || {},
          materials: productData.materials || productData.material ? [productData.material] : [],
          careInstructions: productData.careInstructions || productData.care_instructions || [],
          sizeChart: productData.sizeChart || productData.size_chart || [],
          shippingInfo: productData.shippingInfo || productData.shipping_info || {
            freeShippingThreshold: 100,
            standardDays: '5-7',
            expressDays: '2-3',
            expressCost: 15.99,
            nextDayCost: 29.99,
          },
          returnPolicy: productData.returnPolicy || productData.return_policy || {
            returnDays: 30,
            conditions: [],
            freeReturns: true,
            refundDays: '5-7',
          },
          inStock: productData.inStock || productData.in_stock || productData.quantity || productData.stock || 0,
          viewingNow: productData.viewingNow || productData.viewing_now || Math.floor(Math.random() * 20) + 5,
          soldLast24Hours: productData.soldLast24Hours || productData.sold_last_24_hours || Math.floor(Math.random() * 10) + 1,
          // Additional fields from add product form
          compareAtPrice: productData.compareAtPrice || productData.compare_at_price || null,
          isFeatured: productData.isFeatured || productData.is_featured || false,
          tags: productData.tags || [],
          metaTitle: productData.metaTitle || productData.meta_title || '',
          metaDescription: productData.metaDescription || productData.meta_description || '',
          hasVariants: productData.hasVariants || productData.has_variants || false,
          variants: productData.variants || [],
          // Shop ID for checkout payment/delivery methods
          shopId: productData.shopId || productData.shop_id,
          // Shop info
          shop: productData.shop || null,
          shopName: productData.shopName || productData.shop_name || productData.shop?.name || null,
        };

        setProduct(transformedProduct);

        // Fetch related products
        try {
          const related = await api.getRelatedProducts(id, 4);
          // Handle both array response and object with data property
          const relatedArray = Array.isArray(related) ? related : ((related as any)?.data || []);
          setRelatedProducts(relatedArray.map((p: any) => {
            // Apply Shopify convention: price = selling price, compare_price = original
            const priceVal = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
            const comparePrice = p.compare_price || p.comparePrice || p.compareAtPrice;
            const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
            const isOnSale = comparePriceVal && comparePriceVal > priceVal;

            return {
              id: p.id || p._id,
              name: p.name,
              brand: p.brand || 'Unknown',
              price: isOnSale ? comparePriceVal : priceVal,
              salePrice: isOnSale ? priceVal : undefined,
              discountPercent: p.discountPercent || p.discount_percent,
              rating: typeof p.rating === 'string' ? parseFloat(p.rating) : (p.rating || 0),
              category: p.category,
              images: (p.images || []).map((img: any) =>
                typeof img === 'string' ? img : (img.url || img)
              ),
              sizes: p.sizes || [],
              colors: (p.colors || []).map((c: any) =>
                typeof c === 'string' ? c : c.name
              ),
            };
          }));
        } catch (relatedError) {
          console.error('Error fetching related products:', relatedError);
          // Don't set error state, just log it
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Set default size and color on load
  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) {
        // Handle both string format and object format { name, code }
        const firstColor = product.colors[0];
        const colorName = typeof firstColor === 'string' ? firstColor : firstColor.name;
        setSelectedColor(colorName);
      }
    }
  }, [product]);

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        setReviewsLoading(true);
        const reviewsData = await api.getProductReviews(id);
        setProductReviews(reviewsData.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // Fall back to product.reviews if API fails
        if (product?.reviews) {
          setProductReviews(product.reviews);
        }
      } finally {
        setReviewsLoading(false);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [id, product]);

  // Handle review submission
  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    if (reviewComment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    try {
      setReviewSubmitting(true);
      await api.createReview({
        productId: id!,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully!');

      // Reset form
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewComment('');

      // Refresh reviews
      const reviewsData = await api.getProductReviews(id!);
      setProductReviews(reviewsData.data || []);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const message = err?.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Handle marking review as helpful
  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.markReviewHelpful(reviewId);
      toast.success('Marked as helpful!');
      // Update local state
      setProductReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
      ));
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Already marked as helpful';
      toast.error(message);
    }
  };

  // Handle sticky bar visibility
  useEffect(() => {
    const handleScroll = () => {
      if (mainProductRef.current) {
        const rect = mainProductRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO - Update page title and meta
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - ${product.brand} | Vasty`;

      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', product.description.substring(0, 160));
      }
    }
  }, [product]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Loader2 className="w-16 h-16 text-primary-lime animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Product...</h1>
          <p className="text-gray-600">Please wait while we fetch product details.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Product' : 'Product Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/products')} variant="outline">
              Browse Products
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = async () => {
    // Only require size selection if the product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    // Create a product object compatible with the cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      sizes: product.sizes as Size[],
      rating: product.rating,
      category: product.category,
      colors: product.colors,
      // Include shopId for checkout to fetch vendor's payment/delivery methods
      shopId: product.shopId,
    };

    await addItem(cartProduct, selectedSize as Size, selectedColor);

    const sizeText = selectedSize ? ` (${selectedSize})` : '';
    toast.success('Added to cart!', {
      description: `${product.name}${sizeText} x${quantity}`,
    });
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const text = `Check out ${product.name} from ${product.brand}`;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      setShowShareMenu(false);
    } else if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch (err) {
        // Share cancelled
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    await toggleWishlist(product);
  };

  // Check if product is in wishlist
  const isSaved = product ? isInWishlist(product.id) : false;

  // Calculate rating distribution
  const getRatingDistribution = (reviews: any[]) => {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews?.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution(productReviews);
  const filteredReviews = reviewFilter
    ? productReviews.filter((r: any) => r.rating === reviewFilter)
    : productReviews;

  const displayedReviews = expandedReviews ? filteredReviews : filteredReviews.slice(0, 3);

  // Calculate actual rating and review count from fetched reviews
  const actualReviewCount = productReviews.length;
  const actualAverageRating = actualReviewCount > 0
    ? productReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / actualReviewCount
    : (product?.rating || 0);
  const displayRating = actualReviewCount > 0 ? actualAverageRating : (product?.rating || 0);
  const displayReviewCount = actualReviewCount > 0 ? actualReviewCount : (product?.reviewCount || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-lime transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to={`/category/${product.category.toLowerCase()}`} className="text-gray-600 hover:text-primary-lime transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div ref={mainProductRef} className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Image Gallery (60%) */}
            <div className="lg:col-span-7">
              <div ref={imageGalleryRef} className="sticky top-24">
                {/* Main Image */}
                <motion.div
                  className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-4 cursor-zoom-in"
                  onClick={() => setZoomedImage(!zoomedImage)}
                  layoutId="main-image"
                >
                  <motion.img
                    key={selectedImageIndex}
                    src={product.images[selectedImageIndex]}
                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    className={cn(
                      'w-full h-full object-cover transition-transform duration-300',
                      zoomedImage && 'scale-150'
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Sale Badge */}
                  {product.discountPercent && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="sale" className="text-sm px-3 py-1.5 font-bold">
                        -{product.discountPercent}% OFF
                      </Badge>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-900" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                </motion.div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-6 gap-2 overflow-x-auto">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                        selectedImageIndex === index
                          ? 'border-primary-lime ring-2 ring-primary-lime/30'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Product Info (40%) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                {/* Shop Info */}
                {product.shopName && (
                  <Link
                    to={product.shop?.slug ? `/store/${product.shop.slug}` : `/store/${product.shopId}`}
                    className="flex items-center gap-3 p-3 mb-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary-lime/10 flex items-center justify-center flex-shrink-0">
                      {product.shop?.logo ? (
                        <img
                          src={product.shop.logo}
                          alt={product.shopName}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-primary-lime" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 group-hover:text-primary-lime transition-colors truncate">
                          {product.shopName}
                        </span>
                        {product.shop?.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        {Number(product.shop?.rating) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {(Number(product.shop?.rating) || 0).toFixed(1)}
                          </span>
                        )}
                        {product.shop?.totalProducts > 0 && (
                          <span>{product.shop.totalProducts} Products</span>
                        )}
                        <span className="text-primary-lime font-medium">Visit Store</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-lime transition-colors" />
                  </Link>
                )}

                {/* Brand */}
                <div className="flex items-center justify-between mb-3">
                  {product.brand && product.brand !== 'Unknown Brand' ? (
                    <Link to={`/brand/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className="text-sm font-semibold text-primary-lime hover:underline uppercase tracking-wide">
                        {product.brand}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWishlistToggle}
                      className={cn(
                        'p-2 rounded-full border transition-all',
                        isSaved
                          ? 'bg-red-50 border-red-200 hover:bg-red-100'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <Heart
                        className={cn('w-5 h-5', isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600')}
                      />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="p-2 rounded-full border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Share Menu */}
                      <AnimatePresence>
                        {showShareMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                          >
                            <button
                              onClick={() => handleShare('facebook')}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <Facebook className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">Facebook</span>
                            </button>
                            <button
                              onClick={() => handleShare('twitter')}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <Twitter className="w-4 h-4 text-blue-400" />
                              <span className="text-sm">Twitter</span>
                            </button>
                            <button
                              onClick={() => handleShare('email')}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <Mail className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">Email</span>
                            </button>
                            <button
                              onClick={() => handleShare('copy')}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <Link2 className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">Copy Link</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-5 h-5',
                            star <= Math.round(displayRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold ml-1">{displayRating.toFixed(1)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('reviews');
                      document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-sm text-gray-600 hover:text-primary-lime transition-colors"
                  >
                    ({displayReviewCount} reviews)
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  {product.salePrice ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(product.salePrice)}
                      </span>
                      <span className="text-2xl text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant="sale" className="text-sm font-bold">
                        Save {formatPrice(product.price - product.salePrice)}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  )}
                </div>

                {/* Stock Status */}
                {product.inStock <= 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Out of Stock</span>
                    </div>
                    <p className="text-sm text-red-500 mt-1">This product is currently unavailable.</p>
                  </div>
                ) : product.inStock <= 10 ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Only {product.inStock} left in stock!</span>
                    </div>
                    <p className="text-sm text-orange-500 mt-1">Order soon before it sells out.</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-600">
                      <Package className="w-5 h-5" />
                      <span className="font-semibold">In Stock</span>
                    </div>
                    <p className="text-sm text-green-500 mt-1">{product.inStock} units available.</p>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (() => {
                  // Filter valid colors (must have name and code, not empty arrays)
                  const validColors = product.colors.filter((color: any) => {
                    if (!color || Array.isArray(color) || typeof color !== 'object') return false;
                    return color.name && color.code;
                  });

                  if (validColors.length === 0) return null;

                  return (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Color: <span className="font-normal text-gray-600">{selectedColor || 'Select color'}</span>
                        </h3>
                      </div>
                      <div className="flex gap-3 flex-wrap">
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
                              key={colorName}
                              onClick={() => setSelectedColor(colorName)}
                              title={colorName}
                              className={cn(
                                'w-10 h-10 rounded-lg transition-all duration-200',
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-primary-lime'
                                  : 'hover:scale-105'
                              )}
                              style={{
                                backgroundColor: colorCode,
                                border: (colorCode?.toLowerCase() === '#ffffff' || colorCode?.toLowerCase() === '#fff') ? '1px solid #e5e7eb' : 'none',
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Size: <span className="font-normal text-gray-600">{selectedSize || 'Select size'}</span>
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('size-guide');
                          document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-sm text-primary-lime hover:underline"
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            'py-3 rounded-lg border-2 text-sm font-medium transition-all',
                            selectedSize === size
                              ? 'border-primary-lime bg-primary-lime text-white'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantity:</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold text-gray-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.inStock <= 0}
                    className={cn(
                      "flex-1 h-14 text-base font-semibold",
                      product.inStock <= 0
                        ? "bg-gray-300 cursor-not-allowed hover:bg-gray-300"
                        : "bg-primary-lime hover:bg-primary-lime-dark"
                    )}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.inStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    onClick={() => navigate(`/ar-tryon/${product.id}`)}
                    variant="outline"
                    className="h-14 px-6 border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Try On
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Free Shipping</h4>
                      <p className="text-xs text-gray-600">On orders over ${product.shippingInfo?.freeShippingThreshold || 100}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Secure Payment</h4>
                      <p className="text-xs text-gray-600">100% protected</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Easy Returns</h4>
                      <p className="text-xs text-gray-600">{product.returnPolicy?.returnDays || 30}-day return policy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Authentic</h4>
                      <p className="text-xs text-gray-600">100% genuine</p>
                    </div>
                  </div>
                </div>

                {/* Quick Info Accordion */}
                <Accordion type="single" collapsible className="border-t border-gray-200">
                  <AccordionItem value="delivery">
                    <AccordionTrigger className="py-4 text-sm font-semibold">
                      Delivery & Returns
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 pb-4">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Free standard shipping on orders over ${product.shippingInfo?.freeShippingThreshold || 100}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Express shipping available ({product.shippingInfo?.expressDays || '2-3'} business days)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Easy {product.returnPolicy?.returnDays || 30}-day returns and exchanges</span>
                        </li>
                        {product.returnPolicy?.freeReturns && (
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Free return shipping on all orders</span>
                          </li>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="materials">
                    <AccordionTrigger className="py-4 text-sm font-semibold">
                      Materials & Care
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600 pb-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Materials:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {product.materials.map((material: string, index: number) => (
                              <li key={index}>{material}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Care Instructions:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {product.careInstructions.map((instruction: string, index: number) => (
                              <li key={index}>{instruction}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs Section */}
      <div id="product-tabs" className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent rounded-none h-auto p-0 mb-8">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-lime data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 px-6 py-3 font-semibold"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-lime data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 px-6 py-3 font-semibold"
              >
                Reviews ({displayReviewCount})
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-lime data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 px-6 py-3 font-semibold"
              >
                Shipping & Returns
              </TabsTrigger>
              <TabsTrigger
                value="size-guide"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-lime data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 px-6 py-3 font-semibold"
              >
                Size Guide
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="mt-6">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

                <h3 className="text-xl font-bold text-gray-900 mb-3">Features:</h3>
                <ul className="grid md:grid-cols-2 gap-3 mb-6">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Specifications:</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <dl className="grid md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]: [string, string]) => (
                          <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                            <dt className="font-semibold text-gray-900">{key}:</dt>
                            <dd className="text-gray-700">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
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
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        {/* Star Rating */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
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
                                  className={cn(
                                    'w-8 h-8 transition-colors',
                                    star <= (reviewHoverRating || reviewRating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  )}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600 self-center">
                              {reviewRating > 0 && (
                                <>
                                  {reviewRating === 1 && 'Poor'}
                                  {reviewRating === 2 && 'Fair'}
                                  {reviewRating === 3 && 'Good'}
                                  {reviewRating === 4 && 'Very Good'}
                                  {reviewRating === 5 && 'Excellent'}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Review Title */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Review Title (Optional)</label>
                          <input
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder={t('products.reviews.reviewTitlePlaceholder')}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime transition-all"
                          />
                        </div>

                        {/* Review Comment */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review *</label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder={t('products.reviews.yourReviewPlaceholder')}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-lime/50 focus:border-primary-lime transition-all resize-none"
                          />
                          <p className={`text-xs mt-1 ${reviewComment.length < 10 ? 'text-gray-500' : 'text-green-600'}`}>
                            {reviewComment.length}/10 characters minimum
                          </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowReviewForm(false)}
                            disabled={reviewSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmitReview}
                            disabled={reviewSubmitting || reviewRating === 0 || reviewComment.trim().length < 10}
                            className="bg-primary-lime hover:bg-primary-lime/90"
                          >
                            {reviewSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Submit Review
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  {/* Rating Summary */}
                  <div className="md:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">{displayRating.toFixed(1)}</div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-5 h-5',
                              star <= Math.round(displayRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">Based on {displayReviewCount} reviews</p>
                    </div>

                    {/* Write Review Button */}
                    {!showReviewForm && (
                      <Button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full mt-4 bg-primary-lime hover:bg-primary-lime/90"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    )}

                    {/* Rating Distribution */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Rating Distribution</h4>
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = ratingDistribution[rating] || 0;
                        const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                        return (
                          <button
                            key={rating}
                            onClick={() => setReviewFilter(reviewFilter === rating ? null : rating)}
                            className={cn(
                              'w-full flex items-center gap-2 mb-2 text-sm hover:bg-gray-50 p-2 rounded transition-colors',
                              reviewFilter === rating && 'bg-primary-lime/10'
                            )}
                          >
                            <span className="font-medium w-8">{rating}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-gray-600 w-8 text-right">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                      {reviewFilter && (
                        <button
                          onClick={() => setReviewFilter(null)}
                          className="text-sm text-primary-lime hover:underline"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>

                    {reviewsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary-lime animate-spin" />
                      </div>
                    ) : displayedReviews.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                        <p className="text-gray-600 mb-4">Be the first to review this product!</p>
                        <Button
                          onClick={() => setShowReviewForm(true)}
                          className="bg-primary-lime hover:bg-primary-lime/90"
                        >
                          Write a Review
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {displayedReviews.map((review: any) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary-lime/20 flex items-center justify-center flex-shrink-0">
                                {review.userAvatar ? (
                                  <img
                                    src={review.userAvatar}
                                    alt={review.userName || 'User'}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-primary-lime font-bold text-lg">
                                    {(review.userName || review.user?.name || 'A')[0].toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{review.userName || review.user?.name || 'Anonymous'}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={cn(
                                              'w-4 h-4',
                                              star <= review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            )}
                                          />
                                        ))}
                                      </div>
                                      {(review.verified || review.isVerifiedPurchase) && (
                                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                                          Verified Purchase
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {review.date || (review.createdAt && new Date(review.createdAt).toLocaleDateString())}
                                  </span>
                                </div>

                                {review.title && <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>}
                                <p className="text-gray-700 mb-3">{review.comment || review.content}</p>

                                {(review.size || review.color) && (
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    {review.size && <span>Size: {review.size}</span>}
                                    {review.color && <span>Color: {review.color}</span>}
                                  </div>
                                )}

                                {review.images && review.images.length > 0 && (
                                  <div className="flex gap-2 mb-3">
                                    {review.images.map((img: string, idx: number) => (
                                      <img
                                        key={idx}
                                        src={img}
                                        alt={`Review image ${idx + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg"
                                      />
                                    ))}
                                  </div>
                                )}

                                <button
                                  onClick={() => handleMarkHelpful(review.id)}
                                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-lime transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  Helpful ({review.helpful || review.helpfulCount || 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredReviews.length > 3 && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setExpandedReviews(!expandedReviews)}
                          className="min-w-[200px]"
                        >
                          {expandedReviews ? (
                            <>
                              Show Less <ChevronUp className="ml-2 w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Show More Reviews <ChevronDown className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Shipping & Returns Tab */}
            <TabsContent value="shipping" className="mt-6">
              <div className="max-w-4xl">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="w-6 h-6 text-primary-lime" />
                      Shipping Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Standard Shipping</h4>
                        <p className="text-sm text-gray-700 mb-1">{product.shippingInfo?.standardDays || '5-7'} business days</p>
                        <p className="text-sm text-gray-600">FREE on orders over ${product.shippingInfo?.freeShippingThreshold || 100}</p>
                      </div>
                      {product.shippingInfo?.expressDays && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Express Shipping</h4>
                          <p className="text-sm text-gray-700 mb-1">{product.shippingInfo.expressDays} business days</p>
                          <p className="text-sm text-gray-600">${product.shippingInfo.expressCost || 15.99}</p>
                        </div>
                      )}
                      {product.shippingInfo?.nextDayCost && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Next Day Delivery</h4>
                          <p className="text-sm text-gray-700 mb-1">1 business day</p>
                          <p className="text-sm text-gray-600">${product.shippingInfo.nextDayCost}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <RefreshCw className="w-6 h-6 text-primary-lime" />
                      Return Policy
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {product.returnPolicy?.returnDays || 30}-day return window from delivery date
                          </span>
                        </li>
                        {product.returnPolicy?.conditions && product.returnPolicy.conditions.length > 0 ? (
                          product.returnPolicy.conditions.map((condition: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{condition}</span>
                            </li>
                          ))
                        ) : (
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              Items must be unworn with original tags
                            </span>
                          </li>
                        )}
                        {product.returnPolicy?.freeReturns && (
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              Free return shipping on all orders
                            </span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Full refund or exchange available
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Refunds processed within {product.returnPolicy?.refundDays || '5-7'} business days
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Size Guide Tab */}
            <TabsContent value="size-guide" className="mt-6">
              <div className="max-w-4xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Size Guide</h3>
                <div className="overflow-x-auto bg-gray-50 rounded-lg p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Chest</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Waist</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Hips</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizeChart.map((sizeInfo: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-3 px-4 font-semibold text-gray-900">{sizeInfo.size}</td>
                          <td className="py-3 px-4 text-gray-700">{sizeInfo.chest}</td>
                          <td className="py-3 px-4 text-gray-700">{sizeInfo.waist}</td>
                          <td className="py-3 px-4 text-gray-700">{sizeInfo.hips}</td>
                          <td className="py-3 px-4 text-gray-700">{sizeInfo.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">How to Measure</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
                    <li><strong>Waist:</strong> Measure around your natural waistline</li>
                    <li><strong>Hips:</strong> Measure around the fullest part of your hips</li>
                    <li><strong>Length:</strong> Measure from shoulder to desired length</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="bg-white border-t border-gray-200 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link to="/shop" className="text-primary-lime hover:underline font-semibold">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    id: relatedProduct.id,
                    name: relatedProduct.name,
                    brand: relatedProduct.brand,
                    price: relatedProduct.price,
                    salePrice: relatedProduct.salePrice,
                    discountPercent: relatedProduct.discountPercent,
                    images: relatedProduct.images,
                    sizes: relatedProduct.sizes as Size[],
                    rating: relatedProduct.rating,
                    category: relatedProduct.category,
                    colors: relatedProduct.colors,
                  }}
                  onClick={(p: Product) => {
                    navigate(`/product/${p.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar - Mobile */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50 lg:hidden"
          >
            <div className="flex items-center gap-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(product.salePrice || product.price)}
                </p>
              </div>
              <Button onClick={handleAddToCart} className="flex-shrink-0">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

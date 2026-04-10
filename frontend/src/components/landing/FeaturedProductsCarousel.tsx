import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ShoppingBag, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';
import { api } from '@/lib/api';

export interface FeaturedProductsCarouselProps {
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onSeeAll?: () => void;
  wishlistedProducts?: Set<string>;
  className?: string;
}

interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export const FeaturedProductsCarousel: React.FC<FeaturedProductsCarouselProps> = ({
  onWishlistToggle,
  onAddToCart,
  onQuickView,
  onSeeAll,
  wishlistedProducts = new Set(),
  className,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [hoveredProduct, setHoveredProduct] = React.useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = React.useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch featured products from API
  React.useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const products = await api.getFeaturedProducts(8);

        // Default placeholder image - inline SVG to avoid external dependency
        const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

        // Transform API response to match FeaturedProduct interface
        const transformedProducts: FeaturedProduct[] = products.map((product: any) => {
          // Handle images array - can be strings or objects with url property
          let imageUrl = PLACEHOLDER_IMAGE;
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'string' && firstImage.trim()) {
              imageUrl = firstImage;
            } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
              imageUrl = firstImage.url;
            }
          } else if (product.image) {
            imageUrl = product.image;
          }

          return {
            id: product.id || product._id,
            name: product.name,
            category: product.category || product.categoryName || 'Uncategorized',
            price: parseFloat(product.salePrice || product.sale_price || product.price) || 0,
            image: imageUrl,
          };
        });

        setFeaturedProducts(transformedProducts);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Check scroll position
  const checkScroll = React.useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoading) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, isLoading, featuredProducts.length]);

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const handleWishlistClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onWishlistToggle?.(productId);
  };

  const handleQuickView = (e: React.MouseEvent, product: FeaturedProduct) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product as any);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: FeaturedProduct) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product as any);
    }
  };

  return (
    <section className={cn('w-full py-8 md:py-12 bg-white', className)}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900"
          >
            Featured Products
          </motion.h2>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={onSeeAll}
            className="text-sm md:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Left Navigation Arrow */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scroll('left')}
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                  'bg-white rounded-full p-2 md:p-3 shadow-lg',
                  'hover:bg-gray-50 transition-all duration-200',
                  'opacity-0 group-hover/carousel:opacity-100',
                  '-translate-x-1/2'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right Navigation Arrow */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scroll('right')}
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                  'bg-white rounded-full p-2 md:p-3 shadow-lg',
                  'hover:bg-gray-50 transition-all duration-200',
                  'opacity-0 group-hover/carousel:opacity-100',
                  'translate-x-1/2'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isLoading && (
            <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex-none w-[250px] md:w-[280px]">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="relative aspect-square bg-gray-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-gray-600 text-center mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Products Scroll Container */}
          {!isLoading && !error && (
            <div
              ref={scrollContainerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featuredProducts.length === 0 ? (
                <div className="w-full text-center py-12 text-gray-500">
                  No featured products available at the moment.
                </div>
              ) : (
                featuredProducts.map((product, index) => {
              const isWishlisted = wishlistedProducts.has(product.id);
              const isHovered = hoveredProduct === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-none w-[250px] md:w-[280px]"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div
                    className={cn(
                      'bg-white rounded-xl overflow-hidden transition-all duration-300',
                      'hover:shadow-xl group/card'
                    )}
                  >
                    {/* Product Image Container */}
                    <div className="relative">
                      <Link to={`/product/${product.id}`} className="block">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer">
                          {/* Product Image */}
                          <div className="absolute inset-0 flex items-center justify-center p-8">
                            <motion.div
                              className="w-full h-full relative"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <img
                                src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to placeholder on error
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center';
                                    fallback.innerHTML = '<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            </motion.div>
                          </div>
                        </div>
                      </Link>

                      {/* Action Icons - Top Right */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        {/* Wishlist Button */}
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className={cn(
                            'p-2 rounded-full backdrop-blur-sm transition-all duration-200',
                            isWishlisted
                              ? 'bg-red-50 hover:bg-red-100'
                              : 'bg-white/90 hover:bg-white'
                          )}
                          onClick={(e) => handleWishlistClick(e, product.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart
                            className={cn(
                              'w-5 h-5 transition-colors',
                              isWishlisted
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600'
                            )}
                          />
                        </motion.button>

                        {/* Quick View Button */}
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200"
                          onClick={(e) => handleQuickView(e, product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </motion.button>
                      </div>

                      {/* Add to Cart Button - Shows on Hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-0 left-0 right-0 p-4 z-10"
                          >
                            <Button
                              size="default"
                              className={cn(
                                'w-full bg-white hover:bg-gray-50 text-gray-900',
                                'shadow-lg border border-gray-200',
                                'transition-all duration-200'
                              )}
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Add to cart
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      {/* Product Name */}
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 hover:text-primary-lime transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Category */}
                      <p className="text-sm text-gray-500 mb-3">
                        {product.category}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-red-500">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hide Scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedProductsCarousel;

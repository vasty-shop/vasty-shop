import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Store, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/useWishlistStore';
import type { Product } from '@/types';

// Default placeholder image - using data URI to avoid external dependency
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

export interface ProductCardProps {
  product: Product;
  variant?: 'standard' | 'flash-sale' | 'compact';
  showQuickAdd?: boolean;
  showRating?: boolean;
  showBadges?: boolean;
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onClick?: (product: Product) => void;
  isWishlisted?: boolean;
  className?: string;
  // Flash sale specific props
  flashSale?: {
    endTime: Date;
    soldCount: number;
    totalStock: number;
  };
}

interface CountdownTimerProps {
  endTime: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();

      if (difference > 0) {
        return {
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <span className="bg-card-black text-white px-2 py-1 rounded min-w-[28px] text-center">
        {String(timeLeft.hours).padStart(2, '0')}
      </span>
      <span className="text-text-secondary">:</span>
      <span className="bg-card-black text-white px-2 py-1 rounded min-w-[28px] text-center">
        {String(timeLeft.minutes).padStart(2, '0')}
      </span>
      <span className="text-text-secondary">:</span>
      <span className="bg-card-black text-white px-2 py-1 rounded min-w-[28px] text-center">
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'standard',
  showQuickAdd = true,
  showRating = true,
  showBadges = true,
  onWishlistToggle,
  onAddToCart,
  onClick: _onClick,
  isWishlisted: isWishlistedProp,
  className,
  flashSale,
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Connect to wishlist store
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));

  // Use prop if provided, otherwise use store state
  const isWishlisted = isWishlistedProp !== undefined ? isWishlistedProp : isInWishlist;

  // Get product image with proper fallback
  const getProductImage = (): string => {
    if (imageError) return PLACEHOLDER_IMAGE;

    // Check for images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      // Handle string URL directly
      if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
        return firstImage;
      }

      // Handle object with url property (from addImage API)
      if (firstImage && typeof firstImage === 'object' && (firstImage as any).url) {
        const url = (firstImage as any).url;
        if (typeof url === 'string' && url.trim() !== '') {
          return url;
        }
      }
    }

    return PLACEHOLDER_IMAGE;
  };

  // Get shop name from various possible fields
  const getShopName = (): string | null => {
    if (product.shop?.name) return product.shop.name;
    if (product.shopName) return product.shopName;
    if (product.shop_name) return product.shop_name;
    return null;
  };

  const shopName = getShopName();
  const isShopVerified = product.shop?.isVerified || false;

  // Convert prices to numbers (they may come as strings from the database)
  const price = typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0);
  const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;

  const hasDiscount = salePrice && salePrice < price;
  const displayPrice = salePrice || price;
  const soldPercentage = flashSale
    ? (flashSale.soldCount / flashSale.totalStock) * 100
    : 0;

  const getBadgeText = (): string | null => {
    if (!showBadges) return null;

    // Priority order: Flash sale > Discount > New
    if (variant === 'flash-sale') return null; // Flash sale has its own indicator
    if (product.discountPercent) return `-${product.discountPercent}%`;
    // You can add logic for "NEW" or "HOT" badges based on product properties
    return null;
  };

  const badgeText = getBadgeText();

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // If custom handler provided, use it; otherwise use store
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    } else {
      await toggleWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      className={cn(
        'group relative bg-white rounded-2xl overflow-hidden',
        'transition-all duration-300',
        'hover:shadow-card',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer">
          {/* Product Image */}
          <img
            src={getProductImage()}
            alt={product.name || 'Product'}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              imageLoaded ? 'scale-100 blur-0' : 'scale-110 blur-md',
              'group-hover:scale-110'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
            }}
            loading="lazy"
          />

          {/* Loading Placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}

          {/* Badge Overlay */}
          {showBadges && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {badgeText && (
                <Badge variant="sale" className="text-xs font-bold shadow-md">
                  {badgeText}
                </Badge>
              )}
              {variant === 'flash-sale' && (
                <Badge variant="sale" className="text-xs font-bold shadow-md">
                  FLASH SALE
                </Badge>
              )}
            </div>
          )}

          {/* Flash Sale Progress Bar */}
          {variant === 'flash-sale' && flashSale && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-badge-sale">
                  {flashSale.soldCount}/{flashSale.totalStock} Sold
                </span>
                <CountdownTimer endTime={flashSale.endTime} />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-badge-sale to-orange-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${soldPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <motion.button
        className={cn(
          'absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm',
          'shadow-md transition-all duration-300',
          'hover:bg-white hover:scale-110',
          isWishlisted && 'bg-red-50',
          'z-10'
        )}
        onClick={handleWishlistClick}
        whileTap={{ scale: 0.9 }}
      >
        <Heart
          className={cn(
            'w-5 h-5 transition-colors',
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
          )}
        />
      </motion.button>

      {/* Quick Add Button - Shows on Hover */}
      {showQuickAdd && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-3 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="default"
            className="w-full bg-card-black hover:bg-card-dark text-white shadow-lg"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </motion.div>
      )}

      {/* Product Info */}
      <div className="p-4">
        {/* Shop Name */}
        {shopName && (
          <Link
            to={product.shop?.slug ? `/store/${product.shop.slug}` : `/store/${product.shopId || product.shop_id}`}
            className="flex items-center gap-1.5 mb-2 group/shop"
            onClick={(e) => e.stopPropagation()}
          >
            <Store className="w-3.5 h-3.5 text-gray-400 group-hover/shop:text-primary-lime transition-colors" />
            <span className="text-xs text-gray-500 group-hover/shop:text-primary-lime transition-colors truncate max-w-[120px]">
              {shopName}
            </span>
            {isShopVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            )}
          </Link>
        )}

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-1 font-medium">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary-lime transition-colors cursor-pointer">
            {product.name || 'Untitled Product'}
          </h3>
        </Link>

        {/* Rating & Sold Count */}
        {showRating && (
          <div className="flex items-center gap-2 mb-2 text-xs">
            {Number(product.rating) > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-700">{(Number(product.rating) || 0).toFixed(1)}</span>
                {product.reviewCount && (
                  <span className="text-gray-400">({product.reviewCount})</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <Star className="w-3.5 h-3.5" />
                <span>No reviews</span>
              </div>
            )}
            {product.soldCount && product.soldCount > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">
                  {product.soldCount >= 1000
                    ? `${(product.soldCount / 1000).toFixed(1)}K+ Sold`
                    : `${product.soldCount} Sold`}
                </span>
              </>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-badge-sale">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-sm text-text-secondary line-through">
                ${price.toFixed(2)}
              </span>
              {product.discountPercent && (
                <Badge variant="sale" className="text-[10px] px-1.5 py-0.5">
                  -{product.discountPercent}%
                </Badge>
              )}
            </>
          ) : (
            <span className="text-lg font-bold text-text-primary">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1.5 font-medium">
            Only {product.stock} left in stock
          </p>
        )}

        {/* Color Options (if available) */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-5 h-5 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-text-secondary ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;

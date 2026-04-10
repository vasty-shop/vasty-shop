import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

interface ProductListViewProps {
  product: Product;
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  isWishlisted?: boolean;
  className?: string;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  product,
  onWishlistToggle,
  onAddToCart,
  isWishlisted = false,
  className,
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice || product.price;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      className={cn(
        'group bg-white rounded-2xl overflow-hidden flex gap-4 md:gap-6 p-4',
        'transition-all duration-300 hover:shadow-card',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Image Container */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-32 md:w-48 flex-shrink-0"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-xl">
          {/* Product Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              imageLoaded ? 'scale-100 blur-0' : 'scale-110 blur-md',
              'group-hover:scale-110'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Loading Placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}

          {/* Badge Overlay */}
          {product.discountPercent && (
            <div className="absolute top-2 left-2">
              <Badge variant="sale" className="text-xs font-bold shadow-md">
                -{product.discountPercent}%
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between py-2">
        {/* Top Section */}
        <div>
          {/* Brand & Category */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-text-secondary uppercase tracking-wide">
              {product.brand}
            </p>
            <span className="text-xs text-text-secondary">•</span>
            <p className="text-xs text-text-secondary">{product.category}</p>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="text-base md:text-lg font-semibold text-text-primary mb-2 line-clamp-2 hover:text-primary-lime transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-text-secondary line-clamp-2 mb-3 hidden md:block">
              {product.description}
            </p>
          )}

          {/* Rating */}
          {Number(product.rating) > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold ml-1">
                  {(Number(product.rating) || 0).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-text-secondary">• 1K+ Sold</span>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-2 mb-3 hidden md:flex">
              <span className="text-xs text-text-secondary font-medium">Sizes:</span>
              <div className="flex gap-1">
                {product.sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="text-xs px-2 py-1 bg-gray-100 rounded text-text-primary"
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 5 && (
                  <span className="text-xs px-2 py-1 text-text-secondary">
                    +{product.sizes.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 hidden md:flex">
              <span className="text-xs text-text-secondary font-medium">Colors:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 6).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.colors.length > 6 && (
                  <span className="text-xs text-text-secondary ml-1">
                    +{product.colors.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-xl md:text-2xl font-bold text-badge-sale">
                  ${displayPrice.toFixed(2)}
                </span>
                <span className="text-sm text-text-secondary line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xl md:text-2xl font-bold text-text-primary">
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full transition-all',
                isWishlisted && 'bg-red-50 border-red-200'
              )}
              onClick={handleWishlistClick}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors',
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                )}
              />
            </Button>

            {/* Add to Cart Button */}
            <Button
              size="default"
              className="bg-card-black hover:bg-card-dark text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Add to Cart</span>
              <span className="md:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductListView;

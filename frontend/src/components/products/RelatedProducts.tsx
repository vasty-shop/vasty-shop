import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

export interface RelatedProductsProps {
  currentProduct?: Product;
  products?: Product[];
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  wishlistedProducts?: Set<string>;
  className?: string;
  variant?: 'you-might-like' | 'frequently-bought' | 'recently-viewed' | 'complete-look' | 'customers-viewed';
  showCarouselControls?: boolean;
  enableQuickAdd?: boolean;
  enableColorSelector?: boolean;
  enableSizeSelector?: boolean;
}

interface ProductCardInteractiveProps {
  product: Product;
  isWishlisted?: boolean;
  isInCart?: boolean;
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  enableQuickAdd?: boolean;
  enableColorSelector?: boolean;
  enableSizeSelector?: boolean;
  index?: number;
}

const ProductCardInteractive: React.FC<ProductCardInteractiveProps> = ({
  product,
  isWishlisted = false,
  isInCart = false,
  onWishlistToggle,
  onAddToCart,
  onQuickView,
  onProductClick,
  enableQuickAdd = true,
  enableColorSelector = false,
  enableSizeSelector = false,
  index = 0,
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(
    product.colors?.[0] || null
  );
  const [selectedSize, setSelectedSize] = React.useState<string | null>(
    product.sizes?.[0] || null
  );

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = product.salePrice || product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    setSelectedColor(color);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        'group relative bg-white rounded-2xl overflow-hidden cursor-pointer',
        'transition-all duration-300',
        'hover:shadow-lg'
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {/* Product Image */}
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            imageLoaded ? 'scale-100 blur-0' : 'scale-110 blur-md'
          )}
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.6 }}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Loading Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        {/* Badge Overlay */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="sale" className="text-xs font-bold shadow-md">
              -{discountPercent}%
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <motion.button
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm z-10',
            'shadow-md transition-all duration-300',
            isWishlisted
              ? 'bg-red-50 hover:bg-red-100'
              : 'bg-white/90 hover:bg-white'
          )}
          onClick={handleWishlistClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </motion.button>

        {/* Quick View Button - Shows on Hover */}
        <AnimatePresence>
          {isHovered && onQuickView && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md z-10"
              onClick={handleQuickView}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-5 h-5 text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Quick Add Button - Shows on Hover */}
        {enableQuickAdd && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="default"
                  className={cn(
                    'w-full shadow-lg transition-all duration-200',
                    isInCart
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-card-black hover:bg-card-dark'
                  )}
                  onClick={handleAddToCart}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      In Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-gray-900 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {Number(product.rating) > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    i < Math.floor(Number(product.rating) || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-700 ml-1">
              {(Number(product.rating) || 0).toFixed(1)}/5
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              'text-lg font-bold',
              hasDiscount ? 'text-badge-sale' : 'text-text-primary'
            )}
          >
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-text-secondary line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Selector - Quick Select on Hover */}
        {enableColorSelector && product.colors && product.colors.length > 0 && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-3"
              >
                <p className="text-xs text-text-secondary mb-2">Colors</p>
                <div className="flex items-center gap-1.5">
                  {product.colors.slice(0, 5).map((color, idx) => (
                    <motion.button
                      key={idx}
                      onClick={(e) => handleColorSelect(e, color)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        selectedColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      )}
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                  {product.colors.length > 5 && (
                    <span className="text-xs text-text-secondary ml-1">
                      +{product.colors.length - 5}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Size Selector - Quick Select on Hover */}
        {enableSizeSelector && product.sizes && product.sizes.length > 0 && (
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-text-secondary mb-2">Sizes</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {product.sizes.slice(0, 6).map((size, idx) => (
                    <motion.button
                      key={idx}
                      onClick={(e) => handleSizeSelect(e, size)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-md border transition-all',
                        selectedSize === size
                          ? 'bg-card-black text-white border-card-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

const FrequentlyBoughtTogether: React.FC<{
  mainProduct: Product;
  suggestedProducts: Product[];
  onAddBundle?: (products: Product[]) => void;
  onWishlistToggle?: (productId: string) => void;
  wishlistedProducts?: Set<string>;
}> = ({ mainProduct, suggestedProducts, onAddBundle, onWishlistToggle, wishlistedProducts }) => {
  const [selectedItems, setSelectedItems] = React.useState<Record<string, boolean>>({
    [mainProduct.id]: true,
    ...Object.fromEntries(suggestedProducts.slice(0, 2).map((p) => [p.id, true])),
  });

  const toggleItem = (productId: string, isMain: boolean) => {
    if (isMain) return; // Can't deselect main product
    setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const selectedProducts = [
    mainProduct,
    ...suggestedProducts.filter((p) => selectedItems[p.id]),
  ];

  const totalPrice = selectedProducts.reduce((sum, p) => sum + (p.salePrice || p.price), 0);
  const totalSavings = selectedProducts.reduce(
    (sum, p) => sum + (p.salePrice ? p.price - p.salePrice : 0),
    0
  );

  const handleAddBundle = () => {
    if (onAddBundle) {
      onAddBundle(selectedProducts);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-6">
        Frequently Bought Together
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Product */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border-2 border-primary-lime"
          >
            <div className="flex-shrink-0">
              <div className="w-5 h-5 rounded-md bg-primary-lime flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={mainProduct.images[0]}
                alt={mainProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary mb-1">This item</p>
              <h4 className="font-semibold text-sm text-text-primary truncate">
                {mainProduct.name}
              </h4>
              <p className="text-sm font-bold text-badge-sale mt-1">
                ${(mainProduct.salePrice || mainProduct.price).toFixed(2)}
              </p>
            </div>
          </motion.div>

          {/* Suggested Products */}
          {suggestedProducts.slice(0, 2).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              className={cn(
                'flex items-center gap-4 bg-white rounded-xl p-4 border-2 cursor-pointer transition-all',
                selectedItems[product.id]
                  ? 'border-primary-lime'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => toggleItem(product.id, false)}
            >
              <div className="flex-shrink-0">
                <button
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                    selectedItems[product.id]
                      ? 'bg-primary-lime border-primary-lime'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(product.id, false);
                  }}
                >
                  {selectedItems[product.id] && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>
              <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary mb-1">Add-on</p>
                <h4 className="font-semibold text-sm text-text-primary truncate">
                  {product.name}
                </h4>
                <p className="text-sm font-bold text-text-primary mt-1">
                  ${(product.salePrice || product.price).toFixed(2)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWishlistToggle?.(product.id);
                }}
                className="flex-shrink-0"
              >
                <Heart
                  className={cn(
                    'w-5 h-5 transition-colors',
                    wishlistedProducts?.has(product.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400 hover:text-red-500'
                  )}
                />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 sticky top-4">
            <h4 className="font-semibold text-text-primary mb-4">Bundle Summary</h4>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Total ({selectedProducts.length} items)
                </span>
                <span className="font-semibold text-text-primary">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">You save</span>
                  <span className="font-semibold text-green-600">
                    ${totalSavings.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <Button
              className="w-full bg-primary-lime hover:bg-primary-lime-dark"
              onClick={handleAddBundle}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add Bundle to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  products = [],
  onWishlistToggle,
  onAddToCart,
  onQuickView,
  onProductClick,
  wishlistedProducts = new Set(),
  className,
  variant = 'you-might-like',
  showCarouselControls = true,
  enableQuickAdd = true,
  enableColorSelector = false,
  enableSizeSelector = false,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Use products passed via props - no fallback mock data
  const displayProducts = products;

  // Check scroll position
  const checkScroll = React.useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 400;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const getSectionTitle = () => {
    switch (variant) {
      case 'you-might-like':
        return 'You might also like';
      case 'frequently-bought':
        return 'Frequently Bought Together';
      case 'recently-viewed':
        return 'Recently Viewed';
      case 'complete-look':
        return 'Complete the Look';
      case 'customers-viewed':
        return 'Customers Also Viewed';
      default:
        return 'Related Products';
    }
  };

  const getSectionDescription = () => {
    switch (variant) {
      case 'you-might-like':
        return 'Similar products you might be interested in';
      case 'frequently-bought':
        return 'Customers who bought this also bought';
      case 'recently-viewed':
        return 'Products you have recently viewed';
      case 'complete-look':
        return 'Perfect items to complete your outfit';
      case 'customers-viewed':
        return 'Other customers also looked at these products';
      default:
        return '';
    }
  };

  // Render Frequently Bought Together variant differently
  if (variant === 'frequently-bought' && currentProduct) {
    return (
      <section className={cn('w-full py-8 md:py-12', className)}>
        <div className="container mx-auto px-4 md:px-6">
          <FrequentlyBoughtTogether
            mainProduct={currentProduct}
            suggestedProducts={displayProducts}
            onAddBundle={(products) => {
              products.forEach((p) => onAddToCart?.(p));
            }}
            onWishlistToggle={onWishlistToggle}
            wishlistedProducts={wishlistedProducts}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={cn('w-full py-8 md:py-12 bg-white', className)}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2"
          >
            {getSectionTitle()}
          </motion.h2>
          {getSectionDescription() && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto"
            >
              {getSectionDescription()}
            </motion.p>
          )}
        </div>

        {/* Products Grid/Carousel */}
        <div className="relative group/carousel">
          {/* Left Navigation Arrow */}
          {showCarouselControls && (
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scroll('left')}
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                    'bg-white rounded-full p-3 shadow-lg',
                    'hover:bg-gray-50 transition-all duration-200',
                    'opacity-0 group-hover/carousel:opacity-100',
                    '-translate-x-1/2'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
              )}
            </AnimatePresence>
          )}

          {/* Right Navigation Arrow */}
          {showCarouselControls && (
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scroll('right')}
                  className={cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                    'bg-white rounded-full p-3 shadow-lg',
                    'hover:bg-gray-50 transition-all duration-200',
                    'opacity-0 group-hover/carousel:opacity-100',
                    'translate-x-1/2'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              )}
            </AnimatePresence>
          )}

          {/* Products Container */}
          <div
            ref={scrollContainerRef}
            className={cn(
              'grid gap-4 md:gap-6',
              // Desktop: 4 columns
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
              // Mobile: Horizontal scroll
              'md:overflow-visible overflow-x-auto snap-x snap-mandatory',
              'scrollbar-hide scroll-smooth'
            )}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {displayProducts.map((product, index) => (
              <div key={product.id} className="snap-start md:snap-align-none">
                <ProductCardInteractive
                  product={product}
                  isWishlisted={wishlistedProducts.has(product.id)}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={onAddToCart}
                  onQuickView={onQuickView}
                  onProductClick={onProductClick}
                  enableQuickAdd={enableQuickAdd}
                  enableColorSelector={enableColorSelector}
                  enableSizeSelector={enableSizeSelector}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Loading Skeleton (hidden by default, can be shown when loading) */}
        {displayProducts.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}
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

export default RelatedProducts;

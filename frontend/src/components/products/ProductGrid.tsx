import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

export interface ProductGridProps {
  products: Product[];
  title?: string;
  showSeeAll?: boolean;
  onSeeAllClick?: () => void;
  showFilters?: boolean;
  filters?: string[];
  defaultFilter?: string;
  onFilterChange?: (filter: string) => void;
  columns?: 2 | 3 | 4 | 5;
  variant?: 'standard' | 'flash-sale' | 'compact';
  showQuickAdd?: boolean;
  showRating?: boolean;
  showBadges?: boolean;
  onWishlistToggle?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  wishlistedProducts?: string[];
  className?: string;
  // Flash sale props for all products
  flashSaleConfig?: {
    endTime: Date;
    getSoldCount?: (productId: string) => number;
    getTotalStock?: (productId: string) => number;
  };
}

const DEFAULT_FILTERS = [
  'ALL',
  'WOMAN',
  'CHILDREN',
  'SHORTS',
  'JACKETS',
  'SHOES',
  'T-SHIRT',
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title = 'Featured Products',
  showSeeAll = true,
  onSeeAllClick,
  showFilters = false,
  filters = DEFAULT_FILTERS,
  defaultFilter = 'ALL',
  onFilterChange,
  columns = 4,
  variant = 'standard',
  showQuickAdd = true,
  showRating = true,
  showBadges = true,
  onWishlistToggle,
  onAddToCart,
  onProductClick,
  wishlistedProducts = [],
  className,
  flashSaleConfig,
}) => {
  const [activeFilter, setActiveFilter] = React.useState(defaultFilter);

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  const getGridColumns = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  return (
    <section className={cn('w-full', className)}>
      {/* Header Section */}
      <div className="mb-6">
        {/* Title and See All */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 text-text-primary font-bold">{title}</h2>
          {showSeeAll && (
            <button
              onClick={onSeeAllClick}
              className="flex items-center gap-1 text-sm font-semibold text-primary-lime hover:text-primary-lime-dark transition-colors group"
            >
              See All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {showFilters && filters.length > 0 && (
          <Tabs value={activeFilter} onValueChange={handleFilterChange}>
            <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none h-auto p-0 overflow-x-auto">
              {filters.map((filter) => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className={cn(
                    'relative px-4 py-3 text-sm font-semibold rounded-none',
                    'data-[state=active]:bg-transparent',
                    'data-[state=active]:text-text-primary',
                    'data-[state=inactive]:text-text-secondary',
                    'transition-colors duration-200',
                    'hover:text-text-primary',
                    'whitespace-nowrap'
                  )}
                >
                  {filter}
                  {activeFilter === filter && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-lime"
                      layoutId="activeFilter"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-text-secondary text-body mb-2">No products found</p>
          <p className="text-sm text-text-secondary">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          className={cn('grid gap-4 sm:gap-6', getGridColumns())}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {products.map((product) => {
            const flashSale =
              variant === 'flash-sale' && flashSaleConfig
                ? {
                    endTime: flashSaleConfig.endTime,
                    soldCount: flashSaleConfig.getSoldCount
                      ? flashSaleConfig.getSoldCount(product.id)
                      : 9,
                    totalStock: flashSaleConfig.getTotalStock
                      ? flashSaleConfig.getTotalStock(product.id)
                      : 10,
                  }
                : undefined;

            return (
              <motion.div key={product.id} variants={item}>
                <ProductCard
                  product={product}
                  variant={variant}
                  showQuickAdd={showQuickAdd}
                  showRating={showRating}
                  showBadges={showBadges}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={onAddToCart}
                  onClick={onProductClick}
                  isWishlisted={wishlistedProducts.includes(product.id)}
                  flashSale={flashSale}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
};

// Preset Grid Layouts for common use cases
export const PopularProductsGrid: React.FC<
  Omit<ProductGridProps, 'title' | 'showFilters'>
> = (props) => {
  return (
    <ProductGrid
      {...props}
      title="Popular Products"
      showFilters={false}
      columns={4}
    />
  );
};

export const FeaturedProductsGrid: React.FC<
  Omit<ProductGridProps, 'title' | 'showFilters' | 'columns'>
> = (props) => {
  return (
    <ProductGrid
      {...props}
      title="Featured Products"
      showFilters={true}
      columns={4}
    />
  );
};

export const TodaysForYouGrid: React.FC<
  Omit<ProductGridProps, 'title' | 'showFilters' | 'columns'>
> = (props) => {
  return (
    <ProductGrid
      {...props}
      title="Today's For You!"
      showFilters={false}
      columns={5}
    />
  );
};

export const FlashSaleGrid: React.FC<
  Omit<ProductGridProps, 'title' | 'variant' | 'showFilters'>
> = (props) => {
  return (
    <ProductGrid
      {...props}
      title="Flash Sale"
      variant="flash-sale"
      showFilters={false}
      columns={4}
    />
  );
};

export default ProductGrid;

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Grid3x3,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ProductListingHeaderProps {
  totalProducts: number;
  currentStart: number;
  currentEnd: number;
  sortBy: string;
  viewMode: 'grid-3' | 'grid-4' | 'list';
  activeFilters: Array<{ type: string; label: string; value: string }>;
  onSortChange: (sort: string) => void;
  onViewModeChange: (mode: 'grid-3' | 'grid-4' | 'list') => void;
  onRemoveFilter: (filterType: string, value: string) => void;
  onOpenFilters: () => void; // For mobile
}

interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const sortOptions: SortOption[] = [
  {
    value: 'featured',
    label: 'Featured',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: 'price-low-high',
    label: 'Price: Low to High',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    value: 'price-high-low',
    label: 'Price: High to Low',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    value: 'newest',
    label: 'Newest Arrivals',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: 'best-selling',
    label: 'Best Selling',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    value: 'rating',
    label: 'Customer Rating',
    icon: <Star className="w-4 h-4" />,
  },
];

export const ProductListingHeader: React.FC<ProductListingHeaderProps> = ({
  totalProducts,
  currentStart,
  currentEnd,
  sortBy,
  viewMode,
  activeFilters,
  onSortChange,
  onViewModeChange,
  onRemoveFilter,
  onOpenFilters,
}) => {
  const { t } = useTranslation();
  const currentSortOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      {/* Main Header Bar */}
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Results Count */}
          <div className="flex-shrink-0">
            <p className="text-sm text-text-secondary font-medium">
              Showing{' '}
              <span className="text-text-primary font-semibold">
                {currentStart}-{currentEnd}
              </span>{' '}
              of{' '}
              <span className="text-text-primary font-semibold">
                {totalProducts}
              </span>{' '}
              products
            </p>
          </div>

          {/* Center: Sort Dropdown */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full h-10 bg-white border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-text-secondary" />
                  <SelectValue placeholder={t('common.placeholders.sortBy')}>
                    <span className="text-sm font-medium text-text-primary">
                      {currentSortOption.label}
                    </span>
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="w-full min-w-[240px]">
                {sortOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer hover:bg-gray-50 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'text-text-secondary transition-colors',
                          sortBy === option.value && 'text-primary-lime'
                        )}
                      >
                        {option.icon}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-medium',
                          sortBy === option.value
                            ? 'text-primary-lime'
                            : 'text-text-primary'
                        )}
                      >
                        {option.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right: View Toggle + Filter Button */}
          <div className="flex items-center gap-2">
            {/* View Toggle - Desktop Only */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-button p-1">
              {/* Grid 3 Columns */}
              <motion.button
                onClick={() => onViewModeChange('grid-3')}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'hover:bg-white/80',
                  viewMode === 'grid-3'
                    ? 'bg-white shadow-sm text-primary-lime'
                    : 'text-text-secondary'
                )}
                whileTap={{ scale: 0.95 }}
                aria-label="3 column grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </motion.button>

              {/* Grid 4 Columns */}
              <motion.button
                onClick={() => onViewModeChange('grid-4')}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'hover:bg-white/80',
                  viewMode === 'grid-4'
                    ? 'bg-white shadow-sm text-primary-lime'
                    : 'text-text-secondary'
                )}
                whileTap={{ scale: 0.95 }}
                aria-label="4 column grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </motion.button>

              {/* List View */}
              <motion.button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  'hover:bg-white/80',
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-primary-lime'
                    : 'text-text-secondary'
                )}
                whileTap={{ scale: 0.95 }}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Filter Button - Mobile Only */}
            <Button
              variant="outline"
              size="default"
              onClick={onOpenFilters}
              className="lg:hidden flex items-center gap-2 h-10 px-4 border-gray-200 hover:border-gray-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {activeFilters.length > 0 && (
                <Badge
                  variant="sale"
                  className="ml-1 h-5 min-w-5 flex items-center justify-center rounded-full px-1.5"
                >
                  {activeFilters.length}
                </Badge>
              )}
            </Button>

            {/* Mobile Sort Dropdown */}
            <div className="sm:hidden">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-10 h-10 p-0 border-gray-200 hover:border-gray-300">
                  <div className="flex items-center justify-center w-full">
                    <ArrowUpDown className="w-4 h-4 text-text-secondary" />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-[280px]">
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer hover:bg-gray-50 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'text-text-secondary transition-colors',
                            sortBy === option.value && 'text-primary-lime'
                          )}
                        >
                          {option.icon}
                        </span>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            sortBy === option.value
                              ? 'text-primary-lime'
                              : 'text-text-primary'
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 lg:px-6 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Active Filters:
                </span>
                {activeFilters.map((filter, index) => (
                  <motion.div
                    key={`${filter.type}-${filter.value}-${index}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        'pl-3 pr-2 py-1.5 gap-2 border-gray-300 bg-gray-50',
                        'hover:bg-gray-100 transition-colors cursor-pointer',
                        'text-text-primary font-medium'
                      )}
                    >
                      <span className="text-xs">
                        <span className="text-text-secondary">{filter.label}:</span>{' '}
                        {filter.value}
                      </span>
                      <button
                        onClick={() => onRemoveFilter(filter.type, filter.value)}
                        className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${filter.label} filter`}
                      >
                        <X className="w-3 h-3 text-text-secondary hover:text-text-primary" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
                {activeFilters.length > 1 && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => {
                      activeFilters.forEach((filter) => {
                        onRemoveFilter(filter.type, filter.value);
                      });
                    }}
                    className="text-xs font-semibold text-badge-sale hover:text-red-600 transition-colors ml-2 underline"
                  >
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListingHeader;

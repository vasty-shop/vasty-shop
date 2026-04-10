import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid3x3, LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export type SortOption =
  | 'featured'
  | 'price-low-high'
  | 'price-high-low'
  | 'newest'
  | 'rating'
  | 'popularity'
  | 'name-a-z'
  | 'name-z-a';

export type ViewMode = 'grid-3' | 'grid-4' | 'list';

interface ProductListingHeaderProps {
  productCount: number;
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  className?: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'name-a-z', label: 'Name: A to Z' },
  { value: 'name-z-a', label: 'Name: Z to A' },
];

export const ProductListingHeader: React.FC<ProductListingHeaderProps> = ({
  productCount,
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onFilterClick,
  showFilterButton = false,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <div className={cn('bg-white rounded-2xl p-4 md:p-6', className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Product Count & Filter Button (Mobile) */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              All Products
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {productCount} {productCount === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {/* Mobile Filter Button */}
          {showFilterButton && (
            <Button
              variant="outline"
              size="default"
              onClick={onFilterClick}
              className="md:hidden flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          )}
        </div>

        {/* Right: Sort & View Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full md:w-[200px] bg-white">
              <SelectValue placeholder={t('common.placeholders.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggles */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid-3')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'grid-3'
                  ? 'bg-white text-primary-lime shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              title="Grid 3 columns"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid-4')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'grid-4'
                  ? 'bg-white text-primary-lime shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              title="Grid 4 columns"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewMode === 'list'
                  ? 'bg-white text-primary-lime shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              title="List view"
            >
              <LayoutList className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile View Mode Selector */}
          <Select value={viewMode} onValueChange={(value: ViewMode) => onViewModeChange(value)}>
            <SelectTrigger className="w-[130px] md:hidden bg-white">
              <SelectValue placeholder={t('common.placeholders.view')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid-3">Grid 3x3</SelectItem>
              <SelectItem value="grid-4">Grid 4x4</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProductListingHeader;

import * as React from 'react';
import { Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  brands: string[];
  ratings: number[];
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearAll?: () => void;
  className?: string;
  productCount?: number;
}

const AVAILABLE_CATEGORIES = [
  'Outerwear',
  'Jackets',
  'Dresses',
  'Knitwear',
  'Vests',
  'Tops',
  'Bottoms',
  'Activewear',
  'Accessories',
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const AVAILABLE_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#9CA3AF' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Yellow', hex: '#FACC15' },
];

const AVAILABLE_BRANDS = [
  'WinterElegance',
  'UrbanStyle',
  'SeasonalChic',
  'ModernClassics',
  'ActiveLife',
  'LuxeBasics',
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];

const MAX_PRICE = 2000;

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onClearAll,
  className,
  productCount,
}) => {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.brands.length > 0 ||
    filters.ratings.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < MAX_PRICE;

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const toggleRating = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter((r) => r !== rating)
      : [...filters.ratings, rating];
    onFiltersChange({ ...filters, ratings: newRatings });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  return (
    <div className={cn('bg-white rounded-2xl p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Filters</h2>
          {productCount !== undefined && (
            <p className="text-sm text-text-secondary mt-1">
              {productCount} {productCount === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-sm font-semibold text-primary-lime hover:text-primary-lime/80"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.sizes.map((size) => (
            <Badge
              key={size}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleSize(size)}
            >
              {size}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.colors.map((color) => (
            <Badge
              key={color}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleColor(color)}
            >
              {color}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.brands.map((brand) => (
            <Badge
              key={brand}
              variant="outline"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleBrand(brand)}
            >
              {brand}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Filters */}
      <Accordion type="multiple" defaultValue={['category', 'price', 'size', 'color', 'brand', 'rating']} className="space-y-4">
        {/* Category Filter */}
        <AccordionItem value="category" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {AVAILABLE_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                min={0}
                max={MAX_PRICE}
                step={10}
                value={filters.priceRange}
                onValueChange={handlePriceChange}
              />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Min:</span>
                  <span className="font-semibold text-text-primary">
                    ${filters.priceRange[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Max:</span>
                  <span className="font-semibold text-text-primary">
                    ${filters.priceRange[1]}
                  </span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size Filter */}
        <AccordionItem value="size" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Size
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all',
                    filters.sizes.includes(size)
                      ? 'border-primary-lime bg-primary-lime/10 text-primary-lime'
                      : 'border-gray-200 text-text-primary hover:border-gray-300'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="color" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Color
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-5 gap-3 pt-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={cn(
                    'relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110',
                    filters.colors.includes(color.name)
                      ? 'border-primary-lime ring-2 ring-primary-lime ring-offset-2'
                      : 'border-gray-300'
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {color.name === 'White' && (
                    <div className="absolute inset-0 border border-gray-200 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {AVAILABLE_COLORS.map((color) => (
                <div key={`label-${color.name}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color.name}`}
                    checked={filters.colors.includes(color.name)}
                    onCheckedChange={() => toggleColor(color.name)}
                  />
                  <Label
                    htmlFor={`color-${color.name}`}
                    className="text-xs font-normal cursor-pointer"
                  >
                    {color.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand" className="border-b border-gray-200">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {AVAILABLE_BRANDS.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating" className="border-none">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {RATING_OPTIONS.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.ratings.includes(rating)}
                    onCheckedChange={() => toggleRating(rating)}
                  />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-normal cursor-pointer flex-1 flex items-center gap-1"
                  >
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            'w-4 h-4',
                            index < rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-text-secondary ml-1">& Up</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterSidebar;

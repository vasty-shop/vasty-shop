import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Types
export interface FilterSidebarProps {
  selectedCategories: string[];
  selectedPriceRange: [number, number];
  selectedSizes: string[];
  selectedColors: string[];
  selectedBrands: string[];
  minRating: number;
  onCategoryChange: (categories: string[]) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onSizeChange: (sizes: string[]) => void;
  onColorChange: (colors: string[]) => void;
  onBrandChange: (brands: string[]) => void;
  onRatingChange: (rating: number) => void;
  onClearAll: () => void;
  categoryProductCounts?: Record<string, number>;
  isMobile?: boolean;
  className?: string;
}

// Constants
const CATEGORIES = [
  { id: 'mens-fashion', name: "Men's Fashion" },
  { id: 'womens-fashion', name: "Women's Fashion" },
  { id: 'electronics', name: 'Electronics' },
  { id: 'home-living', name: 'Home & Living' },
  { id: 'sports', name: 'Sports' },
  { id: 'beauty', name: 'Beauty' },
  { id: 'books', name: 'Books' },
];

const PRICE_PRESETS = [
  { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { id: '200-plus', label: '$200+', min: 200, max: 1000 },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'gray', name: 'Gray', hex: '#9CA3AF' },
  { id: 'navy', name: 'Navy', hex: '#1E3A8A' },
  { id: 'red', name: 'Red', hex: '#EF4444' },
  { id: 'pink', name: 'Pink', hex: '#EC4899' },
  { id: 'green', name: 'Green', hex: '#10B981' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6' },
  { id: 'yellow', name: 'Yellow', hex: '#F59E0B' },
  { id: 'purple', name: 'Purple', hex: '#8B5CF6' },
  { id: 'brown', name: 'Brown', hex: '#92400E' },
  { id: 'beige', name: 'Beige', hex: '#D6C9B8' },
];

const BRANDS = [
  'Nike',
  'Adidas',
  'Zara',
  'H&M',
  'Uniqlo',
  'Puma',
  'Levi\'s',
  'Gap',
  'Forever 21',
  'Mango',
  'Tommy Hilfiger',
  'Calvin Klein',
  'Under Armour',
  'New Balance',
  'Reebok',
];

const RATINGS = [
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
];

// Show size filter only for clothing categories
const CLOTHING_CATEGORIES = ['mens-fashion', 'womens-fashion'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategories,
  selectedPriceRange,
  selectedSizes,
  selectedColors,
  selectedBrands,
  minRating,
  onCategoryChange,
  onPriceRangeChange,
  onSizeChange,
  onColorChange,
  onBrandChange,
  onRatingChange,
  onClearAll,
  categoryProductCounts = {},
  isMobile = false,
  className,
}) => {
  const { t } = useTranslation();
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Check if any clothing category is selected
  const showSizeFilter = selectedCategories.some((cat) =>
    CLOTHING_CATEGORIES.includes(cat)
  ) || selectedCategories.length === 0;

  // Filter brands based on search query
  const filteredBrands = BRANDS.filter((brand) =>
    brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  // Helper functions
  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newCategories);
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onSizeChange(newSizes);
  };

  const toggleColor = (colorId: string) => {
    const newColors = selectedColors.includes(colorId)
      ? selectedColors.filter((c) => c !== colorId)
      : [...selectedColors, colorId];
    onColorChange(newColors);
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    onBrandChange(newBrands);
  };

  const handlePricePreset = (min: number, max: number) => {
    onPriceRangeChange([min, max]);
  };

  const isPricePresetSelected = (min: number, max: number) => {
    return selectedPriceRange[0] === min && selectedPriceRange[1] === max;
  };

  // Count active filters
  const activeFiltersCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0) +
    (selectedPriceRange[0] !== 0 || selectedPriceRange[1] !== 1000 ? 1 : 0);

  return (
    <div
      className={cn(
        'bg-white rounded-card shadow-card h-fit',
        isMobile ? 'w-full' : 'w-full lg:w-80',
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 font-semibold text-text-primary">Filters</h2>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-primary-lime hover:text-primary-lime-dark -mr-2"
            >
              Clear All ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <Accordion type="multiple" defaultValue={['categories', 'price', 'brands']} className="w-full">
          {/* Categories Filter */}
          <AccordionItem value="categories">
            <AccordionTrigger className="text-base font-semibold text-text-primary hover:no-underline">
              Categories
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {CATEGORIES.map((category) => {
                  const count = categoryProductCounts[category.id] || 0;
                  return (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="flex-1 text-sm font-medium text-text-primary cursor-pointer flex items-center justify-between"
                      >
                        <span>{category.name}</span>
                        {count > 0 && (
                          <span className="text-text-secondary text-xs">({count})</span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold text-text-primary hover:no-underline">
              Price Range
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Preset Price Ranges */}
                <div className="space-y-2">
                  {PRICE_PRESETS.map((preset) => (
                    <div key={preset.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`price-${preset.id}`}
                        checked={isPricePresetSelected(preset.min, preset.max)}
                        onCheckedChange={() => handlePricePreset(preset.min, preset.max)}
                      />
                      <Label
                        htmlFor={`price-${preset.id}`}
                        className="flex-1 text-sm font-medium text-text-primary cursor-pointer"
                      >
                        {preset.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Custom Range Slider */}
                <div className="pt-4">
                  <Label className="text-sm font-medium text-text-secondary mb-3 block">
                    Custom Range
                  </Label>
                  <Slider
                    min={0}
                    max={1000}
                    step={5}
                    value={selectedPriceRange}
                    onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
                    <span>${selectedPriceRange[0]}</span>
                    <span className="text-text-secondary">to</span>
                    <span>${selectedPriceRange[1]}</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Size Filter (Conditional) */}
          {showSizeFilter && (
            <AccordionItem value="size">
              <AccordionTrigger className="text-base font-semibold text-text-primary hover:no-underline">
                Size
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        'h-10 rounded-button border-2 text-sm font-medium transition-all',
                        selectedSizes.includes(size)
                          ? 'bg-primary-lime border-primary-lime text-white shadow-md'
                          : 'bg-white border-gray-300 text-text-primary hover:border-primary-lime'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Color Filter */}
          <AccordionItem value="color">
            <AccordionTrigger className="text-base font-semibold text-text-primary hover:no-underline">
              Color
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-6 gap-3 pt-2">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => toggleColor(color.id)}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-all relative',
                      selectedColors.includes(color.id)
                        ? 'border-primary-lime shadow-lg scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={color.name}
                  >
                    {selectedColors.includes(color.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full border-2',
                            color.id === 'white' || color.id === 'beige' || color.id === 'yellow'
                              ? 'border-gray-800'
                              : 'border-white'
                          )}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brand Filter */}
          <AccordionItem value="brands">
            <AccordionTrigger className="text-base font-semibold text-text-primary hover:no-underline">
              Brands
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {/* Brand Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    type="text"
                    placeholder={t('common.placeholders.searchBrands')}
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-10"
                  />
                  {brandSearchQuery && (
                    <button
                      onClick={() => setBrandSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Brand List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-3">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <Label
                          htmlFor={`brand-${brand}`}
                          className="flex-1 text-sm font-medium text-text-primary cursor-pointer"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No brands found
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating Filter */}
          <AccordionItem value="rating">
            <AccordionTrigger className="text-base font-semibold text-text-primary hover:no-underline">
              Customer Rating
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {RATINGS.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => onRatingChange(minRating === rating.value ? 0 : rating.value)}
                    className={cn(
                      'w-full flex items-center space-x-2 p-3 rounded-button border-2 transition-all',
                      minRating === rating.value
                        ? 'bg-primary-lime/10 border-primary-lime'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            'w-4 h-4',
                            index < rating.value
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-text-primary flex-1 text-left">
                      {rating.label}
                    </span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { ProductGrid } from './ProductGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/types';

/**
 * FilterSidebar Example - Desktop and Mobile Usage
 *
 * This example demonstrates:
 * 1. Desktop layout with sidebar
 * 2. Mobile layout with filter modal
 * 3. State management for all filters
 * 4. Integration with product listing
 */

// Mock product data (extended Product type with filter metadata)
interface MockProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  sizes: string[];
  rating: number;
  category: string;
  color: string;
  selectedSize?: string; // for filtering demo
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    brand: 'Nike',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    category: 'mens-fashion',
    selectedSize: 'M',
    color: 'blue',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Classic Denim Jeans',
    brand: 'Levi\'s',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'womens-fashion',
    selectedSize: 'L',
    color: 'navy',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    brand: 'Adidas',
    price: 199.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    sizes: [],
    category: 'electronics',
    color: 'black',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Running Shoes',
    brand: 'Nike',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    sizes: ['7', '8', '9', '10', '11'],
    category: 'sports',
    selectedSize: 'L',
    color: 'red',
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Cotton Summer Dress',
    brand: 'Zara',
    price: 45.99,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    sizes: ['XS', 'S', 'M', 'L'],
    category: 'womens-fashion',
    selectedSize: 'S',
    color: 'pink',
    rating: 4.4,
  },
  {
    id: '6',
    name: 'Smart Watch',
    brand: 'Uniqlo',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    sizes: [],
    category: 'electronics',
    color: 'black',
    rating: 4.6,
  },
];

export const FilterSidebarExample: React.FC = () => {
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceRange([0, 1000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setMinRating(0);
  };

  // Calculate category product counts
  const categoryProductCounts = MOCK_PRODUCTS.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert MockProduct to Product type for ProductGrid
  const convertToProduct = (mockProduct: MockProduct): Product => ({
    id: mockProduct.id,
    name: mockProduct.name,
    brand: mockProduct.brand,
    price: mockProduct.price,
    images: mockProduct.images,
    sizes: mockProduct.sizes as any,
    rating: mockProduct.rating,
    category: mockProduct.category,
  });

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Price filter
    if (product.price < selectedPriceRange[0] || product.price > selectedPriceRange[1]) {
      return false;
    }

    // Size filter
    if (selectedSizes.length > 0 && product.selectedSize && !selectedSizes.includes(product.selectedSize)) {
      return false;
    }

    // Color filter
    if (selectedColors.length > 0 && !selectedColors.includes(product.color)) {
      return false;
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }

    // Rating filter
    if (minRating > 0 && product.rating < minRating) {
      return false;
    }

    return true;
    }).map(convertToProduct);
  }, [selectedCategories, selectedPriceRange, selectedSizes, selectedColors, selectedBrands, minRating]);

  return (
    <div className="min-h-screen bg-cloud-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-text-primary mb-2">Products</h1>
          <p className="text-body text-text-secondary">
            Showing {filteredProducts.length} of {MOCK_PRODUCTS.length} products
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div className="sticky top-8 self-start">
            <FilterSidebar
              selectedCategories={selectedCategories}
              selectedPriceRange={selectedPriceRange}
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              selectedBrands={selectedBrands}
              minRating={minRating}
              onCategoryChange={setSelectedCategories}
              onPriceRangeChange={setSelectedPriceRange}
              onSizeChange={setSelectedSizes}
              onColorChange={setSelectedColors}
              onBrandChange={setSelectedBrands}
              onRatingChange={setMinRating}
              onClearAll={handleClearAll}
              categoryProductCounts={categoryProductCounts}
            />
          </div>

          {/* Product Grid */}
          <div>
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="bg-white rounded-card shadow-card p-12 text-center">
                <p className="text-h3 font-semibold text-text-primary mb-2">
                  No products found
                </p>
                <p className="text-body text-text-secondary mb-6">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={handleClearAll}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Filter Button */}
          <div className="mb-6 flex items-center justify-between">
            <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {(selectedCategories.length +
                    selectedSizes.length +
                    selectedColors.length +
                    selectedBrands.length +
                    (minRating > 0 ? 1 : 0)) > 0 && (
                    <span className="bg-primary-lime text-white text-xs rounded-full px-2 py-0.5">
                      {selectedCategories.length +
                        selectedSizes.length +
                        selectedColors.length +
                        selectedBrands.length +
                        (minRating > 0 ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-cloud-gradient p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-h2">Filters</DialogTitle>
                </DialogHeader>
                <FilterSidebar
                  selectedCategories={selectedCategories}
                  selectedPriceRange={selectedPriceRange}
                  selectedSizes={selectedSizes}
                  selectedColors={selectedColors}
                  selectedBrands={selectedBrands}
                  minRating={minRating}
                  onCategoryChange={setSelectedCategories}
                  onPriceRangeChange={setSelectedPriceRange}
                  onSizeChange={setSelectedSizes}
                  onColorChange={setSelectedColors}
                  onBrandChange={setSelectedBrands}
                  onRatingChange={setMinRating}
                  onClearAll={handleClearAll}
                  categoryProductCounts={categoryProductCounts}
                  isMobile
                  className="shadow-none"
                />
                <div className="p-6 pt-0">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setMobileFilterOpen(false)}
                  >
                    Show {filteredProducts.length} Products
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="bg-white rounded-card shadow-card p-12 text-center">
              <p className="text-h3 font-semibold text-text-primary mb-2">
                No products found
              </p>
              <p className="text-body text-text-secondary mb-6">
                Try adjusting your filters to see more results
              </p>
              <Button onClick={handleClearAll}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * USAGE EXAMPLES
 *
 * Basic usage:
 * ```tsx
 * import { FilterSidebar } from '@/components/products/FilterSidebar';
 *
 * function ProductPage() {
 *   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 *   const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000]);
 *   // ... other state
 *
 *   return (
 *     <FilterSidebar
 *       selectedCategories={selectedCategories}
 *       selectedPriceRange={selectedPriceRange}
 *       selectedSizes={selectedSizes}
 *       selectedColors={selectedColors}
 *       selectedBrands={selectedBrands}
 *       minRating={minRating}
 *       onCategoryChange={setSelectedCategories}
 *       onPriceRangeChange={setSelectedPriceRange}
 *       onSizeChange={setSelectedSizes}
 *       onColorChange={setSelectedColors}
 *       onBrandChange={setSelectedBrands}
 *       onRatingChange={setMinRating}
 *       onClearAll={() => {
 *         setSelectedCategories([]);
 *         setSelectedPriceRange([0, 1000]);
 *         // ... reset other filters
 *       }}
 *       categoryProductCounts={{
 *         'mens-fashion': 150,
 *         'womens-fashion': 200,
 *         'electronics': 80,
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * Mobile usage in a modal:
 * ```tsx
 * <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
 *   <DialogContent>
 *     <FilterSidebar
 *       {...filterProps}
 *       isMobile
 *     />
 *     <Button onClick={() => setFilterOpen(false)}>
 *       Apply Filters
 *     </Button>
 *   </DialogContent>
 * </Dialog>
 * ```
 */

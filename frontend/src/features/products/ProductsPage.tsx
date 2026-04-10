import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, PackageX, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterSidebar, FilterOptions } from './components/FilterSidebar';
import { ProductListingHeader, SortOption, ViewMode } from './components/ProductListingHeader';
import { ProductListView } from './components/ProductListView';
import { api } from '@/lib/api';
import type { Product } from '@/types';

const PRODUCTS_PER_PAGE = 24;

// Utility function to normalize color names for filtering
const normalizeColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#9CA3AF': 'Gray',
    '#92400E': 'Brown',
    '#F5F5DC': 'Beige',
    '#000080': 'Navy',
    '#DC2626': 'Red',
    '#2563EB': 'Blue',
    '#16A34A': 'Green',
    '#FACC15': 'Yellow',
    '#B45309': 'Brown',
    '#EA580C': 'Brown',
    '#4B5563': 'Gray',
  };
  return colorMap[color] || color;
};

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [filters, setFilters] = React.useState<FilterOptions>({
    categories: [],
    priceRange: [0, 2000],
    sizes: [],
    colors: [],
    brands: [],
    ratings: [],
  });

  const [sortBy, setSortBy] = React.useState<SortOption>('featured');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid-3');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [wishlistedProducts, setWishlistedProducts] = React.useState<Set<string>>(new Set());
  const isInitialMount = React.useRef(true);

  // API data
  const [products, setProducts] = React.useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = React.useState(0);

  // State for search query
  const [searchQuery, setSearchQuery] = React.useState('');

  // Initialize from URL params on mount and update when URL changes externally
  React.useEffect(() => {
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
    const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    const ratings = searchParams.get('ratings')?.split(',').map(Number).filter(Boolean) || [];
    const priceMin = Number(searchParams.get('priceMin')) || 0;
    const priceMax = Number(searchParams.get('priceMax')) || 2000;
    const sort = (searchParams.get('sort') as SortOption) || 'featured';
    const view = (searchParams.get('view') as ViewMode) || 'grid-3';
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    setFilters({
      categories,
      priceRange: [priceMin, priceMax],
      sizes,
      colors,
      brands,
      ratings,
    });
    setSortBy(sort);
    setViewMode(view);
    setCurrentPage(page);
    setSearchQuery(search);
    isInitialMount.current = false;
  }, [searchParams]);

  // Fetch products from API
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build API params
        const apiParams: any = {
          limit: PRODUCTS_PER_PAGE,
          offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
        };

        // Add search query if present
        if (searchQuery) {
          apiParams.search = searchQuery;
        }

        // Add filters
        if (filters.categories.length > 0) {
          apiParams.category = filters.categories[0]; // API may support single category
        }
        if (filters.priceRange[0] > 0) {
          apiParams.minPrice = filters.priceRange[0];
        }
        if (filters.priceRange[1] < 2000) {
          apiParams.maxPrice = filters.priceRange[1];
        }

        // Fetch from API (use searchProducts if there's a search query, otherwise getProducts)
        const response = searchQuery
          ? await api.searchProducts(searchQuery, apiParams)
          : await api.getProducts(apiParams);

        // Transform API response to match Product type
        // Shopify convention: price = selling price, compare_price = original (crossed out)
        const transformedProducts = response.data.map((product: any) => {
          const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
          const comparePrice = product.compare_price || product.comparePrice || product.compareAtPrice;
          const comparePriceVal = comparePrice ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : undefined;
          const isOnSale = comparePriceVal && comparePriceVal > priceVal;

          return {
            id: product.id,
            name: product.name,
            brand: product.brand || 'Unknown',
            price: isOnSale ? comparePriceVal : priceVal, // Original price for display
            salePrice: isOnSale ? priceVal : undefined, // Sale price only if on sale
            discountPercent: isOnSale ? Math.round((1 - priceVal / comparePriceVal) * 100) : undefined,
            rating: product.rating || 0,
            category: product.category,
            description: product.description || '',
            images: product.images || [],
            sizes: product.sizes || [],
            colors: product.colors || [],
            characteristics: product.characteristics || {},
          };
        });

        setProducts(transformedProducts);
        setTotalProducts(response.total || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters, currentPage, searchQuery]);

  // Update URL when filters/sort/view changes (but not on initial mount)
  React.useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams();

    if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
    if (filters.sizes.length > 0) params.set('sizes', filters.sizes.join(','));
    if (filters.colors.length > 0) params.set('colors', filters.colors.join(','));
    if (filters.brands.length > 0) params.set('brands', filters.brands.join(','));
    if (filters.ratings.length > 0) params.set('ratings', filters.ratings.join(','));
    if (filters.priceRange[0] > 0) params.set('priceMin', filters.priceRange[0].toString());
    if (filters.priceRange[1] < 2000) params.set('priceMax', filters.priceRange[1].toString());
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (viewMode !== 'grid-3') params.set('view', viewMode);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [filters, sortBy, viewMode, currentPage, setSearchParams]);

  // Client-side filtering for sizes, colors, brands, ratings (until API supports these)
  const filteredProducts = React.useMemo(() => {
    let filtered = [...products];

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((size) => filters.sizes.includes(size))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((color) => filters.colors.includes(normalizeColor(color)))
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Rating filter
    if (filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings);
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    return filtered;
  }, [products, filters]);

  // Sort products (client-side)
  const sortedProducts = React.useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceA - priceB;
        });
      case 'price-high-low':
        return sorted.sort((a, b) => {
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceB - priceA;
        });
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'popularity':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name-a-z':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-z-a':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'featured':
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Handlers
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 2000],
      sizes: [],
      colors: [],
      brands: [],
      ratings: [],
    });
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setIsLoading(true);
    setSortBy(sort);
    setCurrentPage(1);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishlistToggle = (productId: string) => {
    setWishlistedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = (product: Product) => {
    // Implement cart logic here
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] xl:w-[320px] flex-shrink-0">
            <div className="sticky top-6">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearAll={handleClearAllFilters}
                productCount={sortedProducts.length}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <ProductListingHeader
              productCount={sortedProducts.length}
              sortBy={sortBy}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewModeChange={handleViewModeChange}
              onFilterClick={() => setIsFilterDrawerOpen(true)}
              showFilterButton
              className="mb-6"
            />

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-lime" />
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-12 text-center"
              >
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Error Loading Products
                </h3>
                <p className="text-text-secondary mb-6">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && sortedProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-12 text-center"
              >
                <PackageX className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  No products found
                </h3>
                <p className="text-text-secondary mb-6">
                  Try adjusting your filters to see more products
                </p>
                <Button onClick={handleClearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </motion.div>
            )}

            {/* Products Grid/List */}
            {!isLoading && !error && sortedProducts.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${viewMode}-${currentPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Grid View */}
                    {(viewMode === 'grid-3' || viewMode === 'grid-4') && (
                      <div
                        className={cn(
                          'grid gap-4 md:gap-6',
                          viewMode === 'grid-3' &&
                            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                          viewMode === 'grid-4' &&
                            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                        )}
                      >
                        {sortedProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onWishlistToggle={handleWishlistToggle}
                            onAddToCart={handleAddToCart}
                            isWishlisted={wishlistedProducts.has(product.id)}
                            variant="standard"
                            className={cn(viewMode === 'grid-4' && 'text-sm')}
                          />
                        ))}
                      </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                      <div className="space-y-4">
                        {sortedProducts.map((product) => (
                          <ProductListView
                            key={product.id}
                            product={product}
                            onWishlistToggle={handleWishlistToggle}
                            onAddToCart={handleAddToCart}
                            isWishlisted={wishlistedProducts.has(product.id)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 md:p-6">
                    {/* Page Info */}
                    <p className="text-sm text-text-secondary">
                      Showing{' '}
                      <span className="font-semibold text-text-primary">
                        {totalProducts > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold text-text-primary">
                        {Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-text-primary">
                        {totalProducts}
                      </span>{' '}
                      products
                    </p>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                          page === '...' ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-2 text-text-secondary"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'ghost'}
                              size="icon"
                              onClick={() => handlePageChange(page as number)}
                              className={cn(
                                currentPage === page &&
                                  'bg-primary-lime text-white hover:bg-primary-lime/90'
                              )}
                            >
                              {page}
                            </Button>
                          )
                        )}
                      </div>

                      {/* Next Button */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Dialog open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">Filters</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearAll={handleClearAllFilters}
              productCount={sortedProducts.length}
              className="bg-transparent p-0"
            />
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClearAllFilters}
              >
                Clear All
              </Button>
              <Button
                className="flex-1 bg-primary-lime hover:bg-primary-lime/90"
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductsPage;

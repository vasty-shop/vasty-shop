import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
  ChevronDown,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { ProductCard } from '@/components/products/ProductCard';
import { getCategoryBySlug, getCategoryIcon } from '@/data/categories';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import type { Category } from '@/types/category';

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating';

interface FilterState {
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  rating?: number;
}

export const CategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = React.useState<Category | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [sortBy, setSortBy] = React.useState<SortOption>('popular');
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<FilterState>({});

  // Featured products for the "Top Picks" section
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);

  // Load category data and products
  React.useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!categorySlug) return;

      const cat = getCategoryBySlug(categorySlug);
      if (!cat) {
        navigate('/products');
        return;
      }

      setCategory(cat);

      try {
        setIsLoadingProducts(true);
        setProductsError(null);

        // Fetch products for this category
        const response = await api.getProducts({
          category: cat.name,
          limit: 50
        });

        const transformedProducts = response.data.map((product: any) => ({
          id: product.id || product._id,
          name: product.name,
          brand: product.brand || 'Unknown',
          price: product.price,
          salePrice: product.salePrice || product.sale_price,
          discountPercent: product.discountPercent || product.discount_percent,
          rating: product.rating || 0,
          category: product.category,
          description: product.description || '',
          images: product.images || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
        }));

        setAllProducts(transformedProducts);
        setFeaturedProducts(transformedProducts.slice(0, 6));
      } catch (error) {
        console.error('Error fetching category products:', error);
        setProductsError('Failed to load products. Please try again later.');
        setAllProducts([]);
        setFeaturedProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchCategoryProducts();
  }, [categorySlug, navigate]);

  // Load filters from URL params
  React.useEffect(() => {
    const subcategory = searchParams.get('subcategory');
    if (subcategory) {
      setSelectedSubcategory(subcategory);
    }
  }, [searchParams]);

  // Apply filters and sorting
  React.useEffect(() => {
    let products = [...allProducts];

    // Filter by subcategory
    if (selectedSubcategory) {
      // In real implementation, filter by subcategory
      products = products.filter(() => Math.random() > 0.2);
    }

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      products = products.filter(p => {
        const price = p.salePrice || p.price;
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice ?? Infinity;
        return price >= min && price <= max;
      });
    }

    // Filter by rating
    if (filters.rating) {
      products = products.filter(p => p.rating >= filters.rating!);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // In real app, sort by date
        products.reverse();
        break;
      default:
        // Popular - keep original order
        break;
    }

    setFilteredProducts(products);
  }, [allProducts, selectedSubcategory, filters, sortBy]);

  // Handle subcategory selection
  const handleSubcategoryClick = (subcategorySlug: string | null) => {
    setSelectedSubcategory(subcategorySlug);
    if (subcategorySlug) {
      searchParams.set('subcategory', subcategorySlug);
    } else {
      searchParams.delete('subcategory');
    }
    setSearchParams(searchParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSelectedSubcategory(null);
    searchParams.delete('subcategory');
    setSearchParams(searchParams);
  };

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-lime mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary">Loading Category...</h2>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(category.icon);
  const activeFilterCount = Object.keys(filters).filter(key =>
    filters[key as keyof FilterState] !== undefined
  ).length + (selectedSubcategory ? 1 : 0);

  return (
    <div className="min-h-screen bg-cloud-gradient pb-24">
      {/* Header */}
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <BreadcrumbNavigation
          items={[
            { label: 'Categories', href: '/products' },
            { label: category.name },
          ]}
        />
      </div>

      {/* Category Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-lime/10 via-white to-accent-blue/10 border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-lime/20 flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-primary-lime" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                  {category.name}
                </h1>
              </div>
              <p className="text-lg text-text-secondary mb-6">
                {category.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span>{filteredProducts.length} Products</span>
                {category.priceRange && (
                  <span>
                    ${category.priceRange.min} - ${category.priceRange.max}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Banner Image */}
            {category.bannerImage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="aspect-video rounded-2xl overflow-hidden shadow-card">
                  <img
                    src={category.bannerImage}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Subcategory Navigation */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
              <Button
                variant={selectedSubcategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSubcategoryClick(null)}
                className="flex-shrink-0"
              >
                All
              </Button>
              {category.subcategories.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant={selectedSubcategory === subcategory.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSubcategoryClick(subcategory.slug)}
                  className="flex-shrink-0"
                >
                  {subcategory.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && !selectedSubcategory && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-lime" />
                <h2 className="text-2xl font-bold text-text-primary">
                  Top Picks in {category.name}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  showQuickAdd={false}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Product Listing Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-text-primary">
              All Products
              {selectedSubcategory && category.subcategories && (
                <span className="text-text-secondary font-normal ml-2">
                  in {category.subcategories.find(s => s.slug === selectedSubcategory)?.name}
                </span>
              )}
            </h2>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="bg-primary-lime text-white">
                {activeFilterCount} {activeFilterCount === 1 ? 'Filter' : 'Filters'}
              </Badge>
            )}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-text-primary cursor-pointer hover:border-primary-lime transition-colors"
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2 bg-primary-lime text-white px-2 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden mb-4 flex items-center gap-2">
          <div className="flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-text-primary"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block">
            <FilterSidebar
              category={category}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Products Grid */}
          <div>
            {/* Loading State */}
            {isLoadingProducts && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary-lime" />
              </div>
            )}

            {/* Error State */}
            {!isLoadingProducts && productsError && (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Error Loading Products
                </h3>
                <p className="text-text-secondary mb-6">{productsError}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Products Display */}
            {!isLoadingProducts && !productsError && filteredProducts.length > 0 && (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                )}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      variant="standard"
                      showQuickAdd={true}
                      showRating={true}
                      showBadges={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingProducts && !productsError && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Filter className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  No products found
                </h3>
                <p className="text-text-secondary mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <MobileFiltersDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        category={category}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Filter Sidebar Component
interface FilterSidebarProps {
  category: Category;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  category,
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslation();
  const priceRange = category.priceRange || { min: 0, max: 1000 };
  const [minPrice, setMinPrice] = React.useState(filters.minPrice || priceRange.min);
  const [maxPrice, setMaxPrice] = React.useState(filters.maxPrice || priceRange.max);

  const applyPriceFilter = () => {
    onFilterChange({ ...filters, minPrice, maxPrice });
  };

  return (
    <Card className="p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range Filter */}
        {category.relevantFilters?.includes('price') && (
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-3">
              Price Range
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  placeholder={t('vendor.placeholders.min')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  placeholder={t('vendor.placeholders.max')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={applyPriceFilter}
                className="w-full"
              >
                Apply
              </Button>
            </div>
          </div>
        )}

        {/* Rating Filter */}
        <div>
          <h4 className="font-semibold text-sm text-text-primary mb-3">
            Customer Rating
          </h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => onFilterChange({ ...filters, rating })}
                  className="w-4 h-4 text-primary-lime"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="text-sm text-text-secondary ml-1">& Up</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Size Filter (only for fashion categories) */}
        {category.relevantFilters?.includes('size') && (
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-3">
              Size
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <Button
                  key={size}
                  variant={filters.sizes?.includes(size) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const sizes = filters.sizes || [];
                    const newSizes = sizes.includes(size)
                      ? sizes.filter(s => s !== size)
                      : [...sizes, size];
                    onFilterChange({ ...filters, sizes: newSizes });
                  }}
                  className="text-xs"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Mobile Filters Drawer Component
interface MobileFiltersDrawerProps extends FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileFiltersDrawer: React.FC<MobileFiltersDrawerProps> = ({
  isOpen,
  onClose,
  category,
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 overflow-y-auto lg:hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="bg-primary-lime text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Filters Content */}
            <div className="p-4">
              <FilterSidebar
                category={category}
                filters={filters}
                onFilterChange={onFilterChange}
                onClearFilters={onClearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  onClearFilters();
                  onClose();
                }}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button onClick={onClose} className="flex-1">
                View Results
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoriesPage;

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  X,
  Share2,
  Trash2,
  Check,
  Copy,
  Facebook,
  Twitter,
  Send,
  TrendingDown,
  Package,
  AlertCircle,
  Star,
  Filter,
  Loader2,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { SEO } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useDialog } from '@/hooks/useDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { BreadcrumbNavigation } from '@/components/layout/BreadcrumbNavigation';
import { Product } from '@/types';
import { api } from '@/lib/api';

// Stock status types
type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Get stock status from product data
 * Uses actual product stock information instead of random values
 */
const getStockStatus = (product: Product): StockStatus => {
  const stock = (product as any).stock ?? (product as any).quantity ?? 999;
  if (stock <= 0) return 'out-of-stock';
  if (stock <= 5) return 'low-stock';
  return 'in-stock';
};

/**
 * Check if price has dropped since product was added to wishlist
 * Compares current price with the price when added
 */
const hasPriceDrop = (product: Product, priceAtAdd: number): boolean => {
  const currentPrice = product.salePrice || product.price;
  return currentPrice < priceAtAdd;
};

/**
 * Check if user has back-in-stock notification enabled for this product
 * This would typically be stored in user preferences or a separate notification table
 */
const hasBackInStockNotification = (product: Product, backInStockProducts: Set<string>): boolean => {
  return backInStockProducts.has(product.id);
};

// Sort options
type SortOption = 'recently-added' | 'price-low-high' | 'price-high-low' | 'name';

export const WishlistPage: React.FC = () => {
  // SEO: noindex for user-specific page
  const seoElement = <SEO title="Wishlist" noIndex={true} />;

  const dialog = useDialog();
  const { isAuthenticated } = useAuth();
  const items = useWishlistStore((state) => state.items);
  const loading = useWishlistStore((state) => state.loading);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const removeMultipleItems = useWishlistStore((state) => state.removeMultipleItems);
  const syncWithBackend = useWishlistStore((state) => state.syncWithBackend);
  const addToCart = useCartStore((state) => state.addItem);

  // Fetch wishlist from backend on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // Fetch product recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      try {
        // Fetch featured products as recommendations
        const response = await api.getFeaturedProducts(4);
        const transformedProducts = response.map((product: any) => ({
          id: product.id || product._id,
          name: product.name,
          brand: product.brand || 'Unknown',
          price: product.price,
          salePrice: product.salePrice || product.sale_price,
          discountPercent: product.discountPercent || product.discount_percent,
          rating: product.rating || 0,
          category: product.category,
          images: product.images || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
        }));
        setRecommendations(transformedProducts);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, []);

  // State management
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('recently-added');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  // Track products with back-in-stock notifications enabled
  const [backInStockProducts, setBackInStockProducts] = useState<Set<string>>(new Set());

  // Filter states
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOnSale, setFilterOnSale] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Wishlist' },
  ];

  // Calculate filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Apply filters
    if (filterInStock) {
      filtered = filtered.filter(
        (item) => getStockStatus(item.product) !== 'out-of-stock'
      );
    }

    if (filterOnSale) {
      filtered = filtered.filter((item) => item.product.salePrice);
    }

    // Price range filter
    filtered = filtered.filter((item) => {
      const price = item.product.salePrice || item.product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'recently-added':
        filtered.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        break;
      case 'price-low-high':
        filtered.sort((a, b) => {
          const priceA = a.product.salePrice || a.product.price;
          const priceB = b.product.salePrice || b.product.price;
          return priceA - priceB;
        });
        break;
      case 'price-high-low':
        filtered.sort((a, b) => {
          const priceA = a.product.salePrice || a.product.price;
          const priceB = b.product.salePrice || b.product.price;
          return priceB - priceA;
        });
        break;
      case 'name':
        filtered.sort((a, b) =>
          a.product.name.localeCompare(b.product.name)
        );
        break;
    }

    return filtered;
  }, [items, sortBy, filterInStock, filterOnSale, priceRange]);

  // Select all functionality
  const allSelected =
    filteredAndSortedItems.length > 0 &&
    selectedItems.size === filteredAndSortedItems.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(filteredAndSortedItems.map((item) => item.product.id))
      );
    }
  };

  const toggleSelectItem = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  // Handle remove selected items
  const handleRemoveSelected = () => {
    removeMultipleItems(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  // Handle add all to cart
  const handleAddAllToCart = () => {
    selectedItems.forEach((productId) => {
      const item = items.find((i) => i.product.id === productId);
      if (item && getStockStatus(item.product) !== 'out-of-stock') {
        // Add first available size by default
        addToCart(item.product, item.product.sizes[0]);
      }
    });
    setSelectedItems(new Set());
  };

  // Handle clear all
  const handleClearAll = async () => {
    const confirmed = await dialog.showConfirm({
      title: 'Clear Wishlist',
      message: 'Are you sure you want to clear your entire wishlist? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      clearWishlist();
      setSelectedItems(new Set());
    }
  };

  // Handle share wishlist
  const handleShareWishlist = () => {
    // Generate shareable link (in real app, this would be a backend API call)
    const link = `${window.location.origin}/wishlist/shared/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);
    setShowShareDialog(true);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    // Add first available size by default (in real app, show size selector)
    addToCart(product, product.sizes[0]);
  };

  // Handle move to cart (add to cart and remove from wishlist)
  const handleMoveToCart = (product: Product) => {
    addToCart(product, product.sizes[0]);
    removeItem(product.id);
  };

  // Get stock status styling
  const getStockStatusStyle = (status: StockStatus) => {
    switch (status) {
      case 'in-stock':
        return 'text-green-600 bg-green-50';
      case 'low-stock':
        return 'text-orange-600 bg-orange-50';
      case 'out-of-stock':
        return 'text-red-600 bg-red-50';
    }
  };

  const getStockStatusText = (status: StockStatus) => {
    switch (status) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
    }
  };

  // Loading state
  if (loading && items.length === 0) {
    return (
      <>
        {seoElement}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-lime mx-auto mb-4" />
            <p className="text-lg text-text-secondary">Loading your wishlist...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <>
        {seoElement}
        <div className="min-h-screen bg-gray-50">
          {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <BreadcrumbNavigation items={breadcrumbItems} />
        </div>

        {/* Empty State */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center">
                <Heart className="w-20 h-20 text-gray-300" />
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Your wishlist is empty
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              Start adding items to your wishlist by clicking the heart icon on products you love!
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="px-8">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="px-8">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      {seoElement}
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <BreadcrumbNavigation items={breadcrumbItems} />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Title and Count */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                My Wishlist
              </h1>
              <p className="text-lg text-text-secondary">
                {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleShareWishlist}
                className="flex-1 md:flex-initial"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Wishlist
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="flex-1 md:flex-initial text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Multi-select Actions Bar */}
          {selectedItems.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-sm font-medium text-text-primary">
                  {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected
                </p>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    onClick={handleAddAllToCart}
                    className="flex-1 md:flex-initial"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveSelected}
                    className="flex-1 md:flex-initial text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Selected
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Controls: Sort, Filter, Select All */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Select All */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium text-text-primary">
                Select All
              </span>
            </label>

            {/* Right: Sort and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex-1 sm:flex-initial',
                  (filterInStock || filterOnSale) && 'border-primary-lime text-primary-lime'
                )}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(filterInStock || filterOnSale) && (
                  <Badge variant="sale" className="ml-2 h-5 px-1.5 text-xs">
                    Active
                  </Badge>
                )}
              </Button>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stock Filter */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={filterInStock}
                        onCheckedChange={(checked) => setFilterInStock(checked as boolean)}
                      />
                      <span className="text-sm font-medium text-text-primary">
                        In Stock Only
                      </span>
                    </label>
                  </div>

                  {/* Sale Filter */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={filterOnSale}
                        onCheckedChange={(checked) => setFilterOnSale(checked as boolean)}
                      />
                      <span className="text-sm font-medium text-text-primary">
                        On Sale
                      </span>
                    </label>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-3 block">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {(filterInStock || filterOnSale || priceRange[0] !== 0 || priceRange[1] !== 500) && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterInStock(false);
                        setFilterOnSale(false);
                        setPriceRange([0, 500]);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedItems.map((item, index) => {
              const isSelected = selectedItems.has(item.product.id);
              const stockStatus = getStockStatus(item.product);
              const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;
              const currentPrice = item.product.salePrice || item.product.price;
              const isPriceDrop = hasPriceDrop(item.product, item.priceAtAdd);
              const hasNotification = hasBackInStockNotification(item.product, backInStockProducts);

              return (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md',
                    isSelected && 'ring-2 ring-primary-lime'
                  )}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 group">
                    <Link to={`/product/${item.product.id}`}>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {hasDiscount && (
                        <Badge variant="sale" className="text-xs font-bold shadow-md">
                          -{item.product.discountPercent}%
                        </Badge>
                      )}
                      {isPriceDrop && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-xs font-bold shadow-md">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Price Drop
                        </Badge>
                      )}
                      {hasNotification && stockStatus === 'in-stock' && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-xs font-bold shadow-md">
                          <Package className="w-3 h-3 mr-1" />
                          Back in Stock
                        </Badge>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-all z-10 group/remove"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Checkbox */}
                    <div className="absolute bottom-2 left-2 z-10">
                      <div
                        className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-md cursor-pointer hover:bg-white transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectItem(item.product.id);
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectItem(item.product.id)}
                        />
                      </div>
                    </div>

                    {/* Heart Icon (clickable to remove) */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="absolute bottom-2 right-2 p-2 bg-red-50 backdrop-blur-sm rounded-full shadow-md hover:bg-red-100 transition-all group/heart"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500 group-hover/heart:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-4">
                    {/* Brand */}
                    <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                      {item.product.brand}
                    </p>

                    {/* Product Name */}
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary-lime transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {Number(item.product.rating) > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">
                          {(Number(item.product.rating) || 0).toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      {hasDiscount ? (
                        <>
                          <span className="text-base md:text-lg font-bold text-badge-sale">
                            {formatPrice(currentPrice)}
                          </span>
                          <span className="text-xs text-text-secondary line-through">
                            {formatPrice(item.product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-base md:text-lg font-bold text-text-primary">
                          {formatPrice(currentPrice)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                          getStockStatusStyle(stockStatus)
                        )}
                      >
                        {stockStatus === 'out-of-stock' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <Package className="w-3 h-3" />
                        )}
                        {getStockStatusText(stockStatus)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {stockStatus !== 'out-of-stock' ? (
                        <>
                          <Button
                            size="sm"
                            className="w-full text-xs md:text-sm"
                            onClick={() => handleAddToCart(item.product)}
                          >
                            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                            Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs md:text-sm"
                            onClick={() => handleMoveToCart(item.product)}
                          >
                            Move to Cart
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full text-xs md:text-sm" disabled>
                          <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                          Out of Stock
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No results after filtering */}
        {filteredAndSortedItems.length === 0 && items.length > 0 && (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No items match your filters
            </h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your filters to see more items
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilterInStock(false);
                setFilterOnSale(false);
                setPriceRange([0, 500]);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Recommendations Section */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                You Might Also Like
              </h2>
              <Link
                to="/products"
                className="text-sm font-medium text-primary-lime hover:text-primary-lime-dark transition-colors"
              >
                View All
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-3 md:p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {recommendations.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <Link to={`/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.discountPercent && (
                          <Badge variant="sale" className="absolute top-2 left-2 text-xs font-bold">
                            -{product.discountPercent}%
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <div className="p-3 md:p-4">
                      <p className="text-xs text-text-secondary uppercase mb-1">
                        {product.brand}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-sm text-text-primary mb-2 line-clamp-2 hover:text-primary-lime transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {Number(product.rating) > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold">
                            {(Number(product.rating) || 0).toFixed(1)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        {product.salePrice ? (
                          <>
                            <span className="text-base font-bold text-badge-sale">
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-xs text-text-secondary line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-text-primary">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-text-secondary">No recommendations available at the moment.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Wishlist</DialogTitle>
            <DialogDescription>
              Share your wishlist with friends and family
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Copy Link */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <Button onClick={handleCopyLink} variant="outline" size="sm">
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Social Media Sharing */}
            <div>
              <label className="text-sm font-medium text-text-primary mb-3 block">
                Share on Social Media
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=Check out my wishlist!`, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1A94DA] transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm font-medium">Twitter</span>
                </button>
              </div>
            </div>

            {/* Email Wishlist */}
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = `mailto:?subject=Check out my Vasty wishlist&body=${encodeURIComponent(shareLink)}`;
                }}
              >
                <Send className="w-4 h-4 mr-2" />
                Email to Friend
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
      </div>
    </>
  );
};

export default WishlistPage;
